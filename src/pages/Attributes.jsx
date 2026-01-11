import {
  Button,
  Card,
  CardBody,
  Input,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";

// Internal import
import AttributeTable from "@/components/attribute/AttributeTable";
import UploadManyTwo from "@/components/common/UploadManyTwo";
import AttributeDrawer from "@/components/drawer/AttributeDrawer";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import AttributeServices from "@/services/AttributeServices";
import CustomPagination from "@/components/table/CustomPagination";

// Internal import

const Attributes = () => {
  const { toggleDrawer, lang } = useContext(SidebarContext);
  const { data, loading, error } = useAsync(() =>
    AttributeServices.getAllAttributes({
      type: "attribute",
      option: "Dropdown",
      option1: "Radio",
    })
  );

  const { handleDeleteMany, allId, serviceId, title, handleUpdateMany, handleModalOpen } = useToggleDrawer();

  const { t } = useTranslation();

  const {
    filename,
    isDisabled,
    dataTable,
    serviceData,
    totalResults,
    attributeRef,
    resultsPerPage,
    handleSelectFile,
    handleChangePage,
    setAttributeTitle,
    handleSubmitAttribute,
    handleUploadMultiple,
    handleRemoveSelectFile,
    currentPage,
  } = useFilter(data);

  // react hooks
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(data.map((value) => value._id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };
  // handle reset field function
  const handleResetField = () => {
    setAttributeTitle("");
    attributeRef.current.value = "";
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("AttributeTitle")}</PageTitle>
      {isCheck?.length >= 1 && (
        <DeleteModal
          ids={allId}
          setIsCheck={setIsCheck}
          title="Selected Attributes"
        />
      )}
      {isCheck?.length < 1 && (
        <DeleteModal
          id={serviceId}
          title={title}
        />
      )}
      <BulkActionDrawer ids={allId} title="Attributes" />
      <MainDrawer>
        <AttributeDrawer />
      </MainDrawer>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form
            onSubmit={handleSubmitAttribute}
            className="py-3  grid gap-4 lg:gap-6 xl:gap-6  xl:flex"
          >
            <div className="flex justify-start xl:w-1/2  md:w-full">
              <UploadManyTwo
                title="Attribute"
                exportData={data}
                filename={filename}
                isDisabled={isDisabled}
                handleSelectFile={handleSelectFile}
                handleUploadMultiple={handleUploadMultiple}
                handleRemoveSelectFile={handleRemoveSelectFile}
              />
            </div>

            <div className="lg:flex  md:flex xl:justify-end xl:w-1/2  md:w-full md:justify-start grow-0">
              {/* <div className="w-full md:w-40 lg:w-40 xl:w-40 mr-3 mb-3 lg:mb-0">
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
              <div className="w-full md:w-32 lg:w-32 xl:w-32 ml-3 mb-3 lg:mb-0">
                <Button
                  disabled={isCheck.length < 1}
                  onClick={() => handleDeleteMany(isCheck)}
                  className="w-full rounded-md h-12 bg-red-500 btn-red"
                >
                  <span className="ml-2">
                    <FiTrash2 />
                  </span>
                  {t("Delete")}
                </Button>
              </div>
              <div className="w-full md:w-48 lg:w-48 xl:w-48">
                <Button
                  onClick={toggleDrawer}
                  className="w-full rounded-md h-12 "
                >
                  <span className="ml-2">
                    <FiPlus />
                  </span>
                  {t("CouponsAddAttributeBtn")}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
      <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form
            onSubmit={handleSubmitAttribute}
            className="py-3 grid gap-4 lg:gap-6 xl:gap-6 md:flex xl:flex"
          >
            <div className="grow-0 md:grow lg:grow xl:grow">
              <Input
                ref={attributeRef}
                type="search"
                placeholder={t("SearchAttributePlaceholder")}
              />
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
        <TableLoading row={12} col={8} width={163} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    handleClick={handleSelectAll}
                    isChecked={isCheckAll}
                  />
                </TableCell>
                <TableCell> {t("Id")} </TableCell>
                <TableCell> {t("AName")}</TableCell>
                <TableCell> {t("ADisplayName")}</TableCell>
                <TableCell>{t("AOption")}</TableCell>

                <TableCell className="text-center">
                  {t("catPublishedTbl")}
                </TableCell>

                <TableCell className="text-center">{t("Avalues")}</TableCell>

                <TableCell className="text-right">{t("AAction")}</TableCell>
              </tr>
            </TableHeader>

            <AttributeTable
              lang={lang}
              isCheck={isCheck}
              setIsCheck={setIsCheck}
              attributes={dataTable}
              handleModalOpen={handleModalOpen}
            />
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
        <NotFound title={t("SorryAttributes")} />
      )}
    </div>
  );
};

export default Attributes;
