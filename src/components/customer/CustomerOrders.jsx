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
import useAsync from "@/hooks/useAsync";
import OrderServices from "@/services/OrderServices";
import useFilter from "@/hooks/useFilter";
import Loading from "@/components/preloader/Loading";
import CustomerOrderTable from "@/components/customer/CustomerOrderTable";

const CustomerOrders = ({ customerId }) => {
    const { t } = useTranslation();

    const { data, loading, error } = useAsync(() =>
        OrderServices.getOrderCustomer(customerId)
    );

    const { handleChangePage, totalResults, resultsPerPage, dataTable } = useFilter(data);

    return (
        <div className="mt-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
                    {loading && <Loading loading={loading} />}
                    {!error && !loading && dataTable.length === 0 && (
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

                    {data && data.length > 0 && !error && !loading ? (
                        <TableContainer className="mb-8">
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableCell>{t("CustomerOrderId")}</TableCell>
                                        <TableCell>{t("CustomerOrderTime")}</TableCell>
                                        <TableCell>{t("CustomerShippingAddress")}</TableCell>
                                        <TableCell>{t("Phone")}</TableCell>
                                        <TableCell>{t("CustomerOrderMethod")}</TableCell>
                                        <TableCell>{t("Amount")}</TableCell>
                                        <TableCell className="text-center">
                                            {t("CustomerOrderStatus")}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {t("CustomerOrderAction")}
                                        </TableCell>
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
                    ) : null}
                </CardBody>
            </Card>
        </div>
    );
};

export default CustomerOrders;

