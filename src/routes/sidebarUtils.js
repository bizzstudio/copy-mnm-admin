// src/routes/sidebarUtils.js
/**
 * הכללים שקובעים מה נכנס לסיידבר — במקום אחד, כי הם חלים על שלוש רמות.
 *
 * הסינון רקורסיבי בכוונה: משלוחים יושב תחת הזמנות, ואם "אזורי חלוקה" ו"חברות
 * משלוח" שניהם מסוננים אז הקבוצה "משלוחים" היא כותרת שנפתחת לכלום. עדיף להעלים
 * אותה מאשר להשאיר תפריט ריק שנראה כמו תקלה.
 */

/**
 * כתובות האפליקציות החיצוניות מסביבת הבנייה.
 *
 * שרידי הפריסה של לקוח יחיד: הן קבועות לכל הבניין, ולכן במערכת רב-לקוחית הן
 * נכונות רק במקרה. משמשות כנפילה לאחור בלבד — `apps[key].url` מ-bootstrap הוא
 * הדומיין האמיתי של הלקוח שמולו אנחנו יושבים.
 */
export const OUTSIDE_DOMAINS = {
  store: import.meta.env.VITE_APP_STORE_DOMAIN,
  likutApp: import.meta.env.VITE_APP_LIKUTAPP_DOMAIN,
  agentsApp: import.meta.env.VITE_APP_AGENTSAPP_DOMAIN,
};

/** `outside` בסיידבר → מפתח המודול שהאפליקציה נפרסת תחתיו. */
const OUTSIDE_TO_MODULE = {
  store: "store",
  likutApp: "picking",
  agentsApp: "agents",
};

/**
 * הכתובת שאליה קישור חיצוני באמת מצביע.
 *
 * @param {{outside?: string, path?: string}} item
 * @param {object} apps - `apps` מ-bootstrap
 * @returns {string|null} null כשאין כתובת — הקורא מוריד את הפריט במקום לרנדר לינק מת
 */
export function resolveOutsideHref(item, apps = {}) {
  if (!item?.outside) return null;
  const moduleKey = OUTSIDE_TO_MODULE[item.outside];
  return apps?.[moduleKey]?.url || OUTSIDE_DOMAINS[item.outside] || item.path || null;
}

/**
 * מסנן את עץ הניווט לפי מי מחובר ומה דלוק אצלו.
 *
 * @param {Array} items
 * @param {{isPlatformUser: boolean, isModuleEnabled: (key?: string) => boolean, apps?: object}} ctx
 * @returns {Array} עץ חדש — הקלט לא משתנה
 */
export function filterSidebar(items = [], ctx) {
  const { isPlatformUser, isModuleEnabled, apps = {} } = ctx;

  return items
    .map((item) => {
      if (item.platformOnly && !isPlatformUser) return null;
      if (!isModuleEnabled(item.moduleKey)) return null;

      // קישור לאפליקציה שלא נפרסה אצל הלקוח הזה — אין לאן להצביע
      if (item.outside && !resolveOutsideHref(item, apps)) return null;

      if (!item.routes) return item;

      const routes = filterSidebar(item.routes, ctx);
      if (routes.length === 0) return null;
      return { ...item, routes };
    })
    .filter(Boolean);
}
