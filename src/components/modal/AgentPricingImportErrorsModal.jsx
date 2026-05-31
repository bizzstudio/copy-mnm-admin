import React, { useMemo } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { IoClose, IoWarningOutline } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";

const localizeReason = (err, lang) => {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    return err[lang] || err.he || err.en || "";
  }
  return String(err);
};

const AgentPricingImportErrorsModal = ({
  isOpen,
  onClose,
  errors = [],
  summary = {},
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "he";

  const rows = useMemo(
    () =>
      (errors || []).map((e) => ({
        row: e?.index ?? "",
        barcode: e?.barcode ?? "",
        reason: localizeReason(e?.error, lang),
      })),
    [errors, lang]
  );

  const handleDownload = () => {
    const sheetData = rows.map((r) => ({
      [t("Row")]: r.row,
      [t("Barcode")]: r.barcode,
      [t("ErrorReason")]: r.reason,
    }));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    XLSX.writeFile(wb, `agent-pricing-import-errors-${stamp}.xlsx`);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50" dir="rtl">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 align-middle shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <IoWarningOutline className="h-7 w-7 text-red-500" />
                {t("ImportErrorsTitle")}
              </DialogTitle>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={t("Close")}
              >
                <IoClose className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                {t("Total")}: <b>{summary?.total ?? "-"}</b>
              </span>
              <span className="text-green-600 dark:text-green-400">
                {t("ImportSucceeded")}: <b>{summary?.succeeded ?? 0}</b>
              </span>
              <span className="text-red-600 dark:text-red-400">
                {t("ImportFailed")}: <b>{summary?.failed ?? rows.length}</b>
              </span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="min-w-full text-sm text-right">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 w-20">
                      {t("Row")}
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 w-40">
                      {t("Barcode")}
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                      {t("ErrorReason")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        {t("NoErrors")}
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => (
                      <tr
                        key={`${r.row}-${r.barcode}-${idx}`}
                        className="border-t border-gray-100 dark:border-gray-700 odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700/40"
                      >
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {r.row || "-"}
                        </td>
                        <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {r.barcode || "-"}
                        </td>
                        <td className="px-3 py-2 text-red-600 dark:text-red-400">
                          {r.reason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600 mt-4">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t("Close")}
              </button>
              <button
                onClick={handleDownload}
                disabled={rows.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-mainColor-600 hover:bg-mainColor-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FiDownload />
                {t("DownloadErrorsExcel")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default React.memo(AgentPricingImportErrorsModal);
