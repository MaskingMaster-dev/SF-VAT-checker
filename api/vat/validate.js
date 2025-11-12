import { validateVAT } from '../../web/routes/api.vat.validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await validateVAT(req, res, () => {});
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Internal server error',
      valid: false
    });
  }
}

