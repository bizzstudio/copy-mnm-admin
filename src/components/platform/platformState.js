// src/components/platform/platformState.js
/**
 * המצב של פלטפורמה חיצונית — התשובה היחידה במערכת לשאלה הזו.
 *
 * ── למה זה קובץ ולא פונקציה בתוך מסך ──────────────────────────────────────
 * אותה שאלה נשאלת בשלושה מקומות: מסך האינטגרציות מחליט מה להציג, מסך חברות
 * המשלוח ומסך פלטפורמות המכירה מחליטים מה כבר "שלהם". שלוש תשובות עצמאיות
 * לאותה שאלה נפרדות זו מזו ברגע שמישהו מתקן אחת מהן — והתסמין הוא פלטפורמה
 * שנעלמת משני המסכים גם יחד, או מופיעה בשניהם.
 *
 * ── הסף ─────────────────────────────────────────────────────────────────────
 * פלטפורמה "פעילה" היא כזו שהמתג שלה דלוק וגם כל שדות החובה שלה מלאים. מתג
 * דלוק בלי טוקן אינו עובד בפועל, ולכן הוא עדיין "מחכה להגדרה" — הצגתו כפעילה
 * הייתה מבטיחה חיבור שאין.
 */

/** `apiToken` → `hasApiToken`, שם השדה שהשרת מחזיר בו בוליאן במקום את הערך. */
const storedFlag = (key) => `has${key.charAt(0).toUpperCase()}${key.slice(1)}`;

/**
 * האם כל שדות החובה של האינטגרציה מלאים.
 *
 * נקרא מ-`integration.credentials`, שמכיל בוליאנים ו-4 ספרות אחרונות בלבד —
 * הערך עצמו לא חוזר מהשרת לעולם. אינטגרציה בלי שדות חובה (OAuth, למשל) עונה
 * true, וזה נכון: אין מה למלא בה.
 *
 * @param {object} integration
 * @returns {boolean}
 */
export function hasAllRequiredCredentials(integration) {
  return (integration?.credentialFields || [])
    .filter((f) => f.required)
    .every((f) => integration?.credentials?.[storedFlag(f.key)] === true);
}

/**
 * ארבעה מצבים. שלושת האחרונים כולם "עדיין לא פעילה", והם נפרדים כי הם דורשים
 * פעולה שונה מהמשתמש: להשלים פרטים, להדליק מתג, או לחכות לנו.
 *
 *   comingSoon     בקטלוג, אין עדיין אדפטר בקוד — שום הגדרה לא תפעיל אותה
 *   active         מתג דלוק + כל שדות החובה מלאים
 *   configuredOff  הפרטים מלאים, המתג כבוי
 *   needsSetup     חסרים פרטי חיבור
 *
 * @param {object} integration
 * @returns {'comingSoon'|'active'|'configuredOff'|'needsSetup'}
 */
export function platformState(integration) {
  if (integration?.isImplemented === false) return "comingSoon";
  if (!hasAllRequiredCredentials(integration)) return "needsSetup";
  return integration?.isEnabled ? "active" : "configuredOff";
}

/**
 * הסף שקובע היכן הכרטיס יושב: פעילה → הטאב הפונקציונלי שלה, כל השאר → מסך
 * האינטגרציות. פונקציה ולא השוואה מפוזרת, כדי ששני צדי החלוקה יזוזו יחד.
 *
 * @param {object} integration
 * @returns {boolean}
 */
export function isActivePlatform(integration) {
  return platformState(integration) === "active";
}

/**
 * מפתח התרגום של התווית, לפי המצב.
 *
 * `available` אינו אחד מארבעת המצבים של `platformState` — הוא של ערוץ פנימי
 * (חנות, קופה, סוכנים), שאין לו פרטי חיבור ולכן גם לא "חסרים פרטי חיבור". הוא
 * יושב באותה טבלה כדי שכל התוויות במערכת ייראו אותו דבר.
 */
export const PLATFORM_STATE_LABEL = Object.freeze({
  active: "IntegrationActive",
  configuredOff: "IntegrationConfiguredButOff",
  needsSetup: "IntegrationMissingCredentials",
  comingSoon: "IntegrationComingSoon",
  available: "ChannelAvailable",
});

/** גוון התווית, לפי המצב. */
export const PLATFORM_STATE_TONE = Object.freeze({
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  configuredOff: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  needsSetup: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  comingSoon: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  available: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
});

/** המצבים שמשמעותם "עדיין לא פעילה" — מה שמסך האינטגרציות מציג. */
export const PENDING_STATES = Object.freeze(["needsSetup", "configuredOff", "comingSoon"]);

/** המצב שמשמעותו "עובדת" — מה שהמסך התפעולי מציג. */
export const ACTIVE_STATES = Object.freeze(["active"]);

/**
 * קבוצות האינטגרציה כפי שהמשתמש רואה אותן, ולא כפי שהקטלוג מסדר אותן.
 *
 * המפתח הוא הפרמטר בכתובת (`/integrations/:group`), והוא גם הפריט בסרגל תחת
 * "ניהול מערכת ← אינטגרציות".
 *
 *   categories  אילו קטגוריות בקטלוג נכנסות לקבוצה. `finance` ו-`payment` הן
 *               שתיים אצלנו כי הן שני סוגי אדפטר, אבל למי שמנהל עסק שתיהן
 *               "הנהלת חשבונות" — ריווחית מוציאה את החשבונית, קארדקום גובה.
 *               פיצול המסך לפי החלוקה הפנימית שלנו היה נותן לשיטת התיוק שלנו
 *               לקבוע את התפריט של הלקוח.
 *
 *   home        המסך התפעולי שאליו עוברת פלטפורמה כשהיא נדלקת ומוגדרת. `null`
 *               פירושו שאין לאן — הכרטיס נשאר כאן בכל מצב, וזה נכון לכסף: אין
 *               תחת "הנהלת חשבונות" מסך כרטיסים, יש שם מסמכים.
 */
export const INTEGRATION_GROUPS = Object.freeze({
  finance: {
    categories: "finance,payment",
    titleKey: "AccountingIntegrations",
    descriptionKey: "AccountingIntegrationsDescription",
    home: null,
  },
  shipping: {
    categories: "shipping",
    titleKey: "CourierIntegrations",
    descriptionKey: "CourierIntegrationsDescription",
    home: "/shipping",
  },
  "sales-channel": {
    categories: "sales-channel",
    titleKey: "PlatformIntegrations",
    descriptionKey: "PlatformIntegrationsDescription",
    home: "/channels",
  },
});
