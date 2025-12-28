// src/components/drawer/StaffDrawer.jsx
import React from "react";
import { Card, CardBody, Input } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { BiSolidUserDetail } from "react-icons/bi";
import { MdLock, MdWork } from "react-icons/md";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useStaffSubmit from "@/hooks/useStaffSubmit";
import SelectRole from "@/components/form/selectOption/SelectRole";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Uploader from "@/components/image-uploader/Uploader";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const StaffDrawer = ({ id }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    imageUrl,
    setImageUrl,
    isSubmitting,
    selectedDate,
    setSelectedDate,
    handleSelectLanguage,
  } = useStaffSubmit(id);
  const { t } = useTranslation();

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("UpdateStaff")}
            description={t("UpdateStaffdescription")}
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("AddStaffTitle")}
            description={t("AddStaffdescription")}
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
                  title={t("Basic Details")}
                  icon={<BiSolidUserDetail size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* תמונת עובד */}
                    <div className="flex flex-col gap-1 col-span-12">
                      <LabelArea label="Staff Image" />
                      <div className="col-span-12">
                        <Uploader
                          imageUrl={imageUrl}
                          setImageUrl={setImageUrl}
                          folder="admin"
                        />
                      </div>
                    </div>

                    {/* שם */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label="Name" />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Name"
                          name="name"
                          type="text"
                          autoComplete="username"
                          placeholder="Staff name"
                        />
                        <Error errorName={errors.name} />
                      </div>
                    </div>

                    {/* טלפון */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label="Contact Number" />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Contact Number"
                          name="phone"
                          pattern={/^[+]?\d*$/}
                          minLength={6}
                          maxLength={15}
                          type="text"
                          placeholder="Phone number"
                        />
                        <Error errorName={errors.phone} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              {/* פרטי התחברות */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Login Details")}
                  icon={<MdLock size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* אימייל */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label="Email" />
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label="Email"
                          name="email"
                          type="text"
                          autoComplete="username"
                          pattern={
                            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
                          }
                          placeholder="Email"
                        />
                        <Error errorName={errors.email} />
                      </div>
                    </div>

                    {/* סיסמה */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label="Password" />
                      <div className="col-span-6">
                        {id ? (
                          <InputArea
                            required
                            register={register}
                            label="Password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Password"
                          />
                        ) : (
                          <InputArea
                            register={register}
                            label="Password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Password"
                          />
                        )}
                        <Error errorName={errors.password} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              {/* תאריך הצטרפות ותפקיד */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Employment Details")}
                  icon={<MdWork size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* תאריך הצטרפות */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label="Joining Date" />
                      <div className="col-span-6">
                        <Input
                          onChange={(e) => setSelectedDate(e.target.value)}
                          label="Joining Date"
                          name="joiningDate"
                          value={selectedDate}
                          type="date"
                          placeholder={t("StaffJoiningDate")}
                        />
                        <Error errorName={errors.joiningDate} />
                      </div>
                    </div>

                    {/* תפקיד */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label="Staff Role" />
                      <div className="col-span-6">
                        <SelectRole register={register} label="Role" name="role" />
                        <Error errorName={errors.role} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            <DrawerButton id={id} title="Staff" isSubmitting={isSubmitting} />
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default StaffDrawer;