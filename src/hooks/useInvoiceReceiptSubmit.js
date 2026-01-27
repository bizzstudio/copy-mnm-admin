// src/hooks/useInvoiceReceiptSubmit.js
import { useState, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SidebarContext } from "@/context/SidebarContext";
import CustomerServices from "@/services/CustomerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyError } from "@/utils/toast";

const useInvoiceReceiptSubmit = (customer, onSuccess) => {
    const { t } = useTranslation();
    const { paymentTypes } = useContext(SidebarContext);
    const [loading, setLoading] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState([]);

    // מערך תשלומים - כל תשלום כולל payment_type, amount_nis ופרטים נוספים
    const defaultPayment = {
        payment_type: "",
        amount_nis: "",
        due_date: "",
        description: "",
        bank_code: "",
        branch_number: "",
        bank_account_number: "",
        check_number: "",
        number_of_payments: 1,
    };

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            payments: [defaultPayment],
            notes: "",
            issue_date: "",
            issue_time: "",
        },
    });

    // קריאת payments מ-useForm
    const payments = watch("payments") || [defaultPayment];

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

    // הוספת תשלום חדש
    const handleAddPayment = () => {
        const currentPayments = watch("payments") || [];
        setValue("payments", [
            ...currentPayments,
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
        ], { shouldValidate: true, shouldDirty: true });
    };

    // הסרת תשלום
    const handleRemovePayment = (index) => {
        const currentPayments = watch("payments") || [];
        if (currentPayments.length === 1) {
            notifyError(t("MinOnePayment"));
            return;
        }
        setValue("payments", currentPayments.filter((_, i) => i !== index), { shouldValidate: true, shouldDirty: true });
    };

    // עדכון פרטי תשלום
    const handlePaymentChange = (index, field, value) => {
        const currentPayments = watch("payments") || [];
        const updatedPayments = [...currentPayments];
        updatedPayments[index] = {
            ...updatedPayments[index],
            [field]: value,
        };
        setValue("payments", updatedPayments, { shouldValidate: true, shouldDirty: true });
    };

    // מילוי סכום כולל בתשלום הראשון
    const handleFillTotalAmount = () => {
        if (payments.length === 1 && totalAmount > 0) {
            handlePaymentChange(0, "amount_nis", totalAmount.toFixed(2));
        }
    };

    // קבלת שם שיטת התשלום
    const getPaymentTypeName = (paymentType) => {
        const pt = paymentTypes.find(p => p.payment_type === Number(paymentType));
        return pt?.payment_name || "";
    };

    // חישוב סכום כולל של ההזמנות שנבחרו
    const totalAmount = orders
        .filter((order) => selectedOrders.includes(order._id))
        .reduce((sum, order) => sum + (order.total || 0), 0);

    // חישוב סכום כל התשלומים
    const paymentsTotal = (payments || []).reduce((sum, p) => {
        const amount = Number(p.amount_nis) || 0;
        return sum + amount;
    }, 0);

    // חישוב הסכום שנותר להקצות
    const remainingAmount = totalAmount - paymentsTotal;

    // בדיקה אם סכום התשלומים שווה לסכום החשבונית
    const isAmountValid = Math.abs(remainingAmount) < 0.01;

    // טיפול בשליחת הטופס
    const onSubmit = async (data) => {
        if (selectedOrders.length === 0) {
            notifyError(t("PleaseSelectAtLeastOneOrder"));
            return;
        }

        // וולידציה של תשלומים
        const formPayments = data.payments || [];

        // בדיקה שכל תשלום קיבל payment_type
        const invalidPayments = formPayments.filter(p => !p.payment_type);
        if (invalidPayments.length > 0) {
            notifyError(t("SelectPaymentAll"));
            return;
        }

        // בדיקה שכל תשלום קיבל amount_nis
        const missingAmounts = formPayments.filter(p => !p.amount_nis || Number(p.amount_nis) <= 0);
        if (missingAmounts.length > 0) {
            notifyError(t("EnterAmountAll"));
            return;
        }

        // בדיקה שסכום התשלומים שווה לסכום החשבונית
        const formPaymentsTotal = formPayments.reduce((sum, p) => sum + (Number(p.amount_nis) || 0), 0);
        if (Math.abs(formPaymentsTotal - totalAmount) > 0.01) {
            notifyError(t("PaymentsMustEqualTotal"));
            return;
        }

        // בניית מערך תשלומים לשליחה לשרת
        const paymentsToSend = formPayments.map(p => {
            const payment = {
                payment_type: Number(p.payment_type),
                amount_nis: Number(p.amount_nis),
            };

            // שדות אופציונליים - רק אם מולאו
            if (p.due_date) payment.due_date = p.due_date;
            if (p.description) payment.description = p.description;
            if (p.bank_code) payment.bank_code = p.bank_code;
            if (p.branch_number) payment.branch_number = p.branch_number;
            if (p.bank_account_number) payment.bank_account_number = p.bank_account_number;
            if (p.check_number) payment.check_number = p.check_number;
            if (p.number_of_payments && Number(p.number_of_payments) > 1) {
                payment.number_of_payments = Number(p.number_of_payments);
            }

            return payment;
        });

        // בניית paymentMethodKey מכל ה-payment_type-ים עם הפרדה של "_"
        const paymentMethodKey = formPayments
            .map(p => p.payment_type)
            .filter(Boolean)
            .join("_");

        try {
            setLoading(true);
            const response = await CustomerServices.issueInvoiceReceipt({
                orderIds: selectedOrders,
                paymentMethodKey: paymentMethodKey, // שולחים את כל ה-payment_type-ים מופרדים ב-"_"
                notes: data.notes || "",
                payments: paymentsToSend, // מערך תשלומים מפורט
                issue_date: data.issue_date || undefined,
                issue_time: data.issue_time || undefined,
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

    return {
        // Form methods
        register,
        handleSubmit,
        watch,
        setValue,
        errors,
        // State
        loading,
        selectedOrders,
        setSelectedOrders,
        payments,
        orders,
        // Handlers
        handleOrderToggle,
        handleAddPayment,
        handleRemovePayment,
        handlePaymentChange,
        handleFillTotalAmount,
        onSubmit,
        // Calculations
        totalAmount,
        paymentsTotal,
        remainingAmount,
        isAmountValid,
        // Helpers
        getPaymentTypeName,
        paymentTypes,
    };
};

export default useInvoiceReceiptSubmit;