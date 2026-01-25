// src/components/customer/DocumentTypeBadges.jsx
import React from "react";

/**
 * קומפוננטת badges לסינון מסמכים לפי סוג
 * מציגה badge לכל סוג מסמך - השרת מחזיר כבר את קבוצת "all" בתחילת המערך
 */
const DocumentTypeBadges = ({ groups, selectedType, onTypeSelect }) => {
    // השרת מחזיר את קבוצת "all" כבר בתחילת המערך, אז פשוט משתמשים ב-groups כמו שהם
    const allTypes = groups || [];

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {allTypes.map((type) => {
                const isSelected = selectedType === type.document_type ||
                    (selectedType === null && type.document_type === "all");

                return (
                    <button
                        key={type.document_type}
                        onClick={() => onTypeSelect(type.document_type)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                            ${isSelected
                                ? 'bg-mainColor text-white shadow-md'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }
                        `}
                    >
                        {type.document_type_name}
                        {type.count !== undefined && (
                            <span className={`ms-2 px-2 py-0.5 rounded-full text-xs ${isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                                }`}>
                                {type.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default DocumentTypeBadges;