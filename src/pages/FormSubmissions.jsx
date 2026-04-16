// src/pages/FormSubmissions.jsx
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "@windmill/react-ui";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import PageTitle from "@/components/Typography/PageTitle";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import { SidebarContext } from "@/context/SidebarContext";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import FormServices, {
  getFormSubmissionPdfAbsoluteUrl,
} from "@/services/FormServices";
import { getFormCodeTranslationKey } from "@/utils/formCodeLabels";
import { notifyError } from "@/utils/toast";

const submissionId = (row) => row?._id ?? row?.id ?? "";

const rowFormCode = (row) => {
  const c = row?.formCode ?? row?.form?.code;
  return c == null ? "" : String(c).trim();
};

const FormSubmissions = () => {
  const { t } = useTranslation();
  const { isUpdate, setIsUpdate } = useContext(SidebarContext);
  const { handleDeleteMany } = useToggleDrawer();

  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [formTypePending, setFormTypePending] = useState("");
  const [appliedFormCode, setAppliedFormCode] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const searchRef = useRef(null);

  const [isCheck, setIsCheck] = useState([]);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await FormServices.getSubmissions();
      setAllRows(Array.isArray(list) ? list : []);
    } catch (err) {
      setAllRows([]);
      setError(err?.message || t("FormSubmissionsLoadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    if (!isUpdate) return;
    let cancelled = false;
    (async () => {
      await loadSubmissions();
      if (!cancelled) setIsUpdate(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isUpdate, loadSubmissions, setIsUpdate]);

  const formCodeOptions = useMemo(() => {
    const set = new Set();
    for (const row of allRows) {
      const code = rowFormCode(row);
      if (code) set.add(code);
    }
    return [...set].sort();
  }, [allRows]);

  const formOptionLabel = (code) => {
    if (!code) return "—";
    const key = getFormCodeTranslationKey(code);
    return key ? `${code} — ${t(key)}` : code;
  };

  const displayRows = useMemo(() => {
    let rows = allRows;
    if (appliedFormCode) {
      rows = rows.filter((row) => rowFormCode(row) === appliedFormCode);
    }
    const q = appliedSearchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const code = (rowFormCode(row) || "").toLowerCase();
      const id = String(submissionId(row) || "").toLowerCase();
      const i18nKey = getFormCodeTranslationKey(rowFormCode(row));
      const label = i18nKey ? t(i18nKey).toLowerCase() : "";
      const optionText = `${code} ${label}`.trim();
      return code.includes(q) || id.includes(q) || label.includes(q) || optionText.includes(q);
    });
  }, [allRows, appliedFormCode, appliedSearchQuery, t]);

  const idsOnPage = useMemo(
    () => displayRows.map((r) => submissionId(r)).filter(Boolean),
    [displayRows]
  );
  const isCheckAll =
    idsOnPage.length > 0 && idsOnPage.every((id) => isCheck.includes(id));

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setAppliedFormCode(formTypePending);
    setAppliedSearchQuery((searchRef.current?.value || "").trim());
    setIsCheck([]);
  };

  const handleResetFilter = () => {
    setFormTypePending("");
    setAppliedFormCode("");
    setAppliedSearchQuery("");
    if (searchRef.current) searchRef.current.value = "";
    setIsCheck([]);
  };

  const handleSelectAll = () => {
    if (isCheckAll) {
      setIsCheck([]);
    } else {
      setIsCheck([...idsOnPage]);
    }
  };

  const handleRowCheck = (e) => {
    const { id, checked } = e.target;
    if (checked) {
      setIsCheck([...isCheck, id]);
    } else {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  const handleDownloadPdf = async (id) => {
    if (!id) return;
    setPdfLoadingId(id);
    try {
      await FormServices.downloadSubmissionPdf(id);
    } catch (err) {
      notifyError(err?.message || t("FormSubmissionPdfError"));
    } finally {
      setPdfLoadingId(null);
    }
  };

  const formatSubmittedAt = (row) => {
    const raw = row?.submittedAt ?? row?.createdAt;
    if (!raw) return "—";
    return dayjs(raw).format("DD/MM/YYYY HH:mm");
  };

  const emptyBecauseFilter =
    !loading && !error && allRows.length > 0 && displayRows.length === 0;

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("FormsSubmissionsPageTitle")}</PageTitle>

      {isCheck?.length >= 1 && (
        <DeleteModal ids={isCheck} setIsCheck={setIsCheck} title={t("SelectedFormSubmissions")} />
      )}

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form
            onSubmit={handleFilterSubmit}
            className="py-3 grid gap-4 xl:gap-4 md:flex xl:flex flex-wrap xl:flex-nowrap items-end"
          >
            <div className="grow-0 md:grow lg:grow xl:grow min-w-0 w-full relative">
              <Input
                ref={searchRef}
                type="search"
                name="search"
                placeholder={t("FormSubmissionsSearchPlaceholder")}
                className="h-12"
                disabled={loading || !!error}
              />
              <button type="submit" className="absolute end-0 top-0 mt-5 me-1" aria-hidden tabIndex={-1} />
            </div>

            <div className="grow-0 md:grow lg:grow xl:grow min-w-[200px] w-full">
              <Select
                value={formTypePending}
                onChange={(e) => setFormTypePending(e.target.value)}
                disabled={loading || !!error}
                className="h-12"
              >
                <option value="">{t("AllFormTypes")}</option>
                {formCodeOptions.map((code) => (
                  <option key={code} value={code}>
                    {formOptionLabel(code)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-2 md:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 xl:gap-x-4 sm:gap-x-1 w-full sm:w-auto xl:w-auto grow-0 md:grow-0">
              <div className="w-full sm:w-auto sm:min-w-[100px] xl:min-w-[120px]">
                <Button
                  type="submit"
                  disabled={loading || !!error}
                  className="h-12 w-full rounded-md bg-customGreen-dark"
                >
                  {t("Filter")}
                </Button>
              </div>
              <div className="w-full sm:w-auto sm:min-w-[100px] xl:min-w-[120px]">
                <Button
                  type="button"
                  layout="outline"
                  disabled={loading || !!error}
                  onClick={handleResetFilter}
                  className="h-12 w-full rounded-md px-4 text-sm dark:bg-gray-700"
                >
                  <span className="text-black dark:text-gray-200">{t("Reset")}</span>
                </Button>
              </div>
            </div>

            <div className="grow-0 w-full sm:w-auto xl:w-auto">
              <Button
                type="button"
                disabled={isCheck.length < 1}
                onClick={() => handleDeleteMany(isCheck)}
                className={`w-full rounded-md h-12 bg-red-300 disabled btn-red ${isCheck.length < 1 ? "cursor-auto opacity-60" : ""}`}
              >
                <span className="ms-2 inline-flex" aria-hidden>
                  <FiTrash2 />
                </span>
                {t("Delete")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <TableLoading row={8} col={4} width={160} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : allRows.length === 0 ? (
        <NotFound title={t("FormSubmissionsEmpty")} />
      ) : emptyBecauseFilter ? (
        <NotFound title={t("FormSubmissionsNoFilterResults")} />
      ) : (
        <TableContainer className="mb-8 rounded-b-lg">
          <Table>
            <TableHeader>
              <tr>
                <TableCell className="text-center">
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    handleClick={handleSelectAll}
                    isChecked={isCheckAll}
                  />
                </TableCell>
                <TableCell className="text-center">{t("FormSubmissionFormName")}</TableCell>
                <TableCell className="text-center">{t("FormSubmissionDate")}</TableCell>
                <TableCell className="text-center">{t("FormSubmissionActions")}</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {displayRows.map((row, index) => {
                const id = submissionId(row);
                return (
                  <TableRow key={id || `row-${index}`}>
                    <TableCell className="text-center">
                      <CheckBox
                        type="checkbox"
                        id={id}
                        handleClick={handleRowCheck}
                        isChecked={isCheck?.includes(id)}
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {formOptionLabel(rowFormCode(row))}
                    </TableCell>
                    <TableCell className="text-center">{formatSubmittedAt(row)}</TableCell>
                    <TableCell className="text-center">
                      <a
                        href={id ? getFormSubmissionPdfAbsoluteUrl(id) : undefined}
                        className={`inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mainColor dark:border-gray-600 dark:text-gray-200 ${
                          !id || pdfLoadingId === id
                            ? "pointer-events-none cursor-not-allowed border-gray-200 text-gray-400 opacity-60 dark:border-gray-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        aria-disabled={!id || pdfLoadingId === id}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!id || pdfLoadingId === id) return;
                          handleDownloadPdf(id);
                        }}
                      >
                        {pdfLoadingId === id ? t("Loading") : t("DownloadFormSubmissionPdf")}
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default FormSubmissions;
