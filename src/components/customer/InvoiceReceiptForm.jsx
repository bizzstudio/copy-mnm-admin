// src/components/customer/InvoiceReceiptForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { BiPlus, BiTrash } from "react-icons/bi";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import { Label, Textarea, Input } from "@windmill/react-ui";
import PaymentAmountSummary from "./PaymentAmountSummary";
import useInvoiceReceiptSubmit from "@/hooks/useInvoiceReceiptSubmit";

/**
 * טופס הנפקת חשבונית מס קבלה (חמ"ק)
 * מאפשר בחירת הזמנות בהקפה שלא שולמו + בחירת שיטת תשלום + פרטי תשלום + הערות
 */
const InvoiceReceiptForm = ({ customer, onSuccess }) => {
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        watch,
        errors,
        loading,
        selectedOrders,
        payments,
        orders,
        handleOrderToggle,
        handleAddPayment,
        handleRemovePayment,
        handlePaymentChange,
        handleFillTotalAmount,
        onSubmit,
        totalAmount,
        paymentsTotal,
        isAmountValid,
        paymentTypes,
    } = useInvoiceReceiptSubmit(customer, onSuccess);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* בחירת הזמנות */}
            <div>
                <Label className="mb-1.5 block text-base font-medium text-gray-700 dark:text-gray-300">
                    {t("SelectOrders")}
                </Label>
                {orders.length === 0 ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {t("NoUnpaidCreditOrders")}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                        {orders.map((order) => (
                            <label
                                key={order._id}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedOrders.includes(order._id)
                                    ? "bg-mainColor/10 border-2 border-mainColor"
                                    : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(order._id)}
                                        onChange={() => handleOrderToggle(order._id)}
                                        className="w-5 h-5 text-mainColor rounded focus:ring-mainColor"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {t("Order")} #{order.invoice}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString("he-IL")}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-left font-bold text-gray-900 dark:text-white">
                                    ₪{order.total?.toFixed(2)}
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                {/* הצגת סכום כולל */}
                {selectedOrders.length > 0 && (
                    <div className="mt-3 p-3 bg-mainColor/10 border border-mainColor rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("TotalAmount")} ({selectedOrders.length} {t("Orders")}):
                            </span>
                            <span className="text-lg font-bold text-mainColor">
                                ₪{totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* רשימת תשלומים */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        {t("PaymentDetails")}
                    </Label>
                    <button
                        type="button"
                        onClick={handleAddPayment}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-mainColor border border-mainColor rounded-lg hover:bg-mainColor/10 transition-colors"
                    >
                        <BiPlus size={18} />
                        <span>{t("AddPayment")}</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {(payments || []).map((payment, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3"
                        >
                            {/* Header של תשלום */}
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {t("Payment")} #{index + 1}
                                </h4>
                                {(payments || []).length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePayment(index)}
                                        className="text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        <BiTrash size={18} />
                                    </button>
                                )}
                            </div>

                            {/* בחירת סוג תשלום */}
                            <div className="grid grid-cols-2 gap-3">
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
                                        onChange={(value) => handlePaymentChange(index, "payment_type", value)}
                                        valueKey="_id"
                                        labelKey="name"
                                        placeholder={t("SelectPaymentMethod")}
                                    />
                                </div>

                                {/* סכום התשלום */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {t("PaymentAmount")} *
                                        </Label>
                                        {(payments || []).length === 1 && selectedOrders.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleFillTotalAmount}
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
                                        onChange={(e) => handlePaymentChange(index, "amount_nis", e.target.value)}
                                        placeholder="0.00"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* שדות דינמיים בהתאם לסוג התשלום */}
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
                                            onChange={(e) => handlePaymentChange(index, "due_date", e.target.value)}
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
                                            onChange={(e) => handlePaymentChange(index, "description", e.target.value)}
                                            placeholder={t("PaymentDescription")}
                                            maxLength={250}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* שדות נוספים לשיק (payment_type === 1) */}
                                    {Number(payment.payment_type) === 1 && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {t("BankCode")}
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={payment.bank_code}
                                                    onChange={(e) => handlePaymentChange(index, "bank_code", e.target.value)}
                                                    placeholder="12"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {t("BranchNumber")}
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={payment.branch_number}
                                                    onChange={(e) => handlePaymentChange(index, "branch_number", e.target.value)}
                                                    placeholder="123"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {t("BankAccountNumber")}
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={payment.bank_account_number}
                                                    onChange={(e) => handlePaymentChange(index, "bank_account_number", e.target.value)}
                                                    placeholder="123456"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {t("CheckNumber")}
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={payment.check_number}
                                                    onChange={(e) => handlePaymentChange(index, "check_number", e.target.value)}
                                                    placeholder="123456"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* מספר תשלומים (לחלוקה אוטומטית בחודשים עוקבים) */}
                                    <div>
                                        <Label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {t("NumberOfPayments")}
                                        </Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={payment.number_of_payments}
                                            onChange={(e) => handlePaymentChange(index, "number_of_payments", e.target.value)}
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

                {/* הצגת סכום שנותר להקצות */}
                <PaymentAmountSummary
                    totalAmount={totalAmount}
                    paymentsTotal={paymentsTotal}
                    hasSelectedOrders={selectedOrders.length > 0}
                />
            </div>

            {/* תאריך ושעת הנפקה */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("IssueDate")}
                    </Label>
                    <Input
                        type="date"
                        {...register("issue_date")}
                        className="w-full"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("IssueDateHelp")}
                    </p>
                </div>
                <div>
                    <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("IssueTime")}
                    </Label>
                    <Input
                        type="time"
                        {...register("issue_time")}
                        className="w-full"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("IssueTimeHelp")}
                    </p>
                </div>
            </div>

            {/* הערות */}
            <div>
                <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("DocumentNotes")}
                </Label>
                <Textarea
                    {...register("notes")}
                    maxLength={250}
                    rows={3}
                    placeholder={t("DocumentNotesPlaceholder")}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {watch("notes")?.length || 0}/250
                </p>
            </div>

            {/* כפתורי פעולה */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                    type="button"
                    onClick={() => onSuccess && onSuccess(null)}
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {t("Cancel")}
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 text-sm font-medium text-white bg-mainColor rounded-lg hover:bg-mainColor-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${selectedOrders.length === 0 || (payments || []).some(p => !p?.payment_type || !p?.amount_nis) || !isAmountValid ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                    {loading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    )}
                    {loading ? t("Processing") : t("IssueDocument")}
                </button>
            </div>
        </form>
    );
};

export default InvoiceReceiptForm;