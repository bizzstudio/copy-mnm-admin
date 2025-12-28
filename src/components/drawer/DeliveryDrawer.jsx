// src/components/drawer/DeliveryDrawer.jsx
import {
  Input,
  Card,
  CardBody,
} from "@windmill/react-ui";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MdLocalShipping } from "react-icons/md";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import useDeliverySubmit from "@/hooks/useDeliverySubmit";
import DaysSelect from "../form/selectOption/DaysSelect";
import City from '@/components/select/City';
import CollapsibleSection from "@/components/common/CollapsibleSection";

const DeliveryDrawer = ({ id }) => {
  const { t } = useTranslation();

  // הבאת הערים בישראל
  useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=100000"
      );
      const data = await response.json();
      let tempcity = []
      data.result.records.forEach(record => {
        tempcity.push(record)
      })
    })();
  }, []);

  const {
    register,
    onSubmit,
    errors,
    handleSubmit,
    isSubmitting,
    city,
    setCity,
    days,
    setDays
  } = useDeliverySubmit(id);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            title={t("UpdateDelivery")}
            description={t("UpdateDeliveryDescription")}
          />
        ) : (
          <Title
            register={register}
            title={t("DrawerAddDelivery")}
            description={t("AddDeliveryDescription")}
          />
        )}
      </div>

      <Card className="overflow-y-auto grow w-full max-h-full border-none!">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="block" id="block">
            <div className="px-6 pt-2 grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">
              {/* פרטי משלוח */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Delivery Details")}
                  icon={<MdLocalShipping size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* עיר */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("City")} />
                      <div className="col-span-6">
                        <City setValue={setCity} placeholder={JSON.stringify(city)} />
                      </div>
                    </div>

                    {/* מחיר */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("Price")} />
                      <div className="col-span-6">
                        <Input
                          {...register(`price`, {
                            required: "Price is required!",
                          })}
                          name="price"
                          type="number"
                          placeholder={t("Price")}
                        />
                        <Error errorName={errors.price} />
                      </div>
                    </div>

                    {/* ימים */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("Days")} />
                      <div className="col-span-6">
                        <DaysSelect setSelectedDays={setDays} selectedDaysFromUser={days} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            <DrawerButton id={id} title={t("Delivery")} isSubmitting={isSubmitting} />
          </form>
        </CardBody>
      </Card>
    </>
  )
}

export default DeliveryDrawer;