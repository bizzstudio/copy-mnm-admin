// src/components/customer/DocumentIssueModal.jsx
import React from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { IoClose, IoDocumentTextOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";

/**
 * מודאל גנרי להפקת מסמכים מריווחית
 * מקבל את סוג המסמך וקומפוננטת התוכן המתאימה
 */
const DocumentIssueModal = ({
    isOpen,
    onClose,
    documentType, // 'invoice-receipt' | 'delivery-note' | 'credit-invoice'
    children,
}) => {
    const { t } = useTranslation();

    const getTitleByType = () => {
        switch (documentType) {
            case 'invoice-receipt':
                return t('IssueInvoiceReceipt');
            case 'delivery-note':
                return t('IssueDeliveryNote');
            case 'credit-invoice':
                return t('IssueCreditInvoice');
            default:
                return t('IssueDocument');
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50" dir="rtl">
            <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <IoDocumentTextOutline className="h-7 w-7 text-mainColor" />
                                {getTitleByType()}
                            </DialogTitle>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <IoClose className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {children}
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default DocumentIssueModal;