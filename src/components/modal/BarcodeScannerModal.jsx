// src/components/modal/BarcodeScannerModal.jsx
import React, { useState, useEffect, lazy, Suspense } from "react";
import { Modal, ModalBody, ModalFooter, Button } from "@windmill/react-ui";
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
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
                {productNotFound ? (
                    <>
                        <h2 className="text-xl font-medium mb-4 text-gray-800 dark:text-gray-200">
                            {t("ProductNotFound")}
                        </h2>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            {t("ProductNotFoundMessage", { barcode: scannedBarcode })}
                        </p>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">
                            {t("WouldYouLikeToAddProduct")}
                        </p>
                    </>
                ) : error ? (
                    <>
                        <h2 className="text-xl font-medium mb-4 text-red-500">
                            {t("Error")}
                        </h2>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
                    </>
                ) : isLoading ? (
                    <>
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t("CheckingProduct")}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-medium mb-4 text-gray-800 dark:text-gray-200">
                            {t("ScanProduct")}
                        </h2>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            {t("ScanBarcodeInstructions")}
                        </p>
                        <div className="flex justify-center mb-4">
                            <div className="w-full max-w-md" style={{ height: "300px", borderRadius: "8px", overflow: "hidden" }}>
                                {shouldLoadScanner ? (
                                    <Suspense fallback={
                                        <div className="flex items-center justify-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                                        </div>
                                    }>
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
                                    </Suspense>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </ModalBody>
            <ModalFooter className="justify-center">
                {productNotFound ? (
                    <>
                        <Button
                            className="w-full sm:w-auto hover:bg-white hover:border-gray-50"
                            layout="outline"
                            onClick={handleClose}
                        >
                            {t("Close")}
                        </Button>
                        <Button onClick={handleAddNewProduct} className="w-full sm:w-auto">
                            {t("AddProduct")}
                        </Button>
                    </>
                ) : error ? (
                    <Button onClick={handleClose} className="w-full sm:w-auto">
                        {t("Close")}
                    </Button>
                ) : (
                    <Button
                        className="w-full sm:w-auto hover:bg-white hover:border-gray-50"
                        layout="outline"
                        onClick={handleClose}
                    >
                        {t("Close")}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
};

export default React.memo(BarcodeScannerModal);