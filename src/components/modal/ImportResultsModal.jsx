// src/components/modal/ImportResultsModal.jsx
import React from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button, Table, TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { MdInfoOutline, MdCheckCircle, MdErrorOutline } from "react-icons/md";
import spinnerLoadingImage from "@/assets/img/spinner.gif";

const ImportResultsModal = ({ isOpen, onClose, results, isLoading, stage, onUpload }) => {
    const { t } = useTranslation();

    const successCount = results?.success || 0;
    const failureCount = results?.failure || 0;
    const errors = results?.errors || [];
    const totalCount = results?.total || 0;

    const hasFailures = failureCount > 0;
    const hasSuccess = successCount > 0;
    const isProcessing = isLoading || stage === 'processing' || stage === 'uploading';
    const isCompleted = stage === 'completed' && !isLoading;
    const isReady = !stage && !isLoading && totalCount > 0; // File processed and ready for upload

    const escapeCsvCell = (value) => {
        const text = value === undefined || value === null ? "" : String(value);
        if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
        return text;
    };

    const handleDownloadErrorsCsv = () => {
        if (!errors.length) return;
        const header = ["row", "product", "itemNumber", "barcode", "error"];
        const lines = [header.join(",")];
        errors.forEach((error) => {
            lines.push([
                escapeCsvCell(error.row || ""),
                escapeCsvCell(error.product || ""),
                escapeCsvCell(error.itemNumber || ""),
                escapeCsvCell(error.barcode || ""),
                escapeCsvCell(error.message || "")
            ].join(","));
        });
        const content = `\uFEFF${lines.join("\n")}`;
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `import-errors-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getIcon = () => {
        if (hasFailures) {
            return <MdErrorOutline className="h-7 w-7 text-red-500 dark:text-red-400" />;
        } else if (hasSuccess) {
            return <MdCheckCircle className="h-7 w-7 text-green-500 dark:text-green-400" />;
        } else {
            return <MdInfoOutline className="h-7 w-7 text-blue-500 dark:text-blue-400" />;
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={isProcessing ? () => { } : onClose}
            className="relative z-50"
            dir="rtl"
        >
            <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                {getIcon()}
                                {t("ImportResults")}
                            </DialogTitle>
                            {!isProcessing && (
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <IoClose className="h-6 w-6" />
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                            {/* Processing State */}
                            {isProcessing && (
                                <div className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <img
                                            src={spinnerLoadingImage}
                                            alt="Loading"
                                            width={48}
                                            height={48}
                                            className="inline-block saturate-0"
                                        />
                                        <div>
                                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                {stage === 'uploading' ? t("UploadingFile") : t("Processing")}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                {stage === 'uploading' ? t("UploadingFileDescription") : t("ProcessingDescription")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ready State - File processed and ready for upload */}
                            {isReady && (
                                <div className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <MdCheckCircle className="text-5xl text-green-500 dark:text-green-400" />
                                        <div>
                                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                {t("FileReadyForUpload")}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                {t("FileReadyDescription", { count: totalCount })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summary Statistics - Only show when completed */}
                            {isCompleted && (
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalCount}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t("TotalRows")}</div>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{successCount}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t("Successful")}</div>
                                        </div>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{failureCount}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t("Failed")}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success Message - Only show when completed */}
                            {isCompleted && hasSuccess && failureCount === 0 && (
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-2 text-right">
                                        <MdCheckCircle className="text-green-500 dark:text-green-400 text-xl shrink-0" />
                                        <p className="text-green-700 dark:text-green-300 font-medium">
                                            {t("AllItemsImportedSuccessfully")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Errors Section - Only show when completed */}
                            {isCompleted && errors.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3 text-right">
                                        <MdErrorOutline className="text-red-500 dark:text-red-400 text-xl shrink-0" />
                                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                                            {t("ErrorsDetails")} ({errors.length})
                                        </h3>
                                        <button
                                            onClick={handleDownloadErrorsCsv}
                                            className="mr-auto px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            {t("DownloadErrorsCsv")}
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800 max-h-96">
                                        <Table>
                                            <thead className="bg-red-50 dark:bg-red-900/20 sticky top-0">
                                                <TableRow>
                                                    <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Row")}</TableCell>
                                                    <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("ProductName")}</TableCell>
                                                    <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("ProductItemNumber")}</TableCell>
                                                    <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Barcode")}</TableCell>
                                                    <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Error")}</TableCell>
                                                </TableRow>
                                            </thead>
                                            <TableBody>
                                                {errors.map((error, index) => (
                                                    <TableRow key={index} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                                                        <TableCell className="text-right">
                                                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm font-medium">
                                                                {error.row || index + 1}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                {error.product || '-'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                                                                {error.itemNumber || '-'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                                                                {error.barcode || '-'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                                                <MdErrorOutline className="text-sm shrink-0" />
                                                                {error.message || error}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {/* No data message - Only show when completed */}
                            {isCompleted && totalCount === 0 && (
                                <div className="text-center py-12">
                                    <MdInfoOutline className="text-5xl text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">{t("NoDataToImport")}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-600">
                            {isProcessing ? (
                                <Button disabled={true} type="button" className="px-6 py-2 h-auto">
                                    <img
                                        src={spinnerLoadingImage}
                                        alt="Loading"
                                        width={20}
                                        height={20}
                                        className="inline-block saturate-0 ml-2"
                                    />
                                    <span className="font-serif font-light">{t("Processing")}</span>
                                </Button>
                            ) : isReady ? (
                                <>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {t("Cancel")}
                                    </button>
                                    <button
                                        onClick={onUpload}
                                        className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                    >
                                        {t("UploadToSystem")}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t("Close")}
                                </button>
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ImportResultsModal;
