# Backend – אזורים ויעדי משלוח (Regions & Deliveries)

מסמך זה מתאר בדיוק מה צריך לממש ב-**mnm-backend** כדי שהמערכת תעבוד עם אזורים, יעדים וכללי תמחור לפי סכום (אחרי הנחות).

---

## 1. עקרונות

- **אזור (Region)** = קבוצה של יעדים (ערים) + כללי תמחור משלוח לפי סכום רכישה.
- **יעד (Delivery)** = עיר + ימי משלוח, **חייב** להיות משויך לאזור אחד. אי אפשר להגדיר יעד "סתם" בלי אזור.
- **סכום לרף** = סכום ההזמנה **אחרי הנחות** (מבצעים/קופון), לפני הוספת דמי משלוח.
- בהזמנה: לפי **עיר** הלקוח מזהים את **האזור**, לפי **סכום (אחרי הנחות)** בוחרים את **הכלל** המתאים ומחשבים `shippingCost`.

---

## 2. מודלים (MongoDB / Mongoose)

### 2.1 Region

```js
// דוגמה למבנה
{
  _id: ObjectId,
  name: String,           // למשל "כל הארץ", "צפון"
  priceRules: [           // ממוין לפי minOrderTotal יורד (גבוה תחילה)
    { minOrderTotal: Number, shippingCost: Number },
    // דוגמה: { minOrderTotal: 2200, shippingCost: 0 }, { minOrderTotal: 1500, shippingCost: 150 }, { minOrderTotal: 0, shippingCost: 220 }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

- **priceRules**: כל כלל = "אם סכום ההזמנה (אחרי הנחות) ≥ minOrderTotal אז דמי משלוח = shippingCost".
- יש למיין את `priceRules` לפי `minOrderTotal` **יורד**, ולבחור את **הראשון** שמתקיים.

### 2.2 Delivery (יעד משלוח)

- חייב שדה **region** (אובייקט או ObjectId) – הפניה ל-Region.
- **אין** שדה מחיר על היעד; המחיר נקבע רק מכללי האזור.
- שדות מומלצים: `city` (אובייקט עיר), `days` (מערך ימים), `region` (ref ל-Region).

```js
// דוגמה
{
  _id: ObjectId,
  region: { type: ObjectId, ref: 'Region', required: true },
  city: Object,           // כמו היום (כולל city_name_he וכו')
  days: [{ name: String, ... }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 3. API שהאדמין משתמש בו

### 3.1 אזורים (delivery-regions)

| פעולה | שיטה | נתיב | גוף/הערות |
|--------|------|------|------------|
| רשימת אזורים (כולל יעדים + כללים) | GET | `/api/delivery-regions` | מחזיר מערך אזורים; כל אזור כולל `deliveries` (יעדים) ו-`priceRules`. |
| אזור בודד | GET | `/api/delivery-regions/:id` | |
| יצירת אזור | POST | `/api/delivery-regions` | `{ name: string }` |
| עדכון אזור | PUT | `/api/delivery-regions/:id` | `{ name: string }` |
| עדכון כללי תמחור | PUT | `/api/delivery-regions/:id/price-rules` | `{ priceRules: [{ minOrderTotal, shippingCost }, ...] }` – לשמור ממוין לפי minOrderTotal יורד. |
| מחיקת אזור | DELETE | `/api/delivery-regions/:id` | למחוק גם את כל היעדים (Deliveries) המשויכים לאזור. |

### 3.2 יעדים (deliveries)

| פעולה | שיטה | נתיב | גוף/הערות |
|--------|------|------|------------|
| רשימת יעדים (כולל) | GET | `/api/deliveries` | יכול להחזיר שטוח או מקובץ לפי אזור; האדמין טוען אזורים מ-`/delivery-regions` ולכן אולי לא נדרש. |
| יעד בודד | GET | `/api/deliveries/:id` | |
| יצירת יעד | POST | `/api/deliveries` | `{ city, days, region }` – **region** חובה. אין `price`. |
| עדכון יעד | PUT | `/api/deliveries/:id` | `{ city, days }` – לא לעדכן region. |
| מחיקת יעד | DELETE | `/api/deliveries/:id` | |
| מחיקת כמה | PATCH | `/api/deliveries/delete/many` | `{ ids: [] }` |

---

## 4. לוגיקת חישוב משלוח בהזמנה (addOrder)

בשלב שבו מחשבים משלוח (אחרי ולידציה, מבצעים וקופון):

1. **סכום להשוואה**  
   השתמש ב-**סיכום ההזמנה אחרי הנחות** (לפני משלוח), למשל:  
   `orderTotalAfterDiscounts = subTotal - discount - offerDiscount` (או השדה המקביל במודל שלך).

2. **זיהוי אזור**  
   לפי `user_info.address.city` (או השדה שמזהה עיר) – מצא **Delivery** שמשויך לעיר הזו (למשל לפי `city._id` או שם עיר).  
   מ-**Delivery** קח `region` (אובייקט או ID) – זה האזור.

3. **בחירת כלל תמחור**  
   טען את האזור (אם טענת רק ref) וקח את `priceRules` ממוין לפי `minOrderTotal` **יורד**.  
   בחר את **הראשון** כך ש-`orderTotalAfterDiscounts >= rule.minOrderTotal`.  
   `shippingCost = rule.shippingCost`.

4. **אם אין אזור/עיר**  
   אם העיר לא משויכת לאף Delivery או שאין כלל מתאים – להחליט מדיניות (למשל משלוח 0 או שגיאה).

5. **שמירה בהזמנה**  
   שמור ב-Order: `shippingCost`, ולחשב `total = orderTotalAfterDiscounts + shippingCost` (או לפי הלוגיקה הקיימת).

---

## 5. דוגמה לכללי תמחור

- מעל 2200 ₪ → 0 ₪ משלוח  
- 1500–2200 ₪ → 150 ₪ משלוח  
- מתחת ל-1500 ₪ → 220 ₪ משלוח  

ב-DB (ממוין יורד לפי minOrderTotal):

```json
[
  { "minOrderTotal": 2200, "shippingCost": 0 },
  { "minOrderTotal": 1500, "shippingCost": 150 },
  { "minOrderTotal": 0, "shippingCost": 220 }
]
```

חישוב: אם `orderTotalAfterDiscounts = 1600` → בוחרים את הכלל עם `minOrderTotal: 1500` → `shippingCost = 150`.

---

## 6. מיגרציה (אם יש Deliveries ישנים בלי region)

- אם יש מודל Delivery ישן עם `price` בלי `region`:  
  - ליצור אזור ברירת מחדל (למשל "כל הארץ"),  
  - לעדכן את כל ה-Deliveries הישנים עם `region: <id של האזור>`,  
  - להגדיר `priceRules` לאזור לפי הצורך (או להמיר מחיר קבוע לכלל אחד: minOrderTotal 0, shippingCost = המחיר הישן).

---

## 7. סיכום פעולות שבוצעו באדמין (לסינכרון)

- **Deliveries.jsx** – טוען אזורים מ-`RegionServices.getAllRegions()`, מציג "הוסף אזור" וסקשן לכל אזור (`RegionSection`).
- **RegionSection** – מציג שם אזור, כפתורי עריכה/מחיקה לאזור, כללי תמחור (הגדרות מחירי אזור), ורשימת יעדים עם הוספה/עריכה/מחיקה.
- **RegionDrawer** – הוספה/עריכת אזור (שם בלבד).
- **DeliveryDrawer** – הוספה/עריכת יעד: עיר + ימים בלבד (ללא שדה מחיר); ביצירה נשלח `region` (או `regionId`) מה-context/props.
- **useDeliverySubmit** – ביצירה שולח `{ city, days, region: effectiveRegionId }`; בעדכון `{ city, days }`.
- **DeleteModal** – במסך משלוחים: אם `deleteTargetType === 'region'` קורא ל-`RegionServices.deleteRegion(id)`, אחרת `DeliveryServices.deleteDelivery(id)`.

הבקאנד צריך לספק את ה-API למעלה ולממש את לוגיקת חישוב המשלוח ב-addOrder לפי סכום אחרי הנחות ואזור לפי עיר.

---

## 8. חנות (mnm-store) – סיכום עלויות (דמי משלוח בתצוגה)

כדי ש**סיכום העלויות** בעגלה/צ'קאוט יציג את דמי המשלוח הנכונים (לפי כללי האזור), החנות חייבת:

1. **לקרוא ל-API עם סכום ההזמנה אחרי הנחות**  
   `GET /api/deliveries/getbycity/:city?orderTotal=1997.71`  
   (להחליף את שם העיר ואת הסכום לפי העגלה הנוכחית – אחרי מבצעים וקופון, לפני משלוח).

2. **להציג את `shippingCost` מהתשובה**  
   כשנשלח `orderTotal`, הבקאנד מחזיר באובייקט גם שדה **`shippingCost`** (מחושב מכללי האזור).  
   יש להציג את **`response.shippingCost`** בסעיף "משלוח עד הבית" / סיכום עלויות, **לא** את `response.price` (שזה המחיר הישן/ברירת מחדל).

3. **מתי לעדכן**  
   בכל שינוי בעיר המשלוח או בסכום העגלה (כולל אחרי החלת קופון/מבצע) – לקרוא שוב ל-getbycity עם ה-`orderTotal` המעודכן ולעדכן את התצוגה לפי `shippingCost`.
