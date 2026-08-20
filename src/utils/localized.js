// src/utils/localized.js
import Cookies from "js-cookie";

/**
 * ONE readable string out of a display name that may be bilingual, may be a
 * plain string, and may be missing.
 *
 * Most display names in this system are `{ he, en }` — `Product.title`,
 * `Category.name`, `Offer.name`, `PriceList.name`. `PriceList.name` is the one
 * that keeps catching people out, because its schema is `Object` (Mixed)
 * precisely so the plain strings written by the seeds and by the older callers
 * keep working: the SAME field arrives as a string from one tenant and as
 * `{ he: "מחירון רגיל" }` from the next.
 *
 * Rendering that object straight into JSX is not a cosmetic mistake. React
 * throws
 *
 *     Objects are not valid as a React child (found: object with keys {he})
 *
 * which is an UNCAUGHT error during reconciliation, so it takes the whole screen
 * down — the products page, the customer card and the add-customer form all went
 * blank on the demo tenant for exactly this reason, and the console said only
 * "Minified React error #31".
 *
 * `showingTranslateValue` in `useUtilsFunction` used to be the only helper for
 * this and it did not survive a plain string: `Object.keys("מחירון")` is
 * `["0","1",…]`, which contains no `"he"`, so it fell through to `data.en` and
 * returned `undefined` — a silently EMPTY cell rather than a crash. It now
 * delegates here, so both shapes render the same way everywhere.
 *
 * @param {unknown} value  `{ he, en }`, a plain string, or nothing at all
 * @param {string} [lang]  defaults to the interface language (`i18next` cookie)
 * @returns {string} never an object, never `undefined` — safe as a React child
 */
export function localizedText(value, lang) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return String(value);

  const raw = lang || Cookies.get("i18next") || "he";
  const code = raw === "he-IL" ? "he" : raw;

  /**
   * Falls back to the OTHER language rather than to an empty string. A name
   * entered in Hebrew only is the normal case here, and blanking it for an
   * English session loses the only label the row has.
   */
  return value[code] ?? value.he ?? value.en ?? "";
}

export default localizedText;
