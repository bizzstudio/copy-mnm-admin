import {
  FiGrid,
  FiUsers,
  FiUser,
  FiCompass,
  FiSettings,
  FiSlack,
  FiGlobe,
  FiTarget,
  FiFileText,
  FiPackage,
} from "react-icons/fi";
import { FaRegWindowRestore } from "react-icons/fa6";
import { GoDependabot } from "react-icons/go";
import { IoNewspaperOutline } from "react-icons/io5";
// import ChatbotIcon from '../../public/chatbot.svg';

/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const sidebar = [
  {
    path: "/dashboard", // the url
    icon: FiGrid, // icon
    name: "Dashboard", // name that appear in Sidebar
  },

  {
    path: "/stock-dashboard",
    icon: FiPackage,
    name: "StockDashboard",
  },

  {
    icon: FiSlack,
    name: "Catalog",
    routes: [
      {
        path: "/products",
        name: "Products",
      },
      {
        path: "/price-lists",
        name: "PriceLists",
      },
      {
        path: "/categories",
        name: "Categories",
      },
      // {
      //   path: "/attributes",
      //   name: "Attributes",
      // },
      {
        path: "/coupons",
        name: "Coupons",
      },
      {
        path: "/offers",
        name: "Offers",
      },
    ],
  },

  {
    path: "/customers",
    icon: FiUsers,
    name: "Customers",
  },

  {
    icon: FiCompass,
    name: "Orders",
    routes: [
      {
        path: "/orders",
        name: "Orders",
      },
      {
        path: "/cashier-orders",
        name: "CashierOrders",
      },
      {
        path: "/agent-orders",
        name: "AgentOrders",
      },
      {
        path: "/statuses",
        name: "Statuses",
      },
    ],
  },

  {
    path: "/our-staff",
    icon: FiUser,
    name: "OurStaff",
  },

  {
    path: "/agents",
    icon: FiTarget,
    name: "Agents",
  },

  {
    path: "/settings?settingTab=common-settings",
    icon: FiSettings,
    name: "Settings",
  },

  // {
  //   icon: FiGlobe,
  //   name: "International",
  //   routes: [
  //     {
  //       path: "/languages",
  //       name: "Languages",
  //     },
  //     {
  //       path: "/currencies",
  //       name: "Currencies",
  //     },
  //   ],
  // },

  {
    icon: FiGlobe,
    name: "Shiping",
    path: "/deliveries",
  },

  {
    icon: FiTarget,
    name: "OnlineStore",
    routes: [
      {
        name: "ViewStore",
        path: "https://www.nmplus.co.il",
        outside: "store",
      },
      {
        name: "ViewLikutApp",
        path: "https://likut.meshek-kirshner.co.il/items",
        outside: "likutApp",
      },
      {
        name: "ViewAgentsApp",
        path: "https://demoagent.bizzstudio.co.il",
        outside: "agentsApp",
      },
      {
        path: "/store/customization",
        name: "StoreCustomization",
      },
      {
        path: "/store/store-settings",
        name: "StoreSetting",
      },
      {
        path: "/store/scripts",
        name: "Scripts",
      },
    ],
  },

  // {
  //   icon: FiSlack,
  //   name: "Pages",
  //   routes: [
  //     // submenu

  //     {
  //       path: "/404",
  //       name: "404",
  //     },
  //     {
  //       path: "/coming-soon",
  //       name: "ComingSoon",
  //     },
  //   ],
  // },

  {
    icon: FaRegWindowRestore,
    name: "Popups",
    path: "/popups",
  },
  // {
  //   icon: GoDependabot,
  //   name: "WhatsApp Bot",
  //   path: "/whatsappbot",
  // },
  {
    icon: IoNewspaperOutline,
    name: "Blogs",
    path: "/blogs",
  },

  {
    icon: FiFileText,
    name: "Forms",
    path: "/forms/submissions",
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
   */
  {
    icon: FiGlobe,
    name: "לקוחות",
    path: "/platform/tenants",
    platformOnly: true,
  },
  {
    icon: FiPackage,
    name: "מודולים",
    path: "/platform/modules",
    platformOnly: true,
  },
];

export default sidebar;
