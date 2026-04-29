// src/components/customer/DeliveryNoteForm.jsx
import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Label, Textarea, Input } from "@windmill/react-ui";
import CustomerServices from "@/services/CustomerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyError } from "@/utils/toast";

/**
 * טופס הנפקת תעודת משלוח (ת"מ) או תעודת-משלוח (מקף — סוג מסמך נפרד בריווחית)
 * @param {'default'|'hyphen'} [variant='default']
 */
const DeliveryNoteForm = ({ customer, onSuccess, variant = "default" }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const isHyphen = variant === "hyphen";

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    // סינון הזמנות שעדיין לא הונפקה להן תעודת משלוח / תעודת-משלוח (לפי variant)
    const orders = useMemo(() => {
        if (!customer?.orders || !Array.isArray(customer.orders)) {
            return [];
        }
        return customer.orders.filter((order) => {
            if (isHyphen) {
                return !order.accountingDocs?.deliveryNoteHyphen?.url;
            }
            return !order.accountingDocs?.deliveryNote?.url;
        });
    }, [customer?.orders, isHyphen]);

    // טיפול בבחירת הזמנה
    const handleOrderSelect = (orderId) => {
        setSelectedOrder(orderId === selectedOrder ? null : orderId);
    };

    // טיפול בשליחת הטופס
    const onSubmit = async (data) => {
        if (!selectedOrder) {
            notifyError(t("PleaseSelectOneOrder"));
            return;
        }

        try {
            setLoading(true);
            const payload = {
                orderId: selectedOrder,
                notes: data.notes || "",
                issue_date: data.issue_date || undefined,
                issue_time: data.issue_time || undefined,
            };
            const response = isHyphen
                ? await CustomerServices.issueDeliveryNoteHyphen(payload)
                : await CustomerServices.issueDeliveryNote(payload);

            notifyApiResponse(response, true);
            if (onSuccess) {
                onSuccess(response);
            }
        } catch (error) {
            console.error("Error issuing delivery note:", error);
            notifyApiResponse(error, false);
        } finally {
            setLoading(false);
        }
    };

    // מציאת ההזמנה הנבחרת
    const selectedOrderData = orders.find((o) => o._id === selectedOrder);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* בחירת הזמנה */}
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("SelectOrder")}
                </Label>
                {orders.length === 0 ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {isHyphen
                                ? t("NoOrdersWithoutDeliveryNoteHyphen")
                                : t("NoOrdersWithoutDeliveryNote")}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                        {orders.map((order) => (
                            <label
                                key={order._id}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedOrder === order._id
                                    ? "bg-mainColor/10 border-2 border-mainColor"
                                    : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="orderSelection"
                                        checked={selectedOrder === order._id}
                                        onChange={() => handleOrderSelect(order._id)}
                                        className="w-5 h-5 text-mainColor focus:ring-mainColor"
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
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        ₪{order.total?.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {order.cart?.length || 0} {t("items")}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                {/* הצגת פרטי ההזמנה הנבחרת */}
                {selectedOrderData && (
                    <div className="mt-3 p-3 bg-mainColor/10 border border-mainColor rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("SelectedOrder")}: #{selectedOrderData.invoice}
                            </span>
                            <span className="text-lg font-bold text-mainColor">
                                ₪{selectedOrderData.total?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
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
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t("Cancel")}
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 text-sm font-medium text-white bg-mainColor rounded-lg hover:bg-mainColor-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${selectedOrder ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
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

export default DeliveryNoteForm;