// src/hooks/usePriceListSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import PriceListServices from "@/services/PriceListServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const usePriceListSubmit = (id) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate, lang } =
        useContext(SidebarContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, clearErrors, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            const priceListData = {
                name: data.name || '',
            };

            if (id) {
                const res = await PriceListServices.updatePriceList(id, priceListData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifySuccess(res.message);
                closeDrawer();
            } else {
                const res = await PriceListServices.addPriceList(priceListData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifySuccess(res.message);
                closeDrawer();
            }
        } catch (err) {
            notifyError(err?.response?.data?.message || err?.message);
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isDrawerOpen) {
            setValue("name", "");
            clearErrors("name");
            return;
        }
        if (id) {
            (async () => {
                try {
                    const res = await PriceListServices.getPriceListById(id);
                    if (res) {
                        setValue("name", res.name);
                    }
                } catch (err) {
                    notifyError(err?.response?.data?.message || err?.message);
                }
            })();
        }
    }, [id, setValue, isDrawerOpen, clearErrors]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
    };
};

export default usePriceListSubmit;