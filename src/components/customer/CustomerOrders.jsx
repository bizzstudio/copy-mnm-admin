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

const CustomerOrders = ({ orders }) => {
    const { t } = useTranslation();

    const { handleChangePage, totalResults, resultsPerPage, dataTable } = useFilter(orders);

    return (
        <div className="mt-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
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
                        <TableContainer className="mb-8">
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

