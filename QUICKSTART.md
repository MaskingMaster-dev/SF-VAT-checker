# Quick Start Guide

Get your VAT Checker app running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be 20+
shopify version  # Should be 3.x
```

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings (defaults work for local dev).

## Step 3: Initialize Shopify App (First Time Only)

```bash
shopify app init
```

Follow the prompts to:
- Create a new app or connect to existing
- Select your development store
- Configure app name and scopes

## Step 4: Start Development

```bash
shopify app dev
```

This will:
- ✅ Start the backend server
- ✅ Create an ngrok tunnel
- ✅ Watch for file changes
- ✅ Open Shopify admin for installation

## Step 5: Install App in Store

1. Click "Install" in the Shopify admin
2. Navigate to your dev store's checkout
3. You should see the "VAT number (EU)" field

## Step 6: Test

Try entering a VAT number:
- Valid: `NL123456789B01` (use a real VAT number from your test company)
- Invalid: `NL000000000B00`

## Troubleshooting

### "Network request failed"
- Ensure backend is running (`shopify app dev` handles this)
- Check ngrok tunnel is active
- Verify `API_URL` in `extensions/vat-checker-ui/src/index.tsx` matches the tunnel URL

### "VIES service unavailable"
- VIES may be temporarily down
- App will use cached results if available
- Check https://ec.europa.eu/taxation_customs/vies/ for status

### Extension not showing
- Ensure you're on a Shopify Plus store
- Check extension is deployed: `shopify app deploy`
- Verify extension is enabled in checkout settings

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [API_EXAMPLES.md](./API_EXAMPLES.md) for API response examples
- Configure production deployment settings

