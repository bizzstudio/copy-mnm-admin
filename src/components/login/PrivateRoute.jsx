// login/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AdminContext } from "@/context/AdminContext";

const PrivateRoute = ({ children }) => {
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;

  if (!adminInfo) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;