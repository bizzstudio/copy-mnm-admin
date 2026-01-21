// src/components/invoice/InvoiceForPrint.jsx
import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
  Badge,
} from "@windmill/react-ui";

// Internal imports
import useUtilsFunction from "@/hooks/useUtilsFunction";
import Status from "@/components/table/Status";
import InfoField from "@/components/common/InfoField";

const InvoiceForPrint = forwardRef(({ data, globalSetting, storeCustomizationSetting }, ref) => {
  const { t } = useTranslation();
  const { currency, getNumberTwo, showDateTimeFormat, showDateFormat } = useUtilsFunction();

  return (
    <div ref={ref} className="w-full p-6 bg-white" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {t("Order")} #{data?.invoice}
          </h1>
          <div className="flex items-center gap-3 mb-2">
            <Status status={data?.status} />
            {data?.[data?.paymentProvider]?.isPaid ? (
              <Badge type="success">{t("Paid")}</Badge>
            ) : (
              <Badge type="warning">{t("Unpaid")}</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {t("OrderDate")}: {showDateTimeFormat(data?.createdAt)}
          </p>
        </div>
        <div className="text-left flex flex-col items-end">
          {storeCustomizationSetting?.footer?.block4_logo && (
            <img
              src={storeCustomizationSetting?.footer?.block4_logo}
              alt="Logo"
              width="100"
              className="mb-2"
            />
          )}
          <p className="text-xs text-gray-600 text-right">
            {globalSetting?.address}<br />
            {globalSetting?.contact}<br />
            {globalSetting?.email}
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-4">
        <h2 className="text-base font-bold mb-2 text-gray-700">
          {t("Customer Information")}
        </h2>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
          <InfoField
            label={t("Customer Name")}
            value={`${data?.user_info?.name || ""} ${data?.user_info?.lastName || ""}`}
          />
          <InfoField
            label={t("Email")}
            value={data?.user_info?.email}
          />
          <InfoField
            label={t("Phone")}
            value={data?.user_info?.contact}
          />
          <InfoField
            label={t("City")}
            value={data?.user_info?.address?.city?.city_name_he}
          />
          <InfoField
            label={t("Street")}
            value={data?.user_info?.address?.street}
          />
          <InfoField
            label={t("House Number")}
            value={data?.user_info?.address?.houseNumber}
          />
          <InfoField
            label={t("Apartment Number")}
            value={data?.user_info?.address?.apartmentNumber}
          />
          <InfoField
            label={t("Floor")}
            value={data?.user_info?.address?.floor}
          />
          <InfoField
            label={t("Entry Code")}
            value={data?.user_info?.address?.entryCode}
          />
          {data?.user_info?.priceList && (
            <InfoField
              label={t("Customer Price List")}
              value={data?.user_info?.priceList?.name}
              className="col-span-3"
            />
          )}
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-4">
        <h2 className="text-base font-bold mb-2 text-gray-700">
          {t("Payment Information")}
        </h2>
        <div className="grid grid-cols-4 gap-x-4 gap-y-2">
          <InfoField
            label={t("Payment Status")}
            value={
              data?.[data?.paymentProvider]?.isPaid ? (
                <Badge type="success">{t("Paid")}</Badge>
              ) : (
                <Badge type="warning">{t("Unpaid")}</Badge>
              )
            }
          />
          <InfoField
            label={t("Payment Method")}
            value={data?.paymentMethod === "credit" ? t("Credit") : data?.paymentMethod === "card" ? t("CreditCard") : t(data?.paymentMethod)}
          />
          <InfoField
            label={t("Payment Amount")}
            value={data?.[data?.paymentProvider]?.isPaid ? `${currency}${getNumberTwo(data?.total)}` : "-"}
          />
          <InfoField
            label={t("Payment Date")}
            value={data?.[data?.paymentProvider]?.paidAt ? showDateTimeFormat(data[data.paymentProvider].paidAt) : "-"}
          />
        </div>
      </div>

      {/* Order Details */}
      <div className="mb-4">
        <h2 className="text-base font-bold mb-2 text-gray-700">
          {t("Order Details")}
        </h2>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
          <InfoField
            label={t("Shipping Method")}
            value={data?.shippingCost > 0 ? t("Shipping") : t("pickup")}
          />
          <InfoField
            label={t("Call On Arrival")}
            value={data?.callOnArrival ? t("Yes") : t("No")}
          />
          {data?.customerSatisfaction && (
            <InfoField
              label={t("Customer Satisfaction")}
              value={`${data?.customerSatisfaction}/3`}
            />
          )}
          {data?.bonus > 0 && (
            <InfoField
              label={t("Picker Bonus")}
              value={`${currency}${getNumberTwo(data?.bonus)}`}
            />
          )}
          {data?.customer_note && (
            <InfoField
              label={t("Customer Note")}
              value={data?.customer_note}
              className="col-span-3"
            />
          )}
          {data?.coupon && (
            <InfoField
              label={t("Coupon Used")}
              value={data?.coupon?.couponCode || t("Yes")}
            />
          )}
          {data?.usedOfferIds?.length > 0 && (
            <InfoField
              label={t("Offers Used")}
              value={`${data?.usedOfferIds?.length} ${t("offers")}`}
            />
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-4">
        <h2 className="text-base font-bold mb-2 text-gray-700">
          {t("Order Products")}
        </h2>
        <Table>
          <TableHeader>
            <tr className="bg-gray-50">
              <TableCell className="font-bold text-sm py-2">{t("Sr")}</TableCell>
              <TableCell className="font-bold text-sm py-2">{t("ProductTitle")}</TableCell>
              <TableCell className="text-center font-bold text-sm py-2">{t("Quantity")}</TableCell>
              <TableCell className="text-center font-bold text-sm py-2">{t("ItemPrice")}</TableCell>
              <TableCell className="text-right font-bold text-sm py-2">{t("Amount")}</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {data?.cart?.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="py-2 text-sm">{i + 1}</TableCell>
                <TableCell className="py-2 text-sm font-semibold">{item.title.he}</TableCell>
                <TableCell className="text-center py-2 text-sm font-bold">{item.quantity}</TableCell>
                <TableCell className="text-center py-2 text-sm font-bold">
                  {currency}
                  {getNumberTwo(item.discountedPrice ? item.discountedPrice / item.quantity : item.itemTotal / item.quantity)}
                </TableCell>
                <TableCell className="text-right py-2 text-sm font-bold text-red-500">
                  {currency}
                  {getNumberTwo(item.discountedPrice ? item.discountedPrice : item.itemTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Financial Summary */}
      <div className="mb-4 bg-gray-50 p-4 rounded">
        <h2 className="text-base font-bold mb-3 text-gray-700">
          {t("Financial Summary")}
        </h2>
        <div className="grid grid-cols-5 gap-x-4 gap-y-2">
          <InfoField
            label={t("Subtotal")}
            value={`${currency}${getNumberTwo(data?.subTotal)}`}
          />
          <InfoField
            label={t("ShippingCost")}
            value={`${currency}${getNumberTwo(data?.shippingCost)}`}
          />
          <InfoField
            label={t("Discount")}
            value={`${currency}${getNumberTwo(data?.discount)}`}
          />
          <InfoField
            label={t("Offer Discount")}
            value={`${currency}${getNumberTwo(data?.offerDiscount || 0)}`}
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              {t("InvoiceTotalAmount")}
            </span>
            <span className="text-2xl font-bold text-red-500">
              {currency}{getNumberTwo(data?.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoiceForPrint.displayName = "InvoiceForPrint";

export default InvoiceForPrint;