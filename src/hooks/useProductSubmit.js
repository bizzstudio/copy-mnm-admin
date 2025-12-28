// src/hooks/useProductSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import useUtilsFunction from "./useUtilsFunction";

const useProductSubmit = (id) => {
  const location = useLocation();
  const { isDrawerOpen, closeDrawer, setIsUpdate, lang, priceLists } =
    useContext(SidebarContext);

  // react hook
  const [imageUrl, setImageUrl] = useState([]);
  const [tag, setTag] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [resData, setResData] = useState({});
  const [language, setLanguage] = useState(lang);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slug, setSlug] = useState("");
  const [isVatFree, setIsVatFree] = useState(true);
  const [isWarehouseProduct, setIsWarehouseProduct] = useState(false);
  const [manageStock, setManageStock] = useState(false);
  const [kashrut, setKashrut] = useState([]);
  const [supplier, setSupplier] = useState("");

  // מלאיים - מערך של מלאיים
  const [stocks, setStocks] = useState([{
    currentQuantity: 0,
    initialQuantity: 0,
    addedDate: new Date().toISOString().split('T')[0],
    expiryDate: null
  }]);

  // מחירים - מערך של מחירים לפי מחירונים
  const [prices, setPrices] = useState([]);

  const { showingTranslateValue, getNumber, getNumberTwo } = useUtilsFunction();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm();

  // יצירת מחירים ברירת מחדל לכל המחירונים
  useEffect(() => {
    if (priceLists && priceLists.length > 0 && prices.length === 0 && !id) {
      const defaultPrices = priceLists.map(priceList => ({
        priceList: priceList._id,
        priceListName: priceList.name,
        price: 0,
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

      // חישוב מלאי כולל
      const totalStock = stocks.reduce((sum, stock) => sum + Number(stock.currentQuantity || 0), 0);

      const productData = {
        productId: data.productId || "",
        barcode: data.barcode || "",
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

        stocks: manageStock ? stocks.map(stock => ({
          currentQuantity: Number(stock.currentQuantity) || 0,
          initialQuantity: Number(stock.initialQuantity) || 0,
          addedDate: stock.addedDate,
          expiryDate: stock.expiryDate || null
        })) : [],

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
        supplier: supplier || "",
        isWarehouseProduct: isWarehouseProduct,
        isVatFree: isVatFree,
        status: data.status || "show",
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

  useEffect(() => {
    if (!isDrawerOpen) {
      setSlug("");
      setLanguage(lang);
      setValue("language", language);
      setResData({});
      setValue("title");
      setValue("slug");
      setValue("description");
      setValue("barcode");
      setValue("productId");
      setValue("minStockThreshold");
      setImageUrl([]);
      setTag([]);
      setSelectedCategory([]);
      setIsVatFree(true);
      setIsWarehouseProduct(false);
      setManageStock(false);
      setKashrut([]);
      setSupplier("");

      // איפוס מלאיים
      setStocks([{
        currentQuantity: 0,
        initialQuantity: 0,
        addedDate: new Date().toISOString().split('T')[0],
        expiryDate: null
      }]);

      // איפוס מחירים
      if (priceLists && priceLists.length > 0) {
        const defaultPrices = priceLists.map(priceList => ({
          priceList: priceList._id,
          priceListName: priceList.name,
          price: 0,
          salePrice: null,
          warehousePrice: null,
          purchaseLimit: null
        }));
        setPrices(defaultPrices);
      }

      clearErrors("title");
      clearErrors("slug");
      clearErrors("description");
      clearErrors("barcode");
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
            setSlug(res.slug || "");
            setValue("title", res.title?.[language ? language : "he"] || "");
            setValue("description", res.description?.[language ? language : "he"] || "");
            setValue("slug", res.slug || "");
            setValue("status", res.status || "show");
            setValue("barcode", res.barcode || "");
            setValue("productId", res.productId || "");
            setValue("minStockThreshold", res.minStockThreshold || null);
            setIsVatFree(res.isVatFree !== undefined ? res.isVatFree : true);
            setIsWarehouseProduct(res.isWarehouseProduct !== undefined ? res.isWarehouseProduct : false);
            setManageStock(res.manageStock !== undefined ? res.manageStock : false);
            setKashrut(res.kashrut || []);
            setSupplier(res.supplier || "");

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
            setImageUrl(res.image || []);

            // טעינת מלאיים
            if (res.stocks && Array.isArray(res.stocks) && res.stocks.length > 0) {
              setStocks(res.stocks.map(stock => ({
                ...stock,
                addedDate: stock.addedDate ? new Date(stock.addedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                expiryDate: stock.expiryDate ? new Date(stock.expiryDate).toISOString().split('T')[0] : null
              })));
            } else {
              // אם אין מלאיים, ניצור אחד ברירת מחדל
              setStocks([{
                currentQuantity: 0,
                initialQuantity: 0,
                addedDate: new Date().toISOString().split('T')[0],
                expiryDate: null
              }]);
            }

            // טעינת מחירים
            if (res.prices && Array.isArray(res.prices) && res.prices.length > 0) {
              const loadedPrices = res.prices.map(p => {
                const priceListId = p.priceList?._id || p.priceList;
                const priceListName = p.priceList?.name || priceLists?.find(pl => pl._id === priceListId)?.name || "";
                return {
                  priceList: priceListId,
                  priceListName: priceListName,
                  price: p.price || 0,
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
                  price: 0,
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
    setSlug(slug);
  };

  // Handle product slug only if slug is empty
  const handleProductSlugIfEmpty = (titleValue) => {
    const currentSlug = getValues("slug") || slug;
    if (!currentSlug || currentSlug.trim() === "") {
      handleProductSlug(titleValue);
    }
  };

  // Handle select language
  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    if (Object.keys(resData).length > 0) {
      setValue("title", resData.title[lang ? lang : "he"]);
      setValue("description", resData.description[lang ? lang : "he"]);
    }
  };

  // Handle stock changes
  const handleAddStock = () => {
    setStocks([...stocks, {
      currentQuantity: 0,
      initialQuantity: 0,
      addedDate: new Date().toISOString().split('T')[0],
      expiryDate: null
    }]);
  };

  const handleRemoveStock = (index) => {
    if (stocks.length > 1) {
      const newStocks = stocks.filter((_, i) => i !== index);
      setStocks(newStocks);
    }
  };

  const handleStockChange = (index, field, value) => {
    const newStocks = [...stocks];
    newStocks[index][field] = value;
    setStocks(newStocks);
  };

  // Handle price changes
  const handlePriceChange = (priceListId, field, value) => {
    const newPrices = prices.map(p => {
      if (p.priceList === priceListId) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setPrices(newPrices);
  };

  return {
    tag,
    setTag,
    language,
    register,
    onSubmit,
    errors,
    slug,
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
    setIsVatFree,
    isWarehouseProduct,
    setIsWarehouseProduct,
    manageStock,
    setManageStock,
    kashrut,
    setKashrut,
    supplier,
    setSupplier,
    stocks,
    setStocks,
    handleAddStock,
    handleRemoveStock,
    handleStockChange,
    prices,
    setPrices,
    handlePriceChange,
    priceLists,
  };
};

export default useProductSubmit;
