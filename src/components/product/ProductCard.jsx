// src/components/product/ProductCard.jsx
import { Avatar } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";

// internal import
import EditDeleteButton from "../table/EditDeleteButton";
import ActiveInActiveButton from "../table/ActiveInActiveButton";
import CheckBox from "../form/others/CheckBox";
import { UserContext } from "@/context/UserContext";

const ProductCard = ({ product, isCheck, setIsCheck, handleClick, toggleDrawerData }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            {/* Header with checkbox and actions */}
            <div className="flex justify-between items-start mb-3">
                <CheckBox
                    type="checkbox"
                    name={product?._id}
                    id={product?._id}
                    handleClick={handleClick}
                    isChecked={isCheck?.includes(product?._id)}
                />
                <EditDeleteButton
                    id={product._id}
                    product={product}
                    isSubmitting={toggleDrawerData.isSubmitting}
                    handleUpdate={toggleDrawerData.handleUpdate}
                    handleModalOpen={toggleDrawerData.handleModalOpen}
                    title={product?.name}
                />
            </div>

            {/* Product info */}
            <div className="flex items-center gap-2.5 mb-3">
                <Avatar
                    className="bg-gray-50"
                    src={(product.images && product.images.length > 0 ? product.images[0] : null) || 'https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png'}
                    alt="product"
                />
                <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {product?.name}
                    </h2>
                    <p className="text-sm text-gray-500">{product?.sku}</p>
                </div>
            </div>

            {/* Product details */}
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                {userInfo?.role === "super-admin" && (
                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Owner")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{product?.owner?.name || "-"}</span>
                    </div>
                )}

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Category")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{product?.category || "-"}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Brand")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{product?.brand || "-"}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Stock")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{product?.stock || 0}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Sales")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{product?.sales || 0}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("InternalCost")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                        {product?.internalCost ? `₪${product.internalCost.toFixed(2)}` : "-"}
                    </span>
                </div>

                {product?.barcode && (
                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Barcode")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{product.barcode}</span>
                    </div>
                )}

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Status")}:</span>
                    <ActiveInActiveButton
                        id={product?._id}
                        product={product}
                        option="product"
                        status={product.status}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
