// src/components/sales-dashboard/KpiCard.jsx
import Skeleton from "react-loading-skeleton";
import DeltaBadge from "./DeltaBadge";

/**
 * כרטיס מדד עליון: כותרת, ערך גדול, שינוי מול התקופה הקודמת ואייקון מודגש.
 */
const KpiCard = ({ title, value, changePct, Icon, tone = "blue", loading, note }) => {
  const tones = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <Skeleton height={16} width={90} />
        <Skeleton height={30} className="mt-3" />
        <Skeleton height={12} width={140} className="mt-3" />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="mt-1.5 truncate text-2xl font-bold text-gray-800 dark:text-gray-100">
          {value}
        </p>
        <DeltaBadge changePct={changePct} />
        {note && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{note}</p>
        )}
      </div>

      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}
      >
        <Icon size={20} />
      </span>
    </div>
  );
};

export default KpiCard;
