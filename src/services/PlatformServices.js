import http from './httpService';

/**
 * The `/api/platform/*` surface — bizzstudio's own screens, not a tenant's.
 *
 * NOTE ON UNWRAPPING. This file arrived from an admin whose `httpService`
 * exported a raw axios instance, so every call ended `.then((r) => r.data)`.
 * MNM's `httpService` already unwraps the body before handing it back, so
 * keeping that would have unwrapped twice and every screen would have rendered
 * `undefined` — with no error to point at. The calls return the body directly.
 *
 * `http.get(url, config)` — the second argument is passed to axios as its config,
 * which is why `{ params }` works here unchanged.
 */
const PlatformServices = {
  listTenants: (params) => http.get('/platform/tenants', { params }),
  getTenant: (id) => http.get(`/platform/tenants/${id}`),
  checkSlug: (slug) => http.get('/platform/tenants/slug-available', { params: { slug } }),
  createTenant: (body) => http.post('/platform/tenants', body),
  updateTenant: (id, body) => http.patch(`/platform/tenants/${id}`, body),

  listTenantUsers: (id) => http.get(`/platform/tenants/${id}/users`),
  listTenantAudit: (id, params) => http.get(`/platform/tenants/${id}/audit`, { params }),
  listPlans: () => http.get('/platform/plans'),

  /** Issue a one-shot impersonation ticket. Needs the ACTOR's own operation password. */
  impersonate: (id, body) => http.post(`/platform/tenants/${id}/impersonate`, body),

  listModules: (kind) => http.get('/platform/modules', { params: kind ? { kind } : {} }),
  createModule: (body) => http.post('/platform/modules', body),
  updateModule: (key, body) => http.patch(`/platform/modules/${key}`, body),

  /**
   * Platform sign-in. Deliberately OUTSIDE the platform router, which requires a
   * platform token — the whole point of this call is that the caller has not got
   * one yet.
   */
  login: (body) => http.post('/platform/login', body),
};

export default PlatformServices;
