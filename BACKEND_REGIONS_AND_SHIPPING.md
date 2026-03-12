# Backend: אזורים (Regions) וחישוב משלוח אחרי הנחות

מסמך זה מתאר **במדויק** את כל השינויים הנדרשים ב-backend (mnm-backend) כדי לתמוך באזורי משלוח וכללי תמחור לפי סכום **אחרי הנחות**.

---

## 1. דרישות לוגיות

- **אזור (Region):** יש שם (למשל "כל הארץ", "צפון"). כל יעד (עיר) **חייב** להיות משויך לאזור אחד. אי אפשר להגדיר יעד בלי אזור.
- **יעד (Delivery):** עיר + ימי משלוח, משויך לאזור דרך `region` (ObjectId).
- **כללי תמחור (priceRules) לאזור:** מערך של `{ minOrderTotal, shippingCost }`. הסכום שמושווה לרף הוא **סכום ההזמנה אחרי הנחות** (subtotal אחרי מבצעים וקופון, לפני משלוח).
- **חישוב משלוח בהזמנה:** לפי עיר הלקוח → איתור האזור → לפי סכום (אחרי הנחות) → בחירת הכלל הראשון שמתקיים (מיון לפי `minOrderTotal` יורד).

---

## 2. מודלים (Models)

### 2.1 מודל Region (חדש)

**קובץ:** `models/Region.js` (או `models/DeliveryRegion.js`)

```js
const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    priceRules: [
      {
        minOrderTotal: { type: Number, required: true, default: 0 },
        shippingCost: { type: Number, required: true, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// מיון: מהגבוה לנמוך – כדי לבחור את הכלל הראשון שמתקיים (orderTotal >= minOrderTotal)
regionSchema.pre("save", function (next) {
  if (this.priceRules && this.priceRules.length) {
    this.priceRules.sort((a, b) => (b.minOrderTotal || 0) - (a.minOrderTotal || 0));
  }
  next();
});

module.exports = mongoose.model("Region", regionSchema);
```

**פעולה:** יצירת קובץ המודל.

---

### 2.2 מודל Delivery (עדכון)

**קובץ:** `models/Delivery.js`

- להוסיף שדה **חובה** לאזור:

```js
region: { type: mongoose.Schema.Types.ObjectId, ref: "Region", required: true },
```

- אם היה שדה `price` – אפשר להסיר (המחיר נקבע מכללי האזור).

**פעולה:** הוספת `region` (required) לסכמה; הסרת `price` אם קיים.

---

## 3. Routes ו-Controllers

### 3.1 אזורים (Regions)

**Base path:** `/api/delivery-regions` (או כפי שמתאים ל-index).

| Method | Path | תיאור |
|--------|------|--------|
| GET | `/` | רשימת כל האזורים (כולל `deliveries` ו-`priceRules`) |
| GET | `/:id` | אזור בודד לפי ID |
| POST | `/` | יצירת אזור (body: `{ name }`) |
| PUT | `/:id` | עדכון אזור (body: `{ name }`) |
| DELETE | `/:id` | מחיקת אזור (לבדוק שאין יעדים משויכים) |
| PUT | `/:regionId/price-rules` | עדכון כללי תמחור (body: `{ priceRules: [{ minOrderTotal, shippingCost }] }`) |

**פעולות:**

1. **GET /delivery-regions**  
   - Controller: טוען את כל ה-Regions, עבור כל region עושה `populate` או שאילתה נפרדת ל-deliveries (לפי region).  
   - מחזיר מערך אזורים, כל אחד עם `deliveries` ו-`priceRules`.

2. **GET /delivery-regions/:id**  
   - טוען Region לפי id, populate ל-deliveries.  
   - מחזיר אובייקט אזור אחד.

3. **POST /delivery-regions**  
   - יוצר Region עם `name` (ו-`priceRules: []` אם לא נשלח).  
   - מחזיר את האזור שנוצר.

4. **PUT /delivery-regions/:id**  
   - מעדכן רק `name` של האזור.  
   - מחזיר את האזור המעודכן.

5. **DELETE /delivery-regions/:id**  
   - בודק אם יש Deliveries עם `region: id`. אם כן – להחזיר 409 או 400 עם הודעה.  
   - מוחק את האזור.  
   - מחזיר 200.

6. **PUT /delivery-regions/:regionId/price-rules**  
   - Body: `{ priceRules: [ { minOrderTotal: 2200, shippingCost: 0 }, ... ] }`.  
   - מיון: לפי `minOrderTotal` **יורד** (גבוה לנמוך).  
   - עדכון ה-Region: `region.priceRules = sorted`.  
   - שמירה והחזרת האזור.

---

### 3.2 יעדים (Deliveries)

**Base path:** `/api/deliveries`

- **POST /deliveries**  
  Body חייב לכלול `region` (ObjectId). דוגמה: `{ city, days, region }`.  
  **פעולה:** ולידציה ש-`region` קיים; יצירת Delivery עם `region`.

- **PUT /deliveries/:id**  
  אפשר לעדכן `city`, `days`, ואם רוצים גם `region`.  
  **פעולה:** עדכון המסמך.

- **GET /deliveries**  
  **פעולה:** להחזיר את **כל** ה-Deliveries (עם populate ל-`city` ו-`region` אם צריך).  
  שימוש: מסך הזמנות (Orders) משתמש ברשימת ערים לסינון – לכן צריך endpoint שמחזיר את כל היעדים.

- **GET /delivery-regions/:regionId/deliveries**  
  (אופציונלי – אם האדמין טוען יעדים לפי אזור. כרגע האדמין מקבל אזורים עם `deliveries` מוטמעים מ-GET /delivery-regions.)

- **DELETE /deliveries/:id**  
  מחיקת יעד.

- **PATCH /deliveries/delete/many**  
  מחיקה מרובה (body: `{ ids: [] }`).

**פעולה:** לוודא שכל יצירה/עדכון של Delivery כולל `region` תקף.

---

## 4. חישוב משלוח בהזמנה (אחרי הנחות)

**מיקום:** בלוגיקת יצירת ההזמנה (למשל `customerOrderController.addOrder` או service שמחשב משלוח).

**רצף לוגי:**

1. **סכום להשוואה:**  
   לחשב את סכום העגלה **אחרי** מבצעים וקופון (לפני הוספת משלוח).  
   לדוגמה: `orderSubtotalAfterDiscounts` = סיכום מוצרים עם מחיר סופי אחרי מבצעים/קופון.

2. **איתור אזור לפי עיר:**  
   מהכתובת/עיר של הלקוח (`user_info.address.city` – או ה-id של העיר אם שומרים ככה):  
   - למצוא Delivery שמכיל את העיר הזו (למשל לפי `city` ref או `city_name_he`).  
   - אם נמצא – לקחת את ה-`region` של ה-Delivery.  
   - אם לא נמצא – להחזיר שגיאה (אין משלוח לעיר זו) או משלוח 0 לפי מדיניות.

3. **טעינת כללי התמחור:**  
   לטעון את ה-Region (או רק את `priceRules`) לפי ה-region שמצאנו.

4. **בחירת כלל:**  
   למיין את `priceRules` לפי `minOrderTotal` **יורד** (גבוה לנמוך).  
   לעבור על המערך ולבחור את **הראשון** שמתקיים:  
   `orderSubtotalAfterDiscounts >= rule.minOrderTotal`  
   אז `shippingCost = rule.shippingCost`.

5. **שמירה בהזמנה:**  
   להגדיר ב-Order:  
   `order.shippingCost = shippingCost`  
   ולחשב מחדש את `order.total` (subtotal אחרי הנחות + shippingCost וכו').

**פעולה:** באותו מקום שבו היום מחשבים משלוח (למשל לפי עיר/מחיר קבוע) – להחליף בלוגיקה למעלה (אזור → priceRules → סכום אחרי הנחות).

---

## 5. דוגמת קוד לחישוב משלוח (ב-Backend)

```js
// פונקציה: חישוב דמי משלוח לפי אזור וסכום אחרי הנחות
async function calculateShippingByRegion(cityIdOrCityDoc, orderSubtotalAfterDiscounts) {
  const Delivery = require("../models/Delivery");
  const Region = require("../models/Region");

  const delivery = await Delivery.findOne({
    $or: [
      { "city._id": cityIdOrCityDoc },
      { city: cityIdOrCityDoc },
    ],
  }).populate("region");

  if (!delivery || !delivery.region) {
    return null; // או לזרוק שגיאה – אין משלוח לעיר זו
  }

  const region = await Region.findById(delivery.region._id).select("priceRules");
  const rules = (region?.priceRules || []).slice().sort((a, b) => b.minOrderTotal - a.minOrderTotal);

  for (const rule of rules) {
    if (orderSubtotalAfterDiscounts >= (rule.minOrderTotal || 0)) {
      return rule.shippingCost;
    }
  }

  return rules.length ? rules[rules.length - 1].shippingCost : 0;
}
```

**פעולה:** להטמיע פונקציה דומה ב-service/controller של ההזמנה, ולקרוא לה עם העיר והסכום אחרי הנחות.

---

## 6. סיכום פעולות ב-Backend

| # | פעולה |
|---|--------|
| 1 | ליצור מודל `Region` עם `name` ו-`priceRules` (מיון ב-pre save). |
| 2 | לעדכן מודל `Delivery`: שדה `region` (required); להסיר `price` אם קיים. |
| 3 | ליצור routes ו-controller ל-`/api/delivery-regions`: GET כל, GET by id, POST, PUT, DELETE, PUT price-rules. |
| 4 | לעדכן POST /deliveries שידרוש `region`; GET /deliveries יחזיר את כל היעדים (לסינון ערים בהזמנות). |
| 5 | בחישוב משלוח ב-addOrder: לחשב סכום אחרי הנחות, למצוא אזור לפי עיר, להפעיל כללי תמחור (מיון minOrderTotal יורד), להגדיר shippingCost ו-total. |

---

## 7. האדמין (mnm-admin)

- האדמין כבר מוכן: עמוד משלוחים עם אזורים, כללי תמחור ויעדים.  
- הוא קורא ל-`RegionServices` ו-`DeliveryServices` כמתואר למעלה.  
- יש fallback: אם `GET /delivery-regions` לא מחזיר אזורים, האדמין קורא ל-`GET /deliveries` ומציג כ-"כל הארץ" (אזור וירטואלי). אחרי שה-backend יעלה אזורים אמיתיים, Fallback לא יהיה בשימוש.
