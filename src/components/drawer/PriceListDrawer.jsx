// src/components/drawer/PriceListDrawer.jsx
import React, { useState } from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { MdListAlt } from "react-icons/md";
import { FiUpload, FiDownload } from "react-icons/fi";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import usePriceListSubmit from "@/hooks/usePriceListSubmit";
import usePriceListImport from "@/hooks/usePriceListImport";
import LabelArea from "../form/selectOption/LabelArea";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import ImportResultsModal from "@/components/modal/ImportResultsModal";
import PriceListServices from "@/services/PriceListServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const PriceListDrawer = ({ id }) => {
    const { t } = useTranslation();
    const [exportingList, setExportingList] = useState(false);

    const {
        fileInputRef,
        importResults,
        isImportModalOpen,
        importStage,
        preparedRows,
        handleSelectFile,
        handleUpload,
        handleCloseImportModal,
        clearPreparedRows,
    } = usePriceListImport(id);

    const {
        register,
        onSubmit,
        errors,
        handleSubmit,
        isSubmitting,
        getValues,
    } = usePriceListSubmit(id, preparedRows, clearPreparedRows);

    const handleDownloadPriceListExcel = async () => {
        if (!id) return;
        try {
            setExportingList(true);
            const name = (getValues("name") || "").trim() || `price-list-${id}`;
            await PriceListServices.downloadPriceListExcel(id, name);
            notifySuccess(t("PriceListExportSuccess"));
        } catch (err) {
            notifyError(err?.message || err?.response?.data?.message || t("PriceListExportFailed"));
        } finally {
            setExportingList(false);
        }
    };

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdatePriceList")}
                        description={t("UpdatePriceListDescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("DrawerAddPriceList")}
                        description={t("AddPriceListDescription")}
                    />
                )}
            </div>

            <Card className="flex flex-col grow w-full max-h-full border-none! overflow-hidden">
                <div className="flex flex-col h-full overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
                        <div className="px-6 pt-2 grow scrollbar-hide w-full overflow-y-auto grid grid-cols-12 gap-5">
                            {/* פרטי רשימת מחירים */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("Price List Details")}
                                    icon={<MdListAlt size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* שם רשימת מחירים */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("PriceListName")} />
                                            <div className="col-span-12">
                                                <InputArea
                                                    register={register}
                                                    required={true}
                                                    label={t("PriceListName")}
                                                    name="name"
                                                    type="text"
                                                    placeholder={t("PriceListNamePlaceholder")}
                                                />
                                                <Error errorName={errors.name} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("ImportPricesByFile")} />
                                            <div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".xlsx,.xls"
                                                    onChange={handleSelectFile}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={!id}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <FiUpload />
                                                    {t("UploadExcelFile")}
                                                </button>
                                                {!id && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {t("UpdatePriceListFirst")}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {t("PriceListImportColumnsHint")}
                                                </p>
                                                {id && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {t("PriceListImportStaleRemovedHint")}
                                                    </p>
                                                )}
                                                {id && (
                                                    <button
                                                        type="button"
                                                        disabled={exportingList}
                                                        onClick={handleDownloadPriceListExcel}
                                                        className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-md border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                                                    >
                                                        <FiDownload />
                                                        {exportingList ? t("PriceListExporting") : t("DownloadPriceListExcel")}
                                                    </button>
                                                )}
                                                {preparedRows.length > 0 && (
                                                    <p className="text-xs text-green-600 mt-2">
                                                        {t("PriceListImportPendingSave", { count: preparedRows.length })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        <DrawerButton id={id} title={t("PriceListTitle")} isSubmitting={isSubmitting} />
                    </form>
                </div>
            </Card>
            <ImportResultsModal
                isOpen={isImportModalOpen}
                onClose={handleCloseImportModal}
                results={importResults}
                isLoading={importStage === "uploading" || importStage === "processing"}
                stage={importStage}
                onUpload={handleUpload}
            />
        </>
    );
};

export default React.memo(PriceListDrawer);
