// src/components/product/ProductFilters.jsx
import React from "react";
import { Select } from "@windmill/react-ui";
import { t } from "i18next";
import { FiFilter } from "react-icons/fi";

// Internal imports
import CollapsibleSection from "@/components/common/CollapsibleSection";
import SelectCategory from "@/components/form/selectOption/SelectCategory";

/**
 * Product Filters Component
 * Uses the existing sortedField convention from the app
 */
const ProductFilters = ({
    sortedField,
    setSortedField,
    category,
    setCategory,
    selectedPriceListId,
    setSelectedPriceListId,
    priceLists,
    lang
}) => {
    return (
        <CollapsibleSection
            title={t("Filters")}
            icon={<FiFilter size={20} className="mt-1" />}
            defaultOpen={false}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                    <SelectCategory
                        setCategory={setCategory}
                        lang={lang}
                    />
                </div>

                {/* Price List Filter */}
                <div>
                    <Select
                        value={selectedPriceListId || ""}
                        onChange={(e) => setSelectedPriceListId(e.target.value)}
                        className="h-12"
                    >
                        <option value="">{t("PriceListTitle")}</option>
                        {priceLists && priceLists.length > 0 ? (
                            priceLists.map((priceList) => (
                                <option key={priceList._id} value={priceList._id}>
                                    {priceList.name}
                                </option>
                            ))
                        ) : null}
                    </Select>
                </div>

                {/* Sort/Filter Options */}
                <div>
                    <Select
                        value={sortedField || ""}
                        onChange={(e) => setSortedField(e.target.value)}
                        className="h-12"
                    >
                        <option value="">{t("AllProducts")}</option>
                        <option value="low">{t("LowtoHigh")}</option>
                        <option value="high">{t("HightoLow")}</option>
                        <option value="published">{t("Published")}</option>
                        <option value="unPublished">{t("Unpublished")}</option>
                        <option value="status-selling">{t("StatusSelling")}</option>
                        <option value="status-out-of-stock">{t("StatusStock")}</option>
                        <option value="date-added-asc">{t("DateAddedAsc")}</option>
                        <option value="date-added-desc">{t("DateAddedDesc")}</option>
                        <option value="date-updated-asc">{t("DateUpdatedAsc")}</option>
                        <option value="date-updated-desc">{t("DateUpdatedDesc")}</option>
                    </Select>
                </div>
            </div>
        </CollapsibleSection>
    );
};

export default ProductFilters;