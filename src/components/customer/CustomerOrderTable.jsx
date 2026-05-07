// src/components/customer/CustomerOrderTable.jsx
import React from "react";
import { TableCell, TableBody, TableRow, Badge } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiZoomIn, FiFileText, FiFile, FiPackage, FiTruck, FiRefreshCw } from "react-icons/fi";
import { IoReceiptOutline } from "react-icons/io5";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import SelectStatus from "@/components/form/selectOption/SelectStatus";
import PrintReceipt from "@/components/form/others/PrintReceipt";
import Tooltip from "@/components/tooltip/Tooltip";
import PaymentMethodDisplay from "@/components/customer/PaymentMethodDisplay";

const CustomerOrderTable = ({ orders, showCustomerColumn = false }) => {
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

          {/* Sub-customer (for business/institutional main customers) */}
          {showCustomerColumn && (
            <TableCell className="text-center">
              <div className="text-sm">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {order?.user?.name} {order?.user?.lastName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {order?.user?.email || ""}
                </div>
              </div>
            </TableCell>
          )}

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
            <PaymentMethodDisplay paymentMethod={order?.paymentMethod} />
          </TableCell>

          {/* Order Status - Interactive */}
          <TableCell className="text-center">
            <div className="flex justify-center">
              <SelectStatus id={order._id} order={order} />
            </div>
          </TableCell>

          {/* Actions */}
          <TableCell className="text-center">
            <div className="flex justify-center items-center gap-0.5">
              {/* הדפסת הזמנה */}
              <PrintReceipt orderId={order._id} isCashierOrder={false} />

              {/* צפייה בחשבונית מס */}
              {order?.accountingDocs?.invoice?.url && (
                <span className="p-1.5 cursor-pointer text-gray-400 hover:text-customGreen-dark">
                  <a
                    href={order.accountingDocs.invoice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("ViewInvoiceDoc")}
                  >
                    <Tooltip
                      id={`invoice-${order._id}`}
                      Icon={FiFile}
                      title={
                        order.accountingDocs.invoice.confirmation_number
                          ? `${t("ViewInvoiceDoc")} | ${t("ConfirmationNumber")}: ${order.accountingDocs.invoice.confirmation_number}`
                          : t("ViewInvoiceDoc")
                      }
                      bgColor="#059669"
                    />
                  </a>
                </span>
              )}

              {/* צפייה בחשבונית מס קבלה */}
              {order?.accountingDocs?.invoiceReceipt?.url && (
                <span className="p-1.5 cursor-pointer text-gray-400 hover:text-customGreen-dark">
                  <a
                    href={order.accountingDocs.invoiceReceipt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("ViewInvoiceReceipt")}
                  >
                    <Tooltip
                      id={`invoice-receipt-${order._id}`}
                      Icon={FiFileText}
                      title={
                        order.accountingDocs.invoiceReceipt.confirmation_number
                          ? `${t("ViewInvoiceReceipt")} | ${t("ConfirmationNumber")}: ${order.accountingDocs.invoiceReceipt.confirmation_number}`
                          : t("ViewInvoiceReceipt")
                      }
                      bgColor="#059669"
                    />
                  </a>
                </span>
              )}

              {/* צפייה בקבלה */}
              {order?.accountingDocs?.receipt?.url && (
                <span className="p-1.5 cursor-pointer text-gray-400 hover:text-customGreen-dark">
                  <a
                    href={order.accountingDocs.receipt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("ViewReceipt")}
                  >
                    <Tooltip
                      id={`receipt-${order._id}`}
                      Icon={IoReceiptOutline}
                      title={t("ViewReceipt")}
                      bgColor="#059669"
                    />
                  </a>
                </span>
              )}

              {/* צפייה בתעודת משלוח */}
              {order?.accountingDocs?.deliveryNote?.url && (
                <span className="p-1.5 cursor-pointer text-gray-400 hover:text-customGreen-dark">
                  <a
                    href={order.accountingDocs.deliveryNote.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("ViewDeliveryNote")}
                  >
                    <Tooltip
                      id={`delivery-note-${order._id}`}
                      Icon={FiPackage}
                      title={t("ViewDeliveryNote")}
                      bgColor="#059669"
                    />
                  </a>
                </span>
              )}

              {/* צפייה בתעודת-משלוח (מקף, סוג מסמך נפרד בריווחית) */}
              {order?.accountingDocs?.deliveryNoteHyphen?.url && (
                <span className="p-1.5 cursor-pointer text-gray-400 hover:text-customGreen-dark">
                  <a
                    href={order.accountingDocs.deliveryNoteHyphen.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("ViewDeliveryNoteHyphen")}
                  >
                    <Tooltip
                      id={`delivery-note-hyphen-${order._id}`}
                      Icon={FiTruck}
                      title={t("ViewDeliveryNoteHyphen")}
                      bgColor="#059669"
                    />
                  </a>
                </span>
              )}

              {/* צפייה בחשבונית זיכוי */}
              {order?.accountingDocs?.creditInvoice?.url && (
                <span className="p-1.5 cursor-pointer text-gray-400 hover:text-customGreen-dark">
                  <a
                    href={order.accountingDocs.creditInvoice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("ViewCreditInvoice")}
                  >
                    <Tooltip
                      id={`credit-invoice-${order._id}`}
                      Icon={FiRefreshCw}
                      title={
                        order.accountingDocs.creditInvoice.confirmation_number
                          ? `${t("ViewCreditInvoice")} | ${t("ConfirmationNumber")}: ${order.accountingDocs.creditInvoice.confirmation_number}`
                          : t("ViewCreditInvoice")
                      }
                      bgColor="#059669"
                    />
                  </a>
                </span>
              )}

              {/* צפייה בהזמנה */}
              <span className="p-1.5 cursor-pointer text-gray-400 hover:text-customGreen-dark">
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