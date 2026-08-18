// src/pages/StockLocations.jsx
import React from "react";
import { useTranslation } from "react-i18next";

import ResourcePage from "@/components/resource/ResourcePage";
import InventoryServices from "@/services/InventoryServices";

/**
 * מיקומי מחסן.
 *
 * המודל, ה-API והשימוש בדשבורד המלאי כבר היו כאן; מה שלא היה זה מסך. מיקום נוצר
 * עד היום רק דרך סקריפט ה-seed, כלומר לקוח לא יכול היה להוסיף משאית או סניף בלי
 * שמישהו ייגש לשרת.
 */
const LOCATION_TYPES = [
  { value: "warehouse", labelKey: "LocationTypeWarehouse" },
  { value: "store", labelKey: "LocationTypeStore" },
  { value: "truck", labelKey: "LocationTypeTruck" },
];

const StockLocations = () => {
  const { t } = useTranslation();

  const typeLabel = (key) => {
    const found = LOCATION_TYPES.find((c) => c.value === key);
    return found ? t(found.labelKey) : key || "—";
  };

  return (
    <ResourcePage
      title={t("StockLocations")}
      description={t("StockLocationsDescription")}
      emptyTitle={t("NoStockLocations")}
      service={{
        /**
         * נתיבי המלאי קדמו ל-`crudController` ולכן מחזירים מערך שטוח ולא
         * `{ items }`, ו-PUT במקום PATCH. העטיפה כאן היא כדי שהמסך יראה את אותה
         * צורה כמו שאר המשאבים — ולא כדי להעמיד פנים שהשרת אחיד.
         */
        list: async () => ({ items: await InventoryServices.getLocations({ active: "all" }) }),
        create: InventoryServices.addLocation,
        update: InventoryServices.updateLocation,
        remove: InventoryServices.deleteLocation,
      }}
      columns={[
        { key: "name", label: t("LocationName") },
        { key: "type", label: t("LocationType"), render: (row) => typeLabel(row.type) },
        { key: "code", label: t("LocationCode") },
        { key: "city", label: t("City") },
        {
          key: "capacityUnits",
          label: t("CapacityUnits"),
          render: (row) => (row.capacityUnits ? row.capacityUnits : "—"),
        },
        {
          key: "isDefault",
          label: t("DefaultLocation"),
          render: (row) => (row.isDefault ? "✓" : "—"),
        },
        {
          key: "isActive",
          label: t("Status"),
          render: (row) => (row.isActive === false ? t("Inactive") : t("Active")),
        },
      ]}
      fields={[
        { name: "name", label: t("LocationName"), required: true },
        {
          name: "type",
          label: t("LocationType"),
          type: "select",
          options: LOCATION_TYPES.map((c) => ({ value: c.value, label: t(c.labelKey) })),
        },
        { name: "code", label: t("LocationCode") },
        { name: "city", label: t("City") },
        { name: "plateNumber", label: t("PlateNumber"), help: t("TruckOnlyHelp") },
        { name: "driverName", label: t("DriverName"), help: t("TruckOnlyHelp") },
        {
          name: "capacityUnits",
          label: t("CapacityUnits"),
          type: "number",
          help: t("CapacityUnitsHelp"),
        },
        { name: "sortOrder", label: t("SortOrder"), type: "number" },
        { name: "isDefault", label: t("DefaultLocation"), type: "checkbox" },
        { name: "isActive", label: t("Active"), type: "checkbox" },
      ]}
    />
  );
};

export default StockLocations;
