// login/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AdminContext } from "@/context/AdminContext";

/**
 * Who is allowed past, and where they belong.
 *
 * BizzStudio's own operators are kept inside `/platform/*`. Everything else in
 * this admin is ONE TENANT's data — the dashboard, the catalogue, the orders —
 * and a platform session is not inside a tenant, so those screens have nothing
 * to show. Landing on the tenant dashboard as BizzStudio produced a full page of
 * widgets reading "no data" and a console full of 404s, which looks exactly like
 * a broken deployment and is in fact the system answering correctly: it cannot
 * say whose sales figures to draw.
 *
 * To read a tenant's screens as that tenant, use impersonation. That is what it
 * is for, it is audited, and it is time-limited — none of which is true of
 * quietly letting a platform token wander into tenant routes.
 */
const PLATFORM_ROLES = ["superadmin", "platform-admin"];

const PrivateRoute = ({ children }) => {
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const location = useLocation();

  if (!adminInfo) {
    return <Navigate to="/login" replace />;
  }

  const isPlatform = PLATFORM_ROLES.includes(adminInfo?.role);
  const onPlatformScreen = location.pathname.startsWith("/platform");

  if (isPlatform && !onPlatformScreen) {
    return <Navigate to="/platform/tenants" replace />;
  }

  /**
   * The reverse is NOT enforced here. A tenant admin who types a platform URL
   * reaches a screen that loads nothing, because the server refuses every
   * `/api/platform/*` call without a platform token. Bouncing them would be
   * tidier; it would also mean two places decide who may see the platform, and
   * only one of them is the server.
   */
  return children;
};

export default PrivateRoute;
