// src/pages/OrderInvoice.jsx
// עמוד הזמנה
import { useParams } from "react-router";
import React, { useContext, useEffect, useRef } from "react";
import { FiClock, FiUser, FiDollarSign, FiPackage } from "react-icons/fi";
import { MdOutlineChecklistRtl } from "react-icons/md";
import { MdPayment } from "react-icons/md";
import {
  TableCell,
  TableHeader,
  Table,
  TableContainer,
  WindmillContext,
  Badge,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

// Internal import
import useAsync from "@/hooks/useAsync";
import Status from "@/components/table/Status";
import OrderServices from "@/services/OrderServices";
import Invoice from "@/components/invoice/Invoice";
import Loading from "@/components/preloader/Loading";
import PageTitle from "@/components/Typography/PageTitle";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import StatusHistoryCard from "@/components/invoice/StatusHistoryCard";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import InfoField from "@/components/common/InfoField";

const OrderInvoice = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { id } = useParams();
  const printRef = useRef();

  const { data, loading, error } = useAsync(() =>
    OrderServices.getOrderById(id)
  );

  useEffect(() => {
    if (data) {
      data.cart = data.cart?.sort((a, b) => a.barcode - b.barcode)
    }
  }, [data])
  const {
    currency,
    globalSetting,
    storeCustomizationSetting,
    showDateTimeFormat,
    showDateFormat,
    getNumberTwo,
    showingTranslateValue,
  } = useUtilsFunction();

  console.log('ORDER INVOICE :>> ', data);

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle> {t("InvoicePageTittle")} </PageTitle>

      {loading ? (
        <Loading loading={loading} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : (
        <>
          {/* Order Header */}
          <div className="bg-white dark:bg-gray-800 mb-4 p-6 rounded-xl shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {t("Order")} #{data?.invoice}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Status status={data?.status} />
                  {data?.cardcom?.isPaid ? (
                    <Badge type="success">{t("Paid")}</Badge>
                  ) : (
                    <Badge type="warning">{t("Unpaid")}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t("OrderDate")}: {showDateTimeFormat(data?.createdAt)}
                </p>
              </div>
              <div className="text-left lg:text-right">
                <img
                  src={storeCustomizationSetting?.footer?.block4_logo}
                  alt="Logo"
                  width="110"
                  className="mb-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {globalSetting?.address}<br />
                  {globalSetting?.contact}<br />
                  {globalSetting?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white dark:bg-gray-800 mb-4 p-6 rounded-xl shadow-sm">
            <CollapsibleSection
              title={t("Order History")}
              icon={<FiClock className="mt-1" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {data?.statusHistory?.map((status, index) => (
                  <StatusHistoryCard
                    key={status._id}
                    index={index + 1}
                    from={status.from}
                    to={status.to}
                    changedAt={showDateTimeFormat(status.changedAt)}
                    changedBy={status.changedBy}
                  />
                ))}
              </div>
            </CollapsibleSection>
          </div>

          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 mb-4 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <FiUser className="text-xl text-customGreen" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {t("Customer Information")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="md:col-span-2 lg:col-span-3"
                />
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white dark:bg-gray-800 mb-4 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <MdPayment className="text-xl text-customGreen" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {t("Payment Information")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InfoField
                label={t("Payment Status")}
                value={
                  data?.cardcom?.isPaid ? (
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
                value={data?.cardcom?.isPaid ? `${currency}${getNumberTwo(data?.total)}` : "-"}
              />
              <InfoField
                label={t("Payment Date")}
                value={data?.cardcom?.paidAt ? showDateTimeFormat(data?.cardcom?.paidAt) : "-"}
              />
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white dark:bg-gray-800 mb-4 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <FiPackage className="text-xl text-customGreen" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {t("Order Details")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="md:col-span-2 lg:col-span-3"
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
          <div className="bg-white dark:bg-gray-800 mb-4 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <MdOutlineChecklistRtl className="text-xl text-customGreen" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {t("Order Products")}
                </h2>
              </div>
            </div>
            <div className="p-4">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableCell>{t("Sr")}</TableCell>
                      <TableCell>{t("ProductTitle")}</TableCell>
                      <TableCell className="text-center">{t("Quantity")}</TableCell>
                      <TableCell className="text-center">{t("ItemPrice")}</TableCell>
                      <TableCell className="text-right">{t("Amount")}</TableCell>
                    </tr>
                  </TableHeader>
                  <Invoice
                    data={data}
                    currency={currency}
                    getNumberTwo={getNumberTwo}
                  />
                </Table>
              </TableContainer>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white dark:bg-gray-800 mb-4 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <FiDollarSign className="text-xl text-customGreen" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {t("Financial Summary")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  {t("InvoiceTotalAmount")}
                </span>
                <span className="text-2xl font-bold text-red-500 dark:text-customGreen">
                  {currency}{getNumberTwo(data?.total)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderInvoice;