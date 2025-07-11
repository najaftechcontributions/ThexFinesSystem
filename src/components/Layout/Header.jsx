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
import toast from "react-hot-toast";

function Header() {
  const { isAuthenticated, logout } = useApp();
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
              Login as Admin
            </Link>
          )}
        </div>

        <div className="flex gap-2">
          <Link to="/employees" className="nav-link">
            <Users size={16} />
            Employees
          </Link>

          <Link to="/violations" className="nav-link">
            <AlertTriangle size={16} />
            Violations
          </Link>

          {isAuthenticated && (
            <Link to="/settings" className="nav-link">
              <Settings size={16} />
              Settings
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
