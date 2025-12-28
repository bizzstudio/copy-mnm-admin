// src/pages/PriceLists.jsx
import {
    Button,
    Card,
    CardBody,
    Input,
    Pagination,
    Table,
    TableCell,
    TableContainer,
    TableFooter,
    TableHeader,
} from "@windmill/react-ui";
import { useContext, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import PriceListServices from "@/services/PriceListServices";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useFilter from "@/hooks/useFilter";
import PageTitle from "@/components/Typography/PageTitle";
import DeleteModal from "@/components/modal/DeleteModal";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import TableLoading from "@/components/preloader/TableLoading";
import CheckBox from "@/components/form/others/CheckBox";
import PriceListTable from "@/components/pricelist/PriceListTable";
import NotFound from "@/components/table/NotFound";
import PriceListDrawer from "@/components/drawer/PriceListDrawer";

const PriceLists = () => {
    const { t } = useTranslation();
    const { toggleDrawer, lang } = useContext(SidebarContext);
    const { data, loading, error } = useAsync(PriceListServices.getAllPriceLists);

    const [isCheckAll, setIsCheckAll] = useState(false);
    const [isCheck, setIsCheck] = useState([]);

    const { allId, serviceId, handleDeleteMany, handleUpdateMany } = useToggleDrawer();

    const {
        dataTable,
        serviceData,
        totalResults,
        resultsPerPage,
        handleChangePage,
        searchRef,
        handleSubmitForAll,
        setSearchText,
    } = useFilter(data);

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll);
        // Only select price lists that are not default
        const nonDefaultIds = data?.filter((li) => !li.isDefault).map((li) => li._id);
        setIsCheck(nonDefaultIds || []);
        if (isCheckAll) {
            setIsCheck([]);
        }
    };

    // Handle reset search field
    const handleResetField = () => {
        setSearchText("");
        if (searchRef.current) {
            searchRef.current.value = "";
        }
    };

    return (
        <>
            <PageTitle>{t("PriceListsPageTitle")}</PageTitle>
            <DeleteModal
                ids={allId}
                setIsCheck={setIsCheck}
                title={t("Selected PriceList")}
            />
            <BulkActionDrawer ids={allId} title="PriceLists" />

            <MainDrawer maxWidth='570px'>
                <PriceListDrawer id={serviceId} />
            </MainDrawer>

            <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
                <CardBody>
                    <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-6">
                        {/* Search Section */}
                        <form
                            onSubmit={handleSubmitForAll}
                            className="flex flex-col sm:flex-row gap-2 grow lg:grow-0 lg:w-auto"
                        >
                            <div className="grow">
                                <Input
                                    ref={searchRef}
                                    type="search"
                                    placeholder={t("SearchPriceList")}
                                    className="h-12"
                                />
                            </div>
                            <div className="flex gap-2 sm:flex-shrink-0">
                                <Button type="submit" className="h-12 px-4 bg-customGreen-dark whitespace-nowrap">
                                    {t("Filter")}
                                </Button>
                                <Button
                                    layout="outline"
                                    onClick={handleResetField}
                                    type="reset"
                                    className="h-12 px-4 text-sm dark:bg-gray-700 whitespace-nowrap"
                                >
                                    <span className="text-black dark:text-gray-200">{t("Reset")}</span>
                                </Button>
                            </div>
                        </form>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
                            <div className="w-full sm:w-auto">
                                <Button
                                    disabled={isCheck.length < 1}
                                    onClick={() => handleDeleteMany(isCheck)}
                                    className="w-full sm:w-auto rounded-md h-12 px-4 bg-red-500 btn-red whitespace-nowrap"
                                >
                                    <span className="ml-2">
                                        <FiTrash2 />
                                    </span>
                                    {t("Delete")}
                                </Button>
                            </div>

                            <div className="w-full sm:w-auto">
                                <Button
                                    onClick={toggleDrawer}
                                    className="w-full sm:w-auto rounded-md h-12 px-4 whitespace-nowrap"
                                >
                                    <span className="ml-2">
                                        <FiPlus />
                                    </span>
                                    {t("AddPriceListBtn")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
            {loading ? (
                <TableLoading row={12} col={8} width={140} height={20} />
            ) : error ? (
                <span className="text-center mx-auto text-red-500">{error}</span>
            ) : serviceData?.length !== 0 ? (
                <TableContainer className="mb-8">
                    <Table>
                        <TableHeader>
                            <tr>
                                <TableCell className="text-center">
                                    <CheckBox
                                        type="checkbox"
                                        name="selectAll"
                                        id="selectAll"
                                        handleClick={handleSelectAll}
                                        isChecked={isCheckAll}
                                    />
                                </TableCell>
                                <TableCell className="text-center">{t("PriceListName")}</TableCell>
                                <TableCell className="text-center">{t("CreatedAt")}</TableCell>
                                <TableCell className="text-center">{t("PriceListActions")}</TableCell>
                            </tr>
                        </TableHeader>
                        <PriceListTable
                            lang={lang}
                            isCheck={isCheck}
                            priceLists={dataTable}
                            setIsCheck={setIsCheck}
                        />
                    </Table>
                    <TableFooter>
                        <Pagination
                            className="pagination-ltr"
                            totalResults={totalResults}
                            resultsPerPage={resultsPerPage}
                            onChange={handleChangePage}
                            label="Table navigation"
                        />
                    </TableFooter>
                </TableContainer>
            ) : (
                <NotFound title={t("SorryPriceLists")} />
            )}
        </>
    );
};

export default PriceLists;