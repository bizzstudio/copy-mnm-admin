import { Select } from "@windmill/react-ui";
import { t } from "i18next";
import React from "react";
// import { CODES } from 'currencies-map';

const SelectProductLimit = ({ register, name, label, required }) => {
  return (
    <>
      <Select
        name={name}
        {...register(`${name}`, {
          required: required ? false : `${label} is required!`,
        })}
      >
        <option value="" defaultValue hidden>
          {t("Select Products Limit")}
        </option>
        <option value="6">6</option>
        <option value="12">12</option>
        <option value="18">18</option>
        <option value="24">24</option>
      </Select>
    </>
  );
};
export default SelectProductLimit;