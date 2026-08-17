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
const CashierOrders = lazy(() => import("@/pages/CashierOrders"));
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

// BizzStudio's platform screens — see the note at their route entries below.
const PlatformTenants = lazy(() => import("@/pages/platform/Tenants"));
const PlatformTenantWizard = lazy(() => import("@/pages/platform/TenantWizard"));
const PlatformTenantSettings = lazy(() => import("@/pages/platform/TenantSettings"));
const PlatformModules = lazy(() => import("@/pages/platform/PlatformModules"));
const Agents = lazy(() => import("@/pages/Agents"));
const AgentOrders = lazy(() => import("@/pages/AgentOrders"));

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
  {
    path: "/cashier-orders",
    component: CashierOrders,
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
  {
    path: "/agents",
    component: Agents,
    title: "AgentsPageTitle",
  },
  {
    path: "/agent-orders",
    component: AgentOrders,
    title: "AgentOrdersPageTitle",
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
  {
    path: "/platform/tenants",
    component: PlatformTenants,
    title: "לקוחות",
  },
  {
    path: "/platform/tenants/new",
    component: PlatformTenantWizard,
    title: "לקוח חדש",
  },
  {
    path: "/platform/tenants/:id",
    component: PlatformTenantSettings,
    title: "הגדרות לקוח",
  },
  {
    path: "/platform/modules",
    component: PlatformModules,
    title: "מודולים",
  },
];

export default routes;