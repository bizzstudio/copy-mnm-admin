/** @param {unknown} vatRateInput e.g. 18 for 18%, or 0.18 as fraction */
export function normalizeVatRateFraction(vatRateInput) {
  if (vatRateInput == null || vatRateInput === "") return 0.18;
  const n = Number(vatRateInput);
  if (!Number.isFinite(n) || n < 0) return 0.18;
  if (n === 0) return 0;
  return n > 0 && n < 1 ? n : n / 100;
}

export function getOrderCartLineTotalIncl(item) {
  if (item?.finalPriceAtPurchase?.total != null) {
    return Number(item.finalPriceAtPurchase.total) || 0;
  }
  const q = Number(item.quantity) || 0;
  const p = Number(item.price) || 0;
  return p * q;
}

export function lineAmountsFromInclusive(lineTotalIncl, vatRateInput) {
  const rate = normalizeVatRateFraction(vatRateInput);
  const incl = Number(lineTotalIncl) || 0;
  if (rate <= 0) return { beforeVat: incl, vat: 0, incl };
  const beforeVat = incl / (1 + rate);
  const vat = incl - beforeVat;
  return { beforeVat, vat, incl };
}

/**
 * פירוט מע״מ לשורת עגלה: עדיפות לשדות מהשרת אם קיימים, אחרת חלוקה מסכום כולל מע״מ.
 */
export function getOrderLineVatBreakdown(item, vatRateInput) {
  const fp = item?.finalPriceAtPurchase;
  if (
    fp &&
    fp.totalBeforeVat != null &&
    fp.vatAmount != null &&
    fp.total != null
  ) {
    return {
      beforeVat: Number(fp.totalBeforeVat) || 0,
      vat: Number(fp.vatAmount) || 0,
      incl: Number(fp.total) || 0,
    };
  }
  const incl = getOrderCartLineTotalIncl(item);
  return lineAmountsFromInclusive(incl, vatRateInput);
}
