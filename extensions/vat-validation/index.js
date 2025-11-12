/**
 * Checkout Validation Function
 * Validates VAT number from cart attributes before checkout completion
 */

export default function run(input) {
  const { cart } = input;
  const errors = [];

  // Get VAT-related attributes from cart
  const vatNumber = cart.attributes?.find(attr => attr.key === 'vat_number')?.value;
  const vatStatus = cart.attributes?.find(attr => attr.key === 'vat_status')?.value;

  // If a VAT number was provided, it must be valid
  if (vatNumber && vatNumber.trim().length > 0) {
    if (vatStatus !== 'valid') {
      errors.push({
        message: 'Invalid VAT number per VIES validation. Please enter a valid EU VAT number or remove it.',
        target: '$cart',
      });
    } else {
      // Optional: Check VAT prefix matches billing country
      const billingCountry = cart.buyerIdentity?.purchasingCompany?.location?.countryCode;
      if (billingCountry) {
        const vatCountry = vatNumber.substring(0, 2).toUpperCase();
        const billingCountryUpper = billingCountry.toUpperCase();
        
        if (vatCountry !== billingCountryUpper) {
          // This is a warning, not an error (cross-border VAT is valid)
          // But we could make it an error if needed
          console.log(`VAT country (${vatCountry}) differs from billing country (${billingCountryUpper})`);
        }
      }
    }
  }

  return {
    errors,
  };
}

