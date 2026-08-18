import React from "react";
import { useTranslation } from "react-i18next";

import PageTitle from "@/components/Typography/PageTitle";
import IntegrationSettings from "@/components/integration/IntegrationSettings";

/**
 * הגדרות פלטפורמת הנהלת החשבונות — הטוקן וכל מה שנלווה לו.
 *
 * ── למה זה כאן ולא במסכי הפלטפורמה ─────────────────────────────────────────
 * `/platform/modules` מנהל את הקטלוג: אילו ספקים קיימים ואילו שדות כל אחד דורש.
 * זו החלטה של bizzstudio. הטוקן עצמו הוא נתון שרק הלקוח יודע, ולכן הוא נערך
 * במסך של הלקוח — באותו טאב שבו הוא כבר מסתכל על המסמכים שהטוקן הזה מפיק.
 *
 * ── קטגוריה ולא רשימת מפתחות ───────────────────────────────────────────────
 * המסך מבקש `category=finance` ולא "ריווחית". ספק הנהלת חשבונות נוסף יופיע כאן
 * מעצם השורה שלו בקטלוג, בלי לגעת בקובץ הזה. `exclusiveGroup: 'accounting'`
 * מבטיח שהדלקת השני תכבה את הראשון — שני ספקי חשבוניות פעילים בו-זמנית זו
 * הסכנה האמיתית, וזה נאכף בשרת.
 */
const AccountingSettings = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("AccountingSettings")}</PageTitle>

      <IntegrationSettings
        category="finance"
        description={t("AccountingSettingsDescription")}
      />
    </div>
  );
};

export default AccountingSettings;
