// src/utils/tenantFormat.js
/**
 * Date formatting for the platform screens.
 *
 * Small and local on purpose: the ported admin has `useUtilsFunction` for its own
 * formatting, but that hook reads the tenant's currency and locale settings —
 * which is the wrong source for bizzstudio's screens, where a timestamp belongs
 * to the PLATFORM and should read the same regardless of whose tenant is open.
 */

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("he-IL", {
        day: "2-digit", month: "2-digit", year: "2-digit",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";
