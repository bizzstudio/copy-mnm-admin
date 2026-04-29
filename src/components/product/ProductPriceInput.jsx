// src/components/product/ProductPriceInput.jsx
import { Input } from "@windmill/react-ui";
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import ProductServices from "@/services/ProductServices";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyError } from "@/utils/toast";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { SidebarContext } from "@/context/SidebarContext";

const ProductPriceInput = ({
  product,
  selectedPriceListId,
  onPriceUpdate
}) => {
  const { setIsUpdate } = useContext(SidebarContext);
  const { t } = useTranslation();

  const { currency, getNumberTwo } = useUtilsFunction();
  const [price, setPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // מציאת המחיר של המחירון הנבחר
  const getPriceForSelectedPriceList = () => {
    if (!selectedPriceListId || !product?.prices || product.prices.length === 0) {
      return 0;
    }
    const priceItem = product.prices.find((p) => {
      const plId = p.priceList?._id ?? p.priceList;
      return (
        selectedPriceListId != null &&
        plId != null &&
        String(plId) === String(selectedPriceListId)
      );
    });
    return priceItem ? priceItem.price : 0;
  };

  // אתחול המחיר כשהמוצר או המחירון משתנים
  useEffect(() => {
    const currentPrice = getPriceForSelectedPriceList();
    setPrice(getNumberTwo(currentPrice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, selectedPriceListId]);

  // עדכון המחיר
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPrice = e.target[0].value;

    if (!selectedPriceListId) {
      notifyError(t("PleaseSelectPriceList"));
      return;
    }

    if (!product?._id) {
      notifyError(t("ProductNotFound"));
      return;
    }

    setIsUpdating(true);

    try {
      // עדכון המחיר של המחירון הנבחר
      const response = await ProductServices.updateProductPrice(
        product._id,
        selectedPriceListId,
        { price: Number(newPrice) }
      );

      // עדכון המוצר עם המחיר החדש
      const updatedPrices = [...(product.prices || [])];
      const priceIndex = updatedPrices.findIndex((priceItem) => {
        const plId = priceItem.priceList?._id ?? priceItem.priceList;
        return (
          selectedPriceListId != null &&
          plId != null &&
          String(plId) === String(selectedPriceListId)
        );
      });

      if (priceIndex !== -1) {
        updatedPrices[priceIndex] = { ...updatedPrices[priceIndex], price: Number(newPrice) };
      } else {
        updatedPrices.push({
          priceList: selectedPriceListId,
          price: Number(newPrice)
        });
      }

      const updatedProduct = { ...product, prices: updatedPrices };

      // עדכון המחיר ב-input
      setPrice(getNumberTwo(Number(newPrice)));

      // קריאה ל-callback לעדכון המוצר ב-state של הטבלה
      if (onPriceUpdate) {
        onPriceUpdate(updatedProduct);
      }

      notifyApiResponse(response, true);
      setIsUpdate(true);
    } catch (error) {
      console.error("Error updating price:", error);
      notifyApiResponse(error.response || error, false);
      // שחזור המחיר הקודם במקרה של שגיאה
      const currentPrice = getPriceForSelectedPriceList();
      setPrice(getNumberTwo(currentPrice));
    } finally {
      setIsUpdating(false);
    }
  };

  // שינוי ערך ב-input
  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  if (!selectedPriceListId) {
    return (
      <span className="text-sm font-semibold flex items-center justify-center">
        {currency}
        <span>-</span>
      </span>
    );
  }

  return (
    <span className="text-sm font-semibold flex items-center justify-center">
      {currency}
      {isUpdating ? (
        <img src={spinnerLoadingImage} alt="Loading..." className="h-6 w-6" />
      ) : (
        <form onSubmit={handleSubmit}>
          <Input
            className='w-20! h-fit mr-1 text-center'
            type="number"
            step="0.01"
            value={price}
            onChange={handlePriceChange}
          />
        </form>
      )}
    </span>
  );
};

export default ProductPriceInput;