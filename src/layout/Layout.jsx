// src/layout/Layout.jsx
import React, { useContext, Suspense, useEffect, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Internal import
import Main from "@/layout/Main";
import routes from "@/routes/index";
import Header from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { SidebarContext } from "@/context/SidebarContext";
import ThemeSuspense from "@/components/theme/ThemeSuspense";
const Page404 = lazy(() => import("@/pages/404"));

const Layout = () => {
  const { isSidebarOpen, closeSidebar, navBar } = useContext(SidebarContext);
  let location = useLocation();

  const isOnline = navigator.onLine;

  // console.log('routes',routes)

  useEffect(() => {
    closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <>
      {!isOnline && (
        <div className="flex justify-center bg-red-600 text-white">
          You are in offline mode!{" "}
        </div>
      )}
      <div
        className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isSidebarOpen && "overflow-hidden"
          }`}
      >
        {navBar && <Sidebar />}

        <div className="flex flex-col flex-1 w-full">
          <Header />
          <Main>
            <Suspense fallback={<ThemeSuspense />}>
              <Routes>
                {routes.map((route, i) => {
                  return route.component ? (
                    <Route
                      key={i}
                      path={route.path}
                      element={<route.component />}
                    />
                  ) : null;
                })}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Page404 />} />
              </Routes>
            </Suspense>
          </Main>
        </div>
      </div>
    </>
  );
};

export default Layout;