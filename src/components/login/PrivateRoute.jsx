// login/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AdminContext } from "@/context/AdminContext";

/**
 * Who is allowed past.
 *
 * A signed-in session gets through, whoever it belongs to. BizzStudio is NOT
 * confined to `/platform/*`: the tenant screens work for it, showing every
 * tenant's rows at once with `tenantId` on each saying whose it is. That is the
 * point of the whole arrangement — one set of screens for both audiences, not a
 * console that reimplements them.
 *
 * Nothing about who may see WHAT is decided here. `buildTenantFilter` on the
 * server does that, from a role it sets itself during authentication, and a
 * client-side check could only ever agree with it or be wrong.
 */
const PrivateRoute = ({ children }) => {
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;

  if (!adminInfo) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
