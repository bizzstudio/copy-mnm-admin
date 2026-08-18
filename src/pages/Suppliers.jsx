// src/pages/Suppliers.jsx
import React from "react";
import { useTranslation } from "react-i18next";

import ResourcePage from "@/components/resource/ResourcePage";
import SupplyServices from "@/services/SupplyServices";

/**
 * ספקים.
 *
 * עד עכשיו הספק היה מחרוזת חופשית על המוצר, כלומר לא ישות: אי אפשר היה להוציא
 * דוח רכש לפי ספק ולא לצרף אליו פרטי קשר או תנאי תשלום.
 */
const Suppliers = () => {
  const { t } = useTranslation();

  return (
    <ResourcePage
      title={t("Suppliers")}
      description={t("SuppliersDescription")}
      emptyTitle={t("NoSuppliers")}
      service={{
        list: SupplyServices.getSuppliers,
        create: SupplyServices.addSupplier,
        update: SupplyServices.updateSupplier,
        remove: SupplyServices.deleteSupplier,
      }}
      columns={[
        { key: "name", label: t("SupplierName") },
        { key: "contactName", label: t("ContactName") },
        { key: "phone", label: t("Phone") },
        { key: "email", label: t("Email") },
        {
          key: "paymentTermDays",
          label: t("PaymentTermDays"),
          render: (row) => (row.paymentTermDays ? `${row.paymentTermDays}` : "—"),
        },
        {
          key: "leadTimeDays",
          label: t("LeadTimeDays"),
          render: (row) => (row.leadTimeDays ? `${row.leadTimeDays}` : "—"),
        },
        {
          key: "isActive",
          label: t("Status"),
          render: (row) => (row.isActive === false ? t("Inactive") : t("Active")),
        },
      ]}
      fields={[
        { name: "name", label: t("SupplierName"), required: true },
        { name: "code", label: t("SupplierCode"), help: t("SupplierCodeHelp") },
        { name: "taxId", label: t("TaxId") },
        { name: "contactName", label: t("ContactName") },
        { name: "phone", label: t("Phone") },
        { name: "email", label: t("Email"), type: "email" },
        { name: "address", label: t("Address"), span: 3 },
        {
          name: "paymentTermDays",
          label: t("PaymentTermDays"),
          type: "number",
          help: t("PaymentTermDaysHelp"),
        },
        {
          name: "leadTimeDays",
          label: t("LeadTimeDays"),
          type: "number",
          help: t("LeadTimeDaysHelp"),
        },
        { name: "isActive", label: t("Active"), type: "checkbox" },
        { name: "notes", label: t("Notes"), type: "textarea", span: 3 },
      ]}
    />
  );
};

export default Suppliers;
