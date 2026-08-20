// src/components/drawer/ProductDrawer.jsx
import ReactTagInput from "@pathofdev/react-tag-input";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Select,
} from "@windmill/react-ui";
import React from "react";
import { useTranslation } from "react-i18next";
import { MdArticle, MdSettings, MdCurrencyExchange, MdInventory } from "react-icons/md";

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
import CollapsibleSection from "@/components/common/CollapsibleSection";
import { localizedText } from "@/utils/localized";

const ProductDrawer = ({ id, pendingBarcode, onBarcodeUsed }) => {
  const { t } = useTranslation();

  const {
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
    handlePriceChange,
    priceLists,
    requiresAdminReview,
  } = useProductSubmit(id, pendingBarcode, onBarcodeUsed);

  const slug = watch("slug");
  const toInputValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === "undefined" || trimmed === "null" || trimmed === "nan") return "";
    }
    return value;
  };

  const defaultPriceList =
    priceLists?.find((pl) => pl.isDefault === true) ?? priceLists?.[0];
  const otherPriceLists =
    priceLists?.filter(
      (pl) =>
        defaultPriceList && String(pl._id) !== String(defaultPriceList._id)
    ) ?? [];

  const renderPriceListCard = (priceList) => {
    if (!priceList?._id) return null;
    const currentPrice =
      prices.find((p) => String(p.priceList) === String(priceList._id)) || {
        price: null,
        salePrice: null,
        warehousePrice: null,
        purchaseLimit: null,
      };
    return (
      <div
        key={priceList._id}
        className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
      >
        <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">{localizedText(priceList.name)}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <LabelArea label={t("Price")} />
            <Input
              type="number"
              step="0.01"
              value={toInputValue(currentPrice.price)}
              onChange={(e) => handlePriceChange(priceList._id, "price", e.target.value)}
              placeholder={t("Price")}
            />
          </div>
          <div>
            <LabelArea label={t("SalePrice")} />
            <Input
              type="number"
              step="0.01"
              value={toInputValue(currentPrice.salePrice)}
              onChange={(e) => handlePriceChange(priceList._id, "salePrice", e.target.value)}
              placeholder={t("SalePrice")}
            />
          </div>
          <div>
            <LabelArea label={t("WarehousePrice")} />
            <Input
              type="number"
              step="0.01"
              value={toInputValue(currentPrice.warehousePrice)}
              onChange={(e) => handlePriceChange(priceList._id, "warehousePrice", e.target.value)}
              placeholder={t("WarehousePrice")}
            />
          </div>
          <div>
            <LabelArea label={t("PurchaseLimit")} />
            <Input
              type="number"
              value={toInputValue(currentPrice.purchaseLimit)}
              onChange={(e) => handlePriceChange(priceList._id, "purchaseLimit", e.target.value)}
              placeholder={t("PurchaseLimit")}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full relative shrink-0 p-6 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
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

      <Card className="flex min-h-0 flex-1 flex-col w-full border-0 overflow-hidden dark:bg-gray-800">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-2 pb-28 sm:pb-32 w-full grid grid-cols-12 gap-5 items-start content-start">

              {/* אזהרה: מוצר שנוצר אוטומטית מסנכרון ריווחית ועדיין דורש השלמת פרטים */}
              {requiresAdminReview && (
                <div className="col-span-12">
                  <div
                    role="alert"
                    className="border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 rounded-md px-4 py-3 flex items-start gap-3"
                  >
                    <span className="text-red-600 dark:text-red-400 text-xl leading-none">⚠️</span>
                    <div className="flex-1">
                      <div className="font-semibold text-red-700 dark:text-red-300 mb-1">
                        מוצר זה נוצר אוטומטית מסנכרון ריווחית — נדרשת השלמה
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300">
                        אנא השלימו <strong>קטגוריה</strong> ו<strong>תמונה</strong>, ולאחר מכן לחצו על "סמן כנבדק" כדי להסיר את האזהרה. עד אז המוצר מוצג באתר במצב חלקי.
                      </div>
                      <button
                        type="button"
                        onClick={() => setValue("requiresAdminReview", false, { shouldDirty: true })}
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                      >
                        ✓ סמן כנבדק (יישמר בשמירה הבאה)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* פרטים בסיסיים */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Basic Details")}
                  icon={<MdArticle size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
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

                    {/* מספר פריט (פנימי לאדמין בלבד) */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("ProductItemNumber")} />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          required="false"
                          label={t("ProductItemNumber")}
                          name="itemNumber"
                          type="text"
                          placeholder={t("ProductItemNumber")}
                        />
                        <Error errorName={errors.itemNumber} />
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
                          {...register("supplier")}
                          type="text"
                          placeholder={t("Supplier")}
                        />
                      </div>
                    </div>

                    {/* קוד מיון */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("SortCode")} />
                      <div className="col-span-6">
                        <Input
                          {...register("sortCode")}
                          type="text"
                          placeholder={t("SortCode")}
                        />
                      </div>
                    </div>

                    {/* משקל */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-6">
                      <LabelArea label={t("Weight")} />
                      <div className="col-span-6">
                        <Input
                          {...register("weight", { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          placeholder={t("Weight")}
                        />
                      </div>
                    </div>

                    {/* יחידת משקל */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-6">
                      <LabelArea label={t("WeightUnit")} />
                      <div className="col-span-6">
                        <Select
                          {...register("weightUnit")}
                          name="weightUnit"
                        >
                          <option value="" defaultValue hidden>
                            {t("SelectWeightUnit")}
                          </option>
                          <option value="גרם">גרם</option>
                          <option value="קילו">קילו</option>
                          <option value="ליטר">ליטר</option>
                          <option value="מ״ל">מ״ל</option>
                          <option value="יחידה">יחידה</option>
                          <option value="מ״ק">מ״ק</option>
                          <option value="ק״ג">ק״ג</option>
                          <option value="מ״ג">מ״ג</option>
                        </Select>
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

                    {/* מחירון ברירת מחדל — ישר מתחת לקטגוריות */}
                    {defaultPriceList ? (
                      <div className="flex flex-col gap-2 md:col-span-12 col-span-12">
                        <LabelArea label={t("DefaultPriceListSection")} />
                        {renderPriceListCard(defaultPriceList)}
                      </div>
                    ) : null}
                  </div>
                </CollapsibleSection>
              </div>

              {/* ניהול מלאי */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("StockManagement")}
                  icon={<MdInventory size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* ניהול מלאי */}
                    <div className="col-span-12 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="manageStock"
                        checked={manageStock || false}
                        onChange={(e) => setValue("manageStock", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <LabelArea label={t("ManageStock")} />
                    </div>

                    {/* מלאי */}
                    {manageStock && (
                      <>
                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                          <LabelArea label={t("Stock")} />
                          <div className="col-span-6">
                            <Input
                              {...register("stock", { valueAsNumber: true })}
                              type="number"
                              placeholder={t("Stock")}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                          <LabelArea label={t("ExpiryDate")} />
                          <div className="col-span-6">
                            <Input
                              {...register("expiryDate")}
                              type="date"
                            />
                          </div>
                        </div>

                        {/* מינימום מלאי להתראה */}
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
                      </>
                    )}

                    {lastStockUpdate && (
                      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                        <LabelArea label={t("LastStockUpdate")} />
                        <div className="col-span-6">
                          <Input
                            type="text"
                            value={new Date(lastStockUpdate).toLocaleString('he-IL', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            disabled
                            className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              </div>

              {/* הגדרות */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Settings")}
                  icon={<MdSettings size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* תגיות מוצר */}
                    <div className="flex flex-col gap-1 col-span-12">
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
                    <div className="flex flex-wrap items-center justify-evenly col-span-12 gap-6">
                      <div className="flex flex-col gap-1">
                        <LabelArea label={t("isVatFree")} />
                        <div className="col-span-6">
                          <SwitchToggle
                            id="isVatFree"
                            handleProcess={(checked) => setValue("isVatFree", checked)}
                            processOption={isVatFree}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1" title={t("isWarehouseProductDesc")}>
                        <LabelArea label={t("isWarehouseProduct")} />
                        <div className="col-span-6">
                          <SwitchToggle
                            id="isWarehouseProduct"
                            handleProcess={(checked) => setValue("isWarehouseProduct", checked)}
                            processOption={isWarehouseProduct}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1" title={t("isComplementaryProductDesc")}>
                        <LabelArea label={t("isComplementaryProduct")} />
                        <div className="col-span-6">
                          <SwitchToggle
                            id="isComplementaryProduct"
                            handleProcess={(checked) => setValue("isComplementaryProduct", checked)}
                            processOption={isComplementaryProduct}
                          />
                        </div>
                      </div>
                    </div>

                    {/* הערות לניהול */}
                    <div className="flex flex-col gap-1 col-span-12">
                      <LabelArea label={t("ManagementNotes")} />
                      <div className="col-span-12">
                        <Textarea
                          className="text-sm block w-full"
                          {...register("managementNotes", {
                            required: false,
                          })}
                          name="managementNotes"
                          placeholder={t("ManagementNotes")}
                          rows="4"
                          spellCheck="false"
                        />
                        <Error errorName={errors.managementNotes} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              {/* מחירונים נוספים (כל מה שלא ברירת המחדל) */}
              {otherPriceLists.length > 0 ? (
                <div className="col-span-12">
                  <CollapsibleSection
                    title={t("AdditionalPriceLists")}
                    icon={<MdCurrencyExchange size={20} className="mt-1" />}
                    defaultOpen={false}
                  >
                    <div className="grid grid-cols-1 gap-4 mt-2">
                      {otherPriceLists.map((priceList) => renderPriceListCard(priceList))}
                    </div>
                  </CollapsibleSection>
                </div>
              ) : null}

            </div>
            <DrawerButton id={id} title={t("Product")} isSubmitting={isSubmitting} />
          </form>
        </div>
      </Card>
    </>
  );
};

export default React.memo(ProductDrawer);
