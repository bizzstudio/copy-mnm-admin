# מיפוי דפים ↔ קומפוננטות – mnm-admin

כל דף (PAGE), אילו קומפוננטות יש בו, ואיפה מתרחשים דברים.

---

## 1. `src/pages/Login.jsx`  
**נתיב:** `/`, `/login`

| קומפוננטות | תיאור |
|------------|--------|
| `InputArea` | שדות אימייל וסיסמה |
| `LabelArea` | תוויות לשדות |
| `Error` | הצגת שגיאות ולידציה |
| `CMButton` | כפתור התחברות |
| `useLoginSubmit` | שליחת טופס ל-API, שמירת token ב-cookie, הפניה ל-dashboard |

**מה קורה:** טופס התחברות → `useLoginSubmit.onSubmit` → API → `adminInfo` ל-cookie → ניווט ל-`/dashboard`.

---

## 2. `src/pages/Dashboard.jsx`  
**נתיב:** `/dashboard`

| קומפוננטות | תיאור |
|------------|--------|
| `LineChart` | גרף קווי (מכירות/הזמנות) |
| `PieChart` | גרף עוגה |
| `ChartCard` | עטיפה לגרפים |
| `CardItem`, `CardItemTwo` | כרטיסי סיכום (ספירות, סכומים) |
| `OrderTable` | טבלת הזמנות אחרונות |
| `TableLoading`, `NotFound` | טעינה ו"אין נתונים" |
| `CustomPagination` | עימוד |
| `PageTitle` | כותרת עמוד |
| `useFilter(dataTable)` | סינון/עימוד מקומי על ההזמנות |

**Hooks / שירותים:**  
`useAsync` → `OrderServices.getBestSellerProductChart`, `getDashboardRecentOrder`, `getDashboardCount`, `getDashboardAmount`.  
**מה קורה:** טעינת נתוני דשבורד, חישוב גרפים מהנתונים, הצגת הזמנות אחרונות עם סינון.

---

## 3. `src/pages/Products.jsx`  
**נתיב:** `/products`

| קומפוננטות | תיאור |
|------------|--------|
| `ProductTable` | טבלת מוצרים (שם, ברקוד, מחיר, מלאי, סטטוס וכו') |
| `ProductFilters` | פילטרים (קטגוריה, מחיר, חיפוש) |
| `MainDrawer` + `ProductDrawer` | דר awer להוספה/עריכת מוצר |
| `BulkActionDrawer` | פעולות מרובות על מוצרים נבחרים |
| `DeleteModal` | מחיקה (יחיד/מרובה) |
| `CheckBox` | בחירת שורות |
| `ImportResultsModal` | תוצאות ייבוא אקסל |
| `BarcodeScannerModal` | סריקת ברקוד |
| `SearchInput`, `DropdownMenu` | חיפוש ותפריט פעולות |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**Hooks:**  
`useProductFilter` (סינון), `useToggleDrawer` (פתיחת drawer/מחיקה), `useExport`, `useImport`.  
**מה קורה:** רשימת מוצרים עם סינון; כפתור "הוסף" → `ProductDrawer`; עריכה משורה → `ProductDrawer` עם `id`; ייבוא/ייצוא אקסל; סריקת ברקוד; מחיקה יחידה/מרובה.

---

## 4. `src/pages/ProductDetails.jsx`  
**נתיב:** `/product/:id`

| קומפוננטות | תיאור |
|------------|--------|
| `MainDrawer` + `ProductDrawer` | עריכת המוצר (אותו drawer כמו ב-Products) |
| `PageTitle`, `Loading` | כותרת וטעינה |
| `Card`, `CardBody` | כרטיסים לפרטים (תמונה, כותרת, מחירים, מלאי) |
| `Badge` | סטטוס show/hide |

**מה קורה:** טעינת מוצר לפי `id` → הצגת פרטים (תמונה, כותרת, מחירים לרשימות מחירים, מלאי, ברקוד) → כפתור עריכה פותח את `ProductDrawer`.

---

## 5. `src/pages/Category.jsx`  
**נתיב:** `/categories`

| קומפוננטות | תיאור |
|------------|--------|
| `CategoryTable` | טבלת קטגוריות (עם ילדים) |
| `MainDrawer` + `CategoryDrawer` | הוספה/עריכת קטגוריה |
| `BulkActionDrawer` | פעולות על נבחרים |
| `DeleteModal`, `CheckBox` | מחיקה ובחירה |
| `UploadManyTwo` | העלאת קטגוריות (קובץ) |
| `SwitchToggleChildCat` | מתג להצגת תת-קטגוריות |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** רשימת קטגוריות; הוספה/עריכה ב-drawer; מחיקה; ייבוא מקובץ; ניווט ל-ChildCategory לעריכה עמוקה.

---

## 6. `src/pages/ChildCategory.jsx`  
**נתיב:** `/categories/:id`

| קומפוננטות | תיאור |
|------------|--------|
| `CategoryTable` | טבלת תת-קטגוריות של הקטגוריה הנוכחית |
| `MainDrawer` + `CategoryDrawer` | עריכת תת-קטגוריה |
| `BulkActionDrawer`, `DeleteModal`, `CheckBox` | פעולות ומחיקה |
| `CustomPagination` | עימוד |

**מה קורה:** טעינת קטגוריה לפי `id`, חישוב "שרשרת" קטגוריות (ancestors); הצגת תת-קטגוריות; הוספה/עריכה/מחיקה של תת-קטגוריות.

---

## 7. `src/pages/Offers.jsx`  
**נתיב:** `/offers`

| קומפוננטות | תיאור |
|------------|--------|
| `OfferTable` | טבלת מבצעים |
| `MainDrawer` + `OfferDrawer` | הוספה/עריכת מבצע |
| `DeleteModal`, `CheckBox` | מחיקה ובחירה |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** רשימת מבצעים; חיפוש/סינון דרך `useFilter`; הוספה/עריכה ב-drawer; מחיקה יחידה/מרובה.

---

## 8. `src/pages/Coupons.jsx`  
**נתיב:** `/coupons`

| קומפוננטות | תיאור |
|------------|--------|
| `CouponTable` | טבלת קופונים |
| `MainDrawer` + `CouponDrawer` | הוספה/עריכת קופון |
| `BulkActionDrawer`, `DeleteModal`, `CheckBox` | פעולות ומחיקה |
| `UploadManyTwo` | ייבוא קופונים מקובץ |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** רשימת קופונים; חיפוש (`couponRef`); הוספה/עריכה; ייבוא קופונים; מחיקה.

---

## 9. `src/pages/PriceLists.jsx`  
**נתיב:** `/price-lists`

| קומפוננטות | תיאור |
|------------|--------|
| `PriceListTable` | טבלת רשימות מחירים |
| `MainDrawer` + `PriceListDrawer` | הוספה/עריכת רשימת מחירים |
| `DeleteModal`, `CheckBox` | מחיקה (לא על default) ובחירה |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** רשימת רשימות מחירים; חיפוש; הוספה/עריכה; מחיקה (רק לא default).

---

## 10. `src/pages/Customers.jsx`  
**נתיב:** `/customers`

| קומפוננטות | תיאור |
|------------|--------|
| `CustomerTable` | טבלת לקוחות (MainCustomer) |
| `DeleteModal` | מחיקת לקוח |
| `UploadManyTwo` | ייבוא לקוחות מקובץ |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** טעינת כל הלקוחות; חיפוש (`useFilter`); "הוסף לקוח" → ניווט ל-`/customer/add`; לחיצה על שורה → ניווט ל-`/customer/:id`; מחיקה; ייבוא.

---

## 11. `src/pages/CustomerAdd.jsx`  
**נתיב:** `/customer/add`

| קומפוננטות | תיאור |
|------------|--------|
| `PageTitle` | כותרת |
| `CustomerPersonalDetails` | טופס פרטי לקוח (שם, אימייל, כתובות, רשימת מחירים, ימי משלוח וכו') – **ללא** `customer` (יצירה) |

**מה קורה:** טופס הוספת לקוח חדש; `CustomerPersonalDetails` עם `customer={null}` שומר ל-API דרך `useCustomerSubmit` (או דומה).

---

## 12. `src/pages/CustomerPage.jsx`  
**נתיב:** `/customer/:id`

| קומפוננטות | תיאור |
|------------|--------|
| `Tabs` | טאבים: פרטים / הזמנות / מסמכים / מוצרים מותרים |
| `CustomerPersonalDetails` | פרטי לקוח, כתובות, משתמשים משניים, רשימת מחירים (עריכה) |
| `CustomerOrders` | רשימת הזמנות של הלקוח (`CustomerOrderTable` + `PrintReceipt`) |
| `CustomerDocuments` | מסמכי Rivhit (טבלה, סינון לפי סוג, פג'יניישן תאריכים) + מודאל הנפקה |
| `ImportResultsModal` | תוצאות ייבוא ברקודים מותרים |
| `Dialog` (Headless) | מודאלים (הוספת מוצרים מותרים, בחירת מצב ייבוא) |

**מה קורה:**  
- טעינת `MainCustomer` לפי `id`.  
- **טאב פרטים:** עריכת פרטים, כתובות, משתמשים, רשימת מחירים.  
- **טאב הזמנות:** טבלת הזמנות + כפתור הדפסה (`PrintReceipt` → `InvoiceForPrint`).  
- **טאב מסמכים:** משיכת מסמכים מ-Rivhit לפי טווח תאריכים; סינון לפי סוג; פתיחת `DocumentIssueModal` להנפקת חשבונית/קבלה/ת"מ/זיכוי.  
- **טאב מוצרים מותרים:** רשימת ברקודים מותרים; ייבוא אקסל; הוספת/הסרת מוצרים.

---

## 13. `src/pages/CustomerOrder.jsx`  
**נתיב:** `/customer-order/:id`

| קומפוננטות | תיאור |
|------------|--------|
| `CustomerOrderTable` | טבלת הזמנות של הלקוח (לפי `id` = מזהה לקוח) |
| `PrintReceipt` | הדפסת הזמנה מכל שורה |
| `PageTitle`, `Loading`, `CustomPagination` | כותרת, טעינה, עימוד |

**מה קורה:** טעינת הזמנות ללקוח (`OrderServices.getOrderCustomer(id)`); הצגה בטבלה; הדפסה מכל שורה.

---

## 14. `src/pages/Orders.jsx`  
**נתיב:** `/orders`

| קומפוננטות | תיאור |
|------------|--------|
| `OrderTable` | טבלת הזמנות (אונליין) – עם `PrintReceipt` בכל שורה |
| `SelectWithCheckbox` | סינון סטטוסים וערים (משלוחים) |
| `DeleteModal` (לא בשימוש פעיל כאן בדרך כלל) | - |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** טעינת הזמנות עם פילטרים (תאריך, סטטוס, עיר, חיפוש שם); ייצוא לאקסל; לחיצה על שורה → ניווט ל-`/order/:id`; הדפסה מ-`OrderTable` → `PrintReceipt` → `InvoiceForPrint`.

---

## 15. `src/pages/OrderInvoice.jsx`  
**נתיב:** `/order/:id`

| קומפוננטות | תיאור |
|------------|--------|
| `Invoice` | טבלת מוצרים (שורות ההזמנה – מוצר, כמות, מחיר, סכום) |
| `Status` | באדג' סטטוס ההזמנה |
| `StatusHistoryCard` | כרטיס היסטוריית סטטוסים |
| `CollapsibleSection` | סקשן מתקפל (היסטוריה) |
| `InfoField` | שדות מידע (לקוח, תשלום, משלוח, סיכום כספי) |
| `PageTitle`, `Loading` | כותרת וטעינה |

**מה קורה:** טעינת הזמנה לפי `id`; הצגת כותרת + סטטוס + תשלום; היסטוריית סטטוסים; פרטי לקוח; פרטי תשלום; טבלת מוצרים (`Invoice`); סיכום כספי (משנה, משלוח, הנחה, סה"כ). **הדפסה:** מתבצעת מתוך `OrderTable` / `CustomerOrderTable` דרך `PrintReceipt` (לא ישירות בדף הזה).

---

## 16. `src/pages/CashierOrders.jsx`  
**נתיב:** `/cashier-orders`

| קומפוננטות | תיאור |
|------------|--------|
| `OrderTable` | אותה טבלה כמו ב-Orders, עם `isCashierOrders={true}` |
| `CustomPagination`, `TableLoading`, `NotFound` | עימוד, טעינה, ריק |

**מה קורה:** טעינת הזמנות קופה (`OrderServices.getAllCashierOrders`); פילטרים (תאריך, חיפוש); ייצוא; ניווט ל-`/cashier-order/:id`; הדפסה דרך `PrintReceipt`.

---

## 17. `src/pages/CashierOrderInvoice.jsx`  
**נתיב:** `/cashier-order/:id`

| קומפוננטות | תיאור |
|------------|--------|
| `InvoiceForDownload` | תצוגת הזמנה + אפשרות הורדה (PDF וכו') |

**מה קורה:** צפייה בהזמנת קופה והורדת מסמך (לא אותו layout כמו OrderInvoice).

---

## 18. `src/pages/Statuses.jsx`  
**נתיב:** `/statuses`

| קומפוננטות | תיאור |
|------------|--------|
| `StatusTable` | טבלת סטטוסים |
| `MainDrawer` + `StatusDrawer` | הוספה/עריכת סטטוס |
| `BulkActionDrawer`, `DeleteModal`, `CheckBox` | פעולות ומחיקה |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** רשימת סטטוסי הזמנה; חיפוש/סינון; הוספה/עריכה; מחיקה; ייצוא.

---

## 19. `src/pages/StatusInvoice.jsx`  
**נתיב:** `/status/:id`

**מה קורה:** דף הקשור לסטטוס (דוחות/צפייה לפי סטטוס) – פרטי הקומפוננטות כמו בדפי דומה בפרויקט.

---

## 20. `src/pages/Deliveries.jsx`  
**נתיב:** `/deliveries`

| קומפוננטות | תיאור |
|------------|--------|
| `DeliveryTable` | טבלה: עיר, מחיר, ימים, כפתורי עריכה/מחיקה |
| `MainDrawer` + `DeliveryDrawer` | הוספה/עריכת משלוח |
| `BulkActionDrawer`, `DeleteModal`, `CheckBox` | פעולות ומחיקה |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** טעינת כל המשלוחים; חיפוש (עיר); הוספת משלוח → drawer; עריכה → ניווט ל-`/deliveries/:id` או drawer; מחיקה.

---

## 21. `src/pages/DeliveryEdit.jsx`  
**נתיב:** `/deliveries/:id`

| קומפוננטות | תיאור |
|------------|--------|
| `MainDrawer` + `DeliveryDrawer` | עריכת המשלוח הנוכחי |
| `PageTitle`, `Loading` | כותרת וטעינה |

**מה קורה:** טעינת משלוח לפי `id`; הצגת פרטים (עיר, מחיר, ימים, סטטוס); עריכה ב-drawer.

---

## 22. `src/pages/StoreHome.jsx`  
**נתיב:** `/store/customization`

| קומפוננטות (טאבים) | תיאור |
|----------------------|--------|
| `Tabs` | 10 טאבים (query: `storeTab`) |
| `StoreHomeTabContent` | עטיפה עם טופס ו-`useStoreHomeSubmit` |
| `HomePage` | טאב הגדרות בית (קארוסלות, באנרים, מבצעים, משלוח וכו') |
| `SinglePage` | הגדרות עמוד בודד |
| `AboutUs` | אודות |
| `PrivacyPolicy` | תקנון/פרטיות |
| `Faq` | שאלות נפוצות |
| `Offer` | מבצעים בחנות |
| `ContactUs` | צור קשר |
| `Checkout` | הגדרות צ'קאוט (טקסטים, משלוח) |
| `DashboardSetting` | הגדרות דשבורד חנות |
| `SeoSetting` | SEO |
| `SelectLanguageTwo` | בחירת שפה לעריכה |

**מה קורה:** כל התוכן נשלט על ידי `useStoreHomeSubmit`; כל טאב הוא טופס ששומר להגדרות החנות (store customization) ב-API; שמירה משותפת מהטופס.

---

## 23. `src/pages/StoreSetting.jsx`  
**נתיב:** `/store/store-settings`

| קומפוננטות | תיאור |
|------------|--------|
| `InputAreaTwo`, `SwitchToggle` | שדות ומתגים (מטבע, COD, Stripe, פיקסל, Tawk, Google, Analytics, משלוחים, הזמנות וכו') |
| `Error` | שגיאות ולידציה |
| `useStoreSettingSubmit` | שליחה ל-API והגדרות |

**מה קורה:** הגדרות כלליות לחנות (אמצעי תשלום, אינטגרציות, משלוחים).

---

## 24. `src/pages/Scripts.jsx`  
**נתיב:** `/store/scripts`

| קומפוננטות | תיאור |
|------------|--------|
| `CodeEditor` | עורך קוד ל-head / body start / body end |
| `useScriptsSubmit` | טעינה ושמירת סקריפטים |

**מה קורה:** הזרקת קוד JS ל-head ו-body של החנות (אנליטיקס, צ'אט וכו').

---

## 25. `src/pages/Setting.jsx`  
**נתיב:** `/settings`

| קומפוננטות | תיאור |
|------------|--------|
| `InputAreaTwo`, `Select`, `SelectCurrency`, `SelectTimeZone`, `SelectReceiptSize` | שדות והגדרות כלליות (מטבע, timezone, פורמט תאריך, מספר תמונות למוצר, גודל הדפסה) |
| `Error` | שגיאות |
| `useSettingSubmit` | שמירה |

**מה קורה:** הגדרות מערכת כלליות (לא ספציפיות לחנות).

---

## 26. `src/pages/Popups.jsx`  
**נתיב:** `/popups`

| קומפוננטות | תיאור |
|------------|--------|
| `PopupTable` | טבלת פופאפים |
| `MainDrawer` + `PopupDrawer` | הוספה/עריכת פופאפ |
| `BulkActionDrawer`, `DeleteModal`, `CheckBox` | פעולות ומחיקה |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** ניהול חלונות קופצים בחנות (תוכן, תאריכים, שפות).

---

## 27. `src/pages/Blogs.jsx`  
**נתיב:** `/blogs`

| קומפוננטות | תיאור |
|------------|--------|
| `BlogTable` | טבלת פוסטים |
| `MainDrawer` + `BlogDrawer` | הוספה/עריכת פוסט |
| `DeleteModal`, `CheckBox` | מחיקה ובחירה |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** ניהול בלוג החנות (פוסטים).

---

## 28. `src/pages/Staff.jsx`  
**נתיב:** `/our-staff`

| קומפוננטות | תיאור |
|------------|--------|
| `StaffTable` | טבלת אנשי צוות (אדמין) |
| `MainDrawer` + `StaffDrawer` | הוספה/עריכת צוות |
| `DeleteModal` | מחיקה |
| `TableLoading`, `NotFound`, `CustomPagination` | טעינה, ריק, עימוד |

**מה קורה:** טעינת staff (מסונן לפי המשתמש המחובר); חיפוש; הוספה/עריכה/מחיקה.

---

## 29. `src/pages/Messages.jsx` (WhatsApp Bot)  
**נתיב:** `/whatsappbot`

**מה קורה:** ניהול הודעות לבוט וואטסאפ (אם מופעל).

---

## 30. דפים נוספים (קצר)

| דף | נתיב | קומפוננטות עיקריות |
|----|------|---------------------|
| `ForgotPassword` | `/forgot-password` | טופס שליחת לינק איפוס |
| `ResetPassword` | `/reset-password/:token` | טופס סיסמה חדשה |
| `MFA` | `/mfa` | אימות דו-שלבי |
| `EditProfile` | `/edit-profile` | עריכת פרופיל האדמין המחובר |
| `Languages` | `/languages` | ניהול שפות (אם בתפריט) |
| `Currencies` | `/currencies` | ניהול מטבעות (אם בתפריט) |
| `404` | `*` | עמוד לא נמצא |
| `ComingSoon` | `/coming-soon` | "בקרוב" |

---

## קומפוננטות משותפות בין דפים

| קומפוננטה | איפה משמשת |
|------------|-------------|
| `MainDrawer` + `*Drawer` | Products, ProductDetails, Category, ChildCategory, Offers, Coupons, PriceLists, Deliveries, DeliveryEdit, Statuses, Popups, Blogs, Staff – להוספה/עריכה |
| `DeleteModal` | רוב דפי הטבלאות – מחיקה יחידה/מרובה |
| `PrintReceipt` | `OrderTable`, `CustomerOrderTable` – הדפסת הזמנה (טוען הזמנה ומציג `InvoiceForPrint`) |
| `InvoiceForPrint` | `PrintReceipt` – תוכן להדפסה |
| `InvoiceForDownload` | `CashierOrderInvoice` – צפייה והורדה |
| `DocumentIssueModal` | `CustomerDocuments` – בחירת סוג מסמך (חשבונית/קבלה/ת"מ/זיכוי) ופתיחת הטופס המתאים |
| `InvoiceForm`, `InvoiceReceiptForm`, `ReceiptForm`, `DeliveryNoteForm`, `CreditInvoiceForm` | בתוך `DocumentIssueModal` / מסמכים – הנפקה ל-Rivhit |
| `CustomerPersonalDetails` | `CustomerAdd`, `CustomerPage` – טופס פרטי לקוח (יצירה vs עריכה) |
| `Tabs` | `StoreHome`, `CustomerPage` – מעבר בין אזורים באותו דף |
| `PageTitle`, `TableLoading`, `NotFound`, `CustomPagination` | כמעט כל דף רשימה |

---

## איפה מתרחש מה (תמצית)

- **התחברות / איפוס סיסמה / MFA:** ב-`Login`, `ForgotPassword`, `ResetPassword`, `MFA`; ה-hooks שולחים ל-API ומעדכנים cookie/ניווט.
- **טעינת רשימות (מוצרים, הזמנות, לקוחות וכו'):** בכל דף רשימה – `useAsync` ל-Service מתאים, ואז `useFilter` לסינון/עימוד מקומי (חוץ מהזמנות שסינון ב-SidebarContext/API).
- **הוספה/עריכה:** ברוב המקרים דרך `MainDrawer` + Drawer ספציפי; ה-Drawer משתמש ב-hook ייעודי (למשל `useProductSubmit`, `useDeliverySubmit`).
- **מחיקה:** `useToggleDrawer` + `DeleteModal`; שליחה ל-API ואז רענון רשימה (למשל דרך refetch או ניווט).
- **הדפסת הזמנה:** רק מתוך טבלאות – `OrderTable` / `CustomerOrderTable` → `PrintReceipt` → טעינת הזמנה → `InvoiceForPrint`.
- **הנפקת מסמכים (Rivhit):** רק בדף לקוח – טאב "מסמכים" → `CustomerDocuments` → `DocumentIssueModal` → טופס (InvoiceForm / InvoiceReceiptForm וכו') → שליחה ל-API שמדבר עם Rivhit.
- **הגדרות חנות:** `StoreHome` (טאבים עם `useStoreHomeSubmit`), `StoreSetting`, `Scripts` – שמירה ל-API של הגדרות.

אם תרצה, אפשר להעמיק בדף או בקומפוננטה ספציפית (למשל רק Products או רק CustomerDocuments + Rivhit).
