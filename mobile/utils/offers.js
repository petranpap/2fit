export function formatDiscount(offer, t) {
  // discount_value comes back as a decimal string (e.g. "20.00") from
  // Laravel's decimal cast — drop trailing zeros for display.
  const value = Number(offer.discount_value);

  return offer.discount_type === 'percentage'
    ? t('offers.discountPercentage', { value })
    : t('offers.discountFixed', { value });
}
