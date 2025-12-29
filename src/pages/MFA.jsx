// src/pages/MFA.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@windmill/react-ui";

// Internal import
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import logo from "/logo.png";
import useLoginSubmit from "@/hooks/useLoginSubmit";
import CMButton from "@/components/form/button/CMButton";

const MFA = () => {
    const { t } = useTranslation();
    const {
        onSubmit,
        register,
        handleSubmit,
        errors,
        loading,
        handleBackToLogin
    } = useLoginSubmit();
    const nav = useNavigate();
    const { state: navState } = useLocation(); // מצפה ל-{ tempToken }

    // בדיקה אם יש tempToken, אם לא - הפניה ללוגין
    useEffect(() => {
        if (!navState?.tempToken) {
            nav("/login", { replace: true });
        }
    }, [navState?.tempToken, nav]);

    return (
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col w-full max-w-xl bg-white rounded-lg shadow-xl dark:bg-gray-800 overflow-hidden">
                {/* Hero Section - Logo */}
                <img
                    aria-hidden="true"
                    className="object-contain sm:w-3/5 h-auto mx-auto p-6"
                    src={logo}
                    alt="Logo"
                />
                
                {/* Form Section */}
                <main className="flex items-center justify-center p-6 sm:p-8 md:p-12 md:pt-0 sm:pt-0 pt-0">
                    <div className="w-full max-w-md">
                        <h1 className="mb-3 text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 text-center">
                            {t("MFAVerification")}
                        </h1>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <LabelArea label={t("MFAInstructions")} className="text-center" />
                            <Input
                                {...register("mfaCode", {
                                    required: t("VerificationCodeRequired"),
                                    minLength: {
                                        value: 6,
                                        message: t("VerificationCodeMinLength")
                                    },
                                    maxLength: {
                                        value: 6,
                                        message: t("VerificationCodeMaxLength")
                                    },
                                    pattern: {
                                        value: /^\d{6}$/,
                                        message: t("VerificationCodePattern")
                                    },
                                    onChange: (e) => {
                                        // הגבלה לספרות בלבד
                                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    }
                                })}
                                label="MFA Code"
                                name="mfaCode"
                                type="text"
                                placeholder={t("VerificationCode")}
                                maxLength={6}
                                inputMode="numeric"
                                className="mt-1"
                            />
                            <Error errorName={errors.mfaCode} />

                            <div className="mt-2">
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        {...register("rememberDevice")}
                                        className="rounded border-gray-300 text-mainColor focus:ring-mainColor"
                                    />
                                    {t("RememberDevice")}
                                </label>
                            </div>

                            <CMButton
                                disabled={loading}
                                isLoading={loading}
                                type="submit"
                                className="rounded-md mt-2 h-12 w-full"
                            >
                                {t("Verify")}
                            </CMButton>
                        </form>

                        <p className="mt-4 w-full text-center text-sm text-gray-600 dark:text-gray-400">
                            {t("MFATimeout")}
                        </p>

                        <div className="mt-4 w-full text-center">
                            <button
                                type="button"
                                onClick={handleBackToLogin}
                                className="text-sm font-medium text-mainColor dark:text-gray-300 hover:underline"
                            >
                                {t("BackToLogin")}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MFA;
