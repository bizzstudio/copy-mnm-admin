// src/components/product/ProductTable.jsx
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { t } from "i18next";
import { FiZoomIn } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Internal import
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import Tooltip from "@/components/tooltip/Tooltip";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useAsync from "@/hooks/useAsync";
import OfferServices from "@/services/OfferServices";
import ProductServices from "@/services/ProductServices";
import ProductPriceInput from "@/components/product/ProductPriceInput";
import { notifyError } from "@/utils/toast";
import {
  DEFAULT_PRODUCT_IMAGE,
  getPrimaryProductImageUrl,
} from "@/utils/productImage";

const ProductTable = ({
  products: initialProducts,
  isCheck,
  setIsCheck,
  title, serviceId, handleModalOpen, handleUpdate,
  selectedPriceListId,
}) => {
  const { showingTranslateValue } = useUtilsFunction();
  const { data: offers, loading, error } = useAsync(() => OfferServices.getAllOffers());
  const [products, setProducts] = useState(initialProducts);
  const [complementaryUpdatingId, setComplementaryUpdatingId] = useState(null);

  // רענון הרשימה כל פעם שמגיעים מוצרים חדשים בפרופס
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // עדכון מוצר לאחר עדכון מחיר
  const handlePriceUpdate = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p._id === updatedProduct._id ? updatedProduct : p
      )
    );
  };

  // צ'קבוקס מוצר
  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  const handleComplementaryToggle = async (e, product) => {
    const checked = e.target.checked;
    const id = product._id;
    setComplementaryUpdatingId(id);
    try {
      await ProductServices.updateProduct(id, { isComplementaryProduct: checked });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isComplementaryProduct: checked } : p))
      );
    } catch (err) {
      e.target.checked = !checked;
      notifyError(err?.response?.data?.message || err?.message || t("Error"));
    } finally {
      setComplementaryUpdatingId(null);
    }
  };

  return (
    <TableBody>
      {products?.map((product, i) => {
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
              <div className="flex items-center w-fit">
                <img
                  src={
                    getPrimaryProductImageUrl(product) ||
                    DEFAULT_PRODUCT_IMAGE
                  }
                  alt=""
                  className="hidden md:block ml-2 h-10 w-10 shrink-0 rounded-full object-cover bg-gray-50 p-0.5 shadow-none ring-1 ring-gray-100 dark:ring-gray-600"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                  }}
                />
                <div className="text-sm font-medium text-center max-w-[26vw] overflow-hidden truncate">
                  {showingTranslateValue(product?.title)}
                </div>
              </div>
            </TableCell>

            {/* price */}
            <TableCell className='text-center'>
              <ProductPriceInput
                product={product}
                selectedPriceListId={selectedPriceListId}
                onPriceUpdate={handlePriceUpdate}
              />
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

            {/* stock — כמות רק כשמופעל ניהול מלאי */}
            <TableCell className='text-center'>
              <span className="text-sm">
                {product.manageStock ? (product.stock ?? 0) : t("UnlimitedStock")}
              </span>
            </TableCell>

            {/* מוצר משלים — עדכון מיידי */}
            <TableCell className="text-center">
              <CheckBox
                type="checkbox"
                name={`complementary-${product._id}`}
                id={`complementary-${product._id}`}
                disabled={complementaryUpdatingId === product._id}
                isChecked={!!product.isComplementaryProduct}
                handleClick={(e) => {
                  e.stopPropagation();
                  handleComplementaryToggle(e, product);
                }}
              />
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
              <div className="flex justify-center items-center">
                <EditDeleteButton
                  id={product._id}
                  product={product}
                  isCheck={isCheck}
                  handleUpdate={handleUpdate}
                  handleModalOpen={handleModalOpen}
                  title={showingTranslateValue(product?.title)}
                />
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default ProductTable;
