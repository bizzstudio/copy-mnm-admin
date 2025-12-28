// src/components/drawer/AttributeChildDrawer.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { MdLabel } from "react-icons/md";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import DrawerButton from "@/components/form/button/DrawerButton";
import useAttributeSubmit from "@/hooks/useAttributeSubmit";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const AttributeChildDrawer = ({ id }) => {
  const {
    handleSubmit,
    onSubmits,
    register,
    errors,
    published,
    isSubmitting,
    setPublished,
    handleSelectLanguage,
  } = useAttributeSubmit(id);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title="Add/Update Attribute Valu"
            description="Add your attribute values and necessary information from here"
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title="Add/Update Attribute Values"
            description="Add your attribute values and necessary information from here"
          />
        )}
      </div>

      <Card className="flex flex-col grow w-full max-h-full border-none! overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="px-6 pt-2 grow scrollbar-hide w-full overflow-y-auto grid grid-cols-12 gap-5">
              {/* פרטי ערך תכונה */}
              <div className="col-span-12">
                <CollapsibleSection
                  title="Attribute Value Details"
                  icon={<MdLabel size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* שם תצוגה */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label="Display Name" />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Display Name"
                          name="name"
                          type="text"
                          placeholder="Color or Size or Dimension or Material or Fabric"
                        />
                        <Error errorName={errors.name} />
                      </div>
                    </div>

                    {/* מצב פרסום */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label="Published" />
                      <div className="col-span-6">
                        <SwitchToggle
                          handleProcess={setPublished}
                          processOption={published}
                        />
                        <Error errorName={errors.published} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            <DrawerButton id={id} title="Attribute" isSubmitting={isSubmitting} />
          </form>
        </div>
      </Card>
    </>
  );
};

export default AttributeChildDrawer;
