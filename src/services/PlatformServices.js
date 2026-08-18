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

  /**
   * A tenant's own back-office staff, administered from the platform.
   * `resetTenantUserPassword` ALWAYS needs `operationPassword` — the gate on that
   * route is unconditional, because what is sensitive there is the action.
   */
  createTenantUser: (id, body) => http.post(`/platform/tenants/${id}/users`, body),
  updateTenantUser: (id, userId, body) => http.patch(`/platform/tenants/${id}/users/${userId}`, body),
  resetTenantUserPassword: (id, userId, body) =>
    http.post(`/platform/tenants/${id}/users/${userId}/password`, body),

  /** Hostnames. `markVerified` is a super-admin's explicit assertion, not a DNS check. */
  createTenantDomain: (id, body) => http.post(`/platform/tenants/${id}/domains`, body),
  updateTenantDomain: (id, domainId, body) =>
    http.patch(`/platform/tenants/${id}/domains/${domainId}`, body),
  deleteTenantDomain: (id, domainId) => http.delete(`/platform/tenants/${id}/domains/${domainId}`),
  /**
   * Switch a module on/off for one tenant, or configure it.
   * Returns `{ module, alsoEnabled, alsoDisabled }` — the last two are the
   * `requires`/`conflictsWith` cascade the server applied, and the caller is
   * expected to tell the operator about them.
   */
  updateTenantModule: (id, key, body) =>
    http.patch(`/platform/tenants/${id}/modules/${key}`, body),
  listTenantAudit: (id, params) => http.get(`/platform/tenants/${id}/audit`, { params }),
  listPlans: () => http.get('/platform/plans'),

  /** Issue a one-shot impersonation ticket. Needs the ACTOR's own operation password. */
  impersonate: (id, body) => http.post(`/platform/tenants/${id}/impersonate`, body),

  /** "Is this platform session still good?" — the platform side of validate-token. */
  me: () => http.get('/platform/me'),

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
