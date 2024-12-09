import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  if (localStorage.getItem("token_user")) return <Navigate to="/" />;
  return <Outlet />;
};

export default PrivateRoutes;
