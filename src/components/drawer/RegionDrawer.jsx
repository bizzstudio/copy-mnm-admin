import React, { useEffect, useState } from "react";
import { Input, Card, CardBody, Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import RegionServices from "@/services/RegionServices";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import { notifyError, notifySuccess } from "@/utils/toast";
import { FiTrash2 } from "react-icons/fi";

const RegionDrawer = ({ id }) => {
  const { t } = useTranslation();
  const { closeDrawer, setIsUpdate, isDrawerOpen } = useContext(SidebarContext);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const [rules, setRules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) return;
    if (!id) {
      reset({ name: "" });
      setRules([{ minOrderTotal: 0, maxOrderTotal: undefined, shippingCost: 0 }]);
      return;
    }
    RegionServices.getRegionById(id)
      .then((res) => {
        setValue("name", res.name || "");
        const pr = res.priceRules && res.priceRules.length ? res.priceRules : [{ minOrderTotal: 0, maxOrderTotal: undefined, shippingCost: 0 }];
        setRules(pr);
      })
      .catch((err) => {
        notifyError(err?.response?.data?.message || err?.message);
      });
  }, [id, isDrawerOpen, setValue, reset]);

  const addRuleRow = () => {
    setRules((prev) => [...prev, { minOrderTotal: 0, maxOrderTotal: undefined, shippingCost: 0 }]);
  };

  const updateRule = (index, field, value) => {
    const isMax = field === "maxOrderTotal";
    const num = value === "" || value === undefined ? (isMax ? undefined : 0) : parseFloat(value) || 0;
    setRules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: isMax && (value === "" || value === undefined) ? undefined : num };
      return next;
    });
  };

  const removeRule = (index) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const normalized = rules.map((r) => {
        const minOrderTotal = Number(r.minOrderTotal) || 0;
        const shippingCost = Number(r.shippingCost) || 0;
        const maxRaw = r.maxOrderTotal;
        const hasMax = maxRaw != null && maxRaw !== "" && !Number.isNaN(Number(maxRaw));
        const rule = { minOrderTotal, shippingCost };
        if (hasMax) rule.maxOrderTotal = Number(maxRaw);
        return rule;
      });
      const priceRules = [...normalized].sort((a, b) => (b.minOrderTotal || 0) - (a.minOrderTotal || 0));

      if (id) {
        await RegionServices.updateRegion(id, { name: data.name });
        await RegionServices.updateRegionPriceRules(id, { priceRules });
        notifySuccess(t("SaveBtn") + " – OK");
      } else {
        const res = await RegionServices.addRegion({ name: data.name });
        if (priceRules.length > 0 && res._id) {
          await RegionServices.updateRegionPriceRules(res._id, { priceRules });
        }
        notifySuccess(t("AddRegion") + " – OK");
      }
      setIsUpdate(true);
      closeDrawer();
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            title={t("Region") + " – " + t("Edit")}
            description={t("UpdateRegionDescription")}
          />
        ) : (
          <Title
            register={register}
            title={t("AddRegion")}
            description={t("AddRegionDescription")}
          />
        )}
      </div>
      <Card className="flex flex-col grow w-full max-h-full border-none! overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="px-6 pt-2 grow scrollbar-hide w-full overflow-y-auto">
              <LabelArea label={t("RegionName")} />
              <Input
                {...register("name", { required: true })}
                name="name"
                type="text"
                placeholder={t("RegionNamePlaceholder")}
              />
              <Error errorName={errors.name} />

              <div className="mt-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {t("ShippingPriceRules")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {t("ShippingPriceRulesHint")}
                </p>
                <div className="space-y-4">
                  {rules.map((r, i) => (
                    <div key={i} className="flex flex-wrap items-end gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {t("FromAmount")} (₪)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={r.minOrderTotal === 0 && r.shippingCost === 0 && r.maxOrderTotal == null ? "" : r.minOrderTotal}
                          onChange={(e) => updateRule(i, "minOrderTotal", e.target.value)}
                          className="w-28"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {t("ToAmount")} (₪)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="—"
                          value={r.maxOrderTotal != null && r.maxOrderTotal !== "" ? r.maxOrderTotal : ""}
                          onChange={(e) => updateRule(i, "maxOrderTotal", e.target.value)}
                          className="w-28"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {t("ShippingCostAmount")}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={r.shippingCost === 0 && r.minOrderTotal === 0 && r.maxOrderTotal == null ? "" : r.shippingCost}
                          onChange={(e) => updateRule(i, "shippingCost", e.target.value)}
                          className="w-28"
                        />
                      </div>
                      <Button
                        type="button"
                        layout="outline"
                        size="small"
                        onClick={() => removeRule(i)}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" size="small" onClick={addRuleRow} className="mt-2">
                  {t("AddPriceRule")}
                </Button>
              </div>
            </div>
            <DrawerButton id={id} title={t("Region")} isSubmitting={isSubmitting} />
          </form>
        </div>
      </Card>
    </>
  );
};

export default RegionDrawer;
