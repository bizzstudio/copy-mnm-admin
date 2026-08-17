// src/hooks/usePlatformRole.js
import { useContext } from "react";
import { AdminContext } from "@/context/AdminContext";

/**
 * "Is the signed-in operator bizzstudio?"
 *
 * The platform screens were written against a context of their own before the
 * MNM admin was ported in. Rather than keep two notions of "who is signed in",
 * they now read the port's `AdminContext` through this one hook — so there is a
 * single answer to the question and a single place to change it.
 *
 * This is UX only. The server refuses `/api/platform/*` to a tenant token
 * regardless, so hiding a screen is a courtesy, never the control.
 */
export function usePlatformRole() {
  const { state } = useContext(AdminContext);
  const adminInfo = state?.adminInfo ?? null;

  /**
   * `'superadmin'`, one word — the value `PlatformUser.role` actually stores and
   * the one `requirePlatformRole('superadmin')` checks on the server. The
   * hyphenated `'super-admin'` is the TENANT-side role name from
   * `@bizzexpo/shared`, and they are not the same thing: a tenant can call its
   * own manager "Super Admin" without that meaning anything at the platform.
   * Both spellings are accepted so a stale cookie does not silently hide every
   * screen, but the server is what decides either way.
   */
  const role = adminInfo?.role;

  return {
    userInfo: adminInfo,
    isSuperAdmin: role === "superadmin" || role === "super-admin",
  };
}

/** Named `useUser` so the ported platform screens read unchanged. */
export const useUser = usePlatformRole;
