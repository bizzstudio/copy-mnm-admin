// src/components/customer/ReceiptForm.jsx
import React, { useState, useMemo, useContext } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BiPlus, BiTrash } from "react-icons/bi";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import { Label, Textarea, Input } from "@windmill/react-ui";
import PaymentAmountSummary from "./PaymentAmountSummary";
import CustomerServices from "@/services/CustomerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyError } from "@/utils/toast";
import { SidebarContext } from "@/context/SidebarContext";

/**
 * טופס הנפקת קבלה על חשבונית מס קיימת
 * מאפשר בחירת חשבונית מס מריווחית + פרטי תשלום
 */
const ReceiptForm = ({ customer, externalCustomerId, rivhitDocuments, onSuccess }) => {
    const { t } = useTranslation();
    const { paymentTypes } = useContext(SidebarContext);
    const [loading, setLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [payments, setPayments] = useState([
        {
            payment_type: "",
            amount_nis: "",
            due_date: "",
            description: "",
            bank_code: "",
            branch_number: "",
            bank_account_number: "",
            check_number: "",
            number_of_payments: 1,
        }
    ]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    // סינון חשבוניות מס (לא חשבוניות מס קבלה!) שאפשר להנפיק עליהן קבלה
    const eligibleInvoices = useMemo(() => {
        if (!rivhitDocuments?.groups || !Array.isArray(rivhitDocuments.groups)) {
            return [];
        }

        const allGroup = rivhitDocuments.groups.find(g => g.document_type === "all");
        const allDocuments = allGroup?.documents || [];

        // סינון: רק חשבוניות מס רגילות (לא חשבוניות מס קבלה!) שלא מבוטלות ולא סגורות
        return allDocuments.filter(doc =>
            doc.is_accounting === true &&
            doc.is_invoice_receipt !== true && // לא חשבונית מס קבלה!
            doc.is_cancelled !== true &&
            doc.is_closed !== true &&
            doc.document_type_name?.includes("חשבונית מס")
        );
    }, [rivhitDocuments]);

    // מציאת החשבונית הנבחרת
    const selectedInvoiceData = eligibleInvoices.find(inv => inv.document_number === selectedInvoice);

    // טיפול בבחירת חשבונית
    const handleInvoiceSelect = (docNumber) => {
        setSelectedInvoice(docNumber === selectedInvoice ? null : docNumber);
    };

    // הוספת תשלום חדש
    const handleAddPayment = () => {
        setPayments([
            ...payments,
            {
                payment_type: "",
                amount_nis: "",
                due_date: "",
                description: "",
                bank_code: "",
                branch_number: "",
                bank_account_number: "",
                check_number: "",
                number_of_payments: 1,
            }
        ]);
    };

    // הסרת תשלום
    const handleRemovePayment = (index) => {
        if (payments.length === 1) {
            notifyError(t("MinOnePayment") || "חובה לפחות תשלום אחד");
            return;
        }
        setPayments(payments.filter((_, i) => i !== index));
    };

    // עדכון פרטי תשלום
    const handlePaymentChange = (index, field, value) => {
        const updatedPayments = [...payments];
        updatedPayments[index] = {
            ...updatedPayments[index],
            [field]: value,
        };
        setPayments(updatedPayments);
    };

    // מילוי סכום כולל בתשלום הראשון
    const handleFillTotalAmount = () => {
        if (payments.length === 1 && selectedInvoiceData) {
            handlePaymentChange(0, "amount_nis", parseFloat(selectedInvoiceData.amount || 0).toFixed(2));
        }
    };

    // חישוב סכום כל התשלומים
    const paymentsTotal = payments.reduce((sum, p) => {
        const amount = Number(p.amount_nis) || 0;
        return sum + amount;
    }, 0);

    // חישוב הסכום שנותר להקצות
    const invoiceAmount = selectedInvoiceData ? parseFloat(selectedInvoiceData.amount || 0) : 0;
    const isAmountValid = Math.abs(invoiceAmount - paymentsTotal) < 0.01;

    // טיפול בשליחת הטופס
    const onSubmit = async (data) => {
        if (!selectedInvoice) {
            notifyError(t("PleaseSelectInvoice") || "נא לבחור חשבונית");
            return;
        }

        // וולידציה של תשלומים
        const invalidPayments = payments.filter(p => !p.payment_type);
        if (invalidPayments.length > 0) {
            notifyError(t("SelectPaymentAll") || "יש לבחור סוג תשלום לכל התשלומים");
            return;
        }

        const missingAmounts = payments.filter(p => !p.amount_nis || Number(p.amount_nis) <= 0);
        if (missingAmounts.length > 0) {
            notifyError(t("EnterAmountAll") || "יש להזין סכום לכל התשלומים");
            return;
        }

        // בדיקה שסכום התשלומים שווה לסכום החשבונית
        if (!isAmountValid) {
            notifyError(t("PaymentsMustEqualTotal") || "סכום התשלומים חייב להיות שווה לסכום החשבונית");
            return;
        }

        try {
            setLoading(true);
            const response = await CustomerServices.issueReceipt({
                rivhitCustomerId: externalCustomerId,
                invoiceDocumentNumber: selectedInvoice,
                payments: payments.map(p => ({
                    payment_type: Number(p.payment_type),
                    amount_nis: Number(p.amount_nis),
                    ...(p.due_date && { due_date: p.due_date }),
                    ...(p.description && { description: p.description }),
                    ...(p.bank_code && { bank_code: p.bank_code }),
                    ...(p.branch_number && { branch_number: p.branch_number }),
                    ...(p.bank_account_number && { bank_account_number: p.bank_account_number }),
                    ...(p.check_number && { check_number: p.check_number }),
                    ...(p.number_of_payments && Number(p.number_of_payments) > 1 && { number_of_payments: Number(p.number_of_payments) }),
                })),
                notes: data.notes || "",
                issue_date: data.issue_date || undefined,
                issue_time: data.issue_time || undefined,
            });

            notifyApiResponse(response, true);
            if (onSuccess) {
                onSuccess(response);
            }
        } catch (error) {
            console.error("Error issuing receipt:", error);
            notifyApiResponse(error, false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* בחירת חשבונית מס */}
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("SelectInvoiceForReceipt") || "בחר חשבונית מס לתשלום"}
                </Label>
                {eligibleInvoices.length === 0 ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {t("NoInvoicesAvailableForReceipt") || "אין חשבוניות מס זמינות לתשלום"}
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
                                {t("SelectedInvoice") || "חשבונית נבחרת"}: #{selectedInvoiceData.document_number}
                            </span>
                            <span className="text-lg font-bold text-mainColor">
                                ₪{parseFloat(selectedInvoiceData.amount || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* רשימת תשלומים - רק אם נבחרה חשבונית */}
            {selectedInvoice && (
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
                                            {payments.length === 1 && selectedInvoiceData && (
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

                                        {/* מספר תשלומים */}
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
                        totalAmount={invoiceAmount}
                        paymentsTotal={paymentsTotal}
                        hasSelectedOrders={!!selectedInvoice}
                    />
                </div>
            )}

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
                    disabled={loading || !selectedInvoice || payments.some(p => !p?.payment_type || !p?.amount_nis) || !isAmountValid}
                    className={`px-6 py-2 text-sm font-medium text-white bg-mainColor rounded-lg hover:bg-mainColor-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${selectedInvoice && isAmountValid ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
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

export default ReceiptForm;
