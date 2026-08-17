// src/components/header/Header.jsx
import { Avatar, WindmillContext } from "@windmill/react-ui";
import Cookies from "js-cookie";
import React, { useContext, useEffect, useRef, useState } from "react";

import { IoLogOutOutline } from "react-icons/io5";
import { FaBars } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import getSymbolFromCurrency from "currency-symbol-map";

// Internal import
import en from "@/assets/img/flags/Flag_of_the_United_States.svg";
import he from "@/assets/img/flags/Flag_of_Israel.svg";
import { AdminContext } from "@/context/AdminContext";
import { SidebarContext } from "@/context/SidebarContext";
import Notifications from "./Notifications";
import TenantPicker from "@/components/platform/TenantPicker";
import { FiUsers } from "react-icons/fi";
import { GoMoon } from "react-icons/go";
import { MdOutlineWbSunny } from "react-icons/md";

const Header = () => {

  const nav = useNavigate();

  const {
    toggleSidebar,
    handleLanguageChange,
    setNavBar,
    navBar,
    systemSettings,
    lang,
  } = useContext(SidebarContext);
  const { state, dispatch } = useContext(AdminContext);
  const { adminInfo } = state;
  const { mode, toggleMode } = useContext(WindmillContext);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [showChats, setShowChats] = useState(false);

  const menuRef = useRef();

  const { t } = useTranslation();

  const currentUser = adminInfo;

  useEffect(() => {
    if (!currentUser) {
      nav('/login');
    }
  }, [currentUser, nav]);

  const handleLogOut = () => {
    dispatch({ type: "USER_LOGOUT" });
    Cookies.remove("adminInfo");
    nav('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef?.current && !menuRef.current.contains(e.target)) {
        setNotificationOpen(false);
        setShowChats(false);
        setProfileOpen(false);
      };
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, menuRef]);

  const handleNotificationOpen = () => {
    setNotificationOpen(!notificationOpen);
    setProfileOpen(false);
  };

  const handleChatsOpen = () => {
    setShowChats(!showChats);
  };

  const handleProfileOpen = () => {
    setProfileOpen(!profileOpen);
    setNotificationOpen(false);
  };

  // const onChange = (event) => {
  //     i18next.changeLanguage(event.target.value);
  // }
  const languageOptions = [
    { value: "he", label: <div className="flex items-center gap-2"><img src={he} width={20} alt="Hebrew" /><span>עברית</span></div> },
    { value: "en", label: <div className="flex items-center gap-2"><img src={en} width={20} alt="English" /><span>English</span></div> },
  ];

  const currencyOptions = (systemSettings?.currencies || ["USD"]).map((cur) => ({
    value: cur,
    label: `${getSymbolFromCurrency(cur) !== cur ? getSymbolFromCurrency(cur) + " " : ''}${cur}`,
  }));

  return (
    <>
      <header className="z-30 h-[68px] bg-white dark:bg-gray-800 lg:shadow-sm shadow-up-sm border-t border-gray-200 dark:border-gray-700">
        <div className="container flex items-center justify-between h-full px-6 mx-auto text-mainColor dark:text-mainColor">
          <ul className="flex justify-end items-center shrink-0 gap-3">
            <li className="relative text-right inline-block">
              <button
                type="button"
                onClick={() => setNavBar(!navBar)}
                className="outline-0 focus:outline-none hidden lg:block"
              >
                <FaBars className={`${navBar ? '-rotate-180' : ''} transition-all duration-300`} />
              </button>

              {/* <!-- Mobile hamburger --> */}
              <button
                className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none"
                onClick={toggleSidebar}
                aria-label="Menu"
              >
                <FaBars className={`${navBar ? 'rotate-180' : ''} transition-all duration-300`} />
              </button>
            </li>
          </ul>

          <ul className="flex justify-end items-center shrink-0 gap-3">

            {/* Language - Hidden on mobile */}
            {/* <li className="me-2 hidden md:block">
              <GenericSelect
                options={languageOptions}
                selected={lang}
                onChange={handleLanguageChange}
              />
            </li> */}

            {/*
              Whose data is on screen. Renders nothing for a tenant's staff,
              who only ever see their own — the question does not arise for them.
            */}
            <li className="me-2">
              <TenantPicker />
            </li>

            {/* <!-- Notifications menu --> */}
            {adminInfo && <Notifications />}

            {/* <!-- Profile menu --> */}
            <li className="relative pr-3 inline-block text-right" ref={menuRef}>
              <button
                className="rounded-full bg-mainColor text-white h-8 w-8 font-medium mx-auto focus:outline-none"
                onClick={handleProfileOpen}
              >
                {currentUser?.image ? (
                  <Avatar
                    className="align-middle"
                    src={`${currentUser.image}`}
                    aria-hidden="true"
                  />
                ) : (
                  <span>{currentUser?.email?.[0]?.toUpperCase()}</span>
                )}
              </button>

              {profileOpen && (
                <ul className="z-10 origin-top-left absolute end-0 mt-2 lg:mt-2 lg:origin-top-left mb-2 lg:mb-0 bottom-full lg:bottom-auto lg:top-full rounded-md shadow-lg border-y border-mainColor-light dark:border-mainColor bg-white dark:bg-gray-800 focus:outline-none">
                  {adminInfo?.email &&
                    <li className="justify-between font-serif font-medium py-2 px-3 transition-colors duration-150 hover:bg-gray-100 text-gray-500 hover:text-mainColor dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                      <Link to="/dashboard">
                        <span className="flex items-center gap-1 text-sm">
                          <FiUsers size={15} />
                          <span>{t("Dashboard")}</span>
                        </span>
                      </Link>
                    </li>
                  }

                  {/* <!-- Theme toggler --> */}
                  <li
                    onClick={toggleMode}
                    className="cursor-pointer justify-between font-serif font-medium py-2 px-3 transition-colors duration-150 hover:bg-gray-100 text-gray-500 hover:text-mainColor dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <span className="flex items-center gap-1 text-sm w-max">
                      {mode === "dark" ? (
                        <MdOutlineWbSunny className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <GoMoon className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>{mode === "dark" ? t("LightMode") : t("DarkMode")}</span>
                    </span>
                  </li>

                  {/* Language Selection - Mobile Only */}
                  {/* <li className="block md:hidden border-b border-gray-200 dark:border-gray-700">
                    <div className="px-3 py-2">
                      <GenericSelect
                        minWidth={130}
                        options={languageOptions}
                        selected={lang}
                        onChange={handleLanguageChange}
                      />
                    </div>
                  </li> */}

                  {/* עריכת פרופיל אישי, כרגע כבוי */}
                  {/* <li className="justify-between font-serif font-medium py-2 px-3 transition-colors duration-150 hover:bg-gray-100 text-gray-500 hover:text-mainColor dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                    <Link to="/edit-profile">
                      <span className="flex items-center gap-1 text-sm">
                        <IoSettingsOutline
                          className="w-4 h-4"
                          aria-hidden="true"
                        />
                        <span>{t("EditProfile")}</span>
                      </span>
                    </Link>
                  </li> */}

                  <li
                    onClick={handleLogOut}
                    className="cursor-pointer justify-between font-serif font-medium py-2 px-3 transition-colors duration-150 hover:bg-gray-100 text-gray-500 hover:text-mainColor dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <span className="flex items-center gap-1 text-sm">
                      <IoLogOutOutline size={19} />
                      <span className="whitespace-nowrap">{t("LogOut")}</span>
                    </span>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </header >
    </>
  );
};

export default Header;
