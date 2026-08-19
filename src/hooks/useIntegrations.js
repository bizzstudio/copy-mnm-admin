// src/hooks/useIntegrations.js
import { useCallback, useEffect, useState } from "react";

import IntegrationServices from "@/services/IntegrationServices";

/**
 * האינטגרציות של קטגוריה אחת או כמה, וכפתור טעינה מחדש.
 *
 * ── למה hook ולא קריאה בכל מסך ─────────────────────────────────────────────
 * שלושה מסכים שואלים עכשיו את אותה שאלה: מסך האינטגרציות, חברות המשלוח
 * ופלטפורמות המכירה. הם נבדלים רק בסינון שאחרי — מי מציג את הפעילות ומי את מה
 * שנותר. הבאת הנתונים עצמה זהה, וכפילות שלה פירושה שכל מסך מטפל בשגיאה ובמצב
 * הטעינה קצת אחרת.
 *
 * @param {string} category קטגוריה, או כמה מופרדות בפסיק (`finance,payment`)
 * @returns {{items: object[]|null, error: string|null, reload: () => Promise<void>}}
 *          `items` הוא `null` עד שהתשובה הראשונה חוזרת — כדי להבחין בין "טוען"
 *          לבין "אין כלום", שני מצבים שנראים אותו דבר במערך ריק
 */
export default function useIntegrations(category) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const data = await IntegrationServices.getIntegrations({ category });
      setItems(data?.integrations ?? []);
    } catch (err) {
      setItems([]);
      setError(err?.displayMessage || err?.message);
    }
  }, [category]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, error, reload };
}
