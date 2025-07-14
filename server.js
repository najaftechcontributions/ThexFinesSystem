import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import bcrypt from "bcryptjs";
import session from "express-session";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
const DB_PATH = path.join(__dirname, "fine_tracker.db");
const db = new Database(DB_PATH);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "fine-tracker-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  }),
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Initialize database tables
function initializeDatabase() {
  console.log("🗄️ Initializing SQLite database...");

  // Create employees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT,
      employee_id TEXT,
      phone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create violation_types table
  db.exec(`
    CREATE TABLE IF NOT EXISTS violation_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      default_amount DECIMAL(10,2),
      severity TEXT DEFAULT 'Medium',
      suggestions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create fines table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      violation_type_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      reason TEXT NOT NULL,
      notes TEXT,
      fine_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees (id),
      FOREIGN KEY (violation_type_id) REFERENCES violation_types (id)
    )
  `);

  // Create admin_settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY,
      admin_name TEXT,
      admin_email TEXT,
      admin_phone TEXT,
      company_name TEXT,
      smtp_server TEXT,
      smtp_port INTEGER,
      smtp_username TEXT,
      smtp_password TEXT,
      email_signature TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default admin settings if not exists
  const existingSettings = getQuery(
    "SELECT id FROM admin_settings WHERE id = 1",
  );
  if (!existingSettings) {
    runQuery(
      `
      INSERT INTO admin_settings (
        id, admin_name, admin_email, admin_phone, company_name,
        smtp_server, smtp_port, smtp_username, email_signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        1,
        "System Administrator",
        "admin@company.com",
        "+92-300-0000000",
        "Your Company",
        "",
        587,
        "",
        "Best regards,<br>Fine Management System",
      ],
    );
  }

  console.log("✅ SQLite database initialized successfully!");
  console.log(`📁 Database file: ${DB_PATH}`);
}

// Helper function to run queries with better-sqlite3
function runQuery(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(params);
    return { id: result.lastInsertRowid, changes: result.changes };
  } catch (err) {
    throw err;
  }
}

function getQuery(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(params);
  } catch (err) {
    throw err;
  }
}

function allQuery(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params);
  } catch (err) {
    throw err;
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: "Connected",
    message: "Fine Tracker Backend is running!",
  });
});

// Auth Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body?.username);
    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {
      req.session.user = { username: "admin", isAdmin: true };
      console.log("✅ Login successful for:", username);
      res.json({ success: true, user: { username: "admin", isAdmin: true } });
    } else {
      console.log("❌ Login failed for:", username);
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
    } else {
      res.json({ success: true });
    }
  });
});

app.get("/api/auth/check", (req, res) => {
  res.json({
    isAuthenticated: !!req.session.user,
    user: req.session.user || null,
  });
});

// Employees Routes
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await allQuery("SELECT * FROM employees ORDER BY name");
    res.json({ data: employees });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/employees/:id", async (req, res) => {
  try {
    const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [
      req.params.id,
    ]);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json({ data: employee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const { name, department, employee_id, phone, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Employee name is required" });
    }

    const result = await runQuery(
      `
      INSERT INTO employees (name, department, employee_id, phone, email)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        name.trim(),
        department || "",
        employee_id || "",
        phone || "",
        email || "",
      ],
    );

    const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [
      result.id,
    ]);
    res.json({ data: { status: "success", employee } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    const { name, department, employee_id, phone, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Employee name is required" });
    }

    await runQuery(
      `
      UPDATE employees
      SET name = ?, department = ?, employee_id = ?, phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        name.trim(),
        department || "",
        employee_id || "",
        phone || "",
        email || "",
        req.params.id,
      ],
    );

    const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ data: { status: "success", employee } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { force } = req.query;

    // Check if employee has fines
    const fines = await allQuery("SELECT * FROM fines WHERE employee_id = ?", [
      req.params.id,
    ]);
    const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [
      req.params.id,
    ]);

    if (fines.length > 0 && !force) {
      return res.status(400).json({
        error: `Cannot delete employee "${employee?.name || "Unknown"}" with ${fines.length} existing fine(s). To delete anyway, please confirm in the dialog that appears.`,
      });
    }

    await runQuery("DELETE FROM employees WHERE id = ?", [req.params.id]);

    res.json({
      data: {
        status: "success",
        message:
          fines.length > 0
            ? `Employee deleted. ${fines.length} fine record(s) remain for historical purposes.`
            : "Employee deleted successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/employees/totals", async (req, res) => {
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
    res.json({ data: totals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Violation Types Routes
app.get("/api/violation-types", async (req, res) => {
  try {
    const violations = await allQuery(
      "SELECT * FROM violation_types ORDER BY name",
    );
    res.json({ data: violations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/violation-types", async (req, res) => {
  try {
    const { name, description, default_amount, severity, suggestions } =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Violation name is required" });
    }
    if (!default_amount || parseFloat(default_amount) <= 0) {
      return res
        .status(400)
        .json({ error: "Valid default amount is required" });
    }

    const suggestionsList = suggestions
      ? suggestions.split(",").filter((s) => s.trim())
      : [];

    const result = await runQuery(
      `
      INSERT INTO violation_types (name, description, default_amount, severity, suggestions)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        name.trim(),
        description || "",
        parseFloat(default_amount),
        severity || "Medium",
        JSON.stringify(suggestionsList),
      ],
    );

    const violationType = await getQuery(
      "SELECT * FROM violation_types WHERE id = ?",
      [result.id],
    );
    res.json({ data: { status: "success", violationType } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/violation-types/:id", async (req, res) => {
  try {
    const { name, description, default_amount, severity, suggestions } =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Violation name is required" });
    }
    if (!default_amount || parseFloat(default_amount) <= 0) {
      return res
        .status(400)
        .json({ error: "Valid default amount is required" });
    }

    const suggestionsList = suggestions
      ? suggestions.split(",").filter((s) => s.trim())
      : [];

    await runQuery(
      `
      UPDATE violation_types
      SET name = ?, description = ?, default_amount = ?, severity = ?, suggestions = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        name.trim(),
        description || "",
        parseFloat(default_amount),
        severity || "Medium",
        JSON.stringify(suggestionsList),
        req.params.id,
      ],
    );

    const violationType = await getQuery(
      "SELECT * FROM violation_types WHERE id = ?",
      [req.params.id],
    );
    res.json({ data: { status: "success", violationType } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/violation-types/:id", async (req, res) => {
  try {
    // Check if violation type is used in fines
    const fines = await allQuery(
      "SELECT * FROM fines WHERE violation_type_id = ?",
      [req.params.id],
    );
    if (fines.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete violation type that is used in fines" });
    }

    await runQuery("DELETE FROM violation_types WHERE id = ?", [req.params.id]);
    res.json({ data: { status: "success" } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fines Routes
app.get("/api/fines", async (req, res) => {
  try {
    const query = `
      SELECT
        f.*,
        e.name as employee,
        vt.name as violation_name,
        f.fine_date as date
      FROM fines f
      LEFT JOIN employees e ON f.employee_id = e.id
      LEFT JOIN violation_types vt ON f.violation_type_id = vt.id
      ORDER BY f.fine_date DESC
    `;

    const fines = await allQuery(query);
    res.json({ data: fines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/fines", async (req, res) => {
  try {
    const { employee_id, violation_type_id, amount, reason, notes } = req.body;

    if (!employee_id || parseInt(employee_id) <= 0) {
      return res.status(400).json({ error: "Employee is required" });
    }
    if (!violation_type_id || parseInt(violation_type_id) <= 0) {
      return res.status(400).json({ error: "Violation type is required" });
    }
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "Reason is required" });
    }

    // Verify employee and violation type exist
    const employee = await getQuery("SELECT * FROM employees WHERE id = ?", [
      employee_id,
    ]);
    if (!employee)
      return res.status(400).json({ error: "Selected employee not found" });

    const violationType = await getQuery(
      "SELECT * FROM violation_types WHERE id = ?",
      [violation_type_id],
    );
    if (!violationType)
      return res
        .status(400)
        .json({ error: "Selected violation type not found" });

    const result = await runQuery(
      `
      INSERT INTO fines (employee_id, violation_type_id, amount, reason, notes)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        parseInt(employee_id),
        parseInt(violation_type_id),
        parseFloat(amount),
        reason.trim(),
        notes || "",
      ],
    );

    res.json({ data: { status: "success", fine_id: result.id } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/fines/:id", async (req, res) => {
  try {
    const { employee_id, violation_type_id, amount, reason, notes } = req.body;

    if (!employee_id || parseInt(employee_id) <= 0) {
      return res.status(400).json({ error: "Employee is required" });
    }
    if (!violation_type_id || parseInt(violation_type_id) <= 0) {
      return res.status(400).json({ error: "Violation type is required" });
    }
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "Reason is required" });
    }

    await runQuery(
      `
      UPDATE fines
      SET employee_id = ?, violation_type_id = ?, amount = ?, reason = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        parseInt(employee_id),
        parseInt(violation_type_id),
        parseFloat(amount),
        reason.trim(),
        notes || "",
        req.params.id,
      ],
    );

    const fine = await getQuery("SELECT * FROM fines WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ data: { status: "success", fine } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/fines/:id", async (req, res) => {
  try {
    await runQuery("DELETE FROM fines WHERE id = ?", [req.params.id]);
    res.json({ data: { status: "success" } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
app.get("/api/admin/settings", async (req, res) => {
  try {
    const settings = await getQuery(
      "SELECT * FROM admin_settings WHERE id = 1",
    );
    res.json({ data: settings || {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/settings", async (req, res) => {
  try {
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
    } = req.body;

    await runQuery(
      `
      UPDATE admin_settings
      SET admin_name = ?, admin_email = ?, admin_phone = ?, company_name = ?,
          smtp_server = ?, smtp_port = ?, smtp_username = ?, smtp_password = ?,
          email_signature = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `,
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
      ],
    );

    const settings = await getQuery(
      "SELECT * FROM admin_settings WHERE id = 1",
    );
    res.json({ data: { status: "success", settings } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const employeeCount = await getQuery(
      "SELECT COUNT(*) as count FROM employees",
    );
    const violationCount = await getQuery(
      "SELECT COUNT(*) as count FROM violation_types",
    );
    const fineCount = await getQuery("SELECT COUNT(*) as count FROM fines");
    const totalAmount = await getQuery(
      "SELECT COALESCE(SUM(amount), 0) as total FROM fines",
    );

    res.json({
      data: {
        employees: employeeCount.count,
        violations: violationCount.count,
        fines: fineCount.count,
        total_fine_amount: totalAmount.total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email simulation endpoints
app.post("/api/fines/:id/email-receipt", async (req, res) => {
  try {
    // This is a simulation - in real app you'd send actual emails
    res.json({
      data: {
        status: "success",
        message:
          "Email simulation completed. Check the preview window for email content.",
        note: "Simulation only - no real email sent",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
try {
  initializeDatabase();
  console.log("✅ Database initialization completed");

  // Test database connection
  const testQuery = getQuery(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'",
  );
  console.log(`📊 Database tables found: ${testQuery.count}`);
} catch (error) {
  console.error("❌ Database initialization failed:", error);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(`🚀 Fine Tracker Backend Server STARTED`);
  console.log(`📁 SQLite database: ${DB_PATH}`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💡 Frontend should proxy to: http://localhost:${PORT}`);
  console.log("=".repeat(60));
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  try {
    db.close();
    console.log("✅ Database connection closed.");
  } catch (err) {
    console.error("❌ Error closing database:", err.message);
  }
  process.exit(0);
});
