import {
  FiGrid,
  FiUsers,
  FiSettings,
  FiTarget,
  FiPackage,
  FiBox,
  FiShoppingCart,
  FiDollarSign,
  FiBarChart2,
  FiShield,
} from "react-icons/fi";

/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 *
 * ── מקור המבנה ────────────────────────────────────────────────────────────
 * ההיררכיה כאן היא זו של "מבנה מערכת ניהול עסק.xlsx": תשעה מדורים, ובאותו סדר
 * שבו הם מופיעים שם. כשמסך משנה את מקומו בקובץ, הוא משנה את מקומו גם כאן —
 * הקובץ הוא ההגדרה, לא הצילום של מה שנבנה עד כה.
 *
 * ── שלושה מפתחות שקובעים מי רואה מה ────────────────────────────────────────
 *
 *   platformOnly  bizzstudio בלבד. נבדק מול `usePlatformRole`.
 *   moduleKey     המסך קיים רק אם המודול דלוק אצל הלקוח. המפתחות הם אלה של
 *                 `@bizzexpo/shared/modules` — אותם מפתחות ש-`requireModule`
 *                 בשרת בודק, כדי שתפריט וסירוב לא יוכלו לחלוק על אותה שאלה.
 *   disabled      הפריט מופיע באקסל אך המסך עדיין לא נבנה. מרונדר אפור, בלי
 *                 קישור ועם תווית "בקרוב". ראה ההסבר למטה.
 *
 * שני הראשונים הם נוחות, לא בקרה: השרת מסרב מצדו בכל מקרה. ההסתרה כאן היא כדי
 * שלקוח לא ילחץ על פריט ויקבל 404 שנראה כמו תקלה.
 *
 * ── למה `disabled` ולא השמטה, ולא נתיב ל-ComingSoon ────────────────────────
 * כעשרים מסכים שבאקסל טרם נבנו. השמטתם הייתה משאירה תפריט שנראה שלם ומסתירה
 * את מה שעוד חסר — ומי שמסתכל על הקובץ ועל המערכת זה לצד זה לא היה יכול לדעת
 * מה מהם. נתיב אמיתי, מצדו השני, מבטיח מסך: לחיצה שמגיעה ל-404 או ל-"Coming
 * Soon" היא הבטחה שנשברת בקליק אחד.
 *
 * פריט מושבת אומר את האמת מראש — הוא נראה, הוא לא לחיץ, וכתוב עליו "בקרוב".
 * כשהמסך נבנה, מוחקים `disabled` ומוסיפים `path`. זה כל השינוי.
 *
 * ── שלוש רמות של תת-תפריט ──────────────────────────────────────────────────
 * `routes` בתוך `routes` מרונדר על ידי אותו `SidebarSubMenu` ברמת הזחה עמוקה
 * יותר. קבוצה שכל בניה סוננו נעלמת — היא כותרת שנפתחת לכלום. קבוצה שכל בניה
 * מושבתים נשארת, כי היא כן אומרת משהו: הענף הזה מתוכנן ועוד לא קיים.
 */
const sidebar = [
  /* ── 1. דשבורד ────────────────────────────────────────────────────────────
   * חמשת הפריטים שמתחת לדשבורד באקסל — תמונת מצב, הזמנות אחרונות, התראות מלאי,
   * מכירות/הכנסות ומשימות חריגות — הם הווידג׳טים שבתוך המסך, ולא חמישה מסכים.
   * הם נשארים בעמוד עצמו; פיצולם לפריטי תפריט היה מייצר חמש כתובות לתוכן שכבר
   * נראה במבט אחד.
   */
  {
    path: "/dashboard",
    icon: FiGrid,
    name: "Dashboard",
  },

  /* ── 2. הזמנות ─────────────────────────────────────────────────────────────
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
        path: "/channels",
        name: "SalesChannels",
      },
      {
        path: "/statuses",
        name: "Statuses",
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
          {
            /* מי נוהג במשאית, להבדיל מ-`ShippingProvider` שהוא עם מי מוסרים. */
            name: "Drivers",
            disabled: true,
          },
        ],
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
    ],
  },

  /* ── 3. מלאי ───────────────────────────────────────────────────────────────
   * "מחסנים" עבר לכאן מ"ליקוט ורכש". מיקום מחסן הוא נתון של המלאי — כמה יש
   * ואיפה — ולא של פעולת הליקוט, ולכן הוא יושב ליד המוצרים שהוא סופר.
   */
  {
    icon: FiPackage,
    name: "Inventory",
    routes: [
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
      {
        path: "/stock-locations",
        name: "StockLocations",
        moduleKey: "stockLocations",
      },
      {
        /* יומן הכניסות והיציאות. `StockItem` מחזיק את היתרה, לא את התנועות. */
        name: "StockMovements",
        disabled: true,
      },
    ],
  },

  /* ── 4. לקוחות ─────────────────────────────────────────────────────────────
   * "טפסים" אינו באקסל ונשאר כאן: הוא מסך חי, וההגשות שהוא מציג הן של לקוחות.
   */
  {
    icon: FiUsers,
    name: "CustomersGroup",
    routes: [
      {
        path: "/customers",
        name: "CustomersList",
      },
      {
        /* `MainCustomer.customerType` הוא היום enum קשיח בקוד ולא טבלה נערכת. */
        name: "CustomerTypes",
        disabled: true,
      },
      {
        name: "Contacts",
        disabled: true,
      },
      {
        path: "/forms/submissions",
        name: "Forms",
        moduleKey: "forms",
      },
    ],
  },

  /* ── 5. קליטה וליקוט ──────────────────────────────────────────────────────
   * הצד התפעולי: מה יוצא מהמחסן ומה נכנס אליו. השם באקסל הוא "קליטה וליקוט"
   * ולא "ליקוט ורכש", והוא המדויק מבין השניים — הספקים כאן משמשים את הקליטה.
   */
  {
    icon: FiBox,
    name: "ReceivingAndPicking",
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
    ],
  },

  /* ── 6. סוכנים ─────────────────────────────────────────────────────────────
   * אינו באקסל, ונשאר מדור בפני עצמו: זו אפליקציה נפרסת משלה (`agents`) עם
   * מסכים משלה, וקיפולה לתוך "לקוחות" או "הזמנות" היה מפצל מודול עובד לשניים.
   */
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

  /* ── 7. הנהלת חשבונות ─────────────────────────────────────────────────────
   * חמשת סוגי המסמכים שבאקסל הם מסך אחד עם פילטר, ולא חמישה מסכים. כל פריט כאן
   * מצביע על `/documents` עם `?type=` — אותם מפתחות שהשרת מחזיר ב-`DOC_TYPES`
   * ב-`accountingDocsController`, ולכן הרשימה שנפתחת היא בדיוק זו שהמשתמש ביקש.
   *
   * "דוחות רווחיות" עבר למדור "דוחות". הוא דוח, לא מסמך, ובאקסל הוא באמת שם.
   * "הגדרות הנהלת חשבונות" עברו ל"ניהול מערכת ← אינטגרציות" — פרטי חיבור לספק
   * חיצוני, ולא עבודה יומיומית של מנהל חשבונות.
   */
  {
    icon: FiDollarSign,
    name: "Accounting",
    routes: [
      {
        path: "/documents?type=invoice",
        name: "DocInvoices",
        moduleKey: "rivhit",
      },
      {
        path: "/documents?type=receipt",
        name: "DocReceipts",
        moduleKey: "rivhit",
      },
      {
        path: "/documents?type=invoiceReceipt",
        name: "DocInvoiceReceipts",
        moduleKey: "rivhit",
      },
      {
        path: "/documents?type=deliveryNote",
        name: "DocDeliveryNotes",
        moduleKey: "rivhit",
      },
      {
        path: "/documents?type=creditInvoice",
        name: "DocCreditInvoices",
        moduleKey: "rivhit",
      },
      {
        /* מסמך פרופורמה. אינו אחד מ-`DOC_TYPES` בריווחית — אין מה לסנן אליו. */
        name: "TransactionAccount",
        disabled: true,
      },
      {
        name: "ReceivablesReport",
        disabled: true,
      },
      {
        /**
         * אינו באקסל ונשאר: בלי פריט חסר-פילטר אין דרך לראות את כל המסמכים יחד,
         * וזו בדיוק השאלה שהמסך נבנה כדי לענות עליה.
         *
         * המסמכים עצמם מגיעים מריווחית ונשמרים על ההזמנה ב-`accountingDocs`,
         * ולכן המסך תלוי במודול האינטגרציה — בלי חיבור לריווחית אין מה להציג.
         */
        path: "/documents",
        name: "AllDocuments",
        moduleKey: "rivhit",
      },
    ],
  },

  /* ── 8. דוחות ──────────────────────────────────────────────────────────────
   * מדור חדש. "דשבורד מלאי" ו"דוחות רווחיות" היו פזורים תחת "מלאי" ו"הנהלת
   * חשבונות" — שני דוחות שנמצאו במקומות שונים כי כל אחד מהם נבנה בזמן אחר.
   */
  {
    icon: FiBarChart2,
    name: "Reports",
    routes: [
      {
        path: "/stock-dashboard",
        name: "InventoryReport",
      },
      {
        name: "SalesReport",
        disabled: true,
      },
      {
        path: "/reports/profit",
        name: "ProfitReports",
      },
      {
        /* אותו דוח שמופיע גם תחת הנהלת חשבונות — כך הוא רשום באקסל בשני המקומות. */
        name: "ReceivablesReport",
        disabled: true,
      },
    ],
  },

  /* ── 9. ניהול מערכת ───────────────────────────────────────────────────────
   * היה "הגדרות". "משתמשי המערכת" — האנשים שעובדים בתוך חשבון של לקוח — יושבים
   * כאן ולא תחת "סופר אדמין", כי הוספת עובד היא פעולה שוטפת של המנהל אצל
   * הלקוח, ולא בקשה שמופנית ל-bizzstudio.
   *
   * השם דומה למדי ל"משתמשי מערכת" שתחת סופר אדמין, ואלה שני דברים שונים: שם —
   * הלקוחות של bizzstudio, כאן — העובדים של לקוח בודד. שני אזורים רחוקים
   * בתפריט הם מה שמונע לחיצה על הפריט הלא-נכון.
   *
   * ללא `platformOnly`, ובכוונה: `GET /api/admin` ואחיו מוגנים ב-`isAdmin`,
   * שמקבל גם טוקן של מנהל אצל הלקוח — כך שהתפריט והשרת עונים עכשיו אותו דבר
   * על השאלה "מי רשאי לנהל משתמשים".
   */
  {
    icon: FiSettings,
    name: "SystemManagement",
    routes: [
      {
        path: "/our-staff",
        name: "OurStaff",
      },
      {
        name: "RolesAndPermissions",
        disabled: true,
      },
      {
        path: "/settings",
        name: "GeneralSettings",
      },
      {
        /* יש `Branch` ומודול `multiBranch`, אין מסך שעורך אותם. */
        name: "BranchesAndCompanies",
        disabled: true,
      },
      {
        name: "Webhooks",
        disabled: true,
      },
      {
        /**
         * ארבע הקבוצות ושמותיהן הן אלה שבאקסל. הספקים שמתחתיהן שם — קארדקום,
         * אייקונט, ציטה, מחסני חשמל, לייון וייל — אינם פריטי תפריט אלא כרטיסים
         * בתוך מסך האינטגרציה של אותה קטגוריה, ולכן אינם מופיעים כאן.
         */
        name: "Integrations",
        routes: [
          {
            /**
             * פרטי החיבור לספק הנהלת החשבונות — הטוקן ומה שנלווה לו.
             *
             * ללא `moduleKey`, ובכוונה. הגדרה לפי `rivhit` הייתה מסתירה את המסך
             * מלקוח שהאינטגרציה שלו עדיין כבויה — כלומר בדיוק מהלקוח שבא להדליק
             * אותה. השרת מגן על ה-endpoint ב-`isAdmin` ובסיסמת הפעולות; המודול
             * הוא מה שנערך כאן, לא תנאי מוקדם לעריכה.
             */
            path: "/accounting/settings",
            name: "AccountingIntegrations",
          },
          {
            /**
             * מפתח `chita` מוגדר ב-shared, האדפטר עדיין לא נכתב.
             *
             * `CourierIntegrations` ולא `ShippingIntegrations` — האחרון כבר משמש
             * ככותרת כרטיס במסך חברות המשלוח, ושימוש חוזר בו היה קושר שני
             * טקסטים שאין ביניהם קשר.
             */
            name: "CourierIntegrations",
            disabled: true,
          },
          {
            /* `woocommerce` / `shopify` / `pos` — מוגדרים, לא ממומשים. */
            name: "PlatformIntegrations",
            disabled: true,
          },
          {
            name: "DriverIntegrations",
            disabled: true,
          },
        ],
      },
      {
        name: "ImportExport",
        disabled: true,
      },
      {
        /* פעמון ההתראות בכותרת קיים; מסך שמגדיר מי מקבל מה — לא. */
        name: "NotificationSettings",
        disabled: true,
      },
      {
        /* `AuditEvent` נכתב היום ואינו נקרא בשום מסך. */
        name: "Logs",
        routes: [
          {
            name: "ActivityLog",
            disabled: true,
          },
          {
            name: "SyncErrorLog",
            disabled: true,
          },
        ],
      },
      {
        name: "Automations",
        routes: [
          {
            /**
             * המסך קיים מזמן ב-`/whatsappbot` ולא היה מקושר משום מקום בתפריט —
             * אפשר היה להגיע אליו רק בהקלדת הכתובת. האקסל נותן לו מקום, וזה
             * המקום.
             *
             * ללא `moduleKey`: `whatsapp` אינו ב-`registerImplemented` בשרת,
             * ולכן `isModuleEnabled` היה מחזיר false לכל לקוח והפריט לא היה
             * מופיע לאיש — כלומר בדיוק המצב שממנו יצאנו.
             */
            path: "/whatsappbot",
            name: "WhatsappAutomation",
          },
        ],
      },
    ],
  },

  /**
   * BizzStudio only. `platformOnly` is read by the sidebar component, which asks
   * `usePlatformRole` and drops these entries for anyone else.
   *
   * אינו באקסל, ובצדק — האקסל מתאר את המערכת מנקודת מבטו של הלקוח, וזה המדור
   * היחיד שהוא לעולם לא רואה. נשאר מדור נפרד בתחתית מאותה סיבה.
   *
   * Hiding a menu item is a COURTESY, never the control. The server refuses
   * every `/api/platform/*` call that does not carry a platform token, so a
   * tenant admin who guesses the URL gets a screen with nothing in it — which is
   * the honest outcome, and the reason it is safe to keep one app for both
   * audiences instead of building a second console.
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
