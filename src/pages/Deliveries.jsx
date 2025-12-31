import React from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Pagination,
  Select,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import { useContext, useState, useRef, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { FiEdit, FiTrash2 } from "react-icons/fi";

// Internal import
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import DeliveryServices from "@/services/DeliveryServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import DeliveryDrawer from "@/components/drawer/DeliveryDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import DeliveryTable from "@/components/delivery/DeliveryTable";
import CheckBox from "@/components/form/others/CheckBox";

const Deliveries = () => {
  const {
    searchRef,
    setSearchText,
    handleChangePage,
    handleSubmitForAll,
    resultsPerPage,
    toggleDrawer,
    setSortedField,
  } = useContext(SidebarContext);

  const { title, allId, serviceId, handleDeleteMany, handleUpdateMany, handleModalOpen } = useToggleDrawer();

  const { t } = useTranslation();

  const [loadingExport, setLoadingExport] = useState(false);

  const { data, loading, error } = useAsync(() =>
    DeliveryServices.getAllDeliveries()
  );
  // console.log('data: ', data);

  const {
    dataTable,
    serviceData,
    deliveryRef,
    handleSubmitDelivery,
  } = useFilter(data);

  // react hooks
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(dataTable.map((li) => li._id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };
  // handle reset field
  const handleResetField = () => {
    setSortedField("");
    deliveryRef.current.value = "";
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("Deliveries")}</PageTitle>
      {isCheck?.length < 1 && (
        <DeleteModal
          id={serviceId}
          title={title}
        />
      )}
      {isCheck?.length >= 1 && (
        <DeleteModal
          ids={allId}
          setIsCheck={setIsCheck}
          title={title}
        />
      )}
      <BulkActionDrawer ids={allId} title="Deliveries" />
      <MainDrawer>
        <DeliveryDrawer />
      </MainDrawer>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form
            onSubmit={handleSubmitDelivery}
            className="py-3 md:pb-0 grid gap-4 lg:gap-6 xl:gap-6 xl:flex"
          >
            <div className="grow-0 sm:grow md:grow lg:grow xl:grow">
              <Button
                onClick={toggleDrawer}
                className="w-full rounded-md h-12"
              >
                <span className="ml-2">
                  <FiPlus />
                </span>
                {t("AddDelivery")}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* <div className="grow-0 md:grow lg:grow xl:grow">
                <Button
                  disabled={isCheck.length < 1}
                  onClick={() => handleUpdateMany(isCheck)}
                  className="w-full rounded-md h-12 btn-gray text-gray-600"
                >
                  <span className="ml-2">
                    <FiEdit />
                  </span>
                  {t("BulkAction")}
                </Button>
              </div> */}
              <div className="grow-0 md:grow lg:grow xl:grow">
                <Button
                  disabled={isCheck?.length < 1}
                  onClick={() => handleDeleteMany(isCheck, data.deliveries)}
                  className="w-full rounded-md h-12 bg-red-300 disabled btn-red"
                >
                  <span className="ml-2">
                    <FiTrash2 />
                  </span>
                  {t("Delete")}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* פילטרים וכו' - כרגע בהערה */}
      {/* <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 rounded-t-lg rounded-0 mb-4">
        <CardBody>
          <form
            onSubmit={handleSubmitForAll}
            className="py-3 grid gap-4 lg:gap-6 xl:gap-6 md:flex xl:flex"
          >
            <div className="grow-0 md:grow lg:grow xl:grow">
              <Input
                ref={deliveryRef}
                type="search"
                placeholder={t("SearchDeliveryPlaceholder")}
              />
            </div>
            <div className="flex items-center gap-2 grow-0 md:grow lg:grow xl:grow">
              <div className="w-full mx-1">
                <Button type="submit" className="h-12 w-full bg-customGreen-dark">
                  Filter
                </Button>
              </div>
            </div>

            <div className="grow-0 md:grow lg:grow xl:grow">
              <Select onChange={(e) => setSortedField(e.target.value)}>
                <option value="All" defaultValue hidden>
                  {t("SortBy")}
                </option>
                <option value="date">{t("Date")}</option>
                <option value="status">{t("Status")}</option>
                <option value="customer">{t("Customer")}</option>
              </Select>
            </div>
            <div className="flex items-center gap-2 grow-0 md:grow lg:grow xl:grow">
              <div className="w-full mx-1">
                <Button type="submit" className="h-12 w-full bg-customGreen-dark">
                  Filter
                </Button>
              </div>

              <div className="w-full mx-1">
                <Button
                  layout="outline"
                  onClick={handleResetField}
                  type="reset"
                  className="px-4 md:py-1 py-2 h-12 text-sm dark:bg-gray-700"
                >
                  <span className="text-black dark:text-gray-200">Reset</span>
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card> */}

      {loading ? (
        <TableLoading row={12} col={7} width={160} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8 rounded-b-lg">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    isChecked={isCheckAll}
                    handleClick={handleSelectAll}
                  />
                </TableCell>
                <TableCell className="text-center">{t("City")}</TableCell>
                <TableCell className="text-center">{t("Price")}</TableCell>
                <TableCell className="text-center">{t("Days")}</TableCell>
                <TableCell className="text-center">{t("Actions")}</TableCell>
              </tr>
            </TableHeader>
            <DeliveryTable
              // deliveries={dataTable}
              deliveries={data} // עד שנטפל בפג'יניישן
              isCheck={isCheck}
              setIsCheck={setIsCheck}
              isCheckAll={isCheckAll}
              handleModalOpen={handleModalOpen}
            />
          </Table>

          {/* {dataTable.length >= resultsPerPage && (
            <TableFooter>
                 <Pagination
              className="pagination-ltr"
                totalResults={dataTable.length}
                resultsPerPage={resultsPerPage}
                onChange={handleChangePage}
                label="Table navigation"
              />
            </TableFooter>
          )} */}
        </TableContainer>
      ) : (
        <NotFound title={t("NoDeliveries")} />
      )}
    </div>
  );
};

export default Deliveries;