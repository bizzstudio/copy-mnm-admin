// src/context/SidebarContext.jsx
import AdminServices from "@/services/AdminServices";
import StatusServices from "@/services/StatusService";
import PriceListServices from "@/services/PriceListServices";
import CustomerServices from "@/services/CustomerServices";
import PlatformServices from "@/services/PlatformServices";
import Cookies from "js-cookie";
import { createContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const SidebarContext = createContext();

/** אותו סדר כמו בעמוד הסטטוסים: קודם בלי טלפון, אחר כך עם טלפון */
const sortStatusesLikeStatusesPage = (list) => {
  if (!Array.isArray(list)) return list;
  return [...list].sort((a, b) => {
    if (a.phone && !b.phone) return 1;
    if (!a.phone && b.phone) return -1;
    return 0;
  });
};

export const SidebarProvider = ({ children }) => {
  const resultsPerPage = 20;
  const searchRef = useRef("");
  const invoiceRef = useRef("");
  // const dispatch = useDispatch();

  const [limitData, setLimitData] = useState(20);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBulkDrawerOpen, setIsBulkDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [lang, setLang] = useState("he");
  const [time, setTime] = useState("");
  const [sortedField, setSortedField] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [zone, setZone] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [statusesData, setStatusesData] = useState([]);
  const [cities, setCities] = useState([]);
  const [category, setCategory] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [method, setMethod] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [windowDimension, setWindowDimension] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);
  const [navBar, setNavBar] = useState(true);
  const { i18n } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [deliveryRegionId, setDeliveryRegionId] = useState(null);
  /** 'region' | 'delivery' – איזה דרוור להציג בעמוד משלוחים */
  const [deliveryDrawerContent, setDeliveryDrawerContent] = useState("delivery");
  /** 'region' | 'delivery' – במסך משלוחים: מודאל המחיקה מוחק אזור או יעד */
  const [deleteTargetType, setDeleteTargetType] = useState("delivery");
  const [priceLists, setPriceLists] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);


  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDeliveryRegionId(null);
  };
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const closeBulkDrawer = () => setIsBulkDrawerOpen(false);
  const toggleBulkDrawer = () => setIsBulkDrawerOpen(!isBulkDrawerOpen);

  const closeModal = () => setIsModalOpen(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleLanguageChange = () => {
    Cookies.set("i18next", "he", {
      sameSite: "None",
      secure: true,
    });
    i18n.changeLanguage("he");
    setLang("he");
  };

  const handleChangePage = (p) => {
    setCurrentPage(p);
  };

  const handleSubmitForAll = (e) => {
    e.preventDefault();
    if (!searchRef?.current?.value) return setSearchText(null);
    setSearchText(searchRef?.current?.value);
    setCategory(null);
  };

  useEffect(() => {
    Cookies.set("i18next", "he", {
      sameSite: "None",
      secure: true,
    });
    i18n.changeLanguage("he");
    setLang("he");
  }, [i18n]);

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // הגדרת הסטטוסים בעת עליית המערכת (אותו סדר כמו בעמוד הסטטוסים)
    const facthStatusesData = async () => {
      try {
        const data = await StatusServices.getAllStatuses({ query: '' });
        setStatusesData(sortStatusesLikeStatusesPage(data || []));
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    };

    // טעינת המחירונים בעת עליית המערכת
    const fetchPriceLists = async () => {
      try {
        const data = await PriceListServices.getAllPriceLists();
        setPriceLists(data || []);
      } catch (error) {
        console.error("Error fetching price lists:", error);
      }
    };

    // טעינת שיטות התשלום מריווחית בעת עליית המערכת
    const fetchPaymentTypes = async () => {
      try {
        const data = await CustomerServices.getPaymentTypes();
        console.log("PaymentTypes :>> ", data);
        setPaymentTypes(data || []);
      } catch (error) {
        console.error("Error fetching payment types:", error);
      }
    };

    facthStatusesData();
    fetchPriceLists();
    fetchPaymentTypes();
  }, []);

  // רענון רשימת הסטטוסים אחרי הוספה/עדכון סטטוס (כדי ש"העברה לליקוט" וכו' יופיעו בדרופדאון)
  useEffect(() => {
    if (!isUpdate) return;
    const refetchStatuses = async () => {
      try {
        const data = await StatusServices.getAllStatuses({ query: '' });
        setStatusesData(sortStatusesLikeStatusesPage(data || []));
      } catch (e) {
        console.error("Error refetching statuses:", e);
      }
      setIsUpdate(false);
    };
    refetchStatuses();
  }, [isUpdate]);

  /**
   * Every page a signed-OUT visitor is allowed to be on.
   *
   * This provider wraps the whole app, sign-in screens included, so the check
   * below runs on them too. It used to compare against the single string
   * "/login", which meant every OTHER public page — the platform sign-in, the
   * password reset, the two-factor step — ran a token validation, found no
   * cookie, and bounced the visitor to /login through `window.location`. That is
   * a full page load outside the router, so it looks exactly like "the address I
   * typed sends me back to the old screen".
   */
  const PUBLIC_PATHS = [
    "/login",
    "/platform/login",
    "/forgot-password",
    "/mfa",
  ];

  // ווידוא שהטוקן עדיין תקין
  useEffect(() => {
    const validateToken = async () => {
      try {
        const adminInfoCookie = Cookies.get("adminInfo");
        if (!adminInfoCookie) {
          window.location.pathname = "/login";
          return;
        }

        const adminInfo = JSON.parse(adminInfoCookie);
        if (!adminInfo.token) {
          window.location.pathname = "/login";
          return;
        }

        /**
         * A BizzStudio session is checked against the PLATFORM endpoint.
         *
         * `/admin/validate-token` is a tenant route, and `authenticate` refuses a
         * token whose `typ` is not the one that route accepts — which is the
         * escalation fix doing its job. Sending a platform token there returns a
         * refusal, and the code below reads any refusal as "session expired",
         * deletes the cookie and redirects. The effect was that signing in as
         * BizzStudio worked and then logged itself out on the next render.
         */
        const isPlatform =
          adminInfo.role === "superadmin" || adminInfo.role === "platform-admin";

        const ok = isPlatform
          ? Boolean(await PlatformServices.me())
          : (await AdminServices.validateToken()) === true;

        if (!ok) {
          Cookies.remove("adminInfo");
          window.location.pathname = isPlatform ? "/platform/login" : "/login";
        }
      } catch (error) {
        console.error("Error validating token:", error);
        Cookies.remove("adminInfo");
        window.location.pathname = "/login";
      }
    };

    // רק אם לא נמצאים בעמוד ציבורי
    const path = window.location.pathname;
    const isPublic =
      PUBLIC_PATHS.includes(path) || path.startsWith("/reset-password");

    if (!isPublic) {
      validateToken();
    }
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        method,
        setMethod,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        isDrawerOpen,
        toggleDrawer,
        closeDrawer,
        setIsDrawerOpen,
        closeBulkDrawer,
        isBulkDrawerOpen,
        toggleBulkDrawer,
        isModalOpen,
        toggleModal,
        closeModal,
        isUpdate,
        setIsUpdate,
        lang,
        setLang,
        handleLanguageChange,
        currentPage,
        setCurrentPage,
        handleChangePage,
        searchText,
        setSearchText,
        category,
        setCategory,
        searchRef,
        handleSubmitForAll,
        zone,
        setZone,
        time,
        setTime,
        sortedField,
        setSortedField,
        resultsPerPage,
        limitData,
        setLimitData,
        windowDimension,
        modalOpen,
        setModalOpen,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loading,
        setLoading,
        invoice,
        setInvoice,
        invoiceRef,
        setNavBar,
        navBar,
        tabIndex,
        setTabIndex,
        serviceId,
        setServiceId,
        deliveryRegionId,
        setDeliveryRegionId,
        deliveryDrawerContent,
        setDeliveryDrawerContent,
        deleteTargetType,
        setDeleteTargetType,
        statuses,
        setStatuses,
        statusesData,
        setCities,
        cities,
        priceLists,
        setPriceLists,
        paymentTypes,
        setPaymentTypes,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};