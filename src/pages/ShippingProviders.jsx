// src/pages/ShippingProviders.jsx
import React from "react";
import { useTranslation } from "react-i18next";

import ResourcePage from "@/components/resource/ResourcePage";
import IntegrationSettings from "@/components/integration/IntegrationSettings";
import SupplyServices from "@/services/SupplyServices";

/**
 * חברות משלוח.
 *
 * המערכת ידעה עד היום רק "משלוח או איסוף עצמי", ומי שנוסע זה הרכב של הלקוח.
 * מרגע שמשלוח יוצא לחברה חיצונית צריך לדעת לאיזו, מה מספר המעקב וכמה זה עלה.
 *
 * ⚠ המסך מגדיר את החברה ואת אופן החיבור אליה, ולא מושך משלוחים בפועל — אין עדיין
 * אדפטר לאף אחת מהן. `isConnected` נשאר "לא מחובר" בכוונה, כדי שלא ייווצר פער בין
 * מה שנראה למה שעובד.
 *
 * ── שני חצאים, ובכוונה ─────────────────────────────────────────────────────
 * הטבלה היא הבחירה התפעולית: אילו חברות הלקוח עובד איתן, באיזה תעריף ולאיזה
 * אזור. הקטע שמתחתיה הוא פרטי החיבור — הטוקן של צ׳יטה, מוצפן במנוחה. הם לא
 * אותו דבר: לקוח יכול לעבוד עם ארבע חברות ולהחזיק טוקן לאחת מהן, ואיחוד השניים
 * לשורה אחת היה כופה טוקן על כל חברה בטבלה כולל "צי הרכב שלנו".
 */
const CARRIERS = [
  { value: "internal", labelKey: "CarrierInternal" },
  { value: "hfd", labelKey: "CarrierHfd" },
  { value: "baldar", labelKey: "CarrierBaldar" },
  { value: "cheetah", labelKey: "CarrierCheetah" },
  { value: "israelPost", labelKey: "CarrierIsraelPost" },
  { value: "other", labelKey: "CarrierOther" },
];

const ShippingProviders = () => {
  const { t } = useTranslation();

  const carrierLabel = (key) => {
    const found = CARRIERS.find((c) => c.value === key);
    return found ? t(found.labelKey) : key || "—";
  };

  return (
    <>
      <ResourcePage
        title={t("ShippingProviders")}
        description={t("ShippingProvidersDescription")}
        emptyTitle={t("NoShippingProviders")}
        service={{
          list: SupplyServices.getShippingProviders,
          create: SupplyServices.addShippingProvider,
          update: SupplyServices.updateShippingProvider,
          remove: SupplyServices.deleteShippingProvider,
        }}
        columns={[
          { key: "name", label: t("ProviderName") },
          { key: "carrier", label: t("Carrier"), render: (row) => carrierLabel(row.carrier) },
          { key: "phone", label: t("Phone") },
          {
            key: "baseRate",
            label: t("BaseRate"),
            render: (row) => (row.baseRate ? `₪${row.baseRate}` : "—"),
          },
          {
            key: "isConnected",
            label: t("ConnectionStatus"),
            render: (row) => (
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  row.isConnected
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {row.isConnected ? t("Connected") : t("ReadyToConnect")}
              </span>
            ),
          },
          {
            key: "isActive",
            label: t("Status"),
            render: (row) => (row.isActive === false ? t("Inactive") : t("Active")),
          },
        ]}
        fields={[
          { name: "name", label: t("ProviderName"), required: true },
          {
            name: "carrier",
            label: t("Carrier"),
            type: "select",
            options: CARRIERS.map((c) => ({ value: c.value, label: t(c.labelKey) })),
          },
          { name: "contactName", label: t("ContactName") },
          { name: "phone", label: t("Phone") },
          { name: "email", label: t("Email"), type: "email" },
          { name: "baseRate", label: t("BaseRate"), type: "number" },
          {
            name: "trackingUrlTemplate",
            label: t("TrackingUrlTemplate"),
            span: 3,
            help: t("TrackingUrlTemplateHelp"),
          },
          { name: "sortOrder", label: t("SortOrder"), type: "number" },
          { name: "isActive", label: t("Active"), type: "checkbox" },
          { name: "notes", label: t("Notes"), type: "textarea", span: 3 },
        ]}
      />

      <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
        <IntegrationSettings
          category="shipping"
          title={t("ShippingIntegrations")}
          description={t("ShippingIntegrationsDescription")}
        />
      </div>
    </>
  );
};

export default ShippingProviders;
