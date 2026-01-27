// src/components/customer/PaymentAmountSummary.jsx
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * קומפוננטה להצגת סיכום סכומי התשלומים והשוואה לסכום החשבונית
 * מציגה סטטוס צבעוני: ירוק (תואם), צהוב (חסר), אדום (חריגה)
 */
const PaymentAmountSummary = ({ totalAmount, paymentsTotal, hasSelectedOrders }) => {
    const { t } = useTranslation();

    // חישוב הסכום שנותר להקצות
    const remainingAmount = totalAmount - paymentsTotal;

    // בדיקה אם סכום התשלומים שווה לסכום החשבונית
    const isAmountValid = Math.abs(remainingAmount) < 0.01;

    if (!hasSelectedOrders) {
        return null;
    }

    return (
        <div className={`mt-3 p-3 border rounded-lg ${isAmountValid
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : remainingAmount > 0
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}>
            <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isAmountValid
                    ? "text-green-700 dark:text-green-300"
                    : remainingAmount > 0
                        ? "text-yellow-700 dark:text-yellow-300"
                        : "text-red-700 dark:text-red-300"
                    }`}>
                    {isAmountValid ? t("AmountsMatch") : t("RemainingAmount")}:
                </span>
                <span className={`text-lg font-bold ${isAmountValid
                    ? "text-green-700 dark:text-green-300"
                    : remainingAmount > 0
                        ? "text-yellow-700 dark:text-yellow-300"
                        : "text-red-700 dark:text-red-300"
                    }`}>
                    {isAmountValid ? "✓" : `₪${remainingAmount.toFixed(2)}`}
                </span>
            </div>
            {!isAmountValid && (
                <p className={`mt-2 text-xs ${remainingAmount > 0
                    ? "text-yellow-700 dark:text-yellow-300"
                    : "text-red-700 dark:text-red-300"
                    }`}>
                    {remainingAmount > 0 ? t("PaymentsLessThanTotal") : t("PaymentsMoreThanTotal")}
                </p>
            )}
        </div>
    );
};

export default PaymentAmountSummary;