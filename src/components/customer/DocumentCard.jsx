// src/components/customer/DocumentCard.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BiTrash } from "react-icons/bi";
import { FiFile, FiEye } from "react-icons/fi";

// Internal import
import CustomerServices from "@/services/CustomerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import ConfirmModal from "@/components/modal/ConfirmModal";

const DocumentCard = ({ document, customerId, allDocuments, onDocumentsUpdate }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState(document.name || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const docUrl = document.url || "";
    const docName = document.name || docUrl.split("/").pop() || "Document";

    const handleViewDocument = () => {
        window.open(docUrl, "_blank");
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditingName(docName);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingName(docName);
    };

    const handleSaveName = async () => {
        if (!editingName.trim()) {
            handleCancelEdit();
            return;
        }

        if (editingName.trim() === docName) {
            handleCancelEdit();
            return;
        }

        try {
            setIsUpdating(true);
            const updatedDocuments = allDocuments.map((doc) =>
                doc._id === document._id ? { ...doc, name: editingName.trim() } : doc
            );

            // שמירה אוטומטית לשרת
            const customerData = {
                documents: updatedDocuments,
            };
            const res = await CustomerServices.updateCustomerByAdmin(customerId, customerData);

            // עדכון המסמכים מהתשובה של השרת
            if (res.customer?.documents) {
                onDocumentsUpdate(res.customer.documents);
            } else {
                onDocumentsUpdate(updatedDocuments);
            }

            notifyApiResponse(res, true);
            setIsEditing(false);
        } catch (err) {
            notifyApiResponse(err, false);
            handleCancelEdit();
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveDocument = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteDocument = async () => {
        try {
            setIsUpdating(true);
            const updatedDocuments = allDocuments.filter((doc) => doc._id !== document._id);

            // שמירה אוטומטית לשרת
            const customerData = {
                documents: updatedDocuments,
            };
            const res = await CustomerServices.updateCustomerByAdmin(customerId, customerData);

            // עדכון המסמכים מהתשובה של השרת
            if (res.customer?.documents) {
                onDocumentsUpdate(res.customer.documents);
            } else {
                onDocumentsUpdate(updatedDocuments);
            }

            notifyApiResponse(res, true);
            setIsDeleteModalOpen(false);
        } catch (err) {
            notifyApiResponse(err, false);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <div className="group relative bg-white dark:bg-gray-800 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-mainColor dark:hover:border-mainColor transition-all duration-200 flex flex-col justify-between">
                {/* File Name */}
                <div className="mb-2">
                    <div className="flex items-center gap-1.5">
                        <div className="p-[9px] bg-mainColor/10 rounded-md">
                            <FiFile className="w-4 h-4 text-mainColor shrink-0" />
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSaveName();
                                    } else if (e.key === "Escape") {
                                        handleCancelEdit();
                                    }
                                }}
                                autoFocus
                                disabled={isUpdating}
                                className="h-8 mb-2 flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-mainColor focus:outline-none focus:border-mainColor/70 disabled:opacity-50"
                            />
                        ) : (
                            <p
                                onClick={handleStartEdit}
                                className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 cursor-pointer hover:text-mainColor transition-colors"
                            >
                                {docName}
                            </p>
                        )}
                    </div>
                    <p dir="ltr" className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {docUrl}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5">
                    <button
                        onClick={handleViewDocument}
                        disabled={isEditing || isUpdating}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-mainColor hover:bg-mainColor/90 text-white rounded-md transition-colors duration-200 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiEye className="w-4 h-4 mt-px" />
                        {t("View")}
                    </button>
                    <button
                        onClick={handleRemoveDocument}
                        disabled={isEditing || isUpdating}
                        className="px-2 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md transition-colors duration-200 border border-red-200 dark:border-red-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <BiTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteDocument}
                title={t("DeleteDocument")}
                description={t("AreYouSureDeleteDocument")}
                icon="danger"
                confirmText={t("Delete")}
                cancelText={t("Cancel")}
                isLoading={isUpdating}
            />
        </>
    );
};

export default DocumentCard;

