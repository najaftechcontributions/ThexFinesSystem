import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { authAPI } from "../../services/api";

function ProtectedRoute({ children, permission, requireAuth = true }) {
  const { isAuthenticated, user } = useApp();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific permission is required but user doesn't have it
  if (permission && (!user || !authAPI.hasPermission(user, permission))) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
