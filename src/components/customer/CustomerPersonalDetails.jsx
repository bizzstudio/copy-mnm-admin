// src/components/customer/CustomerPersonalDetails.jsx
import React, { useContext } from "react";
import { Card, CardBody, Button, Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { BiSolidUserDetail, BiMap } from "react-icons/bi";
import { FiPlus, FiTrash2, FiUsers } from "react-icons/fi";

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
        isSubmitting,
        hasChanges,
        customerType,
        isNewCustomer,
        subCustomerFields,
        appendSubCustomer,
        removeSubCustomer,
        isBusinessOrInstitutional,
    } = useCustomerSubmit(customerId, customer);

    return (
        <div className="my-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        autoComplete={isNewCustomer ? "off" : undefined}
                    >
                        <div className="space-y-6">

                            {/* כותרת פרטים אישיים */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <BiSolidUserDetail size={24} className="text-mainColor" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {t("PersonalDetails")}
                                </h2>
                            </div>

                            {/* רשת שדות: שם, אימייל, טלפון, סוג לקוח ועוד */}
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* שם */}
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
                                        isRequired={false}
                                        autocomplete={isNewCustomer ? "off" : undefined}
                                    />
                                    <Error errorName={errors.phone} />
                                </div>

                                {/* סוג לקוח – ברירת מחדל: לקוח מוסדי בלבד */}
                                <div className="flex flex-col">
                                    <LabelArea label={t("CustomerType")} />
                                    <Select
                                        {...register("customerType", {
                                            required: `${t("CustomerType")} ${t("isRequired")}!`,
                                        })}
                                        disabled
                                    >
                                        <option value="institutional">{t("InstitutionalCustomer")}</option>
                                    </Select>
                                    <Error errorName={errors.customerType} />
                                </div>

                                {/* מספר עוסק (עסקי/מוסדי) */}
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

                                {/* סוג מוסד (מוסדי בלבד) */}
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
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.institutionType} />
                                    </div>
                                )}

                                {/* מחירון */}
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

                                {/* מספר לקוח בריווחית (לקוח ראשי) */}
                                <div className="flex flex-col">
                                    <LabelArea label={t("RivhitCustomerNumber") || "Rivhit customer number"} />
                                    <InputArea
                                        register={register}
                                        label={t("RivhitCustomerNumber") || "Rivhit customer number"}
                                        name="mainRivhitCustomerNumber"
                                        type="text"
                                        placeholder="12345"
                                        isRequired={false}
                                        autocomplete={isNewCustomer ? "off" : undefined}
                                    />
                                    <Error errorName={errors.mainRivhitCustomerNumber} />
                                </div>
                            </div>

                            {/* סעיף תת-לקוחות */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <FiUsers size={22} className="text-mainColor" />
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {t("SubCustomers") || "Sub Customers"}
                                        </h2>
                                    </div>

                                    {isBusinessOrInstitutional && (
                                        <button
                                            type="button"
                                            onClick={appendSubCustomer}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-mainColor text-white hover:bg-mainColor/90 transition-colors cursor-pointer"
                                        >
                                            <FiPlus size={18} />
                                            <span className="text-sm font-medium">
                                                {t("AddSubCustomer") || "Add sub-customer"}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* רשימת כרטיסי תת-לקוח */}
                                <div className="space-y-4">
                                    {subCustomerFields.map((field, idx) => {
                                        const addressCity = watch(`subCustomers.${idx}.address.city`);
                                        const subName = watch(`subCustomers.${idx}.name`);
                                        const subLastName = watch(`subCustomers.${idx}.lastName`);
                                        const displayName = [subName, subLastName].filter(Boolean).join(" ").trim()
                                            || `${t("SubCustomer") || "Sub-customer"} #${idx + 1}`;

                                        return (
                                            <div
                                                key={field.id}
                                                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {displayName}
                                                    </div>

                                                    {isBusinessOrInstitutional && subCustomerFields.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubCustomer(idx)}
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                                        >
                                                            <FiTrash2 size={16} />
                                                            <span className="text-sm">
                                                                {t("Remove") || "Remove"}
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex xl:flex-row flex-col gap-4 md:gap-10 md:items-start">
                                                    {/* תמונת תת-לקוח */}
                                                    <div className="flex justify-center">
                                                        <ProfileImageUploader
                                                            imageUrl={watch(`subCustomers.${idx}.image`)}
                                                            setImageUrl={(url) =>
                                                                setValue(`subCustomers.${idx}.image`, url, { shouldDirty: true })
                                                            }
                                                            folder="mnm customers"
                                                            size="medium"
                                                        />
                                                    </div>

                                                    {/* שדות תת-לקוח: שם, משפחה, אימייל וכו' */}
                                                    <div className="w-full space-y-6">
                                                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                            {/* שם פרטי */}
                                                            <div className="flex flex-col">
                                                                <LabelArea label={t("Name")} />
                                                                <InputArea
                                                                    register={register}
                                                                    label={t("Name")}
                                                                    name={`subCustomers.${idx}.name`}
                                                                    type="text"
                                                                    placeholder={t("CustomerNamePlaceholder")}
                                                                    isRequired={true}
                                                                    autocomplete={isNewCustomer ? "off" : undefined}
                                                                />
                                                                <Error errorName={errors?.subCustomers?.[idx]?.name} />
                                                            </div>

                                                            {/* שם משפחה */}
                                                            <div className="flex flex-col">
                                                                <LabelArea label={t("Last Name")} />
                                                                <InputArea
                                                                    register={register}
                                                                    label={t("Last Name")}
                                                                    name={`subCustomers.${idx}.lastName`}
                                                                    type="text"
                                                                    placeholder={t("CustomerLastNamePlaceholder")}
                                                                    isRequired={false}
                                                                    autocomplete={isNewCustomer ? "off" : undefined}
                                                                />
                                                                <Error errorName={errors?.subCustomers?.[idx]?.lastName} />
                                                            </div>

                                                            {/* אימייל */}
                                                            <div className="flex flex-col">
                                                                <LabelArea label={t("Email")} />
                                                                <InputArea
                                                                    register={register}
                                                                    label={t("Email")}
                                                                    name={`subCustomers.${idx}.email`}
                                                                    type="email"
                                                                    placeholder={t("CustomerEmailPlaceholder")}
                                                                    isRequired={true}
                                                                    autocomplete={isNewCustomer ? "section-new-customer email" : undefined}
                                                                />
                                                                <Error errorName={errors?.subCustomers?.[idx]?.email} />
                                                            </div>

                                                            {/* טלפון */}
                                                            <div className="flex flex-col">
                                                                <LabelArea label={t("Phone")} />
                                                                <InputArea
                                                                    register={register}
                                                                    label={t("Phone")}
                                                                    name={`subCustomers.${idx}.phone`}
                                                                    type="tel"
                                                                    placeholder={t("CustomerPhonePlaceholder")}
                                                                    isRequired={false}
                                                                    autocomplete={isNewCustomer ? "off" : undefined}
                                                                />
                                                                <Error errorName={errors?.subCustomers?.[idx]?.phone} />
                                                            </div>

                                                            {/* מספר לקוח בריווחית (תת-לקוח) */}
                                                            <div className="flex flex-col">
                                                                <LabelArea label={t("RivhitCustomerNumber") || "Rivhit customer number"} />
                                                                <InputArea
                                                                    register={register}
                                                                    label={t("RivhitCustomerNumber") || "Rivhit customer number"}
                                                                    name={`subCustomers.${idx}.rivhitCustomerNumber`}
                                                                    type="text"
                                                                    placeholder="12345"
                                                                    isRequired={false}
                                                                    autocomplete={isNewCustomer ? "off" : undefined}
                                                                />
                                                                <Error errorName={errors?.subCustomers?.[idx]?.rivhitCustomerNumber} />
                                                            </div>

                                                            {/* מסגרת אשראי */}
                                                            {customerType !== "casual" && (
                                                                <div className="flex flex-col">
                                                                    <LabelArea label={t("CreditLimit")} />
                                                                    <InputArea
                                                                        register={register}
                                                                        label={t("CreditLimit")}
                                                                        name={`subCustomers.${idx}.creditLimit`}
                                                                        type="number"
                                                                        min={0}
                                                                        placeholder={t("CreditLimitPlaceholder")}
                                                                        isRequired={false}
                                                                        autocomplete={isNewCustomer ? "off" : undefined}
                                                                    />
                                                                    <Error errorName={errors?.subCustomers?.[idx]?.creditLimit} />
                                                                </div>
                                                            )}

                                                            {/* יום משלוח שבועי */}
                                                            <div className="flex flex-col">
                                                                <LabelArea label={t("WeeklyDeliveryDay")} />
                                                                <Select {...register(`subCustomers.${idx}.weeklyDeliveryDay`)}>
                                                                    <option value="">{t("WeeklyDeliveryDayPlaceholder")}</option>
                                                                    <option value="0">{t("DaySunday")}</option>
                                                                    <option value="1">{t("DayMonday")}</option>
                                                                    <option value="2">{t("DayTuesday")}</option>
                                                                    <option value="3">{t("DayWednesday")}</option>
                                                                    <option value="4">{t("DayThursday")}</option>
                                                                    <option value="5">{t("DayFriday")}</option>
                                                                    <option value="6">{t("DaySaturday")}</option>
                                                                </Select>
                                                                <Error errorName={errors?.subCustomers?.[idx]?.weeklyDeliveryDay} />
                                                            </div>

                                                            {/* סיסמה (אופציונלי/חדשה) */}
                                                            <div className="flex flex-col">
                                                                <LabelArea label={isNewCustomer ? t("PasswordOptional") : t("NewPassword")} />
                                                                <InputArea
                                                                    register={register}
                                                                    label={isNewCustomer ? t("PasswordOptional") : t("NewPassword")}
                                                                    name={`subCustomers.${idx}.newPassword`}
                                                                    type="password"
                                                                    placeholder={isNewCustomer ? t("NewPasswordPlaceholderCreate") : t("NewPasswordPlaceholderUpdate")}
                                                                    isRequired={false}
                                                                    autocomplete="section-new-customer new-password"
                                                                />
                                                                <Error errorName={errors?.subCustomers?.[idx]?.newPassword} />
                                                            </div>
                                                        </div>

                                                        {/* כתובת מלאה */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                                                <BiMap size={22} className="text-mainColor" />
                                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                                    {t("FullAddress")}
                                                                </h3>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                                {/* עיר */}
                                                                <div className="flex flex-col">
                                                                    <LabelArea label={t("City")} />
                                                                    <City
                                                                        value={addressCity}
                                                                        setValue={(val) =>
                                                                            setValue(`subCustomers.${idx}.address.city`, val, { shouldDirty: true })
                                                                        }
                                                                    />
                                                                </div>
                                                                {/* רחוב */}
                                                                <div className="flex flex-col">
                                                                    <LabelArea label={t("Street")} />
                                                                    <InputArea
                                                                        register={register}
                                                                        label={t("Street")}
                                                                        name={`subCustomers.${idx}.address.street`}
                                                                        type="text"
                                                                        placeholder={t("StreetPlaceholder")}
                                                                        isRequired={false}
                                                                        autocomplete={isNewCustomer ? "off" : undefined}
                                                                    />
                                                                    <Error errorName={errors?.subCustomers?.[idx]?.address?.street} />
                                                                </div>
                                                                {/* מספר בית */}
                                                                <div className="flex flex-col">
                                                                    <LabelArea label={t("HouseNumber")} />
                                                                    <InputArea
                                                                        register={register}
                                                                        label={t("HouseNumber")}
                                                                        name={`subCustomers.${idx}.address.houseNumber`}
                                                                        type="text"
                                                                        placeholder={t("HouseNumberPlaceholder")}
                                                                        isRequired={false}
                                                                        autocomplete={isNewCustomer ? "off" : undefined}
                                                                    />
                                                                    <Error errorName={errors?.subCustomers?.[idx]?.address?.houseNumber} />
                                                                </div>
                                                                {/* מספר דירה */}
                                                                <div className="flex flex-col">
                                                                    <LabelArea label={t("ApartmentNumber")} />
                                                                    <InputArea
                                                                        register={register}
                                                                        label={t("ApartmentNumber")}
                                                                        name={`subCustomers.${idx}.address.apartmentNumber`}
                                                                        type="text"
                                                                        placeholder={t("ApartmentNumberPlaceholder")}
                                                                        isRequired={false}
                                                                        autocomplete={isNewCustomer ? "off" : undefined}
                                                                    />
                                                                    <Error errorName={errors?.subCustomers?.[idx]?.address?.apartmentNumber} />
                                                                </div>
                                                                {/* קומה */}
                                                                <div className="flex flex-col">
                                                                    <LabelArea label={t("Floor")} />
                                                                    <InputArea
                                                                        register={register}
                                                                        label={t("Floor")}
                                                                        name={`subCustomers.${idx}.address.floor`}
                                                                        type="text"
                                                                        placeholder={t("FloorPlaceholder")}
                                                                        isRequired={false}
                                                                        autocomplete={isNewCustomer ? "off" : undefined}
                                                                    />
                                                                    <Error errorName={errors?.subCustomers?.[idx]?.address?.floor} />
                                                                </div>
                                                                {/* קוד כניסה */}
                                                                <div className="flex flex-col">
                                                                    <LabelArea label={t("EntryCode")} />
                                                                    <InputArea
                                                                        register={register}
                                                                        label={t("EntryCode")}
                                                                        name={`subCustomers.${idx}.address.entryCode`}
                                                                        type="text"
                                                                        placeholder={t("EntryCodePlaceholder")}
                                                                        isRequired={false}
                                                                        autocomplete={isNewCustomer ? "off" : undefined}
                                                                    />
                                                                    <Error errorName={errors?.subCustomers?.[idx]?.address?.entryCode} />
                                                                </div>
                                                                {/* מיקוד */}
                                                                <div className="flex flex-col">
                                                                    <LabelArea label={t("PostalCode")} />
                                                                    <InputArea
                                                                        register={register}
                                                                        label={t("PostalCode")}
                                                                        name={`subCustomers.${idx}.address.postalCode`}
                                                                        type="text"
                                                                        placeholder={t("PostalCodePlaceholder")}
                                                                        isRequired={false}
                                                                        autocomplete={isNewCustomer ? "off" : undefined}
                                                                    />
                                                                    <Error errorName={errors?.subCustomers?.[idx]?.address?.postalCode} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* כפתור שמירה / עדכון לקוח */}
                            {hasChanges && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                    <Button type="submit" disabled={isSubmitting}>
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