// src/pages/StoreHome.jsx
import { createContext, useContext, useEffect, useMemo } from "react";
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

const StoreHomePropsContext = createContext(null);

const useStoreHomeProps = () => useContext(StoreHomePropsContext);

const StoreHomeTabContent = ({ containerClassName, render }) => {
  const storeHomeProps = useStoreHomeProps();
  const { handleSubmit, onSubmit } = storeHomeProps;

  return (
    <div className={containerClassName}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {render(storeHomeProps)}
      </form>
    </div>
  );
};

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
    register,
  } = storeHomeProps;

  useEffect(() => {
    isCoupon && setIsSliderFullWidth(false);
  }, [isCoupon]);

  useEffect(() => {
    leftRightArrow && setBottomDots(false);
  }, [leftRightArrow]);

  useEffect(() => {
    leftRightArrow && setBothSliderOption(false);
  }, [leftRightArrow]);

  useEffect(() => {
    bottomDots && setBothSliderOption(false);
  }, [bottomDots]);

  useEffect(() => {
    bottomDots && setLeftRightArrow(false);
  }, [bottomDots]);

  useEffect(() => {
    bothSliderOption && setLeftRightArrow(false);
  }, [bothSliderOption]);

  useEffect(() => {
    bothSliderOption && setBottomDots(false);
  }, [bothSliderOption]);

  const tabs = useMemo(() => [
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
        <StoreHomeTabContent
          containerClassName="sm:container md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <HomePage storeHomeProps={props} />}
        />
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
        <StoreHomeTabContent
          containerClassName="sm:container w-full md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <SinglePage storeHomeProps={props} />}
        />
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
        <StoreHomeTabContent
          containerClassName="sm:container md:p-6 p-4 mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <AboutUs storeHomeProps={props} />}
        />
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
        <StoreHomeTabContent
          containerClassName="sm:container md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <PrivacyPolicy storeHomeProps={props} />}
        />
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
        <StoreHomeTabContent
          containerClassName="sm:container md:p-6 p-4 mx-auto w-full bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <Faq storeHomeProps={props} />}
        />
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
        <StoreHomeTabContent
          containerClassName="sm:container md:p-6 p-4 mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <Offer storeHomeProps={props} />}
        />
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
        <StoreHomeTabContent
          containerClassName="sm:container md:p-6 p-4 w-full mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <ContactUs storeHomeProps={props} />}
        />
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
        <StoreHomeTabContent
          containerClassName="sm:container md:p-6 p-4 w-full mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <Checkout storeHomeProps={props} />}
        />
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
        <StoreHomeTabContent
          containerClassName="sm:container md:p-6 p-4 w-full mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <DashboardSetting storeHomeProps={props} />}
        />
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
        <StoreHomeTabContent
          containerClassName="sm:container md:p-6 p-4 w-full mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          render={(props) => <SeoSetting storeHomeProps={props} />}
        />
      ),
      onClick: () => setTabIndex(9),
    },
  ], [t, setTabIndex]);

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
        <StoreHomePropsContext.Provider value={storeHomeProps}>
          <Tabs tabs={tabs} tab="storeTab" fitContent={true} />
        </StoreHomePropsContext.Provider>
      </div>
    </div>
  );
};

export default StoreHome;