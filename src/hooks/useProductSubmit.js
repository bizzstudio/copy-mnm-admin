// src/hooks/useProductSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import useUtilsFunction from "./useUtilsFunction";

const useProductSubmit = (id, pendingBarcode = null, onBarcodeUsed = null) => {
  const location = useLocation();
  const { isDrawerOpen, closeDrawer, setIsUpdate, lang, priceLists } =
    useContext(SidebarContext);

  // react hook - שדות מורכבים שצריכים להישאר ב-state
  const [imageUrl, setImageUrl] = useState([]);
  const [tag, setTag] = useState([]);
  const [kashrut, setKashrut] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [resData, setResData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastStockUpdate, setLastStockUpdate] = useState(null);
  const [prices, setPrices] = useState([]);

  const { showingTranslateValue, getNumber, getNumberTwo } = useUtilsFunction();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      slug: "",
      barcode: "",
      itemNumber: "",
      supplier: "",
      stock: 0,
      expiryDate: null,
      minStockThreshold: null,
      status: "show",
      language: lang,
      isVatFree: true,
      isWarehouseProduct: false,
      isComplementaryProduct: false,
      manageStock: false,
      sortCode: "",
      weight: null,
      weightUnit: "",
      managementNotes: "",
    },
  });

  // Watch values from form
  const language = watch("language");
  const supplier = watch("supplier");
  const stock = watch("stock");
  const expiryDate = watch("expiryDate");
  const isVatFree = watch("isVatFree");
  const isWarehouseProduct = watch("isWarehouseProduct");
  const isComplementaryProduct = watch("isComplementaryProduct");
  const manageStock = watch("manageStock");
  const slug = watch("slug");

  // יצירת מחירים ברירת מחדל לכל המחירונים
  useEffect(() => {
    if (priceLists && priceLists.length > 0 && prices.length === 0 && !id) {
      const defaultPrices = priceLists.map(priceList => ({
        priceList: priceList._id,
        priceListName: priceList.name,
        price: null,
        salePrice: null,
        warehousePrice: null,
        purchaseLimit: null
      }));
      setPrices(defaultPrices);
    }
  }, [priceLists, prices.length, id]);

  const onSubmit = async (data) => {
    console.log('onSubmit data :>>', data);
    try {
      setIsSubmitting(true);

      if (selectedCategory.length === 0) {
        setIsSubmitting(false);
        return notifyError("קטגוריה היא שדה חובה!");
      }

      // בדיקת מחירים - לפחות מחיר אחד חייב להיות גדול מ-0
      const hasValidPrice = prices.some(p => p.price > 0);
      if (!hasValidPrice) {
        setIsSubmitting(false);
        return notifyError("לפחות מחירון אחד חייב להכיל מחיר!");
      }

      const productData = {
        barcode: data.barcode || "",
        itemNumber: data.itemNumber || "",
        title: {
          [language]: data.title,
        },
        description: {
          [language]: data.description || "",
        },
        slug: data.slug
          ? data.slug
          : data.title.toLowerCase().replace(/[^A-Z0-9]+/gi, "-"),

        categories: selectedCategory.map((item) => item._id),
        image: imageUrl,

        stock: manageStock ? Number(data.stock) || 0 : 0,
        expiryDate: manageStock && data.expiryDate ? data.expiryDate : null,
        manageStock: manageStock,
        minStockThreshold: data.minStockThreshold ? Number(data.minStockThreshold) : null,
        sales: 0,

        tag: tag || [],

        prices: prices.map(p => ({
          priceList: p.priceList,
          price: Number(p.price) || 0,
          salePrice: p.salePrice ? Number(p.salePrice) : null,
          warehousePrice: p.warehousePrice ? Number(p.warehousePrice) : null,
          purchaseLimit: p.purchaseLimit ? Number(p.purchaseLimit) : null
        })),

        kashrut: kashrut || [],
        supplier: data.supplier || "",
        isWarehouseProduct: isWarehouseProduct,
        isComplementaryProduct: !!isComplementaryProduct,
        isVatFree: isVatFree,
        status: data.status || "show",
        sortCode: data.sortCode || "",
        weight: data.weight ? Number(data.weight) : null,
        weightUnit: data.weightUnit || "",
        managementNotes: data.managementNotes || "",
      };

      console.log("productData :>>", productData);

      if (id) {
        const res = await ProductServices.updateProduct(id, productData);
        if (res) {
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsSubmitting(false);
          closeDrawer();
        }
      } else {
        const res = await ProductServices.addProduct(productData);
        setIsUpdate(true);
        notifySuccess("מוצר נוסף בהצלחה!");
        setIsSubmitting(false);
        closeDrawer();
      }
    } catch (err) {
      setIsSubmitting(false);
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  // Handle pending barcode from scanner
  useEffect(() => {
    if (pendingBarcode && !id && isDrawerOpen) {
      setValue("barcode", pendingBarcode);
      if (onBarcodeUsed) {
        onBarcodeUsed();
      }
    }
  }, [pendingBarcode, id, isDrawerOpen, setValue, onBarcodeUsed]);

  useEffect(() => {
    if (!isDrawerOpen) {
      setResData({});
      setImageUrl([]);
      setTag([]);
      setKashrut([]);
      setSelectedCategory([]);
      setLastStockUpdate(null);

      // איפוס טופס
      reset();

      // איפוס מחירים
      if (priceLists && priceLists.length > 0) {
        const defaultPrices = priceLists.map(priceList => ({
          priceList: priceList._id,
          priceListName: priceList.name,
          price: null,
          salePrice: null,
          warehousePrice: null,
          purchaseLimit: null
        }));
        setPrices(defaultPrices);
      }

      clearErrors();
      setIsSubmitting(false);
      return;
    }

    if (id) {
      (async () => {
        try {
          const res = await ProductServices.getProductById(id);
          console.log('product data :>> ', res);

          if (res) {
            setResData(res);
            const currentLanguage = language || lang || "he";

            // עדכון טופס עם נתונים מהשרת
            reset({
              title: res.title?.[currentLanguage] || "",
              description: res.description?.[currentLanguage] || "",
              slug: res.slug || "",
              barcode: res.barcode || "",
              itemNumber: res.itemNumber || "",
              supplier: res.supplier || "",
              stock: res.stock || 0,
              expiryDate: res.expiryDate ? new Date(res.expiryDate).toISOString().split('T')[0] : null,
              minStockThreshold: res.minStockThreshold || null,
              status: res.status || "show",
              language: currentLanguage,
              isVatFree: res.isVatFree !== undefined ? res.isVatFree : true,
              isWarehouseProduct: res.isWarehouseProduct !== undefined ? res.isWarehouseProduct : false,
              isComplementaryProduct: res.isComplementaryProduct !== undefined ? res.isComplementaryProduct : false,
              manageStock: res.manageStock !== undefined ? res.manageStock : false,
              sortCode: res.sortCode || "",
              weight: res.weight || null,
              weightUnit: res.weightUnit || "",
              managementNotes: res.managementNotes || "",
            });

            if (res.categories && Array.isArray(res.categories)) {
              res.categories.map((category) => {
                category.name = showingTranslateValue(category?.name, lang);
                return category;
              });
              setSelectedCategory(res.categories);
            } else {
              setSelectedCategory([]);
            }

            setTag(res.tag || []);
            setKashrut(res.kashrut || []);
            setImageUrl(res.image || []);
            setLastStockUpdate(res.lastStockUpdate || null);

            // טעינת מחירים
            if (res.prices && Array.isArray(res.prices) && res.prices.length > 0) {
              const loadedPrices = res.prices.map(p => {
                const priceListId = p.priceList?._id || p.priceList;
                const priceListName = p.priceList?.name || priceLists?.find(pl => pl._id === priceListId)?.name || "";
                return {
                  priceList: priceListId,
                  priceListName: priceListName,
                  price: p.price ?? null,
                  salePrice: p.salePrice || null,
                  warehousePrice: p.warehousePrice || null,
                  purchaseLimit: p.purchaseLimit || null
                };
              });
              setPrices(loadedPrices);
            } else {
              // אם אין מחירים, ניצור מחירים ברירת מחדל לכל המחירונים
              if (priceLists && priceLists.length > 0) {
                const defaultPrices = priceLists.map(priceList => ({
                  priceList: priceList._id,
                  priceListName: priceList.name,
                  price: null,
                  salePrice: null,
                  warehousePrice: null,
                  purchaseLimit: null
                }));
                setPrices(defaultPrices);
              }
            }
          }
        } catch (err) {
          console.error('error :>> ', err);
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
  }, [id, setValue, isDrawerOpen, location.pathname, clearErrors, language, lang, priceLists]);

  // Handle product slug
  const handleProductSlug = (value) => {
    const slug = value
      .toLowerCase()
      .replace(/[()]+/g, "")
      .replace(/\s+/g, "-");
    setValue("slug", slug);
  };

  // Handle product slug only if slug is empty
  const handleProductSlugIfEmpty = (titleValue) => {
    const currentSlug = getValues("slug");
    if (!currentSlug || currentSlug.trim() === "") {
      handleProductSlug(titleValue);
    }
  };

  // Handle select language
  const handleSelectLanguage = (lang) => {
    setValue("language", lang);
    if (Object.keys(resData).length > 0) {
      setValue("title", resData.title[lang ? lang : "he"] || "");
      setValue("description", resData.description[lang ? lang : "he"] || "");
    }
  };

  // Handle price changes
  const handlePriceChange = (priceListId, field, value) => {
    const normalizedTargetId = String(priceListId);
    let found = false;

    const newPrices = prices.map((p) => {
      if (String(p.priceList) === normalizedTargetId) {
        found = true;
        return { ...p, priceList: normalizedTargetId, [field]: value };
      }
      return p;
    });

    // אם המחירון לא קיים ב-state (פער מזהים/נתונים), נוסיף אותו כדי שהקלט יהיה ניתן לעריכה
    if (!found) {
      newPrices.push({
        priceList: normalizedTargetId,
        priceListName: priceLists?.find((pl) => String(pl._id) === normalizedTargetId)?.name || "",
        price: field === "price" ? value : null,
        salePrice: field === "salePrice" ? value : null,
        warehousePrice: field === "warehousePrice" ? value : null,
        purchaseLimit: field === "purchaseLimit" ? value : null,
      });
    }

    setPrices(newPrices);
  };

  return {
    tag,
    setTag,
    kashrut,
    setKashrut,
    language,
    register,
    onSubmit,
    errors,
    watch,
    setValue,
    imageUrl,
    setImageUrl,
    handleSubmit,
    isSubmitting,
    selectedCategory,
    setSelectedCategory,
    handleProductSlug,
    handleProductSlugIfEmpty,
    handleSelectLanguage,
    isVatFree,
    isWarehouseProduct,
    isComplementaryProduct,
    manageStock,
    supplier,
    stock,
    expiryDate,
    lastStockUpdate,
    prices,
    setPrices,
    handlePriceChange,
    priceLists,
  };
};

export default useProductSubmit;
