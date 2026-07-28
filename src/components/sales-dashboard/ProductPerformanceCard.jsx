// src/components/sales-dashboard/ProductPerformanceCard.jsx
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { FiArrowLeft, FiPackage } from "react-icons/fi";

import useUtilsFunction from "@/hooks/useUtilsFunction";
import {
  formatMoney,
  formatPercent,
  formatUnits,
} from "@/utils/dashboardFormat";

// צבע תג שיעור הרווח לפי סף רווחיות
const marginTone = (pct) => {
  if (pct === null || pct === undefined)
    return "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300";
  if (pct >= 35) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (pct >= 25) return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
};

const ProductPerformanceCard = ({ products = [], loading, currency }) => {
  const { showingTranslateValue } = useUtilsFunction();

  // כותרת המוצר מגיעה כאובייקט רב-לשוני, אבל בהזמנות ישנות היא יכולה להיות
  // מחרוזת רגילה — showingTranslateValue מחזיר undefined במקרה כזה.
  const productTitle = (title) => {
    if (typeof title === "string") return title;
    return showingTranslateValue(title) || title?.he || title?.en || "—";
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
        ביצועים לפי מוצר
      </h2>

      {loading ? (
        <Skeleton count={6} height={38} />
      ) : !products.length ? (
        <p className="py-10 text-center text-sm text-gray-400">
          אין מכירות בטווח שנבחר
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-700">
                <th className="px-3 py-2.5 text-start font-medium">מוצר</th>
                <th className="px-3 py-2.5 text-start font-medium">סה"כ מכירות</th>
                <th className="px-3 py-2.5 text-start font-medium">יחידות שנמכרו</th>
                <th className="px-3 py-2.5 text-start font-medium">רווח גולמי</th>
                <th className="px-3 py-2.5 text-start font-medium">שיעור רווח גולמי</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 dark:border-gray-700/60 dark:hover:bg-gray-700/30"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <FiPackage size={15} className="text-gray-400" />
                        )}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {productTitle(p.title)}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-3 text-gray-700 dark:text-gray-200">
                    {formatMoney(p.sales, currency)}
                  </td>

                  <td className="px-3 py-3 text-gray-700 dark:text-gray-200">
                    {formatUnits(p.units)}
                  </td>

                  <td className="px-3 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                    {p.hasCost ? formatMoney(p.profit, currency) : "—"}
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${marginTone(
                        p.marginPct
                      )}`}
                    >
                      {p.hasCost ? formatPercent(p.marginPct) : "אין נתוני עלות"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link
        to="/products"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        צפייה בכל המוצרים
        <FiArrowLeft size={15} />
      </Link>
    </div>
  );
};

export default ProductPerformanceCard;
