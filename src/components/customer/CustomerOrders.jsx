// src/components/customer/CustomerOrders.jsx
import React from "react";
import {
    Table,
    TableHeader,
    TableCell,
    TableFooter,
    TableContainer,
    Pagination,
    Card,
    CardBody,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { IoBagHandle } from "react-icons/io5";

// Internal import
import useFilter from "@/hooks/useFilter";
import CustomerOrderTable from "@/components/customer/CustomerOrderTable";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import InfoField from "@/components/common/InfoField";

const CustomerOrders = ({ customer }) => {
    const { orders = [] } = customer || {};
    const { t } = useTranslation();
    const { currency, getNumberTwo } = useUtilsFunction();

    const { handleChangePage, totalResults, resultsPerPage, dataTable } = useFilter(orders);

    // Helper function to get customer type translation
    const getCustomerTypeLabel = (type) => {
        if (!type) return null;
        const typeMap = {
            casual: t("CasualCustomer"),
            regular: t("RegularCustomer"),
            business: t("BusinessCustomer"),
            institutional: t("InstitutionalCustomer"),
        };
        return typeMap[type] || type;
    };

    // Helper function to get payment terms translation
    const getPaymentTermsLabel = (paymentTerms) => {
        if (!paymentTerms) return null;
        const termsMap = {
            current: t("Current"),
            "+30": t("Plus30Days"),
            "+60": t("Plus60Days"),
            "+90": t("Plus90Days"),
            noDueDate: t("NoDueDate"),
        };
        return termsMap[paymentTerms] || paymentTerms;
    };

    // Check if there's any financial information to display
    const hasFinancialInfo =
        customer?.creditLimit !== undefined ||
        customer?.availableCredit !== undefined ||
        customer?.unpaidBalance !== undefined ||
        customer?.paymentTerms ||
        customer?.customerType;

    return (
        <div className="mt-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
                    {/* Financial Information */}
                    {hasFinancialInfo && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                {customer?.creditLimit !== undefined && (
                                    <InfoField
                                        label={t("CreditLimit")}
                                        value={`${currency}${getNumberTwo(customer.creditLimit)}`}
                                    />
                                )}
                                {customer?.availableCredit !== undefined && (
                                    <InfoField
                                        label={t("AvailableCredit")}
                                        value={`${currency}${getNumberTwo(customer.availableCredit)}`}
                                    />
                                )}
                                {customer?.unpaidBalance !== undefined && (
                                    <InfoField
                                        label={t("UnpaidBalance")}
                                        value={`${currency}${getNumberTwo(customer.unpaidBalance)}`}
                                    />
                                )}
                                {customer?.paymentTerms && (
                                    <InfoField
                                        label={t("PaymentTerms")}
                                        value={getPaymentTermsLabel(customer.paymentTerms)}
                                    />
                                )}
                                {customer?.customerType && (
                                    <InfoField
                                        label={t("CustomerType")}
                                        value={getCustomerTypeLabel(customer.customerType)}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    {dataTable.length === 0 && (
                        <div className="w-full bg-white dark:bg-gray-800 rounded-md">
                            <div className="p-8 text-center">
                                <span className="flex justify-center my-3 text-red-500 font-semibold text-6xl">
                                    <IoBagHandle />
                                </span>
                                <h2 className="font-medium text-base mt-4 text-gray-600 dark:text-gray-400">
                                    {t("CustomerOrderEmpty")}
                                </h2>
                            </div>
                        </div>
                    )}

                    {dataTable.length > 0 && (
                        <TableContainer>
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableCell className="text-center">{t("InvoiceNumber")}</TableCell>
                                        <TableCell className="text-center">{t("OrderDate")}</TableCell>
                                        <TableCell className="text-center">{t("orderUpdate")}</TableCell>
                                        <TableCell className="text-center">{t("ShippingMethod")}</TableCell>
                                        <TableCell className="text-center">{t("Total")}</TableCell>
                                        <TableCell className="text-center">{t("PaymentStatus")}</TableCell>
                                        <TableCell className="text-center">{t("OrderStatus")}</TableCell>
                                        <TableCell className="text-center">{t("Actions")}</TableCell>
                                    </tr>
                                </TableHeader>
                                <CustomerOrderTable orders={dataTable} />
                            </Table>
                            <TableFooter>
                                <Pagination
                                    className="pagination-ltr"
                                    totalResults={totalResults}
                                    resultsPerPage={resultsPerPage}
                                    onChange={handleChangePage}
                                    label="Table navigation"
                                />
                            </TableFooter>
                        </TableContainer>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default CustomerOrders;