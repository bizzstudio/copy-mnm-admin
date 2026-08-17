// src/components/modal/DeleteModal.jsx
import React, { useContext, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { IoClose, IoTrashOutline } from 'react-icons/io5';
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import AdminServices from "@/services/AdminServices";
import CategoryServices from "@/services/CategoryServices";
import CouponServices from "@/services/CouponServices";
import CustomerServices from "@/services/CustomerServices";
import LanguageServices from "@/services/LanguageServices";
import ProductServices from "@/services/ProductServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import AttributeServices from "@/services/AttributeServices";
import CurrencyServices from "@/services/CurrencyServices";
import DeliveryServices from "@/services/DeliveryServices";
import RegionServices from "@/services/RegionServices";
import OfferServices from "@/services/OfferServices";
import { notifyError, notifySuccess } from "@/utils/toast";
/**
 * The five catalogue resources answer with a BILINGUAL `{ he, en }` message now that
 * their writes go through `/api/admin/*`. `notifySuccess` would hand that object
 * straight to react-toastify; `notifyApiResponse` resolves it to the operator's
 * language. The rows still on MNM's routes keep `notifySuccess(res.message)`.
 */
import notifyApiResponse from "@/utils/notifyApiResponse";
import StatusServices from "@/services/StatusService";
import PopupServices from "@/services/PopupServices";
import BlogServices from "@/services/BlogServices";
import FormServices from "@/services/FormServices";
import PriceListServices from "@/services/PriceListServices";

const DeleteModal = ({ id, ids, setIsCheck, category, title, useParamId }) => {
  const { isModalOpen, closeModal, setIsUpdate, deleteTargetType, setDeleteTargetType } = useContext(SidebarContext);
  const { setServiceId } = useToggleDrawer();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    // return notifyError("This option disabled for this option!");
    try {
      setIsSubmitting(true);
      if (location.pathname === "/products") {
        if (ids) {
          const res = await ProductServices.deleteManyProducts({
            ids: ids,
          });
          setIsUpdate(true);
          notifyApiResponse(res, true);
          setIsCheck([]);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await ProductServices.deleteProduct(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/coupons") {
        if (ids) {
          const res = await CouponServices.deleteManyCoupons({
            ids: ids,
          });
          setIsUpdate(true);
          notifyApiResponse(res, true);
          setIsCheck([]);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await CouponServices.deleteCoupon(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/categories" || category) {
        if (ids) {
          //  console.log('delete modal categorices',ids)
          const res = await CategoryServices.deleteManyCategory({
            ids: ids,
          });
          //  console.log('delete many category res',res)
          setIsUpdate(true);
          notifyApiResponse(res, true);
          setIsCheck([]);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        } else {
          if (id === undefined || !id) {
            notifyError("Please select a category first!");
            setIsSubmitting(false);
            return closeModal();
          }
          // console.log('delete modal open',id)
          const res = await CategoryServices.deleteCategory(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
          closeModal();
          setServiceId();
          setIsSubmitting(false);
        }
      } else if (
        location.pathname === `/categories/${useParamId}` ||
        category
      ) {
        // console.log('delete modal ')
        if (id === undefined || !id) {
          notifyError("Please select a category first!");
          setIsSubmitting(false);
          return closeModal();
        }

        const res = await CategoryServices.deleteCategory(id);
        setIsUpdate(true);
        notifyApiResponse(res, true);
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }

      if (location.pathname === "/customers") {
        const res = await CustomerServices.deleteMainCustomer(id);
        setIsUpdate(true);
        notifySuccess(res?.message?.he || res?.message || "Customer deleted successfully");
        setServiceId();
        closeModal();
        setIsSubmitting(false);
      }

      if (location.pathname === "/attributes") {
        if (ids) {
          const res = await AttributeServices.deleteManyAttribute({
            ids: ids,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await AttributeServices.deleteAttribute(id);
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (
        location.pathname === `/attributes/${location.pathname.split("/")[2]}`
      ) {
        if (ids) {
          const res = await AttributeServices.deleteManyChildAttribute({
            id: location.pathname.split("/")[2],
            ids: ids,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          setIsCheck([]);
          closeModal();
          setIsSubmitting(false);
        } else {
          // console.log("att value delete", id, location.pathname.split("/")[2]);

          const res = await AttributeServices.deleteChildAttribute({
            id: id,
            ids: location.pathname.split("/")[2],
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/our-staff") {
        const res = await AdminServices.deleteStaff(id);
        setIsUpdate(true);
        notifySuccess(res.message);
        setServiceId();
        closeModal();
        setIsSubmitting(false);
      }

      if (location.pathname === "/languages") {
        if (ids) {
          const res = await LanguageServices.deleteManyLanguage({
            ids: ids,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await LanguageServices.deleteLanguage(id);
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/currencies") {
        if (ids) {
          const res = await CurrencyServices.deleteManyCurrency({
            ids: ids,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await CurrencyServices.deleteCurrency(id);
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/deliveries") {
        if (deleteTargetType === "region") {
          const res = await RegionServices.deleteRegion(id);
          setIsUpdate(true);
          notifySuccess(res?.message || "Region deleted");
          setServiceId();
          setDeleteTargetType("delivery");
          closeModal();
          setIsSubmitting(false);
        } else if (ids) {
          const res = await DeliveryServices.deleteManyDelivery({
            ids: ids,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await DeliveryServices.deleteDelivery(id);
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/offers") {
        if (ids) {
          const res = await OfferServices.deleteManyOffer({
            ids: ids,
          });
          setIsUpdate(true);
          notifyApiResponse(res, true);
          setIsCheck([]);
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await OfferServices.deleteOffer(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/statuses") {
        if (ids) {
          console.log('ids: ', ids)
          const res = await StatusServices.deleteManyStatus({
            ids: ids,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await StatusServices.deleteStatus(id);
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/popups") {
        if (ids) {
          const res = await PopupServices.deleteManyPopups({
            ids: ids,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await PopupServices.deletePopup(id);
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/blogs") {
        if (ids) {
          const res = await BlogServices.deleteManyBlogs({
            ids: ids,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await BlogServices.deleteBlog(id);
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/forms/submissions") {
        if (ids) {
          const res = await FormServices.deleteManySubmissions({ ids });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        } else {
          const res = await FormServices.deleteSubmission(id);
          setIsUpdate(true);
          notifySuccess(res.message);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }

      if (location.pathname === "/price-lists") {
        // The server refuses this too (`catalogController.priceLists.guardDelete`).
        // Checking here as well is not redundant: it is the difference between the
        // operator being told before the modal acts and after.
        if (ids) {
          // Check if any of the selected price lists is default
          const priceLists = await PriceListServices.getAllPriceLists();
          const selectedPriceLists = priceLists.filter((pl) => ids.includes(pl._id));
          const hasDefault = selectedPriceLists.some((pl) => pl.isDefault);
          
          if (hasDefault) {
            notifyError("לא ניתן למחוק מחירון ברירת מחדל");
            setIsSubmitting(false);
            return;
          }

          const res = await PriceListServices.deleteManyPriceLists({
            ids: ids,
          });
          setIsUpdate(true);
          notifyApiResponse(res, true);
          setIsCheck([]);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        } else {
          // Check if the price list is default
          const priceList = await PriceListServices.getPriceListById(id);
          if (priceList?.isDefault) {
            notifyError("לא ניתן למחוק מחירון ברירת מחדל");
            setIsSubmitting(false);
            return;
          }

          const res = await PriceListServices.deletePriceList(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
          setServiceId();
          closeModal();
          setIsSubmitting(false);
        }
      }
      
    } catch (err) {
      const msg = err?.response?.data?.message;
      const messageText = typeof msg === "object" && msg !== null ? (msg.he || msg.en || msg) : (msg || err?.message);
      notifyError(messageText);
      setServiceId();
      setIsCheck([]);
      closeModal();
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { t } = useTranslation();

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
                <span>{t("DeleteModalH2")} <span className="text-red-500">{title}</span>?</span>
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
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("modalKeepBtn")}
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                {t("modalDeletBtn")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default React.memo(DeleteModal);
