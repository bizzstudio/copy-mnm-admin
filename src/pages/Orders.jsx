// src/pages/Orders.jsx
//
// מסך ההזמנות. אחד, לכל הערוצים.
//
// היו שלושה — /orders, /cashier-orders, /agent-orders — שכל אחד מהם שאל endpoint
// אחר, הציג עמודות אחרות וסיכם אחרת. הם אותו אובייקט משלוש דלתות, והפרדתם היא
// הסיבה שלשאלה "כמה הזמנות היו אתמול" לא הייתה תשובה אחת. עמודת "מקור" מחליפה
// אותם, והפילטר שלה הוא מה שהופך את שני הנתיבים הישנים ל-redirect.
import React, { useContext, useEffect, useState } from "react";
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
import { IoCloudDownloadOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import exportFromJSON from "export-from-json";

// Internal import
import { notifyError } from "@/utils/toast";
import useAsync from "@/hooks/useAsync";
import OrderServices from "@/services/OrderServices";
import StatusServices from "@/services/StatusService";
import DeliveryServices from "@/services/DeliveryServices";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import { useModules } from "@/context/ModulesContext";
import UnifiedOrderTable from "@/components/order/UnifiedOrderTable";
import { ORDER_SOURCES } from "@bizzexpo/shared";
import { useOrderSourceLabel } from "@/components/order/OrderSource";
import TableLoading from "@/components/preloader/TableLoading";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import SelectWithCheckbox from "@/components/form/SelectWithCheckbox";
import CustomPagination from "@/components/table/CustomPagination";

const PAGE_SIZE = 100;

const Orders = () => {
  const {
    time,
    setTime,
    statuses,
    endDate,
    setStatuses,
    setEndDate,
    startDate,
    currentPage,
    setCurrentPage,
    searchText,
    searchRef,
    method,
    setMethod,
    source,
    setSource,
    setStartDate,
    setSearchText,
    handleChangePage,
    handleSubmitForAll,
    setCities,
    cities,
  } = useContext(SidebarContext);

  const { t } = useTranslation();
  const sourceLabel = useOrderSourceLabel();
  const { isModuleEnabled } = useModules();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loadingExport, setLoadingExport] = useState(false);
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  /**
   * `?source=agent` בכתובת הוא מה שמחזיק את /agent-orders ו-/cashier-orders בחיים
   * כ-redirect: סימנייה ישנה נוחתת על אותו מסך עם הפילטר כבר מוגדר, במקום על 404.
   *
   * הכתובת היא המקור, לא ה-state — כך "שתף לי את הרשימה הזו" עובד.
   */
  const urlSource = searchParams.get("source") || "";
  useEffect(() => {
    if (urlSource !== source) setSource(urlSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSource]);

  const handleSourceChange = (e) => {
    const next = e.target.value;
    setCurrentPage(1);
    setSource(next);
    if (next) searchParams.set("source", next);
    else searchParams.delete("source");
    setSearchParams(searchParams, { replace: true });
  };

  const { data, loading, error } = useAsync(() =>
    OrderServices.getAllOrders({
      day: time,
      cities,
      method,
      source,
      statuses,
      page: currentPage,
      endDate,
      startDate,
      limit: PAGE_SIZE,
      customerName: searchText,
    })
  );

  const { data: statusData } = useAsync(StatusServices.getAllStatuses);
  const { data: cityData } = useAsync(DeliveryServices.getAllDeliveries);

  const { currency, getNumber, getNumberTwo } = useUtilsFunction();

  const handleDownloadOrders = async () => {
    try {
      setLoadingExport(true);
      const res = await OrderServices.getAllOrders({
        page: 1,
        day: time,
        method,
        source,
        statuses,
        endDate,
        startDate,
        cities,
        // הייצוא מוריד את מה שהמסך מציג, ולא רק את העמוד הנוכחי
        limit: Math.max(data?.totalDoc || 0, 1),
        customerName: searchText,
      });

      const exportData = res?.orders?.map((order) => ({
        orderNumber: order.orderNumber || order.invoice,
        source: order.source,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        agentOrCashier: order.agentName || order.cashierName || "",
        city: order.cityName || "",
        shippingCost: getNumberTwo(order.shippingCost),
        discount: getNumberTwo(order.discount),
        total: getNumberTwo(order.total),
        paymentMethod: order.paymentMethod,
        status: order.status?.heName || order.status?.name || "",
        createdAt: order.createdAt,
      }));

      exportFromJSON({
        data: exportData || [],
        fileName: "orders",
        exportType: exportFromJSON.types.csv,
      });
    } catch (err) {
      notifyError(err?.displayMessage || err?.message);
    } finally {
      setLoadingExport(false);
    }
  };

  const handleResetField = () => {
    setTime("");
    setMethod("");
    setStatuses([]);
    setEndDate("");
    setStartDate("");
    setSearchText("");
    if (searchRef.current) searchRef.current.value = "";
    setStartDateInput("");
    setEndDateInput("");
    setCities([]);
    setSource("");
    searchParams.delete("source");
    setSearchParams(searchParams, { replace: true });
  };

  const handleLimitChange = (e) => {
    const value = e.target.value;
    let start, end;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (value) {
      case "thisMonth":
        start = new Date(year, month, 1);
        end = today;
        break;
      case "lastMonth":
        if (month === 0) {
          start = new Date(year - 1, 11, 1);
          end = new Date(year - 1, 11, 31);
        } else {
          start = new Date(year, month - 1, 1);
          end = new Date(year, month, 0);
        }
        break;
      case "thisYear":
        start = new Date(year, 0, 1);
        end = today;
        break;
      case "7":
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        end = today;
        break;
      case "30":
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        end = today;
        break;
      default:
        setTime(value);
        return;
    }

    const formatDateToLocal = (date) => {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().split("T")[0];
    };

    setStartDate(start);
    setEndDate(end);
    setStartDateInput(formatDateToLocal(start));
    setEndDateInput(formatDateToLocal(end));
  };

  const handleStatusChange = (selectedOptions) =>
    setStatuses(selectedOptions.map((option) => option.value));

  const handleCityChange = (selectedOptions) =>
    setCities(selectedOptions.map((option) => option.value));

  const statusOptions = (statusData || []).map((status) => ({
    value: status.name,
    label: status.heName,
    isSelected: statuses.includes(status.name),
  }));

  const cityOptions = (cityData || []).map((cityObj) => ({
    value: cityObj?.city?._id,
    label: cityObj?.city?.city_name_he,
    isSelected: cities.includes(cityObj?.city?._id),
  }));

  /**
   * ערוץ שהמודול שלו כבוי לא מוצג כאפשרות — אין ולא יהיו בו הזמנות.
   *
   * `moduleKey: null` הוא הבק-אופיס, ו-`isModuleEnabled` מחזיר לו true: הוא קיים
   * לכל לקוח שיש לו בכלל דרך להיכנס למסך הזה.
   */
  const availableSources = ORDER_SOURCES.filter((channel) =>
    isModuleEnabled(channel.moduleKey)
  );

  /** ספירה לכל ערוץ, מאותה שאילתה שהחזירה את השורות — לא קריאה שנייה. */
  const countBySource = Object.fromEntries(
    (data?.bySource || []).map((row) => [row._id, row.count])
  );

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("AllOrders")}</PageTitle>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form onSubmit={handleSubmitForAll}>
            <div className="grid gap-4 lg:gap-4 xl:gap-6 md:gap-2 md:grid-cols-6 py-2">
              <div title={t("SearchOrder")} className="col-span-2">
                <Label>{t("SearchOrderLabel")}</Label>
                <Input
                  ref={searchRef}
                  type="search"
                  name="search"
                  placeholder={t("SearchOrder")}
                />
              </div>

              {/* מקור ההזמנה — הפילטר שהחליף שני מסכים */}
              <div className="flex flex-col">
                <Label>{t("OrderSource")}</Label>
                <SelectReactSelect value={source} onChange={handleSourceChange}>
                  <option value="">{t("AllSources")}</option>
                  {availableSources.map(({ source: key }) => (
                    <option key={key} value={key}>
                      {sourceLabel(key)}
                      {countBySource[key] ? ` (${countBySource[key]})` : ""}
                    </option>
                  ))}
                </SelectReactSelect>
              </div>

              <div className="flex flex-col justify-end">
                <SelectWithCheckbox
                  placeholder={t("selectStatus")}
                  options={statusOptions}
                  onChange={handleStatusChange}
                />
              </div>

              <div className="flex flex-col justify-end">
                <SelectWithCheckbox
                  placeholder={t("Delivery Destination")}
                  options={cityOptions}
                  onChange={handleCityChange}
                />
              </div>

              <div className="flex flex-col justify-end">
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
            </div>

            <div className="grid gap-4 lg:gap-6 xl:gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 py-2">
              <div>
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

              <div>
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

              <div className="mt-2 md:mt-0 flex items-center gap-x-2">
                <div className="w-full">
                  <Label style={{ visibility: "hidden" }}>{t("Filter")}</Label>
                  <Button type="submit" className="h-12 w-full bg-customGreen-dark">
                    {t("Filter")}
                  </Button>
                </div>

                <div className="w-full">
                  <Label style={{ visibility: "hidden" }}>{t("Reset")}</Label>
                  <Button
                    layout="outline"
                    onClick={handleResetField}
                    type="reset"
                    className="px-4 md:py-1 py-3 text-sm dark:bg-gray-700 w-full"
                  >
                    <span className="text-black dark:text-gray-200">{t("Reset")}</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-end">
                {loadingExport ? (
                  <Button disabled type="button" className="h-12 w-full">
                    <img src={spinnerLoadingImage} alt="Loading" width={20} height={10} />{" "}
                    <span className="font-serif ml-2 font-light">Processing</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleDownloadOrders}
                    disabled={!data?.totalDoc}
                    type="button"
                    className={`${
                      !data?.totalDoc && "opacity-50 cursor-not-allowed bg-customGreen-dark"
                    } flex items-center justify-center h-12 w-full`}
                  >
                    <IoCloudDownloadOutline className="me-1" />
                    {t("DownloadAllOrders")}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {data && (
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 rounded-t-lg rounded-0 mb-4">
          <CardBody>
            <div className="flex flex-wrap justify-evenly gap-3">
              <div className="dark:text-gray-300">
                <span className="font-medium">{t("TotalOrder")}</span> :{" "}
                <span className="font-semibold">{getNumber(data?.totalDoc)}</span>
              </div>
              <span className="w-0.5 h-6 bg-gray-800 dark:bg-gray-300" />

              <div className="dark:text-gray-300">
                <span className="font-medium">{t("TotalShippingOrder")}</span> :{" "}
                <span className="font-semibold">{getNumber(data?.totalShippingOrders)}</span>
              </div>
              <span className="w-0.5 h-6 bg-gray-800 dark:bg-gray-300" />

              <div className="dark:text-gray-300">
                <span className="font-medium">{t("TotalPickupOrder")}</span> :{" "}
                <span className="font-semibold">{getNumber(data?.totalPickupOrders)}</span>
              </div>
              <span className="w-0.5 h-6 bg-gray-800 dark:bg-gray-300" />

              <div className="dark:text-gray-300">
                <span className="font-medium">{t("TotalIncome")}</span> :{" "}
                <span className="font-semibold">
                  {currency}
                  {getNumberTwo(data?.totalAmount)}
                </span>
              </div>
              <span className="w-0.5 h-6 bg-gray-800 dark:bg-gray-300" />

              <div className="dark:text-gray-300">
                <span className="font-medium">{t("TotalBonuses")}</span> :{" "}
                <span className="font-semibold">
                  {currency}
                  {getNumberTwo(data?.totalBonuses)}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <TableLoading row={12} col={10} width={163} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : data?.orders?.length ? (
        <TableContainer className="mb-8 dark:bg-gray-900">
          <Table>
            <TableHeader>
              <tr>
                <TableCell className="text-center">{t("InvoiceNo")}</TableCell>
                <TableCell className="text-center">{t("OrderSource")}</TableCell>
                <TableCell className="text-center">{t("orderCreation")}</TableCell>
                <TableCell className="text-center">{t("CustomerName")}</TableCell>
                <TableCell className="text-center">{t("CustomerPhone")}</TableCell>
                <TableCell className="text-center">{t("RaisedBy")}</TableCell>
                <TableCell className="text-center">{t("ShippingMethod")}</TableCell>
                <TableCell className="text-center">{t("AmountTbl")}</TableCell>
                <TableCell className="text-center">{t("OderStatusTbl")}</TableCell>
                <TableCell className="text-center">{t("ActionTbl")}</TableCell>
              </tr>
            </TableHeader>

            <UnifiedOrderTable orders={data.orders} />
          </Table>

          <TableFooter>
            <CustomPagination
              totalResults={data?.totalDoc}
              resultsPerPage={PAGE_SIZE}
              onChange={handleChangePage}
              label={t("Table navigation")}
              currentPage={currentPage}
              loading={loading}
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title={t("NoOrders")} />
      )}
    </div>
  );
};

export default Orders;
