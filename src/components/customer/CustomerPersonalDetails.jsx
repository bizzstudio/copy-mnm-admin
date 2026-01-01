// src/components/customer/CustomerPersonalDetails.jsx
import React, { useContext } from "react";
import { Card, CardBody, Button, Select, Badge } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { BiSolidUserDetail } from "react-icons/bi";

// Internal import
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Error from "@/components/form/others/Error";
import Uploader from "@/components/image-uploader/Uploader";
import useCustomerSubmit from "@/hooks/useCustomerSubmit";
import { SidebarContext } from "@/context/SidebarContext";

const CustomerPersonalDetails = ({ customer, customerId }) => {
    const { t } = useTranslation();
    const { priceLists } = useContext(SidebarContext);

    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        setImageUrl,
        imageUrl,
        documents,
        setDocuments,
        isSubmitting,
        hasChanges,
        customerType,
        isNewCustomer,
    } = useCustomerSubmit(customerId, customer);

    return (
        <div className="mt-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <BiSolidUserDetail size={24} className="text-mainColor" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {t("PersonalDetails")}
                                </h2>
                            </div>

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                                <div className="flex flex-col">
                                    <LabelArea label={t("Name")} />
                                    <InputArea
                                        register={register}
                                        label={t("Name")}
                                        name="name"
                                        type="text"
                                        placeholder={t("CustomerNamePlaceholder")}
                                        isRequired={true}
                                    />
                                    <Error errorName={errors.name} />
                                </div>

                                <div className="flex flex-col">
                                    <LabelArea label={t("Last Name")} />
                                    <InputArea
                                        register={register}
                                        label={t("Last Name")}
                                        name="lastName"
                                        type="text"
                                        placeholder={t("CustomerLastNamePlaceholder")}
                                        isRequired={false}
                                    />
                                    <Error errorName={errors.lastName} />
                                </div>

                                <div className="flex flex-col">
                                    <LabelArea label={t("Email")} />
                                    <InputArea
                                        register={register}
                                        label={t("Email")}
                                        name="email"
                                        type="email"
                                        placeholder={t("CustomerEmailPlaceholder")}
                                        isRequired={true}
                                    />
                                    <Error errorName={errors.email} />
                                </div>

                                <div className="flex flex-col">
                                    <LabelArea label={t("Phone")} />
                                    <InputArea
                                        register={register}
                                        label={t("Phone")}
                                        name="phone"
                                        type="tel"
                                        placeholder={t("CustomerPhonePlaceholder")}
                                        isRequired={true}
                                    />
                                    <Error errorName={errors.phone} />
                                </div>
                            </div>

                            {/* Customer Type, Company Number (if business/institutional), Price List (if not casual), Credit Limit (if not casual), and Payment Terms */}
                            <div className={`grid gap-6 ${customerType === "casual"
                                    ? "grid-cols-1 sm:grid-cols-2"
                                    : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"
                                }`}>
                                <div className="flex flex-col">
                                    <LabelArea label={t("CustomerType")} />
                                    <Select
                                        {...register("customerType", {
                                            required: `${t("CustomerType")} ${t("isRequired")}!`,
                                        })}
                                    >
                                        <option value="casual">{t("CasualCustomer")}</option>
                                        <option value="regular">{t("RegularCustomer")}</option>
                                        <option value="business">{t("BusinessCustomer")}</option>
                                        <option value="institutional">{t("InstitutionalCustomer")}</option>
                                    </Select>
                                    <Error errorName={errors.customerType} />
                                </div>

                                {/* Company Number - רק אם business או institutional */}
                                {(customerType === "business" || customerType === "institutional") && (
                                    <div className="flex flex-col">
                                        <LabelArea label={t("CompanyNumber")} />
                                        <InputArea
                                            register={register}
                                            label={t("CompanyNumber")}
                                            name="companyNumber"
                                            type="text"
                                            placeholder={t("CompanyNumberPlaceholder")}
                                            isRequired={false}
                                        />
                                        <Error errorName={errors.companyNumber} />
                                    </div>
                                )}

                                {/* Price List - רק אם לא casual ויש מחירונים זמינים */}
                                {customerType !== "casual" && priceLists && priceLists.length > 0 && (
                                    <div className="flex flex-col">
                                        <LabelArea label={t("PriceList")} />
                                        <Select {...register("priceList")}>
                                            {priceLists.map((priceList) => (
                                                <option key={priceList._id} value={priceList._id}>
                                                    {priceList.name}
                                                </option>
                                            ))}
                                        </Select>
                                        <Error errorName={errors.priceList} />
                                    </div>
                                )}

                                {/* Credit Limit - רק אם לא casual, אחרי המחירון */}
                                {customerType !== "casual" && (
                                    <div className="flex flex-col">
                                        <LabelArea label={t("CreditLimit")} />
                                        <InputArea
                                            register={register}
                                            label={t("CreditLimit")}
                                            name="creditLimit"
                                            type="number"
                                            min={0}
                                            placeholder={t("CreditLimitPlaceholder")}
                                            isRequired={false}
                                        />
                                        <Error errorName={errors.creditLimit} />
                                    </div>
                                )}

                                <div className="flex flex-col">
                                    <LabelArea label={t("PaymentTerms")} />
                                    <Select
                                        {...register("paymentTerms", {
                                            required: `${t("PaymentTerms")} ${t("isRequired")}!`,
                                        })}
                                    >
                                        <option value="current">{t("Current")}</option>
                                        <option value="+30">{t("Plus30Days")}</option>
                                        <option value="+60">{t("Plus60Days")}</option>
                                        <option value="+90">{t("Plus90Days")}</option>
                                        <option value="noDueDate">{t("NoDueDate")}</option>
                                    </Select>
                                    <Error errorName={errors.paymentTerms} />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="flex flex-col">
                                <LabelArea label={t("ProfileImage")} />
                                <Uploader
                                    imageUrl={imageUrl}
                                    setImageUrl={setImageUrl}
                                    folder="customers"
                                    multiple={false}
                                    onlyImages={true}
                                />
                            </div>

                            {/* Documents Upload */}
                            <div className="flex flex-col">
                                <LabelArea label={t("Documents")} />
                                <Uploader
                                    imageUrl={documents}
                                    setImageUrl={setDocuments}
                                    folder="customer-documents"
                                    multiple={true}
                                    onlyImages={false}
                                />
                            </div>

                            {/* Update/Save Button */}
                            {hasChanges && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? (isNewCustomer ? t("Creating") : t("Updating")) + "..."
                                            : isNewCustomer
                                                ? t("CreateCustomer")
                                                : t("UpdateCustomer")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default CustomerPersonalDetails;

