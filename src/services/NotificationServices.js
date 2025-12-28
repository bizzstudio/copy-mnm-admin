// src/services/NotificationServices.js
import requests from "./httpService";

const NotificationServices = {
  // יצירת התראה חדשה
  createNotification: async (body) => {
    return requests.post("/admin-notification/add", body);
  },

  // שליפת כל ההתראות עם דפדוף
  getAllNotifications: async (page = 1) => {
    return requests.get(`/admin-notification/all?page=${page}`);
  },

  // שליפת התראות שלא נקראו עם דפדוף
  getUnreadNotifications: async (page = 1) => {
    return requests.get(`/admin-notification/unread?page=${page}`);
  },

  // שליפת התראה לפי מזהה
  getNotificationById: async (id) => {
    return requests.get(`/admin-notification/${id}`);
  },

  // עדכון התראה
  updateNotification: async (id, body) => {
    return requests.put(`/admin-notification/${id}`, body);
  },

  // מחיקת התראה
  deleteNotification: async (id) => {
    return requests.delete(`/admin-notification/${id}`);
  },

  // מחיקת התראות רבות
  deleteManyNotifications: async (body) => {
    return requests.patch("/admin-notification/delete-many", body);
  },
};

export default NotificationServices;