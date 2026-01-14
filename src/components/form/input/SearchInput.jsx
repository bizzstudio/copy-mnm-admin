// src/components/form/input/SearchInput.jsx
import React, { useState, useEffect, forwardRef } from "react";
import { Input } from "@windmill/react-ui";
import { FiSearch, FiX } from "react-icons/fi";

const SearchInput = forwardRef(({
    placeholder = "Search...",
    onSubmit = () => { },
    onReset = () => { },
    name = "search",
    className = "",
    showReset = false,
    ...props
}, ref) => {
    const [hasValue, setHasValue] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const handleReset = (e) => {
        e.preventDefault();
        if (ref && ref.current) {
            ref.current.value = '';
            setHasValue(false);
        }
        onReset(e);
        // Submit the form with empty value to reset results
        onSubmit(e);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setHasValue(value.length > 0);
        // Update ref value if controlled
        if (ref && ref.current && props.value === undefined) {
            ref.current.value = value;
        }
        if (props.onChange) {
            props.onChange(e);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit(e);
        }
    };

    // Check initial value
    useEffect(() => {
        if (ref && ref.current) {
            setHasValue(ref.current.value.length > 0);
        }
    }, []);

    return (
        <div className={`relative w-full ${className}`}>
            <div className="relative">
                {/* Search Icon Button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="absolute inset-y-0 start-0 ps-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                    <FiSearch size={18} />
                </button>

                {/* Input */}
                <Input
                    ref={ref}
                    type="text"
                    name={name}
                    placeholder={placeholder}
                    className="w-full ps-10 pe-10 py-2.5 text-sm"
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    {...props}
                />

                {/* Reset Button - only show when there's content */}
                {(hasValue || showReset) && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                        <FiX size={18} />
                    </button>
                )}
            </div>
        </div>
    );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;