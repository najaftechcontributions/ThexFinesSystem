import { createClient } from "@libsql/client";

// Create Turso client with environment variables
const client = createClient({
  url: import.meta.env.VITE_TURSO_DATABASE_URL || "file:./fine_tracker_demo.db",
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN || "",
});

// Database schema version for migrations
const CURRENT_SCHEMA_VERSION = 1;

// Initialize database tables with proper version control
export async function initializeDatabase() {
  try {
    console.log("🗄️ Checking database status...");

    // First, create schema_info table to track database version
    await client.execute(`
      CREATE TABLE IF NOT EXISTS schema_info (
        version INTEGER PRIMARY KEY,
        initialized_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check current schema version
    const versionResult = await client.execute(
      "SELECT version FROM schema_info ORDER BY version DESC LIMIT 1"
    );

    const currentVersion = versionResult.rows.length > 0 ? versionResult.rows[0].version : 0;
    const needsInitialization = currentVersion === 0;
    const needsUpdate = currentVersion < CURRENT_SCHEMA_VERSION;

    if (!needsInitialization && !needsUpdate) {
      console.log("✅ Database is up to date, skipping initialization");
      return true;
    }

    if (needsInitialization) {
      console.log("🗄️ Initializing database for first time...");
      await createTables();
      await insertDefaultSettings();
      await seedDummyData();

      // Record schema version
      await client.execute({
        sql: "INSERT INTO schema_info (version) VALUES (?)",
        args: [CURRENT_SCHEMA_VERSION]
      });

      console.log("✅ Database initialized successfully!");
    } else if (needsUpdate) {
      console.log(`🔄 Updating database schema from version ${currentVersion} to ${CURRENT_SCHEMA_VERSION}...`);
      await runMigrations(currentVersion);

      // Update schema version
      await client.execute({
        sql: "INSERT INTO schema_info (version) VALUES (?)",
        args: [CURRENT_SCHEMA_VERSION]
      });

      console.log("✅ Database schema updated successfully!");
    }

    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

// Create all necessary tables
async function createTables() {
  // Create employees table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT,
      employee_id TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create violation_types table
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      admin_name TEXT,
      admin_phone TEXT,
      company_name TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Insert default admin settings
async function insertDefaultSettings() {
  const existingSettings = await client.execute(
    "SELECT id FROM admin_settings WHERE id = 1"
  );

  if (existingSettings.rows.length === 0) {
    await client.execute({
      sql: `
        INSERT INTO admin_settings (
          id, admin_name, admin_phone, company_name
        ) VALUES (?, ?, ?, ?)
      `,
      args: [
        1,
        "System Administrator",
        "+92-300-0000000",
        "Your Company",
      ],
    });
  }
}

// Handle database migrations for future schema changes
async function runMigrations(fromVersion) {
  console.log(`Running migrations from version ${fromVersion}...`);

  // Add future migrations here when needed
  // Example:
  // if (fromVersion < 2) {
  //   await client.execute("ALTER TABLE employees ADD COLUMN new_field TEXT");
  // }

  console.log("Migrations completed.");
}

// Seed dummy data for testing - only runs on first initialization
async function seedDummyData() {
  try {
    console.log("🌱 Seeding initial demo data...");

    // Double-check if any data already exists (safety measure)
    const employeeCount = await client.execute("SELECT COUNT(*) as count FROM employees");
    const violationCount = await client.execute("SELECT COUNT(*) as count FROM violation_types");
    const fineCount = await client.execute("SELECT COUNT(*) as count FROM fines");

    if (employeeCount.rows[0].count > 0 || violationCount.rows[0].count > 0 || fineCount.rows[0].count > 0) {
      console.log("📊 Data already exists, skipping seed to prevent duplicates");
      return;
    }

    // Insert dummy employees
    const employees = [
      ["John Smith", "IT", "EMP001", "+1-555-0101", "john.smith@company.com"],
      ["Sarah Johnson", "HR", "EMP002", "+1-555-0102", "sarah.johnson@company.com"],
      ["Mike Davis", "Finance", "EMP003", "+1-555-0103", "mike.davis@company.com"],
      ["Emma Wilson", "Marketing", "EMP004", "+1-555-0104", "emma.wilson@company.com"],
      ["Robert Brown", "Operations", "EMP005", "+1-555-0105", "robert.brown@company.com"],
    ];

    for (const employee of employees) {
      await client.execute({
        sql: "INSERT INTO employees (name, department, employee_id, phone, email) VALUES (?, ?, ?, ?, ?)",
        args: employee,
      });
    }

    // Insert dummy violation types
    const violations = [
      ["Late Arrival", "Employee arrived late to work", 25.00, "Low", '["Set multiple alarms","Leave home earlier","Check traffic conditions"]'],
      ["Dress Code Violation", "Not following company dress code", 15.00, "Low", '["Review dress code policy","Prepare clothes night before","Ask supervisor for clarification"]'],
      ["Unauthorized Break", "Taking break without permission", 30.00, "Medium", '["Request permission from supervisor","Follow break schedule","Use official break times"]'],
      ["Safety Violation", "Not following safety protocols", 100.00, "High", '["Review safety manual","Attend safety training","Report unsafe conditions"]'],
      ["Phone Usage", "Using personal phone during work hours", 20.00, "Low", '["Put phone on silent","Use phone only during breaks","Keep phone in locker"]'],
    ];

    for (const violation of violations) {
      await client.execute({
        sql: "INSERT INTO violation_types (name, description, default_amount, severity, suggestions) VALUES (?, ?, ?, ?, ?)",
        args: violation,
      });
    }

    // Insert dummy fines
    const fines = [
      [1, 1, 25.00, "Arrived 15 minutes late", "Employee apologized and promised to improve", "2024-01-15 09:15:00"],
      [2, 2, 15.00, "Wearing inappropriate casual wear", "First warning given", "2024-01-18 10:00:00"],
      [3, 3, 30.00, "Extended lunch break by 20 minutes", "No prior approval obtained", "2024-01-20 13:20:00"],
      [1, 4, 100.00, "Did not wear safety helmet in construction area", "Serious safety concern", "2024-01-22 14:30:00"],
      [4, 5, 20.00, "Using phone during meeting", "Disrupted important client call", "2024-01-25 11:45:00"],
    ];

    for (const fine of fines) {
      await client.execute({
        sql: "INSERT INTO fines (employee_id, violation_type_id, amount, reason, notes, fine_date) VALUES (?, ?, ?, ?, ?, ?)",
        args: fine,
      });
    }

    console.log("✅ Dummy data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding dummy data:", error);
    // Don't throw error for seeding issues
  }
}

// Helper function to handle errors consistently
export function handleError(error) {
  console.error("❌ Database Error:", error);
  throw new Error(error.message || "Database operation failed");
}

// Helper functions for database operations
export async function runQuery(sql, params = []) {
  try {
    const result = await client.execute({
      sql,
      args: params,
    });
    return { 
      id: result.lastInsertRowid, 
      changes: result.rowsAffected,
      rows: result.rows 
    };
  } catch (err) {
    throw err;
  }
}

export async function getQuery(sql, params = []) {
  try {
    const result = await client.execute({
      sql,
      args: params,
    });
    return result.rows[0] || null;
  } catch (err) {
    throw err;
  }
}

export async function allQuery(sql, params = []) {
  try {
    const result = await client.execute({
      sql,
      args: params,
    });
    return result.rows;
  } catch (err) {
    throw err;
  }
}

export { client };
