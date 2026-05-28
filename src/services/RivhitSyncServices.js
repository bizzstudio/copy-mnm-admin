// src/services/RivhitSyncServices.js
import requests from "./httpService";

const RivhitSyncServices = {
    // dryRun=true (ברירת מחדל): מחשב שינויים בלי לכתוב, שולח דוח אימייל ל-ADMINS_EMAILS, ומחזיר summary
    // dryRun=false (LIVE): כותב באמת ל-DB
    syncProducts: async ({ dryRun = true } = {}) => {
        return requests.post("/rivhit-sync/products", { dryRun });
    },
};

export default RivhitSyncServices;
