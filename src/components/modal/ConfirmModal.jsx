// src/components/modal/ConfirmModal.jsx
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { IoClose, IoWarningOutline, IoCheckmarkCircleOutline, IoTrashOutline, IoAlertCircleOutline } from 'react-icons/io5';
import { t } from 'i18next';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    icon = 'warning',
    confirmText,
    cancelText,
    isLoading = false
}) => {
    const getIcon = () => {
        const iconProps = "h-8 w-8";
        switch (icon) {
            case 'warning':
                return <IoWarningOutline className={`${iconProps} text-yellow-500`} />;
            case 'danger':
                return <IoTrashOutline className={`${iconProps} text-red-500`} />;
            case 'success':
                return <IoCheckmarkCircleOutline className={`${iconProps} text-green-500`} />;
            case 'info':
                return <IoAlertCircleOutline className={`${iconProps} text-mainColor-500`} />;
            default:
                return <IoWarningOutline className={`${iconProps} text-yellow-500`} />;
        }
    };

    const getConfirmButtonClass = () => {
        switch (icon) {
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700';
            case 'danger':
                return 'bg-red-600 hover:bg-red-700';
            case 'success':
                return 'bg-green-600 hover:bg-green-700';
            case 'info':
                return 'bg-mainColor-600 hover:bg-mainColor-700';
            default:
                return 'bg-mainColor-600 hover:bg-mainColor-700';
        }
    };

    const handleConfirm = () => {
        onConfirm?.();
    };

    const handleCancel = () => {
        onClose?.();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50" dir="rtl">
            <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 align-middle shadow-xl transition-all">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                {getIcon()}
                                {title}
                            </DialogTitle>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <IoClose className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mb-3">
                            {description && (
                                <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelText || t('common.cancel')}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClass()}`}
                            >
                                {isLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                                {confirmText || t('common.confirm')}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ConfirmModal;
