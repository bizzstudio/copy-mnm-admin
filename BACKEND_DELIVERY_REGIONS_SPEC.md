# מפרט Backend – אזורי משלוח ותמחור מדורג

## דרישות עסקיות (אושרו עם הלקוח)

1. **סכום לרף** – הרפים להגדרות דמי משלוח (למשל 2200, 1500) משווים ל**סכום ההזמנה אחרי הנחות** (subTotal - discount - offerDiscount), לא לפני הנחות.
2. **"כל הארץ"** – זה אזור רגיל בשם "כל הארץ". אי אפשר להגדיר יעד בלי אזור – כל יעד (עיר) חייב להיות משויך לאזור.

---

## 1. מודל Region (אזור)

- `_id`
- `name` (string) – שם האזור, למשל "כל הארץ", "צפון"
- `order` (number, אופציונלי) – סדר הצגה (כל הארץ ראשון וכו')
- `createdAt`, `updatedAt`

---

## 2. מודל Delivery (יעד) – שינוי

- כל השדות הקיימים נשארים: `city`, `price`, `days`.
- **חובה:** שדה `region` (ObjectId ref ל-Region). יעד בלי אזור לא תקין.
- **הערה:** השדה `price` ב-Delivery יכול להישאר לצורך תאימות או להפוך לאופציונלי – **מחיר המשלוח בפועל** נקבע מכללי התמחור של האזור (לפי סכום אחרי הנחות), לא משדה price ביעד.

---

## 3. כללי תמחור לאזור (Region Price Rules)

מבנה (למשל בתוך Region או קולקציה נפרדת):

```js
priceRules: [
  { minOrderTotal: 2200, shippingCost: 0 },    // סכום >= 2200 אחרי הנחות → 0 דמי משלוח
  { minOrderTotal: 1500, shippingCost: 150 }, // סכום >= 1500 אחרי הנחות → 150
  { minOrderTotal: 0,    shippingCost: 220 }   // אחרת → 220
]
```

- **מיון:** לפי `minOrderTotal` **יורד** (הגבוה ראשון). ההזמנה מושווית לכלל הראשון שמתקיים (orderTotalAfterDiscounts >= minOrderTotal).
- **סכום להשוואה:** `orderTotalAfterDiscounts = subTotal - discount - offerDiscount` (לפני הוספת דמי משלוח).

---

## 4. API – אזורים

| Method | Endpoint | תיאור |
|--------|----------|--------|
| GET | `/delivery-regions` | רשימת כל האזורים. תגובה: `{ regions: [{ _id, name, order, priceRules?, deliveries? }] }` או מקביל עם populate של deliveries. |
| GET | `/delivery-regions/:id` | אזור בודד כולל יעדים וכללי תמחור. |
| POST | `/delivery-regions` | body: `{ name, order? }`. יצירת אזור. |
| PUT | `/delivery-regions/:id` | body: `{ name, order? }`. עדכון אזור. |
| DELETE | `/delivery-regions/:id` | מחיקת אזור (להחליט: למחוק גם יעדים או למנוע אם יש יעדים). |

---

## 5. API – כללי תמחור לאזור

| Method | Endpoint | תיאור |
|--------|----------|--------|
| PUT | `/delivery-regions/:regionId/price-rules` | body: `{ priceRules: [{ minOrderTotal, shippingCost }] }`. עדכון רשימת הכללים. מיון יורד לפי minOrderTotal. |

---

## 6. API – יעדים (Deliveries)

- **POST /deliveries** – body חייב לכלול `regionId` (או `region`): `{ city, regionId, days }`. `price` אופציונלי אם המחיר נגזר מכללי האזור.
- **PUT /deliveries/:id** – אפשר לעדכן גם `regionId`.
- **GET /delivery-regions/:regionId/deliveries** – החזרת יעדים של אזור מסוים (אם רוצים טעינה לפי אזור).

---

## 7. לוגיקת חישוב משלוח ביצירת הזמנה (addOrder)

1. לפי כתובת/עיר הלקוח – לזהות לאיזה **אזור** שייכת העיר (חיפוש ב-Delivery עם city + region).
2. לחשב: `orderTotalAfterDiscounts = subTotal - discount - offerDiscount`.
3. לטעון את `priceRules` של האזור, ממוינים לפי `minOrderTotal` יורד.
4. לבחור את הכלל הראשון כך ש-`orderTotalAfterDiscounts >= minOrderTotal` → זה ה-`shippingCost` להזמנה.
5. לשמור ב-Order: `shippingCost`, ולעדכן את `total` בהתאם.

---

## 8. מיגרציה

- משלוחים קיימים (ללא region): להחליט לאזור ברירת מחדל (למשל ליצור אזור "כל הארץ" ולשייך אליו את כל ה-deliveries הקיימים), ולהוסיף לכל delivery שדה `region`.
- כללי תמחור: להתחיל עם מערך ריק או עם כללים ברירת מחדל לאזורים, ולאפשר לערוך מהאדמין.

---

סיום המפרט. האדמין כבר מוכן לקרוא ל-API האלה; יש לעדכן את ה-Backend בהתאם.
