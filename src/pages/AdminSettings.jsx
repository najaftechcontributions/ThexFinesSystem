import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, User, Lock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { adminAPI } from "../services/api";
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
    admin_phone: "",
    company_name: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);



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
        admin_phone: response.data.admin_phone || "",
        company_name: response.data.company_name || "",
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
          Manage your profile and security settings
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
