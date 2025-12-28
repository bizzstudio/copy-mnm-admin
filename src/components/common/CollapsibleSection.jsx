// CollapsibleSection.jsx
import React, { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

// קומפוננטה כללית להצגת כותרת עם אייקון (אופציונלי) ואזור תוכן נסגר/נפתח עם אנימציה.
export default function CollapsibleSection({
    title, // כותרת הסקשן
    icon, // אייקון להצגה לצד הכותרת (אופציונלי)
    defaultOpen = false, // האם לפתוח את הסקשן כברירת מחדל
    children, // תוכן פנימי שיוצג כאשר הסקשן פתוח
    style = {}
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // 🆕 useEffect לעדכון isOpen כאשר defaultOpen משתנה
    useEffect(() => {
        if (defaultOpen) {
            setIsOpen(defaultOpen);
        }
    }, [defaultOpen]);

    const toggleOpen = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <div style={{ marginBottom: "16px", ...style }}>
            {/* כותרת + חץ */}
            <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={toggleOpen}
            >
                {/* כותרת עם אייקון (אופציונלי) */}
                <div className="inline-flex gap-1.5 text-xl text-gray-800 font-semibold dark:text-gray-400">
                    {icon}
                    {title}
                </div>

                {/* חץ */}
                <button
                    type="button"
                    className={`transform transition-transform duration-500 dark:text-gray-400 ${isOpen ? "rotate-180" : ""}`}
                >
                    <FiChevronDown size={24} />
                </button>
            </div>
            <hr className="mb-2.5" />

            {/* תוכן קורס/נפתח */}
            <div
                className={`overflow-hidden p-1 transition-all ease-in-out ${isOpen
                    ? "max-h-[100rem] duration-700" // max-h גדול כדי להכיל תוכן ארוך + מעבר
                    // ? "max-h-[100rem] overflow-y-auto scrollbar-none duration-700" // max-h גדול כדי להכיל תוכן ארוך + מעבר
                    : "max-h-0 duration-300"
                    }`}
            >
                {children}
            </div>
        </div>
    );
};