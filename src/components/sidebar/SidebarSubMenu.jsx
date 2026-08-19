// src/components/sidebar/SidebarSubMenu.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IoChevronDownOutline,
  IoChevronBackOutline,
  IoRemoveSharp,
} from "react-icons/io5";
import { SidebarContext } from "@/context/SidebarContext";
import { useModules } from "@/context/ModulesContext";
import { resolveOutsideHref } from "@/routes/sidebarUtils";

/**
 * כל הנתיבים הפנימיים שיושבים מתחת לענף — כולל רמה שנייה.
 *
 * משמש כדי לפתוח את הענף מעצמו כשהמסך הפעיל נמצא בתוכו. בלי זה, ניווט לרמה
 * שנייה (למשל /shipping תחת הזמנות ← משלוחים) היה מציג סיידבר סגור לגמרי, בלי
 * שום סימן איפה המשתמש נמצא.
 */
const collectPaths = (routes = []) =>
  routes.flatMap((child) =>
    child.routes
      ? collectPaths(child.routes)
      : child.outside || child.disabled
      ? []
      : [child.path]
  );

/** `/orders?source=agent` ו-`/orders` הם אותו מסך לצורך "האם אני כאן". */
const basePath = (path = "") => String(path).split("?")[0];

const queryOf = (path = "") => new URLSearchParams(String(path).split("?")[1] || "");

/**
 * "האם הפריט הזה הוא המסך שאני רואה" — לפי הכתובת המלאה, לא רק לפי הנתיב.
 *
 * מאז איחוד ההזמנות שני פריטים מצביעים על `/orders` ונבדלים רק ב-`?source=agent`.
 * `NavLink` משווה pathname בלבד, ולכן שניהם היו נצבעים כפעילים בו-זמנית והמשתמש
 * לא יכול היה לדעת מה הוא מסתכל עליו.
 *
 * הכלל: פריט עם פרמטרים פעיל כשכולם תואמים; פריט בלי פרמטרים פעיל רק אם אף
 * פרמטר שאָח שלו מבחין לפיו אינו מופיע בכתובת — אחרת "כל ההזמנות" היה נשאר פעיל
 * גם כשמסתכלים על הזמנות סוכנים בלבד.
 *
 * @param {string} path נתיב הפריט, אולי עם query
 * @param {{pathname: string, search: string}} location
 * @param {Set<string>} discriminators שמות הפרמטרים שאחים אחרים מבחינים לפיהם
 */
const isChildActive = (path, location, discriminators) => {
  const base = basePath(path);
  if (location.pathname !== base && !location.pathname.startsWith(`${base}/`)) return false;

  const want = queryOf(path);
  const have = new URLSearchParams(location.search);

  const wantKeys = [...want.keys()];
  if (wantKeys.length) return wantKeys.every((k) => have.get(k) === want.get(k));

  return [...discriminators].every((k) => !have.get(k));
};

/**
 * ענף בתפריט. רקורסיבי — ילד שיש לו `routes` משלו מרונדר על ידי אותו רכיב
 * ברמת הזחה עמוקה יותר, ולכן הוספת רמה שלישית אינה דורשת רכיב נוסף.
 */
const SidebarSubMenu = ({ route, depth = 0 }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { lang } = useContext(SidebarContext);
  const { apps } = useModules();

  const containsActive = useMemo(
    () =>
      collectPaths(route.routes).some(
        (p) => p && location.pathname.startsWith(basePath(p))
      ),
    [route.routes, location.pathname]
  );

  /** הפרמטרים שאחים בענף הזה נבדלים בהם — `source` תחת הזמנות, למשל. */
  const discriminators = useMemo(() => {
    const keys = new Set();
    for (const child of route.routes || []) {
      for (const k of queryOf(child.path).keys()) keys.add(k);
    }
    return keys;
  }, [route.routes]);

  const [open, setOpen] = useState(containsActive);

  // ניווט מבחוץ (חיפוש, סימנייה, redirect) פותח את הענף הנכון
  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  const isNested = depth > 0;

  return (
    <li className={`relative ${isNested ? "px-0 py-1" : "px-6 py-3"}`}>
      <button
        className={`flex gap-2 items-center justify-between focus:outline-none w-full font-semibold transition-colors duration-150 hover:text-mainColor ${
          isNested ? "text-sm text-gray-600 dark:text-gray-400" : "text-sm"
        } ${containsActive ? "text-mainColor" : ""}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex gap-2 items-center">
          {route.icon ? (
            <route.icon className={isNested ? "w-4 h-4" : "w-5 h-5"} aria-hidden="true" />
          ) : (
            <span className="text-xs text-gray-500">
              <IoRemoveSharp />
            </span>
          )}
          <span className="mt-1">{t(`${route.name}`)}</span>
          <span className="mt-1">
            {open ? (
              <IoChevronDownOutline />
            ) : (
              <IoChevronBackOutline className={lang == "en" ? "rotate-180" : ""} />
            )}
          </span>
        </span>
      </button>

      {open && (
        <ul
          className={`overflow-hidden font-medium text-gray-500 dark:text-gray-400 ${
            isNested
              ? "mt-1 ms-4 ps-2 border-s border-gray-300 dark:border-gray-700"
              : "mt-2 px-2 py-1 text-sm rounded-md dark:bg-gray-900 bg-gray-100"
          }`}
          aria-label="submenu"
        >
          {route.routes.map((child, i) => {
            if (child.routes) {
              return (
                <SidebarSubMenu key={child.name} route={child} depth={depth + 1} />
              );
            }

            /**
             * פריט שמופיע במבנה המוסכם ועדיין אין לו מסך.
             *
             * `span` ולא `NavLink` מושבת: קישור מושבת עדיין מקבל מיקוד מקלדת
             * ועדיין מוכרז כקישור על ידי קורא מסך, כלומר מבטיח יעד שאינו קיים.
             * `aria-disabled` מוסר את אותה אמירה גם למי שלא רואה את האפור.
             */
            if (child.disabled) {
              return (
                <li key={i + 1}>
                  <span
                    className="flex gap-1 items-center font-serif py-1 text-sm text-gray-400 dark:text-gray-600 cursor-not-allowed select-none"
                    aria-disabled="true"
                    title={t("ComingSoonHint")}
                  >
                    <span className="text-xs">
                      <IoRemoveSharp />
                    </span>
                    <span>{t(`${child.name}`)}</span>
                    <span className="ms-auto text-[10px] leading-none px-1.5 py-0.5 rounded-full whitespace-nowrap bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      {t("ComingSoonBadge")}
                    </span>
                  </span>
                </li>
              );
            }

            const outsideHref = resolveOutsideHref(child, apps);

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
                  (() => {
                    const active = isChildActive(child.path, location, discriminators);
                    return (
                      <NavLink
                        to={child.path}
                        className={`flex gap-1 items-center font-serif py-1 text-sm text-gray-600 hover:text-mainColor cursor-pointer ${
                          active ? "text-mainColor-dark font-bold" : ""
                        }`}
                        rel="noreferrer"
                      >
                        {active && (
                          <span
                            className="absolute inset-y-0 left-0 w-1 bg-mainColor rounded-tr-lg rounded-br-lg"
                            aria-hidden="true"
                          ></span>
                        )}
                        <span className="text-xs text-gray-500">
                          <IoRemoveSharp />
                        </span>
                        <span className="text-gray-500 hover:text-mainColor dark:hover:text-gray-200">
                          {t(`${child.name}`)}
                        </span>
                      </NavLink>
                    );
                  })()
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default SidebarSubMenu;
