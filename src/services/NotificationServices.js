// src/services/NotificationServices.js
import requests from "./httpService";

const NotificationServices = {
  // יצירת התראה חדשה
  createNotification: async (body) => {
    return requests.post("/notification/add", body);
  },

  // שליפת כל ההתראות עם דפדוף (ה-backend מחזיר גם totalDoc, totalUnreadDoc)
  getAllNotifications: async (page = 1) => {
    return requests.get(`/notification/?page=${page}`);
  },

  // שליפת התראות עם דפדוף (אותו endpoint – ה-backend מחזיר את כולן + totalUnreadDoc)
  getUnreadNotifications: async (page = 1) => {
    return requests.get(`/notification/?page=${page}`);
  },

  // עדכון התראה (ה-backend מצפה ל־status: "read" / "unread")
  updateNotification: async (id, body) => {
    return requests.put(`/notification/${id}`, body);
  },

  // מחיקת התראה
  deleteNotification: async (id) => {
    return requests.delete(`/notification/${id}`);
  },

  // מחיקת התראות רבות
  deleteManyNotifications: async (body) => {
    return requests.patch("/notification/delete/many", body);
  },
};

export default NotificationServices;