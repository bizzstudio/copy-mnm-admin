import requests from "./httpService";

/**
 * פרטי החיבור של הלקוח לשירותים חיצוניים — טוקן של ריווחית, טוקן של צ׳יטה.
 *
 * ── מה חוזר ומה לא ─────────────────────────────────────────────────────────
 * לעולם לא הסוד עצמו. השרת מחזיר `credentials: { hasApiToken: true,
 * apiTokenLast4: "4821" }` — מספיק כדי לזהות איזה מפתח שמור, וחסר ערך לכל מי
 * שאינו יודע אותו ממילא. לכן שדה סוד בטופס נטען תמיד ריק, וזו התנהגות מכוונת
 * ולא באג.
 *
 * ── ולכן: ריק פירושו "אל תיגע" ─────────────────────────────────────────────
 * `updateIntegration` מוחקת מהגוף כל שדה סוד שנשאר ריק. בלי זה כל שמירה של
 * הטופס — למשל שינוי שם החברה בלבד — הייתה שולחת מחרוזת ריקה ומוחקת את הטוקן
 * שהמשתמש לא נגע בו. השרת מיישר קו עם אותה סמנטיקה (`''` הוא no-op ו-`null`
 * הוא מחיקה מפורשת), אבל עדיף לא לשלוח בכלל מאשר להסתמך על כך.
 *
 * ── הנתיבים כתובים במלואם ──────────────────────────────────────────────────
 * `tests/contracts/routeCoverage.test.js` קורא רק ליטרלים; נתיב שנבנה ממשתנה
 * יוצא בשקט מהכיסוי. ראו את ההערה המקבילה ב-`SupplyServices`.
 */
const IntegrationServices = {
  /**
   * @param {{category?: string}} [opts] `finance` לטאב הנהלת החשבונות, `shipping` למשלוחים
   *
   * ה-query נבנה מחוץ למחרוזת ולא בתוכה. `routeCoverage.test.js` קורא את הליטרל
   * הראשון שאחרי `requests.get(` — תבנית מקוננת מסוג
   * `` `/admin/integrations${cond ? `?x=${y}` : ""}` `` נחתכת אצלו באמצע ויוצאת
   * בשקט מהכיסוי. זה בדיוק מה שקרה כאן: ה-endpoint לא היה קיים בשרת שרץ,
   * המסך החזיר "הנתיב לא נמצא", והבדיקה שנכתבה כדי לתפוס בדיוק את זה נשארה
   * ירוקה. הנתיב חייב להישאר ליטרל שלם.
   */
  getIntegrations: async ({ category } = {}) =>
    requests.get(
      "/admin/integrations" + (category ? `?category=${encodeURIComponent(category)}` : "")
    ),

  getIntegration: async (key) => requests.get(`/admin/integrations/${key}`),

  /**
   * @param {string} key
   * @param {{isEnabled?: boolean, mode?: string, credentials?: object, operationPassword?: string}} body
   */
  updateIntegration: async (key, body) =>
    requests.patch(`/admin/integrations/${key}`, body),
};

/**
 * מנקה מהטופס שדות סוד שנשארו ריקים, ומחזיר `null` עבור אלה שהמשתמש ביקש למחוק
 * במפורש. זהו הצד הלקוח של החוזה בן שלושת המצבים שהשרת מיישם ב-`mergeCredentials`.
 *
 * @param {Record<string,string>} values ערכי הטופס
 * @param {Array<{key: string, sensitive: boolean}>} fields
 * @param {Set<string>} [cleared] מפתחות שסומנו למחיקה
 * @returns {Record<string, string|null>} רק מה שבאמת צריך להישלח
 */
export function buildCredentialsPatch(values, fields, cleared = new Set()) {
  const patch = {};
  for (const field of fields || []) {
    if (cleared.has(field.key)) {
      patch[field.key] = null; // מחיקה מפורשת — המצב היחיד שמוחק
      continue;
    }
    const value = values?.[field.key];
    if (value === undefined || value === null) continue;
    if (String(value).trim() === "") continue; // ריק = לא נגעו בו
    patch[field.key] = String(value);
  }
  return patch;
}

export default IntegrationServices;
