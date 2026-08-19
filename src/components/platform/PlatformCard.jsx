// src/components/platform/PlatformCard.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

import { PLATFORM_STATE_LABEL, PLATFORM_STATE_TONE } from "@/components/platform/platformState";

/**
 * כרטיס של פלטפורמה חיצונית — המעטפת, בלי מה שיושב בתוכה.
 *
 * ── שלושה מסכים, כרטיס אחד ─────────────────────────────────────────────────
 * ערוץ מכירה, חברת משלוח וספק הנהלת חשבונות הם אותו דבר מבחינת המשתמש: מערכת
 * שאנחנו מדברים איתה. עד כה כל מסך צייר את הכרטיס שלו — למסך פלטפורמות המכירה
 * היו תוויות מצב משלו בשלושה גוונים, ולמסך האינטגרציות שלושה אחרים לאותם
 * מצבים ממש. שתי מקלדות, אותה שאלה, שתי תשובות שנראות שונה.
 *
 * המעטפת מחזיקה את מה שמשותף — שם, תווית מצב, תיאור, הודעות — ומקבלת ב-
 * `children` את מה שמשתנה: מוני הזמנות בערוץ מכירה, טופס פרטי חיבור באינטגרציה,
 * ולפעמים שניהם באותו כרטיס.
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string} [props.description]
 * @param {'active'|'configuredOff'|'needsSetup'|'comingSoon'} [props.state] תווית המצב
 * @param {React.ReactNode} [props.headerAside] פינת הכותרת — מתג ההפעלה, למשל
 * @param {React.ReactNode} [props.notices] הודעות מעל הגוף
 * @param {React.ReactNode} [props.children]
 * @param {React.ReactNode} [props.footer]
 * @param {(e: React.FormEvent) => void} [props.onSubmit] הופך את גוף הכרטיס לטופס
 */
const PlatformCard = ({
  name,
  description,
  state,
  headerAside,
  notices,
  children,
  footer,
  onSubmit,
}) => {
  const { t } = useTranslation();

  /**
   * הטופס עוטף את כל הגוף ולא רק את השדות, כי מתג ההפעלה יושב בפינת הכותרת
   * וכפתור השמירה מתחת לשדות. שניהם חייבים להיות אותו טופס: מתג שנשאר מחוצה לו
   * לא נשלח בשמירה, וזו תקלה שנראית כמו "השינוי לא נשמר" בלי שום שגיאה.
   */
  const Body = onSubmit ? "form" : React.Fragment;
  const bodyProps = onSubmit ? { onSubmit } : {};

  return (
    <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
      <CardBody>
        <Body {...bodyProps}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                  {name}
                </h3>
                {state && (
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${PLATFORM_STATE_TONE[state]}`}
                  >
                    {t(PLATFORM_STATE_LABEL[state])}
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
              )}
            </div>

            {headerAside}
          </div>

          {notices}
          {children}
          {footer}
        </Body>
      </CardBody>
    </Card>
  );
};

export default PlatformCard;
