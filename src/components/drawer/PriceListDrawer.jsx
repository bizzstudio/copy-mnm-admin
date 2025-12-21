// src/components/drawer/PriceListDrawer.jsx
import React from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { useTranslation } from "react-i18next";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import usePriceListSubmit from "@/hooks/usePriceListSubmit";
import LabelArea from "../form/selectOption/LabelArea";

const PriceListDrawer = ({ id }) => {
    const { t } = useTranslation();

    const {
        register,
        onSubmit,
        errors,
        handleSubmit,
        isSubmitting,
    } = usePriceListSubmit(id);

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

            <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} id="block">
                    <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
                        <div className="grid grid-cols-6 gap-1 mb-6">
                            <LabelArea label={t("PriceListName")} />
                            <div className="col-span-6">
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
                    </div>

                    <DrawerButton id={id} title={t("PriceListTitle")} isSubmitting={isSubmitting} />
                </form>
            </Scrollbars>
        </>
    );
};

export default React.memo(PriceListDrawer);