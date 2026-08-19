import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

import IntegrationCard from "@/components/platform/IntegrationCard";
import { platformState } from "@/components/platform/platformState";
import TableLoading from "@/components/preloader/TableLoading";
import useIntegrations from "@/hooks/useIntegrations";

/**
 * רשימת כרטיסי האינטגרציה של קטגוריה, מסוננת לפי מצב.
 *
 * ── הרכיב הצטמצם, ובכוונה ──────────────────────────────────────────────────
 * הכרטיס עצמו עבר ל-`components/platform/IntegrationCard`, שיושב מעל אותה
 * מעטפת שמציירת גם ערוץ מכירה וגם חברת משלוח. מה שנשאר כאן הוא ההחלטה מה
 * להציג — וזה כל תפקידו: אותה קטגוריה נשאלת משני מסכים עם `states` שונה.
 *
 * ── חלוקת העבודה בין המסכים ────────────────────────────────────────────────
 * פלטפורמה פעילה — מתג דלוק וכל שדות החובה מלאים — יושבת במסך התפעולי שלה:
 * חברת משלוח תחת "חברות משלוח", ערוץ מכירה תחת "פלטפורמות מכירה". מה שעדיין
 * לא מוגדר יושב תחת "ניהול מערכת ← אינטגרציות". הסף עצמו הוא
 * `platformState`, ושני צדי החלוקה קוראים ממנו כדי שפלטפורמה לא תיעלם משניהם.
 *
 * קטגוריה שאין לה מסך תפעולי — הנהלת חשבונות, תשלומים — לא מסננת כלום: אין
 * לכרטיס לאן לעבור, והוא נשאר במקום שבו הוא נערך.
 *
 * @param {object} props
 * @param {string} props.category קטגוריה, או כמה מופרדות בפסיק
 * @param {string[]} [props.states] אילו מצבים להציג. ברירת מחדל: הכול
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {string} [props.emptyLabel] מה לומר כשאין מה להציג
 */
const IntegrationSettings = ({ category, states, title, description, emptyLabel }) => {
  const { t, i18n } = useTranslation();
  const isHe = i18n.language !== "en";

  const { items, error, reload } = useIntegrations(category);

  if (items === null) return <TableLoading />;

  const shown = states ? items.filter((i) => states.includes(platformState(i))) : items;

  return (
    <div>
      {title && (
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">{title}</h2>
      )}
      {description && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {error && (
        <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardBody>
        </Card>
      )}

      {shown.length === 0 && !error && (
        <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {emptyLabel || t("NoIntegrationsInCategory")}
            </p>
          </CardBody>
        </Card>
      )}

      {shown.map((integration) => (
        <IntegrationCard
          key={integration.key}
          integration={integration}
          isHe={isHe}
          onSaved={reload}
        />
      ))}
    </div>
  );
};

export default IntegrationSettings;
