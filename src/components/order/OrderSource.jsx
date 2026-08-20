// src/components/order/OrderSource.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { orderSourceLabel } from "@bizzexpo/shared";

/**
 * מאיפה ההזמנה הגיעה — התג שהחליף שלושה מסכים נפרדים.
 *
 * הרשימה עצמה חיה ב-`@bizzexpo/shared`. מה שנשאר כאן הוא הצבע בלבד, כי הוא הדבר
 * היחיד בערוץ שהוא החלטה של המסך ולא של המערכת — לשרת אין דעה על גוון, ולרישום
 * המשותף אין מה לדעת על מחלקות Tailwind.
 *
 * מקור בלי צבע — פלטפורמה שסופר-אדמין הוסיף בזמן ריצה — מוצג באפור ובשמו, ולא
 * נבלע ל"אחר": שם לא מוכר בטבלה הוא סימן שצריך להוסיף כאן שורה, ואילו "אחר"
 * נראה כמו קטגוריה אמיתית ומאחד שני ערוצים שאין ביניהם קשר.
 */
const SOURCE_CLASS = {
  store: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  agent: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  cashier: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  machsaneiChashmal: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  woocommerce: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  shopify: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  pos: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
};

const FALLBACK = "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";

/**
 * מפתח התרגום נגזר מהמקור ולא נשמר בטבלה שנייה — `store` → `SourceStore`.
 *
 * טבלה כזו הייתה הרשימה החמישית של אותם ערכים, וההשמטה שלה שקטה: מקור בלי שורה
 * בה היה מקבל את המפתח הגולמי כתווית.
 */
const labelKeyFor = (source) => `Source${source.charAt(0).toUpperCase()}${source.slice(1)}`;

/**
 * התווית לערוץ אחד: קובץ התרגום קודם, והשם מהרישום המשותף כברירת מחדל.
 *
 * הסדר הזה הוא מה שמאפשר להוסיף ערוץ בלי לגעת בשני קבצי התרגום — הוא יוצג בשמו
 * הנכון בשתי השפות מרגע שיש לו שורה ברישום — ובכל זאת משאיר לתרגום את הזכות
 * לגבור, למשל כשלקוח קורא לקופה בשם אחר.
 */
export const useOrderSourceLabel = () => {
  const { t, i18n } = useTranslation();
  return (source) =>
    source
      ? t(labelKeyFor(source), { defaultValue: orderSourceLabel(source, i18n.language) })
      : "—";
};

const OrderSource = ({ source }) => {
  const label = useOrderSourceLabel();

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
        SOURCE_CLASS[source] || FALLBACK
      }`}
    >
      {label(source)}
    </span>
  );
};

export default OrderSource;
