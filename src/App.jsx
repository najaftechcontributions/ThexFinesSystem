import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import { initializeDatabase } from "./services/turso";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ManageEmployees from "./pages/ManageEmployees";
import ManageViolations from "./pages/ManageViolations";
import AdminSettings from "./pages/AdminSettings";
import ProtectedRoute from "./components/UI/ProtectedRoute";

function App() {
  useEffect(() => {
    async function initApp() {
      try {
        console.log("🚀 Fine Tracker Application Started");
        await initializeDatabase();
      } catch (error) {
        console.error("❌ Database initialization failed:", error);
        // Don't prevent app from loading if database fails
        console.warn("⚠️ App will continue to run, but database features may not work");
      }
    }

    // Only initialize once per app session
    initApp();
  }, []);

  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route
                path="employees"
                element={
                  <ProtectedRoute permission="manage_employees">
                    <ManageEmployees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="violations"
                element={
                  <ProtectedRoute permission="manage_violations">
                    <ManageViolations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute permission="admin_settings">
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--card-background)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
              },
              success: {
                iconTheme: {
                  primary: "var(--success-color)",
                  secondary: "white",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--danger-color)",
                  secondary: "white",
                },
              },
            }}
          />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
