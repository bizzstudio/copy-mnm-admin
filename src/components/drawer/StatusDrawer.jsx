// src/components/drawer/StatusDrawer.jsx
import {
  Input,
  Card,
  CardBody,
} from "@windmill/react-ui";
import React from "react";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { BiSolidUserDetail } from "react-icons/bi";
import { MdSettings } from "react-icons/md";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import useStatusSubmit from "@/hooks/useStatusSubmit";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const StatusDrawer = ({ id }) => {
  const { t } = useTranslation();
  const {
    register,
    onSubmit,
    errors,
    openModal,
    handleSubmit,
    isSubmitting,
    tag,
    setTag,
    isSystem,
    setIsSystem,
  } = useStatusSubmit(id);

  return (
    <>
      <Modal
        open={openModal}
        onClose={() => { }}
        center
        closeIcon={
          <div className="absolute top-0 right-0 text-red-500 active:outline-none text-xl border-0">
            <FiX className="text-3xl" />
          </div>
        }
      />

      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            title={t("UpdateStatus")}
            description={t("UpdateStatusDescription")}
          />
        ) : (
          <Title
            register={register}
            title={t("AddStatus")}
            description={t("AddStatusDescription")}
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
                  icon={<BiSolidUserDetail size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* שם עברי */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("heName")} />
                      <div className="col-span-6">
                        <Input
                          {...register(`heName`, {
                            required: t("Hebrew name is required!"),
                          })}
                          name="heName"
                          type="text"
                          placeholder={t("heName")}
                        />
                        <Error errorName={errors.name} />
                      </div>
                    </div>

                    {/* שם אנגלי */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("enName")} />
                      <div className="col-span-6">
                        <Input
                          {...register(`name`, {
                            required: t("Name is required!"),
                          })}
                          name="name"
                          type="text"
                          placeholder={t("enName")}
                        />
                        <Error errorName={errors.heName} />
                      </div>
                    </div>

                    {/* טלפון */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("phone")} />
                      <div className="col-span-6">
                        <Input
                          {...register(`phone`, {
                            required: isSystem ? false : t("Phone is required!"),
                          })}
                          name="phone"
                          type="tel"
                          placeholder={t("phone")}
                          disabled={isSystem}
                        />
                        <Error errorName={errors.phone} />
                      </div>
                    </div>

                    {/* סטטוס מערכת – רק בהוספת סטטוס חדש */}
                    {!id && (
                      <div className="flex flex-col gap-1 md:col-span-6 col-span-12 flex justify-end">
                        <LabelArea label={t("SystemStatus")} />
                        <div className="col-span-6 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="status-isSystem"
                            checked={isSystem}
                            onChange={(e) => setIsSystem(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor="status-isSystem" className="text-sm text-gray-600 dark:text-gray-400">
                            {t("SystemStatusDescription")}
                          </label>
                        </div>
                      </div>
                    )}

                    {/* סיסמה */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("Password")} oneLine={true} />
                      <div className="col-span-6">
                        <Input
                          {...register(`password`)}
                          name="password"
                          type="text"
                          placeholder={t("App Password")}
                        />
                        <Error errorName={errors.password} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              {/* הגדרות סטטוס */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Status Settings")}
                  icon={<MdSettings size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* מצב פעיל */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("statusState")} />
                      <div className="col-span-6">
                        <button
                          type="button"
                          layout="outline"
                          onClick={() => setTag(!tag)}
                          className={`w-full border border-gray-300 rounded px-4 md:py-1 py-3 text-sm ${tag ? "bg-green-500 text-white" : "bg-red-500! text-white"}`}
                        >
                          {tag ? t("Active") : t("Inactive")}
                        </button>
                      </div>
                    </div>

                    {/* צבע סטטוס */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("statusColor")} oneLine={true} />
                      <div className="col-span-6">
                        <Input
                          type="color"
                          {...register("statusColor", {
                            required: t("Color is required!"),
                          })}
                          name="statusColor"
                        />
                        <Error errorName={errors.statusColor} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            <DrawerButton id={id} title={t("Collector")} isSubmitting={isSubmitting} />
          </form>
        </div>
      </Card>
    </>
  );
};

export default React.memo(StatusDrawer);