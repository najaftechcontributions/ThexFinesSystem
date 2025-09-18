import React from "react";
import { User, Shield, Eye } from "lucide-react";

function AuthInfo() {
  const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || "admin";
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
  const viewerUsername = import.meta.env.VITE_VIEWER_USERNAME || "viewer";
  const viewerPassword = import.meta.env.VITE_VIEWER_PASSWORD || "view123";

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="text-blue-600" size={20} />
          <h3 className="font-medium text-blue-800">Admin Account</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p><strong>Username:</strong> {adminUsername}</p>
          <p><strong>Password:</strong> {adminPassword}</p>
          <p className="text-blue-600">
            <strong>Permissions:</strong> Can manage employees, violations, fines, and admin settings
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Eye className="text-green-600" size={20} />
          <h3 className="font-medium text-green-800">Viewer Account</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p><strong>Username:</strong> {viewerUsername}</p>
          <p><strong>Password:</strong> {viewerPassword}</p>
          <p className="text-green-600">
            <strong>Permissions:</strong> Can only view fines and reports
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <User className="text-yellow-600" size={20} />
          <h3 className="font-medium text-yellow-800">Note</h3>
        </div>
        <p className="text-sm text-yellow-700">
          To access the violations page, you need to log in with the admin account 
          since it requires "manage_violations" permission.
        </p>
      </div>
    </div>
  );
}

export default AuthInfo;
