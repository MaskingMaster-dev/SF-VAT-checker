import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateVAT } from './routes/api.vat.validate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors({
  origin: '*', // In production, restrict to Shopify domains
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// VAT validation endpoint
app.post('/api/vat/validate', validateVAT);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    valid: false
  });
});

// Export for Vercel serverless
export default app;

// Start server for local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`VAT Checker API running on ${APP_URL}`);
  });
}

