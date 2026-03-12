# Backend: אזורים ויעדי משלוח + חישוב משלוח לפי סכום (אחרי הנחות)

מסמך זה מתאר **במדויק** את כל הפעולות שיש לבצע ב-**mnm-backend** כדי לתמוך באזורי משלוח, יעדים בתוך אזור, וכללי תמחור לפי סכום רכישה **אחרי הנחות**.

---

## 1. מודלים (Models)

### 1.1 מודל אזור משלוח (DeliveryRegion)

**פעולה:** ליצור קובץ `models/DeliveryRegion.js` (או לשנות אם קיים).

**תוכן:**

```js
const mongoose = require("mongoose");

const deliveryRegionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    priceRules: [
      {
        minOrderTotal: { type: Number, required: true, default: 0 },
        shippingCost: { type: Number, required: true, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// מיון לפי minOrderTotal יורד – כך בוחרים את הכלל הראשון שמתקיים (סכום >= מינימום)
deliveryRegionSchema.index({ "priceRules.minOrderTotal": -1 });

module.exports = mongoose.model("DeliveryRegion", deliveryRegionSchema);
```

**הסבר:**  
- `name` – שם האזור (למשל "כל הארץ", "צפון").  
- `priceRules` – מערך כללים: מעל `minOrderTotal` (סכום אחרי הנחות) דמי משלוח הם `shippingCost`.  
- יש למיין את `priceRules` לפי `minOrderTotal` **יורד** לפני שמירה או לפני חישוב (הכלל הראשון שמתקיים קובע).

---

### 1.2 מודל יעד משלוח (Delivery) – עדכון

**פעולה:** לעדכן את `models/Delivery.js` (או הקובץ הרלוונטי) כך שיהיה שדה אזור.

**שינויים נדרשים:**

1. להוסיף שדה `region` (הפניה לאזור):

```js
region: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "DeliveryRegion",
  required: true,
},
```

2. **להסיר** או **לא לחייב** את השדה `price` ב-Delivery – כי המחיר נקבע מכללי האזור, לא מהיעד.

**דוגמה למבנה מלא (אם המודל נראה אחרת אצלכם – להתאים):**

```js
const deliverySchema = new mongoose.Schema(
  {
    city: { type: Object, required: true }, // { city_name_he, _id, ... }
    days: [{ type: Object }],
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryRegion",
      required: true,
    },
  },
  { timestamps: true }
);
```

**הסבר:**  
- כל יעד (עיר + ימים) **חייב** להיות משויך ל-`region`.  
- אין מחיר על היעד; המחיר נקבע מכללי התמחור של האזור.

---

## 2. Routes ו-Controllers

### 2.1 Routes לאזורים

**פעולה:** ליצור או לעדכן routes כך שיתמכו ב:

- `GET /api/delivery-regions` – רשימת כל האזורים (כולל יעדים וכללי תמחור).
- `GET /api/delivery-regions/:id` – אזור בודד.
- `POST /api/delivery-regions` – יצירת אזור.
- `PUT /api/delivery-regions/:id` – עדכון אזור (למשל שם).
- `DELETE /api/delivery-regions/:id` – מחיקת אזור.
- `PUT /api/delivery-regions/:regionId/price-rules` – עדכון כללי תמחור לאזור.
- `GET /api/delivery-regions/:regionId/deliveries` – יעדים של אזור (אופציונלי – אם האדמין צריך רק יעדים לפי אזור).

**דוגמה ל-router (Express):**

```js
// routes/deliveryRegionRoutes.js
const express = require("express");
const router = express.Router();
const deliveryRegionController = require("../controllers/deliveryRegionController");
const { isAdmin } = require("../config/auth");

router.get("/", isAdmin, deliveryRegionController.getAllRegions);
router.get("/:id", isAdmin, deliveryRegionController.getRegionById);
router.post("/", isAdmin, deliveryRegionController.addRegion);
router.put("/:id", isAdmin, deliveryRegionController.updateRegion);
router.delete("/:id", isAdmin, deliveryRegionController.deleteRegion);
router.put("/:regionId/price-rules", isAdmin, deliveryRegionController.updatePriceRules);
router.get("/:regionId/deliveries", isAdmin, deliveryRegionController.getDeliveriesByRegion);

module.exports = router;
```

**פעולה:** ב-`api/index.js` (או קובץ ההרכבה הראשי) ל mount:

```js
app.use("/api/delivery-regions", deliveryRegionRoutes);
```

---

### 2.2 Controller לאזורים

**פעולה:** ליצור `controllers/deliveryRegionController.js`.

**פעולות נדרשות:**

1. **getAllRegions**  
   - לקרוא MongoDB את כל ה-DeliveryRegion.  
   - לכל אזור למלא (populate) או לאסוף בנפרד את ה-deliveries (Delivery שבו `region = אזור._id`).  
   - להחזיר מערך או אובייקט `{ regions: [...] }` כך שכל איבר יכיל: `_id`, `name`, `priceRules`, `deliveries`.

2. **getRegionById**  
   - למצוא אזור לפי `id`, אופציונלי עם populate של deliveries.  
   - להחזיר את האזור.

3. **addRegion**  
   - לקבל `req.body.name`.  
   - ליצור מסמך DeliveryRegion חדש עם `name` ו-`priceRules: []`.  
   - להחזיר את האזור שנוצר.

4. **updateRegion**  
   - לקבל `id` ו-`req.body` (למשל `name`).  
   - לעדכן את האזור (לא למחוק priceRules כאן – יש route נפרד).

5. **deleteRegion**  
   - למחוק את האזור.  
   - להחליט: למחוק גם את כל ה-Delivery שמשויכים לאזור, או להחזיר שגיאה אם יש יעדים (מומלץ: למחוק יעדים או לחסום מחיקה אם יש יעדים – לפי החלטת מוצר).

6. **updatePriceRules**  
   - לקבל `regionId` ו-`req.body.priceRules` (מערך של `{ minOrderTotal, shippingCost }`).  
   - למיין את המערך לפי `minOrderTotal` **יורד**.  
   - לעדכן את האזור: `region.priceRules = sorted`.  
   - לשמור ולהחזיר את האזור.

7. **getDeliveriesByRegion** (אופציונלי)  
   - להחזיר Delivery.find({ region: regionId }) עם populate אם צריך.

**דוגמה ל-getAllRegions (לוגיקה):**

```js
const DeliveryRegion = require("../models/DeliveryRegion");
const Delivery = require("../models/Delivery");

exports.getAllRegions = async (req, res) => {
  try {
    const regions = await DeliveryRegion.find().lean();
    const regionIds = regions.map((r) => r._id);
    const deliveriesByRegion = await Delivery.find({ region: { $in: regionIds } }).lean();

    const grouped = {};
    deliveriesByRegion.forEach((d) => {
      const id = d.region.toString();
      if (!grouped[id]) grouped[id] = [];
      grouped[id].push(d);
    });

    const result = regions.map((r) => ({
      ...r,
      deliveries: grouped[r._id.toString()] || [],
      priceRules: r.priceRules || [],
    }));

    return res.send({ regions: result });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
```

---

### 2.3 Routes ליעדים (Delivery)

**פעולה:** לעדכן את ה-routes של Delivery כך ש:

- `POST /api/deliveries` – יקבל `body` עם `city`, `days`, `region` (חובה).  
- `PUT /api/deliveries/:id` – יעדכן יעד (כולל `region` אם רוצים להעביר אזור).  
- `DELETE /api/deliveries/:id` – מוחק יעד.  
- `GET /api/deliveries` – אם נדרש לכל המערכת: להחזיר כל ה-deliveries עם populate ל-region (או בלי, לפי צורך).

**Controller של Delivery:**  
- ב-create: לוודא ש-`region` נשלח ו-valid.  
- לא לחשב מחיר ב-Delivery – המחיר רק מכללי האזור.

---

## 3. חישוב דמי משלוח בהזמנה (אחרי הנחות)

**פעולה:** במקום שבו מחשבים היום את `shippingCost` בהזמנה (בדרך כלל ב-`addOrder` או ב-service של הזמנה):

1. **להגדיר את הסכום להשוואה:**  
   סכום הרכישה **אחרי** הנחות (מבצעים, קופון) – כלומר **לפני** הוספת משלוח.  
   בדרך כלל:  
   `orderTotalAfterDiscounts = subTotal - discount - offerDiscount`  
   (או איך שזה מחושב אצלכם).

2. **למצוא את האזור לפי עיר הלקוח:**  
   - מהכתובת/עיר שנשלחת בהזמנה (`user_info.address.city` או מזהה עיר).  
   - למצוא מסמך Delivery אחד שהעיר שלו תואמת (למשל לפי `city._id` או `city.city_name_he`).  
   - אם נמצא – לקחת את ה-`region` (ObjectId) של ה-Delivery.  
   - אם לא נמצא – להחליט: להחזיר שגיאה או להגדיר אזור ברירת מחדל (למשל אזור "כל הארץ" אם יש כזה).

3. **למצוא את הכלל המתאים מתוך priceRules:**  
   - לטעון את האזור (DeliveryRegion) עם ה-`priceRules`.  
   - למיין את `priceRules` לפי `minOrderTotal` **יורד**.  
   - לעבור על הכללים לפי הסדר ו**לבחור את הראשון** שבו  
     `orderTotalAfterDiscounts >= rule.minOrderTotal`.  
   - דמי המשלוח = `rule.shippingCost`.

4. **לשמור בהזמנה:**  
   - `order.shippingCost = rule.shippingCost`  
   - לעדכן את `order.total` בהתאם (subTotal - discounts + shippingCost וכו').

**דוגמה לפונקציה (בשירות או controller):**

```js
async function getShippingCostByRegionAndOrderTotal(regionId, orderTotalAfterDiscounts) {
  const region = await DeliveryRegion.findById(regionId).lean();
  if (!region || !region.priceRules || region.priceRules.length === 0) {
    return 0;
  }
  const sorted = [...region.priceRules].sort((a, b) => (b.minOrderTotal || 0) - (a.minOrderTotal || 0));
  const rule = sorted.find((r) => (orderTotalAfterDiscounts || 0) >= (r.minOrderTotal || 0));
  return rule ? rule.shippingCost : 0;
}
```

**איך למצוא region מעיר:**  
למשל:

```js
const delivery = await Delivery.findOne({
  "city._id": userCityId,
  // או: "city.city_name_he": userCityName
}).populate("region").lean();

if (!delivery || !delivery.region) {
  return res.status(400).send({ message: "עיר לא משויכת לאזור משלוח" });
}
const shippingCost = await getShippingCostByRegionAndOrderTotal(
  delivery.region._id,
  orderTotalAfterDiscounts
);
```

---

## 4. סיכום פעולות ב-Backend

| # | פעולה | קובץ/מיקום |
|---|--------|-------------|
| 1 | יצירת מודל DeliveryRegion (name, priceRules) | `models/DeliveryRegion.js` |
| 2 | עדכון מודל Delivery: הוספת region (required), הסרת/אופציונלי price | `models/Delivery.js` |
| 3 | יצירת deliveryRegionRoutes ו-controller לאזורים | `routes/`, `controllers/deliveryRegionController.js` |
| 4 | Mount של `/api/delivery-regions` | `api/index.js` |
| 5 | עדכון Delivery routes/controller: POST עם region, אין price חובה | `routes/`, `controllers/` |
| 6 | חישוב משלוח ב-addOrder: עיר → אזור → orderTotalAfterDiscounts → priceRules → shippingCost | איפה שמחשבים הזמנה (למשל orderController / orderService) |
| 7 | וידוא שסכום להשוואה ל-priceRules הוא **אחרי הנחות** | באותה לוגיקה של addOrder |

---

## 5. האדמין (mnm-admin) – מה כבר קיים

- עמוד **משלוחים** טוען אזורים מ-`GET /delivery-regions` ומציג סקשנים (RegionSection) לכל אזור.  
- **הוסף אזור** פותח RegionDrawer ושולח `POST /delivery-regions` עם `name`.  
- בכל אזור: **הגדרות מחירי אזור** (priceRules) נשמרות ב-`PUT /delivery-regions/:id/price-rules` עם `{ priceRules: [{ minOrderTotal, shippingCost }] }`.  
- **הוסף יעד** בתוך אזור שולח `POST /deliveries` עם `city`, `days`, `region`.  
- מחיקת אזור/יעד: DeleteModal קורא ל-`RegionServices.deleteRegion(id)` או `DeliveryServices.deleteDelivery(id)`.

אחרי יישום כל השלבים למעלה ב-backend, המערכת תעבוד מקצה לקצה: אזורים, יעדים בתוך אזור, ותמחור משלוח לפי סכום **אחרי הנחות**.
