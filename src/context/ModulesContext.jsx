// src/context/ModulesContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import requests from "@/services/httpService";
import { usePlatformRole } from "@/hooks/usePlatformRole";

/**
 * אילו מודולים דלוקים אצל הלקוח הזה.
 *
 * המקור הוא `GET /api/bootstrap` — אותו חוזה שהחנות כבר קוראת, נפתר לפי ה-Host
 * ולכן לא דורש טוקן. אין כאן קריאה שנייה למערכת ההרשאות ואין רשימת מודולים שנייה
 * שיכולה לסטות מזו של השרת.
 *
 * הפיילוד מחזיר מפתחות דלוקים בלבד, וכולם כ-`true` — אין `false` שאפשר לבדוק
 * הפוך בטעות, ואין דרך לדלוף את רשימת מה שהלקוח לא קנה.
 */
const ModulesContext = createContext({ modules: {}, apps: {}, resolved: false, loading: true });

/**
 * כשל בטעינה = הכל דלוק, לא הכל כבוי.
 *
 * בפיתוח האדמין רץ על `localhost`, שאינו דומיין רשום, ולכן bootstrap מחזיר 404.
 * אילו היינו נכשלים לצד "כבוי" כל התפריט היה נעלם ומפתח היה מחפש באג בסיידבר
 * במקום לראות דומיין חסר. הסתרת פריט היא נוחות; השרת הוא זה שמסרב בפועל
 * (`requireModule` מחזיר 404), כך שפתיחה יתרה כאן לא פותחת שום דבר באמת.
 */
export const ModulesProvider = ({ children }) => {
  const [state, setState] = useState({ modules: {}, apps: {}, resolved: false, loading: true });

  useEffect(() => {
    let alive = true;

    requests
      .get("/bootstrap")
      .then((data) => {
        if (!alive) return;
        setState({
          modules: data?.modules || {},
          /** `{ [moduleKey]: { enabled, url } }` — הדומיין של כל אפליקציה אצל הלקוח הזה. */
          apps: data?.apps || {},
          resolved: true,
          loading: false,
        });
      })
      .catch(() => {
        if (!alive) return;
        setState({ modules: {}, apps: {}, resolved: false, loading: false });
      });

    return () => {
      alive = false;
    };
  }, []);

  return <ModulesContext.Provider value={state}>{children}</ModulesContext.Provider>;
};

/**
 * @returns {{ modules: object, resolved: boolean, loading: boolean, isModuleEnabled: (key?: string) => boolean }}
 */
export const useModules = () => {
  const ctx = useContext(ModulesContext);
  const { isSuperAdmin } = usePlatformRole();

  return useMemo(
    () => ({
      ...ctx,
      /**
       * פריט בלי `moduleKey` תמיד מוצג — רוב המסכים אינם מגודרים, ודרישת מפתח
       * מכל פריט הייתה הופכת כל תוספת לתפריט לשינוי בקטלוג המודולים.
       *
       * bizzstudio רואה הכל: סשן פלטפורמה קורא את מסכי הלקוחות ללא סינון, ולכן
       * הסתרה לפי המודולים של הדומיין שעליו הוא במקרה יושב רק הייתה מסתירה ממנו
       * מסכים שהוא כן מורשה לפתוח.
       */
      isModuleEnabled: (key) => {
        if (!key) return true;
        if (isSuperAdmin) return true;
        if (!ctx.resolved) return true;
        return ctx.modules?.[key] === true;
      },
    }),
    [ctx, isSuperAdmin]
  );
};

export default ModulesContext;
