// src/App.jsx
import React, { lazy, Suspense, useContext, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PrivateRoute from "@/components/login/PrivateRoute";
import Loading from "./components/preloader/Loading";
import { AdminContext } from "./context/AdminContext";
import routes from "./routes";
import { SidebarContext } from "./context/SidebarContext";

const Layout = lazy(() => import("@/layout/Layout"));
const Login = lazy(() => import("@/pages/Login"));
// const SignUp = lazy(() => import("@/pages/SignUp"));
const ForgetPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const MFA = lazy(() => import("@/pages/MFA"));
const Page404 = lazy(() => import("@/pages/404"));

const App = () => {
  const { lang } = useContext(SidebarContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;

  // set app dir by changing html dir
  useEffect(() => {
    // הגדרת כיוון RTL לעברית כברירת מחדל
    if (lang === "he") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, [lang]);

  return (
    <>
      <ToastContainer />
      <Router>
        <Suspense fallback={<Loading />}>

          <Routes>
            {/* בדיקה אם המשתמש מחובר */}
            <Route
              path="/"
              element={
                adminInfo?.email ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />

            <Route
              path="/login"
              element={
                adminInfo?.email ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />
            {/* <Route path="/signup/:id" element={<SignUpUserChallenge />} /> */}
            {/* <Route path="/signup" element={<SignUp />} /> */}
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/mfa" element={<MFA />} />

            {/* נתיב פרטי עם נתיבים מקוננים */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >

              {routes.map((route, i) => (
                <Route
                  key={i}
                  path={route.path}
                  element={<route.component />}
                />
              ))}

              <Route path="*" element={<Page404 />} />
            </Route>

            {/* הפנייה במקרה של נתיב שגוי */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
};

export default App;