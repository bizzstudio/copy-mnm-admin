import { useContext, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";

import { SidebarContext } from "@/context/SidebarContext";
import PriceListServices from "@/services/PriceListServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const usePriceListImport = (priceListId) => {
  const { t } = useTranslation();
  const { isDrawerOpen, setLoading } = useContext(SidebarContext);

  const [selectedRows, setSelectedRows] = useState([]);
  const [preparedRows, setPreparedRows] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStage, setImportStage] = useState(null);
  const fileInputRef = useRef(null);

  const handleSelectFile = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    setIsImportModalOpen(true);
    setImportStage("uploading");
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
              setImportStage("completed");
              setImportResults({ total: 0, success: 0, failure: 0, errors: [] });
              notifyError(t("EmptyFile"));
              return;
            }

            setSelectedRows(json);
            setImportStage(null);
            setImportResults({ total: json.length, success: 0, failure: 0, errors: [] });
          } catch (error) {
            console.error("Error reading price list file:", error);
            setImportStage("completed");
            setImportResults({
              total: 0,
              success: 0,
              failure: 1,
              errors: [{ row: 0, product: "", itemNumber: "", barcode: "", message: error.message }],
            });
            notifyError(t("FileProcessingError"));
          }
        };

        fileReader.readAsArrayBuffer(file);
      } else {
        setIsImportModalOpen(false);
        notifyError(t("InvalidFileType"));
      }
    } catch (error) {
      setIsImportModalOpen(false);
      notifyError(t("FileProcessingError"));
      console.error("Error selecting price list file:", error);
    }
  };

  const handleUpload = async () => {
    if (!priceListId) {
      notifyError(t("UpdatePriceListFirst"));
      return;
    }

    if (!selectedRows.length) {
      notifyError(t("NoFileSelected"));
      return;
    }

    setLoading(true);
    setImportStage("uploading");

    try {
      const res = await PriceListServices.importPriceListPrices(
        priceListId,
        { rows: selectedRows, dryRun: true },
        { dryRun: true }
      );

      const summary = res.summary || {};
      const success = summary.succeeded || 0;
      const failure = summary.failed || 0;
      const total = summary.total || selectedRows.length;

      const errors = (res.errors || []).map((error) => ({
        row: error.index || 0,
        product: "",
        itemNumber: "",
        barcode: error.barcode || "",
        message:
          typeof error.error === "object"
            ? error.error.he || error.error.en || JSON.stringify(error.error)
            : error.error || t("ImportFailed"),
      }));

      setImportResults({ total, success, failure, errors });
      setImportStage("completed");
      setPreparedRows(selectedRows);

      const message = res.message?.he || res.message?.en || t("ImportCompleted");
      if (failure === 0) notifySuccess(message);
      else if (success === 0) notifyError(message);
      else notifySuccess(message);
    } catch (err) {
      console.error("Price list import upload error:", err);
      const errorData = err?.response?.data || {};
      const summary = errorData.summary || {};
      const errors = (errorData.errors || []).map((error) => ({
        row: error.index || 0,
        product: "",
        itemNumber: "",
        barcode: error.barcode || "",
        message:
          typeof error.error === "object"
            ? error.error.he || error.error.en || JSON.stringify(error.error)
            : error.error || err.message || t("ImportFailed"),
      }));

      if (!errors.length) {
        errors.push({ row: 0, product: "", itemNumber: "", barcode: "", message: err.message || t("ImportFailed") });
      }

      setImportResults({
        success: summary.succeeded || 0,
        failure: summary.failed || selectedRows.length,
        total: summary.total || selectedRows.length,
        errors,
      });
      setImportStage("completed");

      const message = errorData.message?.he || errorData.message?.en || err.message || t("ImportFailed");
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSelectFile = () => {
    setSelectedRows([]);
    setImportResults(null);
    setImportStage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCloseImportModal = () => {
    handleRemoveSelectFile();
    setIsImportModalOpen(false);
  };

  const clearPreparedRows = () => {
    setPreparedRows([]);
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setPreparedRows([]);
      handleRemoveSelectFile();
      setIsImportModalOpen(false);
    }
  }, [isDrawerOpen]);

  return {
    fileInputRef,
    importResults,
    isImportModalOpen,
    importStage,
    preparedRows,
    handleSelectFile,
    handleUpload,
    handleCloseImportModal,
    clearPreparedRows,
  };
};

export default usePriceListImport;
