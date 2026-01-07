// src/components/customer/CustomerDocuments.jsx
import React, { useState } from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { BiFile } from "react-icons/bi";

// Internal import
import Uploader from "@/components/image-uploader/Uploader";
import CustomerServices from "@/services/CustomerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import DocumentCard from "@/components/customer/DocumentCard";

const CustomerDocuments = ({ customer, customerId }) => {
    const { t } = useTranslation();
    // המרת documents לפורמט שהשרת מצפה (מערך של אובייקטים עם name, url ו-_id)
    const initialDocuments = customer?.documents || [];
    const formattedInitialDocuments = initialDocuments.map((doc) => {
        if (typeof doc === "string") {
            return {
                name: doc.split("/").pop(),
                url: doc
            };
        }
        return {
            name: doc.name || doc.url?.split("/").pop() || "document",
            url: doc.url || doc.link || doc,
            _id: doc._id
        };
    });
    const [documents, setDocuments] = useState(formattedInitialDocuments);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleDocumentsChange = (newDocuments) => {
        // המרת לפורמט שהשרת מצפה (מערך של אובייקטים עם name, url ו-_id)
        // Uploader מחזיר אובייקטים עם link ו-name כש-onlyImages=false
        if (Array.isArray(newDocuments)) {
            const formattedDocs = newDocuments.map((doc) => {
                if (typeof doc === "string") {
                    return {
                        name: doc.split("/").pop(),
                        url: doc
                    };
                }
                // אם יש link (מהעלאה חדשה), נמיר ל-url
                if (doc.link) {
                    return {
                        name: doc.name || doc.link.split("/").pop(),
                        url: doc.link,
                        _id: doc._id
                    };
                }
                // אם יש url (מהשרת), נשמור כמו שהוא
                if (doc.url) {
                    return {
                        name: doc.name || doc.url.split("/").pop(),
                        url: doc.url,
                        _id: doc._id
                    };
                }
                return {
                    name: doc.name || "document",
                    url: doc.url || doc.link || doc,
                    _id: doc._id
                };
            });
            setDocuments(formattedDocs);
        } else if (newDocuments && typeof newDocuments === "object" && !Array.isArray(newDocuments)) {
            // אם זה אובייקט יחיד (לא מערך)
            const doc = newDocuments;
            const formatted = doc.link
                ? {
                    name: doc.name || doc.link.split("/").pop(),
                    url: doc.link,
                    _id: doc._id
                }
                : {
                    name: doc.name || doc.url?.split("/").pop() || "document",
                    url: doc.url || doc.link || "",
                    _id: doc._id
                };
            setDocuments([formatted]);
        } else {
            setDocuments([]);
        }
    };

    // שמירה אוטומטית של מסמכים אחרי העלאה
    const handleUploadComplete = async (uploadedFiles) => {
        try {
            setIsUpdating(true);
            // המרת הקבצים שהועלו לפורמט הנדרש
            const newDocs = Array.isArray(uploadedFiles)
                ? uploadedFiles.map((file) => ({
                    name: file.name || (typeof file === "string" ? file.split("/").pop() : file.link?.split("/").pop() || "document"),
                    url: typeof file === "string" ? file : (file.link || file.url || "")
                }))
                : [{
                    name: uploadedFiles.name || (typeof uploadedFiles === "string" ? uploadedFiles.split("/").pop() : uploadedFiles.link?.split("/").pop() || "document"),
                    url: typeof uploadedFiles === "string" ? uploadedFiles : (uploadedFiles.link || uploadedFiles.url || "")
                }];

            // עדכון המסמכים עם המסמכים החדשים
            const updatedDocuments = [...documents, ...newDocs];

            // שמירה אוטומטית לשרת
            const customerData = {
                documents: updatedDocuments,
            };
            const res = await CustomerServices.updateCustomerByAdmin(customerId, customerData);

            // עדכון המסמכים מהתשובה של השרת
            if (res.customer?.documents) {
                setDocuments(res.customer.documents);
            } else {
                setDocuments(updatedDocuments);
            }

            notifyApiResponse(res, true);
        } catch (err) {
            notifyApiResponse(err, false);
            // במקרה של שגיאה, נחזיר את המסמכים למצב הקודם
            setDocuments(documents);
        } finally {
            setIsUpdating(false);
        }
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
                                folder="customer-documents-mnm"
                                multiple={true}
                                onlyImages={false}
                                hideAfterUpload={true}
                                onUploadComplete={handleUploadComplete}
                            />
                            {isUpdating && (
                                <div className="mt-2 text-sm text-mainColor">
                                    {t("Saving")}...
                                </div>
                            )}
                        </div>

                        {/* Documents List */}
                        {documents && documents.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    {t("UploadedDocuments")} ({documents.length})
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                    {documents.map((doc) => (
                                        <DocumentCard
                                            key={doc._id}
                                            document={doc}
                                            customerId={customerId}
                                            allDocuments={documents}
                                            onDocumentsUpdate={setDocuments}
                                        />
                                    ))}
                                </div>
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