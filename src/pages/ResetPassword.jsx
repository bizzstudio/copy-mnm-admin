// src/pages/ResetPassword.jsx
import { Input } from "@windmill/react-ui";
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";

// Internal import
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import AdminServices from "@/services/AdminServices";
import logo from "/logo.png";
import notifyApiResponse from "@/utils/notifyApiResponse";
import CMButton from "@/components/form/button/CMButton";
import { t } from "i18next";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const password = useRef("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  password.current = watch("newPassword");

  const submitHandler = ({ newPassword }) => {
    setLoading(true);

    AdminServices.resetPassword({ newPassword, token })
      .then((res) => {
        setLoading(false);
        notifyApiResponse(res, true);
        // Navigate to login page after successful password reset
        navigate("/login", { replace: true });
      })
      .catch((err) => {
        setLoading(false);
        notifyApiResponse(err, false);
      });
  };

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex flex-col overflow-y-auto md:flex-row">
          <div className="w-full md:h-auto md:w-1/2 flex flex-col items-center justify-center md:ps-12 md:pe-2 md:pt-0 pt-10 px-6">
            <img
              aria-hidden="true"
              className="object-contain w-full h-full md:max-w-none max-w-[150px]"
              src={logo}
              alt="Logo"
            />
          </div>
          <main className="flex items-center justify-center p-6 md:p-12 md:w-1/2">
            <div className="w-full">
              <h1 className="mb-3 text-2xl font-semibold text-gray-700 dark:text-gray-200 md:text-start text-center">
                {t("ResetPassword")}
              </h1>

              <form onSubmit={handleSubmit(submitHandler)}>
                <LabelArea label={t("Password")} />
                <Input
                  label={t("Password")}
                  name="newPassword"
                  type="password"
                  autocomplete="current-password"
                  placeholder="*************"
                  {...register("newPassword", {
                    required: "You must specify a password",
                    minLength: {
                      value: 8,
                      message: "Password must have at least 8 characters",
                    },
                  })}
                />
                <Error errorName={errors.newPassword} />
                <div className="mt-6"></div>
                <LabelArea label={t("ConfirmPassword")} />
                <Input
                  label={t("ConfirmPassword")}
                  name="confirm_password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="*************"
                  {...register("confirm_password", {
                    validate: (value) =>
                      value === password.current ||
                      "The passwords do not match",
                  })}
                />
                <Error errorName={errors.confirm_password} />

                <CMButton
                  disabled={loading}
                  type="submit"
                  className="rounded-md mt-4 h-12 w-full"
                >
                  {t("Reset")}
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
    </div>
  );
};

export default ResetPassword;
