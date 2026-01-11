// src/pages/Customers.jsx
import {
  Card,
  Button,
  CardBody,
  Input,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

// Internal import
import UploadManyTwo from "@/components/common/UploadManyTwo";
import CustomerTable from "@/components/customer/CustomerTable";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import CustomerServices from "@/services/CustomerServices";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import CustomPagination from "@/components/table/CustomPagination";

const Customers = () => {
  const { data, loading, error } = useAsync(CustomerServices.getAllCustomers);
  const navigate = useNavigate();
  const { title, serviceId, handleModalOpen } = useToggleDrawer();

  // console.log('customer',data)

  const {
    userRef,
    dataTable,
    serviceData,
    filename,
    isDisabled,
    setSearchUser,
    totalResults,
    resultsPerPage,
    handleSubmitUser,
    handleSelectFile,
    handleChangePage,
    handleUploadMultiple,
    handleRemoveSelectFile,
    currentPage,
  } = useFilter(data);

  const { t } = useTranslation();
  const handleResetField = () => {
    setSearchUser("");
    userRef.current.value = "";
  };

  const handleAddCustomer = () => {
    navigate("/customer/add");
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <DeleteModal id={serviceId} title={title} />
      <PageTitle>{t("CustomersPage")}</PageTitle>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form
            onSubmit={handleSubmitUser}
            className="flex flex-wrap justify-between items-center"
          >
            <UploadManyTwo
              title="Customers"
              exportData={data}
              filename={filename}
              isDisabled={isDisabled}
              handleSelectFile={handleSelectFile}
              handleUploadMultiple={handleUploadMultiple}
              handleRemoveSelectFile={handleRemoveSelectFile}
            />
            <Button
              onClick={handleAddCustomer}
              className="h-12"
            >
              <span className="me-1.5">
                <FiPlus />
              </span>
              {t("AddCustomer")}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form
            onSubmit={handleSubmitUser}
            className="py-3 grid gap-4 lg:gap-6 xl:gap-6 md:flex xl:flex"
          >
            <div className="grow-0 md:grow lg:grow xl:grow">
              <Input
                ref={userRef}
                type="search"
                name="search"
                placeholder={t("CustomersPageSearchPlaceholder")}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 mt-5 mr-1"
              ></button>
            </div>
            <div className="flex items-center gap-2 grow-0 md:grow lg:grow xl:grow">
              <div className="w-full mx-1">
                <Button type="submit" className="h-12 w-full bg-customGreen-dark">
                  {t("Filter")}
                </Button>
              </div>

              <div className="w-full mx-1">
                <Button
                  layout="outline"
                  onClick={handleResetField}
                  type="reset"
                  className="px-4 md:py-1 py-2 h-12 text-sm dark:bg-gray-700"
                >
                  <span className="text-black dark:text-gray-200">{t("Reset")}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        // <Loading loading={loading} />
        <TableLoading row={12} col={7} width={163} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell className="text-center">{t("CustomersId")}</TableCell>
                <TableCell className="text-center">{t("CustomersJoiningDate")}</TableCell>
                <TableCell className="text-center">{t("CustomersName")}</TableCell>
                <TableCell className="text-center">{t("CustomersEmail")}</TableCell>
                <TableCell className="text-center">{t("CustomersPhone")}</TableCell>
                <TableCell className="text-center">{t("CashierStatus")}</TableCell>
                <TableCell className="text-center">
                  {t("CustomersActions")}
                </TableCell>
              </tr>
            </TableHeader>
            <CustomerTable customers={dataTable} handleModalOpen={handleModalOpen} />
          </Table>
          <TableFooter>
            <CustomPagination
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
              onChange={handleChangePage}
              label={t("Table navigation")}
              currentPage={currentPage}
              loading={loading}
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title={t("NoCustomers")} />
      )}
    </div>
  );
};

export default Customers;
