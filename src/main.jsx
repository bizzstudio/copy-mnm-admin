// src/main.jsx
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { Provider } from "react-redux";
import { Windmill } from "@windmill/react-ui";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

// Internal import
import "rc-tree/assets/index.css";
import "react-loading-skeleton/dist/skeleton.css";
import "@/assets/css/tailwind.css";
import "@/assets/css/custom.css";
import App from "@/App";
import myTheme from "@/assets/theme/myTheme";
import { AdminProvider } from "@/context/AdminContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { ModulesProvider } from "@/context/ModulesContext";
import ThemeSuspense from "@/components/theme/ThemeSuspense";
import store from "@/reduxStore/store";
import "@/i18n";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
});

let persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById("root")).render(
  <AdminProvider>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/*
          מודולי הלקוח נטענים פעם אחת, מעל הראוטר — הסיידבר, ובהמשך גם מסכים
          שמגודרים לפי מודול, קוראים את אותה תשובה ולא כל אחד את שלו.

          מעל `SidebarProvider` ולא מתחתיו: ה-Provider הזה טוען בעצמו נתונים
          שחלקם מגודר-מודול (מחירונים, שיטות תשלום מריווחית), ולכן הוא חייב
          לקרוא `useModules()`. `ModulesProvider` עצמו תלוי רק ב-`AdminContext`
          שנמצא מעל שניהם, כך שההיפוך הזה בטוח.
        */}
        <ModulesProvider>
          <SidebarProvider>
            <Suspense fallback={<ThemeSuspense />}>
              <Windmill usePreferences theme={myTheme}>
                <App />
              </Windmill>
            </Suspense>
          </SidebarProvider>
        </ModulesProvider>
      </PersistGate>
    </Provider>
  </AdminProvider>
);