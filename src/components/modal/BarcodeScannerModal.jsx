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
    const [foundProduct, setFoundProduct] = useState(null);
    const [addStockStep, setAddStockStep] = useState(false);
    const [addStockQuantity, setAddStockQuantity] = useState("");
    const [addStockSubmitting, setAddStockSubmitting] = useState(false);

    // איפוס מצבים כשהמודל נסגר
    useEffect(() => {
        if (!isOpen) {
            setScannedBarcode(null);
            setIsLoading(false);
            setError(null);
            setProductNotFound(false);
            setShouldLoadScanner(false);
            setFoundProduct(null);
            setAddStockStep(false);
            setAddStockQuantity("");
        } else {
            const timer = setTimeout(() => {
                setShouldLoadScanner(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleScan = async (detectedCodes) => {
        if (detectedCodes && detectedCodes.length > 0 && !isLoading) {
            const firstCode = detectedCodes[0];
            const barcode = firstCode?.rawValue;

            if (!barcode) return;

            setScannedBarcode(barcode);
            setIsLoading(true);
            setError(null);
            setProductNotFound(false);
            setFoundProduct(null);
            setAddStockStep(false);

            try {
                const response = await ProductServices.getProductByBarcode(barcode);
                const product = response?.data || response;
                if (product && (product._id || product.id)) {
                    setIsLoading(false);
                    setFoundProduct(product);
                } else {
                    setIsLoading(false);
                    setProductNotFound(true);
                }
            } catch (err) {
                setIsLoading(false);
                const status = err?.response?.status;
                if (status === 404 || status === 400) {
                    setProductNotFound(true);
                } else {
                    setError(t("BarcodeScanError"));
                    notifyApiResponse(err, false);
                }
            }
        }
    };

    const handleEditProduct = () => {
        if (foundProduct && onProductFound) {
            onProductFound(foundProduct);
        }
        onClose();
    };

    const handleAddStockClick = () => {
        setAddStockStep(true);
        setAddStockQuantity("");
    };

    const handleAddStockSubmit = async () => {
        const qty = parseInt(addStockQuantity, 10);
        if (!foundProduct || !scannedBarcode || !Number.isFinite(qty) || qty < 1) return;
        setAddStockSubmitting(true);
        setError(null);
        try {
            const res = await ProductServices.addStockByBarcode(scannedBarcode, qty);
            const data = res?.data || res;
            notifyApiResponse({ response: { data } }, true);
            setFoundProduct(null);
            setAddStockStep(false);
            setAddStockQuantity("");
            setScannedBarcode(null);
            setShouldLoadScanner(true);
        } catch (err) {
            setError(err?.response?.data?.message?.he || err?.response?.data?.message?.en || t("BarcodeScanError"));
            notifyApiResponse(err, false);
        } finally {
            setAddStockSubmitting(false);
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
                                {productNotFound ? t("ProductNotFound") : error ? t("Error") : isLoading ? t("CheckingProduct") : addStockStep ? t("AddStock") : foundProduct ? t("ScanProduct") : t("ScanProduct")}
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
                            ) : addStockStep && foundProduct ? (
                                <div className="space-y-4">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {foundProduct?.title?.he || foundProduct?.title?.en || scannedBarcode}
                                    </p>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("Quantity")}
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={addStockQuantity}
                                        onChange={(e) => setAddStockQuantity(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
                            ) : foundProduct && !addStockStep ? (
                                <div className="space-y-2">
                                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                                        {foundProduct?.title?.he || foundProduct?.title?.en || scannedBarcode}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("Barcode")}: {scannedBarcode}
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
                            ) : addStockStep && foundProduct ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => { setAddStockStep(false); setError(null); }}
                                        className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {t("Back")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddStockSubmit}
                                        disabled={addStockSubmitting || !addStockQuantity || parseInt(addStockQuantity, 10) < 1}
                                        className="px-6 py-2 text-sm font-medium text-white bg-mainColor-600 hover:bg-mainColor-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {addStockSubmitting ? t("CheckingProduct") : t("AddStock")}
                                    </button>
                                </>
                            ) : foundProduct && !addStockStep ? (
                                <>
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {t("Close")}
                                    </button>
                                    <button
                                        onClick={handleAddStockClick}
                                        className="px-6 py-2 text-sm font-medium text-white bg-mainColor-600 hover:bg-mainColor-700 rounded-lg transition-colors"
                                    >
                                        {t("AddStock")}
                                    </button>
                                    <button
                                        onClick={handleEditProduct}
                                        className="px-6 py-2 text-sm font-medium text-white bg-mainColor-600 hover:bg-mainColor-700 rounded-lg transition-colors"
                                    >
                                        {t("EditProduct")}
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