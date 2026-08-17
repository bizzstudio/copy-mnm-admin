// src/components/modal/MainModal.jsx
import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { IoClose, IoTrashOutline } from 'react-icons/io5';
import { useTranslation } from "react-i18next";

// Internal import
import CustomerServices from "@/services/CustomerServices";
import AdminServices from "@/services/AdminServices";
import CouponServices from "@/services/CouponServices";
import ProductServices from "@/services/ProductServices";
import CategoryServices from "@/services/CategoryServices";
import { SidebarContext } from "@/context/SidebarContext";
import { notifySuccess, notifyError } from "@/utils/toast";
/** Bilingual `{ he, en }` messages from `/api/admin/*` — see the note in DeleteModal. */
import notifyApiResponse from "@/utils/notifyApiResponse";
import useToggleDrawer from "@/hooks/useToggleDrawer";

const MainModal = ({ id, title }) => {
  const { isModalOpen, closeModal, setIsUpdate } = useContext(SidebarContext);
  const { setServiceId } = useToggleDrawer();
  const location = useLocation();
  const { t } = useTranslation();

  const handleDelete = () => {
    if (location.pathname === "/products") {
      ProductServices.deleteProduct(id)
        .then((res) => {
          setIsUpdate(true);
          notifyApiResponse(res, true);
        })
        .catch((err) => notifyApiResponse(err, false));
      closeModal();
      setServiceId();
    }

    if (location.pathname === "/category") {
      CategoryServices.deleteCategory(id)
        .then((res) => {
          setIsUpdate(true);
          notifyApiResponse(res, true);
        })
        .catch((err) => notifyApiResponse(err, false));
      closeModal();
      setServiceId();
    }
    if (location.pathname === "/customers") {
      CustomerServices.deleteCustomer(id)
        .then((res) => {
          setIsUpdate(true);
          notifySuccess(res.message);
        })
        .catch((err) => notifyError(err.message));
      closeModal();
      setServiceId();
    }

    if (location.pathname === "/coupons") {
      CouponServices.deleteCoupon(id)
        .then((res) => {
          setIsUpdate(true);
          notifyApiResponse(res, true);
        })
        .catch((err) => notifyApiResponse(err, false));
      closeModal();
      setServiceId();
    }
    if (location.pathname === "/our-staff") {
      AdminServices.deleteStaff(id)
        .then((res) => {
          setIsUpdate(true);
          notifySuccess(res.message);
        })
        .catch((err) => notifyError(err.message));
      closeModal();
      setServiceId();
    }
  };

  return (
    <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50" dir="rtl">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 align-middle shadow-xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <IoTrashOutline className="h-8 w-8 text-red-500" />
                {t("DeleteModalH2")} {title}?
              </DialogTitle>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <IoClose className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-3">
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                {t("DeleteModalPtag")}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={closeModal}
                className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t("modalKeepBtn")}
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                {t("modalDeletBtn")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default React.memo(MainModal);