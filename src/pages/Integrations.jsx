// src/pages/Integrations.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import IntegrationSettings from "@/components/integration/IntegrationSettings";
import { INTEGRATION_GROUPS, PENDING_STATES } from "@/components/platform/platformState";

/**
 * אינטגרציות של קבוצה אחת — הנהלת חשבונות, שליחויות או פלטפורמות מכירה.
 *
 * ── מסך אחד, שלוש כתובות ───────────────────────────────────────────────────
 * שלושת הפריטים תחת "ניהול מערכת ← אינטגרציות" מצביעים כולם לכאן ונבדלים רק
 * בפרמטר. מסך נפרד לכל קבוצה היה שלושה עותקים של אותו קוד שנפרדים זה מזה
 * בתיקון הראשון שנעשה רק באחד מהם.
 *
 * ── מה מוצג כאן ומה כבר לא ─────────────────────────────────────────────────
 * רק מה שעדיין לא פעיל. פלטפורמה שהמתג שלה דלוק וכל שדות החובה שלה מלאים עברה
 * למסך התפעולי שלה, והכרטיס עבר איתה — כולל הטופס. כך יש לכל פלטפורמה מקום
 * אחד בכל רגע נתון, ולא שני מסכים שעורכים את אותו טוקן.
 *
 * לקבוצה בלי מסך תפעולי (`home: null`) אין לאן להעביר, ולכן היא מציגה את הכול.
 */
const Integrations = () => {
  const { t } = useTranslation();
  const { group } = useParams();

  const config = INTEGRATION_GROUPS[group];

  if (!config) {
    return (
      <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
        <PageTitle>{t("Integrations")}</PageTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("IntegrationGroupUnknown")}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t(config.titleKey)}</PageTitle>

      <IntegrationSettings
        category={config.categories}
        states={config.home ? PENDING_STATES : undefined}
        description={t(config.descriptionKey)}
        emptyLabel={config.home ? t("AllPlatformsActive") : t("NoIntegrationsInCategory")}
      />

      {/**
       * הקישור למסך התפעולי אינו קישוט: מי שהרגע הדליק פלטפורמה רואה אותה נעלמת
       * מהרשימה, וזה נראה כמו שגיאה עד שאומרים לו לאן היא הלכה.
       */}
      {config.home && (
        <Link
          to={config.home}
          className="mb-8 inline-flex items-center gap-1 self-start text-sm text-mainColor hover:underline"
        >
          {t("ViewActivePlatforms")}
          <FiArrowLeft />
        </Link>
      )}
    </div>
  );
};

export default Integrations;
