// src/components/table/CustomPagination.jsx
import React from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { t } from "i18next";
import spinnerLoadingImage from "@/assets/img/spinner.gif";

const CustomPagination = ({
  className = "",
  totalResults,
  resultsPerPage,
  onChange,
  label,
  currentPage = 1,
  isRTL = true, // Default to RTL for Hebrew
  loading = false,
  ...props
}) => {
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startItem = (currentPage - 1) * resultsPerPage + 1;
  const endItem = Math.min(currentPage * resultsPerPage, totalResults);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label={label || t("Table navigation")}
      className={`flex flex-col justify-between text-xs sm:flex-row text-gray-600 dark:text-gray-400 ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      {...props}
    >
      {/* Results info - always show */}
      <div className="flex items-center mb-2 sm:mb-0">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {t("Showing")} {startItem}-{endItem} {t("of")} {totalResults}
        </span>
      </div>

      {/* Pagination controls - only show if more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 ms-auto">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-[1px] focus:ring-mainColor focus:border-mainColor disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={t("Go to previous page")}
          >
            <BiChevronRight className="h-4 w-4" />
            <span>{t("Previous")}</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1.5">
            {renderPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`inline-flex items-center justify-center px-3 py-1 min-w-[2rem] text-sm font-medium rounded-md focus:outline-none focus:ring-[1px] focus:ring-mainColor relative ${page === currentPage
                        ? 'bg-mainColor/10 text-mainColor border border-mainColor dark:bg-mainColor/30 dark:text-white dark:border-mainColor'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                      } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    aria-label={`${t("Go to page")} ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {loading && page === currentPage ? (
                      <img 
                        src={spinnerLoadingImage} 
                        alt="Loading" 
                        className="w-5 h-5 saturate-0"
                      />
                    ) : (
                      page
                    )}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-[1px] focus:ring-mainColor focus:border-mainColor disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={t("Go to next page")}
          >
            <span>{t("Next")}</span>
            <BiChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </nav>
  );
};

export default CustomPagination;