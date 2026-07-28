// src/components/sales-dashboard/DashboardFilters.jsx
import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiChevronDown, FiFilter, FiRotateCcw } from "react-icons/fi";

const PRESETS = [
  { key: "thisMonth", label: "החודש" },
  { key: "lastMonth", label: "חודש שעבר" },
  { key: "last30", label: "30 ימים" },
  { key: "thisYear", label: "השנה" },
];

const controlClass =
  "flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200";

const popoverClass =
  "absolute top-11 z-20 rounded-xl border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800";

/** תפריט בחירה בעיצוב אחיד לשורת הסינון */
const FilterSelect = ({ value, onChange, placeholder, options, disabled }) => (
  <div className="relative">
    <select
      className={`${controlClass} w-40 appearance-none pe-8 disabled:opacity-60`}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
    {/* ב-RTL הצ'ברון בצד שמאל — end-3 תואם ל-pe-8 של השדה */}
    <FiChevronDown
      size={15}
      className="pointer-events-none absolute inset-y-0 end-3 my-auto text-gray-400"
    />
  </div>
);

/**
 * שורת הסינון של הדשבורד: טווח תאריכים, סניף, ערוץ וסינונים נוספים.
 */
const DashboardFilters = ({
  startDate,
  endDate,
  branch,
  channel,
  priceList,
  branchOptions = [],
  channelOptions = [],
  priceListOptions = [],
  onChange,
  onPreset,
  onReset,
}) => {
  const [openPanel, setOpenPanel] = useState(null);
  const barRef = useRef(null);

  const toggle = (panel) => setOpenPanel((cur) => (cur === panel ? null : panel));

  // סגירת החלונית בלחיצה בחוץ או ב-Escape — אחרת היא נשארת פתוחה מעל התוכן
  useEffect(() => {
    if (!openPanel) return;

    const onPointerDown = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenPanel(null);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenPanel(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openPanel]);

  const rangeLabel =
    startDate && endDate
      ? `${startDate.split("-").reverse().join("/")} - ${endDate
        .split("-")
        .reverse()
        .join("/")}`
      : "בחירת טווח";

  const extraFilters = priceList ? 1 : 0;

  return (
    <div ref={barRef} className="mb-6 flex flex-wrap items-center gap-2">
      {/* טווח תאריכים */}
      <div className="relative">
        <button type="button" onClick={() => toggle("dates")} className={controlClass}>
          <FiCalendar size={15} className="text-gray-400" />
          <span className="text-gray-400">טווח תאריכים</span>
          <span className="font-medium">{rangeLabel}</span>
        </button>

        {openPanel === "dates" && (
          <div className={`${popoverClass} w-72`}>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                מתאריך
                <input
                  type="date"
                  value={startDate || ""}
                  max={endDate || undefined}
                  onChange={(e) => onChange({ startDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </label>
              <label className="text-xs text-gray-500 dark:text-gray-400">
                עד תאריך
                <input
                  type="date"
                  value={endDate || ""}
                  min={startDate || undefined}
                  onChange={(e) => onChange({ endDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    onPreset(p.key);
                    setOpenPanel(null);
                  }}
                  className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <FilterSelect
        value={branch}
        onChange={(v) => onChange({ branch: v })}
        placeholder="כל הסניפים"
        options={branchOptions}
      />

      <FilterSelect
        value={channel}
        onChange={(v) => onChange({ channel: v })}
        placeholder="כל הערוצים"
        options={channelOptions}
        disabled={!channelOptions.length}
      />

      {/* סינונים נוספים */}
      <div className="relative">
        <button type="button" onClick={() => toggle("more")} className={controlClass}>
          <FiFilter size={15} className="text-gray-400" />
          סינונים
          {extraFilters > 0 && (
            <span className="rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
              {extraFilters}
            </span>
          )}
        </button>

        {openPanel === "more" && (
          <div className={`${popoverClass} w-64`}>
            <label className="block text-xs text-gray-500 dark:text-gray-400">
              מחירון
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                value={priceList || ""}
                onChange={(e) => onChange({ priceList: e.target.value })}
              >
                <option value="">כל המחירונים</option>
                {priceListOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                onReset();
                setOpenPanel(null);
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 dark:border-gray-600 dark:text-gray-300"
            >
              <FiRotateCcw size={14} />
              איפוס כל הסינונים
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFilters;
