// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Cookies from "js-cookie";
import he from "@/utils/translation/he.json";

i18n.use(initReactI18next).init({
  lng: "he",
  fallbackLng: "he",
  supportedLngs: ["he"],
  resources: {
    he: { translation: he },
  },
  interpolation: {
    escapeValue: false,
  },
});

Cookies.set("i18next", "he", {
  sameSite: "None",
  secure: true,
});

export default i18n;
