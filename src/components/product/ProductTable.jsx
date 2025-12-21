// src/components/product/ProductTable.jsx
import {
  Avatar,
  TableBody,
  TableCell,
  TableRow,
  Input
} from "@windmill/react-ui";
import { t } from "i18next";
import { FiZoomIn } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

// Internal import
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import Tooltip from "@/components/tooltip/Tooltip";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useAsync from "@/hooks/useAsync";
import ProductServices from "@/services/ProductServices";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import { notifySuccess } from "@/utils/toast";
import OfferServices from "@/services/OfferServices";
import { SidebarContext } from "@/context/SidebarContext";

const ProductTable = ({
  products: initialProducts,
  isCheck,
  setIsCheck,
  title, serviceId, handleModalOpen, handleUpdate
}) => {
  const { currency, showingTranslateValue, getNumberTwo } = useUtilsFunction();
  const { priceLists } = useContext(SidebarContext);
  const { data: offers, loading, error } = useAsync(() => OfferServices.getAllOffers());
  const [products, setProducts] = useState(initialProducts);

  // מחיר עבור המחירון הראשון (ברירת מחדל)
  const [priceInputs, setPriceInputs] = useState(
    initialProducts.reduce((acc, product) => {
      const firstPrice = product.prices && product.prices.length > 0 ? product.prices[0].price : 0;
      acc[product._id] = getNumberTwo(firstPrice);
      return acc;
    }, {})
  );

  // רענון הרשימה כל פעם שמגיעים מוצרים חדשים בפרופס
  useEffect(() => {
    setProducts(initialProducts);
    setPriceInputs(
      initialProducts.reduce((acc, product) => {
        const firstPrice = product.prices && product.prices.length > 0 ? product.prices[0].price : 0;
        acc[product._id] = getNumberTwo(firstPrice);
        return acc;
      }, {})
    );
  }, [initialProducts]);

  // שינוי מחיר מוצר
  const handlePriceChange = (e, productId) => {
    const value = e.target.value;
    setPriceInputs((prev) => ({ ...prev, [productId]: value }));
  };

  // אישור שינוי מחיר (עדכון המחירון הראשון)
  const [isUpdatingPrice, setIsUpdatingPrice] = useState({ state: false, id: null });
  const handleSubmit = async (e, productId) => {
    e.preventDefault();
    const newPrice = e.target[0].value;

    // Start updating price
    setIsUpdatingPrice({ state: true, id: productId });

    try {
      const product = products.find(p => p._id === productId);
      if (!product || !product.prices || product.prices.length === 0) {
        throw new Error("מוצר לא נמצא או אין מחירים");
      }

      // עדכון המחיר הראשון
      const updatedPrices = [...product.prices];
      updatedPrices[0] = { ...updatedPrices[0], price: Number(newPrice) };

      await ProductServices.updateProductPrice(productId, { prices: updatedPrices });

      // Update the product in the state with the new price
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === productId ? { ...p, prices: updatedPrices } : p
        )
      );
      notifySuccess(t("Price updated successfully"));
    } catch (error) {
      console.error("Error updating price:", error);
    }

    // Finish updating price
    setIsUpdatingPrice({ state: false, id: null });
  };

  // צ'קבוקס מוצר
  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  // חישוב מלאי כולל
  const calculateTotalStock = (stocks) => {
    if (!stocks || stocks.length === 0) return 0;
    return stocks.reduce((sum, stock) => sum + (stock.currentQuantity || 0), 0);
  };

  return (
    <>
      {isCheck?.length < 1 && <DeleteModal id={serviceId} title={title} />}

      <TableBody>
        {products?.map((product, i) => {
          const totalStock = calculateTotalStock(product.stocks);
          const firstPrice = product.prices && product.prices.length > 0 ? product.prices[0] : null;

          return (
            <TableRow key={i + 1}>
              {/* checkbox */}
              <TableCell className='text-center'>
                <CheckBox
                  type="checkbox"
                  name={product?.title?.en}
                  id={product._id}
                  handleClick={handleClick}
                  isChecked={isCheck?.includes(product._id)}
                />
              </TableCell>

              {/* status */}
              <TableCell className="text-center">
                <ShowHideButton id={product._id} status={product.status} />
              </TableCell>

              {/* image & title */}
              <TableCell className='text-center'>
                <div className="flex items-center">
                  {product?.image && product.image[0] ? (
                    <Avatar
                      className="hidden p-1 ml-2 md:block bg-gray-50 shadow-none"
                      src={product.image[0]}
                      alt="product"
                    />
                  ) : (
                    <Avatar
                      className="hidden p-1 ml-2 md:block bg-gray-50 shadow-none"
                      src={`https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png`}
                      alt="product"
                    />
                  )}
                  <div>
                    <h2
                      className={`text-sm font-medium ${product?.title?.he?.length > 30 ? "wrap-long-title" : ""
                        }`}
                    >
                      {showingTranslateValue(product?.title)?.substring(0, 28)}
                    </h2>
                  </div>
                </div>
              </TableCell>

              {/* price */}
              <TableCell className='text-center'>
                <span className="text-sm font-semibold flex items-center justify-center">
                  {currency}
                  {isUpdatingPrice.state && isUpdatingPrice.id === product._id ? (
                    <img src={spinnerLoadingImage} alt="Loading..." className="h-6 w-6" />
                  ) : firstPrice ? (
                    <form onSubmit={(e) => handleSubmit(e, product._id)}>
                      <Input
                        className='!w-20 h-fit mr-1 text-center'
                        type="number"
                        step="0.01"
                        value={priceInputs[product._id]}
                        onChange={(e) => handlePriceChange(e, product._id)}
                      />
                    </form>
                  ) : (
                    <span>-</span>
                  )}
                </span>
              </TableCell>

              {/* offer */}
              <TableCell className='text-center'>
                <span className="text-sm">
                  {offers.find((offer) => offer.products.some(prod => prod._id == product._id))?.name?.he || "-"}
                </span>
              </TableCell>

              {/* categories */}
              <TableCell className='text-center'>
                <span className="text-sm">
                  {product?.categories?.map(cat => showingTranslateValue(cat?.name)).join(", ") || "-"}
                </span>
              </TableCell>

              {/* stock */}
              <TableCell className='text-center'>
                <span className="text-sm">
                  {product.manageStock ? totalStock : t("UnlimitedStock")}
                </span>
              </TableCell>

              {/* barcode */}
              <TableCell className='text-center'>
                <span className="text-sm">
                  {product?.barcode || "-"}
                </span>
              </TableCell>

              {/* zoom in */}
              <TableCell className='text-center'>
                <Link
                  to={`/product/${product._id}`}
                  className="flex justify-center text-gray-400 hover:text-customGreen-dark"
                >
                  <Tooltip
                    id="view"
                    Icon={FiZoomIn}
                    title={t("DetailsTbl")}
                    bgColor="#10B981"
                  />
                </Link>
              </TableCell>

              {/* edit & delete */}
              <TableCell className='text-center'>
                <EditDeleteButton
                  id={product._id}
                  product={product}
                  isCheck={isCheck}
                  handleUpdate={handleUpdate}
                  handleModalOpen={handleModalOpen}
                  title={showingTranslateValue(product?.title)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );
};

export default ProductTable;
