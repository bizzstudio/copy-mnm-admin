// src/pages/CustomerAdd.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "@windmill/react-ui";

// Internal import
import PageTitle from "@/components/Typography/PageTitle";
import CustomerPersonalDetails from "@/components/customer/CustomerPersonalDetails";

const CustomerAdd = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <PageTitle>{t("AddCustomer")}</PageTitle>
                    <Button
                        onClick={() => navigate("/customers")}
                        layout="outline"
                        className="flex items-center gap-2 w-fit!"
                    >
                        <span>{t("Back")}</span>
                        <FiArrowLeft size={16} />
                    </Button>
                </div>

                <div className="mt-6">
                    <CustomerPersonalDetails customer={null} customerId={null} />
                </div>
            </div>
        </div>
    );
};

export default CustomerAdd;