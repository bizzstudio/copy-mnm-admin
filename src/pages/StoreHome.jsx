// src/pages/StoreHome.jsx
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BiHome, BiFile, BiInfoCircle, BiShield, BiHelpCircle, BiGift, BiEnvelope, BiCart, BiGridAlt, BiSearch } from "react-icons/bi";
import "react-tabs/style/react-tabs.css";

// Internal import
import useQuery from "@/hooks/useQuery";
import Faq from "@/components/store-home/Faq";
import Offer from "@/components/store-home/Offer";
import AboutUs from "@/components/store-home/AboutUs";
import ContactUs from "@/components/store-home/ContactUs";
import { SidebarContext } from "@/context/SidebarContext";
import useStoreHomeSubmit from "@/hooks/useStoreHomeSubmit";
import PageTitle from "@/components/Typography/PageTitle";
import PrivacyPolicy from "@/components/store-home/PrivacyPolicy";
import HomePage from "@/components/store-home/HomePage";
import SinglePage from "@/components/store-home/SinglePage";
import Checkout from "@/components/store-home/Checkout";
import SeoSetting from "@/components/settings/SeoSetting";
import DashboardSetting from "@/components/store-home/DashboardSetting";
import SelectLanguageTwo from "@/components/form/selectOption/SelectLanguageTwo";
import Tabs from "@/components/common/Tabs";

const StoreHome = () => {
  let query = useQuery();
  const { t } = useTranslation();

  const tabName = query.get("storeTab");
  const { setTabIndex } = useContext(SidebarContext);

  // Get all props from the hook as a single object
  const storeHomeProps = useStoreHomeSubmit();

  // Extract only the props needed in this component for useEffect hooks and direct usage
  const {
    isCoupon,
    setIsSliderFullWidth,
    leftRightArrow,
    setBottomDots,
    setBothSliderOption,
    bottomDots,
    setLeftRightArrow,
    bothSliderOption,
    handleSelectLanguage,
    handleSubmit,
    onSubmit,
    register,
  } = storeHomeProps;

  useEffect(() => {
    isCoupon && setIsSliderFullWidth(false);
  }, [isCoupon, setIsSliderFullWidth]);

  useEffect(() => {
    leftRightArrow && setBottomDots(false);
  }, [leftRightArrow, setBottomDots]);

  useEffect(() => {
    leftRightArrow && setBothSliderOption(false);
  }, [leftRightArrow, setBothSliderOption]);

  useEffect(() => {
    bottomDots && setBothSliderOption(false);
  }, [bottomDots, setBothSliderOption]);

  useEffect(() => {
    bottomDots && setLeftRightArrow(false);
  }, [bottomDots, setLeftRightArrow]);

  useEffect(() => {
    bothSliderOption && setLeftRightArrow(false);
  }, [bothSliderOption, setLeftRightArrow]);

  useEffect(() => {
    bothSliderOption && setBottomDots(false);
  }, [bothSliderOption, setBottomDots]);

  const tabs = [
    {
      id: "home-settings",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiHome size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("HomeSettings")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <HomePage storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(0),
    },
    {
      id: "single-setting",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiFile size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("SingleSetting")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container w-full md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <SinglePage storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(1),
    },
    {
      id: "about-us-setting",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiInfoCircle size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("AboutUsSetting")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container md:p-6 p-4 mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AboutUs storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(2),
    },
    {
      id: "privacy-setting",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiShield size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("PrivacyTCSetting")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <PrivacyPolicy storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(3),
    },
    {
      id: "FAQ-setting",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiHelpCircle size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("FAQSetting")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container md:p-6 p-4 mx-auto w-full bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Faq storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(4),
    },
    {
      id: "offers-setting",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiGift size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("OffersStting")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container md:p-6 p-4 mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Offer storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(5),
    },
    {
      id: "contact-us-setting",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiEnvelope size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("ContactUsStting")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container md:p-6 p-4 w-full mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <ContactUs storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(6),
    },
    {
      id: "checkout-setting",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiCart size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("Checkout")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container md:p-6 p-4 w-full mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Checkout storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(7),
    },
    {
      id: "dashboard-setting",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiGridAlt size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("DashboardSetting")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container md:p-6 p-4 w-full mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DashboardSetting storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(8),
    },
    {
      id: "seo-settings",
      label: (
        <span className="flex gap-1.5 items-center justify-center">
          <span className="shrink-0">
            <BiSearch size={16} />
          </span>
          <div className="hidden xl:block">
            <span className="text-[0.8vw] line-clamp-1 text-center">{t("SeoSetting")}</span>
          </div>
        </span>
      ),
      content: (
        <div className="sm:container md:p-6 p-4 w-full mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <SeoSetting storeHomeProps={storeHomeProps} />
          </form>
        </div>
      ),
      onClick: () => setTabIndex(9),
    },
  ];

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <div className="flex justify-between text-center items-center">
        <div>
          <PageTitle>{t("StoreCustomizationPageTitle")}</PageTitle>
        </div>
        <div className="pb-4">
          <SelectLanguageTwo
            register={register}
            handleSelectLanguage={handleSelectLanguage}
          />
        </div>
      </div>

      <div className="mt-6 w-full">
        <Tabs tabs={tabs} tab="storeTab" fitContent={true} />
      </div>
    </div>
  );
};

export default StoreHome;