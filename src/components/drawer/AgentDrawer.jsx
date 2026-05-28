import { Card, Label } from "@windmill/react-ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdPerson, MdLock, MdPercent, MdFlag } from "react-icons/md";

import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import CollapsibleSection from "@/components/common/CollapsibleSection";

import useAgentSubmit from "@/hooks/useAgentSubmit";

const AgentDrawer = ({ id }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
  } = useAgentSubmit(id);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <Title
          register={register}
          title={id ? t("UpdateAgent") : t("AddAgent")}
          description={
            id ? t("UpdateAgentDescription") : t("AddAgentDescription")
          }
        />
      </div>

      <Card className="flex flex-col grow w-full max-h-full border-none! overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <div className="px-6 pt-2 grow scrollbar-hide w-full overflow-y-auto grid grid-cols-12 gap-5">

              <div className="col-span-12">
                <CollapsibleSection
                  title={t("AgentDetails")}
                  icon={<MdPerson size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("AgentName")} />
                      <InputArea
                        register={register}
                        label="AgentName"
                        name="name"
                        type="text"
                        placeholder={t("AgentName")}
                      />
                      <Error errorName={errors.name} />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("Phone")} />
                      <InputArea
                        register={register}
                        label="Phone"
                        name="phone"
                        type="tel"
                        placeholder="050-..."
                      />
                      <Error errorName={errors.phone} />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("Email")} />
                      <InputArea
                        register={register}
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="agent@example.com"
                        isRequired={false}
                      />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("Area")} />
                      <InputArea
                        register={register}
                        label="Area"
                        name="area"
                        type="text"
                        placeholder={t("AreaPlaceholder")}
                        isRequired={false}
                      />
                    </div>

                    <div className="flex flex-col gap-1 col-span-12">
                      <LabelArea label={t("Notes")} />
                      <InputArea
                        register={register}
                        label="Notes"
                        name="notes"
                        type="text"
                        placeholder={t("Notes")}
                        isRequired={false}
                      />
                    </div>

                    <div className="flex items-center gap-2 col-span-12">
                      <input
                        id="isActive"
                        type="checkbox"
                        {...register("isActive")}
                        className="w-5 h-5"
                      />
                      <Label htmlFor="isActive">{t("AgentIsActive")}</Label>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              <div className="col-span-12">
                <CollapsibleSection
                  title={t("AgentSecurity")}
                  icon={<MdLock size={20} className="mt-1" />}
                  defaultOpen={!id}
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    <div className="flex flex-col gap-1 col-span-12">
                      <LabelArea label={t("Password")} />
                      <InputArea
                        register={register}
                        label="Password"
                        name="password"
                        type="password"
                        placeholder={id ? t("PasswordKeepEmptyToSkip") : "********"}
                        isRequired={!id}
                      />
                      <Error errorName={errors.password} />
                    </div>

                  </div>
                </CollapsibleSection>
              </div>

              <div className="col-span-12">
                <CollapsibleSection
                  title={t("DiscountLimits")}
                  icon={<MdPercent size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("MaxDiscountPercent")} />
                      <InputArea
                        register={register}
                        label="MaxDiscountPercent"
                        name="maxDiscountPercent"
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0-100"
                        isRequired={false}
                      />
                      <Error errorName={errors.maxDiscountPercent} />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("MinPriceStrategy")} />
                      <select
                        {...register("minPriceStrategy")}
                        className="block w-full text-sm dark:text-gray-300 dark:bg-gray-700 rounded-md py-2 px-3 border-gray-300 dark:border-gray-600"
                      >
                        <option value="none">{t("MinPriceNone")}</option>
                        <option value="percentOfPrice">
                          {t("MinPricePercentOfPrice")}
                        </option>
                        <option value="percentOfCost">
                          {t("MinPricePercentOfCost")} (TODO)
                        </option>
                        <option value="absolute">
                          {t("MinPriceAbsolute")} (TODO)
                        </option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {t("MinPriceStrategyHelp")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("MinPriceValue")} />
                      <InputArea
                        register={register}
                        label="MinPriceValue"
                        name="minPriceValue"
                        type="number"
                        min={0}
                        placeholder="0"
                        isRequired={false}
                      />
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              <div className="col-span-12">
                <CollapsibleSection
                  title={t("SalesTargets")}
                  icon={<MdFlag size={20} className="mt-1" />}
                  defaultOpen={false}
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                      <LabelArea label={t("TargetDaily")} />
                      <InputArea
                        register={register}
                        label="TargetDaily"
                        name="targetDaily"
                        type="number"
                        min={0}
                        placeholder="₪"
                        isRequired={false}
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                      <LabelArea label={t("TargetWeekly")} />
                      <InputArea
                        register={register}
                        label="TargetWeekly"
                        name="targetWeekly"
                        type="number"
                        min={0}
                        placeholder="₪"
                        isRequired={false}
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                      <LabelArea label={t("TargetMonthly")} />
                      <InputArea
                        register={register}
                        label="TargetMonthly"
                        name="targetMonthly"
                        type="number"
                        min={0}
                        placeholder="₪"
                        isRequired={false}
                      />
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            <DrawerButton id={id} title={t("Agent")} isSubmitting={isSubmitting} />
          </form>
        </div>
      </Card>
    </>
  );
};

export default AgentDrawer;
