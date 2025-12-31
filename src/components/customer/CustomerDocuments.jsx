// src/components/customer/CustomerDocuments.jsx
import React, { useState } from "react";
import { Card, CardBody, Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { BiFile, BiDownload, BiTrash } from "react-icons/bi";
import { FiFile } from "react-icons/fi";

// Internal import
import Uploader from "@/components/image-uploader/Uploader";
import CustomerServices from "@/services/CustomerServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const CustomerDocuments = ({ customer, customerId }) => {
    const { t } = useTranslation();
    // המרת documents לפורמט שהשרת מצפה (מערך של אובייקטים עם name ו-url)
    const initialDocuments = customer?.documents || [];
    const formattedInitialDocuments = initialDocuments.map((doc) => {
        if (typeof doc === "string") {
            return { name: doc.split("/").pop(), url: doc };
        }
        return { name: doc.name || doc.url?.split("/").pop() || "document", url: doc.url || doc.link || doc };
    });
    const [documents, setDocuments] = useState(formattedInitialDocuments);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleDocumentsChange = (newDocuments) => {
        // המרת לפורמט שהשרת מצפה (מערך של אובייקטים עם name ו-url)
        // Uploader מחזיר אובייקטים עם link ו-name כש-onlyImages=false
        if (Array.isArray(newDocuments)) {
            const formattedDocs = newDocuments.map((doc) => {
                if (typeof doc === "string") {
                    return { name: doc.split("/").pop(), url: doc };
                }
                // אם יש link (מהעלאה חדשה), נמיר ל-url
                if (doc.link) {
                    return { name: doc.name || doc.link.split("/").pop(), url: doc.link };
                }
                // אם יש url (מהשרת), נשמור כמו שהוא
                if (doc.url) {
                    return { name: doc.name || doc.url.split("/").pop(), url: doc.url };
                }
                return { name: doc.name || "document", url: doc.url || doc.link || doc };
            });
            setDocuments(formattedDocs);
        } else if (newDocuments && typeof newDocuments === "object" && !Array.isArray(newDocuments)) {
            // אם זה אובייקט יחיד (לא מערך)
            const doc = newDocuments;
            const formatted = doc.link
                ? { name: doc.name || doc.link.split("/").pop(), url: doc.link }
                : { name: doc.name || doc.url?.split("/").pop() || "document", url: doc.url || doc.link || "" };
            setDocuments([formatted]);
        } else {
            setDocuments([]);
        }
    };

    const handleSaveDocuments = async () => {
        try {
            setIsUpdating(true);
            const customerData = {
                ...customer,
                documents: documents,
            };
            const res = await CustomerServices.updateCustomerByAdmin(customerId, customerData);
            notifySuccess(res.message?.he || res.message || t("DocumentsUpdatedSuccessfully"));
        } catch (err) {
            notifyError(err?.response?.data?.message?.he || err?.response?.data?.message || err?.message || t("UpdateFailed"));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDownload = (url, name) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = name || "document";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRemoveDocument = (index) => {
        const updatedDocuments = documents.filter((_, i) => i !== index);
        setDocuments(updatedDocuments);
    };

    const getFileIcon = (doc) => {
        const url = doc.url || doc.link || (typeof doc === "string" ? doc : "");
        if (!url) return <FiFile className="w-12 h-12 text-gray-400" />;
        const extension = url.split(".").pop()?.toLowerCase();
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
        if (imageExtensions.includes(extension)) {
            return <img src={url} alt="Document" className="w-12 h-12 object-cover rounded" />;
        }
        return <FiFile className="w-12 h-12 text-gray-400" />;
    };

    return (
        <div className="mt-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <BiFile size={24} className="text-mainColor" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t("Documents")}
                            </h2>
                        </div>

                        {/* Upload Section */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t("UploadDocuments")}
                            </label>
                            <Uploader
                                imageUrl={documents}
                                setImageUrl={handleDocumentsChange}
                                folder="customer-documents"
                                multiple={true}
                                onlyImages={false}
                            />
                        </div>

                        {/* Documents List */}
                        {documents && documents.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    {t("UploadedDocuments")} ({documents.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {documents.map((doc, index) => {
                                        const docUrl = doc.url || doc.link || "";
                                        const docName = doc.name || docUrl.split("/").pop() || `Document ${index + 1}`;
                                        return (
                                            <div
                                                key={index}
                                                className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    {getFileIcon(doc)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {docName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {docUrl}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="small"
                                                        layout="outline"
                                                        onClick={() => handleDownload(docUrl, docName)}
                                                        className="flex-1"
                                                    >
                                                        <BiDownload className="w-4 h-4 mr-1" />
                                                        {t("Download")}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        layout="outline"
                                                        onClick={() => handleRemoveDocument(index)}
                                                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                                    >
                                                        <BiTrash className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        {documents.length > 0 && (
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    onClick={handleSaveDocuments}
                                    disabled={isUpdating}
                                    className="w-full md:w-auto"
                                >
                                    {isUpdating ? t("Saving") + "..." : t("SaveDocuments")}
                                </Button>
                            </div>
                        )}

                        {/* Empty State */}
                        {(!documents || documents.length === 0) && (
                            <div className="text-center py-8">
                                <BiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t("NoDocumentsUploaded")}
                                </p>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default CustomerDocuments;

