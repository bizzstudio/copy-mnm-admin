import axios from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || "/api",
  timeout: 50000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  let adminInfo;
  if (Cookies.get("adminInfo")) {
    adminInfo = JSON.parse(Cookies.get("adminInfo"));
  }

  let company;

  if (Cookies.get("company")) {
    company = Cookies.get("company");
  }

  // console.log('Admin Http Services Cookie Read : ' + company);
  // let companyName = JSON.stringify(company);

  /**
   * BizzStudio's chosen tenant, attached to every request.
   *
   * A platform session reads the tenant screens UNFILTERED, so without this the
   * only view available is "all customers at once". `buildTenantFilter` narrows
   * to a single tenant when it is given one — but only for a context the server
   * marked `super-admin` itself during authentication. Setting this cookie as a
   * tenant admin changes nothing at all: the value is dropped without comment.
   *
   * Sent as a query parameter rather than a header because that is what
   * `tenantContextMiddleware` already reads, and because it then shows up in
   * access logs beside the request it changed the meaning of.
   */
  const filterTenant = Cookies.get("bzFilterTenant");

  return {
    ...config,
    params: filterTenant ? { ...(config.params || {}), tenantId: filterTenant } : config.params,
    headers: {
      authorization: adminInfo ? `Bearer ${adminInfo.token}` : null,
      company: company ? company : null,
    },
  };
});

/**
 * ONE readable sentence out of three different error shapes.
 *
 * The server speaks two envelopes and will for a while yet. Anything that goes
 * through the shared error handler answers
 *
 *     { error: { message: { he, en }, requestId, status } }
 *
 * while the ported MNM controllers still `res.send({ message: … })` themselves,
 * sometimes bilingual and sometimes a bare string. A component cannot be expected
 * to know which of its endpoints has been migrated, so the unwrapping happens
 * once, here.
 *
 * `requestId` is appended to a 500 on purpose: it is the only thing that ties
 * what the operator saw to the line in the server log, and asking someone to
 * describe an error from memory is how a report becomes unactionable.
 */
const LANG = () => {
  const raw = Cookies.get("i18next") || "he";
  return raw === "he-IL" ? "he" : raw;
};

/**
 * @returns {string|null} null when the payload carries no message at all — the
 * caller supplies the fallback, because "something went wrong" is right for a
 * failure and actively confusing on a silent success.
 */
export function extractMessage(payload, status = 0) {
  const lang = LANG();
  const envelope = payload?.error ?? payload;
  const message = envelope?.message;

  const text =
    (typeof message === "string" && message) ||
    message?.[lang] ||
    message?.he ||
    message?.en ||
    null;

  if (!text) return null;
  return envelope?.requestId && status >= 500 ? `${text} (${envelope.requestId})` : text;
}

export const genericError = () =>
  LANG() === "he" ? "אירעה שגיאה" : "Something went wrong";

/**
 * Attach `displayMessage` to every rejection.
 *
 * The platform screens are all written as `.catch((err) => setError(err.displayMessage))`
 * — and nothing was setting it, so every one of them rendered an empty error box:
 * the request failed, the screen said so with a blank message, and the reason was
 * only ever in the network tab.
 */
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    err.displayMessage = err.response
      ? extractMessage(err.response.data, err.response.status) || genericError()
      : LANG() === "he"
        ? "אין תקשורת עם השרת"
        : "Cannot reach the server";
    return Promise.reject(err);
  }
);

const responseBody = (response) => response.data;

const requests = {
  get: (url, body, headers) =>
    instance.get(url, body, headers).then(responseBody),

  /** Full axios response (e.g. blob PDF) — Authorization header still applied */
  getBlob: (url) => instance.get(url, { responseType: "blob" }),

  /** Full axios response with extended timeout (e.g. large ZIP downloads) */
  getBlobLongTimeout: (url, timeoutMs = 600000) =>
    instance.get(url, { responseType: "blob", timeout: timeoutMs }),

  post: (url, body) => instance.post(url, body).then(responseBody),

  put: (url, body, headers) =>
    instance.put(url, body, headers).then(responseBody),

  patch: (url, body) => instance.patch(url, body).then(responseBody),

  /**
   * A DELETE with a body — `{ ids: [...] }` for the bulk routes.
   *
   * axios reads the second argument of `delete` as a CONFIG object, not as a body,
   * so `requests.delete(url, { ids })` sent no body at all and every caller that
   * passed one — `deleteCategory`, `deleteAttribute`, `deleteCurrency` — was
   * silently sending nothing. It never showed, because the routes those calls hit
   * take the id from the path and ignore the body.
   *
   * The bulk routes under `/api/admin` do not: their selection IS the body. Wrapping
   * in `data` is what every one of those call sites already believes is happening.
   */
  delete: (url, body) =>
    instance.delete(url, body === undefined ? undefined : { data: body }).then(responseBody),
};

export default requests;
