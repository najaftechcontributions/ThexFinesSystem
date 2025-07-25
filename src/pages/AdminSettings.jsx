import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Mail, User, Lock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { adminAPI, finesAPI } from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

function AdminSettings() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({});

  // Profile form state
  const [profileData, setProfileData] = useState({
    admin_name: "",
    admin_email: "",
    admin_phone: "",
    company_name: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Email form state
  const [emailData, setEmailData] = useState({
    smtp_server: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    email_signature: "",
  });
  const [emailSaving, setEmailSaving] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadSettings();
  }, [isAuthenticated, navigate]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getSettings();
      setSettings(response.data);

      // Update form states
      setProfileData({
        admin_name: response.data.admin_name || "",
        admin_email: response.data.admin_email || "",
        admin_phone: response.data.admin_phone || "",
        company_name: response.data.company_name || "",
      });

      setEmailData({
        smtp_server: response.data.smtp_server || "smtp.gmail.com",
        smtp_port: response.data.smtp_port || 587,
        smtp_username: response.data.smtp_username || "",
        smtp_password: response.data.smtp_password || "",
        email_signature:
          response.data.email_signature || "Best regards,\nFine Tracker System",
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);

    try {
      const formData = new FormData();
      Object.entries(profileData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await adminAPI.updateSettings(formData);
      setSettings(response.data.settings);
      toast.success("Profile settings updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile settings");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailSaving(true);

    try {
      const formData = new FormData();
      Object.entries(emailData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await adminAPI.updateSettings(formData);
      setSettings(response.data.settings);
      toast.success("Email settings updated successfully");
    } catch (error) {
      console.error("Error updating email settings:", error);
      toast.error("Failed to update email settings");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      toast.loading(
        "Simulating email to adil.ahmed143.ak@gmail.com (preview only)...",
      );

      // Test by sending a test email to adil.ahmed143.ak@gmail.com
      const result = await finesAPI.emailReceipt(
        0,
        "adil.ahmed143.ak@gmail.com",
      );

      toast.dismiss();
      toast.success(result.data.message);
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Email configuration test failed");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);

    try {
      await adminAPI.changePassword(passwordData);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "email", label: "Email", icon: Mail },
    { id: "password", label: "Password", icon: Lock },
  ];

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner text="Loading admin settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">⚙️ Admin Settings</h2>
        <p className="text-gray-600 mt-1">
          Manage your profile, email configuration, and security settings
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <div className="tab-list">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="card">
              <div className="card-header">
                <h3>Admin Profile</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Admin Name</label>
                      <input
                        type="text"
                        value={profileData.admin_name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            admin_name: e.target.value,
                          }))
                        }
                        className="form-input"
                        placeholder="Administrator Name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        value={profileData.company_name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            company_name: e.target.value,
                          }))
                        }
                        className="form-input"
                        placeholder="Your Company Name"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        value={profileData.admin_email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            admin_email: e.target.value,
                          }))
                        }
                        className="form-input"
                        placeholder="admin@company.com"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.admin_phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            admin_phone: e.target.value,
                          }))
                        }
                        className="form-input"
                        placeholder="+92-300-1234567"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="btn btn-primary"
                    >
                      {profileSaving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save size={20} />
                          Save Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === "email" && (
            <>
              {/* Gmail Configuration Instructions */}
              <div className="card bg-blue-50 border-blue-200">
                <div className="card-header">
                  <h4 className="text-blue-800">📧 Gmail SMTP Configuration</h4>
                </div>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>
                    <strong>To use Gmail for sending emails:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>
                      Enable 2-Factor Authentication on your Gmail account
                    </li>
                    <li>Generate an "App Password" for this application</li>
                    <li>Use your Gmail address as SMTP Username</li>
                    <li>Use the App Password (not your regular password)</li>
                  </ol>
                  <p className="mt-3">
                    <strong>Default Settings:</strong> Server: smtp.gmail.com,
                    Port: 587 (TLS)
                  </p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="card bg-orange-50 border-orange-200">
                <div className="card-header">
                  <h4 className="text-orange-800">⚠️ Important Notice</h4>
                </div>
                <div className="text-sm text-orange-700 space-y-2">
                  <p>
                    <strong>This is a frontend-only application.</strong>
                  </p>
                  <p>
                    Email functionality shows{" "}
                    <strong>previews and simulations</strong> only. No real
                    emails are sent because browsers cannot send emails directly
                    for security reasons.
                  </p>
                  <p>
                    <strong>To send real emails, you would need:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>A backend server (Node.js, PHP, Python, etc.)</li>
                    <li>
                      Server-side email library (nodemailer, PHPMailer, etc.)
                    </li>
                    <li>SMTP configuration on the server</li>
                  </ul>
                  <p className="mt-2">
                    <em>
                      The test button shows realistic email previews to verify
                      your SMTP configuration is correct.
                    </em>
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Email Configuration</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">SMTP Server</label>
                        <input
                          type="text"
                          value={emailData.smtp_server}
                          onChange={(e) =>
                            setEmailData((prev) => ({
                              ...prev,
                              smtp_server: e.target.value,
                            }))
                          }
                          className="form-input"
                          placeholder="smtp.gmail.com"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">SMTP Port</label>
                        <input
                          type="number"
                          value={emailData.smtp_port}
                          onChange={(e) =>
                            setEmailData((prev) => ({
                              ...prev,
                              smtp_port: parseInt(e.target.value) || 587,
                            }))
                          }
                          className="form-input"
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">SMTP Username</label>
                      <input
                        type="text"
                        value={emailData.smtp_username}
                        onChange={(e) =>
                          setEmailData((prev) => ({
                            ...prev,
                            smtp_username: e.target.value,
                          }))
                        }
                        className="form-input"
                        placeholder="your-email@gmail.com"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        SMTP Password (App Password)
                      </label>
                      <input
                        type="password"
                        value={emailData.smtp_password}
                        onChange={(e) =>
                          setEmailData((prev) => ({
                            ...prev,
                            smtp_password: e.target.value,
                          }))
                        }
                        className="form-input"
                        placeholder="Gmail App Password (16 characters)"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Use Gmail App Password, not your regular password.
                        Generate at:
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-1"
                        >
                          myaccount.google.com/apppasswords
                        </a>
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Signature</label>
                      <textarea
                        value={emailData.email_signature}
                        onChange={(e) =>
                          setEmailData((prev) => ({
                            ...prev,
                            email_signature: e.target.value,
                          }))
                        }
                        className="form-input form-textarea"
                        rows="4"
                        placeholder="Best regards,&#10;Fine Management System"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={emailSaving}
                        className="btn btn-primary"
                      >
                        {emailSaving ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </div>
                        ) : (
                          <>
                            <Save size={20} />
                            Save Email Settings
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleTestEmail}
                        className="btn btn-secondary"
                        disabled={
                          !emailData.smtp_server ||
                          !emailData.smtp_username ||
                          !emailData.smtp_password
                        }
                      >
                        <Mail size={20} />
                        Test Configuration (Preview Only)
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="card">
              <div className="card-header">
                <h3>Change Password</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Enter new password"
                      minLength="6"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="btn btn-primary"
                    >
                      {passwordSaving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Changing...
                        </div>
                      ) : (
                        <>
                          <Save size={20} />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
