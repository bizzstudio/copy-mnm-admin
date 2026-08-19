import { lazy } from "react";

// use lazy for better code splitting
const StatusInvoice = lazy(()=>import("@/pages/StatusInvoice"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StockDashboard = lazy(() => import("@/pages/StockDashboard"));
const Attributes = lazy(() => import("@/pages/Attributes"));
const ChildAttributes = lazy(() => import("@/pages/ChildAttributes"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const Category = lazy(() => import("@/pages/Category"));
const Offers = lazy(() => import("@/pages/Offers"));
const ChildCategory = lazy(() => import("@/pages/ChildCategory"));
const Staff = lazy(() => import("@/pages/Staff"));
const Customers = lazy(() => import("@/pages/Customers"));
const CustomerOrder = lazy(() => import("@/pages/CustomerOrder"));
const CustomerPage = lazy(() => import("@/pages/CustomerPage"));
const CustomerAdd = lazy(() => import("@/pages/CustomerAdd"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderChannelRedirect = lazy(() => import("@/pages/OrderChannelRedirect"));
const CashierOrderInvoice = lazy(() => import("@/pages/CashierOrderInvoice"));
const Statuses = lazy(() => import("@/pages/Statuses"));
const OrderInvoice = lazy(() => import("@/pages/OrderInvoice"));
const Coupons = lazy(() => import("@/pages/Coupons"));
const Page404 = lazy(() => import("@/pages/404"));
const ComingSoon = lazy(() => import("@/pages/ComingSoon"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const Languages = lazy(() => import("@/pages/Languages"));
const Currencies = lazy(() => import("@/pages/Currencies"));
const Setting = lazy(() => import("@/pages/Setting"));
const StoreHome = lazy(() => import("@/pages/StoreHome"));
const StoreSetting = lazy(() => import("@/pages/StoreSetting"));
const Scripts = lazy(() => import("@/pages/Scripts"));
const Deliveries = lazy(() => import("@/pages/Deliveries"));
const DeliveryEdit = lazy(() => import("@/pages/DeliveryEdit"));
const Popups = lazy(() => import("@/pages/Popups"));
const Messages = lazy(() => import("@/pages/Messages"));
const Blogs = lazy(() => import("@/pages/Blogs"));
const PriceLists = lazy(() => import("@/pages/PriceLists"));
const FormSubmissions = lazy(() => import("@/pages/FormSubmissions"));

/* המסכים החדשים: רווחיות, ליקוט, רכש, ערוצים, משלוח ומסמכים. */
const ProfitReport = lazy(() => import("@/pages/ProfitReport"));
const AccountingDocuments = lazy(() => import("@/pages/AccountingDocuments"));
const AccountingSettings = lazy(() => import("@/pages/AccountingSettings"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const PickingBoard = lazy(() => import("@/pages/PickingBoard"));
const StockLocations = lazy(() => import("@/pages/StockLocations"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const GoodsReceipt = lazy(() => import("@/pages/GoodsReceipt"));
const SalesChannels = lazy(() => import("@/pages/SalesChannels"));
const ShippingProviders = lazy(() => import("@/pages/ShippingProviders"));

// BizzStudio's platform screens — see the note at their route entries below.
const PlatformTenants = lazy(() => import("@/pages/platform/Tenants"));
const PlatformTenantWizard = lazy(() => import("@/pages/platform/TenantWizard"));
const PlatformTenantSettings = lazy(() => import("@/pages/platform/TenantSettings"));
const PlatformModules = lazy(() => import("@/pages/platform/PlatformModules"));
const Agents = lazy(() => import("@/pages/Agents"));

/*
//  * ⚠ These are internal routes!
//  * They will be rendered inside the app, using the default `containers/Layout`.
//  * If you want to add a route to, let's say, a landing page, you should add
//  * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
//  * are routed.
//  *
//  * If you're looking for the links rendered in the SidebarContent, go to
//  * `routes/sidebar.js`
 */

const routes = [
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/stock-dashboard",
    component: StockDashboard,
  },
  {
    path: "/products",
    component: Products,
  },
  {
    path: "/deliveries",
    component: Deliveries,
  },
  {
    path: "/deliveries/:id",
    component: DeliveryEdit,
  },
  {
    path: "/attributes",
    component: Attributes,
  },
  {
    path: "/attributes/:id",
    component: ChildAttributes,
  },
  {
    path: "/product/:id",
    component: ProductDetails,
  },
  {
    path: "/categories",
    component: Category,
  },
  {
    path: "/offers",
    component: Offers,
  },
  {
    path: "/languages",
    component: Languages,
  },
  {
    path: "/currencies",
    component: Currencies,
  },

  {
    path: "/categories/:id",
    component: ChildCategory,
  },
  {
    path: "/customers",
    component: Customers,
  },
  {
    path: "/customer/add",
    component: CustomerAdd,
  },
  {
    path: "/customer/:id",
    component: CustomerPage,
  },
  {
    path: "/customer-order/:id",
    component: CustomerOrder,
  },
  {
    path: "/our-staff",
    component: Staff,
  },
  {
    path: "/orders",
    component: Orders,
  },
  /**
   * שני הנתיבים האלה הם כעת פילטר על מסך ההזמנות המאוחד, לא מסכים בפני עצמם.
   * נשארים רשומים כדי שסימנייה ישנה תגיע למקום הנכון ולא ל-404.
   */
  {
    path: "/cashier-orders",
    component: OrderChannelRedirect,
  },
  {
    path: "/agent-orders",
    component: OrderChannelRedirect,
  },
  {
    path: "/cashier-order/:id",
    component: CashierOrderInvoice,
  },
  {
    path: "/statuses",
    component: Statuses,
  },
  {
    path: "/status/:id",
    component: StatusInvoice ,
  },
  {
    path: "/order/:id",
    component: OrderInvoice,
  },
  {
    path: "/coupons",
    component: Coupons,
  },
  { path: "/settings", component: Setting },
  {
    path: "/store/customization",
    component: StoreHome,
  },
  {
    path: "/store/store-settings",
    component: StoreSetting,
  },
  {
    path: "/store/scripts",
    component: Scripts,
  },
  {
    path: "/404",
    component: Page404,
  },
  {
    path: "/coming-soon",
    component: ComingSoon,
  },
  {
    path: "/edit-profile",
    component: EditProfile,
  },
  {
    path: "/popups",
    component: Popups,
  },
  {
    path: "/whatsappbot",
    component: Messages,
  },
  {
    path: "/blogs",
    component: Blogs,
  },
  {
    path: "/price-lists",
    component: PriceLists,
  },
  {
    path: "/forms/submissions",
    component: FormSubmissions,
    title: "FormsSubmissionsPageTitle",
  },

  /* ── המסכים החדשים ────────────────────────────────────────────────────────
   * הסינון בסיידבר לפי `moduleKey` הוא נוחות בלבד — הנתיבים עצמם רשומים תמיד,
   * כי השרת הוא זה שמסרב: `requireModule` מחזיר 404 לבקשה של מודול כבוי, ומסך
   * ריק הוא התוצאה הכנה למי שהקליד כתובת ידנית.
   */
  {
    path: "/reports/profit",
    component: ProfitReport,
    title: "ProfitReports",
  },
  {
    path: "/documents",
    component: AccountingDocuments,
    title: "AccountingDocuments",
  },
  {
    /**
     * הכתובת הישנה של מסך האינטגרציות של הנהלת החשבונות. הרכיב מפנה ל-
     * `/integrations/finance`, ונשאר רשום כדי שסימנייה לא תיפול ל-404.
     */
    path: "/accounting/settings",
    component: AccountingSettings,
    title: "AccountingSettings",
  },
  {
    /**
     * מסך אחד לשלוש קבוצות האינטגרציה — `finance`, `shipping`, `sales-channel`.
     * הקבוצות עצמן מוגדרות ב-`components/platform/platformState`, ולכן קבוצה
     * רביעית היא שורה שם ופריט בסרגל, ולא מסך נוסף.
     */
    path: "/integrations/:group",
    component: Integrations,
    title: "Integrations",
  },
  {
    path: "/picking",
    component: PickingBoard,
    title: "PickingManagement",
  },
  {
    path: "/stock-locations",
    component: StockLocations,
    title: "StockLocations",
  },
  {
    path: "/suppliers",
    component: Suppliers,
    title: "Suppliers",
  },
  {
    path: "/goods-receipt",
    component: GoodsReceipt,
    title: "GoodsReceipt",
  },
  {
    path: "/channels",
    component: SalesChannels,
    title: "SalesChannels",
  },
  {
    path: "/shipping",
    component: ShippingProviders,
    title: "ShippingProviders",
  },
  {
    path: "/agents",
    component: Agents,
    title: "AgentsPageTitle",
  },

  /**
   * BizzStudio's own screens — the tenant list, the creation wizard, one
   * tenant's settings, and the module catalogue.
   *
   * They sit in the ORDINARY admin, not a separate console. There is one app to
   * build, deploy and keep working, and a super-admin who is already looking at
   * a tenant's data does not have to change tabs to change its plan.
   *
   * Hidden from a tenant's staff by the sidebar, which asks `usePlatformRole`.
   * That is UX only, and deliberately so: the server refuses every
   * `/api/platform/*` call that does not carry a platform token, so a tenant
   * admin who types the URL by hand reaches a screen that can load nothing.
   */
  /**
   * "משתמשי מערכת" ולא "לקוחות": ברמת המוצר אלה הארגונים שמשתמשים במערכת, ואילו
   * "לקוחות" הוא כבר תפוס — הוא הלקוחות של הלקוח, במסך /customers.
   *
   * ה-path נשאר `/platform/tenants`. שינוי שלו היה שובר סימניות, את
   * `routeCoverage.test.js` ואת כל הקישורים הפנימיים, בשביל טקסט שהמשתמש
   * ממילא לא רואה בכתובת.
   */
  {
    path: "/platform/tenants",
    component: PlatformTenants,
    title: "משתמשי מערכת",
  },
  {
    path: "/platform/tenants/new",
    component: PlatformTenantWizard,
    title: "משתמש מערכת חדש",
  },
  {
    path: "/platform/tenants/:id",
    component: PlatformTenantSettings,
    title: "הגדרות משתמש מערכת",
  },
  {
    path: "/platform/modules",
    component: PlatformModules,
    title: "מודולים",
  },
];

export default routes;