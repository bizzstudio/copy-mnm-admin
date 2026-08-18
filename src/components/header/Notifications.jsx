// src/components/header/Notifications.jsx
import React, { useState, useEffect, useRef } from "react";
import {
    IoClose,
    IoNotificationsSharp,
    IoInformationCircleSharp,
    IoWarningSharp,
    IoCheckmarkCircleSharp,
    IoAlertCircleSharp,
    IoInformationCircle,
    IoWarning,
    IoCheckmarkCircle,
    IoAlertCircle
} from "react-icons/io5";
import dayjs from "dayjs";
import cookies from "js-cookie";
import NotificationServices from "@/services/NotificationServices";
import { useTranslation } from "react-i18next";
// import { io } from "socket.io-client";

const Notifications = () => {
    const { t } = useTranslation();

    const [notificationOpen, setNotificationOpen] = useState(false);
    const nRef = useRef();
    // מערך התראות דמה
    // const mockNotifications = [
    //     {
    //         _id: "1",
    //         type: "info",
    //         content: {
    //             he: "ברוכים הבאים למערכת הניהול!",
    //             en: "Welcome to the management system!"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 דקות קודם
    //         link: "/dashboard"
    //     },
    //     {
    //         _id: "2",
    //         type: "warning",
    //         content: {
    //             he: "יש לך 3 משימות שטרם הושלמו",
    //             en: "You have 3 pending tasks"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 דקות קודם
    //         link: "/tasks"
    //     },
    //     {
    //         _id: "3",
    //         type: "success",
    //         content: {
    //             he: "המשימה הושלמה בהצלחה!",
    //             en: "Task completed successfully!"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 דקות קודם
    //         link: null
    //     },
    //     {
    //         _id: "4",
    //         type: "error",
    //         content: {
    //             he: "שגיאה בטעינת הנתונים",
    //             en: "Error loading data"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 דקות קודם
    //         link: null
    //     },
    //     {
    //         _id: "5",
    //         type: "info",
    //         content: {
    //             he: "עדכון חדש זמין למערכת",
    //             en: "New system update available"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 60), // שעה קודם
    //         link: "/updates"
    //     },
    //     {
    //         _id: "6",
    //         type: "warning",
    //         content: {
    //             he: "הזיכרון של השרת מתמלא - 85%",
    //             en: "Server memory is filling up - 85%"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 90), // שעה וחצי קודם
    //         link: "/admin/server"
    //     },
    //     {
    //         _id: "7",
    //         type: "success",
    //         content: {
    //             he: "הגיבוי הושלם בהצלחה",
    //             en: "Backup completed successfully"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 120), // שעתיים קודם
    //         link: null
    //     },
    //     {
    //         _id: "8",
    //         type: "info",
    //         content: {
    //             he: "משתמש חדש נרשם למערכת",
    //             en: "New user registered to the system"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 180), // 3 שעות קודם
    //         link: "/users"
    //     },
    //     {
    //         _id: "9",
    //         type: "warning",
    //         content: {
    //             he: "חיבור לאינטרנט איטי - בדוק את החיבור",
    //             en: "Slow internet connection - check your connection"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 240), // 4 שעות קודם
    //         link: null
    //     },
    //     {
    //         _id: "10",
    //         type: "error",
    //         content: {
    //             he: "שגיאה בהעלאת קובץ - הקובץ גדול מדי",
    //             en: "File upload error - file too large"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 300), // 5 שעות קודם
    //         link: null
    //     },
    //     {
    //         _id: "11",
    //         type: "success",
    //         content: {
    //             he: "הדוח הופק בהצלחה",
    //             en: "Report generated successfully"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 360), // 6 שעות קודם
    //         link: "/reports"
    //     },
    //     {
    //         _id: "12",
    //         type: "info",
    //         content: {
    //             he: "פגישה מתוכננת בעוד שעה",
    //             en: "Meeting scheduled in one hour"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 420), // 7 שעות קודם
    //         link: "/calendar"
    //     },
    //     {
    //         _id: "13",
    //         type: "warning",
    //         content: {
    //             he: "הרשאות המשתמש יפוגו בעוד 3 ימים",
    //             en: "User permissions will expire in 3 days"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 480), // 8 שעות קודם
    //         link: "/permissions"
    //     },
    //     {
    //         _id: "14",
    //         type: "success",
    //         content: {
    //             he: "התשלום עבר בהצלחה",
    //             en: "Payment processed successfully"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 540), // 9 שעות קודם
    //         link: "/billing"
    //     },
    //     {
    //         _id: "15",
    //         type: "error",
    //         content: {
    //             he: "שגיאה בשרת - נסה שוב מאוחר יותר",
    //             en: "Server error - please try again later"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 600), // 10 שעות קודם
    //         link: null
    //     },
    //     {
    //         _id: "16",
    //         type: "info",
    //         content: {
    //             he: "הודעה חדשה מהמנהל",
    //             en: "New message from administrator"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 720), // 12 שעות קודם
    //         link: "/messages"
    //     },
    //     {
    //         _id: "17",
    //         type: "warning",
    //         content: {
    //             he: "המערכת תעבור לתחזוקה בעוד שעתיים",
    //             en: "System maintenance in 2 hours"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 900), // 15 שעות קודם
    //         link: "/maintenance"
    //     },
    //     {
    //         _id: "18",
    //         type: "success",
    //         content: {
    //             he: "הפרופיל עודכן בהצלחה",
    //             en: "Profile updated successfully"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 1080), // 18 שעות קודם
    //         link: "/profile"
    //     },
    //     {
    //         _id: "19",
    //         type: "info",
    //         content: {
    //             he: "סקר חדש זמין - השתתף עכשיו",
    //             en: "New survey available - participate now"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 1260), // 21 שעות קודם
    //         link: "/surveys"
    //     },
    //     {
    //         _id: "20",
    //         type: "error",
    //         content: {
    //             he: "התחברות נכשלה - בדוק את פרטי הכניסה",
    //             en: "Login failed - check your credentials"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 1440), // 24 שעות קודם
    //         link: null
    //     },
    //     {
    //         _id: "21",
    //         type: "warning",
    //         content: {
    //             he: "הקובץ נמחק בטעות - שחזור זמין",
    //             en: "File deleted accidentally - recovery available"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 1620), // 27 שעות קודם
    //         link: "/recovery"
    //     },
    //     {
    //         _id: "22",
    //         type: "success",
    //         content: {
    //             he: "ההרשמה לאירוע הושלמה",
    //             en: "Event registration completed"
    //         },
    //         createdAt: new Date(Date.now() - 1000 * 60 * 1800), // 30 שעות קודם
    //         link: "/events"
    //     }
    // ];

    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const currentLanguageCode = cookies.get("i18next") || "he";

    // התחברות ל-Socket.IO
    // useEffect(() => {
    //     const link = import.meta.env.VITE_APP_SOCKET_URL;

    //     const socket = io(link, {
    //         path: "/taxis-backend-socket",
    //         transports: ["websocket"],
    //     });

    //     socket.on("connect", () => {
    //         console.log("Notifications connected to Socket.IO");
    //     });

    //     // האזנה לאירועי יצירת התראה
    //     socket.on("notification-created", (newNotification) => {
    //         setNotifications((prev) => [newNotification, ...prev]);
    //         setUnreadCount((prev) => prev + 1); // עדכון ספירת ההתראות שלא נקראו
    //     });

    //     // ניתוק הסוקט בעת סגירת הקומפוננטה
    //     return () => {
    //         socket.disconnect();
    //     };
    // }, []);

    // פונקציה לטיפול באירוע לחיצה מחוץ לקומפוננטה, לסגירת חלון ההתראות
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!nRef?.current?.contains(e.target)) {
                setNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [nRef]);

    // טעינת התראות מבעוד מועד, כשנטענת הקומפוננטה לראשונה
    useEffect(() => {
        fetchNotifications(1);
    }, []);

    // פונקציה לטעינת התראות עם דפדוף
    const fetchNotifications = async (page) => {
        /**
         * A BizzStudio session has no notifications to fetch.
         *
         * Notifications belong to ONE tenant, and a platform operator is not
         * inside one — so `/api/notification` answers 404, correctly, because it
         * cannot say whose. Guarded here rather than at the call site because
         * this is reached from mount, from paging and from the bell itself, and
         * each retry added another 404 to a console that ended up with dozens of
         * them. A page that looks broken is the first thing anyone reports, and
         * these were pure noise sitting on top of a screen that worked.
         */
        const info = Cookies.get("adminInfo");
        const role = info ? JSON.parse(info)?.role : null;
        if (role === "superadmin" || role === "platform-admin") return;

        // מניעת טעינה כפולה במקרה שטעינה כבר מתבצעת
        if (isLoadingNotifications) return;

        setIsLoadingNotifications(true);

        try {
            const response = await NotificationServices.getUnreadNotifications(page);
            const newNotifications = response.notifications || [];
            const totalDoc = response.totalDoc ?? 0;
            const totalUnreadDoc = response.totalUnreadDoc ?? 0;
            const limit = 5;
            const pages = Math.ceil(totalDoc / limit) || 1;

            setNotifications((prevNotifications) => {
                const existingIds = new Set(prevNotifications.map((notif) => notif._id));
                const uniqueNewNotifications = newNotifications.filter((notif) => !existingIds.has(notif._id));
                return [...prevNotifications, ...uniqueNewNotifications];
            });
            setCurrentPage(page);
            setHasMoreNotifications(page < pages);
            setUnreadCount(totalUnreadDoc);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    // פונקציה להטענת עמוד חדש בהתראות בעת גלילה
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        // בדיקה אם יש עוד התראות לטעון ואם הגענו לסוף הגלילה
        if (!isLoadingNotifications && hasMoreNotifications && scrollTop + clientHeight >= scrollHeight - 40) {
            fetchNotifications(currentPage + 1);
        }
    };

    // סגירת התראה והפחתת הספירה מיידית ללא המתנה לתשובת השרת
    const handleNotificationClose = (id) => {
        // עדכון מיידי של מצב ההתראות בצד הלקוח
        setNotifications((prevNotifications) =>
            prevNotifications.filter((notif) => notif._id !== id)
        );
        setUnreadCount((prevCount) => prevCount - 1);

        // עדכון סטטוס ההתראה ל"נקראה" בשרת, ללא צורך בהמתנה לתשובה
        NotificationServices.updateNotification(id, { status: "read" }).catch((err) =>
            console.error("Failed to update notification:", err)
        );
    };

    // פונקציה לטיפול בלחיצה על התראה לפתיחת הלינק
    const handleNotificationClick = async (notification) => {
        if (notification.link) {
            setNotifications((prevNotifications) =>
                prevNotifications.filter((notif) => notif._id !== notification._id)
            );
            setUnreadCount((prevCount) => prevCount - 1);

            NotificationServices.updateNotification(notification._id, { status: "read" }).catch((err) =>
                console.error("Failed to handle notification click:", err)
            );

            window.location.href = notification.link;
            setNotificationOpen(false);
        }
    };

    // פונקציה להצגת אייקון בהתאם לסוג ההתראה
    const renderNotificationIcon = (type) => {
        switch ((type || "info").toLowerCase()) {
            case "info":
                return <IoInformationCircle className="w-9 h-9 min-w-[36px] text-mainColor opacity-70" aria-hidden="true" />;
            case "warning":
                return <IoWarning className="w-9 h-9 min-w-[36px] text-orange-500 opacity-70" aria-hidden="true" />;
            case "success":
                return <IoCheckmarkCircle className="w-9 h-9 min-w-[36px] text-green-500 opacity-70" aria-hidden="true" />;
            case "error":
                return <IoAlertCircle className="w-9 h-9 min-w-[36px] text-red-500 opacity-70" aria-hidden="true" />;
            default:
                return <IoInformationCircleSharp className="w-9 h-9 min-w-[36px] text-mainColor opacity-70" aria-hidden="true" />;
        }
    };

    return (
        <li className="relative inline-block text-right z-20" ref={nRef}>
            <button
                className="relative align-middle rounded-md focus:outline-none"
                onClick={() => setNotificationOpen(!notificationOpen)}
            >
                <IoNotificationsSharp className="w-[22px] h-[22px] text-mainColor" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute z-10 top-0 left-0 inline-flex items-center justify-center p-1 h-5 min-w-[20px] text-xs font-medium leading-none text-red-100 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {notificationOpen && (
                <ul
                    className="origin-bottom-left absolute start-0 bottom-full mb-2 rounded-md shadow-lg bg-white dark:bg-gray-800 focus:outline-none max-h-[350px] overflow-y-auto lg:w-max w-[220px] border border-gray-200 dark:border-gray-700 z-50"
                    onScroll={handleScroll}
                >
                    {notifications.map((notification, index) => (
                        <li
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`flex justify-between wrap-break-word max-w-full items-center gap-2.5 font-serif font-normal text-sm py-3 border-b border-gray-100 dark:border-gray-700 px-3 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100 ${notification.link ? 'cursor-pointer' : ''}`}
                        >
                            {renderNotificationIcon(notification.type)}

                            <div className="flex flex-col gap-1 ml-auto max-w-full overflow-hidden">
                                <h6 className="font-medium text-base text-gray-800 dark:text-gray-300 wrap-break-word whitespace-pre-wrap">
                                    {notification.content?.[currentLanguageCode] ?? notification.message ?? ""}
                                </h6>

                                <p className="flex items-center text-xs text-gray-400">
                                    {dayjs(notification.createdAt).format("DD.MM.YYYY | HH:mm")}
                                </p>
                            </div>

                            <span
                                className="px-2 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClose(notification._id);
                                }}
                            >
                                <IoClose />
                            </span>
                        </li>
                    ))}
                    {isLoadingNotifications && (
                        <li className="text-center p-2">{t("Loading")}...</li>
                    )}
                    {notifications.length === 0 && !isLoadingNotifications && (
                        <li className="text-center p-2">{t("NoNotifications")}</li>
                    )}
                </ul>
            )}
        </li>
    );
};

export default Notifications;