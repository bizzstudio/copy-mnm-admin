// src/components/customer/InvoiceReceiptForm.jsx
import React, { useState, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SidebarContext } from "@/context/SidebarContext";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import { Label, Textarea } from "@windmill/react-ui";
import CustomerServices from "@/services/CustomerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyError } from "@/utils/toast";

/**
 * טופס הנפקת חשבונית מס קבלה (חמ"ק)
 * מאפשר בחירת הזמנות בהקפה שלא שולמו + בחירת שיטת תשלום + הערות
 */
const InvoiceReceiptForm = ({ customer, onSuccess }) => {
    const { t } = useTranslation();
    const { paymentTypes } = useContext(SidebarContext);
    const [loading, setLoading] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    // רישום field עם validation
    register("paymentMethodKey", {
        required: t("PleaseSelectPaymentMethod"),
    });

    const paymentMethodKey = watch("paymentMethodKey");

    // פונקציה לטיפול בשינוי שיטת התשלום
    const handlePaymentMethodChange = (value) => {
        setValue("paymentMethodKey", value, { shouldValidate: true, shouldDirty: true });
    };

    // סינון הזמנות בהקפה שלא שולמו מההזמנות של הלקוח
    const orders = useMemo(() => {
        if (!customer?.orders || !Array.isArray(customer.orders)) {
            return [];
        }
        return customer.orders.filter(
            (order) =>
                order.paymentMethod === "credit" &&
                !order.cardcom?.isPaid &&
                !order.icredit?.isPaid &&
                !order.accountingDocs?.invoiceReceipt?.url
        );
    }, [customer?.orders]);

    // טיפול בבחירת/ביטול בחירת הזמנה
    const handleOrderToggle = (orderId) => {
        setSelectedOrders((prev) =>
            prev.includes(orderId)
                ? prev.filter((id) => id !== orderId)
                : [...prev, orderId]
        );
    };

    // טיפול בשליחת הטופס
    const onSubmit = async (data) => {
        if (selectedOrders.length === 0) {
            notifyError(t("PleaseSelectAtLeastOneOrder"));
            return;
        }

        if (!data.paymentMethodKey) {
            notifyError(t("PleaseSelectPaymentMethod"));
            return;
        }

        try {
            setLoading(true);
            const response = await CustomerServices.issueInvoiceReceipt({
                orderIds: selectedOrders,
                paymentMethodKey: data.paymentMethodKey,
                notes: data.notes || "",
            });

            notifyApiResponse(response, true);
            if (onSuccess) {
                onSuccess(response);
            }
        } catch (error) {
            console.error("Error issuing invoice receipt:", error);
            notifyApiResponse(error, false);
        } finally {
            setLoading(false);
        }
    };

    // חישוב סכום כולל של ההזמנות שנבחרו
    const totalAmount = orders
        .filter((order) => selectedOrders.includes(order._id))
        .reduce((sum, order) => sum + (order.total || 0), 0);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* בחירת הזמנות */}
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
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

            {/* בחירת שיטת תשלום */}
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("PaymentMethod")}
                </Label>
                <SelectWithOptions
                    options={paymentTypes.map((pt) => ({
                        _id: pt.payment_type,
                        name: pt.payment_name,
                    }))}
                    value={paymentMethodKey || ""}
                    onChange={handlePaymentMethodChange}
                    valueKey="_id"
                    labelKey="name"
                    placeholder={t("SelectPaymentMethod")}
                    className={errors.paymentMethodKey ? "border-red-500" : ""}
                />
                {errors.paymentMethodKey && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {t("PleaseSelectPaymentMethod")}
                    </p>
                )}
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
                    className={`px-6 py-2 text-sm font-medium text-white bg-mainColor rounded-lg hover:bg-mainColor-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${selectedOrders.length === 0 || !paymentMethodKey ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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