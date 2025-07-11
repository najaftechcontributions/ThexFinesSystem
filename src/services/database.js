/**
 * SQLite Database Service
 * Handles all database operations for the fine tracker
 */

// For this frontend-only implementation, we'll simulate SQLite with localStorage
// In a real app, this would connect to an actual SQLite database

class DatabaseService {
  constructor() {
    this.initializeDatabase();
  }

  initializeDatabase() {
    console.log("🗄️ Initializing SQLite database...");

    // Create tables if they don't exist
    this.createTables();

    // Clear any existing default data (migration)
    this.clearDefaultData();

    // Insert minimal default data (admin settings only)
    this.insertDefaultData();

    console.log(
      "✨ Database initialized with empty tables - all data will be dynamic!",
    );
    console.log(
      "���� Add employees and violation types through the admin interface",
    );
  }

  createTables() {
    // Employees table
    if (!this.tableExists("employees")) {
      this.createTable("employees", {
        id: "INTEGER PRIMARY KEY AUTOINCREMENT",
        name: "TEXT NOT NULL",
        department: "TEXT",
        employee_id: "TEXT",
        phone: "TEXT",
        email: "TEXT",
        created_at: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        updated_at: "DATETIME DEFAULT CURRENT_TIMESTAMP",
      });
    }

    // Violation types table
    if (!this.tableExists("violation_types")) {
      this.createTable("violation_types", {
        id: "INTEGER PRIMARY KEY AUTOINCREMENT",
        name: "TEXT NOT NULL",
        description: "TEXT",
        default_amount: "DECIMAL(10,2)",
        severity: 'TEXT DEFAULT "Medium"',
        created_at: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        updated_at: "DATETIME DEFAULT CURRENT_TIMESTAMP",
      });
    }

    // Fines table
    if (!this.tableExists("fines")) {
      this.createTable("fines", {
        id: "INTEGER PRIMARY KEY AUTOINCREMENT",
        employee_id: "INTEGER NOT NULL",
        violation_type_id: "INTEGER NOT NULL",
        amount: "DECIMAL(10,2) NOT NULL",
        reason: "TEXT NOT NULL",
        notes: "TEXT",
        fine_date: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        created_at: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        updated_at: "DATETIME DEFAULT CURRENT_TIMESTAMP",
      });
    }

    // Admin settings table
    if (!this.tableExists("admin_settings")) {
      this.createTable("admin_settings", {
        id: "INTEGER PRIMARY KEY",
        admin_name: "TEXT",
        admin_email: "TEXT",
        admin_phone: "TEXT",
        company_name: "TEXT",
        smtp_server: "TEXT",
        smtp_port: "INTEGER",
        smtp_username: "TEXT",
        email_signature: "TEXT",
        updated_at: "DATETIME DEFAULT CURRENT_TIMESTAMP",
      });
    }
  }

  tableExists(tableName) {
    const data = localStorage.getItem(`table_${tableName}`);
    return data !== null;
  }

  createTable(tableName, schema) {
    localStorage.setItem(`table_${tableName}`, JSON.stringify([]));
    localStorage.setItem(`schema_${tableName}`, JSON.stringify(schema));
    console.log(`✅ Created table: ${tableName}`);
  }

  clearDefaultData() {
    try {
      // Clear any existing default employees (migration cleanup)
      const employees = this.findAll("employees");
      const defaultEmployeeNames = ["John Doe", "Jane Smith", "Alice Lee"];

      employees.forEach((emp) => {
        if (defaultEmployeeNames.includes(emp.name)) {
          console.log(`🗑️ Removing default employee: ${emp.name}`);
          this.delete("employees", emp.id);
        }
      });

      // Clear any existing default violations (migration cleanup)
      const violations = this.findAll("violation_types");
      const defaultViolationNames = [
        "Attendance Issues",
        "Conduct & Behavior",
        "Performance Issues",
        "Safety Violation",
      ];

      violations.forEach((viol) => {
        if (defaultViolationNames.includes(viol.name)) {
          console.log(`🗑️ Removing default violation: ${viol.name}`);
          this.delete("violation_types", viol.id);
        }
      });

      console.log("✅ Default data cleanup completed");
    } catch (error) {
      console.log("ℹ️ No default data to clean up");
    }
  }

  insertDefaultData() {
    // No default employees - start with empty database
    // Employees are added dynamically by admin users

    // No default violation types - start with empty database
    // Violation types are added dynamically by admin users

    // Default admin settings
    if (this.count("admin_settings") === 0) {
      this.insert("admin_settings", {
        id: 1,
        admin_name: "System Administrator",
        admin_email: "admin@company.com",
        admin_phone: "+92-300-0000000",
        company_name: "Your Company",
        smtp_server: "",
        smtp_port: 587,
        smtp_username: "",
        email_signature: "Best regards,<br>Fine Management System",
      });
    }
  }

  // CRUD Operations
  insert(tableName, data) {
    try {
      const table = this.getTable(tableName);
      const newId = this.getNextId(tableName);
      const timestamp = new Date().toISOString();

      const record = {
        id: newId,
        ...data,
        created_at: timestamp,
        updated_at: timestamp,
      };

      table.push(record);
      this.saveTable(tableName, table);

      console.log(`✅ Inserted into ${tableName}:`, record.id);
      return record;
    } catch (error) {
      console.error(`❌ Insert failed for ${tableName}:`, error);
      throw error;
    }
  }

  update(tableName, id, data) {
    try {
      const table = this.getTable(tableName);
      const index = table.findIndex((row) => row.id === parseInt(id));

      if (index === -1) {
        throw new Error(`Record with id ${id} not found in ${tableName}`);
      }

      const timestamp = new Date().toISOString();
      table[index] = {
        ...table[index],
        ...data,
        updated_at: timestamp,
      };

      this.saveTable(tableName, table);

      console.log(`✅ Updated ${tableName} record:`, id);
      return table[index];
    } catch (error) {
      console.error(`❌ Update failed for ${tableName}:`, error);
      throw error;
    }
  }

  delete(tableName, id) {
    try {
      const table = this.getTable(tableName);
      const filteredTable = table.filter((row) => row.id !== parseInt(id));

      if (table.length === filteredTable.length) {
        throw new Error(`Record with id ${id} not found in ${tableName}`);
      }

      this.saveTable(tableName, filteredTable);

      console.log(`✅ Deleted from ${tableName}:`, id);
      return true;
    } catch (error) {
      console.error(`❌ Delete failed for ${tableName}:`, error);
      throw error;
    }
  }

  findAll(tableName) {
    try {
      return this.getTable(tableName);
    } catch (error) {
      console.error(`❌ FindAll failed for ${tableName}:`, error);
      return [];
    }
  }

  findById(tableName, id) {
    try {
      const table = this.getTable(tableName);
      return table.find((row) => row.id === parseInt(id)) || null;
    } catch (error) {
      console.error(`❌ FindById failed for ${tableName}:`, error);
      return null;
    }
  }

  findByField(tableName, field, value) {
    try {
      const table = this.getTable(tableName);
      return table.filter((row) => row[field] === value);
    } catch (error) {
      console.error(`❌ FindByField failed for ${tableName}:`, error);
      return [];
    }
  }

  count(tableName) {
    try {
      return this.getTable(tableName).length;
    } catch (error) {
      console.error(`❌ Count failed for ${tableName}:`, error);
      return 0;
    }
  }

  // Helper methods
  getTable(tableName) {
    const data = localStorage.getItem(`table_${tableName}`);
    return data ? JSON.parse(data) : [];
  }

  saveTable(tableName, data) {
    localStorage.setItem(`table_${tableName}`, JSON.stringify(data));
  }

  getNextId(tableName) {
    const table = this.getTable(tableName);
    return table.length > 0 ? Math.max(...table.map((row) => row.id)) + 1 : 1;
  }

  // Complex queries
  getFinesWithDetails() {
    try {
      const fines = this.findAll("fines");
      const employees = this.findAll("employees");
      const violations = this.findAll("violation_types");

      return fines.map((fine) => {
        const employee = employees.find((emp) => emp.id === fine.employee_id);
        const result = {
          ...fine,
          employee: employee?.name || "Unknown",
          violation_name:
            violations.find((viol) => viol.id === fine.violation_type_id)
              ?.name || "Unknown",
          employee_obj: employee,
          violation_type: violations.find(
            (viol) => viol.id === fine.violation_type_id,
          ),
          date: fine.fine_date,
        };

        if (!employee) {
          console.warn(
            "⚠️ Employee not found for ID:",
            fine.employee_id,
            "in fine:",
            fine.id,
          );
        }

        return result;
      });
    } catch (error) {
      console.error("❌ GetFinesWithDetails failed:", error);
      return [];
    }
  }

  getEmployeeTotals() {
    try {
      const employees = this.findAll("employees");
      const fines = this.getFinesWithDetails();
      const totals = {};

      // Initialize all employees with zero totals
      employees.forEach((employee) => {
        totals[employee.name] = {
          employee: employee.name,
          employee_id: employee.id,
          fine_count: 0,
          total_amount: 0,
          avg_amount: 0,
          fines: [],
          first_fine: null,
          last_fine: null,
        };
      });

      // Add fine data for employees who have fines
      fines.forEach((fine) => {
        const empName = fine.employee;
        if (totals[empName]) {
          totals[empName].fine_count++;
          totals[empName].total_amount += parseFloat(fine.amount);
          totals[empName].fines.push(fine);
        }
      });

      // Calculate averages and dates for employees with fines
      return Object.values(totals)
        .map((total) => ({
          ...total,
          avg_amount:
            total.fine_count > 0 ? total.total_amount / total.fine_count : 0,
          first_fine:
            total.fines.length > 0
              ? total.fines.sort(
                  (a, b) => new Date(a.fine_date) - new Date(b.fine_date),
                )[0]?.fine_date
              : null,
          last_fine:
            total.fines.length > 0
              ? total.fines.sort(
                  (a, b) => new Date(b.fine_date) - new Date(a.fine_date),
                )[0]?.fine_date
              : null,
        }))
        .sort((a, b) => {
          // First sort by whether they have fines (fined employees first)
          if (a.fine_count > 0 && b.fine_count === 0) return -1;
          if (a.fine_count === 0 && b.fine_count > 0) return 1;

          // Then sort by total amount (highest first)
          return b.total_amount - a.total_amount;
        });
    } catch (error) {
      console.error("❌ GetEmployeeTotals failed:", error);
      return [];
    }
  }

  // Database maintenance
  clearDatabase() {
    console.log("🗑️ Clearing database...");
    const tables = ["employees", "violation_types", "fines", "admin_settings"];
    tables.forEach((table) => {
      localStorage.removeItem(`table_${table}`);
      localStorage.removeItem(`schema_${table}`);
    });
    this.initializeDatabase();
  }

  getStats() {
    return {
      employees: this.count("employees"),
      violations: this.count("violation_types"),
      fines: this.count("fines"),
      total_fine_amount: this.findAll("fines").reduce(
        (sum, fine) => sum + parseFloat(fine.amount),
        0,
      ),
    };
  }
}

// Create and export database instance
const database = new DatabaseService();

export default database;
