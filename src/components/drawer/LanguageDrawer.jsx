// src/components/drawer/LanguageDrawer.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import ReactFlagsSelect from "react-flags-select";
import { useTranslation } from "react-i18next";
import { HiLanguage } from "react-icons/hi";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SelectISOCode from "@/components/form/selectOption/SelectISOCode";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import useLanguageSubmit from "@/hooks/useLanguageSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const LanguageDrawer = ({ id }) => {
  const {
    onSubmit,
    register,
    errors,
    handleSubmit,
    flagAndName,
    setFlagAndName,
    isSubmitting,
    languagePublished,
    setLanguagePublished,
  } = useLanguageSubmit(id);

  const { t } = useTranslation();

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            title={t("UpdateLanguage")}
            description={t("UpdateLanguageText")}
          />
        ) : (
          <Title title={t("AddLanguage")} description={t("AddLanguageText")} />
        )}
      </div>

      <Card className="overflow-y-auto grow w-full max-h-full border-none!">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 pt-2 grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">
              {/* פרטי שפה */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Language Details")}
                  icon={<HiLanguage size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* שם שפה */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("AddLanguageName")} />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Language name"
                          name="name"
                          type="text"
                          placeholder="Language name"
                        />
                        <Error errorName={errors.name} />
                      </div>
                    </div>

                    {/* קוד ISO */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12 relative">
                      <LabelArea label={t("AddLanguagesIsoCode")} />
                      <div className="col-span-6">
                        <SelectISOCode
                          register={register}
                          label="ISO code"
                          name={"iso_code"}
                        />
                        <Error errorName={errors.iso_code} />
                      </div>
                    </div>

                    {/* דגל */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("AddLanguagesFlag")} />
                      <div className="col-span-6">
                        <ReactFlagsSelect
                          selected={flagAndName}
                          onSelect={(code) => setFlagAndName(code)}
                        />
                      </div>
                    </div>

                    {/* מצב פרסום */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("AddLanguagesPublished")} />
                      <div className="col-span-6">
                        <SwitchToggle
                          title={""}
                          handleProcess={setLanguagePublished}
                          processOption={languagePublished}
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            <DrawerButton id={id} title="Language" isSubmitting={isSubmitting} />
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default LanguageDrawer;