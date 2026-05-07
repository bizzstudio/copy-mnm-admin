// src/components/customer/InvoiceReceiptForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Label, Textarea, Input } from "@windmill/react-ui";
import PaymentEntriesForm from "./PaymentEntriesForm";
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
        filteredOrders,
        dateFrom,
        dateTo,
        setDateFrom,
        setDateTo,
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
                    <>
                        {/* פילטר תאריכים */}
                        <div className="flex gap-3 mb-2 flex-wrap items-end">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-xs text-gray-500 dark:text-gray-400">{t("DateFrom")}</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-mainColor"
                                />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-xs text-gray-500 dark:text-gray-400">{t("DateTo")}</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-mainColor"
                                />
                            </div>
                            {(dateFrom || dateTo) && (
                                <button
                                    type="button"
                                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                                    className="text-xs text-mainColor hover:underline self-end pb-1 cursor-pointer"
                                >
                                    {t("Clear")}
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                            {filteredOrders.map((order) => (
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
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString("he-IL")}
                                                </p>
                                                {(order.user_info?.name || order.user_info?.lastName) && (
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                                        · {[order.user_info.name, order.user_info.lastName].filter(Boolean).join(" ")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left font-bold text-gray-900 dark:text-white">
                                        ₪{order.total?.toFixed(2)}
                                    </div>
                                </label>
                            ))}
                            {filteredOrders.length === 0 && (
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
                                    {t("NoResultsForFilter")}
                                </p>
                            )}
                        </div>
                    </>
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
            <PaymentEntriesForm
                payments={payments || []}
                paymentTypes={paymentTypes || []}
                onAddPayment={handleAddPayment}
                onRemovePayment={handleRemovePayment}
                onPaymentChange={handlePaymentChange}
                onFillTotalAmount={handleFillTotalAmount}
                totalAmount={totalAmount}
                paymentsTotal={paymentsTotal}
                hasSelectedSource={selectedOrders.length > 0}
                showFillTotalAmount={(payments || []).length === 1 && selectedOrders.length > 0}
            />

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