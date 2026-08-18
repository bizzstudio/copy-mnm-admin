// src/pages/ProfitReport.jsx
import React, { useEffect, useState } from "react";
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
import { IoCloudDownloadOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import exportFromJSON from "export-from-json";

import PageTitle from "@/components/Typography/PageTitle";
import NotFound from "@/components/table/NotFound";
import TableLoading from "@/components/preloader/TableLoading";
import ReportServices from "@/services/ReportServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

/**
 * דוח רווחיות.
 *
 * הדשבורד עונה על "איך היה החודש". זה עונה על "על מה אנחנו מרוויחים ועל מה לא",
 * וזו שאלה שדורשת חתך — ולכן `groupBy` הוא הפקד הראשי במסך ולא פילטר משני.
 *
 * ── כיסוי העלות מוצג במפורש ─────────────────────────────────────────────────
 * למוצר בלי מחיר עלות אי אפשר לחשב רווח, והוא פשוט לא נכנס לחישוב. בלי להראות
 * את זה, קטלוג שחציו בלי מחירי עלות מציג שיעור רווח מצוין ושקרי. הבאנר למעלה
 * אומר על כמה אחוז מהמכירות הדוח באמת מבוסס.
 */
const GROUP_OPTIONS = [
  { value: "product", labelKey: "GroupByProduct" },
  { value: "category", labelKey: "GroupByCategory" },
  { value: "channel", labelKey: "GroupByChannel" },
  { value: "source", labelKey: "GroupBySource" },
  { value: "customer", labelKey: "GroupByCustomer" },
];

/** כיסוי מתחת לזה — הדוח עדיין שימושי, אבל לא כמדד רווח מוחלט. */
const LOW_COVERAGE = 80;

const ProfitReport = () => {
  const { t } = useTranslation();
  const { currency, getNumber, getNumberTwo } = useUtilsFunction();

  const [groupBy, setGroupBy] = useState("product");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applied, setApplied] = useState({ groupBy: "product", startDate: "", endDate: "" });

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(null);

    ReportServices.getProfitReport({ ...applied, limit: 100 })
      .then((res) => alive && setData(res))
      .catch((err) => alive && setError(err?.displayMessage || err?.message));

    return () => {
      alive = false;
    };
  }, [applied]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setApplied({ groupBy, startDate, endDate });
  };

  const handleExport = () => {
    if (!data?.rows?.length) return;
    exportFromJSON({
      data: data.rows.map((row) => ({
        label: row.label,
        revenue: row.revenue,
        cost: row.cost,
        profit: row.profit,
        marginPct: row.marginPct,
        units: row.units,
        orders: row.orders,
        costCoverage: row.costCoverage,
      })),
      fileName: `profit-${applied.groupBy}`,
      exportType: exportFromJSON.types.csv,
    });
  };

  const totals = data?.totals;
  const lowCoverage = totals && totals.costCoverage < LOW_COVERAGE;

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("ProfitReports")}</PageTitle>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>{t("GroupBy")}</Label>
                <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                  {GROUP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>{t("StartDate")}</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label>{t("EndDate")}</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              <div className="flex items-end gap-2">
                <Button type="submit" className="h-12 w-full">
                  {t("Filter")}
                </Button>
                <Button
                  type="button"
                  layout="outline"
                  className="h-12 w-full"
                  disabled={!data?.rows?.length}
                  onClick={handleExport}
                >
                  <IoCloudDownloadOutline className="me-1" />
                  <span className="text-black dark:text-gray-200">{t("Export")}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {totals && (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-5">
            {[
              { label: t("TotalSales"), value: `${currency}${getNumberTwo(totals.revenue)}` },
              { label: t("TotalCost"), value: `${currency}${getNumberTwo(totals.cost)}` },
              { label: t("GrossProfit"), value: `${currency}${getNumberTwo(totals.grossProfit)}` },
              {
                label: t("MarginPct"),
                value: totals.marginPct === null ? "—" : `${totals.marginPct}%`,
              },
            ].map((kpi) => (
              <Card key={kpi.label} className="min-w-0 shadow-xs bg-white dark:bg-gray-800">
                <CardBody>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-semibold dark:text-gray-200">{kpi.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          <div
            className={`mb-5 rounded-md px-4 py-3 text-sm ${
              lowCoverage
                ? "bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {t("CostCoverageNote", { pct: totals.costCoverage })}
            {lowCoverage && ` ${t("CostCoverageWarning")}`}
          </div>
        </>
      )}

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      {data === null && !error ? (
        <TableLoading row={10} col={7} width={163} height={20} />
      ) : !data?.rows?.length ? (
        <NotFound title={t("NoReportData")} />
      ) : (
        <>
          <TableContainer className="mb-4 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>{t("Name")}</TableCell>
                  <TableCell className="text-center">{t("Units")}</TableCell>
                  <TableCell className="text-center">{t("OrdersCount")}</TableCell>
                  <TableCell className="text-center">{t("Revenue")}</TableCell>
                  <TableCell className="text-center">{t("TotalCost")}</TableCell>
                  <TableCell className="text-center">{t("GrossProfit")}</TableCell>
                  <TableCell className="text-center">{t("MarginPct")}</TableCell>
                  <TableCell className="text-center">{t("ProfitShare")}</TableCell>
                </tr>
              </TableHeader>

              <TableBody className="dark:bg-gray-900">
                {data.rows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell>
                      <span className="text-sm font-medium">{row.label}</span>
                      {row.costCoverage < 100 && (
                        <span
                          className="ms-2 text-xs text-amber-600 dark:text-amber-400"
                          title={t("PartialCostCoverage")}
                        >
                          ({row.costCoverage}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">{getNumber(row.units)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">{getNumber(row.orders)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">
                        {currency}
                        {getNumberTwo(row.revenue)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">
                        {currency}
                        {getNumberTwo(row.cost)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-sm font-semibold ${
                          row.profit < 0 ? "text-red-500" : ""
                        }`}
                      >
                        {currency}
                        {getNumberTwo(row.profit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">
                        {row.marginPct === null ? "—" : `${row.marginPct}%`}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">{row.share}%</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* אמירה מפורשת שזה top-N. טבלה חתוכה בשקט נקראת כאילו זה הכול. */}
          {data.groupCount > data.rows.length && (
            <p className="mb-8 text-center text-xs text-gray-500 dark:text-gray-400">
              {t("ShowingTopRows", { shown: data.rows.length, total: data.groupCount })}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ProfitReport;
