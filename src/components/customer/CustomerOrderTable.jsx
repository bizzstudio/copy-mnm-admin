// src/components/customer/CustomerOrderTable.jsx
import React from "react";
import { TableCell, TableBody, TableRow, Badge } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiZoomIn } from "react-icons/fi";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import SelectStatus from "@/components/form/selectOption/SelectStatus";
import PrintReceipt from "@/components/form/others/PrintReceipt";
import Tooltip from "@/components/tooltip/Tooltip";

const CustomerOrderTable = ({ orders }) => {
  const { showDateTimeFormat, getNumberTwo, currency } = useUtilsFunction();
  const { t } = useTranslation();

  return (
    <TableBody>
      {orders?.map((order) => (
        <TableRow key={order._id}>
          {/* Invoice Number */}
          <TableCell className="font-semibold text-sm text-center">
            {order?.invoice || order?._id?.substring(20, 24)}
          </TableCell>

          {/* Order Date */}
          <TableCell className="text-sm text-center">
            {showDateTimeFormat(order.createdAt)}
          </TableCell>

          {/* Order Update Time */}
          <TableCell className="text-sm text-center">
            {showDateTimeFormat(order.updatedAt)}
          </TableCell>

          {/* Shipping Method */}
          <TableCell className="text-center">
            <span className="text-sm font-semibold">
              {order?.shippingCost > 0
                ? t("Shipping") + " - " + (order?.user_info?.address?.city?.city_name_he || "")
                : t("pickup")}
            </span>
          </TableCell>

          {/* Total Amount */}
          <TableCell className="text-sm font-semibold text-center">
            {currency}{getNumberTwo(order.total)}
          </TableCell>

          {/* Payment Status */}
          <TableCell className="text-center">
            {order[order.paymentProvider]?.isPaid ? (
              <Badge type="success">{t("Paid")}</Badge>
            ) : (
              <Badge type="warning">{t("Unpaid")}</Badge>
            )}
          </TableCell>

          {/* Payment Method */}
          <TableCell className="text-center">
            <span className="text-sm">
              {order?.paymentMethod === "credit"
                ? t("Credit")
                : order?.paymentMethod === "card"
                ? t("CreditCard")
                : t(order?.paymentMethod || "N/A")}
            </span>
          </TableCell>

          {/* Order Status - Interactive */}
          <TableCell className="text-center">
            <div className="flex justify-center">
              <SelectStatus id={order._id} order={order} />
            </div>
          </TableCell>

          {/* Actions */}
          <TableCell className="text-center">
            <div className="flex justify-center items-center gap-2">
              <PrintReceipt orderId={order._id} isCashierOrder={false} />

              <span className="cursor-pointer text-gray-400 hover:text-customGreen-dark">
                <Link to={`/order/${order._id}`}>
                  <Tooltip
                    id="view"
                    Icon={FiZoomIn}
                    title={t("ViewInvoice")}
                    bgColor="#059669"
                  />
                </Link>
              </span>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default CustomerOrderTable;