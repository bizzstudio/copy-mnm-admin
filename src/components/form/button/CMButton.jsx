// src/components/form/button/CMButton.jsx
import React from "react";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import { t } from "i18next";
import { Button } from "@windmill/react-ui";

const CMButton = ({
  type = "button",
  onClick,
  className = "",
  isLoading = false,
  loadingText = t("Processing"),
  children,
  disabled = false,
}) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${className} ${isLoading || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLoading && <img src={spinnerLoadingImage} className="saturate-0" alt="Loading" width={22} height={22} />}
      <span className="font-serif font-light text-sm text-white">
        {isLoading ? loadingText : children}
      </span>
    </Button>
  );
};

export default CMButton;