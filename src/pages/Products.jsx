// src/pages/Products.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Table,
  TableHeader,
  TableCell,
  TableFooter,
  TableContainer,
  Button,
  Card,
  CardBody,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiPlus, FiTrash2, FiDownload, FiUpload, FiCamera } from "react-icons/fi";

// Internal import
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useExport from "@/hooks/useExport";
import useImport from "@/hooks/useImport";
import useProductFilter from "@/hooks/useProductFilter";
import NotFound from "@/components/table/NotFound";
import ProductServices from "@/services/ProductServices";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import ProductTable from "@/components/product/ProductTable";
import ProductFilters from "@/components/product/ProductFilters";
import MainDrawer from "@/components/drawer/MainDrawer";
import ProductDrawer from "@/components/drawer/ProductDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import TableLoading from "@/components/preloader/TableLoading";
import BarcodeScannerModal from "@/components/modal/BarcodeScannerModal";
import CustomPagination from "@/components/table/CustomPagination";
import SearchInput from "@/components/form/input/SearchInput";
import DropdownMenu from "@/components/menu/DropdownMenu";
import ImportResultsModal from "@/components/modal/ImportResultsModal";

const Products = () => {
  const {
    title,
    allId,
    serviceId,
    handleDeleteMany,
    handleModalOpen,
    handleUpdate,
    setServiceId,
  } = useToggleDrawer();

  const { t } = useTranslation();
  const {
    toggleDrawer,
    lang,
    currentPage,
    handleChangePage,
    limitData,
    isDrawerOpen,
    priceLists,
  } = useContext(SidebarContext);

  // Filters hook - uses SidebarContext under the hood
  const filters = useProductFilter();

  // Import/Export hooks
  const { exportProductsToExcel, downloadProductImportTemplate } = useExport();
  const {
    handleSelectFile,
    handleUploadMultiple,
    fileInputRef,
    importResults,
    isImportModalOpen,
    importStage,
    handleCloseImportModal,
  } = useImport();

  // State for barcode scanner modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState(null);
  const [selectedPriceListId, setSelectedPriceListId] = useState(null);

  // State for checkbox
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  // Local search state for debounce
  const [localSearchValue, setLocalSearchValue] = useState("");

  // Debounce ref for search
  const searchDebounceRef = useRef(null);

  // Fetch products using useAsync (app convention)
  const { data, loading, error } = useAsync(() =>
    ProductServices.getAllProducts({
      page: currentPage,
      limit: limitData,
      category: filters.category,
      title: filters.searchText,
      price: filters.sortedField,
    })
  );

  // Auto-search with debounce (300ms) when localSearchValue changes
  useEffect(() => {
    // Clear previous timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Set new timeout for debounce
    searchDebounceRef.current = setTimeout(() => {
      filters.setSearchText(localSearchValue || null);
      // Reset to page 1 when search text changes
      handleChangePage(1);
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [localSearchValue]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setLocalSearchValue(e.target.value);
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(data?.products.map((li) => li._id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  // Handle reset filters
  const handleResetField = () => {
    filters.resetFilters();
    setLocalSearchValue("");
    if (filters.searchRef.current) {
      filters.searchRef.current.value = "";
    }
    setSelectedPriceListId(null);
    // Reset to default price list
    if (priceLists && priceLists.length > 0) {
      const defaultPriceList = priceLists.find(pl => pl.isDefault);
      if (defaultPriceList) {
        setSelectedPriceListId(defaultPriceList._id);
      } else {
        setSelectedPriceListId(priceLists[0]._id);
      }
    }
  };

  // Export function
  const handleExportToExcel = async () => {
    await exportProductsToExcel(isCheck);
  };

  // Import function - called from modal when user clicks "Upload to System"
  const handleImportProducts = async () => {
    await handleUploadMultiple();
  };

  // Handle product found from barcode scanner
  const handleProductFound = (product) => {
    const productId = product._id || product.id;
    if (productId) {
      setServiceId(productId);
      toggleDrawer();
    }
  };

  // Handle product not found - open drawer with barcode pre-filled
  const handleProductNotFound = (barcode) => {
    setServiceId(null);
    setPendingBarcode(barcode);
    toggleDrawer();
  };

  // Reset pending barcode when drawer closes
  useEffect(() => {
    if (!isDrawerOpen) {
      setPendingBarcode(null);
    }
  }, [isDrawerOpen]);

  // Initialize selected price list to default price list
  useEffect(() => {
    if (priceLists && priceLists.length > 0 && !selectedPriceListId) {
      const defaultPriceList = priceLists.find(pl => pl.isDefault);
      if (defaultPriceList) {
        setSelectedPriceListId(defaultPriceList._id);
      } else {
        setSelectedPriceListId(priceLists[0]._id);
      }
    }
  }, [priceLists, selectedPriceListId]);

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("ProductsPage")}</PageTitle>

      <DeleteModal ids={allId} setIsCheck={setIsCheck} title={title} />

      {isCheck?.length < 1 && <DeleteModal id={serviceId} title={title} />}

      {isCheck?.length > 1 && (
        <BulkActionDrawer ids={allId} title="Products" />
      )}

      <MainDrawer width='700px'>
        <ProductDrawer
          id={serviceId}
          pendingBarcode={pendingBarcode}
          onBarcodeUsed={() => setPendingBarcode(null)}
        />
      </MainDrawer>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductFound={handleProductFound}
        onProductNotFound={handleProductNotFound}
      />

      <ImportResultsModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        results={importResults}
        isLoading={loading}
        stage={importStage}
        onUpload={handleImportProducts}
        showProductColumnHint
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleSelectFile}
        style={{ display: 'none' }}
      />

      {/* Actions Card */}
      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch py-3">
            <DropdownMenu
              title=""
              addMenu={true}
              options={[
                {
                  label: (
                    <div className="flex items-center gap-1.5">
                      <FiPlus size={20} className="mb-px" />
                      {t("AddProduct")}
                    </div>
                  ),
                  onClick: toggleDrawer
                },
                {
                  label: (
                    <div className="flex items-center gap-1.5">
                      <FiCamera size={17} />
                      {t("ScanProduct")}
                    </div>
                  ),
                  onClick: () => setIsScannerOpen(true)
                },
                {
                  label: (
                    <div className="flex items-center gap-1.5">
                      <FiDownload size={17} />
                      {isCheck.length > 0 ? t("ExportSelected") : t("ExportAll")}
                    </div>
                  ),
                  onClick: handleExportToExcel,
                  disabled: !data?.products || data.products.length === 0
                },
                {
                  label: (
                    <div className="flex items-center gap-1.5">
                      <FiUpload size={17} />
                      {t("ImportFromExcel")}
                    </div>
                  ),
                  onClick: () => {
                    fileInputRef.current?.click();
                  }
                },
                {
                  label: (
                    <div className="flex items-center gap-1.5">
                      <FiDownload size={17} />
                      {t("DownloadImportTemplate")}
                    </div>
                  ),
                  onClick: downloadProductImportTemplate
                },
                {
                  label: (
                    <div className="flex items-center gap-1.5">
                      <FiTrash2 size={17} />
                      {t("Delete")}
                    </div>
                  ),
                  onClick: () => handleDeleteMany(isCheck, data?.products),
                  disabled: isCheck.length < 1
                },
              ]}
            />

            <div className="grow">
              <SearchInput
                ref={filters.searchRef}
                placeholder={t("SearchProduct")}
                value={localSearchValue}
                onChange={handleSearchChange}
                onSubmit={(e) => {
                  e.preventDefault();
                  // Clear debounce and search immediately
                  if (searchDebounceRef.current) {
                    clearTimeout(searchDebounceRef.current);
                  }
                  const value = filters.searchRef.current?.value || localSearchValue;
                  filters.setSearchText(value || null);
                  // Reset to page 1 when submitting search
                  handleChangePage(1);
                }}
                onReset={handleResetField}
                name="search"
                className="w-full"
                showReset={filters.hasActiveFilters()}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Filters Card */}
      <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 rounded-t-lg rounded-0 mb-4">
        <CardBody>
          <ProductFilters
            sortedField={filters.sortedField}
            setSortedField={filters.setSortedField}
            category={filters.category}
            setCategory={filters.setCategory}
            selectedPriceListId={selectedPriceListId}
            setSelectedPriceListId={setSelectedPriceListId}
            priceLists={priceLists}
            lang={lang}
            handleChangePage={handleChangePage}
          />
        </CardBody>
      </Card>

      {/* Products Table */}
      {loading ? (
        <TableLoading row={12} col={10} width={163} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : data?.products?.length !== 0 ? (
        <TableContainer className="mb-8 rounded-b-lg">
          <Table>
            <TableHeader>
              <tr>
                <TableCell className='text-center'>
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    isChecked={isCheckAll}
                    handleClick={handleSelectAll}
                  />
                </TableCell>
                <TableCell className="text-center">
                  {t("PublishedTbl")}
                </TableCell>
                <TableCell className='text-right'>{t("ProductNameTbl")}</TableCell>
                <TableCell className='text-center'>
                  {selectedPriceListId && priceLists?.length > 0
                    ? `${t("PriceTbl")} (${priceLists.find(pl => pl._id === selectedPriceListId)?.name || ""})`
                    : t("PriceTbl")}
                </TableCell>
                <TableCell className='text-center'>{t("offer")}</TableCell>
                <TableCell className='text-center'>{t("CategoryTbl")}</TableCell>
                <TableCell className='text-center'>{t("StockTbl")}</TableCell>
                <TableCell className='text-center'>{t("Barcode")}</TableCell>
                <TableCell className="text-center">{t("DetailsTbl")}</TableCell>
                <TableCell className="text-center">{t("ActionsTbl")}</TableCell>
              </tr>
            </TableHeader>
            <ProductTable
              lang={lang}
              isCheck={isCheck}
              products={data?.products}
              setIsCheck={setIsCheck}
              title={title}
              serviceId={serviceId}
              handleModalOpen={handleModalOpen}
              handleUpdate={handleUpdate}
              selectedPriceListId={selectedPriceListId}
            />
          </Table>
          <TableFooter>
            <CustomPagination
              totalResults={data?.totalDoc}
              resultsPerPage={limitData}
              onChange={handleChangePage}
              label={t("Table navigation")}
              currentPage={currentPage}
              loading={loading}
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title={t("NoProducts")} />
      )}
    </div>
  );
};

export default Products;