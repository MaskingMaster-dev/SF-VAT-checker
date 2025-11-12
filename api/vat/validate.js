import soap from 'soap';

const VIES_WSDL = 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService.wsdl';

// Simple in-memory cache (24h TTL)
const cache = new Map();

function getCacheKey(vat) {
  return `vat:${vat}`;
}

function isCacheValid(entry) {
  if (!entry) return false;
  const now = Date.now();
  const ttl = 24 * 60 * 60 * 1000; // 24 hours
  return (now - entry.timestamp) < ttl;
}

async function validateVATNumber(vat, expectedCountry) {
  const cleanVAT = vat.replace(/\s+/g, '').toUpperCase();
  const vatCountry = cleanVAT.substring(0, 2);
  const vatNumber = cleanVAT.substring(2);
  
  const cacheKey = getCacheKey(cleanVAT);
  const cached = cache.get(cacheKey);
  if (isCacheValid(cached)) {
    return cached.data;
  }
  
  try {
    const client = await soap.createClientAsync(VIES_WSDL);
    const [result] = await client.checkVatAsync({
      countryCode: vatCountry,
      vatNumber: vatNumber
    });
    
    const response = {
      valid: result.valid === true,
      name: result.name || '',
      address: result.address || '',
      requestDate: result.requestDate || new Date().toISOString().split('T')[0],
      countryMismatch: expectedCountry && vatCountry !== expectedCountry.toUpperCase(),
      vatNumber: cleanVAT,
      countryCode: vatCountry
    };
    
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    return response;
  } catch (error) {
    console.error('VIES API error:', error);
    
    if (cached) {
      return {
        ...cached.data,
        cached: true,
        error: 'VIES temporarily unavailable, using cached result'
      };
    }
    
    return {
      valid: false,
      error: error.message || 'VIES service unavailable',
      vatNumber: cleanVAT,
      countryCode: vatCountry
    };
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { vat, expectedCountry } = req.body;
    
    if (!vat) {
      return res.status(400).json({
        valid: false,
        error: 'VAT number is required'
      });
    }
    
    const result = await validateVATNumber(vat, expectedCountry);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      valid: false
    });
  }
}
