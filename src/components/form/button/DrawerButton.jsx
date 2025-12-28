import React, { useContext } from "react";
import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import spinnerLoadingImage from "@/assets/img/spinner.gif";

const DrawerButton = ({ id, title, isSubmitting }) => {
  const { t } = useTranslation();
  const { toggleDrawer, isDrawerOpen } = useContext(SidebarContext);

  return (
    <>
      <div
        className="fixed flex items-center justify-between z-10 bottom-0 right-0 w-full py-4 px-6 gap-2 bg-gray-50 border-t border-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        style={{ display: !isDrawerOpen && 'none' }}
      >
        <div className="flex min-w-[80px] sm:min-w-[176px]">
          <Button
            onClick={toggleDrawer}
            className="h-12 bg-white w-full text-red-500 hover:bg-red-50 hover:border-red-100 hover:text-red-600 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-red-700"
            layout="outline"
          >
            {t("CancelBtn")}
          </Button>
        </div>

        <div className="flex min-w-[80px] sm:min-w-[176px]">
          {isSubmitting ? (
            <Button disabled={true} type="button" className="w-full h-12">
              <img
                src={spinnerLoadingImage}
                alt="Loading"
                width={20}
                height={10}
              />{" "}
              <span className="font-serif ml-2 font-light">{t("Processing")}</span>
            </Button>
          ) : (
            <Button type="submit" className="w-full h-12">
              {id ? (
                <span>
                  {t("UpdateBtn")} {title}
                </span>
              ) : (
                <span>{t("Add")} {t(`${title}`)}</span>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default DrawerButton;