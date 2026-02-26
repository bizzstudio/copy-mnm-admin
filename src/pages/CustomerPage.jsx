// src/pages/CustomerPage.jsx
import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BiUser, BiReceipt, BiFile } from "react-icons/bi";
import { FiArrowLeft, FiUpload, FiPlus, FiSearch, FiMinus } from "react-icons/fi";
import { Button } from "@windmill/react-ui";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";

// Internal import
import useAsync from "@/hooks/useAsync";
import useAsyncWithRefetch from "@/hooks/useAsyncWithRefetch";
import CustomerServices from "@/services/CustomerServices";
import ProductServices from "@/services/ProductServices";
import PageTitle from "@/components/Typography/PageTitle";
import Loading from "@/components/preloader/Loading";
import Tabs from "@/components/common/Tabs";
import CustomerPersonalDetails from "@/components/customer/CustomerPersonalDetails";
import CustomerOrders from "@/components/customer/CustomerOrders";
import CustomerDocuments from "@/components/customer/CustomerDocuments";
import ImportResultsModal from "@/components/modal/ImportResultsModal";
import { notifyError, notifySuccess } from "@/utils/toast";

const CustomerPage = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: customer, loading, error } = useAsync(() =>
        CustomerServices.getMainCustomer(id)
    );

    // חישוב טווח התאריכים של העמוד הראשון (מהיום עד לפני 6 חודשים)
    const getInitialDateRange = () => {
        const today = dayjs();
        const sixMonthsAgo = today.subtract(6, 'month');
        return {
            from: sixMonthsAgo.format('YYYY-MM-DD'),
            to: today.format('YYYY-MM-DD')
        };
    };

    // Rivhit externalCustomerId - נמצא על הלקוח הראשי (MainCustomer.externalCustomerId)
    const externalCustomerId = useMemo(() => {
        return customer?.externalCustomerId || null;
    }, [customer]);

    // סטייט לשמירת טווח התאריכים הנוכחי
    const [dateRange, setDateRange] = useState(getInitialDateRange());
    const [selectedRows, setSelectedRows] = useState([]);
    const [importResults, setImportResults] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importStage, setImportStage] = useState(null);
    const [isImportLoading, setIsImportLoading] = useState(false);
    const permittedFileInputRef = useRef(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [allProductsLoading, setAllProductsLoading] = useState(false);
    const [mainSearchText, setMainSearchText] = useState("");
    const [modalSearchText, setModalSearchText] = useState("");
    const [isAddProductsModalOpen, setIsAddProductsModalOpen] = useState(false);
    const [addingProductId, setAddingProductId] = useState("");
    const [removingBarcode, setRemovingBarcode] = useState("");
    const [isImportModeModalOpen, setIsImportModeModalOpen] = useState(false);

    // יצירת פונקציה לטעינת מסמכים - תלויה ב-externalCustomerId ו-dateRange
    const documentsFetchFunction = useMemo(() => {
        if (!externalCustomerId) {
            return () => Promise.resolve(null);
        }
        return () => CustomerServices.getRivhitDocuments(
            externalCustomerId,
            dateRange.from,
            dateRange.to,
            'main' // תמיד מושכים מסמכים ברמת הלקוח הראשי
        );
    }, [externalCustomerId, dateRange.from, dateRange.to]);

    // Hook לטעינת מסמכים - טעינה אוטומטית כשהלקוח או התאריכים משתנים
    const {
        data: rivhitDocuments,
        loading: documentsLoading,
        error: documentsError,
        refetch: refetchDocuments
    } = useAsyncWithRefetch(
        documentsFetchFunction,
        [externalCustomerId, dateRange.from, dateRange.to],
        { autoFetch: !!externalCustomerId }
    );

    const permittedFetchFunction = useMemo(() => {
        return () => CustomerServices.getPermittedProducts(id);
    }, [id]);

    const {
        data: permittedData,
        loading: permittedLoading,
        refetch: refetchPermittedProducts
    } = useAsyncWithRefetch(
        permittedFetchFunction,
        [id],
        { autoFetch: !!id }
    );

    const loadAllProducts = useCallback(async (title = "") => {
        try {
            setAllProductsLoading(true);
            const response = await ProductServices.getAllProducts({
                page: 1,
                limit: 500,
                category: null,
                title,
                price: null,
            });
            setAllProducts(Array.isArray(response?.products) ? response.products : []);
        } catch (err) {
            console.error("loadAllProducts error:", err);
            notifyError(err?.response?.data?.message || err.message || "Failed to load products");
        } finally {
            setAllProductsLoading(false);
        }
    }, []);

    // פונקציה לעדכון מסמכים עם תאריכים חדשים
    const handleDocumentsFetch = useCallback(async (from, to) => {
        const currentExternalCustomerId = externalCustomerId;
        if (!currentExternalCustomerId) {
            return Promise.resolve(null);
        }

        // עדכון טווח התאריכים - זה יגרום ל-hook לטעון מחדש אוטומטית
        setDateRange({ from, to });

        // החזרת Promise שממתין לטעינה
        // נשתמש ב-refetch כדי לוודא שהנתונים נטענים מיד
        return refetchDocuments();
    }, [externalCustomerId, refetchDocuments]);

    const handlePermittedFileSelect = useCallback((event) => {
        const file = event.target?.files?.[0];
        if (!file) return;
        setSelectedFileName(file.name || "");

        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonRows = XLSX.utils.sheet_to_json(worksheet);

                if (!jsonRows?.length) {
                    setImportStage("completed");
                    setImportResults({ total: 0, success: 0, failure: 0, errors: [] });
                    notifyError("Empty file");
                    return;
                }

                setSelectedRows(jsonRows);
                setIsImportModeModalOpen(true);
            } catch (error) {
                notifyError("Failed to read XLSX file");
            }
        };

        fileReader.readAsArrayBuffer(file);
    }, []);

    const handlePermittedUpload = useCallback(async (mode = "replace") => {
        if (!selectedRows.length) {
            notifyError("No file selected");
            return;
        }

        setIsImportModeModalOpen(false);
        setIsImportModalOpen(true);
        setIsImportLoading(true);
        setImportStage("uploading");
        setImportResults({ total: selectedRows.length, success: 0, failure: 0, errors: [] });
        try {
            const res = await CustomerServices.importPermittedBarcodes(id, { rows: selectedRows }, mode);
            const summary = res?.summary || {};
            const errors = (res?.errors || []).map((error) => ({
                row: error.index || 0,
                product: "",
                itemNumber: "",
                barcode: error.barcode || "",
                message: typeof error.error === "object" ? (error.error.he || error.error.en || "Import error") : (error.error || "Import error"),
            }));

            setImportResults({
                total: summary.total || selectedRows.length,
                success: summary.succeeded || 0,
                failure: summary.failed || 0,
                errors,
            });
            setImportStage("completed");
            notifySuccess(res?.message?.he || res?.message?.en || "Import completed");
            refetchPermittedProducts();
        } catch (err) {
            const errorData = err?.response?.data || {};
            const summary = errorData?.summary || {};
            const errors = (errorData?.errors || []).map((error) => ({
                row: error.index || 0,
                product: "",
                itemNumber: "",
                barcode: error.barcode || "",
                message: typeof error.error === "object" ? (error.error.he || error.error.en || "Import error") : (error.error || "Import error"),
            }));

            setImportResults({
                total: summary.total || selectedRows.length,
                success: summary.succeeded || 0,
                failure: summary.failed || selectedRows.length,
                errors,
            });
            setImportStage("completed");
            notifyError(errorData?.message?.he || errorData?.message?.en || err.message || "Import failed");
        } finally {
            setIsImportLoading(false);
        }
    }, [id, selectedRows, refetchPermittedProducts]);

    const closeImportModal = useCallback(() => {
        setIsImportModalOpen(false);
        setIsImportModeModalOpen(false);
        setSelectedRows([]);
        setImportStage(null);
        setImportResults(null);
        setSelectedFileName("");
        if (permittedFileInputRef.current) {
            permittedFileInputRef.current.value = "";
        }
    }, []);

    const handleAddPermittedProduct = useCallback(async (productId) => {
        try {
            setAddingProductId(productId);
            await CustomerServices.addPermittedProduct(id, { productId });
            notifySuccess("Product added to permitted list");
            await refetchPermittedProducts();
        } catch (err) {
            notifyError(err?.response?.data?.message?.he || err?.response?.data?.message?.en || err.message || "Failed to add product");
        } finally {
            setAddingProductId("");
        }
    }, [id, refetchPermittedProducts]);

    const handleRemovePermittedProduct = useCallback(async (barcode) => {
        try {
            setRemovingBarcode(barcode);
            await CustomerServices.removePermittedProduct(id, { barcode });
            notifySuccess("Product removed from permitted list");
            await refetchPermittedProducts();
        } catch (err) {
            notifyError(err?.response?.data?.message?.he || err?.response?.data?.message?.en || err.message || "Failed to remove product");
        } finally {
            setRemovingBarcode("");
        }
    }, [id, refetchPermittedProducts]);

    const handleOpenAddProductsModal = useCallback(async () => {
        setIsAddProductsModalOpen(true);
        setModalSearchText("");
        await loadAllProducts("");
    }, [loadAllProducts]);

    const permittedProducts = Array.isArray(permittedData?.permittedProducts) ? permittedData.permittedProducts : [];
    const hasRestrictions = Boolean(permittedData?.hasRestrictions);
    const permittedCount = Number(permittedData?.permittedCount || 0);
    const permittedBarcodeSet = useMemo(
        () => new Set(permittedProducts.map((product) => String(product?.barcode || "").trim()).filter(Boolean)),
        [permittedProducts]
    );

    const filteredPermittedProducts = useMemo(() => {
        const term = mainSearchText.trim().toLowerCase();
        if (!term) return permittedProducts;
        return permittedProducts.filter((product) => {
            const heTitle = String(product?.title?.he || "").toLowerCase();
            const enTitle = String(product?.title?.en || "").toLowerCase();
            const barcode = String(product?.barcode || "").toLowerCase();
            return heTitle.includes(term) || enTitle.includes(term) || barcode.includes(term);
        });
    }, [mainSearchText, permittedProducts]);

    const modalProducts = useMemo(() => {
        const term = modalSearchText.trim().toLowerCase();
        return allProducts.filter((product) => {
            const barcode = String(product?.barcode || "").trim();
            if (!barcode || permittedBarcodeSet.has(barcode)) return false;
            if (!term) return true;
            const heTitle = String(product?.title?.he || "").toLowerCase();
            const enTitle = String(product?.title?.en || "").toLowerCase();
            return heTitle.includes(term) || enTitle.includes(term) || barcode.toLowerCase().includes(term);
        });
    }, [allProducts, modalSearchText, permittedBarcodeSet]);

    useEffect(() => {
        loadAllProducts("");
    }, [loadAllProducts]);

    const tabs = useMemo(() => [
        {
            id: "personal",
            label: (
                <span className="flex gap-1.5 items-center justify-center">
                    <BiUser size={17} />
                    <span className="md:block hidden">{t("PersonalDetails")}</span>
                </span>
            ),
            content: <CustomerPersonalDetails customer={customer} customerId={id} />,
        },
        {
            id: "orders",
            label: (
                <span className="flex gap-1.5 items-center justify-center">
                    <BiReceipt size={17} />
                    <span className="md:block hidden">{t("Orders")}</span>
                </span>
            ),
            content: <CustomerOrders customer={customer} />,
        },
        {
            id: "documents",
            label: (
                <span className="flex gap-1.5 items-center justify-center">
                    <BiFile size={17} />
                    <span className="md:block hidden">{t("Documents")}</span>
                </span>
            ),
            content: (
                <CustomerDocuments
                    customer={customer}
                    customerId={id}
                    externalCustomerId={externalCustomerId}
                    rivhitDocuments={rivhitDocuments}
                    documentsLoading={documentsLoading}
                    documentsError={documentsError?.message || documentsError}
                    onDocumentsFetch={handleDocumentsFetch}
                />
            ),
        },
        {
            id: "permittedProducts",
            label: (
                <span className="flex gap-1.5 items-center justify-center">
                    <BiFile size={17} />
                    <span className="md:block hidden">{t("PermittedProducts")}</span>
                </span>
            ),
            content: (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Permitted products {t("PermittedProducts")} ({permittedCount})
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {t("ProductsTheSubCustomersAreAllowedToSee")}
                            </p>
                        </div>
                        {hasRestrictions && (
                            <button
                                type="button"
                                onClick={handleOpenAddProductsModal}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-500 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <FiPlus />
                                {t("AddProducts")}
                            </button>
                        )}
                    </div>

                    <div className="mb-5 p-4 rounded-md border border-gray-200 dark:border-gray-600 bg-transparent dark:bg-gray-800/40">
                        <h4 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">{t("UploadPermittedBarcodesXLSX")}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {t("UploadOneColumnXLSXWithBarcodeValues")}
                        </p>
                        <button
                            type="button"
                            onClick={() => permittedFileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-500 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <FiUpload />
                            {t("ChooseXLSXFile")}
                        </button>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">{selectedFileName || t("NoFileSelected")}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("RequiredColumnBarcode")}</p>
                    </div>

                    {permittedLoading ? (
                        <p className="text-sm text-gray-500">{t("LoadingPermittedProducts")}</p>
                    ) : (
                        <>
                            <div className="relative mb-3">
                                <FiSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 dark:text-gray-300" />
                                <input
                                    type="text"
                                    value={mainSearchText}
                                    onChange={(e) => setMainSearchText(e.target.value)}
                                    placeholder={
  hasRestrictions
    ? t("SearchPermittedProducts")
    : t("SearchAllProducts")
}
                                    className="w-full h-10 pl-10 pr-3 rounded-md border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                                />
                            </div>

                            {!hasRestrictions && (
                                <div className="text-xs text-blue-600 mb-3">
                                    {t("NoRestrictionsYetAddingAProductWillCreateThePermittedList")}
                                </div>
                            )}

                            <div className="border border-gray-200 dark:border-gray-600 rounded-md max-h-80 overflow-auto bg-white dark:bg-gray-800/30">
                                {(hasRestrictions ? filteredPermittedProducts : allProducts.filter((product) => {
                                    const term = mainSearchText.trim().toLowerCase();
                                    if (!term) return true;
                                    const heTitle = String(product?.title?.he || "").toLowerCase();
                                    const enTitle = String(product?.title?.en || "").toLowerCase();
                                    const barcode = String(product?.barcode || "").toLowerCase();
                                    return heTitle.includes(term) || enTitle.includes(term) || barcode.includes(term);
                                })).slice(0, 200).map((product) => {
                                    const barcode = String(product?.barcode || "").trim();
                                    return (
                                        <div key={product._id} className="flex items-center justify-between gap-3 px-3 py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                                    {product?.title?.he || product?.title?.en || t("UnnamedProduct")}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-300">{barcode || "-"}</p>
                                            </div>
                                            {!hasRestrictions && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddPermittedProduct(product._id)}
                                                    disabled={!barcode || addingProductId === product._id}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FiPlus />
                                                </button>
                                            )}
                                            {hasRestrictions && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePermittedProduct(barcode)}
                                                    disabled={!barcode || removingBarcode === barcode}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-red-300 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FiMinus />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                {allProductsLoading && (
                                    <p className="text-sm text-gray-500 p-3">Loading products...</p>
                                )}
                            </div>
                        </>
                    )}

                    <input
                        ref={permittedFileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handlePermittedFileSelect}
                        className="hidden"
                    />
                </div>
            ),
        },
    ], [
        customer, id, t, rivhitDocuments, documentsLoading, documentsError, handleDocumentsFetch, handlePermittedFileSelect,
        selectedFileName, permittedCount, hasRestrictions, handleOpenAddProductsModal, permittedLoading, mainSearchText,
        filteredPermittedProducts, allProducts, allProductsLoading, handleAddPermittedProduct, addingProductId,
        handleRemovePermittedProduct, removingBarcode
    ]);

    if (loading) {
        return (
            <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
                <Loading loading={loading} />
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
                <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {t("CustomerNotFound")}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {error || t("CustomerNotFoundMessage")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <div className="flex items-center justify-between mt-6 w-full">
                <PageTitle>
                    {customer.name}
                </PageTitle>
                <Button
                    onClick={() => navigate("/customers")}
                    layout="outline"
                    className="flex items-center gap-2 w-fit!"
                >
                    <span>{t("Back")}</span>
                    <FiArrowLeft size={16} />
                </Button>
            </div>

            <div className="mt-6 w-full">
                <Tabs tabs={tabs} tab="tab" />
            </div>
            <ImportResultsModal
                isOpen={isImportModalOpen}
                onClose={closeImportModal}
                results={importResults}
                isLoading={isImportLoading}
                stage={importStage}
                onUpload={() => handlePermittedUpload("replace")}
            />
            <Dialog open={isImportModeModalOpen} onClose={() => setIsImportModeModalOpen(false)} className="relative z-50" dir="rtl">
                <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-xl">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                    XLSX import mode
                                </DialogTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Choose how to apply the new file to permitted products.
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => handlePermittedUpload("replace")}
                                    className="w-full text-right px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Replace old products
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePermittedUpload("merge")}
                                    className="w-full text-right px-4 py-3 rounded-md border border-blue-300 dark:border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                >
                                    Add to existing products
                                </button>
                                <button
                                    type="button"
                                    onClick={closeImportModal}
                                    className="w-full text-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
            <Dialog open={isAddProductsModalOpen} onClose={() => setIsAddProductsModalOpen(false)} className="relative z-50" dir="rtl">
                <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-xl">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {t("AddProductsToPermittedList")}
                                </DialogTitle>
                                <button
                                    type="button"
                                    onClick={() => setIsAddProductsModalOpen(false)}
                                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="relative mb-3">
                                    <FiSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 dark:text-gray-300" />
                                    <input
                                        type="text"
                                        value={modalSearchText}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setModalSearchText(value);
                                            loadAllProducts(value);
                                        }}
                                        placeholder="Search products..."
                                        className="w-full h-10 pl-10 pr-3 rounded-md border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-300"
                                    />
                                </div>
                                <div className="border border-gray-200 dark:border-gray-600 rounded-md max-h-96 overflow-auto bg-white dark:bg-gray-800/30">
                                    {modalProducts.slice(0, 200).map((product) => (
                                        <div key={product._id} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                    {product?.title?.he || product?.title?.en || t("UnnamedProduct")}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-300">{product?.barcode || "-"}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleAddPermittedProduct(product._id)}
                                                disabled={addingProductId === product._id || !product?.barcode}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                    ))}
                                    {allProductsLoading && <p className="text-sm text-gray-500 p-3">Loading products...</p>}
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default CustomerPage;
