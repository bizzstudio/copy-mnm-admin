// src/pages/Login.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Internal import
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import InputArea from "@/components/form/input/InputArea";
import Logo from "@/components/common/Logo";
import useLoginSubmit from "@/hooks/useLoginSubmit";
import CMButton from "@/components/form/button/CMButton";

const Login = () => {
  const { t } = useTranslation();
  const { onSubmit, register, handleSubmit, errors, loading } = useLoginSubmit();

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col w-full max-w-xl bg-white rounded-lg shadow-xl dark:bg-gray-800 overflow-hidden">
          {/* Hero Section - Logo */}
          <div className="flex justify-center p-6">
            <Logo size="lg" />
          </div>

          {/* Form Section */}
          <main className="flex items-center justify-center p-6 sm:p-8 md:p-12 md:pt-0 sm:pt-0 pt-0">
            <div className="w-full max-w-md">
              <h1 className="mb-6 text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 text-center">
                {t("Login")}
              </h1>
              <form onSubmit={handleSubmit(onSubmit)}>
                <LabelArea label="איימיל" />
                <InputArea
                  register={register}
                  defaultValue=""
                  label="Email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  placeholder="נא להכניס כתובת דואר אלקטרוני תקינה"
                />
                <Error errorName={errors.email} />
                <div className="mt-6"></div>
                <LabelArea label="סיסמה" />
                <InputArea
                  register={register}
                  defaultValue=""
                  label="Password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="***************"
                />
                <Error errorName={errors.password} />

                <CMButton
                  disabled={loading}
                  isLoading={loading}
                  type="submit"
                  className="rounded-md mt-4 h-12 w-full"
                >
                  {t("LoginTitle")}
                </CMButton>
              </form>

              <p className="mt-4 w-full text-end">
                <Link
                  className="text-sm font-medium text-mainColor dark:text-gray-300 hover:underline"
                  to="/forgot-password"
                >
                  {t("ForgotPassword")}
                </Link>
              </p>

              {/*
                The way out for BizzStudio.

                This screen is the fallback for the catch-all route and for
                `PrivateRoute`, so it is where you land on a hostname that
                belongs to no tenant — where it cannot possibly work. The
                submit handler already redirects on a 404, but only after
                someone has typed a password and pressed the button. A visible
                link means nobody has to fail first to find the right door.
              */}
              <p className="mt-2 w-full text-end">
                <Link
                  className="text-xs text-gray-400 dark:text-gray-500 hover:underline"
                  to="/platform/login"
                >
                  כניסת מנהלי פלטפורמה
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Login;