// src/components/customer/DocumentTable.jsx
import React from "react";
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiExternalLink } from "react-icons/fi";

// Internal import
import { formatDate } from "@/utils/dateUtils";
import { notifyError } from "@/utils/toast";

/**
 * קומפוננטת טבלה להצגת מסמכים
 * מציגה: שם המסמך, מספר, תאריך, ופרטים נוספים
 */
const DocumentTable = ({ documents }) => {
    const { t } = useTranslation();

    // פונקציה לפתיחת מסמך בכרטיסייה חדשה
    const handleViewDocument = (url) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            notifyError(t("DocumentLinkNotFound"));
        }
    };

    if (!documents || documents.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {t("NoDocumentsFound")}
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    return (
        <TableBody>
            {documents.map((doc, index) => {
                const hasUrl = doc.document_link && doc.document_link.trim() !== '';

                return (
                    <TableRow key={doc.id || `${doc.document_type}_${doc.document_number}_${index}`}>
                        {/* שם סוג המסמך */}
                        <TableCell className="text-center">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {doc.document_type_name || `סוג ${doc.document_type}`}
                            </span>
                        </TableCell>

                        {/* מספר המסמך */}
                        <TableCell className="text-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {doc.document_number || '-'}
                            </span>
                        </TableCell>

                        {/* לקוח */}
                        <TableCell className="text-center">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {doc.customer_firstname || doc.customer_name || '-'}
                            </span>
                        </TableCell>

                        {/* תאריך המסמך */}
                        <TableCell className="text-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(doc.document_date)}
                            </span>
                        </TableCell>

                        {/* שעה (אם קיימת) */}
                        <TableCell className="text-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {doc.document_time || '-'}
                            </span>
                        </TableCell>

                        {/* הערות - עם קיצוץ אוטומטי אם ארוך מדי */}
                        <TableCell className="text-center">
                            <span
                                className="text-sm text-gray-600 dark:text-gray-400 inline-block max-w-[25vw] overflow-hidden text-ellipsis whitespace-nowrap"
                                title={doc.comments || doc.comment || ''}
                            >
                                {doc.comments || doc.comment || '-'}
                            </span>
                        </TableCell>

                        {/* כפתור צפייה */}
                        <TableCell className="text-center">
                            <button
                                type="button"
                                onClick={() => handleViewDocument(doc.document_link)}
                                className={`
                                    inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                                    ${hasUrl
                                        ? 'text-mainColor dark:text-mainColor-light border border-mainColor dark:border-mainColor-light hover:bg-mainColor dark:hover:bg-mainColor-light hover:text-white'
                                        : 'text-gray-400 border border-gray-300 cursor-not-allowed opacity-50'
                                    }
                                `}
                            >
                                <FiExternalLink size={14} />
                                <span>{t("View")}</span>
                            </button>
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    );
};

export default DocumentTable;