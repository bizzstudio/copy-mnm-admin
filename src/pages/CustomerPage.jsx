// src/pages/CustomerPage.jsx
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BiUser, BiReceipt, BiFile } from "react-icons/bi";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "@windmill/react-ui";

// Internal import
import useAsync from "@/hooks/useAsync";
import CustomerServices from "@/services/CustomerServices";
import PageTitle from "@/components/Typography/PageTitle";
import Loading from "@/components/preloader/Loading";
import Tabs from "@/components/common/Tabs";
import CustomerPersonalDetails from "@/components/customer/CustomerPersonalDetails";
import CustomerOrders from "@/components/customer/CustomerOrders";
import CustomerDocuments from "@/components/customer/CustomerDocuments";

const CustomerPage = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: customer, loading, error } = useAsync(() =>
        CustomerServices.getCustomerById(id)
    );

    console.log('customer :>> ', customer);

    const tabs = useMemo(() => [
        {
            id: "personal",
            label: (
                <span className="flex gap-1.5 items-center justify-center">
                    <BiUser size={17} />
                    <span className="md:block hidden">{t("PersonalDetails")}</span>
                </span>
            ),
            content: <CustomerPersonalDetails customer={customer} customerId={id} />,
        },
        {
            id: "orders",
            label: (
                <span className="flex gap-1.5 items-center justify-center">
                    <BiReceipt size={17} />
                    <span className="md:block hidden">{t("Orders")}</span>
                </span>
            ),
            content: <CustomerOrders customer={customer} />,
        },
        {
            id: "documents",
            label: (
                <span className="flex gap-1.5 items-center justify-center">
                    <BiFile size={17} />
                    <span className="md:block hidden">{t("Documents")}</span>
                </span>
            ),
            content: <CustomerDocuments customer={customer} customerId={id} />,
        },
    ], [customer, id, t]);

    if (loading) {
        return (
            <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
                <Loading loading={loading} />
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            {t("CustomerNotFound")}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error || t("CustomerNotFoundMessage")}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <div className="flex items-center justify-between mt-8 w-full">
                <PageTitle>
                    {customer.name} {customer.lastName}
                </PageTitle>
                <Button
                    onClick={() => navigate("/customers")}
                    layout="outline"
                    className="flex items-center gap-2 w-fit!"
                >
                    <span>{t("Back")}</span>
                    <FiArrowLeft size={16} />
                </Button>
            </div>

            <div className="mt-6 w-full">
                <Tabs tabs={tabs} tab="tab" />
            </div>
        </div>
    );
};

export default CustomerPage;