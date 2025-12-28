// src/App.jsx
import React, { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AccessibleNavigationAnnouncer from "@/components/AccessibleNavigationAnnouncer";
import PrivateRoute from "@/components/login/PrivateRoute";
import ThemeSuspense from "@/components/theme/ThemeSuspense";
const Layout = lazy(() => import("@/layout/Layout"));
const Login = lazy(() => import("@/pages/Login"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const ForgetPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

const App = () => {
  return (
    <>
      <ToastContainer />
      <Router>
        <AccessibleNavigationAnnouncer />
        <Suspense fallback={<ThemeSuspense />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
};

export default App;