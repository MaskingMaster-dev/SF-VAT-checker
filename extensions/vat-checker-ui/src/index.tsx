import {
  reactExtension,
  TextField,
  useBuyerJourneyIntercept,
  useApplyCartAttributesChange,
  BlockStack,
  Text,
  InlineStack,
  Icon,
} from '@shopify/ui-extensions-react/checkout';
import { useState, useEffect, useCallback } from 'react';

// API URL - update this to match your backend URL
// In local development, this will be the ngrok URL provided by Shopify CLI
// In production, set this to your production backend URL
// The network_access_allowlist in shopify.extension.toml must include this URL
const API_URL = 'https://localhost:3000';

export default reactExtension('purchase.checkout.block.render', () => <VATChecker />);

interface VATValidationResult {
  valid: boolean;
  name?: string;
  address?: string;
  requestDate?: string;
  countryMismatch?: boolean;
  error?: string;
  cached?: boolean;
}

function VATChecker() {
  const [vatNumber, setVatNumber] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<VATValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyCartAttributesChange = useApplyCartAttributesChange();

  // Update cart attributes
  const updateCartAttributes = useCallback(async (
    vat: string, 
    status: string, 
    name: string, 
    checkedAt: string
  ) => {
    try {
      await applyCartAttributesChange({
        attributes: [
          { key: 'vat_number', value: vat },
          { key: 'vat_status', value: status },
          { key: 'vat_name', value: name },
          { key: 'vat_checked_at', value: checkedAt },
        ],
      });
    } catch (err) {
      console.error('Failed to update cart attributes:', err);
    }
  }, [applyCartAttributesChange]);

  // Validate VAT number via API
  const validateVAT = useCallback(async (vat: string) => {
    if (!vat || vat.trim().length < 3) {
      setValidationResult(null);
      setError(null);
      // Clear attributes if VAT is removed
      if (vat.trim().length === 0) {
        await updateCartAttributes('', '', '', '');
      }
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/vat/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vat: vat.trim(),
          expectedCountry: null, // Could be derived from billing address
        }),
      });

      if (!response.ok) {
        throw new Error('Validation request failed');
      }

      const result: VATValidationResult = await response.json();
      setValidationResult(result);

      // Update cart attributes
      await updateCartAttributes(
        vat.trim(),
        result.valid ? 'valid' : 'invalid',
        result.name || '',
        new Date().toISOString()
      );

      if (result.error && !result.cached) {
        setError('VIES service temporarily unavailable. Please try again.');
      } else if (!result.valid) {
        setError('Invalid VAT number or mismatch');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('VAT validation error:', err);
      setError('Unable to validate VAT number. Please try again.');
      setValidationResult({ valid: false });
      await updateCartAttributes(vat.trim(), 'invalid', '', new Date().toISOString());
    } finally {
      setIsValidating(false);
    }
  }, [updateCartAttributes]);

  // Handle VAT input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (vatNumber) {
        validateVAT(vatNumber);
      } else {
        setValidationResult(null);
        setError(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [vatNumber, validateVAT]);

  // Block checkout if VAT is invalid
  useBuyerJourneyIntercept(
    useCallback(({ canBlockProgress }) => {
      // Only block if VAT number was entered and validation failed
      if (vatNumber && vatNumber.trim().length > 0 && validationResult && !validationResult.valid) {
        return {
          behavior: 'block',
          reason: 'Invalid VAT number. Please enter a valid EU VAT number or remove it.',
          perform: () => {
            // This will block the checkout
          },
        };
      }
      return {
        behavior: 'allow',
      };
    }, [vatNumber, validationResult])
  );

  return (
    <BlockStack spacing="base">
      <TextField
        label="VAT number (EU)"
        value={vatNumber}
        onChange={(value) => setVatNumber(value)}
        onBlur={() => {
          if (vatNumber) {
            validateVAT(vatNumber);
          }
        }}
        placeholder="e.g., NL123456789B01"
        disabled={isValidating}
      />

      {isValidating && (
        <Text size="small" appearance="subdued">
          Validating...
        </Text>
      )}

      {validationResult && validationResult.valid && !isValidating && (
        <InlineStack spacing="tight">
          <Icon source="checkmark" />
          <Text size="small" appearance="success">
            Valid VAT: {validationResult.name || 'Validated'}
          </Text>
        </InlineStack>
      )}

      {error && !isValidating && (
        <Text size="small" appearance="critical">
          {error}
        </Text>
      )}

      {validationResult?.cached && (
        <Text size="small" appearance="subdued">
          (Using cached validation result)
        </Text>
      )}
    </BlockStack>
  );
}

