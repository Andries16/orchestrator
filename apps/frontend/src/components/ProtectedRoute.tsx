import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../utils/authStore.ts";

export const ProtectedRoute: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
