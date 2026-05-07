// src/components/customer/InvoiceForm.jsx
import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Label, Textarea, Input } from "@windmill/react-ui";
import CustomerServices from "@/services/CustomerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyError } from "@/utils/toast";

/** מחזיר את סוג המסמך של הזמנה (מה-DB שלנו) */
function getOrderDocType(order) {
    if (
        order.accountingDocs?.deliveryNoteHyphen?.document_number ||
        order.accountingDocs?.deliveryNote?.document_number
    ) return "delivery";
    if (order.accountingDocs?.returnNote?.document_number) return "return";
    return "order";
}

/** תווית מוצגת לפי סוג */
function getOrderLabel(order, t) {
    const type = getOrderDocType(order);
    if (type === "delivery") {
        const num =
            order.accountingDocs?.deliveryNoteHyphen?.document_number ||
            order.accountingDocs?.deliveryNote?.document_number;
        return `${t("DeliveryNoteHyphen")} #${num}`;
    }
    if (type === "return") {
        return `${t("ReturnNote")} #${order.accountingDocs.returnNote.document_number}`;
    }
    return `${t("Order")} #${order.invoice}`;
}

/**
 * טופס הנפקת חשבונית מס רגילה (ללא תשלום)
 * מאפשר בחירת הזמנות + תעודות החזרה מריווחית + סינון + הערות
 */
const InvoiceForm = ({ customer, rivhitDocuments, externalCustomerId, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectedRivhitReturnNotes, setSelectedRivhitReturnNotes] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const {
        register,
        handleSubmit,
        watch,
    } = useForm();

    // סינון הזמנות שעדיין לא הונפקה להן חשבונית
    const orders = useMemo(() => {
        if (!customer?.orders || !Array.isArray(customer.orders)) return [];
        return customer.orders.filter(
            (order) =>
                !order.accountingDocs?.invoice?.url &&
                !order.accountingDocs?.invoiceReceipt?.url
        );
    }, [customer?.orders]);

    // שליפת תעודות החזרה מריווחית שעדיין לא הונפקה עליהן חשבונית
    const rivhitReturnNotes = useMemo(() => {
        if (!rivhitDocuments?.groups || !Array.isArray(rivhitDocuments.groups)) return [];
        const allGroup = rivhitDocuments.groups.find(g => String(g.document_type) === "all");
        const allDocs = allGroup?.documents || [];
        return allDocs.filter(doc => {
            const name = (doc.document_type_name || "").trim();
            return name === "תעודת החזרה" && doc.is_cancelled !== true;
        });
    }, [rivhitDocuments]);

    // ספירת סוגי המסמכים
    const typeCounts = useMemo(() => {
        const counts = { delivery: 0, return: 0, order: 0, rivhitReturn: rivhitReturnNotes.length };
        orders.forEach((o) => counts[getOrderDocType(o)]++);
        return counts;
    }, [orders, rivhitReturnNotes.length]);

    const totalItemsCount = orders.length + rivhitReturnNotes.length;

    // רשימת פילטרים דינמית
    const filters = useMemo(() => {
        const tabs = [{ key: "all", label: t("All"), count: totalItemsCount }];
        if (typeCounts.delivery > 0)
            tabs.push({ key: "delivery", label: t("DeliveryNoteHyphen"), count: typeCounts.delivery });
        if (typeCounts.return > 0)
            tabs.push({ key: "return", label: `${t("ReturnNote")} (DB)`, count: typeCounts.return });
        if (typeCounts.rivhitReturn > 0)
            tabs.push({ key: "rivhitReturn", label: t("ReturnNote"), count: typeCounts.rivhitReturn });
        if (typeCounts.order > 0)
            tabs.push({ key: "order", label: t("Order"), count: typeCounts.order });
        return tabs;
    }, [typeCounts, totalItemsCount, t]);

    // פילטור לפי טווח תאריכים
    const isInDateRange = (dateStr) => {
        if (!dateFrom && !dateTo) return true;
        const d = new Date(dateStr);
        if (isNaN(d)) return true;
        if (dateFrom && d < new Date(dateFrom)) return false;
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            if (d > to) return false;
        }
        return true;
    };

    // פילטור תעודת החזרה (תאריך בפורמט DD/MM/YYYY)
    const isDocInDateRange = (doc) => {
        if (!dateFrom && !dateTo) return true;
        const parts = (doc.document_date || "").split("/");
        if (parts.length !== 3) return true;
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (isNaN(d)) return true;
        if (dateFrom && d < new Date(dateFrom)) return false;
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            if (d > to) return false;
        }
        return true;
    };

    // הזמנות מסוננות
    const filteredOrders = useMemo(() => {
        let result = activeFilter === "all" || activeFilter === "rivhitReturn" ? orders : orders.filter((o) => getOrderDocType(o) === activeFilter);
        return result.filter((o) => isInDateRange(o.createdAt));
    }, [orders, activeFilter, dateFrom, dateTo]);

    // תעודות החזרה ריווחית מסוננות
    const filteredRivhitReturns = useMemo(() => {
        if (activeFilter !== "all" && activeFilter !== "rivhitReturn") return [];
        return rivhitReturnNotes.filter((doc) => isDocInDateRange(doc));
    }, [rivhitReturnNotes, activeFilter, dateFrom, dateTo]);

    // האם להציג בכלל הזמנות
    const showOrders = activeFilter !== "rivhitReturn";
    // האם להציג תעודות החזרה מריווחית
    const showRivhitReturns = activeFilter === "all" || activeFilter === "rivhitReturn";

    // בחירת/ביטול הזמנה
    const handleOrderToggle = (orderId) => {
        setSelectedOrders((prev) =>
            prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
        );
    };

    // בחירת/ביטול תעודת החזרה מריווחית
    const handleRivhitReturnToggle = (docNumber) => {
        setSelectedRivhitReturnNotes((prev) =>
            prev.includes(docNumber) ? prev.filter((n) => n !== docNumber) : [...prev, docNumber]
        );
    };

    // חישוב סכום כולל
    const totalAmount =
        orders
            .filter((o) => selectedOrders.includes(o._id))
            .reduce((sum, o) => sum + (o.total || 0), 0) +
        rivhitReturnNotes
            .filter((d) => selectedRivhitReturnNotes.includes(d.document_number))
            .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    const totalSelectedCount = selectedOrders.length + selectedRivhitReturnNotes.length;

    // שליחת הטופס
    const onSubmit = async (data) => {
        if (totalSelectedCount === 0) {
            notifyError(t("PleaseSelectAtLeastOneOrder"));
            return;
        }

        try {
            setLoading(true);
            const response = await CustomerServices.issueInvoice({
                orderIds: selectedOrders,
                rivhitReturnNotes: selectedRivhitReturnNotes.map((docNumber) => {
                    const doc = rivhitReturnNotes.find((d) => d.document_number === docNumber);
                    return {
                        document_number: docNumber,
                        amount: parseFloat(doc?.amount || 0),
                        description: `${doc?.document_type_name || "תעודת החזרה"} #${docNumber}`,
                    };
                }),
                rivhitCustomerId: externalCustomerId,
                notes: data.notes || "",
                issue_date: data.issue_date || undefined,
                issue_time: data.issue_time || undefined,
            });

            notifyApiResponse(response, true);
            if (onSuccess) onSuccess(response);
        } catch (error) {
            console.error("Error issuing invoice:", error);
            notifyApiResponse(error, false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* בחירת הזמנות */}
            <div>
                <Label className="mb-1.5 block text-base font-medium text-gray-700 dark:text-gray-300">
                    {t("SelectOrders")}
                </Label>

                {totalItemsCount === 0 ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {t("NoOrdersWithoutInvoice")}
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

                        {/* פילטר סוג מסמך */}
                        {filters.length > 2 && (
                            <div className="flex gap-1.5 flex-wrap mb-2">
                                {filters.map((f) => (
                                    <button
                                        key={f.key}
                                        type="button"
                                        onClick={() => setActiveFilter(f.key)}
                                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                                            activeFilter === f.key
                                                ? "bg-mainColor text-white border-mainColor"
                                                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:border-mainColor hover:text-mainColor"
                                        }`}
                                    >
                                        {f.label}
                                        <span className={`mr-1 ${activeFilter === f.key ? "opacity-80" : "opacity-60"}`}>
                                            ({f.count})
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* רשימה */}
                        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">

                            {/* תעודות החזרה מריווחית */}
                            {showRivhitReturns && filteredRivhitReturns.map((doc) => (
                                <label
                                    key={`rivhit-return-${doc.document_number}`}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                        selectedRivhitReturnNotes.includes(doc.document_number)
                                            ? "bg-mainColor/10 border-2 border-mainColor"
                                            : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedRivhitReturnNotes.includes(doc.document_number)}
                                            onChange={() => handleRivhitReturnToggle(doc.document_number)}
                                            className="w-5 h-5 text-mainColor rounded focus:ring-mainColor"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {t("ReturnNote")} #{doc.document_number}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="inline-block px-1.5 py-0.5 text-xs rounded font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                                    {t("ReturnNote")}
                                                </span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {doc.document_date}
                                                </p>
                                                {(doc.customer_firstname || doc.customer_name) && (
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                                        · {doc.customer_firstname || doc.customer_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left font-bold text-gray-900 dark:text-white">
                                        ₪{parseFloat(doc.amount || 0).toFixed(2)}
                                    </div>
                                </label>
                            ))}

                            {/* הזמנות (מ-DB) */}
                            {showOrders && filteredOrders.map((order) => {
                                const docType = getOrderDocType(order);
                                return (
                                    <label
                                        key={order._id}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                            selectedOrders.includes(order._id)
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
                                                    {getOrderLabel(order, t)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`inline-block px-1.5 py-0.5 text-xs rounded font-medium ${
                                                        docType === "delivery"
                                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                                            : docType === "return"
                                                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                                                : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                                                    }`}>
                                                        {docType === "delivery" ? t("DeliveryNoteHyphen") : docType === "return" ? t("ReturnNote") : t("Order")}
                                                    </span>
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
                                );
                            })}

                            {filteredOrders.length === 0 && filteredRivhitReturns.length === 0 && (
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
                                    {t("NoResultsForFilter")}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* סכום כולל */}
                {totalSelectedCount > 0 && (
                    <div className="mt-3 p-3 bg-mainColor/10 border border-mainColor rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("TotalAmount")} ({totalSelectedCount} {t("Orders")}):
                            </span>
                            <span className="text-lg font-bold text-mainColor">
                                ₪{totalAmount.toFixed(2)}
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
                    <Input type="date" {...register("issue_date")} className="w-full" />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("IssueDateHelp")}</p>
                </div>
                <div>
                    <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("IssueTime")}
                    </Label>
                    <Input type="time" {...register("issue_time")} className="w-full" />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("IssueTimeHelp")}</p>
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
                    disabled={loading || totalSelectedCount === 0}
                    className={`px-6 py-2 text-sm font-medium text-white bg-mainColor rounded-lg hover:bg-mainColor-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${totalSelectedCount > 0 ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
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

export default InvoiceForm;
