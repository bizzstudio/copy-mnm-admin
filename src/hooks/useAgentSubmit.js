import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { SidebarContext } from "@/context/SidebarContext";
import AgentServices from "@/services/AgentServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useAgentSubmit = (id) => {
  const { isDrawerOpen, closeDrawer, setIsUpdate } = useContext(SidebarContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      isActive: true,
      maxDiscountPercent: 0,
      minPriceStrategy: "none",
      minPriceValue: 0,
      targetDaily: 0,
      targetWeekly: 0,
      targetMonthly: 0,
      area: "",
      notes: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const payload = {
        name: data.name?.trim(),
        email: data.email?.trim() || undefined,
        phone: String(data.phone || "").trim(),
        isActive: !!data.isActive,
        maxDiscountPercent: Number(data.maxDiscountPercent) || 0,
        minPriceStrategy: data.minPriceStrategy || "none",
        minPriceValue: Number(data.minPriceValue) || 0,
        targets: {
          daily: Number(data.targetDaily) || 0,
          weekly: Number(data.targetWeekly) || 0,
          monthly: Number(data.targetMonthly) || 0,
        },
        area: data.area?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      };

      // סיסמה — בעדכון נשלחת רק אם הוזנה.
      if (data.password) payload.password = data.password;
      if (!id && !payload.password) {
        notifyError("סיסמה היא שדה חובה ליצירת סוכן חדש");
        setIsSubmitting(false);
        return;
      }

      if (id) {
        await AgentServices.updateAgent(id, payload);
        notifySuccess("הסוכן עודכן בהצלחה");
      } else {
        await AgentServices.addAgent(payload);
        notifySuccess("הסוכן נוצר בהצלחה");
      }

      setIsUpdate(true);
      setIsSubmitting(false);
      closeDrawer();
    } catch (err) {
      const msg = err?.response?.data?.message;
      notifyError(typeof msg === "object" ? msg.he || msg.en : msg || err?.message);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      reset();
      return;
    }
    if (id) {
      (async () => {
        try {
          const res = await AgentServices.getAgentById(id);
          if (res) {
            setValue("name", res.name || "");
            setValue("email", res.email || "");
            setValue("phone", res.phone || "");
            setValue("isActive", !!res.isActive);
            setValue("maxDiscountPercent", res.maxDiscountPercent || 0);
            setValue("minPriceStrategy", res.minPriceStrategy || "none");
            setValue("minPriceValue", res.minPriceValue || 0);
            setValue("targetDaily", res.targets?.daily || 0);
            setValue("targetWeekly", res.targets?.weekly || 0);
            setValue("targetMonthly", res.targets?.monthly || 0);
            setValue("area", res.area || "");
            setValue("notes", res.notes || "");
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isDrawerOpen]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    setValue,
  };
};

export default useAgentSubmit;
