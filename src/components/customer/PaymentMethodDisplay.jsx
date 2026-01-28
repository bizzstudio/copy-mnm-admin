// src/components/customer/PaymentMethodDisplay.jsx
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import { SidebarContext } from "@/context/SidebarContext";

/**
 * Parses payment method string and returns display config.
 * - "card" → immediate + credit card
 * - "credit" → deferred (הקפה), unpaid
 * - "credit_X" or "credit_X_Y_Z" → deferred, paid with payment type(s) X, Y, Z
 */
const parsePaymentMethod = (paymentMethod) => {
  if (!paymentMethod || typeof paymentMethod !== "string") {
    return { type: "unknown", label: null, paymentTypeIds: [] };
  }

  const normalized = paymentMethod.trim().toLowerCase();

  if (normalized === "card") {
    return { type: "card", label: null, paymentTypeIds: [] };
  }

  if (normalized === "credit") {
    return { type: "credit", label: null, paymentTypeIds: [] };
  }

  // credit_2, credit_9, credit_1_2_5, etc.
  if (normalized.startsWith("credit_")) {
    const rest = normalized.slice("credit_".length);
    const parts = rest.split("_").filter(Boolean);
    const ids = parts
      .map((p) => parseInt(p, 10))
      .filter((n) => !Number.isNaN(n));
    return { type: "credit_paid", label: null, paymentTypeIds: ids };
  }

  return { type: "unknown", label: paymentMethod, paymentTypeIds: [] };
};

// מחזיר את מערך השמות של שיטות התשלום של ריווחית בהזמנה הזאת
const getPaymentTypeNames = (paymentTypeIds, paymentTypes) => {
  if (!Array.isArray(paymentTypes) || paymentTypeIds.length === 0) {
    return [];
  }
  const map = new Map(
    paymentTypes.map((pt) => [Number(pt.payment_type), pt.payment_name])
  );
  return paymentTypeIds
    .map((id) => map.get(id))
    .filter(Boolean);
};

const PaymentMethodDisplay = ({ paymentMethod, className = "" }) => {
  const { t } = useTranslation();
  const { paymentTypes = [] } = useContext(SidebarContext) || {};
  const parsed = parsePaymentMethod(paymentMethod);
  const paymentTypeNames = getPaymentTypeNames(parsed.paymentTypeIds, paymentTypes);

  // Card: "מיידי" → "כרטיס אשראי"
  if (parsed.type === "card") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
        <span>{t("Current")}</span>
        <FiArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-500 rtl:rotate-180" aria-hidden />
        <span>{t("CreditCard")}</span>
      </span>
    );
  }

  // Credit only (unpaid)
  if (parsed.type === "credit") {
    return (
      <span className={`text-sm ${className}`}>
        {t("Credit")}
      </span>
    );
  }

  // Credit + paid with specific payment type(s)
  if (parsed.type === "credit_paid") {
    return (
      <span className={`inline-flex flex-wrap items-center gap-1.5 text-sm ${className}`}>
        <span>{t("Credit")}</span>
        {paymentTypeNames.length > 0 && (
          <>
            <FiArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-500 rtl:rotate-180" aria-hidden />
            <span className="text-gray-700">
              {paymentTypeNames.join(" + ")}
            </span>
          </>
        )}
      </span>
    );
  }

  // Unknown / fallback
  return (
    <span className={`text-sm text-gray-500 ${className}`}>
      {parsed.label ? t(parsed.label) : "N/A"}
    </span>
  );
};

export default PaymentMethodDisplay;
export { parsePaymentMethod, getPaymentTypeNames };