/**
 * API Service
 * Direct Turso database operations (no backend server)
 */

import { runQuery, getQuery, allQuery, handleError } from './turso';

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

// Authentication API with role-based access
export const authAPI = {
  async login(credentials) {
    const { username, password } = credentials;

    // Admin credentials from environment
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || "admin";
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

    // Viewer credentials from environment
    const viewerUsername = import.meta.env.VITE_VIEWER_USERNAME || "viewer";
    const viewerPassword = import.meta.env.VITE_VIEWER_PASSWORD || "view123";

    if (username === adminUsername && password === adminPassword) {
      const user = {
        username: adminUsername,
        isAdmin: true,
        role: "admin",
        permissions: ["view_fines", "manage_fines", "manage_employees", "manage_violations", "admin_settings"]
      };
      localStorage.setItem('auth', JSON.stringify(user));
      return { success: true, user };
    } else if (username === viewerUsername && password === viewerPassword) {
      const user = {
        username: viewerUsername,
        isAdmin: false,
        role: "viewer",
        permissions: ["view_fines"]
      };
      localStorage.setItem('auth', JSON.stringify(user));
      return { success: true, user };
    } else {
      throw new Error("Invalid credentials");
    }
  },

  async logout() {
    localStorage.removeItem('auth');
    return { success: true };
  },

  async checkAuth() {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const user = JSON.parse(auth);
      return { isAuthenticated: true, user };
    }
    return { isAuthenticated: false, user: null };
  },

  hasPermission(user, permission) {
    return user && user.permissions && user.permissions.includes(permission);
  },
};

// Employees API
export const employeesAPI = {
  async getAll() {
    try {
      const employees = await allQuery("SELECT * FROM employees ORDER BY name");
      return { data: employees };
    } catch (error) {
      handleError(error);
    }
  },

  async getById(id) {
    try {
      const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [id]);
      if (!employee) throw new Error("Employee not found");
      return { data: employee };
    } catch (error) {
      handleError(error);
    }
  },

  async add(formData) {
    try {
      const data = processFormData(formData);
      const { name, department, employee_id, phone, email } = data;

      if (!name || !name.trim()) {
        throw new Error("Employee name is required");
      }

      const result = await runQuery(
        `INSERT INTO employees (name, department, employee_id, phone, email)
         VALUES (?, ?, ?, ?, ?)`,
        [name.trim(), department || "", employee_id || "", phone || "", email || ""]
      );

      const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [result.id]);
      return { data: { status: "success", employee } };
    } catch (error) {
      handleError(error);
    }
  },

  async update(id, formData) {
    try {
      const data = processFormData(formData);
      const { name, department, employee_id, phone, email } = data;

      if (!name || !name.trim()) {
        throw new Error("Employee name is required");
      }

      await runQuery(
        `UPDATE employees SET name = ?, department = ?, employee_id = ?, phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name.trim(), department || "", employee_id || "", phone || "", email || "", id]
      );

      const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [id]);
      return { data: { status: "success", employee } };
    } catch (error) {
      handleError(error);
    }
  },

  async delete(id, options = {}) {
    try {
      const { force } = options;

      // Check if employee has fines
      const fines = await allQuery("SELECT * FROM fines WHERE employee_id = ?", [id]);
      const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [id]);

      if (fines.length > 0 && !force) {
        throw new Error(`Cannot delete employee "${employee?.name || "Unknown"}" with ${fines.length} existing fine(s). To delete anyway, please confirm in the dialog that appears.`);
      }

      await runQuery("DELETE FROM employees WHERE id = ?", [id]);

      return {
        data: {
          status: "success",
          message: fines.length > 0
            ? `Employee deleted. ${fines.length} fine record(s) remain for historical purposes.`
            : "Employee deleted successfully.",
        },
      };
    } catch (error) {
      handleError(error);
    }
  },

  async getTotals() {
    try {
      const query = `
        SELECT
          e.id as employee_id,
          e.name as employee,
          COUNT(f.id) as fine_count,
          COALESCE(SUM(f.amount), 0) as total_amount,
          COALESCE(AVG(f.amount), 0) as avg_amount,
          MIN(f.fine_date) as first_fine,
          MAX(f.fine_date) as last_fine
        FROM employees e
        LEFT JOIN fines f ON e.id = f.employee_id
        GROUP BY e.id, e.name
        ORDER BY total_amount DESC, e.name
      `;

      const totals = await allQuery(query);
      return { data: totals };
    } catch (error) {
      handleError(error);
    }
  },
};

// Violation Types API
export const violationTypesAPI = {
  async getAll() {
    try {
      const violations = await allQuery("SELECT * FROM violation_types ORDER BY name");
      return { data: violations };
    } catch (error) {
      handleError(error);
    }
  },

  async getById(id) {
    try {
      const violationType = await getQuery("SELECT * FROM violation_types WHERE id = ?", [id]);
      if (!violationType) throw new Error("Violation type not found");
      return { data: violationType };
    } catch (error) {
      handleError(error);
    }
  },

  async add(formData) {
    try {
      const data = processFormData(formData);
      const { name, description, default_amount, severity, suggestions } = data;

      if (!name || !name.trim()) {
        throw new Error("Violation name is required");
      }
      if (!default_amount || parseFloat(default_amount) <= 0) {
        throw new Error("Valid default amount is required");
      }

      const suggestionsList = suggestions
        ? suggestions.split(",").filter((s) => s.trim())
        : [];

      const result = await runQuery(
        `INSERT INTO violation_types (name, description, default_amount, severity, suggestions) VALUES (?, ?, ?, ?, ?)`,
        [
          name.trim(),
          description || "",
          parseFloat(default_amount),
          severity || "Medium",
          JSON.stringify(suggestionsList),
        ]
      );

      const violationType = await getQuery("SELECT * FROM violation_types WHERE id = ?", [result.id]);
      return { data: { status: "success", violationType } };
    } catch (error) {
      handleError(error);
    }
  },

  async update(id, formData) {
    try {
      const data = processFormData(formData);
      const { name, description, default_amount, severity, suggestions } = data;

      if (!name || !name.trim()) {
        throw new Error("Violation name is required");
      }
      if (!default_amount || parseFloat(default_amount) <= 0) {
        throw new Error("Valid default amount is required");
      }

      const suggestionsList = suggestions
        ? suggestions.split(",").filter((s) => s.trim())
        : [];

      await runQuery(
        `UPDATE violation_types SET name = ?, description = ?, default_amount = ?, severity = ?, suggestions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [
          name.trim(),
          description || "",
          parseFloat(default_amount),
          severity || "Medium",
          JSON.stringify(suggestionsList),
          id,
        ]
      );

      const violationType = await getQuery("SELECT * FROM violation_types WHERE id = ?", [id]);
      return { data: { status: "success", violationType } };
    } catch (error) {
      handleError(error);
    }
  },

  async delete(id) {
    try {
      // Check if violation type is used in fines
      const fines = await allQuery("SELECT * FROM fines WHERE violation_type_id = ?", [id]);
      if (fines.length > 0) {
        throw new Error("Cannot delete violation type that is used in fines");
      }

      await runQuery("DELETE FROM violation_types WHERE id = ?", [id]);
      return { data: { status: "success" } };
    } catch (error) {
      handleError(error);
    }
  },
};

// Fines API with Date Range Filtering
export const finesAPI = {
  async getAll(filters = {}) {
    try {
      const { startDate, endDate, employeeId, violationTypeId, minAmount, maxAmount, searchTerm } = filters;

      let query = `
        SELECT
          f.*,
          e.name as employee,
          vt.name as violation_name,
          f.fine_date as date
        FROM fines f
        LEFT JOIN employees e ON f.employee_id = e.id
        LEFT JOIN violation_types vt ON f.violation_type_id = vt.id
      `;

      const params = [];
      const conditions = [];

      // Add date range filtering
      if (startDate && endDate) {
        conditions.push("DATE(f.fine_date) BETWEEN DATE(?) AND DATE(?)");
        params.push(startDate, endDate);
      } else if (startDate) {
        conditions.push("DATE(f.fine_date) >= DATE(?)");
        params.push(startDate);
      } else if (endDate) {
        conditions.push("DATE(f.fine_date) <= DATE(?)");
        params.push(endDate);
      }

      // Add employee filtering
      if (employeeId && employeeId !== "all") {
        conditions.push("f.employee_id = ?");
        params.push(employeeId);
      }

      // Add violation type filtering
      if (violationTypeId && violationTypeId !== "all") {
        conditions.push("f.violation_type_id = ?");
        params.push(violationTypeId);
      }

      // Add amount range filtering
      if (minAmount && parseFloat(minAmount) > 0) {
        conditions.push("f.amount >= ?");
        params.push(parseFloat(minAmount));
      }

      if (maxAmount && parseFloat(maxAmount) > 0) {
        conditions.push("f.amount <= ?");
        params.push(parseFloat(maxAmount));
      }

      // Add search functionality
      if (searchTerm && searchTerm.trim()) {
        conditions.push("(e.name LIKE ? OR vt.name LIKE ? OR f.reason LIKE ? OR f.notes LIKE ?)");
        const searchPattern = `%${searchTerm.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY f.fine_date DESC";

      const fines = await allQuery(query, params);
      return { data: fines };
    } catch (error) {
      handleError(error);
    }
  },

  async getById(id) {
    try {
      const fine = await getQuery("SELECT * FROM fines WHERE id = ?", [id]);
      if (!fine) throw new Error("Fine not found");
      return { data: fine };
    } catch (error) {
      handleError(error);
    }
  },

  async add(formData) {
    try {
      const data = processFormData(formData);
      const { employee_id, violation_type_id, amount, reason, notes, fine_date } = data;

      if (!employee_id || parseInt(employee_id) <= 0) {
        throw new Error("Employee is required");
      }
      if (!violation_type_id || parseInt(violation_type_id) <= 0) {
        throw new Error("Violation type is required");
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Valid amount is required");
      }
      if (!reason || !reason.trim()) {
        throw new Error("Reason is required");
      }

      // Verify employee and violation type exist
      const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [employee_id]);
      if (!employee) throw new Error("Selected employee not found");

      const violationType = await getQuery("SELECT * FROM violation_types WHERE id = ?", [violation_type_id]);
      if (!violationType) throw new Error("Selected violation type not found");

      const fineDate = fine_date || new Date().toISOString();

      const result = await runQuery(
        `INSERT INTO fines (employee_id, violation_type_id, amount, reason, notes, fine_date) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          parseInt(employee_id),
          parseInt(violation_type_id),
          parseFloat(amount),
          reason.trim(),
          notes || "",
          fineDate,
        ]
      );

      return { data: { status: "success", fine_id: result.id } };
    } catch (error) {
      handleError(error);
    }
  },

  async update(id, formData) {
    try {
      const data = processFormData(formData);
      const { employee_id, violation_type_id, amount, reason, notes, fine_date } = data;

      if (!employee_id || parseInt(employee_id) <= 0) {
        throw new Error("Employee is required");
      }
      if (!violation_type_id || parseInt(violation_type_id) <= 0) {
        throw new Error("Violation type is required");
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Valid amount is required");
      }
      if (!reason || !reason.trim()) {
        throw new Error("Reason is required");
      }

      const updateQuery = fine_date 
        ? `UPDATE fines SET employee_id = ?, violation_type_id = ?, amount = ?, reason = ?, notes = ?, fine_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        : `UPDATE fines SET employee_id = ?, violation_type_id = ?, amount = ?, reason = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      const params = fine_date 
        ? [parseInt(employee_id), parseInt(violation_type_id), parseFloat(amount), reason.trim(), notes || "", fine_date, id]
        : [parseInt(employee_id), parseInt(violation_type_id), parseFloat(amount), reason.trim(), notes || "", id];

      await runQuery(updateQuery, params);

      const fine = await getQuery("SELECT * FROM fines WHERE id = ?", [id]);
      return { data: { status: "success", fine } };
    } catch (error) {
      handleError(error);
    }
  },

  async delete(id) {
    try {
      await runQuery("DELETE FROM fines WHERE id = ?", [id]);
      return { data: { status: "success" } };
    } catch (error) {
      handleError(error);
    }
  },


};

// Admin API
export const adminAPI = {
  async getSettings() {
    try {
      const settings = await getQuery("SELECT * FROM admin_settings WHERE id = 1");
      return { data: settings || {} };
    } catch (error) {
      handleError(error);
    }
  },

  async updateSettings(formData) {
    try {
      const data = processFormData(formData);
      const {
        admin_name,
        admin_email,
        admin_phone,
        company_name,
        smtp_server,
        smtp_port,
        smtp_username,
        smtp_password,
        email_signature,
      } = data;

      await runQuery(
        `UPDATE admin_settings SET admin_name = ?, admin_email = ?, admin_phone = ?, company_name = ?, smtp_server = ?, smtp_port = ?, smtp_username = ?, smtp_password = ?, email_signature = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
        [
          admin_name || "",
          admin_email || "",
          admin_phone || "",
          company_name || "",
          smtp_server || "",
          smtp_port || 587,
          smtp_username || "",
          smtp_password || "",
          email_signature || "",
        ]
      );

      const settings = await getQuery("SELECT * FROM admin_settings WHERE id = 1");
      return { data: { status: "success", settings } };
    } catch (error) {
      handleError(error);
    }
  },

  async changePassword(data) {
    // Password change simulation for demo
    return {
      data: {
        status: "success",
        message: "Password change simulation completed",
        note: "Simulation only - no real password change",
      },
    };
  },
};

// Dashboard API
export const dashboardAPI = {
  async getStats() {
    try {
      const employeeCount = await getQuery("SELECT COUNT(*) as count FROM employees");
      const violationCount = await getQuery("SELECT COUNT(*) as count FROM violation_types");
      const fineCount = await getQuery("SELECT COUNT(*) as count FROM fines");
      const totalAmount = await getQuery("SELECT COALESCE(SUM(amount), 0) as total FROM fines");

      // Monthly stats for the current year
      const monthlyStats = await allQuery(`
        SELECT 
          strftime('%Y-%m', fine_date) as month,
          COUNT(*) as count,
          SUM(amount) as total
        FROM fines 
        WHERE strftime('%Y', fine_date) = strftime('%Y', 'now')
        GROUP BY strftime('%Y-%m', fine_date)
        ORDER BY month
      `);

      return {
        data: {
          employees: employeeCount.count,
          violations: violationCount.count,
          fines: fineCount.count,
          total_fine_amount: totalAmount.total,
          monthly_stats: monthlyStats,
        },
      };
    } catch (error) {
      handleError(error);
    }
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
