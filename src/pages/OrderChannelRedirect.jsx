// src/pages/OrderChannelRedirect.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * `/cashier-orders` ו-`/agent-orders` → `/orders?source=…`
 *
 * שני המסכים האלה התאחדו לתוך מסך ההזמנות, אבל הכתובות שלהם נשארות חיות: הן
 * בסימניות של אנשים, בקישורים בהתראות ובכל מקום שמישהו שמר לפני האיחוד. הפניה
 * היא ההבדל בין "המסך עבר לכאן, עם הפילטר כבר מוגדר" לבין 404 שנראה כמו תקלה.
 *
 * `replace` ולא push — כפתור "אחורה" צריך לחזור למקום שממנו הגיעו, לא לקפוץ שוב
 * דרך ההפניה.
 */
const PATH_TO_SOURCE = {
  "/cashier-orders": "cashier",
  "/agent-orders": "agent",
};

const OrderChannelRedirect = () => {
  const { pathname, search } = useLocation();
  const source = PATH_TO_SOURCE[pathname];

  // כל שאר הפרמטרים בכתובת נשמרים — קישור עם טווח תאריכים לא מאבד אותו בדרך
  const params = new URLSearchParams(search);
  if (source) params.set("source", source);

  return <Navigate to={`/orders?${params.toString()}`} replace />;
};

export default OrderChannelRedirect;
