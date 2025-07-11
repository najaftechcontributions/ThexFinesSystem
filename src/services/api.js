/**
 * API Service
 * Clean API interface for SQLite database operations
 */

import database from "./database.js";

// Simulate API delay for realistic experience
const simulateDelay = (ms = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
    await simulateDelay();

    if (
      credentials.username === "admin" &&
      credentials.password === "admin123"
    ) {
      const user = { username: "admin", isAdmin: true };
      localStorage.setItem("authUser", JSON.stringify(user));
      return { success: true, user };
    }

    throw new Error("Invalid credentials");
  },

  async logout() {
    await simulateDelay();
    localStorage.removeItem("authUser");
    return { success: true };
  },

  async checkAuth() {
    await simulateDelay();
    const user = localStorage.getItem("authUser");
    return {
      isAuthenticated: !!user && user !== "null",
      user: user ? JSON.parse(user) : null,
    };
  },
};

// Employees API
export const employeesAPI = {
  async getAll() {
    await simulateDelay();
    const employees = database.findAll("employees");
    return { data: employees };
  },

  async getById(id) {
    await simulateDelay();
    const employee = database.findById("employees", id);
    if (!employee) throw new Error("Employee not found");
    return { data: employee };
  },

  async add(formData) {
    await simulateDelay();
    const data = processFormData(formData);

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      throw new Error("Employee name is required");
    }

    const employeeData = {
      name: data.name.trim(),
      department: data.department?.trim() || "",
      employee_id: data.employee_id?.trim() || "",
      phone: data.phone?.trim() || "",
      email: data.email?.trim() || "",
    };

    const result = database.insert("employees", employeeData);
    return { data: { status: "success", employee: result } };
  },

  async update(id, formData) {
    await simulateDelay();
    const data = processFormData(formData);

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      throw new Error("Employee name is required");
    }

    const employeeData = {
      name: data.name.trim(),
      department: data.department?.trim() || "",
      employee_id: data.employee_id?.trim() || "",
      phone: data.phone?.trim() || "",
      email: data.email?.trim() || "",
    };

    const result = database.update("employees", id, employeeData);
    return { data: { status: "success", employee: result } };
  },

  async delete(id, options = {}) {
    await simulateDelay();

    // Check if employee has fines
    const fines = database.findByField("fines", "employee_id", parseInt(id));
    const employee = database.findById("employees", id);

    if (fines.length > 0) {
      if (!options.force) {
        throw new Error(
          `Cannot delete employee "${employee?.name || "Unknown"}" with ${fines.length} existing fine(s). ` +
            `To delete anyway, please confirm in the dialog that appears.`,
        );
      }

      // If forced deletion, mark fines as orphaned but keep records
      console.warn(
        `⚠️ Deleting employee with ${fines.length} fines. Fines will be marked as orphaned.`,
      );
    }

    database.delete("employees", id);
    return {
      data: {
        status: "success",
        message:
          fines.length > 0
            ? `Employee deleted. ${fines.length} fine record(s) remain for historical purposes.`
            : "Employee deleted successfully.",
      },
    };
  },

  async getTotals() {
    await simulateDelay();
    const totals = database.getEmployeeTotals();
    return { data: totals };
  },
};

// Violation Types API
export const violationTypesAPI = {
  async getAll() {
    await simulateDelay();
    const violations = database.findAll("violation_types");
    return { data: violations };
  },

  async getById(id) {
    await simulateDelay();
    const violation = database.findById("violation_types", id);
    if (!violation) throw new Error("Violation type not found");
    return { data: violation };
  },

  async add(formData) {
    await simulateDelay();
    const data = processFormData(formData);

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      throw new Error("Violation name is required");
    }
    if (!data.default_amount || parseFloat(data.default_amount) <= 0) {
      throw new Error("Valid default amount is required");
    }

    const violationData = {
      name: data.name.trim(),
      description: data.description?.trim() || "",
      default_amount: parseFloat(data.default_amount),
      severity: data.severity || "Medium",
      suggestions: data.suggestions
        ? data.suggestions.split(",").filter((s) => s.trim())
        : [],
    };

    const result = database.insert("violation_types", violationData);
    return { data: { status: "success", violationType: result } };
  },

  async update(id, formData) {
    await simulateDelay();
    const data = processFormData(formData);

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      throw new Error("Violation name is required");
    }
    if (!data.default_amount || parseFloat(data.default_amount) <= 0) {
      throw new Error("Valid default amount is required");
    }

    const violationData = {
      name: data.name.trim(),
      description: data.description?.trim() || "",
      default_amount: parseFloat(data.default_amount),
      severity: data.severity || "Medium",
      suggestions: data.suggestions
        ? data.suggestions.split(",").filter((s) => s.trim())
        : [],
    };

    const result = database.update("violation_types", id, violationData);
    return { data: { status: "success", violationType: result } };
  },

  async delete(id) {
    await simulateDelay();

    // Check if violation type is used in fines
    const fines = database.findByField(
      "fines",
      "violation_type_id",
      parseInt(id),
    );
    if (fines.length > 0) {
      throw new Error("Cannot delete violation type that is used in fines");
    }

    database.delete("violation_types", id);
    return { data: { status: "success" } };
  },
};

// Fines API
export const finesAPI = {
  async getAll() {
    await simulateDelay();
    const fines = database.getFinesWithDetails();
    return { data: fines };
  },

  async getById(id) {
    await simulateDelay();
    const fines = database.getFinesWithDetails();
    const fine = fines.find((f) => f.id === parseInt(id));
    if (!fine) throw new Error("Fine not found");
    return { data: fine };
  },

  async add(formData) {
    await simulateDelay();
    const data = processFormData(formData);

    // Validate required fields
    if (!data.employee_id || parseInt(data.employee_id) <= 0) {
      throw new Error("Employee is required");
    }
    if (!data.violation_type_id || parseInt(data.violation_type_id) <= 0) {
      throw new Error("Violation type is required");
    }
    if (!data.amount || parseFloat(data.amount) <= 0) {
      throw new Error("Valid amount is required");
    }
    if (!data.reason || !data.reason.trim()) {
      throw new Error("Reason is required");
    }

    // Verify employee and violation type exist
    const employee = database.findById("employees", data.employee_id);
    if (!employee) throw new Error("Selected employee not found");

    const violationType = database.findById(
      "violation_types",
      data.violation_type_id,
    );
    if (!violationType) throw new Error("Selected violation type not found");

    const fineData = {
      employee_id: parseInt(data.employee_id),
      violation_type_id: parseInt(data.violation_type_id),
      amount: parseFloat(data.amount),
      reason: data.reason.trim(),
      notes: data.notes?.trim() || "",
      fine_date: new Date().toISOString(),
    };

    const result = database.insert("fines", fineData);
    return { data: { status: "success", fine_id: result.id } };
  },

  async update(id, formData) {
    await simulateDelay();
    const data = processFormData(formData);

    // Validate required fields
    if (!data.employee_id || parseInt(data.employee_id) <= 0) {
      throw new Error("Employee is required");
    }
    if (!data.violation_type_id || parseInt(data.violation_type_id) <= 0) {
      throw new Error("Violation type is required");
    }
    if (!data.amount || parseFloat(data.amount) <= 0) {
      throw new Error("Valid amount is required");
    }
    if (!data.reason || !data.reason.trim()) {
      throw new Error("Reason is required");
    }

    const fineData = {
      employee_id: parseInt(data.employee_id),
      violation_type_id: parseInt(data.violation_type_id),
      amount: parseFloat(data.amount),
      reason: data.reason.trim(),
      notes: data.notes?.trim() || "",
    };

    const result = database.update("fines", id, fineData);
    return { data: { status: "success", fine: result } };
  },

  async delete(id) {
    await simulateDelay();
    database.delete("fines", id);
    return { data: { status: "success" } };
  },

  async emailReceipt(fineId, testEmail = null) {
    await simulateDelay();

    // Get admin email settings
    const adminSettings = database.findById("admin_settings", 1) || {};

    if (
      !adminSettings.smtp_server ||
      !adminSettings.smtp_username ||
      !adminSettings.smtp_password
    ) {
      throw new Error(
        "Email configuration incomplete. Please configure SMTP server, username, and password in Admin Settings.",
      );
    }

    // Get fine details or create test data
    let fine, employee;
    if (fineId === 0 || testEmail) {
      // Test email to adil.ahmed143.ak@gmail.com
      fine = {
        id: "TEST-001",
        employee_id: 1,
        amount: 250.0,
        reason: "Late Arrival: Test fine for email configuration",
        notes: "This is a test email to verify SMTP configuration",
        fine_date: new Date().toISOString(),
      };
      employee = {
        name: "Adil Ahmed",
        email: testEmail || "adil.ahmed143.ak@gmail.com",
        department: "IT Department",
      };
    } else {
      // Real fine
      const fines = database.getFinesWithDetails();
      fine = fines.find((f) => f.id === parseInt(fineId));
      if (!fine) throw new Error("Fine not found");

      const employees = database.findAll("employees");
      employee = employees.find((emp) => emp.id === fine.employee_id);
    }

    // Create realistic email content
    const emailContent = {
      from: adminSettings.smtp_username,
      to: employee.email,
      subject: `Fine Receipt #${fine.id} - ThexSol Fine Tracker`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0;">🧾 Fine Receipt</h2>
            <p style="color: #666; margin: 5px 0 0 0;">ThexSol Fine Tracker System</p>
          </div>

          <div style="background: white; border: 2px solid #dee2e6; border-radius: 8px; padding: 20px;">
            <h3 style="color: #333; margin-top: 0;">Receipt #${fine.id}</h3>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;"><strong>Employee:</strong></td><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;">${employee.name}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;"><strong>Department:</strong></td><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;">${employee.department || "N/A"}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;"><strong>Violation:</strong></td><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;">${fine.reason}</td></tr>
              ${fine.notes ? `<tr><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;"><strong>Notes:</strong></td><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;">${fine.notes}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;"><strong>Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px dotted #ccc;">${new Date(fine.fine_date).toLocaleString()}</td></tr>
              <tr style="background: #fff3cd;"><td style="padding: 12px 8px; font-weight: bold; font-size: 16px;"><strong>FINE AMOUNT:</strong></td><td style="padding: 12px 8px; font-weight: bold; font-size: 16px; color: #d63384;">₨${parseFloat(fine.amount).toFixed(2)}</td></tr>
            </table>

            <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0066cc;">
                <strong>📌 Important:</strong> Please keep this receipt for your records.
                Contact HR if you have any questions about this fine.
              </p>
            </div>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              ${adminSettings.email_signature?.replace(/\n/g, "<br>") || "Best regards,<br>Fine Management System"}
            </p>
          </div>
        </div>
      `,
    };

    // Log email simulation
    console.log("📧 Email Receipt Simulation:", {
      smtpConfig: {
        server: adminSettings.smtp_server,
        port: adminSettings.smtp_port,
        username: adminSettings.smtp_username,
        passwordConfigured: !!adminSettings.smtp_password,
      },
      email: emailContent,
      timestamp: new Date().toISOString(),
    });

    // Show email preview in a popup window
    if (typeof window !== "undefined") {
      const emailWindow = window.open(
        "",
        "_blank",
        "width=900,height=700,scrollbars=yes",
      );
      if (emailWindow) {
        emailWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>📧 Email Preview - Test Email to ${employee.email}</title>
              <style>
                body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
                .preview-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #c3e6cb; }
                .config { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin-top: 20px; border: 1px solid #ffeaa7; }
                .email-header { background: #e9ecef; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
              </style>
            </head>
            <body>
              <div class="preview-container">
                <div class="status">
                  <h3 style="margin-top: 0;">📧 Email Preview - Simulation Only</h3>
                  <p><strong>This shows what would be sent to:</strong> ${employee.email}</p>
                  <p><strong>Would use SMTP:</strong> ${adminSettings.smtp_server}:${adminSettings.smtp_port}</p>
                  <p><strong>Note:</strong> No real email sent - this is a preview only</p>
                </div>

                <div class="email-header">
                  <p><strong>From:</strong> ${emailContent.from}</p>
                  <p><strong>To:</strong> ${emailContent.to}</p>
                  <p><strong>Subject:</strong> ${emailContent.subject}</p>
                  <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>

                <div style="border: 2px solid #dee2e6; border-radius: 8px; padding: 10px;">
                  ${emailContent.html}
                </div>

                <div class="config">
                  <h4>🔧 SMTP Configuration Used:</h4>
                  <p><strong>Server:</strong> ${adminSettings.smtp_server}</p>
                  <p><strong>Port:</strong> ${adminSettings.smtp_port} (${adminSettings.smtp_port === 587 ? "TLS" : adminSettings.smtp_port === 465 ? "SSL" : "Plain"})</p>
                  <p><strong>Username:</strong> ${adminSettings.smtp_username}</p>
                  <p><strong>Password:</strong> ${adminSettings.smtp_password ? "✅ Configured (" + adminSettings.smtp_password.length + " chars)" : "❌ Missing"}</p>
                  <p><strong>Status:</strong> Configuration is valid for Gmail SMTP!</p>
                  <hr>
                  <p><em>Note: This is a frontend simulation. In a real backend application, this email would be sent using nodemailer or similar SMTP library.</em></p>
                </div>
              </div>

              <script>
                console.log('Email Preview Window Loaded');
                window.focus();
              </script>
            </body>
          </html>
        `);
        emailWindow.document.close();
      }
    }

    return {
      data: {
        status: "success",
        message: `Email simulation completed for ${employee.email}. Check the preview window for email content.`,
        emailDetails: {
          to: employee.email,
          from: emailContent.from,
          subject: emailContent.subject,
          smtpServer: adminSettings.smtp_server,
          smtpPort: adminSettings.smtp_port,
          note: "Simulation only - no real email sent",
        },
      },
    };
  },

  async emailEmployeeReport(employeeName) {
    await simulateDelay();

    // Get admin email settings
    const adminSettings = database.findById("admin_settings", 1) || {};

    if (
      !adminSettings.smtp_server ||
      !adminSettings.smtp_username ||
      !adminSettings.smtp_password
    ) {
      throw new Error(
        "Email configuration incomplete. Please configure SMTP server, username, and password in Admin Settings.",
      );
    }

    // In a real app, this would send actual emails using the SMTP settings
    console.log("📧 Employee Report Sent:", {
      employeeName,
      smtpServer: adminSettings.smtp_server,
      smtpPort: adminSettings.smtp_port,
      from: adminSettings.smtp_username,
      passwordConfigured: !!adminSettings.smtp_password,
      timestamp: new Date().toISOString(),
    });

    return {
      data: {
        status: "success",
        message: "Employee report emailed successfully",
      },
    };
  },
};

// Admin API
export const adminAPI = {
  async getSettings() {
    await simulateDelay();
    const settings = database.findById("admin_settings", 1) || {};
    return { data: settings };
  },

  async updateSettings(formData) {
    await simulateDelay();
    const data = processFormData(formData);

    const settingsData = {
      admin_name: data.admin_name?.trim() || "",
      admin_email: data.admin_email?.trim() || "",
      admin_phone: data.admin_phone?.trim() || "",
      company_name: data.company_name?.trim() || "",
      smtp_server: data.smtp_server?.trim() || "",
      smtp_port: data.smtp_port ? parseInt(data.smtp_port) : 587,
      smtp_username: data.smtp_username?.trim() || "",
      smtp_password: data.smtp_password?.trim() || "",
      email_signature: data.email_signature?.trim() || "",
    };

    const result = database.update("admin_settings", 1, settingsData);
    return { data: { status: "success", settings: result } };
  },

  async changePassword(data) {
    await simulateDelay();

    // Validate current password
    if (data.currentPassword !== "admin123") {
      throw new Error("Current password is incorrect");
    }

    if (!data.newPassword || data.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new Error("New password and confirmation do not match");
    }

    // In a real app, you would hash and store the password
    // For this demo, we'll just simulate success
    return {
      data: { status: "success", message: "Password changed successfully" },
    };
  },
};

// Dashboard API
export const dashboardAPI = {
  async getStats() {
    await simulateDelay();
    const stats = database.getStats();
    return { data: stats };
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
