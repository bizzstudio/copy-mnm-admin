// src/components/customer/CustomerPersonalDetails.jsx
import React, { useContext } from "react";
import { Card, CardBody, Button, Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { BiSolidUserDetail, BiMap } from "react-icons/bi";

// Internal import
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Error from "@/components/form/others/Error";
import ProfileImageUploader from "@/components/image-uploader/ProfileImageUploader";
import City from "@/components/select/City";
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
        setValue,
        watch,
        setImageUrl,
        imageUrl,
        isSubmitting,
        hasChanges,
        customerType,
        isNewCustomer,
    } = useCustomerSubmit(customerId, customer);

    const addressCity = watch("address.city");

    return (
        <div className="my-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        autoComplete={isNewCustomer ? "off" : undefined}
                    >
                        <div className="space-y-6">

                            {/* Header Section */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <BiSolidUserDetail size={24} className="text-mainColor" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {t("PersonalDetails")}
                                </h2>
                            </div>

                            <div className="flex xl:flex-row flex-col gap-4 md:gap-12 md:items-center">
                                {/* תמונת פרופיל - בראש הטופס ממורכז */}
                                <div className="flex justify-center">
                                    <ProfileImageUploader
                                        imageUrl={imageUrl}
                                        setImageUrl={setImageUrl}
                                        folder="mnm customers"
                                        size="medium"
                                    />
                                </div>

                                {/* Basic Information */}
                                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3! min-[1580px]:grid-cols-4! gap-6">
                                    {/* שם פרטי */}
                                    <div className="flex flex-col">
                                        <LabelArea label={t("Name")} />
                                        <InputArea
                                            register={register}
                                            label={t("Name")}
                                            name="name"
                                            type="text"
                                            placeholder={t("CustomerNamePlaceholder")}
                                            isRequired={true}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.name} />
                                    </div>

                                    {/* שם משפחה */}
                                    <div className="flex flex-col">
                                        <LabelArea label={t("Last Name")} />
                                        <InputArea
                                            register={register}
                                            label={t("Last Name")}
                                            name="lastName"
                                            type="text"
                                            placeholder={t("CustomerLastNamePlaceholder")}
                                            isRequired={false}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.lastName} />
                                    </div>

                                    {/* אימייל */}
                                    <div className="flex flex-col">
                                        <LabelArea label={t("Email")} />
                                        <InputArea
                                            register={register}
                                            label={t("Email")}
                                            name="email"
                                            type="email"
                                            placeholder={t("CustomerEmailPlaceholder")}
                                            isRequired={true}
                                            autocomplete={isNewCustomer ? "section-new-customer email" : undefined}
                                        />
                                        <Error errorName={errors.email} />
                                    </div>

                                    {/* טלפון */}
                                    <div className="flex flex-col">
                                        <LabelArea label={t("Phone")} />
                                        <InputArea
                                            register={register}
                                            label={t("Phone")}
                                            name="phone"
                                            type="tel"
                                            placeholder={t("CustomerPhonePlaceholder")}
                                            isRequired={true}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.phone} />
                                    </div>

                                    {/* סוג לקוח */}
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

                                    {/* מספר חברה - רק אם זה לקוח עסקי או מוסדי */}
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
                                                autocomplete={isNewCustomer ? "off" : undefined}
                                            />
                                            <Error errorName={errors.companyNumber} />
                                        </div>
                                    )}

                                    {/* סוג מוסד - רק אם זה לקוח מוסדי */}
                                    {customerType === "institutional" && (
                                        <div className="flex flex-col">
                                            <LabelArea label={t("InstitutionType")} />
                                            <InputArea
                                                register={register}
                                                label={t("InstitutionType")}
                                                name="institutionType"
                                                type="text"
                                                placeholder={t("InstitutionTypePlaceholder")}
                                                isRequired={false}
                                            />
                                            <Error errorName={errors.institutionType} />
                                        </div>
                                    )}

                                    {/* מחירון - רק אם לא לקוח מזדמן ויש מחירונים זמינים */}
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

                                    {/* מסגרת אשראי - רק אם לא לקוח מזדמן, אחרי המחירון */}
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
                                                autocomplete={isNewCustomer ? "off" : undefined}
                                            />
                                            <Error errorName={errors.creditLimit} />
                                        </div>
                                    )}

                                    {/* תנאי תשלום */}
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

                                    {/* יום משלוח שבועי */}
                                    <div className="flex flex-col">
                                        <LabelArea label={t("WeeklyDeliveryDay")} />
                                        <Select {...register("weeklyDeliveryDay")}>
                                            <option value="">{t("WeeklyDeliveryDayPlaceholder")}</option>
                                            <option value="0">{t("DaySunday")}</option>
                                            <option value="1">{t("DayMonday")}</option>
                                            <option value="2">{t("DayTuesday")}</option>
                                            <option value="3">{t("DayWednesday")}</option>
                                            <option value="4">{t("DayThursday")}</option>
                                            <option value="5">{t("DayFriday")}</option>
                                            <option value="6">{t("DaySaturday")}</option>
                                        </Select>
                                        <Error errorName={errors.weeklyDeliveryDay} />
                                    </div>

                                    {/* סיסמה חדשה */}
                                    <div className="flex flex-col">
                                        <LabelArea label={isNewCustomer ? t("PasswordOptional") : t("NewPassword")} />
                                        <InputArea
                                            register={register}
                                            label={isNewCustomer ? t("PasswordOptional") : t("NewPassword")}
                                            name="newPassword"
                                            type="password"
                                            placeholder={isNewCustomer ? t("NewPasswordPlaceholderCreate") : t("NewPasswordPlaceholderUpdate")}
                                            isRequired={false}
                                            autocomplete="section-new-customer new-password"
                                        />
                                        <Error errorName={errors.newPassword} />
                                    </div>
                                </div>
                            </div>

                            {/* כתובת */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <BiMap size={24} className="text-mainColor" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        {t("FullAddress")}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    <div className="flex flex-col">
                                        <LabelArea label={t("City")} />
                                        <City
                                            value={addressCity}
                                            setValue={(val) => setValue("address.city", val, { shouldDirty: true })}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <LabelArea label={t("Street")} />
                                        <InputArea
                                            register={register}
                                            label={t("Street")}
                                            name="address.street"
                                            type="text"
                                            placeholder={t("StreetPlaceholder")}
                                            isRequired={false}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.address?.street} />
                                    </div>
                                    <div className="flex flex-col">
                                        <LabelArea label={t("HouseNumber")} />
                                        <InputArea
                                            register={register}
                                            label={t("HouseNumber")}
                                            name="address.houseNumber"
                                            type="text"
                                            placeholder={t("HouseNumberPlaceholder")}
                                            isRequired={false}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.address?.houseNumber} />
                                    </div>
                                    <div className="flex flex-col">
                                        <LabelArea label={t("ApartmentNumber")} />
                                        <InputArea
                                            register={register}
                                            label={t("ApartmentNumber")}
                                            name="address.apartmentNumber"
                                            type="text"
                                            placeholder={t("ApartmentNumberPlaceholder")}
                                            isRequired={false}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.address?.apartmentNumber} />
                                    </div>
                                    <div className="flex flex-col">
                                        <LabelArea label={t("Floor")} />
                                        <InputArea
                                            register={register}
                                            label={t("Floor")}
                                            name="address.floor"
                                            type="text"
                                            placeholder={t("FloorPlaceholder")}
                                            isRequired={false}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.address?.floor} />
                                    </div>
                                    <div className="flex flex-col">
                                        <LabelArea label={t("EntryCode")} />
                                        <InputArea
                                            register={register}
                                            label={t("EntryCode")}
                                            name="address.entryCode"
                                            type="text"
                                            placeholder={t("EntryCodePlaceholder")}
                                            isRequired={false}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.address?.entryCode} />
                                    </div>
                                    <div className="flex flex-col">
                                        <LabelArea label={t("PostalCode")} />
                                        <InputArea
                                            register={register}
                                            label={t("PostalCode")}
                                            name="address.postalCode"
                                            type="text"
                                            placeholder={t("PostalCodePlaceholder")}
                                            isRequired={false}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.address?.postalCode} />
                                    </div>
                                </div>
                            </div>

                            {/* כפתור עדכון/שמירה */}
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