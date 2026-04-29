// src/hooks/useImport.js
import { useContext, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { applyDefaultIsVatFreeForProductImportRow } from "@/utils/productFruitsVegetablesVat";

/**
 * Hook for importing products from Excel files
 * Simplified - just reads Excel and sends to server, server does all processing
 */
const useImport = () => {
    const { t } = useTranslation();

    const [selectedFile, setSelectedFile] = useState([]);
    const [importResults, setImportResults] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importStage, setImportStage] = useState(null); // 'uploading', 'processing', 'completed'
    const fileInputRef = useRef(null);

    const { setIsUpdate, setLoading } = useContext(SidebarContext);

    /**
     * Handle file selection and processing
     * Just read the Excel file and convert to JSON - let the server do the rest!
     */
    const handleSelectFile = (e) => {
        e.preventDefault();

        const file = e.target?.files[0];
        if (!file) return;

        // Show modal immediately
        setIsImportModalOpen(true);
        setImportStage('uploading');
        setImportResults({ total: 0, success: 0, failure: 0, errors: [] });

        const fileReader = new FileReader();

        try {
            if (
                file.type.includes("spreadsheetml") ||
                file.name.endsWith(".xls") ||
                file.name.endsWith(".xlsx")
            ) {
                fileReader.onload = (event) => {
                    try {
                        const data = new Uint8Array(event.target.result);
                        const workbook = XLSX.read(data, { type: "array" });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet);

                        if (!json || json.length === 0) {
                            setImportStage('completed');
                            setImportResults({
                                total: 0,
                                success: 0,
                                failure: 0,
                                errors: []
                            });
                            notifyError(t('EmptyFile'));
                            return;
                        }

                        // Just save the raw data - the server will process everything!
                        setSelectedFile(json);
                        setImportStage(null);
                        setImportResults({
                            total: json.length,
                            success: 0,
                            failure: 0,
                            errors: []
                        });

                        notifySuccess(t('FileProcessedSuccessfully'));
                    } catch (error) {
                        console.error('Error reading Excel file:', error);
                        setImportStage('completed');
                        setImportResults({
                            total: 0,
                            success: 0,
                            failure: 1,
                            errors: [{
                                row: 0,
                                product: 'File Error',
                                barcode: '',
                                message: error.message
                            }]
                        });
                        notifyError(t('FileProcessingError'));
                    }
                };
                fileReader.readAsArrayBuffer(file);
            } else {
                setIsImportModalOpen(false);
                notifyError(t('InvalidFileType'));
            }
        } catch (error) {
            setIsImportModalOpen(false);
            notifyError(t('FileProcessingError'));
            console.error('Error in file selection:', error);
        }
    };

    /**
     * Upload products to server - server does all the processing
     */
    const handleUploadMultiple = async () => {
        if (selectedFile.length === 0) {
            notifyError(t('NoFileSelected'));
            return;
        }

        setLoading(true);
        setImportStage('uploading');

        try {
            const products = selectedFile.map(applyDefaultIsVatFreeForProductImportRow);
            const res = await ProductServices.addAllProducts({ products });

            const summary = res.summary || {};
            const successCount = summary.succeeded || 0;
            const failureCount = summary.failed || 0;
            const totalCount = summary.total || selectedFile.length;

            const errors = (res.errors || []).map((error) => {
                const errorMessage = typeof error.error === 'object'
                    ? error.error.he || error.error.en || JSON.stringify(error.error)
                    : error.error || 'שגיאה לא ידועה';

                return {
                    row: error.index || 0,
                    product: error.product || '',
                    itemNumber: error.itemNumber || '',
                    barcode: error.barcode || '',
                    message: errorMessage
                };
            });

            setImportResults({
                success: successCount,
                failure: failureCount,
                total: totalCount,
                errors: errors
            });
            setImportStage('completed');
            setIsUpdate(true);

            const message = res.message?.he || res.message?.en || res.message || t('ImportCompleted');
            if (failureCount === 0) {
                notifySuccess(message);
            } else if (successCount === 0) {
                notifyError(message);
            } else {
                notifySuccess(message);
            }

        } catch (err) {
            console.error('Error uploading products:', err);

            const errorData = err?.response?.data || {};
            const summary = errorData.summary || {};
            const errors = (errorData.errors || []).map((error) => {
                const errorMessage = typeof error.error === 'object'
                    ? error.error.he || error.error.en || JSON.stringify(error.error)
                    : error.error || err.message || 'שגיאה לא ידועה';

                return {
                    row: error.index || 0,
                    product: error.product || '',
                    itemNumber: error.itemNumber || '',
                    barcode: error.barcode || '',
                    message: errorMessage
                };
            });

            if (errors.length === 0) {
                errors.push({
                    row: 0,
                    product: '',
                    itemNumber: '',
                    barcode: '',
                    message: err.message || 'שגיאה לא ידועה'
                });
            }

            setImportResults({
                success: summary.succeeded || 0,
                failure: summary.failed || selectedFile.length,
                total: summary.total || selectedFile.length,
                errors: errors
            });
            setImportStage('completed');

            const message = errorData.message?.he || errorData.message?.en || err.message || t('ImportFailed');
            notifyError(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Remove selected file and reset state
     */
    const handleRemoveSelectFile = () => {
        setSelectedFile([]);
        setImportResults(null);
        setImportStage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    /**
     * Close import modal and reset state
     */
    const handleCloseImportModal = () => {
        handleRemoveSelectFile();
        setIsImportModalOpen(false);
    };

    return {
        handleSelectFile,
        handleUploadMultiple,
        handleRemoveSelectFile,
        fileInputRef,
        importResults,
        isImportModalOpen,
        importStage,
        handleCloseImportModal,
    };
};

export default useImport;
