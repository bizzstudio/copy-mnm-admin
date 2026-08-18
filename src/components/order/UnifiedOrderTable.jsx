// src/components/order/UnifiedOrderTable.jsx
import React from "react";
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiZoomIn } from "react-icons/fi";
import { Link } from "react-router-dom";

// Internal import
import Tooltip from "@/components/tooltip/Tooltip";
import OrderSource from "@/components/order/OrderSource";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import PrintReceipt from "@/components/form/others/PrintReceipt";
import SelectStatus from "@/components/form/selectOption/SelectStatus";

/**
 * שורה אחת לכל הזמנה, מכל מקור.
 *
 * `OrderTable` הישן היה שלוש טבלאות בתוך רכיב אחד — `isCashierOrders` ו-
 * `isAgentOrders` החליפו את רוב העמודות, ולכן כל עמודה חדשה הייתה צריכה להיכתב
 * שלוש פעמים או להישכח בשתיים. כאן העמודות קבועות, והנרמול כבר קרה בשרת
 * (`services/orderListService.js`), כך שערוץ מכירה חדש מתווסף בלי לגעת בקובץ הזה.
 *
 * ההבדל היחיד שנשאר הוא בפעולות: להזמנת קופה יש מסך חשבונית משלה ואין לה סטטוס,
 * כי היא נסגרת ברגע שנוצרה. זה הבדל אמיתי בדומיין ולא הבדל בתצוגה.
 */
const UnifiedOrderTable = ({ orders }) => {
  const { t } = useTranslation();
  const { showDateTimeFormat, currency, getNumberTwo } = useUtilsFunction();

  return (
    <TableBody className="dark:bg-gray-900">
      {orders?.map((order) => (
        <TableRow key={order._id} className={order?.status?.name || ""}>
          <TableCell className="text-center">
            <span className="font-semibold uppercase text-xs">
              {order?.orderNumber || order?.invoice || "—"}
            </span>
          </TableCell>

          <TableCell className="text-center">
            <OrderSource source={order?.source} />
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm">{showDateTimeFormat(order?.createdAt)}</span>
          </TableCell>

          <TableCell
            className="text-center max-w-[10vw] overflow-hidden truncate"
            title={order?.customerName || t("NotAvailable")}
          >
            <span className="text-sm">{order?.customerName || t("NotAvailable")}</span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm">{order?.customerPhone || "—"}</span>
          </TableCell>

          {/* מי רשם את ההזמנה — סוכן או קופאי. ריק להזמנת חנות, וזה המידע. */}
          <TableCell
            className="text-center max-w-[8vw] overflow-hidden truncate"
            title={order?.agentName || order?.cashierName || ""}
          >
            <span className="text-sm">{order?.agentName || order?.cashierName || "—"}</span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm font-semibold">
              {order?.shippingCost > 0
                ? `${t("Shipping")}${order?.cityName ? ` - ${order.cityName}` : ""}`
                : t("pickup")}
            </span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm font-semibold">
              {currency}
              {getNumberTwo(order?.total)}
            </span>
          </TableCell>

          <TableCell className="text-center">
            {order?.isCashierOrder ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">{t("SourceCashier")}</span>
            ) : (
              <SelectStatus id={order._id} order={order} />
            )}
          </TableCell>

          <TableCell className="text-center">
            <div className="flex justify-center items-center">
              <PrintReceipt orderId={order._id} isCashierOrder={order?.isCashierOrder} />

              <span className="p-2 cursor-pointer text-gray-400 hover:text-customGreen-dark">
                <Link
                  to={order?.isCashierOrder ? `/cashier-order/${order._id}` : `/order/${order._id}`}
                >
                  <Tooltip id="view" Icon={FiZoomIn} title={t("ViewInvoice")} bgColor="#059669" />
                </Link>
              </span>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default UnifiedOrderTable;
