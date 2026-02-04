// src/components/customer/CreditInvoiceForm.jsx
import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Label, Textarea, Input } from "@windmill/react-ui";
import InputArea from "@/components/form/input/InputArea";
import CustomerServices from "@/services/CustomerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyError } from "@/utils/toast";

/**
 * טופס הנפקת חשבונית מס זיכוי (חמ"ז)
 * מאפשר בחירת חשבונית קיימת מריווחית + הזנת סכום לזיכוי + הערות
 */
const CreditInvoiceForm = ({ customer, externalCustomerId, rivhitDocuments, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const amount = watch("amount");
    const notes = watch("notes");

    // סינון: רק חשבונית מס וחשבונית מס קבלה (לא חשבונית מס זיכוי)
    const eligibleInvoices = useMemo(() => {
        if (!rivhitDocuments?.groups || !Array.isArray(rivhitDocuments.groups)) {
            return [];
        }

        // מציאת קבוצת "הכל" או איחוד כל הקבוצות
        const allGroup = rivhitDocuments.groups.find(g => g.document_type === "all");
        const allDocuments = allGroup?.documents || [];

        return allDocuments.filter((doc) => {
            if (!doc.is_accounting || doc.is_cancelled === true) return false;
            const name = (doc.document_type_name || "").trim();
            if (Number(doc.document_type) === 3) return false; // 3 = חשבונית מס זיכוי
            return name === "חשבונית מס" || doc.is_invoice_receipt === true || doc.document_type === 2;
        });
    }, [rivhitDocuments]);

    // מציאת החשבונית הנבחרת
    const selectedInvoiceData = eligibleInvoices.find(inv => inv.document_number === selectedInvoice);

    // טיפול בבחירת חשבונית
    const handleInvoiceSelect = (docNumber) => {
        setSelectedInvoice(docNumber === selectedInvoice ? null : docNumber);
    };

    // תקינות לכפתור (תצוגה בלבד – העצירה בפועל ב-onSubmit)
    const isSubmitValid =
        !!selectedInvoice &&
        !!amount &&
        parseFloat(amount) > 0 &&
        (!selectedInvoiceData || parseFloat(amount) <= parseFloat(selectedInvoiceData.amount || 0));

    // טיפול בשליחת הטופס
    const onSubmit = async (data) => {
        if (!selectedInvoice) {
            notifyError(t("PleaseSelectInvoice"));
            return;
        }

        if (!data.amount || data.amount <= 0) {
            notifyError(t("PleaseEnterValidAmount"));
            return;
        }

        // בדיקה שהסכום לא עולה על סכום החשבונית המקורית
        if (selectedInvoiceData && parseFloat(data.amount) > parseFloat(selectedInvoiceData.amount || 0)) {
            notifyError(t("CreditAmountExceedsInvoice"));
            return;
        }

        try {
            setLoading(true);
            const response = await CustomerServices.issueCreditInvoice({
                rivhitCustomerId: externalCustomerId,
                invoiceDocumentNumber: selectedInvoice,
                amount: parseFloat(data.amount),
                notes: data.notes || "",
                issue_date: data.issue_date || undefined,
                issue_time: data.issue_time || undefined,
            });

            notifyApiResponse(response, true);
            if (onSuccess) {
                onSuccess(response);
            }
        } catch (error) {
            console.error("Error issuing credit invoice:", error);
            notifyApiResponse(error, false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* מידע על הלקוח */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t("CustomerInfo")}
                </h3>
                <div className="space-y-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{t("Name")}:</span>{" "}
                        {customer?.name}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{t("Email")}:</span>{" "}
                        {customer?.email}
                    </p>
                    {customer?.phone && (
                        <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{t("Phone")}:</span>{" "}
                            {customer.phone}
                        </p>
                    )}
                </div>
            </div>

            {/* בחירת חשבונית */}
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("SelectInvoiceForCredit")}
                </Label>
                {eligibleInvoices.length === 0 ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {t("NoInvoicesAvailableForCredit")}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                        {eligibleInvoices.map((invoice) => (
                            <label
                                key={invoice.document_number}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedInvoice === invoice.document_number
                                    ? "bg-mainColor/10 border-2 border-mainColor"
                                    : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="invoiceSelection"
                                        checked={selectedInvoice === invoice.document_number}
                                        onChange={() => handleInvoiceSelect(invoice.document_number)}
                                        className="w-5 h-5 text-mainColor focus:ring-mainColor"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {invoice.document_type_name} #{invoice.document_number}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {invoice.document_date}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-left font-bold text-gray-900 dark:text-white">
                                    ₪{parseFloat(invoice.amount || 0).toFixed(2)}
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                {/* הצגת פרטי החשבונית הנבחרת */}
                {selectedInvoiceData && (
                    <div className="mt-3 p-3 bg-mainColor/10 border border-mainColor rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("SelectedInvoice")}: #{selectedInvoiceData.document_number}
                            </span>
                            <span className="text-lg font-bold text-mainColor">
                                ₪{parseFloat(selectedInvoiceData.amount || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* הזנת סכום */}
            <div>
                <InputArea
                    name="amount"
                    label={t("CreditAmount")}
                    type="number"
                    step="0.01"
                    min={0.01}
                    max={selectedInvoiceData?.amount || undefined}
                    register={register}
                    placeholder={t("EnterCreditAmount")}
                    isRequired={true}
                    Icon={<span className="text-gray-500 dark:text-gray-400 font-medium">₪</span>}
                    iconDir="left"
                    props={{
                        className: errors.amount ? "border-red-500" : "",
                    }}
                />
                {errors.amount && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.amount.message}
                    </p>
                )}
                {selectedInvoiceData && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("MaxCreditAmount")}: ₪{parseFloat(selectedInvoiceData.amount || 0).toFixed(2)}
                    </p>
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
                    rows={4}
                    placeholder={t("CreditInvoiceNotesPlaceholder")}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {notes?.length || 0}/250
                </p>
            </div>

            {/* תצוגה מקדימה */}
            {(selectedInvoice && amount && parseFloat(amount) > 0) ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                {t("CreditAmountToIssue")}:
                            </span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ₪{parseFloat(amount).toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            {t("OnInvoice")} #{selectedInvoice}
                        </p>
                    </div>
                </div>
            ) : null}

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
                    className={`px-6 py-2 text-sm font-medium text-white bg-mainColor rounded-lg hover:bg-mainColor-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isSubmitValid ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
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

export default CreditInvoiceForm;