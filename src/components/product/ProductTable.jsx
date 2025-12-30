// src/components/product/ProductTable.jsx
import {
  Avatar,
  TableBody,
  TableCell,
  TableRow,
} from "@windmill/react-ui";
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
import ProductPriceInput from "@/components/product/ProductPriceInput";

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

              {/* stock */}
              <TableCell className='text-center'>
                <span className="text-sm">
                  {product.manageStock ? (product.stock || 0) : t("UnlimitedStock")}
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
  );
};

export default ProductTable;
