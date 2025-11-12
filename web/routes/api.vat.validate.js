import soap from 'soap';

const VIES_WSDL = 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService.wsdl';

// Simple in-memory cache (24h TTL)
// In production, use Redis or similar
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

/**
 * Validates a VAT number via VIES SOAP API
 * @param {string} vat - VAT number (e.g., "NL123456789B01")
 * @param {string} expectedCountry - Expected country code (e.g., "NL")
 * @returns {Promise<Object>} Validation result
 */
async function validateVATNumber(vat, expectedCountry) {
  // Clean VAT number
  const cleanVAT = vat.replace(/\s+/g, '').toUpperCase();
  
  // Extract country code from VAT number
  const vatCountry = cleanVAT.substring(0, 2);
  const vatNumber = cleanVAT.substring(2);
  
  // Check cache first
  const cacheKey = getCacheKey(cleanVAT);
  const cached = cache.get(cacheKey);
  if (isCacheValid(cached)) {
    console.log(`Cache hit for ${cleanVAT}`);
    return cached.data;
  }
  
  try {
    // Create SOAP client
    const client = await soap.createClientAsync(VIES_WSDL);
    
    // Call VIES service
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
    
    // Cache the result
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    return response;
  } catch (error) {
    console.error('VIES API error:', error);
    
    // If VIES is down, check cache for stale data
    if (cached) {
      console.log(`Using stale cache for ${cleanVAT}`);
      return {
        ...cached.data,
        cached: true,
        error: 'VIES temporarily unavailable, using cached result'
      };
    }
    
    // Return error response
    return {
      valid: false,
      error: error.message || 'VIES service unavailable',
      vatNumber: cleanVAT,
      countryCode: vatCountry
    };
  }
}

/**
 * Express route handler for VAT validation
 */
export async function validateVAT(req, res, next) {
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
    next(error);
  }
}

