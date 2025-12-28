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
        <SidebarProvider>
          <Suspense fallback={<ThemeSuspense />}>
            <Windmill usePreferences theme={myTheme}>
              <App />
            </Windmill>
          </Suspense>
        </SidebarProvider>
      </PersistGate>
    </Provider>
  </AdminProvider>
);