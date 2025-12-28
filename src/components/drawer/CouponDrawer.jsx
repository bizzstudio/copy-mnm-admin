// src/components/drawer/CouponDrawer.jsx
import { Input, Button, Card, CardBody } from "@windmill/react-ui";
import { t } from "i18next";
import voucherCodes from 'voucher-code-generator';
import { MdLocalOffer, MdPercent } from "react-icons/md";

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import InputValue from "@/components/form/input/InputValue";
import LabelArea from "@/components/form/selectOption/LabelArea";
import useCouponSubmit from "@/hooks/useCouponSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import SwitchToggleFour from "@/components/form/switch/SwitchToggleFour";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const CouponDrawer = ({ id }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    currency,
    discountType,
    setDiscountType,
    isSubmitting,
    handleSelectLanguage,
    setValue,
  } = useCouponSubmit(id);

  // פונקציה ליצירת קוד קופון
  const generateCouponCode = () => {
    const code = voucherCodes.generate({
      length: 8,
      count: 1,
      charset: voucherCodes.charset("alphanumeric")
    })[0];
    setValue("couponCode", "MK" + code); // עדכון השדה עם הקוד החדש
  };

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ">
        {id ? (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("UpdateCoupon")}
            description={t("UpdateCouponDescription")}
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("AddCoupon")}
            description={t("AddCouponDescription")}
          />
        )}
      </div>

      <Card className="overflow-y-auto grow w-full max-h-full border-none!">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 pt-2 grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">
              {/* פרטי קופון */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Coupon Details")}
                  icon={<MdLocalOffer size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">

                    {/* קוד קופון */}
                    <div className="flex flex-col gap-1 col-span-12">
                      <LabelArea label={t("CampaignCode")} />
                      <div className="col-span-12 flex gap-3">
                        <div className="w-full relative">
                          <InputArea
                            register={register}
                            label="Coupon Code"
                            name="couponCode"
                            type="text"
                            placeholder={t("CampaignCode")}
                          />
                          <Error errorName={errors.couponCode} />
                        </div>
                        <Button onClick={generateCouponCode} className="whitespace-nowrap" >
                          {t("Generate")}
                        </Button>
                      </div>
                    </div>

                    {/* ספירת שימושים (רק בעדכון) */}
                    {id && (
                      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                        <LabelArea label={t("Coupon Usage Count")} oneLine />
                        <div className="col-span-6">
                          <Input
                            {...register(`usageCount`, {})}
                            disabled={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              </div>

              {/* הנחה */}
              <div className="col-span-12">
                <CollapsibleSection
                  title={t("Discount")}
                  icon={<MdPercent size={20} className="mt-1" />}
                  defaultOpen
                >
                  <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* סוג הנחה */}
                    <div className="flex flex-col gap-1 col-span-12">
                      <LabelArea label={t("DiscountType")} />
                      <div className="col-span-12">
                        <SwitchToggleFour
                          handleProcess={setDiscountType}
                          processOption={discountType}
                        />
                        <Error errorName={errors.discountType} />
                      </div>
                    </div>

                    {/* סכום הנחה */}
                    <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                      <LabelArea label={t("Discount")} />
                      <div className="col-span-6">
                        <InputValue
                          product
                          register={register}
                          maxValue={discountType ? 99 : 1000}
                          minValue={1}
                          label="Discount"
                          name="discountPercentage"
                          type="number"
                          placeholder={discountType ? t("Percentage") : t("Fixed Amount")}
                          currency={discountType ? "%" : currency}
                        />
                        <Error errorName={errors.discountPercentage} />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            <DrawerButton id={id} title={t("Coupon")} isSubmitting={isSubmitting} />
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default CouponDrawer;