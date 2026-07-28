// src/pages/Dashboard.jsx
// דשבורד מכירות — כל הנתונים מגיעים מ-GET /orders/sales-dashboard.
// הכללים העסקיים (מקור מחיר עלות, הגדרת ערוץ, תאריך שיוך הזמנה) מוגדרים
// בשרת ב-controller/salesDashboardController.js תחת CONFIG.

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { FiBarChart2, FiRepeat, FiShoppingBag, FiTrendingUp } from "react-icons/fi";

import OrderServices from "@/services/OrderServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { notifyError } from "@/utils/toast";
import PageTitle from "@/components/Typography/PageTitle";
import DashboardFilters from "@/components/sales-dashboard/DashboardFilters";
import KpiCard from "@/components/sales-dashboard/KpiCard";
import ChannelProfitCard from "@/components/sales-dashboard/ChannelProfitCard";
import SalesTrendCard from "@/components/sales-dashboard/SalesTrendCard";
import ReturningCustomersCard from "@/components/sales-dashboard/ReturningCustomersCard";
import ProductPerformanceCard from "@/components/sales-dashboard/ProductPerformanceCard";
import { formatMoney, formatNumber, formatPercent } from "@/utils/dashboardFormat";

const DATE = "YYYY-MM-DD";

const presetRange = (key) => {
  const today = dayjs();

  switch (key) {
    case "lastMonth": {
      const prev = today.subtract(1, "month");
      return {
        startDate: prev.startOf("month").format(DATE),
        endDate: prev.endOf("month").format(DATE),
      };
    }
    case "last30":
      return {
        startDate: today.subtract(29, "day").format(DATE),
        endDate: today.format(DATE),
      };
    case "thisYear":
      return {
        startDate: today.startOf("year").format(DATE),
        endDate: today.format(DATE),
      };
    case "thisMonth":
    default:
      return {
        startDate: today.startOf("month").format(DATE),
        endDate: today.format(DATE),
      };
  }
};

const Dashboard = () => {
  const { currency } = useUtilsFunction();

  const [filters, setFilters] = useState(() => ({
    ...presetRange("thisMonth"),
    branch: "",
    channel: "",
    priceList: "",
  }));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await OrderServices.getSalesDashboard(filters);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) {
          notifyError(err?.response?.data?.message || err?.message);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const handleChange = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handlePreset = useCallback((key) => {
    setFilters((prev) => ({ ...prev, ...presetRange(key) }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      ...presetRange("thisMonth"),
      branch: "",
      channel: "",
      priceList: "",
    });
  }, []);

  const kpi = data?.kpi;

  // חיווי אמינות לכרטיס הרווח.
  // הרווח מחושב רק על מוצרים שיש להם מחיר עלות, ולכן חשוב להראות
  // גם את הכיסוי וגם מתי ההשוואה בין התקופות לא אמינה בגללו.
  const profitNote = useMemo(() => {
    if (!data) return null;

    const { costCoverage, previousCostCoverage, profitComparable } = data;
    const notes = [];

    if (typeof costCoverage === "number" && costCoverage < 99) {
      notes.push(`מחושב על ${formatPercent(costCoverage, 0)} מהמכירות`);
    }

    if (profitComparable === false) {
      notes.push(
        `כיסוי עלות שונה מהתקופה הקודמת (${formatPercent(
          costCoverage,
          0
        )} מול ${formatPercent(previousCostCoverage, 0)}) — ההשוואה אינה אמינה`
      );
    }

    return notes.length ? notes.join(" · ") : null;
  }, [data]);

  return (
    <div className="mx-auto flex h-fit w-full flex-col overflow-x-hidden px-5 sm:px-4 lg:px-20">
      <PageTitle>דשבורד מכירות</PageTitle>

      <DashboardFilters
        startDate={filters.startDate}
        endDate={filters.endDate}
        branch={filters.branch}
        channel={filters.channel}
        priceList={filters.priceList}
        branchOptions={data?.filterOptions?.branches || []}
        channelOptions={data?.filterOptions?.channels || []}
        priceListOptions={data?.filterOptions?.priceLists || []}
        onChange={handleChange}
        onPreset={handlePreset}
        onReset={handleReset}
      />

      {/* מדדי התקופה */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title='סה"כ מכירות'
          value={formatMoney(kpi?.totalSales?.value, currency)}
          changePct={kpi?.totalSales?.changePct}
          Icon={FiBarChart2}
          tone="blue"
          loading={loading}
        />
        <KpiCard
          title="רווח גולמי"
          value={formatMoney(kpi?.grossProfit?.value, currency)}
          changePct={kpi?.grossProfit?.changePct}
          emptyLabel={
            kpi?.grossProfit?.comparable === false
              ? "השוואה לא אמינה"
              : "אין נתוני השוואה"
          }
          Icon={FiTrendingUp}
          tone="emerald"
          loading={loading}
          note={profitNote}
        />
        <KpiCard
          title="הזמנות"
          value={formatNumber(kpi?.orders?.value)}
          changePct={kpi?.orders?.changePct}
          Icon={FiShoppingBag}
          tone="indigo"
          loading={loading}
        />
        <KpiCard
          title="לקוחות חוזרים"
          value={formatNumber(kpi?.returningCustomers?.value)}
          changePct={kpi?.returningCustomers?.changePct}
          Icon={FiRepeat}
          tone="sky"
          loading={loading}
        />
      </div>

      {/* לקוחות חוזרים · מכירות לאורך זמן · רווחיות לפי ערוץ */}
      <div className="mb-6 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <ReturningCustomersCard returning={data?.returning} loading={loading} />
        </div>

        <div className="lg:col-span-5">
          <SalesTrendCard
            salesOverTime={data?.salesOverTime}
            range={data?.range}
            loading={loading}
            currency={currency}
          />
        </div>

        <div className="lg:col-span-4">
          <ChannelProfitCard
            channels={data?.channels || []}
            totalProfit={kpi?.grossProfit?.value || 0}
            loading={loading}
            currency={currency}
          />
        </div>
      </div>

      <div className="mb-8">
        <ProductPerformanceCard
          products={data?.products || []}
          loading={loading}
          currency={currency}
        />
      </div>
    </div>
  );
};

export default Dashboard;
