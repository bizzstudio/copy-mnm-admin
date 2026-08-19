// src/pages/SalesChannels.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import PlatformCard from "@/components/platform/PlatformCard";
import IntegrationCard from "@/components/platform/IntegrationCard";
import { isActivePlatform } from "@/components/platform/platformState";
import useIntegrations from "@/hooks/useIntegrations";
import ReportServices from "@/services/ReportServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

/**
 * פלטפורמות מכירה — מאיפה מגיעות ההזמנות.
 *
 * ── שני סוגי ערוץ, כרטיס אחד ───────────────────────────────────────────────
 * ערוץ פנימי — החנות, הקופה, הסוכנים, הבק-אופיס — הוא חלק מהמערכת ואין לו
 * פרטי חיבור; הוא דלוק או כבוי לפי המודול שהלקוח קנה. פלטפורמה חיצונית היא
 * מערכת של מישהו אחר, ויש לה טוקן. שניהם מרונדרים מ-`PlatformCard`, אותה
 * מעטפת שמציירת גם חברת משלוח וגם ספק הנהלת חשבונות.
 *
 * ── רק החיצוניות הפעילות ───────────────────────────────────────────────────
 * פלטפורמה חיצונית מופיעה כאן רק כשהיא באמת עובדת — מתג דלוק וכל שדות החובה
 * מלאים. מה שעדיין מחכה להגדרה יושב תחת "ניהול מערכת ← אינטגרציות ←
 * פלטפורמות", ועובר לכאן ברגע שמפעילים אותו. הכרטיס שעובר הוא הכרטיס המלא,
 * כולל הטופס, כדי שלא יהיו שני מסכים שעורכים את אותו טוקן.
 *
 * הערוצים הפנימיים לא נעים לשום מקום: אין להם מה להגדיר, ולכן אין להם מה
 * לחכות לו.
 */
const SalesChannels = () => {
  const { t, i18n } = useTranslation();
  const isHe = i18n.language !== "en";
  const { showDateTimeFormat, getNumber } = useUtilsFunction();

  const [channels, setChannels] = useState(null);
  const [error, setError] = useState(null);

  /**
   * שתי קריאות, ובכוונה. `/admin/channels` יודע כמה הזמנות נכנסו מכל מקור אבל
   * לא יודע דבר על אישורים — הוא לא חושף אותם ולא צריך; `/admin/integrations`
   * יודע מה מוגדר ומה חסר אבל לא סופר הזמנות. הן מתחברות על `source === key`.
   */
  const {
    items: integrations,
    error: integrationsError,
    reload,
  } = useIntegrations("sales-channel");

  useEffect(() => {
    let alive = true;
    ReportServices.getSalesChannels()
      .then((data) => alive && setChannels(data?.channels ?? []))
      .catch((err) => alive && setError(err?.displayMessage || err?.message));
    return () => {
      alive = false;
    };
  }, []);

  if (channels === null || integrations === null) {
    return (
      <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
        <PageTitle>{t("SalesChannels")}</PageTitle>
        <TableLoading row={6} col={4} width={163} height={20} />
      </div>
    );
  }

  const statsBySource = new Map(channels.map((c) => [c.source, c]));
  const internal = channels.filter((c) => c.kind === "internal");
  const activeExternal = integrations.filter(isActivePlatform);

  /** מוני ההזמנות — אותו בלוק לערוץ פנימי ולפלטפורמה חיצונית. */
  const stats = (stat) => (
    <>
      <dl className="flex gap-6 text-sm">
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">{t("OrdersFromChannel")}</dt>
          <dd className="font-semibold dark:text-gray-200">{getNumber(stat?.orderCount ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">{t("LastOrder")}</dt>
          <dd className="font-semibold dark:text-gray-200">
            {stat?.lastOrderAt ? showDateTimeFormat(stat.lastOrderAt) : "—"}
          </dd>
        </div>
      </dl>

      {stat?.orderCount > 0 && (
        <Link
          to={`/orders?source=${stat.source}`}
          className="mt-3 mb-4 inline-flex items-center gap-1 text-sm text-mainColor hover:underline"
        >
          {t("ViewChannelOrders")}
          <FiArrowLeft />
        </Link>
      )}
    </>
  );

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("SalesChannels")}</PageTitle>

      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {t("SalesChannelsDescription")}
      </p>

      {(error || integrationsError) && (
        <p className="mb-4 text-center text-red-500">{error || integrationsError}</p>
      )}

      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-700 dark:text-gray-200">
          {t("InternalChannels")}
        </h2>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t("InternalChannelsHint")}</p>

        {internal.map((channel) => (
          <PlatformCard
            key={channel.source}
            name={channel.nameHe}
            description={channel.descriptionHe}
            state={channel.state}
          >
            {stats(channel)}
          </PlatformCard>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-700 dark:text-gray-200">
          {t("ExternalChannels")}
        </h2>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t("ExternalChannelsHint")}</p>

        {activeExternal.length === 0 ? (
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {t("NoActivePlatformIntegrations")}
          </p>
        ) : (
          activeExternal.map((integration) => (
            <IntegrationCard
              key={integration.key}
              integration={integration}
              isHe={isHe}
              onSaved={reload}
            >
              {stats(statsBySource.get(integration.key))}
            </IntegrationCard>
          ))
        )}

        {/**
         * הקישור אינו קישוט: פלטפורמה שעדיין לא הוגדרה פשוט אינה כאן, ובלי
         * אמירה מפורשת המסך נראה כאילו WooCommerce לא קיים במערכת בכלל.
         */}
        <Link
          to="/integrations/sales-channel"
          className="inline-flex items-center gap-1 text-sm text-mainColor hover:underline"
        >
          {t("ManagePlatformIntegrations")}
          <FiArrowLeft />
        </Link>
      </section>
    </div>
  );
};

export default SalesChannels;
