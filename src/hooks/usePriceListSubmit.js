// src/hooks/usePriceListSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import PriceListServices from "@/services/PriceListServices";
import { notifyError } from "@/utils/toast";
/** Bilingual `{ he, en }` messages from `/api/admin/*` — see the note in DeleteModal. */
import notifyApiResponse from "@/utils/notifyApiResponse";
import { localizedText } from "@/utils/localized";

const usePriceListSubmit = (id, preparedImportRows = [], clearPreparedImportRows = () => {}) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate, lang } =
        useContext(SidebarContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, clearErrors, getValues, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            const rivhitIdRaw = data.rivhitPriceListId;
            const rivhitIdNum =
                rivhitIdRaw === undefined || rivhitIdRaw === null || rivhitIdRaw === ""
                    ? null
                    : Number(rivhitIdRaw);

            const priceListData = {
                name: data.name || '',
                rivhitPriceListId: Number.isFinite(rivhitIdNum) ? rivhitIdNum : null,
            };

            if (id) {
                const res = await PriceListServices.updatePriceList(id, priceListData);

                if (preparedImportRows.length > 0) {
                    await PriceListServices.importPriceListPrices(id, { rows: preparedImportRows });
                    clearPreparedImportRows();
                }

                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            } else {
                const res = await PriceListServices.addPriceList(priceListData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            }
        } catch (err) {
            notifyApiResponse(err, false);
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isDrawerOpen) {
            setValue("name", "");
            setValue("rivhitPriceListId", "");
            clearErrors("name");
            clearErrors("rivhitPriceListId");
            return;
        }
        if (id) {
            (async () => {
                try {
                    const res = await PriceListServices.getPriceListById(id);
                    if (res) {
                        /**
                         * שם המחירון עשוי להגיע כ-`{ he, en }` (סכמת `Object`) או
                         * כמחרוזת. בלי הפירוק הזה שדה הטקסט הציג `[object Object]`
                         * ושמירה הייתה כותבת את המחרוזת הזו חזרה למסד — הטופס
                         * ממילא שולח מחרוזת (`name: data.name || ''`), אז הפירוק
                         * כאן מיישר את שני הצדדים.
                         */
                        setValue("name", localizedText(res.name));
                        setValue(
                            "rivhitPriceListId",
                            res.rivhitPriceListId ?? ""
                        );
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
        getValues,
    };
};

export default usePriceListSubmit;
