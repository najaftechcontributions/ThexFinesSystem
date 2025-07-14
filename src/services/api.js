/**
 * API Service
 * Real API interface for SQLite database operations via backend server
 */

// Base API URL
const API_BASE = "/api";

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  // Handle FormData
  if (options.body instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// Helper function to process form data
function processFormData(formData) {
  if (formData instanceof FormData) {
    const obj = {};
    for (let [key, value] of formData.entries()) {
      obj[key] = value;
    }
    return obj;
  }
  return formData;
}

// Authentication API
export const authAPI = {
  async login(credentials) {
    return await apiCall("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  async logout() {
    return await apiCall("/auth/logout", {
      method: "POST",
    });
  },

  async checkAuth() {
    return await apiCall("/auth/check");
  },
};

// Employees API
export const employeesAPI = {
  async getAll() {
    return await apiCall("/employees");
  },

  async getById(id) {
    return await apiCall(`/employees/${id}`);
  },

  async add(formData) {
    const data = processFormData(formData);
    return await apiCall("/employees", {
      method: "POST",
      body: data,
    });
  },

  async update(id, formData) {
    const data = processFormData(formData);
    return await apiCall(`/employees/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id, options = {}) {
    const query = options.force ? "?force=true" : "";
    return await apiCall(`/employees/${id}${query}`, {
      method: "DELETE",
    });
  },

  async getTotals() {
    return await apiCall("/employees/totals");
  },
};

// Violation Types API
export const violationTypesAPI = {
  async getAll() {
    return await apiCall("/violation-types");
  },

  async getById(id) {
    return await apiCall(`/violation-types/${id}`);
  },

  async add(formData) {
    const data = processFormData(formData);
    return await apiCall("/violation-types", {
      method: "POST",
      body: data,
    });
  },

  async update(id, formData) {
    const data = processFormData(formData);
    return await apiCall(`/violation-types/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id) {
    return await apiCall(`/violation-types/${id}`, {
      method: "DELETE",
    });
  },
};

// Fines API
export const finesAPI = {
  async getAll() {
    return await apiCall("/fines");
  },

  async getById(id) {
    return await apiCall(`/fines/${id}`);
  },

  async add(formData) {
    const data = processFormData(formData);
    return await apiCall("/fines", {
      method: "POST",
      body: data,
    });
  },

  async update(id, formData) {
    const data = processFormData(formData);
    return await apiCall(`/fines/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id) {
    return await apiCall(`/fines/${id}`, {
      method: "DELETE",
    });
  },

  async emailReceipt(fineId, testEmail = null) {
    return await apiCall(`/fines/${fineId}/email-receipt`, {
      method: "POST",
      body: { testEmail },
    });
  },

  async emailEmployeeReport(employeeName) {
    return await apiCall("/fines/email-employee-report", {
      method: "POST",
      body: { employeeName },
    });
  },
};

// Admin API
export const adminAPI = {
  async getSettings() {
    return await apiCall("/admin/settings");
  },

  async updateSettings(formData) {
    const data = processFormData(formData);
    return await apiCall("/admin/settings", {
      method: "PUT",
      body: data,
    });
  },

  async changePassword(data) {
    return await apiCall("/admin/change-password", {
      method: "POST",
      body: data,
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  async getStats() {
    return await apiCall("/dashboard/stats");
  },
};

export default {
  authAPI,
  employeesAPI,
  violationTypesAPI,
  finesAPI,
  adminAPI,
  dashboardAPI,
};
