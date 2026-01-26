// src/components/customer/CreditInvoiceForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Label, Textarea } from "@windmill/react-ui";
import InputArea from "@/components/form/input/InputArea";
import CustomerServices from "@/services/CustomerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyError } from "@/utils/toast";

/**
 * טופס הנפקת חשבונית מס זיכוי (חמ"ז)
 * מאפשר הזנת סכום + הערות (ללא בחירת הזמנות)
 */
const CreditInvoiceForm = ({ customer, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const amount = watch("amount");
    const notes = watch("notes");

    // טיפול בשליחת הטופס
    const onSubmit = async (data) => {
        if (!data.amount || data.amount <= 0) {
            notifyError(t("PleaseEnterValidAmount"));
            return;
        }

        try {
            setLoading(true);
            const response = await CustomerServices.issueCreditInvoice({
                customerDbId: customer._id,
                amount: parseFloat(data.amount),
                notes: data.notes || "",
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
                        {customer.name} {customer.lastName}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{t("Email")}:</span>{" "}
                        {customer.email}
                    </p>
                    {customer.phone && (
                        <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{t("Phone")}:</span>{" "}
                            {customer.phone}
                        </p>
                    )}
                </div>
            </div>

            {/* הזנת סכום */}
            <div>
                <InputArea
                    name="amount"
                    label={t("CreditAmount")}
                    type="number"
                    step="0.01"
                    min={0.01}
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
            {(amount && parseFloat(amount) > 0) ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            {t("CreditAmountToIssue")}:
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ₪{parseFloat(amount).toFixed(2)}
                        </span>
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
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className="px-6 py-2 text-sm font-medium text-white bg-mainColor rounded-lg hover:bg-mainColor-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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