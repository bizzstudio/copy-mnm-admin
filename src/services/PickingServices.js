// src/services/PickingServices.js
import requests from "./httpService";

const PickingServices = {
  /**
   * לוח הליקוט: מה בתור, מי מלקט מה, וכמה על כל אחד.
   *
   * `picker: "none"` = מה שעדיין לא שויך לאף אחד. זו השאלה הראשונה שמנהל מחסן
   * שואל, ולכן היא ערך מפורש ולא היעדר פילטר.
   */
  getBoard: async ({ status, picker } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (picker) params.set("picker", picker);
    return requests.get(`/admin/picking/board?${params.toString()}`);
  },

  /** `pickerId: null` משחרר את ההזמנה בחזרה לתור. */
  assignPicker: async (orderId, pickerId) =>
    requests.patch(`/admin/picking/orders/${orderId}/assign`, { pickerId }),
};

export default PickingServices;
