// src/components/sales-dashboard/SalesTrendCard.jsx
import { useMemo } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
import Skeleton from "react-loading-skeleton";

import { formatMoney, formatShortDate, TREND_COLORS } from "@/utils/dashboardFormat";

/**
 * ממלא ימים חסרים באפס, כדי שציר הזמן יהיה רציף ולא "יקפוץ" בין תאריכים.
 */
const densify = (rows = [], from, to) => {
  const byDate = new Map(rows.map((r) => [r.date, r.total]));
  const out = [];
  let cursor = dayjs(from).startOf("day");
  const last = dayjs(to).startOf("day");

  // תקרת ביטחון — טווח ארוך במיוחד לא יתקע את הדפדפן
  while (cursor.isBefore(last) || cursor.isSame(last)) {
    const key = cursor.format("YYYY-MM-DD");
    out.push({ date: key, total: byDate.get(key) || 0 });
    cursor = cursor.add(1, "day");
    if (out.length > 730) break;
  }
  return out;
};

const SalesTrendCard = ({ salesOverTime, range, loading, currency }) => {
  const { labels, current, previous } = useMemo(() => {
    if (!range?.startDate) return { labels: [], current: [], previous: [] };

    const curr = densify(salesOverTime?.current, range.startDate, range.endDate);
    const prev = densify(
      salesOverTime?.previous,
      range.previousStartDate,
      range.previousEndDate
    );

    return {
      labels: curr.map((d) => formatShortDate(d.date)),
      current: curr.map((d) => d.total),
      // התקופה הקודמת מיושרת לפי מיקום היום בטווח, לא לפי תאריך
      previous: curr.map((_, i) => prev[i]?.total ?? null),
    };
  }, [salesOverTime, range]);

  const data = {
    labels,
    datasets: [
      {
        label: "התקופה הנוכחית",
        data: current,
        borderColor: TREND_COLORS.current,
        backgroundColor: TREND_COLORS.currentFill,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: "התקופה הקודמת",
        data: previous,
        borderColor: TREND_COLORS.previous,
        borderWidth: 2,
        borderDash: [5, 4],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        callbacks: {
          label: (ctx) =>
            ` ${ctx.dataset.label}: ${formatMoney(ctx.parsed.y, currency)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: TREND_COLORS.axis,
          font: { size: 11 },
          maxTicksLimit: 8,
          autoSkip: true,
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: TREND_COLORS.grid },
        title: {
          display: true,
          text: 'אלפי ₪',
          color: TREND_COLORS.axis,
          font: { size: 11 },
        },
        ticks: {
          color: TREND_COLORS.axis,
          font: { size: 11 },
          // הציר מוצג באלפי ש"ח, בהתאם לכותרת
          callback: (v) => Math.round(v / 1000),
        },
      },
    },
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          מכירות לאורך זמן
        </h2>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span
              className="h-0.5 w-5 rounded"
              style={{ backgroundColor: TREND_COLORS.current }}
            />
            התקופה הנוכחית
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-0.5 w-5 rounded"
              style={{
                backgroundImage: `repeating-linear-gradient(to right, ${TREND_COLORS.previous} 0 5px, transparent 5px 9px)`,
              }}
            />
            התקופה הקודמת
          </span>
        </div>
      </div>

      <div className="h-56 flex-1">
        {loading ? <Skeleton height={220} /> : <Line data={data} options={options} />}
      </div>
    </div>
  );
};

export default SalesTrendCard;
