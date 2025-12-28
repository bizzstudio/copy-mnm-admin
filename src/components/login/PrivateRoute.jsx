import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AdminContext } from "@/context/AdminContext";

const PrivateRoute = ({ children }) => {
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const location = useLocation();

  return adminInfo?.email ? (
    children
  ) : (
    <Navigate
      to="/login"
      state={{ from: location }}
      replace
    />
  );
};

export default PrivateRoute;