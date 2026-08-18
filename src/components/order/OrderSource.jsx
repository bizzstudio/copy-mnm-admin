// src/components/order/OrderSource.jsx
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * מאיפה ההזמנה הגיעה — התג שמחליף שלושה מסכים נפרדים.
 *
 * המפתחות הם ערכי `Order.source` בשרת. מקור שאינו מוכר (אדפטר של פלטפורמת מכירה
 * שנוסף אחרי הבנייה הזו) מוצג בשמו הגולמי ובאפור, ולא נבלע ל"אחר" — שם לא מוכר
 * בטבלה הוא סימן שצריך להוסיף כאן שורה, ואילו "אחר" נראה כמו קטגוריה אמיתית.
 */
export const SOURCE_META = {
  store: { labelKey: "SourceStore", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  admin: { labelKey: "SourceAdmin", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  agent: { labelKey: "SourceAgent", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  cashier: { labelKey: "SourceCashier", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
};

const FALLBACK = "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";

const OrderSource = ({ source }) => {
  const { t } = useTranslation();
  const meta = SOURCE_META[source];

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
        meta ? meta.className : FALLBACK
      }`}
    >
      {meta ? t(meta.labelKey) : source || "—"}
    </span>
  );
};

export default OrderSource;
