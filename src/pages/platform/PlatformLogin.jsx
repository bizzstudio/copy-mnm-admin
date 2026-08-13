import React, { useContext, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import { AdminContext } from "@/context/AdminContext";
import PlatformServices from "@/services/PlatformServices";

/**
 * BizzStudio's own sign-in — a SEPARATE door from the tenant admin login.
 *
 * WHY IT IS SEPARATE. A platform account lives in its own collection, signs with
 * its own secret, and reaches every tenant. Folding it into `/login` would mean
 * one form deciding between two account stores by trying one and falling back to
 * the other — which turns the form into an oracle for which emails are
 * bizzstudio's, and makes "wrong password" and "wrong door" indistinguishable in
 * the code that has to keep them apart.
 *
 * The token lands in the SAME `adminInfo` cookie the ported admin already uses,
 * because `httpService` reads exactly that one to attach the Authorization
 * header. One place to look for "who is signed in", rather than two that can
 * disagree.
 */
const PlatformLogin = () => {
  const { dispatch } = useContext(AdminContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await PlatformServices.login({ email, password, mfaCode: mfaCode || undefined });
      if (!res?.token) throw new Error("no token");

      const info = { ...res.user, token: res.token, role: res.user?.role };
      dispatch({ type: "USER_LOGIN", payload: info });
      Cookies.set("adminInfo", JSON.stringify(info), { expires: 1, sameSite: "Lax" });
      navigate("/platform/tenants", { replace: true });
    } catch (err) {
      /**
       * One message for every failure. The server already answers identically
       * for an unknown account, a wrong password and a disabled one — repeating
       * its exact reason here would undo that on the client.
       */
      setError(
        err?.response?.data?.error?.message?.he ||
          "התחברות נכשלה. בדקו את הפרטים ונסו שוב."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex-1 h-full max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="p-8">
          <h1 className="mb-1 text-xl font-semibold text-gray-700 dark:text-gray-200">
            BizzStudio
          </h1>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            כניסת מנהלי הפלטפורמה
          </p>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">אימייל</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full mt-1 text-sm border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                required
              />
            </label>

            <label className="block mt-4 text-sm">
              <span className="text-gray-700 dark:text-gray-400">סיסמה</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full mt-1 text-sm border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                required
              />
            </label>

            {/* Shown always, sent only when filled — an account that has enrolled
                in two-factor cannot sign in without it, and one that has not is
                unaffected. */}
            <label className="block mt-4 text-sm">
              <span className="text-gray-700 dark:text-gray-400">
                קוד אימות דו-שלבי <span className="text-gray-400">(אם הוגדר)</span>
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="block w-full mt-1 text-sm border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="block w-full px-4 py-2 mt-6 text-sm font-medium leading-5 text-center text-white transition-colors duration-150 bg-emerald-600 border border-transparent rounded-lg active:bg-emerald-700 hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "מתחבר…" : "כניסה"}
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            כניסת מנהלי לקוח נמצאת בכתובת של הלקוח עצמו.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlatformLogin;
