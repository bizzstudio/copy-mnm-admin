// src/utils/dashboardFormat.js
// עיצוב מספרים לדשבורד המכירות — פורמט ישראלי, בלי אגורות בכרטיסים.

const nf = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 });
const nfDecimal = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 1 });

export const formatNumber = (value) => nf.format(Number(value) || 0);

export const formatMoney = (value, currency = "₪") =>
  `${currency}${nf.format(Math.round(Number(value) || 0))}`;

export const formatPercent = (value, digits = 1) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value) || 0;
  return `${digits ? nfDecimal.format(n) : nf.format(n)}%`;
};

// כמות יחידות — מוצרים במשקל נמכרים בשברי ק"ג
export const formatUnits = (value) => {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? nf.format(n) : nfDecimal.format(n);
};

export const formatShortDate = (isoDate) => {
  if (!isoDate) return "";
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
};

/* פלטת הדשבורד — תואמת לעיצוב שאושר */

// צבעי הערוצים בגרף הדונאט, לפי סדר יורד של נתח
export const CHANNEL_COLORS = [
  "#2f4bb5",
  "#5b8def",
  "#8ed8dd",
  "#e8636f",
  "#c9ccd4",
];

// גוני הפסים בהתפלגות הלקוחות החוזרים
export const BAR_COLORS = ["#2f4bb5", "#4a7fe0", "#7fb3e8", "#a9cdf2"];

export const TREND_COLORS = {
  current: "#3b6fd4",
  currentFill: "rgba(59, 111, 212, 0.10)",
  previous: "#7fb3e8",
  axis: "#8a93a8",
  grid: "rgba(138, 147, 168, 0.18)",
};
