// src/pages/ForgotPassword.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Internal import
import Error from "@/components/form/others/Error";
import useLoginSubmit from "@/hooks/useLoginSubmit";
import LabelArea from "@/components/form/selectOption/LabelArea";
import InputArea from "@/components/form/input/InputArea";
import Logo from "@/components/common/Logo";
import CMButton from "@/components/form/button/CMButton";

const ForgotPassword = () => {
  const {
    onSubmit,
    register,
    handleSubmit,
    errors,
    loading,
  } = useLoginSubmit();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col w-full max-w-xl bg-white rounded-lg shadow-xl dark:bg-gray-800 overflow-hidden">
        {/* Hero Section - Logo */}
        <div className="flex justify-center p-6">
            <Logo size="lg" />
          </div>

        {/* Form Section */}
        <main className="flex items-center justify-center p-6 sm:p-8 md:p-12 md:pt-0 sm:pt-0 pt-0">
          <div className="w-full max-w-md">
            <h1 className="mb-3 text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 text-center">
              {t("ForgotPasswordText")}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)}>
              <LabelArea label={t("Email")} />
              <InputArea
                register={register}
                label="Email"
                name="verifyEmail"
                type="text"
                placeholder="example@gmail.com"
              />
              <Error errorName={errors.verifyEmail} />

              <CMButton
                disabled={loading}
                isLoading={loading}
                type="submit"
                className="rounded-md mt-4 h-12 w-full"
              >
                {t("RecoverpasswordBtn")}
              </CMButton>
            </form>
            <p className="mt-4 w-full text-end">
              <Link
                className="text-sm font-medium text-mainColor dark:text-gray-300 hover:underline"
                to="/login"
              >
                {t("AlreadyAccount")}
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ForgotPassword;