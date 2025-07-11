import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ManageEmployees from "./pages/ManageEmployees";
import ManageViolations from "./pages/ManageViolations";
import AdminSettings from "./pages/AdminSettings";

function App() {
  useEffect(() => {
    console.log("🚀 Fine Tracker Application Started");
  }, []);

  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<ManageEmployees />} />
              <Route path="violations" element={<ManageViolations />} />
              <Route path="settings" element={<AdminSettings />} />
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
