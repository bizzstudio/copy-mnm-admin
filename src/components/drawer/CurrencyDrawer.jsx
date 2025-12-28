// src/components/drawer/CurrencyDrawer.jsx
import { t } from "i18next";
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { MdCurrencyExchange } from "react-icons/md";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import DrawerButton from "@/components/form/button/DrawerButton";
import useCurrencySubmit from "@/hooks/useCurrencySubmit";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const CurrencyDrawer = ({ id }) => {
  const {
    errors,
    onSubmit,
    register,
    status,
    setStatus,
    isSubmitting,
    handleSubmit,
  } = useCurrencySubmit(id);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            title={t("UpdateCurrency")}
            description={t("UpdateCurrencyText")}
          />
        ) : (
          <Title title={t("AddCurrency")} description={t("AddCurrencyText")} />
        )}
      </div>

      <Card className="flex flex-col grow w-full max-h-full border-none! overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="px-6 pt-2 grow scrollbar-hide w-full overflow-y-auto grid grid-cols-12 gap-5">
              {/* פרטי מטבע */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Currency Details")}
                  icon={<MdCurrencyExchange size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* שם מטבע */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("CurrenciesName")} />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Name"
                          name="name"
                          type="text"
                          placeholder="Name"
                        />
                        <Error errorName={errors.name} />
                      </div>
                    </div>

                    {/* סמל מטבע */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("CurrenciesSymbol")} />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Symbol"
                          name="symbol"
                          type="text"
                          placeholder="Symbol"
                        />
                        <Error errorName={errors.symbol} />
                      </div>
                    </div>

                    {/* מצב פעיל */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("CurrenciesEnabled")} />
                      <div className="col-span-6 text-align-left">
                        <SwitchToggle
                          processOption={status}
                          handleProcess={setStatus}
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            <DrawerButton id={id} title="Currency" isSubmitting={isSubmitting} />
          </form>
        </div>
      </Card>
    </>
  );
};

export default CurrencyDrawer;