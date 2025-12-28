// src/components/drawer/CustomerDrawer.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { BiSolidUserDetail } from "react-icons/bi";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import useCustomerSubmit from "@/hooks/useCustomerSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const CustomerDrawer = ({ id }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
  } = useCustomerSubmit(id);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            title={"Update Customer"}
            description={"Update your Customer necessary information from here"}
          />
        ) : (
          <Title
            title={"Add Customer"}
            description={"Add your Customer necessary information from here"}
          />
        )}
      </div>

      <Card className="overflow-y-auto grow w-full max-h-full border-none!">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 pt-2 grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">
              {/* פרטים בסיסיים */}
              <div className="col-span-12">
                <CollapsibleSection
                  title="Basic Details"
                  icon={<BiSolidUserDetail size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* שם */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={"Name"} />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Name"
                          name="name"
                          type="text"
                          placeholder={"Name"}
                        />
                        <Error errorName={errors.name} />
                      </div>
                    </div>

                    {/* שם משפחה */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={"Last Name"} />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Last Name"
                          name="lastName"
                          type="text"
                          placeholder={"Last Name"}
                        />
                        <Error errorName={errors.lastName} />
                      </div>
                    </div>

                    {/* אימייל */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={"Email"} />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Email"
                          name="email"
                          type="email"
                          placeholder={"Email"}
                        />
                        <Error errorName={errors.email} />
                      </div>
                    </div>

                    {/* טלפון */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={"Phone"} />
                      <div className="col-span-6">
                        <InputArea
                          required
                          register={register}
                          label="Phone"
                          name="phone"
                          type="text"
                          placeholder={"Phone"}
                        />
                        <Error errorName={errors.phone} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            <DrawerButton id={id} title="Customer" isSubmitting={isSubmitting} />
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default CustomerDrawer;