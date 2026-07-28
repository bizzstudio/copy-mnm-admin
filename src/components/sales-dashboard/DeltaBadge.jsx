// src/components/sales-dashboard/DeltaBadge.jsx
import { FiArrowDownRight, FiArrowUpRight, FiMinus } from "react-icons/fi";
import { formatPercent } from "@/utils/dashboardFormat";

/**
 * חיווי שינוי מול התקופה הקודמת.
 * changePct === null פירושו שאין בסיס השוואה אמין — לא מוצג מספר.
 */
const DeltaBadge = ({
  changePct,
  label = "לעומת התקופה הקודמת",
  emptyLabel = "אין נתוני השוואה",
}) => {
  if (changePct === null || changePct === undefined) {
    return (
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{emptyLabel}</p>
    );
  }

  // אפס אינו שיפור — חיווי ניטרלי, בלי חץ ובלי ירוק
  const isFlat = changePct === 0;
  const isUp = changePct > 0;

  const Icon = isFlat ? FiMinus : isUp ? FiArrowUpRight : FiArrowDownRight;

  const tone = isFlat
    ? "text-gray-500 dark:text-gray-400"
    : isUp
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  return (
    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      <span className={`flex items-center gap-0.5 font-semibold ${tone}`}>
        <Icon size={13} />
        {isFlat ? "ללא שינוי" : formatPercent(Math.abs(changePct))}
      </span>
      {!isFlat && <span>{label}</span>}
    </p>
  );
};

export default DeltaBadge;
