// src/components/customer/PaymentEntriesForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { BiPlus, BiTrash } from "react-icons/bi";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import { Label, Input } from "@windmill/react-ui";
import PaymentAmountSummary from "./PaymentAmountSummary";

/**
 * קומפוננטה לשימוש חוזר: רשימת תשלומים (הוספה/הסרה/עריכה) + סיכום סכומים.
 * משמשת בטופס חשבונית מס קבלה ובטופס קבלה על חשבונית.
 */
const PaymentEntriesForm = ({
    payments = [],
    paymentTypes = [],
    onAddPayment,
    onRemovePayment,
    onPaymentChange,
    onFillTotalAmount,
    totalAmount = 0,
    paymentsTotal = 0,
    hasSelectedSource = false,
    showFillTotalAmount = false,
}) => {
    const { t } = useTranslation();

    return (
        <div>
            {/* כותרת + כפתור הוספת תשלום */}
            <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {t("PaymentDetails")}
                </Label>
                <button
                    type="button"
                    onClick={onAddPayment}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-mainColor border border-mainColor rounded-lg hover:bg-mainColor/10 transition-colors"
                >
                    <BiPlus size={18} />
                    <span>{t("AddPayment")}</span>
                </button>
            </div>

            <div className="space-y-4">
                {payments.map((payment, index) => (
                    <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3"
                    >
                        {/* Header של תשלום */}
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {t("Payment")} #{index + 1}
                            </h4>
                            {payments.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemovePayment(index)}
                                    className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                    <BiTrash size={18} />
                                </button>
                            )}
                        </div>

                        {/* סוג תשלום + סכום */}
                        <div className="grid grid-cols-2 gap-3">

                            {/* סוג תשלום */}
                            <div>
                                <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {t("PaymentMethod")} *
                                </Label>
                                <SelectWithOptions
                                    options={paymentTypes.map((pt) => ({
                                        _id: pt.payment_type,
                                        name: pt.payment_name,
                                    }))}
                                    value={payment.payment_type}
                                    onChange={(value) => onPaymentChange(index, "payment_type", value)}
                                    valueKey="_id"
                                    labelKey="name"
                                    placeholder={t("SelectPaymentMethod")}
                                />
                            </div>

                            {/* סכום */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {t("PaymentAmount")} *
                                    </Label>
                                    {showFillTotalAmount && payments.length === 1 && (
                                        <button
                                            type="button"
                                            onClick={onFillTotalAmount}
                                            className="text-xs text-mainColor hover:text-mainColor-dark underline cursor-pointer"
                                        >
                                            {t("SelectAll")}
                                        </button>
                                    )}
                                </div>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={payment.amount_nis}
                                    onChange={(e) => onPaymentChange(index, "amount_nis", e.target.value)}
                                    placeholder="0.00"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* שדות דינמיים לפי סוג תשלום */}
                        {payment.payment_type && (
                            <>
                                {/* תאריך פרעון */}
                                <div>
                                    <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {t("DueDate")}
                                    </Label>
                                    <Input
                                        type="date"
                                        value={payment.due_date}
                                        onChange={(e) => onPaymentChange(index, "due_date", e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* תיאור */}
                                <div>
                                    <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {t("Description")}
                                    </Label>
                                    <Input
                                        type="text"
                                        value={payment.description}
                                        onChange={(e) => onPaymentChange(index, "description", e.target.value)}
                                        placeholder={t("PaymentDescription")}
                                        maxLength={250}
                                        className="w-full"
                                    />
                                </div>

                                {/* שדות שיק (payment_type === 1) */}
                                {Number(payment.payment_type) === 1 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* קוד בנק */}
                                        <div>
                                            <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("BankCode")}
                                            </Label>
                                            <Input
                                                type="text"
                                                value={payment.bank_code}
                                                onChange={(e) => onPaymentChange(index, "bank_code", e.target.value)}
                                                placeholder="12"
                                                className="w-full"
                                            />
                                        </div>

                                        {/* מספר סניף */}
                                        <div>
                                            <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("BranchNumber")}
                                            </Label>
                                            <Input
                                                type="text"
                                                value={payment.branch_number}
                                                onChange={(e) => onPaymentChange(index, "branch_number", e.target.value)}
                                                placeholder="123"
                                                className="w-full"
                                            />
                                        </div>

                                        {/* מספר חשבון */}
                                        <div>
                                            <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("BankAccountNumber")}
                                            </Label>
                                            <Input
                                                type="text"
                                                value={payment.bank_account_number}
                                                onChange={(e) => onPaymentChange(index, "bank_account_number", e.target.value)}
                                                placeholder="123456"
                                                className="w-full"
                                            />
                                        </div>

                                        {/* מספר שיק */}
                                        <div>
                                            <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("CheckNumber")}
                                            </Label>
                                            <Input
                                                type="text"
                                                value={payment.check_number}
                                                onChange={(e) => onPaymentChange(index, "check_number", e.target.value)}
                                                placeholder="123456"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* מספר תשלומים */}
                                <div>
                                    <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {t("NumberOfPayments")}
                                    </Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={payment.number_of_payments}
                                        onChange={(e) => onPaymentChange(index, "number_of_payments", e.target.value)}
                                        className="w-full"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {t("PaymentsHelp")}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* סיכום סכום שנותר להקצות */}
            <PaymentAmountSummary
                totalAmount={totalAmount}
                paymentsTotal={paymentsTotal}
                hasSelectedOrders={hasSelectedSource}
            />
        </div>
    );
};

export default PaymentEntriesForm;