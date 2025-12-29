// src/components/modal/ChangStatusModal.jsx
import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { IoClose, IoSwapHorizontalOutline } from 'react-icons/io5';
import { useTranslation } from "react-i18next";
import { notifyError } from "@/utils/toast";

const ChangStatusModal = ({ yes, cancel, status, isSubmitting, setIsSubmitting, userName = '' }) => {
  const [password, setPassword] = useState("");
  const { t } = useTranslation();

  const handleChangeStatus = async () => {
    try {
      if (!password) {
        notifyError(t("Enter password"));
        return;
      };

      setIsSubmitting(true);
      // העברת הסיסמה שהוזנה
      await yes(password);
    } catch (err) {
      notifyError(err ? err?.response?.data?.message : err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onClose={cancel} className="relative z-50" dir="rtl">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 align-middle shadow-xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <IoSwapHorizontalOutline className="h-8 w-8 text-red-500" />
                {t("ChangStatusModalH2", { userName })}<span className="text-red-500">"{status}"</span>?
              </DialogTitle>
              <button
                onClick={cancel}
                className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <IoClose className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-3">
              {/* שדה להזנת הסיסמה */}
              <input
                type="password"
                placeholder={t("Enter password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-4 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isSubmitting) {
                    handleChangeStatus();
                  }
                }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={cancel}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("modalKeepBtn")}
              </button>
              <button
                onClick={handleChangeStatus}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                {t("changeStatusTo")}"{status}"
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default React.memo(ChangStatusModal);