// src/components/drawer/ProductDrawer.jsx
import ReactTagInput from "@pathofdev/react-tag-input";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
} from "@windmill/react-ui";
import React from "react";
import { useTranslation } from "react-i18next";
import { FiPlus, FiTrash2 } from "react-icons/fi";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import useProductSubmit from "@/hooks/useProductSubmit";
import SwitchToggle from "../form/switch/SwitchToggle";
import Uploader from "@/components/image-uploader/Uploader";
import ParentCategory from "@/components/category/ParentCategory";

const ProductDrawer = ({ id, pendingBarcode, onBarcodeUsed }) => {
  const { t } = useTranslation();

  const {
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
    handleAddStock,
    handleRemoveStock,
    handleStockChange,
    prices,
    handlePriceChange,
    priceLists,
  } = useProductSubmit(id, pendingBarcode, onBarcodeUsed);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
        {id ? (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("UpdateProduct")}
            description={t("UpdateProductDescription")}
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("DrawerAddProduct")}
            description={t("AddProductDescription")}
          />
        )}
      </div>

      <Card className="flex flex-col grow w-full max-h-full border-0 overflow-hidden dark:bg-gray-800">
        <div className="flex flex-col h-full overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="px-6 pt-2 grow scrollbar-hide w-full overflow-y-auto grid grid-cols-12 gap-5">

              {/* שם המוצר */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("ProductTitleName")} />
                <div className="col-span-6">
                  <Input
                    {...register(`title`, {
                      required: "כותרת היא שדה חובה!",
                    })}
                    name="title"
                    type="text"
                    placeholder={t("ProductTitleName")}
                    onBlur={(e) => handleProductSlugIfEmpty(e.target.value)}
                  />
                  <Error errorName={errors.title} />
                </div>
              </div>

              {/* ברקוד */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("ProductBarcode")} />
                <div className="col-span-6">
                  <InputArea
                    register={register}
                    required="false"
                    label={t("ProductBarcode")}
                    name="barcode"
                    type="text"
                    placeholder={t("ProductBarcode")}
                  />
                  <Error errorName={errors.barcode} />
                </div>
              </div>

              {/* תיאור המוצר */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("ProductDescription")} />
                <div className="col-span-6">
                  <Textarea
                    className="text-sm block w-full"
                    {...register("description", {
                      required: false,
                    })}
                    name="description"
                    placeholder={t("ProductDescription")}
                    rows="4"
                    spellCheck="false"
                  />
                  <Error errorName={errors.description} />
                </div>
              </div>

              {/* תמונה של המוצר */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("ProductImage")} />
                <div className="col-span-6">
                  <Uploader
                    multiple
                    folder="products"
                    imageUrl={imageUrl}
                    setImageUrl={setImageUrl}
                  />
                </div>
              </div>

              {/* קוד קישור מוצר (Slug) */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12" title={t("whatIsSlug")}>
                <LabelArea label={t("ProductSlug")} />
                <div className="col-span-6">
                  <Input
                    {...register(`slug`, {
                      required: "Slug הוא שדה חובה!",
                    })}
                    className="me-2"
                    name="slug"
                    type="text"
                    defaultValue={slug}
                    placeholder={t("ProductSlug")}
                    onChange={(e) => handleProductSlug(e.target.value)}
                  />
                  <Error errorName={errors.slug} />
                </div>
              </div>

              {/* ספק */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Supplier")} />
                <div className="col-span-6">
                  <Input
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    type="text"
                    placeholder={t("Supplier")}
                  />
                </div>
              </div>

              {/* כשרויות */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Kashrut")} />
                <div className="col-span-12">
                  <ReactTagInput
                    placeholder={t("AddKashrutTag")}
                    tags={kashrut}
                    onChange={(newTags) => setKashrut(newTags)}
                  />
                </div>
              </div>

              {/* קטגוריות */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Category")} />
                <div className="col-span-6">
                  <ParentCategory
                    lang={language}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                </div>
              </div>

              {/* מחירים לפי מחירונים */}
              <div className="col-span-12">
                <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t("ProductPrices")}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {priceLists && priceLists.map((priceList, index) => {
                    const currentPrice = prices.find(p => p.priceList === priceList._id) || {
                      price: 0,
                      salePrice: null,
                      warehousePrice: null,
                      purchaseLimit: null
                    };

                    return (
                      <div key={priceList._id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">{priceList.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <LabelArea label={t("Price")} />
                            <Input
                              type="number"
                              step="0.01"
                              value={currentPrice.price || ''}
                              onChange={(e) => handlePriceChange(priceList._id, 'price', e.target.value)}
                              placeholder={t("Price")}
                            />
                          </div>
                          <div>
                            <LabelArea label={t("SalePrice")} />
                            <Input
                              type="number"
                              step="0.01"
                              value={currentPrice.salePrice || ''}
                              onChange={(e) => handlePriceChange(priceList._id, 'salePrice', e.target.value)}
                              placeholder={t("SalePrice")}
                            />
                          </div>
                          <div>
                            <LabelArea label={t("WarehousePrice")} />
                            <Input
                              type="number"
                              step="0.01"
                              value={currentPrice.warehousePrice || ''}
                              onChange={(e) => handlePriceChange(priceList._id, 'warehousePrice', e.target.value)}
                              placeholder={t("WarehousePrice")}
                            />
                          </div>
                          <div>
                            <LabelArea label={t("PurchaseLimit")} />
                            <Input
                              type="number"
                              value={currentPrice.purchaseLimit || ''}
                              onChange={(e) => handlePriceChange(priceList._id, 'purchaseLimit', e.target.value)}
                              placeholder={t("PurchaseLimit")}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ניהול מלאי */}
              <div className="col-span-12 flex items-center gap-3 mt-4">
                <LabelArea label={t("ManageStock")} />
                <SwitchToggle
                  id="manageStock"
                  handleProcess={(checked) => setManageStock(checked)}
                  processOption={manageStock}
                />
              </div>

              {/* מלאיים */}
              {manageStock && (
                <div className="col-span-12">
                  <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t("StockManagement")}</h3>
                    <Button
                      type="button"
                      size="small"
                      onClick={handleAddStock}
                      className="h-8"
                    >
                      <FiPlus className="mr-1" />
                      {t("AddStock")}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {stocks.map((stock, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">{t("Stock")} #{index + 1}</h4>
                          {stocks.length > 1 && (
                            <Button
                              type="button"
                              size="small"
                              layout="outline"
                              onClick={() => handleRemoveStock(index)}
                              className="h-8 text-red-600 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-800 dark:hover:text-white"
                            >
                              <FiTrash2 />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <LabelArea label={t("CurrentQuantity")} />
                            <Input
                              type="number"
                              value={stock.currentQuantity || ''}
                              onChange={(e) => handleStockChange(index, 'currentQuantity', e.target.value)}
                              placeholder={t("CurrentQuantity")}
                            />
                          </div>
                          <div>
                            <LabelArea label={t("InitialQuantity")} />
                            <Input
                              type="number"
                              value={stock.initialQuantity || ''}
                              onChange={(e) => handleStockChange(index, 'initialQuantity', e.target.value)}
                              placeholder={t("InitialQuantity")}
                            />
                          </div>
                          <div>
                            <LabelArea label={t("AddedDate")} />
                            <Input
                              type="date"
                              value={stock.addedDate || ''}
                              onChange={(e) => handleStockChange(index, 'addedDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <LabelArea label={t("ExpiryDate")} />
                            <Input
                              type="date"
                              value={stock.expiryDate || ''}
                              onChange={(e) => handleStockChange(index, 'expiryDate', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* מינימום מלאי להתראה */}
              {manageStock && (
                <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                  <LabelArea label={t("MinStockThreshold")} />
                  <div className="col-span-6">
                    <InputArea
                      register={register}
                      required={false}
                      label={t("MinStockThreshold")}
                      name="minStockThreshold"
                      type="number"
                      placeholder={t("MinStockThreshold")}
                    />
                  </div>
                </div>
              )}

              {/* תגיות מוצר */}
              <div className="flex flex-col gap-1 md:col-span-12 col-span-12">
                <LabelArea label={t("ProductTag")} />
                <div className="col-span-12">
                  <ReactTagInput
                    placeholder={t("ProductTagPlaseholder")}
                    tags={tag}
                    onChange={(newTags) => setTag(newTags)}
                  />
                </div>
              </div>

              {/* מתגים */}
              <div className="flex items-center justify-evenly md:col-span-12 col-span-12 gap-6">
                <div className="flex flex-col gap-1">
                  <LabelArea label={t("isVatFree")} />
                  <div className="col-span-6">
                    <SwitchToggle
                      id="isVatFree"
                      handleProcess={(checked) => setIsVatFree(checked)}
                      processOption={isVatFree}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1" title={t("isWarehouseProductDesc")}>
                  <LabelArea label={t("isWarehouseProduct")} />
                  <div className="col-span-6">
                    <SwitchToggle
                      id="isWarehouseProduct"
                      handleProcess={(checked) => setIsWarehouseProduct(checked)}
                      processOption={isWarehouseProduct}
                    />
                  </div>
                </div>
              </div>

            </div>
            <DrawerButton id={id} title={t("Product")} isSubmitting={isSubmitting} />
          </form>
        </div>
      </Card>
    </>
  );
};

export default React.memo(ProductDrawer);
