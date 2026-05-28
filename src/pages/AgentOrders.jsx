// src/pages/AgentOrders.jsx
//
// רשימת הזמנות שיצרו סוכני מכירות.
// מבנה זהה ל-CashierOrders.jsx אבל בעמודות מציג שם סוכן + סוג (הזמנה/הצעה) + סטטוס.
// משתמש ב-OrderTable עם isAgentOrders=true.

import {
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  Select as SelectReactSelect,
} from "@windmill/react-ui";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { SidebarContext } from "@/context/SidebarContext";
import { notifyError } from "@/utils/toast";
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import OrderServices from "@/services/OrderServices";
import OrderTable from "@/components/order/OrderTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import CustomPagination from "@/components/table/CustomPagination";

const AgentOrders = () => {
  const {
    time,
    setTime,
    endDate,
    setEndDate,
    startDate,
    currentPage,
    searchText,
    searchRef,
    setStartDate,
    setSearchText,
    handleChangePage,
    handleSubmitForAll,
  } = useContext(SidebarContext);

  const { t } = useTranslation();

  // העמוד הזה מציג רק הזמנות. הצעות מחיר נצפות בנפרד מאפליקציית הסוכן.
  const { data, loading, error } = useAsync(() =>
    OrderServices.getAllAgentOrders({
      page: currentPage,
      limit: 100,
      customerName: searchText,
      startDate,
      endDate,
      type: "order",
    })
  );

  const { currency, getNumber } = useUtilsFunction();
  const { dataTable, serviceData } = useFilter(data?.orders);

  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const handleResetField = () => {
    setTime("");
    setEndDate("");
    setStartDate("");
    setSearchText("");
    if (searchRef.current) searchRef.current.value = "";
    setStartDateInput("");
    setEndDateInput("");
  };

  // לוגיקת תקופה זהה ל-CashierOrders
  const handleLimitChange = (e) => {
    const value = e.target.value;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    let s, en;
    switch (value) {
      case "thisMonth":
        s = new Date(year, month, 1);
        en = today;
        break;
      case "lastMonth":
        if (month === 0) {
          s = new Date(year - 1, 11, 1);
          en = new Date(year - 1, 11, 31);
        } else {
          s = new Date(year, month - 1, 1);
          en = new Date(year, month, 0);
        }
        break;
      case "thisYear":
        s = new Date(year, 0, 1);
        en = today;
        break;
      case "7":
        s = new Date(today);
        s.setDate(today.getDate() - 6);
        en = today;
        break;
      case "30":
        s = new Date(today);
        s.setDate(today.getDate() - 30);
        en = today;
        break;
      default:
        setTime(value);
        return;
    }
    const fmt = (d) => {
      const ld = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return ld.toISOString().split("T")[0];
    };
    setStartDate(s);
    setEndDate(en);
    setStartDateInput(fmt(s));
    setEndDateInput(fmt(en));
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("AgentOrdersPageTitle")}</PageTitle>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form onSubmit={handleSubmitForAll}>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 py-2">
              {/* חיפוש */}
              <div title={t("SearchOrder")} className="md:col-span-2 xl:col-span-1">
                <Label>{t("SearchOrderLabel")}</Label>
                <Input
                  ref={searchRef}
                  type="search"
                  name="search"
                  placeholder={t("SearchAgentOrder")}
                />
              </div>

              {/* תקופה */}
              <div className="md:col-span-1 xl:col-span-1">
                <Label>{t("Orderlimits")}</Label>
                <SelectReactSelect onChange={handleLimitChange}>
                  <option value="Order limits" defaultValue hidden>
                    {t("Orderlimits")}
                  </option>
                  <option value="thisMonth">{t("thisMonth")}</option>
                  <option value="lastMonth">{t("lastMonth")}</option>
                  <option value="thisYear">{t("thisYear")}</option>
                  <option value="7">{t("DaysOrders7")}</option>
                  <option value="30">{t("DaysOrders30")}</option>
                </SelectReactSelect>
              </div>

              {/* תאריך התחלה */}
              <div className="md:col-span-1 xl:col-span-1">
                <Label>{t("StartDate")}</Label>
                <Input
                  type="date"
                  name="startDate"
                  value={startDateInput}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setStartDateInput(e.target.value);
                  }}
                />
              </div>

              {/* תאריך סיום */}
              <div className="md:col-span-1 xl:col-span-1">
                <Label>{t("EndDate")}</Label>
                <Input
                  type="date"
                  name="endDate"
                  value={endDateInput}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setEndDateInput(e.target.value);
                  }}
                />
              </div>

              {/* כפתורים */}
              <div className="md:col-span-2 lg:col-span-2 xl:col-span-1 flex justify-center items-end gap-2">
                <Button type="submit" className="h-12 w-full bg-customGreen-dark text-xs">
                  {t("Filter")}
                </Button>
                <Button
                  layout="outline"
                  onClick={handleResetField}
                  type="reset"
                  className="h-12! w-full px-3 text-xs dark:bg-gray-700"
                >
                  <span className="text-black dark:text-gray-200">{t("Reset")}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* כרטיס סיכומים */}
      {data && (
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 rounded-t-lg rounded-0 mb-4">
          <CardBody>
            <div className="flex flex-col md:flex-row justify-evenly gap-2">
              <div className="dark:text-gray-300">
                <span className="font-medium">{t("TotalOrder")}</span> :{" "}
                <span className="font-semibold">{getNumber(data?.totalDoc)}</span>
              </div>
              <span className="md:w-0.5 w-full md:h-6 h-0.5 bg-gray-800 dark:bg-gray-300" />

              <div className="dark:text-gray-300">
                <span className="font-medium">{t("TotalIncome")}</span> :{" "}
                <span className="font-semibold">{currency}{data?.totalAmount || 0}</span>
              </div>
              <span className="md:w-0.5 w-full md:h-6 h-0.5 bg-gray-800 dark:bg-gray-300" />

              <div className="dark:text-gray-300">
                <span className="font-medium">{t("TotalDiscount")}</span> :{" "}
                <span className="font-semibold">{currency}{data?.totalDiscount || 0}</span>
              </div>
              <span className="md:w-0.5 w-full md:h-6 h-0.5 bg-gray-800 dark:bg-gray-300" />

              <div className="dark:text-gray-300">
                <span className="font-medium">{t("TotalBeforeDiscount")}</span> :{" "}
                <span className="font-semibold">{currency}{data?.totalSubTotal || 0}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <TableLoading row={12} col={11} width={163} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8 dark:bg-gray-900">
          <Table>
            <TableHeader>
              <tr>
                <TableCell className="text-center">{t("InvoiceNo")}</TableCell>
                <TableCell className="text-center">{t("orderCreation")}</TableCell>
                <TableCell className="text-center">{t("orderUpdate")}</TableCell>
                <TableCell className="text-center">{t("AgentName")}</TableCell>
                <TableCell className="text-center">{t("CustomerName")}</TableCell>
                <TableCell className="text-center">{t("CustomerPhone")}</TableCell>
                <TableCell className="text-center">{t("ProductCount")}</TableCell>
                <TableCell className="text-center">{t("AgentDiscount")}</TableCell>
                <TableCell className="text-center">{t("Total")}</TableCell>
                <TableCell className="text-center">{t("Status")}</TableCell>
                <TableCell className="text-center">{t("ActionTbl")}</TableCell>
              </tr>
            </TableHeader>

            <OrderTable orders={data?.orders} isAgentOrders={true} />
          </Table>

          <TableFooter>
            <CustomPagination
              totalResults={data?.totalDoc}
              resultsPerPage={100}
              onChange={handleChangePage}
              label={t("Table navigation")}
              currentPage={currentPage}
              loading={loading}
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title={t("NoAgentOrders")} />
      )}
    </div>
  );
};

export default AgentOrders;
