// src/layout/Layout.jsx
import React, { useContext, useEffect } from "react";
import { useLocation, Outlet, matchPath } from "react-router-dom";

// internal imports
import Main from "@/layout/Main";
import routes from "@/routes/index";
import Sidebar from "@/components/sidebar/Sidebar";
import SidebarToggle from "@/components/sidebar/SidebarToggle";
import { SidebarContext } from "@/context/SidebarContext";
import { t } from "i18next";

const Layout = () => {
  const { closeSidebar, navBar, pageTitle } = useContext(SidebarContext);
  const location = useLocation();

  const isOnline = navigator.onLine;

  useEffect(() => {
    closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    if (pageTitle) {
      document.title = `${t(pageTitle)} | BizzExpo`;
      return;
    }
    const currentRoute = routes.find(route =>
      matchPath({ path: route.path, end: true }, location.pathname)
    );
    if (currentRoute?.title) {
      document.title = `${t(currentRoute.title)} | BizzExpo`;
    } else {
      document.title = "BizzExpo";
    }
  }, [pageTitle, location.pathname]);

  return (
    <>
      {!isOnline && (
        <div className="flex justify-center bg-red-600 text-white">
          You are in offline mode!
        </div>
      )}
      <div className="w-full flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <SidebarToggle />

        <div
          className={`flex flex-col w-full overflow-auto transition-all duration-300 ease-in-out ${navBar ? 'lg:ms-64' : 'lg:ms-0'
            }`}
        >
          <Main>
            <Outlet />
          </Main>
        </div>
      </div>
    </>
  );
};

export default Layout;