// src/components/form/SelectReactSelect.jsx
import React, { useContext } from 'react';
import Select, { components } from 'react-select';
import { WindmillContext } from "@windmill/react-ui";
import { FaUser } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';

const SelectReactSelect = ({
    placeholder,
    options,
    onChange,
    value,
    images = true,
    isSearchable = false,
    minWidth = 200,
    isLoading = false
}) => {
    const { mode } = useContext(WindmillContext);
    const { t } = useTranslation();

    // קומפוננטת עיצוב מותאמת אישית להצגת התמונה ליד שם המשתמש
    const CustomOption = (props) => (
        <components.Option {...props}>
            {images ?
                <div className="flex items-center gap-2 p-1">
                    {/* תמונה */}
                    {props.data.image ? (
                        <img
                            src={props.data.image}
                            alt={props.data.label}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                            <FaUser size={12} />
                        </div>
                    )}
                    {props.data.label}
                </div> :
                <>{props.data.label}</>
            }
        </components.Option>
    );

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? 'var(--main-color)' : provided.borderColor,
            minHeight: '46px',
            backgroundColor: mode === 'dark' ? '#374151' : "#f3f4f6",
            color: mode === 'dark' ? '#D1D5DB' : provided.color,
            boxShadow: state.isFocused ? `0 0 0 1px var(--main-color)` : provided.boxShadow,
            outline: 'none',
            border: mode === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
            '&:hover': {
                borderColor: state.isFocused ? 'var(--main-color)' : mode === 'dark' ? 'var(--main-color)' : provided.borderColor,
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            minHeight: '46px', // גובה מינימלי
            maxHeight: '122px', // גובה אוטומטי
            height: 'auto', // גובה אוטומטי
            padding: '6px', // padding אחיד
            overflow: 'auto',
            flexWrap: 'wrap', // מאפשר מעבר לשורה חדשה
            // alignItems: 'flex-start', // יישור למעלה
        }),
        option: (provided, state) => ({
            ...provided,
            padding: '3px 10px',
            backgroundColor: mode === 'dark'
                ? state.isFocused ? '#334155' : '#1F2937'
                : state.isFocused ? 'var(--main-color-super-light)' : provided.backgroundColor,
            color: mode === 'dark' ? '#D1D5DB' : state.isFocused ? '#000' : provided.color,
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: mode === 'dark' ? '#4B5563' : '#E5E7EB',  // צבע רקע של הערך הנבחר
            borderRadius: '6px',
            padding: '3px 8px',
            marginRight: '5px',
            marginBottom: '2px', // מרווח בין שורות
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: mode === 'dark' ? '#F3F4F6' : '#374151',  // צבע טקסט של הערך הנבחר
            fontWeight: '500',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: mode === 'dark' ? '#F3F4F6' : '#374151',
            '&:hover': {
                backgroundColor: 'var(--main-color)',
                color: '#fff',
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            fontSize: '14px',  // שינוי גודל הטקסט של ה-placeholder
            color: mode === 'dark' ? '#d1d5db' : '#000',  // שינוי צבע ה-placeholder
            fontWeight: '400',
        }),
        menuPortal: (base) => ({ ...base, zIndex: 100 }), // הוספת z-index גבוה
        menu: (provided) => ({
            ...provided,
            backgroundColor: mode === 'dark' ? '#1F2937' : '#fff',
            border: mode === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
            boxShadow: mode === 'dark'
                ? '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.3)'
                : provided.boxShadow,
            zIndex: 100,
        }),
        menuList: (provided) => ({
            ...provided,
            backgroundColor: mode === 'dark' ? '#1F2937' : '#fff',
            paddingTop: 0,
            paddingBottom: 0,
            maxHeight: 240,
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            backgroundColor: mode === 'dark' ? '#1F2937' : '#fff',
            color: mode === 'dark' ? '#D1D5DB' : '#374151',
        }),
        input: (provided) => ({
            ...provided,
            color: mode === 'dark' ? '#D1D5DB' : '#374151',
        }),
    };

    return (
        <Select
            placeholder={placeholder}
            isMulti={false}
            options={options}
            components={{ Option: CustomOption }}
            onChange={onChange}
            closeMenuOnSelect={true}
            styles={customStyles}
            menuPlacement='auto'
            value={value}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            isSearchable={isSearchable}
            isLoading={isLoading}
            noOptionsMessage={() => t('noOptionsMessage')}
        />
    );
};

export default SelectReactSelect;
