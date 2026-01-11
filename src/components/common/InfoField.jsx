// src/components/common/InfoField.jsx
import React from "react";

const InfoField = ({ label, value, className = "" }) => (
    <div className={`flex flex-col ${className}`}>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
            {label}
        </span>
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {value || "-"}
        </span>
    </div>
);

export default InfoField;