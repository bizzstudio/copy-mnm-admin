// src/components/inventory-dashboard/InventoryFilters.jsx
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiFilter, FiRotateCcw, FiSearch } from "react-icons/fi";

const controlClass =
  "flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200";

const popoverClass =
  "absolute top-11 z-20 rounded-xl border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800";

/** תפריט בחירה בעיצוב אחיד לשורת הסינון */
const FilterSelect = ({ value, onChange, placeholder, options, disabled, width = "w-40" }) => (
  <div className="relative">
    <select
      className={`${controlClass} ${width} appearance-none pe-8 disabled:opacity-60`}
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
 * שורת הסינון של דשבורד המלאי: סוג מיקום, מיקום ספציפי, חיפוש מוצר וקטגוריה.
 */
const InventoryFilters = ({
  type,
  location,
  category,
  search,
  typeOptions = [],
  locationOptions = [],
  categoryOptions = [],
  onChange,
  onReset,
}) => {
  const [openPanel, setOpenPanel] = useState(null);
  const [searchDraft, setSearchDraft] = useState(search || "");
  const barRef = useRef(null);

  const toggle = (panel) => setOpenPanel((cur) => (cur === panel ? null : panel));

  // איפוס מבחוץ צריך לנקות גם את תיבת החיפוש המקומית
  useEffect(() => {
    setSearchDraft(search || "");
  }, [search]);

  /* חיפוש מושהה: כל הקלדה הייתה מפילה בקשה לשרת, ודרישת Enter הייתה
     משאירה את הסינון תקוע כשמנקים את השדה בכפתור ה-X של הדפדפן. */
  useEffect(() => {
    if (searchDraft.trim() === (search || "")) return;

    const timer = setTimeout(() => onChange({ search: searchDraft.trim() }), 400);
    return () => clearTimeout(timer);
  }, [searchDraft, search, onChange]);

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

  // המיקומים מסוננים לפי הסוג שנבחר, אחרת אפשר לבחור צירוף שמחזיר ריק
  const locations = type
    ? locationOptions.filter((l) => l.type === type)
    : locationOptions;

  const extraFilters = category ? 1 : 0;

  return (
    <div ref={barRef} className="mb-6 flex flex-wrap items-center gap-2">
      <FilterSelect
        value={type}
        onChange={(v) => onChange({ type: v, location: "" })}
        placeholder="כל סוגי המיקומים"
        options={typeOptions}
      />

      <FilterSelect
        value={location}
        onChange={(v) => onChange({ location: v })}
        placeholder="כל המיקומים"
        options={locations}
        disabled={!locations.length}
        width="w-48"
      />

      <div className="relative">
        <FiSearch
          size={15}
          className="pointer-events-none absolute inset-y-0 start-3 my-auto text-gray-400"
        />
        <input
          type="search"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="חיפוש מוצר או מק״ט"
          maxLength={80}
          className={`${controlClass} w-52 ps-9`}
        />
      </div>

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
              קטגוריה
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                value={category || ""}
                onChange={(e) => onChange({ category: e.target.value })}
              >
                <option value="">כל הקטגוריות</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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

export default InventoryFilters;
