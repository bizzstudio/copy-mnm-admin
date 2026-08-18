// src/components/sidebar/SidebarContent.jsx
import React, { useContext, useRef, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, WindmillContext } from "@windmill/react-ui";
import Cookies from "js-cookie";
import Logo from "@/components/common/Logo";

// Icons
import { IoLogOutOutline } from "react-icons/io5";
import { FiUsers, FiUser } from "react-icons/fi";
import { GoMoon } from "react-icons/go";
import { MdOutlineWbSunny } from "react-icons/md";

// Internal import
import sidebar from "@/routes/sidebar";
import { filterSidebar } from "@/routes/sidebarUtils";
import { useModules } from "@/context/ModulesContext";
import { AdminContext } from "@/context/AdminContext";
import SidebarSubMenu from "@/components/sidebar/SidebarSubMenu";
import Notifications from "@/components/header/Notifications";

const SidebarContent = () => {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const { state: adminState, dispatch } = useContext(AdminContext);
  const { adminInfo } = adminState;
  const { mode, toggleMode } = useContext(WindmillContext);
  const { isModuleEnabled, apps } = useModules();

  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef();

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
        setProfileOpen(false);
      };
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleProfileOpen = () => {
    setProfileOpen(!profileOpen);
  };

  /**
   * BizzStudio's entries are hidden from everyone else.
   *
   * `'superadmin'` (one word) is the PLATFORM role, as stored on `PlatformUser`
   * and checked by the server. It is not MNM's `'Super Admin'`, which is a role
   * inside one tenant and confers nothing here — a customer may call their own
   * manager whatever they like.
   *
   * This is presentation only. `/api/platform/*` refuses any request without a
   * platform token, so a hidden item and a forbidden endpoint cannot disagree in
   * the direction that matters.
   */
  const isPlatformUser =
    adminInfo?.role === "superadmin" || adminInfo?.role === "platform-admin";

  /**
   * הסינון עצמו יושב ב-`routes/sidebarUtils` כי הוא רקורסיבי — עץ הניווט הוא
   * שתי רמות, וקבוצה שכל בניה סוננו צריכה להיעלם ולא להישאר כותרת ריקה.
   *
   * שתי שאלות נשאלות על כל פריט: למי מותר לראות אותו (`platformOnly`), ומה דלוק
   * אצל הלקוח (`moduleKey`). עד עכשיו נשאלה רק הראשונה, ולכן פריט של מודול כבוי
   * הופיע בתפריט והוביל למסך שהשרת מסרב לטעון — 404 מ-`requireModule` שנראה
   * למשתמש כמו תקלה ולא כמו "לא קנית את זה".
   */
  let filteredSidebar = filterSidebar(sidebar, {
    isPlatformUser,
    isModuleEnabled,
    apps,
  });

  // סינון התפריט במצב פרודקשיין
  if (import.meta.env.VITE_APP_ENVIRONMENT !== 'development') {
    const hiddenRoutes = [
      // "OnlineStore"
    ];
    filteredSidebar = filteredSidebar.filter((route) => !hiddenRoutes.includes(route.name));
  };

  return (
    <div className="flex flex-col h-full pb-4 text-gray-500 dark:text-gray-400">
      {/* לוגו בחלק העליון */}
      <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 p-4">
        <Logo size="md" />
      </div>

      {/* תפריט ניווט - גדל לפי הצורך */}
      <div className="flex-1 overflow-y-auto">
        <ul className="mt-2">
          {filteredSidebar.map((route) =>
            route.routes ? (
              <SidebarSubMenu route={route} key={route.name} />
            ) : (
              <li className="relative" key={route.name}>
                <NavLink
                  to={route.path}
                  target={route?.outside ? "_blank" : "_self"}
                  className={({ isActive }) => {
                    const additionalActive = route.active?.some((word) =>
                      location.pathname.includes(word)
                    );
                    return `flex gap-2 px-6 py-4 items-center w-full text-sm font-semibold transition-colors duration-150 ${isActive || additionalActive ? "text-mainColor dark:text-gray-200" : "hover:text-mainColor"
                      }`;
                  }}
                  rel="noreferrer"
                >
                  {({ isActive }) => {
                    const additionalActive = route.active?.some((word) =>
                      location.pathname.includes(word)
                    );

                    return (
                      <>
                        {(isActive || additionalActive) && (
                          <span
                            className="absolute inset-y-0 end-0 w-1 bg-mainColor rounded-s-lg"
                            aria-hidden="true"
                          ></span>
                        )}
                        {typeof route.icon === "string" ? (
                          <img src={route.icon} alt={`${route.name} Icon`} className="w-5 h-5 fill-slate-400 stroke-slate-100" />
                        ) : (
                          <route.icon className="w-5 h-5" aria-hidden="true" />
                        )}
                        <span>{t(`${route.name}`)}</span>
                      </>
                    );
                  }}
                </NavLink>
              </li>
            )
          )}
        </ul>
      </div>

      {/* אזור תחתון עם התראות ופרופיל */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 px-4 relative">
        <div className="w-[55%] lg:ms-auto lg:me-0 me-auto ms-0 flex items-center justify-between gap-3">
          {/* התראות */}
          {adminInfo && <Notifications />}

          {/* פרופיל */}
          <div className="relative" ref={menuRef}>
            <button
              className="rounded-full bg-mainColor text-white h-8 w-8 font-medium focus:outline-none flex items-center justify-center"
              onClick={handleProfileOpen}
            >
              {currentUser?.image ? (
                <Avatar
                  className="align-middle"
                  src={`${currentUser.image}`}
                  aria-hidden="true"
                />
              ) : (
                <FiUser className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {profileOpen && (
              <ul className="z-10 origin-bottom-left absolute left-0 bottom-full mb-2 rounded-md shadow-lg border-y border-mainColor-light dark:border-mainColor bg-white dark:bg-gray-800 focus:outline-none">
                {/* שם המשתמש - לא אינטרקטיבי */}
                {currentUser && (
                  <>
                    <li className="pt-[7px] pb-1 px-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
                          {typeof currentUser?.name === 'object'
                            ? (currentUser?.name?.[i18n.language] || currentUser?.name?.he || currentUser?.name?.en || currentUser?.email)
                            : (currentUser?.name || currentUser?.email)}
                        </span>
                        {(typeof currentUser?.name === 'object' ? (currentUser?.name?.[i18n.language] || currentUser?.name?.he || currentUser?.name?.en) : currentUser?.name) && currentUser?.email && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[150px] truncate">
                            {currentUser.email}
                          </span>
                        )}
                      </div>
                    </li>
                    <li className="border-t border-gray-200 dark:border-gray-700 my-1"></li>
                  </>
                )}

                {adminInfo?.email &&
                  <li className="justify-between font-serif font-medium py-2 px-3 transition-colors duration-150 hover:bg-gray-100 text-gray-500 hover:text-mainColor dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                    <NavLink to="/dashboard">
                      <span className="flex items-center gap-1 text-sm">
                        <FiUsers size={15} />
                        <span>{t("Dashboard")}</span>
                      </span>
                    </NavLink>
                  </li>
                }

                {/* Theme toggler */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarContent;