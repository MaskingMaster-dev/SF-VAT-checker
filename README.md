# VAT Checker - Shopify Plus App

A complete Shopify Plus app that validates EU VAT numbers during checkout using the official **VIES (VAT Information Exchange System)** webservice from the European Commission.

## 🎯 Features

- ✅ Real-time VAT validation via VIES SOAP API
- ✅ Checkout UI Extension with React/TypeScript
- ✅ Checkout Validation Function for server-side validation
- ✅ Automatic cart attribute storage for audit trail
- ✅ 24-hour caching for VIES responses (handles downtime gracefully)
- ✅ Blocks checkout if invalid VAT number is provided
- ✅ Shows company name and address from VIES response

## 📋 Prerequisites

- Node.js 20+ installed
- Shopify CLI v3 installed: `npm install -g @shopify/cli @shopify/theme`
- A Shopify Plus store (for checkout extensions)
- A Shopify Partner account and app

## 🚀 Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd "VIES Checker app"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=3000
   APP_URL=http://localhost:3000
   API_URL=https://localhost:3000
   ```

4. **Initialize Shopify app (if not already done):**
   ```bash
   shopify app init
   ```

## 🛠️ Development

### Start the development server:

```bash
shopify app dev
```

This command will:
- Start the Express backend server
- Create a tunnel (via ngrok) for local development
- Watch for changes in extensions
- Open the Shopify admin for app installation

### Manual backend start (optional):

If you need to run the backend separately:

```bash
cd web
npm install
npm run dev
```

The API will be available at `http://localhost:3000`

## 📁 Project Structure

```
vat-checker/
├── web/                          # Backend Express server
│   ├── server.js                 # Main Express app
│   ├── routes/
│   │   └── api.vat.validate.js  # VIES validation endpoint
│   └── package.json
├── extensions/
│   ├── vat-checker-ui/           # Checkout UI Extension
│   │   ├── shopify.extension.toml
│   │   ├── src/
│   │   │   └── index.tsx        # React component
│   │   └── package.json
│   └── vat-validation/           # Checkout Validation Function
│       ├── shopify.function.extension.toml
│       └── index.js              # Validation logic
├── README.md
├── .env.example
└── package.json
```

## 🔌 API Endpoints

### `POST /api/vat/validate`

Validates a VAT number via VIES.

**Request:**
```json
{
  "vat": "NL123456789B01",
  "expectedCountry": "NL"
}
```

**Response (valid):**
```json
{
  "valid": true,
  "name": "Masking Master BV",
  "address": "Amsterdam, Netherlands",
  "requestDate": "2025-01-12",
  "countryMismatch": false,
  "vatNumber": "NL123456789B01",
  "countryCode": "NL"
}
```

**Response (invalid):**
```json
{
  "valid": false,
  "vatNumber": "NL123456789B01",
  "countryCode": "NL"
}
```

**Response (VIES down, cached):**
```json
{
  "valid": true,
  "name": "Masking Master BV",
  "cached": true,
  "error": "VIES temporarily unavailable, using cached result"
}
```

## 🎨 UI Extension Behavior

The Checkout UI Extension displays a VAT number input field that:

1. **Validates on blur or after 500ms debounce**
2. **Shows real-time feedback:**
   - ✅ "Valid VAT: {company name}" (green)
   - ❌ "Invalid VAT number or mismatch" (red)
   - ⏳ "Validating..." (while checking)
3. **Stores results in cart attributes:**
   - `vat_number`: The entered VAT number
   - `vat_status`: "valid" | "invalid"
   - `vat_name`: Company name from VIES
   - `vat_checked_at`: ISO timestamp

4. **Blocks checkout** if an invalid VAT number is provided

## 🔒 Validation Function

The Checkout Validation Function runs server-side before checkout completion:

- Reads `vat_status` from cart attributes
- Blocks checkout if `vat_status !== "valid"` and VAT number is present
- Optionally checks VAT country code matches billing country

## 🧪 Testing

### Test with valid VAT numbers:

- **Netherlands:** `NL123456789B01` (test number - may not be valid)
- **Germany:** `DE123456789`
- **France:** `FR12345678901`

**Note:** Use real VAT numbers from your test companies. The VIES service validates against real EU tax databases.

### Test API directly:

```bash
curl -X POST http://localhost:3000/api/vat/validate \
  -H "Content-Type: application/json" \
  -d '{"vat": "NL123456789B01"}'
```

## 🚢 Deployment

1. **Deploy to Shopify:**
   ```bash
   shopify app deploy
   ```

2. **Update environment variables** in your hosting platform (Heroku, Railway, etc.):
   - `PORT`
   - `APP_URL` (your production URL)
   - `API_URL` (for UI Extension - must be HTTPS)

3. **Update API URL in UI Extension:**
   Edit `extensions/vat-checker-ui/src/index.tsx` and update the `API_URL` constant:
   ```typescript
   const API_URL = 'https://your-production-domain.com';
   ```

4. **Update network allowlist** in `extensions/vat-checker-ui/shopify.extension.toml`:
   ```toml
   network_access_allowlist = ["https://your-production-domain.com"]
   ```

## 🔧 Configuration

### Backend (`web/server.js`)

- Port: Set via `PORT` env variable (default: 3000)
- CORS: Currently allows all origins (restrict in production)

### UI Extension (`extensions/vat-checker-ui/`)

- API URL: Set via `API_URL` env variable or hardcode in production
- Network access: Configured in `shopify.extension.toml`

### Validation Function (`extensions/vat-validation/`)

- API version: `2025-01` (update as needed)
- Logic: Blocks checkout if invalid VAT

## 📊 Caching

The backend implements a simple in-memory cache with 24-hour TTL:

- **Cache key:** `vat:{vatNumber}`
- **TTL:** 24 hours
- **Fallback:** If VIES is down, uses stale cache if available

**Production recommendation:** Replace with Redis for distributed caching.

## 🔗 Optional: n8n Integration

To store validation proof for each order:

1. Set up a webhook in n8n that listens for order events
2. On order creation, call `/api/vat/validate` with the stored VAT number
3. Store the response in S3/Google Drive
4. Add as a metafield to the order: `vat_validation_proof`

Example webhook payload:
```json
{
  "order_id": "gid://shopify/Order/123",
  "vat_number": "NL123456789B01",
  "vat_status": "valid"
}
```

## 🐛 Troubleshooting

### "Network request failed" in UI Extension

- Ensure the backend is running
- Check `API_URL` is correct and accessible
- Verify network allowlist in `shopify.extension.toml`
- In local dev, ensure ngrok tunnel is active

### "VIES service unavailable"

- VIES may be down (check https://ec.europa.eu/taxation_customs/vies/)
- The app will use cached results if available
- Check backend logs for SOAP errors

### Checkout not blocking

- Verify Validation Function is deployed
- Check cart attributes are being set correctly
- Review Shopify function logs in admin

## 📝 License

MIT

## 🤝 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for Shopify Plus merchants**

