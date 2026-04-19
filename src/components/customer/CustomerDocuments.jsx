// src/components/customer/CustomerDocuments.jsx
import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { Card, CardBody, Table, TableHeader, TableCell, TableContainer } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { BiFile } from "react-icons/bi";

// Internal import
import DocumentTypeBadges from "@/components/customer/DocumentTypeBadges";
import DocumentTable from "@/components/customer/DocumentTable";
import DateRangePagination from "@/components/customer/DateRangePagination";
import Loading from "@/components/preloader/Loading";
import DropdownMenu from "@/components/menu/DropdownMenu";
import DocumentIssueModal from "@/components/modal/DocumentIssueModal";
import InvoiceReceiptForm from "@/components/customer/InvoiceReceiptForm";
import InvoiceForm from "@/components/customer/InvoiceForm";
import ReceiptForm from "@/components/customer/ReceiptForm";
import DeliveryNoteForm from "@/components/customer/DeliveryNoteForm";
import CreditInvoiceForm from "@/components/customer/CreditInvoiceForm";
import { getDateRangeByPage } from "@/utils/dateUtils";
import { SidebarContext } from "@/context/SidebarContext";

/**
 * קומפוננטת מסמכים מעודכנת - משיכת מסמכים מריווחית
 * כוללת: badges לסינון לפי סוג, טבלה, ופג'יניישן של 6 חודשים
 */
const CustomerDocuments = ({
    customer,
    customerId,
    externalCustomerId,
    rivhitDocuments,
    documentsLoading,
    documentsError,
    onDocumentsFetch
}) => {
    const { t } = useTranslation();
    const { setIsUpdate } = useContext(SidebarContext);

    // סטייט לסינון לפי סוג מסמך
    const [selectedDocumentType, setSelectedDocumentType] = useState("all");

    // סטייט לפג'יניישן - כל עמוד הוא 6 חודשים
    const [currentDatePage, setCurrentDatePage] = useState(0);

    // שימוש ב-ref כדי לעקוב אחרי אם זה הטעינה הראשונה
    const isFirstRender = useRef(true);

    // סטייט למודאל הפקת מסמכים
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDocumentType, setModalDocumentType] = useState(null);

    // משיכת מסמכים כאשר משתנה העמוד (רק אם זה לא טעינה ראשונית)
    useEffect(() => {
        // מדלגים על הטעינה הראשונה כי CustomerPage כבר עושה fetch אוטומטי
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (onDocumentsFetch) {
            const range = getDateRangeByPage(currentDatePage);
            onDocumentsFetch(range.from, range.to);
        }
    }, [currentDatePage]);

    // חישוב המסמכים המוצגים לפי הסינון הנבחר
    // השרת מחזיר כבר את קבוצת "all" עם כל המסמכים, אז פשוט משתמשים בה
    const displayedDocuments = useMemo(() => {
        if (!rivhitDocuments?.groups || !Array.isArray(rivhitDocuments.groups)) {
            return [];
        }

        // מציאת הקבוצה הנבחרת (כולל "all" שהשרת מחזיר)
        // השרת מחזיר document_type כ-string "all" או מספר
        const typeToFind = selectedDocumentType || "all";
        const selectedGroup = rivhitDocuments.groups.find(
            group => String(group.document_type) === String(typeToFind)
        );

        // אם לא נמצאה קבוצה, נחזיר מערך ריק
        if (!selectedGroup) {
            return [];
        }

        // בדיקה שהמסמכים הם מערך תקין
        if (!Array.isArray(selectedGroup.documents)) {
            return [];
        }

        // החזרת המסמכים מהקבוצה הנבחרת
        return selectedGroup.documents.map(doc => ({
            ...doc,
            document_type_name: doc.document_type_name || selectedGroup.document_type_name
        }));
    }, [rivhitDocuments, selectedDocumentType]);

    // חישוב מספר העמודים המקסימלי (עד 5 שנים אחורה = 10 עמודים)
    const maxPages = 10;
    const totalPages = maxPages;

    // טיפול בשינוי עמוד תאריכים
    const handleDatePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentDatePage(newPage);
            // איפוס הסינון לסוג מסמך כאשר משנים עמוד
            // setSelectedDocumentType("all");
        }
    };

    // טיפול בשינוי סוג מסמך
    const handleTypeSelect = (type) => {
        setSelectedDocumentType(type);
    };

    // פונקציה לפתיחת המודאל לפי סוג מסמך
    const handleOpenModal = (type) => {
        setModalDocumentType(type);
        setIsModalOpen(true);
    };

    // סגירת המודאל ורענון המסמכים
    const handleModalClose = (result) => {
        setIsModalOpen(false);
        setModalDocumentType(null);

        // אם הפקת המסמך הצליחה, נרענן את רשימת המסמכים
        if (result && onDocumentsFetch) {
            const range = getDateRangeByPage(currentDatePage);
            onDocumentsFetch(range.from, range.to);
            setIsUpdate(true);
        }
    };

    return (
        <div className="my-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <BiFile size={24} className="text-mainColor" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {t("Documents")}
                                </h2>
                            </div>

                            {/* כפתור הפקת מסמך - רק אם יש externalCustomerId */}
                            <div className="relative">
                                <DropdownMenu
                                    addMenu
                                    title={t("IssueDocument")}
                                    options={[
                                        {
                                            label: t("InvoiceReceipt") || "חשבונית מס קבלה",
                                            onClick: () => handleOpenModal('invoice-receipt'),
                                        },
                                        {
                                            label: t("Invoice") || "חשבונית מס",
                                            onClick: () => handleOpenModal('invoice'),
                                        },
                                        {
                                            label: t("Receipt") || "קבלה",
                                            onClick: () => handleOpenModal('receipt'),
                                        },
                                        {
                                            label: t("DeliveryNoteHyphen") || "תעודת-משלוח",
                                            onClick: () => handleOpenModal('delivery-note-hyphen'),
                                        },
                                        {
                                            label: t("CreditInvoice") || "חשבונית זיכוי",
                                            onClick: () => handleOpenModal('credit-invoice'),
                                        },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* הודעת שגיאה */}
                        {documentsError && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {documentsError}
                                </p>
                            </div>
                        )}

                        {/* בדיקה אם יש externalCustomerId (נמצא על תת-לקוח) */}
                        {!externalCustomerId && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    {t("CustomerNotLinkedToRivhit")}
                                </p>
                            </div>
                        )}

                        {/* Loading State */}
                        {documentsLoading && (
                            <div className="flex justify-center py-8">
                                <Loading loading={documentsLoading} />
                            </div>
                        )}

                        {/* תוכן ראשי - רק אם יש מסמכים או שהטעינה הסתיימה */}
                        {!documentsLoading && rivhitDocuments && (
                            <>
                                {/* Badges לסינון לפי סוג מסמך */}
                                {rivhitDocuments.groups && rivhitDocuments.groups.length > 0 && (
                                    <DocumentTypeBadges
                                        groups={rivhitDocuments.groups}
                                        selectedType={selectedDocumentType}
                                        onTypeSelect={handleTypeSelect}
                                    />
                                )}

                                {/* טבלת מסמכים */}
                                {displayedDocuments.length > 0 ? (
                                    <TableContainer>
                                        <Table>
                                            <TableHeader>
                                                <tr>
                                                    <TableCell className="text-center">
                                                        {t("DocumentType")}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {t("DocumentNumber")}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {t("Customer")}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {t("Date")}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {t("Time")}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {t("Comments")}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {t("Actions")}
                                                    </TableCell>
                                                </tr>
                                            </TableHeader>
                                            <DocumentTable documents={displayedDocuments} />
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <div className="text-center py-8">
                                        <BiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {t("NoDocumentsFound")}
                                        </p>
                                    </div>
                                )}

                                {/* פג'יניישן לפי תאריכים */}
                                {rivhitDocuments && (
                                    <DateRangePagination
                                        currentPage={currentDatePage}
                                        onPageChange={handleDatePageChange}
                                        totalPages={totalPages}
                                    />
                                )}
                            </>
                        )}

                        {/* Empty State - אם אין מסמכים ולא בטעינה */}
                        {!documentsLoading &&
                            !rivhitDocuments &&
                            !documentsError &&
                            externalCustomerId && (
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

            {/* מודאל הפקת מסמכים */}
            {isModalOpen && (
                <DocumentIssueModal
                    isOpen={isModalOpen}
                    onClose={() => handleModalClose(null)}
                    documentType={modalDocumentType}
                >
                    {modalDocumentType === 'invoice-receipt' && (
                        <InvoiceReceiptForm
                            customer={customer}
                            onSuccess={handleModalClose}
                        />
                    )}
                    {modalDocumentType === 'invoice' && (
                        <InvoiceForm
                            customer={customer}
                            onSuccess={handleModalClose}
                        />
                    )}
                    {modalDocumentType === 'receipt' && (
                        <ReceiptForm
                            customer={customer}
                            externalCustomerId={externalCustomerId}
                            rivhitDocuments={rivhitDocuments}
                            onSuccess={handleModalClose}
                        />
                    )}
                    {modalDocumentType === 'delivery-note' && (
                        <DeliveryNoteForm
                            customer={customer}
                            onSuccess={handleModalClose}
                            variant="default"
                        />
                    )}
                    {modalDocumentType === 'delivery-note-hyphen' && (
                        <DeliveryNoteForm
                            customer={customer}
                            onSuccess={handleModalClose}
                            variant="hyphen"
                        />
                    )}
                    {modalDocumentType === 'credit-invoice' && (
                        <CreditInvoiceForm
                            customer={customer}
                            externalCustomerId={externalCustomerId}
                            rivhitDocuments={rivhitDocuments}
                            onSuccess={handleModalClose}
                        />
                    )}
                </DocumentIssueModal>
            )}
        </div>
    );
};

export default CustomerDocuments;