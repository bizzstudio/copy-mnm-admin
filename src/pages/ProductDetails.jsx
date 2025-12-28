import {
  Badge,
  Table,
  TableCell,
  TableContainer,
  TableHeader,
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

  // חישוב מלאי כולל
  const calculateTotalStock = (stocks) => {
    if (!stocks || stocks.length === 0) return 0;
    return stocks.reduce((sum, stock) => sum + (stock.currentQuantity || 0), 0);
  };

  // מציאת שם מחירון לפי ID
  const getPriceListName = (priceListId) => {
    const priceList = priceLists?.find(pl => pl._id === priceListId);
    return priceList ? priceList.name : t("UnknownPriceList");
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <MainDrawer maxWidth='700px'>
        <ProductDrawer id={id} />
      </MainDrawer>

      <PageTitle>{t("ProductDetails")}</PageTitle>
      {loading ? (
        <Loading loading={loading} />
      ) : (
        <div className="inline-block overflow-y-auto h-full align-middle transition-all transform">
          <div className="flex flex-col lg:flex-row md:flex-row w-full overflow-hidden">
            <div className="shrink-0 flex items-center justify-center h-auto">
              {data?.image && data.image[0] ? (
                <img src={data.image[0]} alt="product" className="h-64 w-64" />
              ) : (
                <img
                  src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                  alt="product"
                />
              )}
            </div>
            <div className="w-full flex flex-col p-5 md:p-8 text-right">
              <div className="mb-5 block">
                <div className="font-serif font-semibold py-1 text-sm">
                  <p className="text-sm text-gray-500">
                    {t("Status")}:{" "}
                    {data.status === "show" ? (
                      <span className="text-emerald-400">
                        {t("ThisProductShowing")}
                      </span>
                    ) : (
                      <span className="text-red-400">
                        {t("ThisProductHidden")}
                      </span>
                    )}
                  </p>
                </div>
                <h2 className="text-heading text-lg md:text-xl lg:text-2xl font-semibold font-serif dark:text-gray-400">
                  {showingTranslateValue(data?.title)}
                </h2>
                <p className="uppercase font-serif font-medium text-gray-500 dark:text-gray-400 text-sm">
                  {t("Barcode")} :{" "}
                  <span className="font-bold text-gray-500 dark:text-gray-500">
                    {data?.barcode || "-"}
                  </span>
                </p>
                {data?.productId && (
                  <p className="uppercase font-serif font-medium text-gray-500 dark:text-gray-400 text-sm">
                    {t("ProductID")} :{" "}
                    <span className="font-bold text-gray-500 dark:text-gray-500">
                      {data.productId}
                    </span>
                  </p>
                )}
              </div>

              {/* מחירים */}
              <div className="font-serif mb-4">
                <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">{t("ProductPrices")}:</h3>
                {data?.prices && data.prices.length > 0 ? (
                  <div className="space-y-2">
                    {data.prices.map((priceItem, index) => (
                      <div key={index} className="border-b pb-2">
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          {getPriceListName(priceItem.priceList)}
                        </p>
                        <div className="flex gap-4 flex-wrap">
                          <span className="text-lg">
                            {t("Price")}: {currency}{getNumberTwo(priceItem.price)}
                          </span>
                          {priceItem.salePrice && (
                            <span className="text-lg text-green-600">
                              {t("SalePrice")}: {currency}{getNumberTwo(priceItem.salePrice)}
                            </span>
                          )}
                          {priceItem.warehousePrice && (
                            <span className="text-lg text-blue-600">
                              {t("WarehousePrice")}: {currency}{getNumberTwo(priceItem.warehousePrice)}
                            </span>
                          )}
                        </div>
                        {priceItem.purchaseLimit && (
                          <p className="text-sm text-gray-500">
                            {t("PurchaseLimit")}: {priceItem.purchaseLimit}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t("NoPricesAvailable")}</p>
                )}
              </div>

              {/* מלאי */}
              <div className="mb-3">
                {data?.manageStock ? (
                  <>
                    {calculateTotalStock(data.stocks) <= 0 ? (
                      <Badge type="danger">
                        <span className="font-bold">{t("StockOut")}</span>
                      </Badge>
                    ) : (
                      <Badge type="success">
                        <span className="font-bold">{t("InStock")}</span>
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ps-2">
                      {t("Quantity")}: {calculateTotalStock(data.stocks)}
                    </span>
                    {data.minStockThreshold && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ps-2">
                        ({t("MinStockThreshold")}: {data.minStockThreshold})
                      </span>
                    )}
                  </>
                ) : (
                  <Badge type="success">
                    <span className="font-bold">{t("UnlimitedStock")}</span>
                  </Badge>
                )}
              </div>

              {/* תיאור */}
              <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 md:leading-7">
                {showingTranslateValue(data?.description)}
              </p>

              {/* פרטים נוספים */}
              <div className="flex flex-col mt-4">
                <p className="font-serif font-semibold py-1 text-gray-500 text-sm">
                  <span className="text-gray-700 dark:text-gray-400">
                    {t("Categories")}:{" "}
                  </span>{" "}
                  {data?.categories?.map(cat => showingTranslateValue(cat?.name)).join(", ") || "-"}
                </p>

                {data?.supplier && (
                  <p className="font-serif font-semibold py-1 text-gray-500 text-sm">
                    <span className="text-gray-700 dark:text-gray-400">
                      {t("Supplier")}:{" "}
                    </span>{" "}
                    {data.supplier}
                  </p>
                )}

                {data?.kashrut && data.kashrut.length > 0 && (
                  <div className="py-1">
                    <span className="text-gray-700 dark:text-gray-400 font-serif font-semibold text-sm">
                      {t("Kashrut")}:{" "}
                    </span>
                    <div className="flex flex-row flex-wrap">
                      {data.kashrut.map((k, i) => (
                        <span
                          key={i}
                          className="bg-green-200 ml-2 border-0 text-gray-700 rounded-full inline-flex items-center justify-center px-2 py-1 text-xs font-semibold font-serif mt-2 dark:bg-green-700 dark:text-gray-300"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data?.tag && data.tag.length > 0 && (
                  <div className="py-1">
                    <span className="text-gray-700 dark:text-gray-400 font-serif font-semibold text-sm">
                      {t("Tags")}:{" "}
                    </span>
                    <div className="flex flex-row flex-wrap">
                      {data.tag.map((t, i) => (
                        <span
                          key={i}
                          className="bg-gray-200 ml-2 border-0 text-gray-500 rounded-full inline-flex items-center justify-center px-2 py-1 text-xs font-semibold font-serif mt-2 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-2">
                  {data?.isVatFree && (
                    <Badge type="warning">{t("VatFree")}</Badge>
                  )}
                  {data?.isWarehouseProduct && (
                    <Badge type="neutral">{t("WarehouseProductOnly")}</Badge>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleUpdate(id)}
                  className="cursor-pointer leading-5 transition-colors duration-150 font-medium text-sm focus:outline-none px-5 py-2 rounded-md text-white bg-customGreen border border-transparent active:bg-customGreen-dark hover:bg-customGreen-dark"
                >
                  {t("EditProduct")}
                </button>
              </div>
            </div>
          </div>

          {/* טבלת מלאיים */}
          {data?.manageStock && data?.stocks && data.stocks.length > 0 && (
            <>
              <PageTitle>{t("StockDetails")}</PageTitle>
              <TableContainer className="mb-8 rounded-b-lg">
                <Table>
                  <TableHeader>
                    <tr>
                      <TableCell>{t("StockNumber")}</TableCell>
                      <TableCell>{t("CurrentQuantity")}</TableCell>
                      <TableCell>{t("InitialQuantity")}</TableCell>
                      <TableCell>{t("AddedDate")}</TableCell>
                      <TableCell>{t("ExpiryDate")}</TableCell>
                    </tr>
                  </TableHeader>
                  <tbody>
                    {data.stocks.map((stock, index) => (
                      <tr key={index}>
                        <TableCell>#{index + 1}</TableCell>
                        <TableCell>{stock.currentQuantity}</TableCell>
                        <TableCell>{stock.initialQuantity}</TableCell>
                        <TableCell>
                          {stock.addedDate ? new Date(stock.addedDate).toLocaleDateString('he-IL') : "-"}
                        </TableCell>
                        <TableCell>
                          {stock.expiryDate ? new Date(stock.expiryDate).toLocaleDateString('he-IL') : "-"}
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
