// src/pages/AccountingDocuments.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "@windmill/react-ui";
import { FiExternalLink } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import PageTitle from "@/components/Typography/PageTitle";
import NotFound from "@/components/table/NotFound";
import TableLoading from "@/components/preloader/TableLoading";
import ReportServices from "@/services/ReportServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

/**
 * מסמכים וחשבוניות.
 *
 * ההפקה עצמה כבר קיימת בכרטיס הלקוח ובהזמנה, אבל אפשר היה לראות מסמך רק דרך
 * ההזמנה שממנה הופק. לשאלה "אילו חשבוניות הוצאנו החודש" לא היה מסך — כלומר
 * התשובה עליה הייתה להיכנס לריווחית, ולצאת מהמערכת.
 *
 * הרשימה נקראת מ-`Order.accountingDocs`, העותק שלנו של מה שהופק, ולכן היא נכונה
 * גם כשריווחית לא זמינה ומכילה בדיוק את המסמכים שהמערכת אחראית עליהם.
 */
const AccountingDocuments = () => {
  const { t } = useTranslation();
  const { showDateTimeFormat, currency, getNumberTwo } = useUtilsFunction();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: "", startDate: "", endDate: "", search: "" });
  const [applied, setApplied] = useState({ type: "", startDate: "", endDate: "", search: "" });

  const load = useCallback(async () => {
    setError(null);
    setData(null);
    try {
      setData(await ReportServices.getAccountingDocuments({ ...applied, limit: 100 }));
    } catch (err) {
      setError(err?.displayMessage || err?.message);
      setData({ documents: [], types: [] });
    }
  }, [applied]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("AccountingDocuments")}</PageTitle>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setApplied(filters);
            }}
          >
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <Label>{t("Search")}</Label>
                <Input
                  type="search"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder={t("SearchDocumentPlaceholder")}
                />
              </div>

              <div>
                <Label>{t("DocumentType")}</Label>
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">{t("AllDocumentTypes")}</option>
                  {(data?.types || []).map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.labelHe}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>{t("StartDate")}</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>{t("EndDate")}</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="h-12">
                    {t("Filter")}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      {data === null ? (
        <TableLoading row={10} col={6} width={163} height={20} />
      ) : !data.documents?.length ? (
        <NotFound title={t("NoAccountingDocuments")} />
      ) : (
        <TableContainer className="mb-8 dark:bg-gray-900">
          <Table>
            <TableHeader>
              <tr>
                <TableCell className="text-center">{t("DocumentNumber")}</TableCell>
                <TableCell className="text-center">{t("DocumentType")}</TableCell>
                <TableCell className="text-center">{t("IssuedAt")}</TableCell>
                <TableCell className="text-center">{t("CustomerName")}</TableCell>
                <TableCell className="text-center">{t("InvoiceNo")}</TableCell>
                <TableCell className="text-center">{t("AmountTbl")}</TableCell>
                <TableCell className="text-center">{t("ActionTbl")}</TableCell>
              </tr>
            </TableHeader>

            <TableBody className="dark:bg-gray-900">
              {data.documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="text-center">
                    <span className="text-sm font-semibold">{doc.documentNumber}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{doc.typeLabel}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{showDateTimeFormat(doc.issuedAt)}</span>
                  </TableCell>
                  <TableCell className="text-center max-w-[10vw] truncate" title={doc.customerName}>
                    <span className="text-sm">{doc.customerName || "—"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link
                      to={`/order/${doc.orderId}`}
                      className="text-sm text-mainColor hover:underline"
                    >
                      {doc.orderNumber || "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">
                      {currency}
                      {getNumberTwo(doc.orderTotal)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex justify-center text-gray-400 hover:text-mainColor"
                        title={t("OpenDocument")}
                      >
                        <FiExternalLink />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default AccountingDocuments;
