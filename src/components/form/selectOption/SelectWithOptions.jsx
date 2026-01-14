// src/components/form/selectOption/SelectWithOptions.jsx
import React from "react";
import { Select } from "@windmill/react-ui";

const SelectWithOptions = ({
    options = [],
    value,
    onChange,
    placeholder,
    valueKey = "_id",
    labelKey = "name",
    multiple = false,
    disabled = false,
    className = "",
    hideEmptyOption = false,
    borderColor,
    ...props
}) => {
    const handleChange = (e) => {
        if (multiple) {
            const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
            onChange(selectedValues);
        } else {
            onChange(e.target.value);
        }
    };

    // עבור multiple select, value צריך להיות מערך
    // עבור single select, value צריך להיות string
    const selectedValue = multiple 
        ? (Array.isArray(value) ? value : []) 
        : (value || "");

    return (
        <Select
            value={selectedValue}
            onChange={handleChange}
            multiple={multiple}
            disabled={disabled}
            className={className}
            style={borderColor ? { borderColor } : {}}
            {...props}
        >
            {!multiple && !hideEmptyOption && (
                <option value="">
                    {placeholder}
                </option>
            )}
            {options?.map((option) => (
                <option
                    key={option[valueKey]}
                    value={option[valueKey]}
                >
                    {option[labelKey]}
                </option>
            ))}
        </Select>
    );
};

export default SelectWithOptions;