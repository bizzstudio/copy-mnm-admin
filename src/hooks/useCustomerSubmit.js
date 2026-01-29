// src/hooks/useCustomerSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import CustomerServices from "@/services/CustomerServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useCustomerSubmit = (customerId, customer) => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialImageUrl, setInitialImageUrl] = useState("");
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

  // הכנת defaultValues
  const getDefaultValues = () => {
    // קביעת מחירון ברירת מחדל - המחירון עם isDefault: true אם אין מחירון שנבחר
    const getDefaultPriceList = (customerPriceList) => {
      if (customerPriceList) {
        return customerPriceList._id || customerPriceList;
      }
      // אם אין מחירון, נבחר את המחירון עם isDefault: true
      return getDefaultPriceListId();
    };

    const emptyAddress = {
      city: null,
      street: "",
      houseNumber: "",
      apartmentNumber: "",
      floor: "",
      entryCode: "",
      postalCode: "",
    };
    const addressFromCustomer = (customer?.address && typeof customer.address === "object")
      ? {
        city: customer.address.city || null,
        street: customer.address.street || "",
        houseNumber: customer.address.houseNumber || "",
        apartmentNumber: customer.address.apartmentNumber || "",
        floor: customer.address.floor || "",
        entryCode: customer.address.entryCode || "",
        postalCode: customer.address.postalCode || "",
      }
      : emptyAddress;

    if (customer) {
      return {
        name: customer.name || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        customerType: customer.customerType || "casual",
        companyNumber: customer.companyNumber || "",
        priceList: getDefaultPriceList(customer.priceList),
        paymentTerms: customer.paymentTerms || "current",
        creditLimit: customer.creditLimit || 0,
        institutionType: customer.institutionType || "",
        weeklyDeliveryDay: customer.weeklyDeliveryDay !== undefined && customer.weeklyDeliveryDay !== null ? String(customer.weeklyDeliveryDay) : "",
        address: addressFromCustomer,
      };
    }
    return {
      name: "",
      lastName: "",
      email: "",
      phone: "",
      customerType: "casual",
      companyNumber: "",
      priceList: getDefaultPriceListId(),
      paymentTerms: "current",
      creditLimit: 0,
      institutionType: "",
      weeklyDeliveryDay: "",
      address: emptyAddress,
    };
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: getDefaultValues(),
  });

  const customerType = watch("customerType");
  const watchedValues = watch();
  const currentPriceList = watch("priceList");

  // בחירת מחירון אוטומטית כשסוג הלקוח משתנה ל-non-casual
  useEffect(() => {
    if (customerType !== "casual" && priceLists && priceLists.length > 0) {
      // אם אין מחירון נבחר או שהמחירון הוא null, נבחר את המחירון עם isDefault: true
      if (!currentPriceList || currentPriceList === null) {
        const defaultPriceListId = getDefaultPriceListId();
        if (defaultPriceListId) {
          setValue("priceList", defaultPriceListId, { shouldDirty: false });
        }
      }
    } else if (customerType === "casual") {
      // אם סוג הלקוח הוא casual, נאפס את המחירון ואת מסגרת האשראי
      setValue("priceList", null, { shouldDirty: false });
      setValue("creditLimit", 0, { shouldDirty: false });
    }
  }, [customerType, priceLists, currentPriceList, setValue]);

  // טעינת נתונים ראשוניים
  useEffect(() => {
    if (customer) {
      const defaultValues = getDefaultValues();
      reset(defaultValues);

      setImageUrl(customer.image || "");
      setInitialImageUrl(customer.image || "");
    } else if (isNewCustomer) {
      reset(getDefaultValues());
      setImageUrl("");
      setInitialImageUrl("");
    }
  }, [customer, reset, isNewCustomer, priceLists]);

  // בדיקת שינויים - שילוב של isDirty מה-form עם שינויים ב-image
  const hasChanges = isNewCustomer
    ? true // תמיד להציג כפתור שמירה בהוספה חדשה
    : isDirty || imageUrl !== initialImageUrl;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // אם סוג הלקוח הוא לא casual ולא נבחר מחירון, נבחר את המחירון עם isDefault: true
      let finalPriceList = data.priceList;
      if (data.customerType !== "casual" && (!finalPriceList || finalPriceList === null)) {
        const defaultPriceListId = getDefaultPriceListId();
        if (defaultPriceListId) {
          finalPriceList = defaultPriceListId;
        }
      } else if (data.customerType === "casual") {
        finalPriceList = null;
      }

      // אם הלקוח הוא casual, מסגרת האשראי חייבת להיות 0
      const finalCreditLimit = data.customerType === "casual" ? 0 : (data.creditLimit || 0);

      // בניית אובייקט כתובת מהטופס (השרת מבצע merge עם כתובת קיימת)
      const address = data.address && typeof data.address === "object"
        ? {
          city: data.address.city || undefined,
          street: data.address.street || undefined,
          houseNumber: data.address.houseNumber || undefined,
          apartmentNumber: data.address.apartmentNumber || undefined,
          floor: data.address.floor || undefined,
          entryCode: data.address.entryCode || undefined,
          postalCode: data.address.postalCode || undefined,
        }
        : {};

      const customerData = {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        customerType: data.customerType,
        companyNumber: data.companyNumber || "",
        priceList: finalPriceList,
        paymentTerms: data.paymentTerms,
        creditLimit: finalCreditLimit,
        image: imageUrl,
        address,
        institutionType: data.institutionType || undefined,
        weeklyDeliveryDay: data.weeklyDeliveryDay !== "" && data.weeklyDeliveryDay !== undefined && data.weeklyDeliveryDay !== null
          ? Number(data.weeklyDeliveryDay)
          : undefined,
      };

      if (data.newPassword && String(data.newPassword).trim()) {
        customerData.password = data.newPassword;
      }

      if (isNewCustomer) {
        // הוספת לקוח חדש
        const res = await CustomerServices.createCustomerByAdmin(customerData);
        notifySuccess(res.message?.he || res.message || t("CustomerCreatedSuccessfully"));
        // מעבר לעמוד הלקוח החדש
        if (res.customer?._id) {
          window.location.href = `/customer/${res.customer._id}`;
        } else {
          window.location.href = `/customers`;
        }
      } else {
        // עדכון לקוח קיים
        const res = await CustomerServices.updateCustomerByAdmin(customerId, customerData);
        notifySuccess(res.message?.he || res.message || t("CustomerUpdatedSuccessfully"));

        // עדכון הערכים הראשוניים - reset יגרום ל-isDirty להיות false
        reset(data);
        setInitialImageUrl(imageUrl);
        setIsUpdate(true);
      }
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || err?.response?.data?.message || err?.message || t("UpdateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    watchedValues,
    isNewCustomer,
  };
};

export default useCustomerSubmit;