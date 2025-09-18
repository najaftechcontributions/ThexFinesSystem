import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  Settings,
  FileText,
  LogIn,
  LogOut,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

function Header() {
  const { isAuthenticated, user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="header">
      <div>
        <a href="/" style={{ textDecoration: "none" }}>
          <h1 className="header-title">ThexSol Fine Tracker</h1>
        </a>
      </div>

      <div className="header-actions">
        <div className="flex gap-2">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="nav-link">
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link to="/login" className="nav-link">
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>

        <div className="flex gap-2">
          {/* Show Employees link only for users with manage_employees permission */}
          {authAPI.hasPermission(user, "manage_employees") && (
            <Link to="/employees" className="nav-link">
              <Users size={16} />
              Employees
            </Link>
          )}

          {/* Show Violations link only for users with manage_violations permission */}
          {authAPI.hasPermission(user, "manage_violations") && (
            <Link to="/violations" className="nav-link">
              <AlertTriangle size={16} />
              Violations
            </Link>
          )}

          {/* Show Settings link only for users with admin_settings permission */}
          {authAPI.hasPermission(user, "admin_settings") && (
            <Link to="/settings" className="nav-link">
              <Settings size={16} />
              Settings
            </Link>
          )}

          {/* Show user role indicator */}
          {isAuthenticated && user && (
            <span className="nav-link text-blue-600 font-medium">
              {user.role === "admin" ? "Admin" : "Viewer"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
