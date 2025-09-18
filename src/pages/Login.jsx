import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(credentials);
      if (result.success) {
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse"
          style={{ top: "20%", left: "10%", animationDelay: "0s" }}
        ></div>
        <div
          className="absolute w-10 h-10 bg-white bg-opacity-10 rounded-full animate-pulse"
          style={{ top: "60%", right: "15%", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"
          style={{ top: "40%", left: "70%", animationDelay: "4s" }}
        ></div>
      </div>

      <Link
        to="/"
        className="absolute top-5 left-5 flex items-center gap-2 text-white bg-white bg-opacity-20 px-4 py-2 rounded-full hover:bg-opacity-30 transition-all backdrop-blur-sm"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <Lock size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-light mb-2">Login Portal</h1>
          <p className="opacity-90 text-sm">ThexSol Fine Management System</p>
        </div>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-1/2  translate-top text-gray-400"
                />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2  translate-top text-gray-400"
                />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-lg py-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                transform: "translateY(0)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* <div className="text-center mt-8 pt-6 border-t border-gray-200 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-medium text-blue-900 mb-3">Demo Credentials:</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="font-medium text-blue-900 mb-1">👑 Admin Account</div>
                  <div className="text-blue-700">
                    <strong>Username:</strong> {import.meta.env.VITE_ADMIN_USERNAME || "admin"}<br />
                    <strong>Password:</strong> {import.meta.env.VITE_ADMIN_PASSWORD || "admin123"}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Full access to all features</div>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="font-medium text-green-900 mb-1">👁️ Viewer Account</div>
                  <div className="text-green-700">
                    <strong>Username:</strong> {import.meta.env.VITE_VIEWER_USERNAME || "viewer"}<br />
                    <strong>Password:</strong> {import.meta.env.VITE_VIEWER_PASSWORD || "view123"}
                  </div>
                  <div className="text-xs text-green-600 mt-1">View-only access</div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Go back to dashboard
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Login;
