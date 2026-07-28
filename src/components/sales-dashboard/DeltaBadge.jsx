// src/components/sales-dashboard/DeltaBadge.jsx
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";
import { formatPercent } from "@/utils/dashboardFormat";

/**
 * חיווי שינוי מול התקופה הקודמת.
 * changePct === null פירושו שאין בסיס להשוואה (לא היו נתונים בתקופה הקודמת).
 */
const DeltaBadge = ({ changePct, label = "לעומת התקופה הקודמת" }) => {
  if (changePct === null || changePct === undefined) {
    return (
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        אין נתוני השוואה
      </p>
    );
  }

  const isUp = changePct >= 0;
  const Icon = isUp ? FiArrowUpRight : FiArrowDownRight;

  return (
    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      <span
        className={`flex items-center gap-0.5 font-semibold ${
          isUp
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        }`}
      >
        <Icon size={13} />
        {formatPercent(Math.abs(changePct))}
      </span>
      <span>{label}</span>
    </p>
  );
};

export default DeltaBadge;
