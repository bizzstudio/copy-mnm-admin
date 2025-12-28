// src/components/drawer/PriceListDrawer.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { MdListAlt } from "react-icons/md";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import usePriceListSubmit from "@/hooks/usePriceListSubmit";
import LabelArea from "../form/selectOption/LabelArea";
import CollapsibleSection from "@/components/common/CollapsibleSection";

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

            <Card className="overflow-y-auto grow w-full max-h-full border-none!">
                <CardBody>
                    <form onSubmit={handleSubmit(onSubmit)} id="block">
                        <div className="px-6 pt-2 grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">
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
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        <DrawerButton id={id} title={t("PriceListTitle")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default React.memo(PriceListDrawer);