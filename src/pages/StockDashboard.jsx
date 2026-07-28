// src/pages/StockDashboard.jsx
// דשבורד מלאי — כל הנתונים מגיעים מ-GET /inventory/dashboard.
// הכללים העסקיים (מקור מחיר עלות, סף התראה, מוצרים מוסתרים) מוגדרים
// בשרת ב-controller/inventoryDashboardController.js תחת CONFIG.

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertTriangle, FiDollarSign, FiLayers, FiXCircle } from "react-icons/fi";

import InventoryServices from "@/services/InventoryServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { notifyError } from "@/utils/toast";
import PageTitle from "@/components/Typography/PageTitle";
import InventoryFilters from "@/components/inventory-dashboard/InventoryFilters";
import StockKpiCard from "@/components/inventory-dashboard/StockKpiCard";
import StockStatusCard from "@/components/inventory-dashboard/StockStatusCard";
import LocationStockCard from "@/components/inventory-dashboard/LocationStockCard";
import LocationTypeCard from "@/components/inventory-dashboard/LocationTypeCard";
import ProductStockCard from "@/components/inventory-dashboard/ProductStockCard";
import LowStockCard from "@/components/inventory-dashboard/LowStockCard";
import {
  formatMoney,
  formatNumber,
  formatPercent,
  formatUnits,
} from "@/utils/dashboardFormat";

const EMPTY_FILTERS = { type: "", location: "", category: "", search: "" };

const StockDashboard = () => {
  const { currency } = useUtilsFunction();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await InventoryServices.getInventoryDashboard(filters);
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

  /* שינוי שלא משנה כלום מחזיר את אותו אובייקט state — אחרת כל בחירה חוזרת
     באותו ערך הייתה יוצרת filters חדש ומפילה בקשה מיותרת לשרת. */
  const handleChange = useCallback((patch) => {
    setFilters((prev) => {
      const changed = Object.keys(patch).some((key) => prev[key] !== patch[key]);
      return changed ? { ...prev, ...patch } : prev;
    });
  }, []);

  const handleReset = useCallback(() => {
    setFilters((prev) =>
      Object.values(prev).every((v) => !v) ? prev : { ...EMPTY_FILTERS }
    );
  }, []);

  const kpi = data?.kpi;
  const summary = data?.summary;

  // חיווי אמינות לכרטיס השווי: כמה מהיחידות מכוסות בנתוני עלות
  const valueNote = useMemo(() => {
    const coverage = summary?.costCoverage;
    if (coverage === undefined || coverage === null) return null;
    // בלי מלאי כלל אין מה לכסות — הודעת כיסוי הייתה מבלבלת
    if (!kpi?.totalUnits?.value) return null;
    if (coverage >= 99) return "לפי מחיר עלות";
    if (coverage <= 0) return "לא הוגדר מחיר עלות למוצרים בסינון שנבחר";
    return `מחושב על ${formatPercent(coverage, 0)} מהיחידות (ליתר אין מחיר עלות)`;
  }, [summary?.costCoverage, kpi?.totalUnits?.value]);

  return (
    <div className="mx-auto flex h-fit w-full flex-col overflow-x-hidden px-5 sm:px-4 lg:px-20">
      <PageTitle>דשבורד מלאי</PageTitle>

      <InventoryFilters
        type={filters.type}
        location={filters.location}
        category={filters.category}
        search={filters.search}
        typeOptions={data?.filterOptions?.types || []}
        locationOptions={data?.filterOptions?.locations || []}
        categoryOptions={data?.filterOptions?.categories || []}
        onChange={handleChange}
        onReset={handleReset}
      />

      {/* מדדי המלאי */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StockKpiCard
          title='סה"כ יחידות במלאי'
          value={formatUnits(kpi?.totalUnits?.value)}
          subtitle={
            summary
              ? `ב-${formatNumber(summary.activeLocations)} מיקומים עם מלאי`
              : null
          }
          Icon={FiLayers}
          tone="blue"
          loading={loading}
        />
        <StockKpiCard
          title="שווי המלאי"
          value={formatMoney(kpi?.stockValue?.value, currency)}
          subtitle={valueNote}
          Icon={FiDollarSign}
          tone="emerald"
          loading={loading}
        />
        <StockKpiCard
          title="מוצרים מתחת לסף"
          value={formatNumber(kpi?.lowStock?.value)}
          subtitle={
            summary ? `מתוך ${formatNumber(summary.products)} מוצרים במלאי` : null
          }
          Icon={FiAlertTriangle}
          tone="amber"
          loading={loading}
        />
        <StockKpiCard
          title="מוצרים שאזלו"
          value={formatNumber(kpi?.outOfStock?.value)}
          subtitle="אין יחידות באף מיקום"
          Icon={FiXCircle}
          tone="rose"
          loading={loading}
        />
      </div>

      {/* מצב המלאי · מלאי לפי מיקום · שווי לפי סוג מיקום */}
      <div className="mb-6 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <StockStatusCard
            statusBreakdown={data?.statusBreakdown || []}
            summary={summary}
            loading={loading}
          />
        </div>

        <div className="lg:col-span-5">
          <LocationStockCard
            locations={data?.byLocation || []}
            loading={loading}
            currency={currency}
          />
        </div>

        <div className="lg:col-span-4">
          <LocationTypeCard
            byType={data?.byType || []}
            totalValue={kpi?.stockValue?.value || 0}
            loading={loading}
            currency={currency}
          />
        </div>
      </div>

      {/* מלאי לפי מוצר · התראות חידוש */}
      <div className="mb-8 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ProductStockCard
            products={data?.products || []}
            loading={loading}
            currency={currency}
          />
        </div>

        <div className="lg:col-span-4">
          <LowStockCard alerts={data?.alerts || []} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
