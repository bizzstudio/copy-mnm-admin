// src/hooks/useCustomerSubmit.js
import { useContext, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import CustomerServices from "@/services/CustomerServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const emptyAddress = {
  city: null,
  street: "",
  houseNumber: "",
  apartmentNumber: "",
  floor: "",
  entryCode: "",
  postalCode: "",
};

const createEmptySubCustomer = () => ({
  _id: undefined,
  name: "",
  lastName: "",
  email: "",
  phone: "",
  image: "",
  creditLimit: 0,
  weeklyDeliveryDay: "",
  rivhitCustomerNumber: "",
  newPassword: "",
  alertAmount: "",
  alertPeriod: "",
  address: { ...emptyAddress },
});

const useCustomerSubmit = (customerId, customer) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsUpdate, priceLists } = useContext(SidebarContext);

  const isNewCustomer = !customerId;

  // מציאת מחירון ברירת מחדל (isDefault: true)
  const getDefaultPriceListId = () => {
    if (priceLists && priceLists.length > 0) {
      const defaultPriceList = priceLists.find((pl) => pl.isDefault === true);
      return defaultPriceList ? defaultPriceList._id : null;
    }
    return null;
  };

  const getDefaultPriceList = (mainCustomerPriceList) => {
    if (mainCustomerPriceList) {
      return mainCustomerPriceList._id || mainCustomerPriceList;
    }
    return getDefaultPriceListId();
  };

  const getDefaultValues = () => {
    const normalizedSubCustomers = Array.isArray(customer?.subCustomers)
      ? customer.subCustomers.map((sc) => ({
        _id: sc?._id,
        name: sc?.name || "",
        lastName: sc?.lastName || "",
        email: sc?.email || "",
        phone: sc?.phone || "",
        image: sc?.image || "",
        creditLimit: sc?.creditLimit || 0,
        weeklyDeliveryDay:
          sc?.weeklyDeliveryDay !== undefined && sc?.weeklyDeliveryDay !== null
            ? String(sc.weeklyDeliveryDay)
            : "",
        rivhitCustomerNumber: sc?.accounting?.externalCustomerId
          ? String(sc.accounting.externalCustomerId)
          : "",
        newPassword: "",
        alertAmount: sc?.alertAmount != null ? String(sc.alertAmount) : "",
        alertPeriod: sc?.alertPeriod || "",
        address:
          sc?.address && typeof sc.address === "object"
            ? {
              city: sc.address.city || null,
              street: sc.address.street || "",
              houseNumber: sc.address.houseNumber || "",
              apartmentNumber: sc.address.apartmentNumber || "",
              floor: sc.address.floor || "",
              entryCode: sc.address.entryCode || "",
              postalCode: sc.address.postalCode || "",
            }
            : { ...emptyAddress },
      }))
      : [];

    if (customer) {
      return {
        // MainCustomer fields
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        customerType: "institutional",
        companyNumber: customer.companyNumber || "",
        institutionType: customer.institutionType || "",
        priceList: getDefaultPriceList(customer.priceList),
        paymentTerms: customer.paymentTerms || "current",
        noShipping: customer.noShipping || false,
        mainRivhitCustomerNumber: customer.externalCustomerId
          ? String(customer.externalCustomerId)
          : "",

        // Sub customers
        subCustomers: normalizedSubCustomers.length > 0 ? normalizedSubCustomers : [createEmptySubCustomer()],
      };
    }

    return {
      name: "",
      email: "",
      phone: "",
      customerType: "institutional",
      companyNumber: "",
      institutionType: "",
      priceList: getDefaultPriceListId(),
      paymentTerms: "current",
      noShipping: false,
      mainRivhitCustomerNumber: "",
      subCustomers: [createEmptySubCustomer()],
    };
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: getDefaultValues(),
  });

  const { fields: subCustomerFields, append, remove, replace } = useFieldArray({
    control,
    name: "subCustomers",
  });

  const customerType = watch("customerType");
  const currentPriceList = watch("priceList");

  const isBusinessOrInstitutional = useMemo(
    () => customerType === "business" || customerType === "institutional",
    [customerType]
  );

  // סוג לקוח קבוע: מוסדי – בחירת מחירון ברירת מחדל
  useEffect(() => {
    if (priceLists && priceLists.length > 0 && (!currentPriceList || currentPriceList === null)) {
      const defaultPriceListId = getDefaultPriceListId();
      if (defaultPriceListId) {
        setValue("priceList", defaultPriceListId, { shouldDirty: false });
      }
    }
  }, [priceLists, currentPriceList, setValue]);

  // אם סוג הלקוח הוא לא עסקי/מוסדי - מוודאים שיש רק תת-לקוח אחד
  useEffect(() => {
    const currentSubCustomers = watch("subCustomers") || [];
    if (!isBusinessOrInstitutional && currentSubCustomers.length > 1) {
      replace([currentSubCustomers[0]]);
    }
    if (currentSubCustomers.length === 0) {
      replace([createEmptySubCustomer()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBusinessOrInstitutional]);

  // טעינת נתונים ראשוניים
  useEffect(() => {
    if (customer) {
      reset(getDefaultValues());
    } else if (isNewCustomer) {
      reset(getDefaultValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, reset, isNewCustomer, priceLists]);

  const hasChanges = isNewCustomer ? true : isDirty;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      // סוג לקוח קבוע: לקוח מוסדי (שדה מושבת ב-UI)
      data.customerType = data.customerType || "institutional";

      // מחירון
      let finalPriceList = data.priceList;
      if (data.customerType !== "casual" && (!finalPriceList || finalPriceList === null)) {
        const defaultPriceListId = getDefaultPriceListId();
        if (defaultPriceListId) {
          finalPriceList = defaultPriceListId;
        }
      } else if (data.customerType === "casual") {
        finalPriceList = null;
      }

      const subCustomersToSend = Array.isArray(data.subCustomers)
        ? data.subCustomers
          .filter((sc) => sc && sc.name && sc.email)
          .map((sc) => {
            const address =
              sc.address && typeof sc.address === "object"
                ? {
                  city: sc.address.city || undefined,
                  street: sc.address.street || undefined,
                  houseNumber: sc.address.houseNumber || undefined,
                  apartmentNumber: sc.address.apartmentNumber || undefined,
                  floor: sc.address.floor || undefined,
                  entryCode: sc.address.entryCode || undefined,
                  postalCode: sc.address.postalCode || undefined,
                }
                : {};

            const payload = {
              ...(sc._id ? { _id: sc._id } : {}),
              name: sc.name,
              lastName: sc.lastName || "",
              email: String(sc.email).toLowerCase(),
              phone: sc.phone || "",
              image: sc.image || "",
              address,
              creditLimit: Number(sc.creditLimit || 0),
              weeklyDeliveryDay:
                sc.weeklyDeliveryDay !== "" && sc.weeklyDeliveryDay !== undefined && sc.weeklyDeliveryDay !== null
                  ? Number(sc.weeklyDeliveryDay)
                  : undefined,
              alertAmount: sc.alertAmount !== "" && sc.alertAmount != null ? Number(sc.alertAmount) : null,
              alertPeriod: ["weekly", "monthly"].includes(sc.alertPeriod) ? sc.alertPeriod : null,
            };

            if (sc.newPassword && String(sc.newPassword).trim()) {
              payload.password = sc.newPassword;
            }

            // תמיד שולחים externalCustomerId: מספר כשיש ערך, null כשהריק – כדי שהשרת יוכל לנקות ערך קיים
            const rivhitTrimmed = sc.rivhitCustomerNumber != null ? String(sc.rivhitCustomerNumber).trim() : "";
            payload.externalCustomerId = rivhitTrimmed ? Number(rivhitTrimmed) : null;

            return payload;
          })
        : [];

      const mainCustomerData = {
        name: data.name,
        email: String(data.email).toLowerCase(),
        phone: data.phone || "",
        customerType: data.customerType,
        companyNumber: data.companyNumber || "",
        priceList: finalPriceList,
        paymentTerms: data.paymentTerms,
        institutionType: data.institutionType || undefined,
        noShipping: !!data.noShipping,
        subCustomers: subCustomersToSend,
      };

      // מספר לקוח בריווחית ללקוח ראשי – שדה ברמת השורש (externalCustomerId)
      const mainRivhitValue = data.mainRivhitCustomerNumber != null && String(data.mainRivhitCustomerNumber).trim();
      if (mainRivhitValue) {
        mainCustomerData.externalCustomerId = Number(String(data.mainRivhitCustomerNumber).trim());
      } else if (!isNewCustomer) {
        mainCustomerData.externalCustomerId = "";
      }

      if (isNewCustomer) {
        const res = await CustomerServices.createCustomerByAdmin(mainCustomerData);
        notifySuccess(res.message?.he || res.message || t("CustomerCreatedSuccessfully"));
        if (res.mainCustomer?._id) {
          window.location.href = `/customer/${res.mainCustomer._id}`;
        } else {
          window.location.href = `/customers`;
        }
      } else {
        const res = await CustomerServices.updateCustomerByAdmin(customerId, mainCustomerData);
        notifySuccess(res.message?.he || res.message || t("CustomerUpdatedSuccessfully"));
        reset(getDefaultValues());
        setIsUpdate(true);
      }
    } catch (err) {
      notifyError(
        err?.response?.data?.message?.he ||
        err?.response?.data?.message ||
        err?.message ||
        t("UpdateFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const appendSubCustomer = () => append(createEmptySubCustomer());
  const removeSubCustomer = (index) => {
    const current = watch("subCustomers") || [];
    if (current.length <= 1) return;
    remove(index);
  };

  return {
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

    // Sub customers helpers
    subCustomerFields,
    appendSubCustomer,
    removeSubCustomer,
    isBusinessOrInstitutional,
  };
};

export default useCustomerSubmit;