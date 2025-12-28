// form/input/InputArea.jsx
import React, { useContext, useEffect } from "react";
import { Input, Label } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { SidebarContext } from "@/context/SidebarContext";
import { notifyError } from "@/utils/toast";

const InputArea = ({
  name,
  label,
  type,
  step,
  Icon,
  iconDir,
  register,
  defaultValue,
  autocomplete,
  placeholder,
  onChange = () => { },
  isRequired = true,
  min,
  max,
  props
}) => {

  const { t } = useTranslation();
  const { lang } = useContext(SidebarContext);
  const currentLang = lang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    const input = document.getElementById(name);
    if (input) {
      input.addEventListener('animationstart', (e) => {
        if (e.animationName === 'onAutoFillStart') {
          // Trigger onChange event with the current value
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        }
      });
    }
  }, [name]);

  return (
    <>
      <Label label={label} htmlFor={name} />
      <div className="relative">
        {Icon && (
          <div className={`absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none`}>
            <span className="text-gray-300 dark:text-gray-400 focus-within:text-gray-900 sm:text-base">
              {Icon}
            </span>
          </div>
        )}
        <Input
          {...props}
          id={name}
          dir={currentLang}
          {...register(name, {
            required: isRequired ? `${t(label)} ${t("isRequired")}!` : false,
            valueAsNumber: type === "number",
            min: min !== undefined ? { value: min, message: t("minValue", { min }) } : undefined,
            max: max !== undefined ? { value: max, message: t("maxValue", { max }) } : undefined,
          })}
          type={type}
          step={type === "number" ? 'any' : undefined}
          inputMode={type === "number" ? "decimal" : undefined} // ✅ מקלדת מספרית בסמארטפונים
          pattern={type === 'tel' ? '[0-9]*' : undefined} // אפשור של מספרים בלבד
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete={autocomplete}
          onChange={(e) => {
            const value = type === "number" ? parseFloat(e.target.value) : e.target.value;

            // בדיקת מינימום ומקסימום עבור שדות מספר
            if (type === "number" && !isNaN(value)) {
              if (min !== undefined && value < min) {
                notifyError(t("minValue", { min }));
              }
              if (max !== undefined && value > max) {
                notifyError(t("maxValue", { max }));
              }
            }

            register(name).onChange(e);
            onChange(e);
          }}
          className={
            Icon
              ? `py-2 px-4 md:px-5 ${iconDir === 'right' ? 'pr-9' : iconDir === 'left' ? 'pl-10' : 'pe-10'}`
              : "py-2 px-4 md:px-5"
          }
        />
      </div>
    </>
  );
};

export default InputArea;