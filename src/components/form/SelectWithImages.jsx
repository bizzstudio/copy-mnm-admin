// SelectWithImages.jsx
import React, { useContext, useEffect } from 'react';
import Select, { components } from 'react-select';
import { WindmillContext } from "@windmill/react-ui";
import { FaUser } from 'react-icons/fa6';

// קומפוננטה מותאמת להצגת רשימת אפשרויות מוגבלת לפי maxResults
const CustomMenuList = (props) => {
    const { maxResults } = props.selectProps;
    let children = React.Children.toArray(props.children);
    if (maxResults && children.length > maxResults) {
        children = children.slice(0, maxResults);
    }
    return (
        <components.MenuList {...props}>
            {children}
        </components.MenuList>
    );
};

const SelectWithImages = ({
    placeholder,
    options,
    onChange,
    value,
    icon = <FaUser size={12} />,
    disabled,
    isRequired = false,  // ✅ דרישת חובה
    error,
    maxResults, // הגבלת מספר התוצאות
    register,
    name,
    isClearable = true,
    hideDropdownIndicator = false,  // האם להסתיר את לחצן פתיחת האפשרויות
}) => {
    const { mode } = useContext(WindmillContext);

    const handleChange = (selectedOption) => {
        if (register) {
            register.onChange({ target: { name, value: selectedOption ? selectedOption.value : "" } });
        }
        onChange?.(selectedOption);
    };

    // קומפוננטה להצגת התמונה ליד שם האופציה בתפריט הבחירה
    const CustomOption = (props) => (
        <components.Option {...props}>
            <div className="flex items-center gap-2 p-1">
                {/* תמונה */}
                {props.data.image ? (
                    <img
                        src={props.data.image}
                        alt={props.data.label}
                        className="w-6 h-6 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {props.data.icon || icon}
                    </div>
                )}
                {props.data.label}
            </div>
        </components.Option>
    );

    // קומפוננטה להצגת האופציה הנבחרת עם תמונה
    const CustomSingleValue = ({ data }) => (
        <div className="flex items-center gap-2 p-1">
            {data.image ? (
                <img
                    src={data.image}
                    alt={data.label}
                    className="w-6 h-6 rounded-full object-cover"
                />
            ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    {data.icon || icon}
                </div>
            )}
            {data.label}
        </div>
    );

    // שימוש ב-useEffect כדי להסתיר את ה-input אם יש ערך נבחר
    useEffect(() => {
        const inputElements = document.querySelectorAll("[id^='react-select-'][id$='-input']");
        inputElements.forEach(inputElement => {
            inputElement.style.position = "absolute";
            inputElement.style.left = value ? "0" : "auto";
        });
    }, [value]); // יופעל בכל פעם שהערך משתנה

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? 'var(--main-color)' : provided.borderColor,
            minHeight: '46px',
            backgroundColor: state.isDisabled
                ? (mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(209 213 219)') // צבע רקע כשמושבת
                : (mode === 'dark' ? '#374151' : '#f3f4f6'),
            color: mode === 'dark' ? '#D1D5DB' : provided.color,
            boxShadow: state.isFocused ? `0 0 0 1px var(--main-color)` : provided.boxShadow,
            outline: 'none',
            border: state.isDisabled
                ? '1px solid rgb(156 163 175)' // צבע רקע כשמושבת
                : (mode === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb'),
            '&:hover': {
                borderColor: state.isFocused ? 'var(--main-color)' : mode === 'dark' ? 'var(--main-color)' : provided.borderColor,
            },
            cursor: state.isDisabled ? 'not-allowed' : 'default',
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '46px',
            padding: '0 6px',
            overflow: 'auto',
        }),
        option: (provided, state) => ({
            ...provided,
            padding: '3px 10px',
            backgroundColor: mode === 'dark'
                ? state.isFocused ? '#334155' : '#1F2937'
                : state.isFocused ? 'var(--main-color-super-light)' : provided.backgroundColor,
            color: mode === 'dark' ? '#D1D5DB' : state.isFocused ? '#000' : provided.color,
        }),
        placeholder: (provided) => ({
            ...provided,
            fontSize: '14px',
            color: mode === 'dark' ? '#d1d5db' : '#000',
            fontWeight: '400',
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }), // הכי חשוב!
    };

    return (
        <div className={`relative ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
            <Select
                placeholder={placeholder}
                options={options}// מעבירים את כל האופציות לצורך חיפוש
                components={{
                    Option: CustomOption,
                    SingleValue: CustomSingleValue,
                    MenuList: CustomMenuList, // משתמשים ב-CustomMenuList להגבלת התצוגה
                    DropdownIndicator: hideDropdownIndicator ? null : components.DropdownIndicator,
                }}
                onChange={handleChange}
                isClearable={isClearable} // מאפשר הסרה של הערך הנבחר ע״י אייקון X
                isSearchable={!value} // לא מאפשר חיפוש אם יש ערך (value) נבחר
                closeMenuOnSelect
                hideSelectedOptions={false}
                styles={customStyles}
                menuPlacement="auto"
                value={value}
                isDisabled={disabled}
                maxResults={maxResults} // מועבר כ-prop ל-select, וזמין ב-selectProps
                menuPortalTarget={document.body}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>
    );
};

export default SelectWithImages;