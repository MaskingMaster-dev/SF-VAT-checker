# API Response Examples

## Valid VAT Number

**Request:**
```bash
POST /api/vat/validate
Content-Type: application/json

{
  "vat": "NL123456789B01",
  "expectedCountry": "NL"
}
```

**Response:**
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

## Invalid VAT Number

**Request:**
```bash
POST /api/vat/validate
Content-Type: application/json

{
  "vat": "NL000000000B00"
}
```

**Response:**
```json
{
  "valid": false,
  "vatNumber": "NL000000000B00",
  "countryCode": "NL"
}
```

## VIES Service Down (with cached result)

**Request:**
```bash
POST /api/vat/validate
Content-Type: application/json

{
  "vat": "NL123456789B01"
}
```

**Response:**
```json
{
  "valid": true,
  "name": "Masking Master BV",
  "address": "Amsterdam, Netherlands",
  "requestDate": "2025-01-11",
  "cached": true,
  "error": "VIES temporarily unavailable, using cached result",
  "vatNumber": "NL123456789B01",
  "countryCode": "NL"
}
```

## VIES Service Down (no cache)

**Request:**
```bash
POST /api/vat/validate
Content-Type: application/json

{
  "vat": "DE999999999"
}
```

**Response:**
```json
{
  "valid": false,
  "error": "VIES service unavailable",
  "vatNumber": "DE999999999",
  "countryCode": "DE"
}
```

## Missing VAT Number

**Request:**
```bash
POST /api/vat/validate
Content-Type: application/json

{}
```

**Response:**
```json
{
  "valid": false,
  "error": "VAT number is required"
}
```

## Country Mismatch

**Request:**
```bash
POST /api/vat/validate
Content-Type: application/json

{
  "vat": "DE123456789",
  "expectedCountry": "NL"
}
```

**Response:**
```json
{
  "valid": true,
  "name": "German Company GmbH",
  "address": "Berlin, Germany",
  "requestDate": "2025-01-12",
  "countryMismatch": true,
  "vatNumber": "DE123456789",
  "countryCode": "DE"
}
```

