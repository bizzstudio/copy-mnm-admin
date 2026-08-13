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

  delete: (url, body) => instance.delete(url, body).then(responseBody),
};

export default requests;
