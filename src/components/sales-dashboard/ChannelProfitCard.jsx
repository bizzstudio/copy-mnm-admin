// src/components/sales-dashboard/ChannelProfitCard.jsx
import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { FiArrowLeft } from "react-icons/fi";

import {
  CHANNEL_COLORS,
  formatMoney,
  formatPercent,
} from "@/utils/dashboardFormat";

/**
 * מצייר את אחוז הנתח על גבי פרוסות הדונאט.
 * פרוסות קטנות מדי מדולגות כדי שהטקסט לא ייחתך.
 */
const sliceLabelsPlugin = {
  id: "sliceLabels",
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
 * רווחיות לפי ערוץ — דונאט עם סה"כ במרכז ומקרא מפורט לצידו.
 */
const ChannelProfitCard = ({ channels = [], totalProfit = 0, loading, currency }) => {
  const hasData = channels.some((c) => c.profit > 0);

  const chartData = {
    labels: channels.map((c) => c.label),
    datasets: [
      {
        data: channels.map((c) => Math.max(0, c.profit)),
        backgroundColor: channels.map(
          (_, i) => CHANNEL_COLORS[i % CHANNEL_COLORS.length]
        ),
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
        רווחיות לפי ערוץ
      </h2>

      {loading ? (
        <Skeleton height={200} />
      ) : !hasData ? (
        <p className="flex flex-1 items-center justify-center py-10 text-sm text-gray-400">
          אין נתוני רווח בטווח שנבחר
        </p>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-40 w-40 shrink-0">
            <Doughnut data={chartData} options={options} plugins={[sliceLabelsPlugin]} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-gray-800 dark:text-gray-100">
                {formatMoney(totalProfit, currency)}
              </span>
              <span className="text-[11px] text-gray-400">רווח גולמי</span>
            </div>
          </div>

          <ul className="w-full space-y-2.5">
            {channels.map((c, i) => (
              <li key={c.key} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-gray-700 dark:text-gray-200">
                    {c.label}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatMoney(c.profit, currency)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {formatPercent(c.share, 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/orders"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        צפייה בדוח המלא
        <FiArrowLeft size={15} />
      </Link>
    </div>
  );
};

export default ChannelProfitCard;
