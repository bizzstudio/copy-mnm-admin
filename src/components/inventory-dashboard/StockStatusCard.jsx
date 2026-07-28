// src/components/inventory-dashboard/StockStatusCard.jsx
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { FiArrowLeft } from "react-icons/fi";

import {
  STOCK_STATUS_COLORS,
  formatNumber,
  formatPercent,
} from "@/utils/dashboardFormat";

/**
 * מצב המלאי — אחוז המוצרים במלאי תקין, והתפלגות המוצרים לפי מצב.
 */
const StockStatusCard = ({ statusBreakdown = [], summary, loading }) => {
  const maxPct = Math.max(1, ...statusBreakdown.map((d) => d.pct || 0));

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
        מצב המלאי
      </h2>

      {loading ? (
        <Skeleton height={200} />
      ) : (
        <>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatPercent(summary?.healthyPct)}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              מהמוצרים במלאי תקין
            </p>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {formatNumber(summary?.products)} מוצרים ב-
              {formatNumber(summary?.locations)} מיקומים
            </p>
          </div>

          <div className="mt-5 flex-1">
            <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-300">
              התפלגות לפי מצב
            </p>

            <ul className="space-y-2.5">
              {statusBreakdown.map((d) => (
                <li key={d.key} className="flex items-center gap-2">
                  <span className="w-9 shrink-0 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {formatPercent(d.pct, 0)}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <span
                      className="block h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(2, (d.pct / maxPct) * 100)}%`,
                        backgroundColor: STOCK_STATUS_COLORS[d.key],
                      }}
                    />
                  </span>
                  <span className="w-24 shrink-0 text-end text-xs text-gray-500 dark:text-gray-400">
                    {d.label}
                    <span className="ms-1 text-gray-400">
                      ({formatNumber(d.count)})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <Link
        to="/products"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        ניהול מלאי המוצרים
        <FiArrowLeft size={15} />
      </Link>
    </div>
  );
};

export default StockStatusCard;
