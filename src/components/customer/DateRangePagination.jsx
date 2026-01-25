// src/components/customer/DateRangePagination.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

// Internal import
import { getDateRangeByPage } from "@/utils/dateUtils";

/**
 * קומפוננטת פג'יניישן לפי טווחי תאריכים של 6 חודשים
 * כל "עמוד" הוא טווח של 6 חודשים
 */
const DateRangePagination = ({ currentPage, onPageChange, totalPages }) => {
    const { t } = useTranslation();

    // חישוב טווח התאריכים הנוכחי עם label לתצוגה
    const currentRange = getDateRangeByPage(currentPage, { includeLabel: true });

    return (
        <nav
            role="navigation"
            aria-label={t("DateRange")}
            className="flex flex-col justify-between text-xs sm:flex-row text-gray-600 dark:text-gray-400 mt-4"
            dir="rtl"
        >
            {/* מידע על הטווח הנוכחי */}
            <div className="flex items-center mb-2 sm:mb-0">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{t("DateRange")}: </span>
                    {currentRange.label}
                </span>
            </div>

            {/* כפתורי ניווט */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5 ms-auto">
                    {/* כפתור חדש יותר */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-[1px] focus:ring-mainColor focus:border-mainColor disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label={t("Newer")}
                    >
                        <BiChevronRight className="h-4 w-4" />
                        <span>{t("Newer")}</span>
                    </button>

                    {/* מידע על העמוד הנוכחי */}
                    <div className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                        {t("Page")} {currentPage + 1} {t("Of")} {totalPages}
                    </div>

                    {/* כפתור ישן יותר */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-[1px] focus:ring-mainColor focus:border-mainColor disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 ${currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label={t("Older")}
                    >
                        <span>{t("Older")}</span>
                        <BiChevronLeft className="h-4 w-4" />
                    </button>
                </div>
            )}
        </nav>
    );
};

export default DateRangePagination;