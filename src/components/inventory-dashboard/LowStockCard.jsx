// src/components/inventory-dashboard/LowStockCard.jsx
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { FiArrowLeft, FiPackage } from "react-icons/fi";

import useUtilsFunction from "@/hooks/useUtilsFunction";
import { formatUnits } from "@/utils/dashboardFormat";

/**
 * התראות מלאי — קודם מה שאזל, אחר כך מה שהכי רחוק מסף ההתראה.
 */
const LowStockCard = ({ alerts = [], loading }) => {
  const { showingTranslateValue } = useUtilsFunction();

  // כותרת המוצר היא אובייקט רב-לשוני, אבל במוצרים ישנים היא יכולה להיות מחרוזת
  const productTitle = (title) => {
    if (typeof title === "string") return title;
    return showingTranslateValue(title) || title?.he || title?.en || "—";
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
        דורש חידוש מלאי
      </h2>

      {loading ? (
        <Skeleton count={5} height={38} />
      ) : !alerts.length ? (
        <p className="flex flex-1 items-center justify-center py-10 text-sm text-gray-400">
          כל המוצרים מעל סף ההתראה
        </p>
      ) : (
        <ul className="flex-1 space-y-2.5">
          {alerts.map((p) => (
            <li key={p.id} className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                {p.image ? (
                  <img
                    src={p.image}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <FiPackage size={14} className="text-gray-400" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-700 dark:text-gray-200">
                  {productTitle(p.title)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatUnits(p.units)} מתוך סף {formatUnits(p.threshold)}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${p.status === "out"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
              >
                {p.status === "out" ? "אזל" : `חסר ${formatUnits(p.shortage)}`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/products"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        הזמנת חידוש מלאי
        <FiArrowLeft size={15} />
      </Link>
    </div>
  );
};

export default LowStockCard;
