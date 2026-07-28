// src/components/inventory-dashboard/LocationTypeCard.jsx
import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
import Skeleton from "react-loading-skeleton";

import {
  LOCATION_TYPE_COLORS,
  formatMoney,
  formatNumber,
  formatPercent,
} from "@/utils/dashboardFormat";

/**
 * מצייר את אחוז הנתח על גבי פרוסות הדונאט.
 * פרוסות קטנות מדי מדולגות כדי שהטקסט לא ייחתך.
 */
const sliceLabelsPlugin = {
  id: "stockSliceLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const values = chart.data.datasets[0].data;
    const total = values.reduce((sum, v) => sum + (Number(v) || 0), 0);
    if (!total) return;

    ctx.save();
    ctx.font = "600 11px Assistant, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    meta.data.forEach((arc, i) => {
      const pct = ((Number(values[i]) || 0) / total) * 100;
      if (pct < 4) return;

      const { x, y } = arc.getCenterPoint();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${Math.round(pct)}%`, x, y);
    });

    ctx.restore();
  },
};

/**
 * שווי המלאי לפי סוג מיקום — מחסנים, חנויות ומשאיות.
 */
const LocationTypeCard = ({ byType = [], totalValue = 0, loading, currency }) => {
  const hasValue = byType.some((t) => t.value > 0);
  // יש מלאי אבל אין לו שווי — כלומר למוצרים חסר מחיר עלות.
  // בלי ההבחנה הזו הכרטיס היה מכריז "אין מלאי" על מחסן מלא.
  const hasUnits = byType.some((t) => t.units > 0);

  const chartData = {
    labels: byType.map((t) => t.label),
    datasets: [
      {
        data: byType.map((t) => Math.max(0, t.value)),
        backgroundColor: byType.map((t) => LOCATION_TYPE_COLORS[t.key]),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        callbacks: {
          label: (ctx) => ` ${formatMoney(ctx.parsed, currency)}`,
        },
      },
    },
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
        שווי מלאי לפי סוג מיקום
      </h2>

      {loading ? (
        <Skeleton height={200} />
      ) : !hasValue ? (
        <p className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-gray-400">
          {hasUnits
            ? "יש מלאי, אך לא הוגדר מחיר עלות למוצרים ולכן אין שווי לחישוב"
            : "אין נתוני מלאי בסינון שנבחר"}
        </p>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-40 w-40 shrink-0">
            <Doughnut data={chartData} options={options} plugins={[sliceLabelsPlugin]} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-gray-800 dark:text-gray-100">
                {formatMoney(totalValue, currency)}
              </span>
              <span className="text-[11px] text-gray-400">שווי כולל</span>
            </div>
          </div>

          <ul className="w-full space-y-2.5">
            {byType.map((t) => (
              <li key={t.key} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: LOCATION_TYPE_COLORS[t.key] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-gray-700 dark:text-gray-200">
                    {t.label}
                    <span className="ms-1 text-xs text-gray-400">
                      ({formatNumber(t.locations)})
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatMoney(t.value, currency)} · {formatNumber(t.units)} יח׳
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {formatPercent(t.share, 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationTypeCard;
