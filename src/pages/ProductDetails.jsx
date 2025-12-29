import {
  Badge,
  Card,
  CardBody,
} from "@windmill/react-ui";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

// Internal import
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import ProductServices from "@/services/ProductServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import MainDrawer from "@/components/drawer/MainDrawer";
import ProductDrawer from "@/components/drawer/ProductDrawer";
import Loading from "@/components/preloader/Loading";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { handleUpdate } = useToggleDrawer();
  const { lang, priceLists } = useContext(SidebarContext);

  const { data, loading } = useAsync(() => ProductServices.getProductById(id));

  const { currency, showingTranslateValue, getNumberTwo } = useUtilsFunction();

  // מציאת שם מחירון - priceList יכול להיות אובייקט או ID
  const getPriceListName = (priceList) => {
    // אם priceList הוא אובייקט עם name, נחזיר את ה-name ישירות
    if (typeof priceList === 'object' && priceList?.name) {
      return priceList.name;
    }
    // אם priceList הוא ID (string), נחפש אותו ב-priceLists
    if (typeof priceList === 'string') {
      const foundPriceList = priceLists?.find(pl => pl._id === priceList);
      return foundPriceList ? foundPriceList.name : t("UnknownPriceList");
    }
    return t("UnknownPriceList");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <MainDrawer maxWidth='700px'>
        <ProductDrawer id={id} />
      </MainDrawer>

      <div className="max-w-7xl mx-auto">
        <PageTitle>{t("ProductDetails")}</PageTitle>

        {loading ? (
          <Loading loading={loading} />
        ) : (
          <div className="mt-6 space-y-6">
            {/* Header Card - Image and Basic Info */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardBody className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Product Image */}
                  <div className="lg:col-span-1 flex justify-center lg:justify-start">
                    <div className="relative w-full max-w-sm aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md">
                      {data?.image && data.image[0] ? (
                        <img
                          src={data.image[0]}
                          alt="product"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                          alt="product"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="lg:col-span-2 space-y-4 text-right">
                    {/* Status Badge */}
                    <div className="flex items-center justify-end gap-2">
                      {data.status === "show" ? (
                        <Badge type="success" className="text-xs">
                          {t("ThisProductShowing")}
                        </Badge>
                      ) : (
                        <Badge type="danger" className="text-xs">
                          {t("ThisProductHidden")}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {showingTranslateValue(data?.title)}
                    </h1>

                    {/* Barcode and Product ID */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {data?.barcode && (
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {t("Barcode")}:
                          </span>
                          <span className="mr-2 font-bold text-gray-900 dark:text-gray-100">
                            {data.barcode}
                          </span>
                        </div>
                      )}
                      {data?.productId && (
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {t("ProductID")}:
                          </span>
                          <span className="mr-2 font-bold text-gray-900 dark:text-gray-100">
                            {data.productId}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center justify-end gap-3 flex-wrap">
                      {data?.manageStock ? (
                        <>
                          {(data.stock || 0) <= 0 ? (
                            <Badge type="danger" className="text-sm px-4 py-2">
                              {t("StockOut")}
                            </Badge>
                          ) : (
                            <Badge type="success" className="text-sm px-4 py-2">
                              {t("InStock")}
                            </Badge>
                          )}
                          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              {t("Quantity")}:
                            </span>
                            <span className="mr-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                              {data.stock || 0}
                            </span>
                          </div>
                        </>
                      ) : (
                        <Badge type="success" className="text-sm px-4 py-2">
                          {t("UnlimitedStock")}
                        </Badge>
                      )}
                    </div>

                    {/* Edit Button */}
                    <div className="pt-4">
                      <button
                        onClick={() => handleUpdate(id)}
                        className="cursor-pointer transition-all duration-200 font-medium text-sm focus:outline-none px-6 py-3 rounded-lg text-white bg-customGreen hover:bg-customGreen-dark active:bg-customGreen-dark shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        {t("EditProduct")}
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Grid Layout for Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prices Card */}
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    {t("ProductPrices")}
                  </h2>
                  {data?.prices && data.prices.length > 0 ? (
                    <div className="space-y-4">
                      {data.prices.map((priceItem, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-lg">
                            {getPriceListName(priceItem.priceList)}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {t("Price")}:
                              </span>
                              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {currency}{getNumberTwo(priceItem.price)}
                              </span>
                            </div>
                            {priceItem.salePrice && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {t("SalePrice")}:
                                </span>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {currency}{getNumberTwo(priceItem.salePrice)}
                                </span>
                              </div>
                            )}
                            {priceItem.warehousePrice && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {t("WarehousePrice")}:
                                </span>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {currency}{getNumberTwo(priceItem.warehousePrice)}
                                </span>
                              </div>
                            )}
                            {priceItem.purchaseLimit && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {t("PurchaseLimit")}: <span className="font-semibold">{priceItem.purchaseLimit}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      {t("NoPricesAvailable")}
                    </p>
                  )}
                </CardBody>
              </Card>

              {/* Stock Details Card */}
              {data?.manageStock && (
                <Card className="bg-white dark:bg-gray-800 shadow-lg">
                  <CardBody className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                      {t("StockInformation")}
                    </h2>
                    <div className="space-y-4">
                      {data.expiryDate && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {t("ExpiryDate")}
                          </div>
                          <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                            {new Date(data.expiryDate).toLocaleDateString('he-IL')}
                          </div>
                        </div>
                      )}
                      {data.lastStockUpdate && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {t("LastStockUpdate")}
                          </div>
                          <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {new Date(data.lastStockUpdate).toLocaleString('he-IL', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      )}
                      {data.minStockThreshold && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {t("MinStockThreshold")}
                          </div>
                          <div className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                            {data.minStockThreshold}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Description Card */}
              {data?.description && (
                <Card className="bg-white dark:bg-gray-800 shadow-lg lg:col-span-2">
                  <CardBody className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                      {t("Description")}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                      {showingTranslateValue(data.description)}
                    </p>
                  </CardBody>
                </Card>
              )}

              {/* Additional Details Card */}
              <Card className="bg-white dark:bg-gray-800 shadow-lg lg:col-span-2">
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    {t("AdditionalDetails")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Categories */}
                    {data?.categories && data.categories.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {t("Categories")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.categories.map((cat, i) => (
                            <span
                              key={i}
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {showingTranslateValue(cat?.name)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Supplier */}
                    {data?.supplier && (
                      <div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {t("Supplier")}
                        </div>
                        <div className="text-base text-gray-900 dark:text-gray-100">
                          {data.supplier}
                        </div>
                      </div>
                    )}

                    {/* Kashrut */}
                    {data?.kashrut && data.kashrut.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {t("Kashrut")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.kashrut.map((k, i) => (
                            <span
                              key={i}
                              className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {data?.tag && data.tag.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {t("Tags")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.tag.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      {data?.isVatFree && (
                        <Badge type="warning" className="text-sm px-4 py-2">
                          {t("VatFree")}
                        </Badge>
                      )}
                      {data?.isWarehouseProduct && (
                        <Badge type="neutral" className="text-sm px-4 py-2">
                          {t("WarehouseProductOnly")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
