// src/components/inventory-dashboard/LocationStockCard.jsx
import Skeleton from "react-loading-skeleton";
import { FiAlertTriangle, FiHome, FiShoppingBag, FiTruck } from "react-icons/fi";

import {
  LOCATION_TYPE_COLORS,
  formatMoney,
  formatNumber,
  formatUnits,
} from "@/utils/dashboardFormat";

const TYPE_ICONS = {
  warehouse: FiHome,
  store: FiShoppingBag,
  truck: FiTruck,
};

/**
 * מלאי לפי מיקום — שורה לכל מחסן, חנות ומשאית, עם נתח היחידות,
 * שווי המלאי וחיווי חוסרים. מיקום פעיל בלי מלאי מוצג כריק ולא נעלם.
 */
const LocationStockCard = ({ locations = [], loading, currency }) => {
  const maxUnits = Math.max(1, ...locations.map((l) => l.units || 0));

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          מלאי לפי מיקום
        </h2>
        <span className="text-xs text-gray-400">
          {formatNumber(locations.length)} מיקומים פעילים
        </span>
      </div>

      {loading ? (
        <Skeleton count={5} height={40} />
      ) : !locations.length ? (
        <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-gray-400">
          לא הוגדרו מיקומי מלאי.
          <br />
          הרץ את סקריפט הזרעת המלאי או הוסף מיקום חדש.
        </p>
      ) : (
        <ul className="flex-1 space-y-3 overflow-y-auto pe-1" style={{ maxHeight: 320 }}>
          {locations.map((l) => {
            const Icon = TYPE_ICONS[l.type] || FiHome;
            const color = LOCATION_TYPE_COLORS[l.type];
            const alerts = (l.outRows || 0) + (l.lowRows || 0);

            return (
              <li key={l.id}>
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}1a`, color }}
                  >
                    <Icon size={15} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                      {l.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {l.typeLabel}
                      {l.city ? ` · ${l.city}` : ""}
                      {l.plateNumber ? ` · ${l.plateNumber}` : ""}
                    </p>
                  </div>

                  <div className="shrink-0 text-end">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {formatUnits(l.units)}
                      <span className="ms-1 text-xs font-normal text-gray-400">יח׳</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatMoney(l.value, currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center gap-2 ps-10">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <span
                      className="block h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(2, (l.units / maxUnits) * 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </span>

                  {/* ניצולת מוצגת רק כשהוגדרה קיבולת למיקום.
                      מעל 100% = גלישה מעבר לקיבולת, ולכן מודגש ולא מוסתר. */}
                  {l.fillPct !== null && l.fillPct !== undefined && (
                    <span
                      className={`shrink-0 text-[11px] ${l.fillPct > 100
                        ? "font-semibold text-rose-600 dark:text-rose-400"
                        : "text-gray-400"
                        }`}
                    >
                      {Math.round(l.fillPct)}% מהקיבולת
                    </span>
                  )}

                  {alerts > 0 && (
                    <span className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <FiAlertTriangle size={11} />
                      {formatNumber(alerts)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LocationStockCard;
