// src/components/drawer/AttributeDrawer.jsx
import { Select, Card, CardBody } from "@windmill/react-ui";
import React from "react";
import { useTranslation } from "react-i18next";
import { MdLabel, MdSettings, MdList } from "react-icons/md";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import LabelArea from "@/components/form/selectOption/LabelArea";
import InputArea from "@/components/form/input/InputArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import TagInputTwo from "@/components/common/TagInputTwo";
import useAttributeSubmit from "@/hooks/useAttributeSubmit";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const AttributeDrawer = ({ id }) => {
  const {
    handleSubmit,
    onSubmit,
    register,
    errors,
    variants,
    addVariant,
    isSubmitting,
    removeVariant,
    handleSelectLanguage,
  } = useAttributeSubmit(id);

  const { t } = useTranslation();

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("UpdateAttribute")}
            description={t("UpdateAttributeDesc")}
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("AddAttribute")}
            description={t("AddAttributeDesc")}
          />
        )}
      </div>

      <Card className="flex flex-col grow w-full max-h-full border-none! overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="px-6 pt-2 grow scrollbar-hide w-full overflow-y-auto grid grid-cols-12 gap-5">
              {/* פרטים בסיסיים */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Basic Details")}
                  icon={<MdLabel size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* כותרת תכונה */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("DrawerAttributeTitle")} />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Attribute Title"
                          name="title"
                          type="text"
                          placeholder="Color or Size or Dimension or Material or Fabric"
                        />
                        <Error errorName={errors.title} />
                      </div>
                    </div>

                    {/* שם תצוגה */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("DisplayName")} />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Display Name"
                          name="name"
                          type="text"
                          placeholder="Display Name"
                        />
                        <Error errorName={errors.name} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              {/* אפשרויות */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Options")}
                  icon={<MdSettings size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* סוג אפשרות */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("DrawerOptions")} />
                      <div className="col-span-6">
                        <Select
                          name="option"
                          {...register(`option`, {
                            required: `Option is required!`,
                          })}
                        >
                          <option value="" defaultValue hidden>
                            {t("DrawerSelecttype")}
                          </option>
                          <option value="Dropdown">{t("Dropdown")}</option>
                          <option value="Radio">{t("Radio")}</option>
                        </Select>
                        <Error errorName={errors.option} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              {/* וריאנטים */}
              {!id && (
                <div className="col-span-12">
                  <CollapsibleSection
                    title={t("Variants")}
                    icon={<MdList size={20} className="mt-1" />}
                    defaultOpen
                  >
                    <div className="grid grid-cols-12 gap-5 mt-2">
                      <div className="flex flex-col gap-1 col-span-12">
                        <LabelArea label={t("Variants")} />
                        <div className="col-span-12">
                          <TagInputTwo
                            notes={variants}
                            addNote={addVariant}
                            removeNote={removeVariant}
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              )}
            </div>

            <DrawerButton id={id} title="Attribute" isSubmitting={isSubmitting} />
          </form>
        </div>
      </Card>
    </>
  );
};

export default AttributeDrawer;