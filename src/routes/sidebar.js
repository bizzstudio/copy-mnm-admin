import {
  FiGrid,
  FiUsers,
  FiSettings,
  FiGlobe,
  FiTarget,
  FiPackage,
  FiBox,
  FiShoppingCart,
  FiDollarSign,
  FiShield,
} from "react-icons/fi";

/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 *
 * ── שני מפתחות שקובעים מי רואה מה ─────────────────────────────────────────
 *
 *   platformOnly  bizzstudio בלבד. נבדק מול `usePlatformRole`.
 *   moduleKey     המסך קיים רק אם המודול דלוק אצל הלקוח. המפתחות הם אלה של
 *                 `@bizzexpo/shared/modules` — אותם מפתחות ש-`requireModule`
 *                 בשרת בודק, כדי שתפריט וסירוב לא יוכלו לחלוק על אותה שאלה.
 *
 * שניהם נוחות, לא בקרה: השרת מסרב מצדו בכל מקרה. ההסתרה כאן היא כדי שלקוח לא
 * ילחץ על פריט ויקבל 404 שנראה כמו תקלה.
 *
 * ── שתי רמות של תת-תפריט ───────────────────────────────────────────────────
 * `routes` בתוך `routes` מרונדר על ידי אותו `SidebarSubMenu` ברמת הזחה עמוקה
 * יותר. קבוצה שכל בניה סוננו נעלמת — היא כותרת שנפתחת לכלום.
 */
const sidebar = [
  {
    path: "/dashboard", // the url
    icon: FiGrid, // icon
    name: "Dashboard", // name that appear in Sidebar
  },

  /* ── הזמנות ────────────────────────────────────────────────────────────────
   * מסך הזמנות אחד עם עמודת "מקור", ולא שלושה מסכים לפי מקור. החנות, פלטפורמות
   * המכירה החיצוניות והמשלוחים יושבים כאן כי כולם מזינים את אותו צינור הזמנות.
   */
  {
    icon: FiShoppingCart,
    name: "Orders",
    routes: [
      {
        path: "/orders",
        name: "AllOrders",
      },
      {
        path: "/statuses",
        name: "Statuses",
      },
      {
        name: "StoreManagement",
        moduleKey: "store",
        routes: [
          {
            path: "/store/customization",
            name: "StoreCustomization",
          },
          {
            path: "/store/store-settings",
            name: "StoreSetting",
          },
          {
            path: "/offers",
            name: "Offers",
            moduleKey: "offers",
          },
          {
            path: "/coupons",
            name: "Coupons",
            moduleKey: "coupons",
          },
          {
            path: "/popups",
            name: "Popups",
            moduleKey: "popups",
          },
          {
            path: "/blogs",
            name: "Blogs",
            moduleKey: "blog",
          },
          {
            path: "/store/scripts",
            name: "Scripts",
            moduleKey: "storeScripts",
          },
          {
            name: "ViewStore",
            outside: "store",
          },
        ],
      },
      {
        path: "/channels",
        name: "SalesChannels",
      },
      {
        name: "ShippingGroup",
        routes: [
          {
            path: "/deliveries",
            name: "DeliveryRegions",
            moduleKey: "deliveryRegions",
          },
          {
            path: "/shipping",
            name: "ShippingProviders",
          },
        ],
      },
    ],
  },

  /* ── ליקוט ורכש ───────────────────────────────────────────────────────────
   * הצד התפעולי: מה יוצא מהמחסן ומה נכנס אליו.
   */
  {
    icon: FiBox,
    name: "PickingAndPurchasing",
    routes: [
      {
        path: "/picking",
        name: "PickingManagement",
        moduleKey: "picking",
      },
      {
        name: "ViewLikutApp",
        outside: "likutApp",
      },
      {
        path: "/goods-receipt",
        name: "GoodsReceipt",
      },
      {
        path: "/suppliers",
        name: "Suppliers",
      },
      {
        path: "/stock-locations",
        name: "StockLocations",
        moduleKey: "stockLocations",
      },
    ],
  },

  {
    icon: FiTarget,
    name: "AgentsGroup",
    moduleKey: "agents",
    routes: [
      {
        path: "/agents",
        name: "Agents",
      },
      {
        /**
         * מצביע על מסך ההזמנות המאוחד עם הפילטר כבר מוגדר, ולא על `/agent-orders`
         * שהוא כיום רק הפניה — קפיצה מיותרת שגם מונעת מהפריט להיצבע כפעיל.
         */
        path: "/orders?source=agent",
        name: "AgentOrders",
      },
      {
        name: "ViewAgentsApp",
        outside: "agentsApp",
      },
    ],
  },

  {
    icon: FiPackage,
    name: "Inventory",
    routes: [
      {
        path: "/stock-dashboard",
        name: "StockDashboard",
      },
      {
        path: "/products",
        name: "Products",
      },
      {
        path: "/categories",
        name: "SideMenuCategory",
      },
      {
        path: "/price-lists",
        name: "PriceLists",
        moduleKey: "priceLists",
      },
    ],
  },

  {
    icon: FiUsers,
    name: "CustomersGroup",
    routes: [
      {
        path: "/customers",
        name: "CustomersList",
      },
      {
        path: "/forms/submissions",
        name: "Forms",
        moduleKey: "forms",
      },
    ],
  },

  {
    icon: FiDollarSign,
    name: "Accounting",
    routes: [
      {
        path: "/reports/profit",
        name: "ProfitReports",
      },
      {
        /**
         * המסמכים עצמם מגיעים מריווחית ונשמרים על ההזמנה ב-`accountingDocs`,
         * ולכן המסך תלוי במודול האינטגרציה ולא ב-`accountingDocs` שדורש אותו
         * ממילא — בלי חיבור לריווחית אין מה להציג.
         */
        path: "/documents",
        name: "AccountingDocuments",
        moduleKey: "rivhit",
      },
      {
        /**
         * פרטי החיבור לספק הנהלת החשבונות — הטוקן ומה שנלווה לו.
         *
         * ללא `moduleKey`, ובכוונה. הגדרה לפי `rivhit` הייתה מסתירה את המסך
         * מלקוח שהאינטגרציה שלו עדיין כבויה — כלומר בדיוק מהלקוח שבא להדליק
         * אותה. השרת מגן על ה-endpoint ב-`isAdmin` ובסיסמת הפעולות; המודול הוא
         * מה שנערך כאן, לא תנאי מוקדם לעריכה.
         */
        path: "/accounting/settings",
        name: "AccountingSettings",
      },
    ],
  },

  /* ── הגדרות ────────────────────────────────────────────────────────
   * "משתמשי המערכת" — האנשים שעובדים בתוך חשבון של לקוח — יושבים כאן
   * ולא תחת "סופר אדמין", כי הוספת עובד היא פעולה שוטפת של המנהל אצל
   * הלקוח, ולא בקשה שמופנית ל-bizzstudio.
   *
   * השם דומה למדי ל-"משתמשי מערכת" שתחת סופר אדמין, ואלה שני דברים
   * שונים: שם — הלקוחות של bizzstudio, כאן — העובדים של לקוח בודד. שני
   * אזורים רחוקים בתפריט הם מה שמונע לחיצה על הפריט הלא-נכון.
   *
   * ללא `platformOnly`, ובכוונה: `GET /api/admin` ואחיו מוגנים ב-`isAdmin`,
   * שמקבל גם טוקן של מנהל אצל הלקוח — כך שהתפריט והשרת עונים עכשיו
   * אותו דבר על השאלה "מי רשאי לנהל משתמשים".
   */
  {
    icon: FiSettings,
    name: "Settings",
    routes: [
      {
        path: "/settings",
        name: "GeneralSettings",
      },
      {
        path: "/our-staff",
        name: "OurStaff",
      },
    ],
  },

  /**
   * BizzStudio only. `platformOnly` is read by the sidebar component, which asks
   * `usePlatformRole` and drops these entries for anyone else.
   *
   * Hiding a menu item is a COURTESY, never the control. The server refuses
   * every `/api/platform/*` call that does not carry a platform token, so a
   * tenant admin who guesses the URL gets a screen with nothing in it — which is
   * the honest outcome, and the reason it is safe to keep one app for both
   * audiences instead of building a second console.
   *
   * "משתמשי מערכת" כאן הם הלקוחות של bizzstudio. העובדים בתוך חשבון של
   * לקוח בודד — "משתמשי המערכת" — עברו לתפריט ההגדרות, כי ניהולם הוא
   * עבודה שוטפת של הלקוח עצמו. השמות דומים והתוכן שונה לגמרי, ולכן הן
   * יושבות עכשיו בשני אזורים נפרדים בתפריט.
   */
  {
    icon: FiShield,
    name: "SuperAdmin",
    platformOnly: true,
    routes: [
      {
        path: "/platform/tenants",
        name: "PlatformSystemUsers",
      },
      {
        path: "/platform/modules",
        name: "PlatformModules",
      },
    ],
  },
];

export default sidebar;
