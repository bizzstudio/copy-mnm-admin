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
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <div className="w-full flex items-center justify-between mt-6">
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

            <div className="mt-1">
                <CustomerPersonalDetails customer={null} customerId={null} />
            </div>
        </div>
    );
};

export default CustomerAdd;