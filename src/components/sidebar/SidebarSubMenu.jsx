// src/components/sidebar/SidebarSubMenu.jsx
import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IoChevronDownOutline,
  IoChevronBackOutline,
  IoRemoveSharp,
} from "react-icons/io5";
import { SidebarContext } from "@/context/SidebarContext";

const OUTSIDE_DOMAINS = {
  store: import.meta.env.VITE_APP_STORE_DOMAIN,
  likutApp: import.meta.env.VITE_APP_LIKUTAPP_DOMAIN,
  agentsApp: import.meta.env.VITE_APP_AGENTSAPP_DOMAIN,
};

const SidebarSubMenu = ({ route }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { lang } = useContext(SidebarContext);

  return (
    <>
      <li className="relative px-6 py-3" key={route.name}>
        <button
          className="flex gap-2 items-center justify-between focus:outline-none w-full text-sm font-semibold transition-colors duration-150 hover:text-mainColor"
          onClick={() => setOpen(!open)}
          aria-haspopup="true"
        >
          <span className="flex gap-2 items-center">
            <route.icon className="w-5 h-5" aria-hidden="true" />
            <span className="mt-1">{t(`${route.name}`)}</span>
            <span className="mt-1">
              {open ? <IoChevronDownOutline /> : <IoChevronBackOutline className={lang == "en" ? "rotate-180" : ""} />}
            </span>
          </span>
        </button>

        {open && (
          <ul
            className="mt-2 px-2 py-1 overflow-hidden text-sm font-medium text-gray-500 rounded-md dark:text-gray-400 dark:bg-gray-900 bg-gray-100"
            aria-label="submenu"
          >
            {route.routes.map((child, i) => {
              const outsideHref = child?.outside
                ? OUTSIDE_DOMAINS[child.outside] || child.path
                : null;

              // קישור חיצוני בלי כתובת מוגדרת — עדיף להסתיר מלרנדר לינק מת
              if (child?.outside && !outsideHref) return null;

              return (
                <li key={i + 1}>
                  {child?.outside ? (
                    <a
                      href={outsideHref}
                      target="_blank"
                      className="flex gap-1 items-center font-serif py-1 text-sm text-gray-600 hover:text-mainColor dark:hover:text-mainColor-dark cursor-pointer"
                      rel="noreferrer"
                    >
                      <span className="text-xs text-gray-500">
                        <IoRemoveSharp />
                      </span>
                      <span className="text-gray-500 hover:text-mainColor dark:hover:text-mainColor-dark dark:hover:text-gray-200">
                        {t(`${child.name}`)}
                      </span>
                    </a>
                  ) : (
                    <NavLink
                      to={child.path}
                      className={({ isActive }) =>
                        `flex gap-1 items-center font-serif py-1 text-sm text-gray-600 hover:text-mainColor dark:hover:text-mainColor-dark cursor-pointer ${isActive ? "text-mainColor-dark font-bold" : ""
                        }`
                      }
                      rel="noreferrer"
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              className="absolute inset-y-0 left-0 w-1 bg-mainColor rounded-tr-lg rounded-br-lg"
                              aria-hidden="true"
                            ></span>
                          )}
                          <span className="text-xs text-gray-500">
                            <IoRemoveSharp />
                          </span>
                          <span className="text-gray-500 hover:text-mainColor dark:hover:text-mainColor-dark dark:hover:text-gray-200">
                            {t(`${child.name}`)}
                          </span>
                        </>
                      )}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </li>
    </>
  );
};

export default SidebarSubMenu;