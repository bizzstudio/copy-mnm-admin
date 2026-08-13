// src/hooks/useLoginSubmit.js
import Cookies from "js-cookie";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

// Internal import
import { AdminContext } from "@/context/AdminContext";
import AdminServices from "@/services/AdminServices";
import { notifySuccess, notifyError } from "@/utils/toast";
import { removeSetting } from "@/reduxStore/slice/settingSlice";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { t } from "i18next";

const useLoginSubmit = () => {
  const reduxDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(AdminContext);
  const navigate = useNavigate();
  const location = useLocation();
  const lang = Cookies.get("i18next");

  /**
   * A 404 from a sign-in call does not mean "wrong password". It means THIS
   * HOSTNAME BELONGS TO NO TENANT, so a tenant sign-in cannot succeed on it
   * whatever is typed.
   *
   * The platform's own address is deliberately registered to no customer, and
   * this screen is what BOTH the catch-all route and `PrivateRoute` fall back
   * to — so anyone who opens the admin there lands on a form that can only
   * fail, retypes the password, fails again, and has nothing on the page
   * suggesting a way out. The only sign-in that works on a tenant-less host is
   * the platform one, so go there rather than reporting an error.
   *
   * @returns {boolean} whether it handled the error and the caller should stop.
   */
  const goToPlatformIfNoTenant = (err) => {
    if (err?.response?.status !== 404) return false;
    navigate("/platform/login", { replace: true });
    return true;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rememberDevice: true,
    }
  });

  const onSubmit = ({
    name,
    email,
    verifyEmail,
    password,
    role,
    mfaCode,
    rememberDevice,
  }) => {
    setLoading(true);
    const cookieTimeOut = 30;
    // return;

    if (location.pathname === "/login") {
      reduxDispatch(removeSetting("globalSetting"));
      const trustedToken = Cookies.get("trustedDevice");

      AdminServices.loginAdmin({ email, password, trustedToken })
        .then((res) => {
          setLoading(false);

          // 1) אם אימות דו שלבי נדרש – ננווט למסך הקוד
          if (res?.step === 'mfa_required' && res?.tempToken) {
            navigate("/mfa", { state: { tempToken: res.tempToken } });
            return;
          }

          // 2) אם דילגנו על האימות דו שלבי (מכשיר מוכר) – מתנהגים כמו היום
          if (res?.token) {
            notifyApiResponse(res, true);
            dispatch({ type: "USER_LOGIN", payload: res });
            Cookies.set("adminInfo", JSON.stringify(res), {
              expires: cookieTimeOut,
              sameSite: "Lax",
              secure: false,
            });
            navigate("/dashboard", { replace: true });
            window.location.reload();
          }
        })
        .catch((err) => {
          if (goToPlatformIfNoTenant(err)) return setLoading(false);
          notifyApiResponse(err, false);
          setLoading(false);
        });
    }

    // טיפול באימות דו שלבי
    if (location.pathname === "/mfa") {
      const { tempToken } = location.state || {};

      if (!tempToken) {
        notifyError(t("InvalidSessionError"));
        navigate("/login", { replace: true });
        setLoading(false);
        return;
      }

      if (!mfaCode || mfaCode.length !== 6) {
        notifyError(t("InvalidCodeError"));
        setLoading(false);
        return;
      }

      AdminServices.verifyMfa({
        tempToken,
        code: mfaCode,
        rememberDevice: rememberDevice || false,
      })
        .then((res) => {
          setLoading(false);

          if (res?.trustedToken) {
            Cookies.set("trustedDevice", res.trustedToken, {
              expires: 30,
              sameSite: "Lax",
              secure: false,
            });
          }

          if (res?.token) {
            notifySuccess(t("MFASuccess"));
            dispatch({ type: "USER_LOGIN", payload: res });
            Cookies.set("adminInfo", JSON.stringify(res), {
              expires: cookieTimeOut,
              sameSite: "Lax",
              secure: false,
            });
            navigate("/dashboard", { replace: true });
            window.location.reload();
          }
        })
        .catch((err) => {
          if (goToPlatformIfNoTenant(err)) return setLoading(false);
          notifyApiResponse(err, false);
          setLoading(false);
        });
    }

    if (location.pathname === "/signup") {
      AdminServices.registerAdmin({ name, email, password, role })
        .then((res) => {
          if (res) {
            setLoading(false);
            notifySuccess("Register Success!");
            dispatch({ type: "USER_LOGIN", payload: res });
            Cookies.set("adminInfo", JSON.stringify(res), {
              expires: cookieTimeOut,
              sameSite: "Lax",
              secure: false,
            });
            navigate("/", { replace: true });
          }
        })
        .catch((err) => {
          if (goToPlatformIfNoTenant(err)) return setLoading(false);
          notifyApiResponse(err, false);
          setLoading(false);
        });
    }

    if (location.pathname === "/forgot-password") {
      AdminServices.forgetPassword({ verifyEmail, language: lang || "he" })
        .then((res) => {
          setLoading(false);
          notifyApiResponse(res, true);
        })
        .catch((err) => {
          setLoading(false);
          notifyApiResponse(err, false);
        });
    }
  };
  // פונקציה לטיפול בחזרה ללוגין מעמוד MFA
  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  return {
    onSubmit,
    register,
    handleSubmit,
    errors,
    loading,
    handleBackToLogin,
  };
};

export default useLoginSubmit;