// src/components/modal/BarcodeScannerModal.jsx
import React, { useState, useEffect, lazy, Suspense } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { IoClose, IoCameraOutline } from 'react-icons/io5';
import { useTranslation } from "react-i18next";
import ProductServices from "@/services/ProductServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

// Dynamic import של Scanner כדי למנוע בעיות עם findDOMNode
const Scanner = lazy(() => import("@yudiel/react-qr-scanner").then(module => ({ default: module.Scanner })));

const BarcodeScannerModal = ({ isOpen, onClose, onProductFound, onProductNotFound }) => {
    const { t } = useTranslation();
    const [scannedBarcode, setScannedBarcode] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [productNotFound, setProductNotFound] = useState(false);
    const [shouldLoadScanner, setShouldLoadScanner] = useState(false);

    // איפוס מצבים כשהמודל נסגר
    useEffect(() => {
        if (!isOpen) {
            setScannedBarcode(null);
            setIsLoading(false);
            setError(null);
            setProductNotFound(false);
            setShouldLoadScanner(false);
        } else {
            // טוען את ה-Scanner רק אחרי שה-modal פתוח
            const timer = setTimeout(() => {
                setShouldLoadScanner(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleScan = async (detectedCodes) => {
        if (detectedCodes && detectedCodes.length > 0 && !isLoading) {
            // לוקחים את הברקוד הראשון שזוהה
            const firstCode = detectedCodes[0];
            const barcode = firstCode?.rawValue;

            if (!barcode) return;

            setScannedBarcode(barcode);
            setIsLoading(true);
            setError(null);
            setProductNotFound(false);

            try {
                const response = await ProductServices.getProductByBarcode(barcode);
                // בדיקה אם התגובה מכילה מוצר
                const product = response?.data || response;
                if (product && (product._id || product.id)) {
                    // המוצר נמצא
                    setIsLoading(false);
                    onClose();
                    if (onProductFound) {
                        onProductFound(product);
                    }
                } else {
                    // המוצר לא נמצא (לא אמור להגיע לכאן אם השרת עובד נכון)
                    setIsLoading(false);
                    setProductNotFound(true);
                }
            } catch (err) {
                setIsLoading(false);
                const status = err?.response?.status;
                const errorMessage = err?.response?.data?.message;

                // אם זה שגיאה 400 (לא נמצא ברקוד) או 404 (מוצר לא נמצא)
                if (status === 404 || status === 400) {
                    setProductNotFound(true);
                } else {
                    // שגיאה אחרת (500 או אחר)
                    setError(t("BarcodeScanError"));
                    notifyApiResponse(err, false);
                }
            }
        }
    };

    const handleError = (err) => {
        console.error("Scanner error:", err);
        setError(t("BarcodeScanError"));
    };

    const handleAddNewProduct = () => {
        onClose();
        if (onProductNotFound && scannedBarcode) {
            onProductNotFound(scannedBarcode);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} className="relative z-50" dir="rtl">
            <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 align-middle shadow-xl transition-all">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <IoCameraOutline className="h-8 w-8 text-mainColor-500" />
                                {productNotFound ? t("ProductNotFound") : error ? t("Error") : isLoading ? t("CheckingProduct") : t("ScanProduct")}
                            </DialogTitle>
                            <button
                                onClick={handleClose}
                                className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <IoClose className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mb-3">
                            {productNotFound ? (
                                <>
                                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed mb-2">
                                        {t("ProductNotFoundMessage", { barcode: scannedBarcode })}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                                        {t("WouldYouLikeToAddProduct")}
                                    </p>
                                </>
                            ) : error ? (
                                <p className="text-red-500 dark:text-red-400 text-center leading-relaxed">
                                    {error}
                                </p>
                            ) : isLoading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor-500 mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {t("CheckingProduct")}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed mb-4">
                                        {t("ScanBarcodeInstructions")}
                                    </p>
                                    <div className="flex justify-center">
                                        <div 
                                            className="w-full max-w-md" 
                                            style={{ height: "300px", borderRadius: "8px", overflow: "hidden" }}
                                        >
                                            {shouldLoadScanner ? (
                                                <Suspense fallback={
                                                    <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mainColor-500"></div>
                                                    </div>
                                                }>
                                                    <div style={{ width: "100%", height: "100%" }}>
                                                        <Scanner
                                                            onScan={handleScan}
                                                            onError={handleError}
                                                            constraints={{
                                                                facingMode: "environment", // מצלמה אחורית
                                                            }}
                                                            styles={{
                                                                container: {
                                                                    width: "100%",
                                                                    height: "100%",
                                                                },
                                                                video: {
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover",
                                                                },
                                                            }}
                                                        />
                                                    </div>
                                                </Suspense>
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mainColor-500"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            {productNotFound ? (
                                <>
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {t("Close")}
                                    </button>
                                    <button
                                        onClick={handleAddNewProduct}
                                        className="px-6 py-2 text-sm font-medium text-white bg-mainColor-600 hover:bg-mainColor-700 rounded-lg transition-colors"
                                    >
                                        {t("AddProduct")}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleClose}
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

export default React.memo(BarcodeScannerModal);