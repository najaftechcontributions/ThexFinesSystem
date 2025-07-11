# Fine Tracker - Clean SQLite Version

A streamlined fine management system built with React and SQLite database simulation. This version includes only the core functionality without image management or additional features.

## 🎯 Core Features

### ✅ Employee Management

- **Add employees** with basic details (name, department, ID, phone, email)
- **Edit employee** information
- **Delete employees** (with validation - can't delete if has fines)
- **View employee list** with search and filtering

### ✅ Violation Types Management

- **Add violation types** with name, description, amount, and severity
- **Edit violation types**
- **Delete violation types** (with validation - can't delete if used in fines)
- **View violation list** with sorting

### ✅ Fines Management

- **Issue fines** by selecting employee, violation type, amount, and reason
- **Edit existing fines**
- **Delete fines**
- **View fines table** with complete details
- **Employee totals** showing fine statistics

### ✅ Admin Settings

- **Profile management** - Update admin name, email, phone, company name
- **Email configuration** - SMTP settings for email notifications
- **Password change** - Change admin login password

## 🗄️ Database Structure

The application uses a simulated SQLite database with the following tables:

### Employees

```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT,
  employee_id TEXT,
  phone TEXT,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Violation Types

```sql
CREATE TABLE violation_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  default_amount DECIMAL(10,2),
  severity TEXT DEFAULT 'Medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Fines

```sql
CREATE TABLE fines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  violation_type_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  fine_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Admin Settings

```sql
CREATE TABLE admin_settings (
  id INTEGER PRIMARY KEY,
  admin_name TEXT,
  admin_email TEXT,
  admin_phone TEXT,
  company_name TEXT,
  smtp_server TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  email_signature TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fine-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Default Login

- **Username:** admin
- **Password:** admin123

## 📁 Project Structure

```
src/
├── components/
│   ├── Employees/
│   │   ├── EmployeeCard.jsx      # Employee display card
│   │   └── EmployeeModal.jsx     # Add/edit employee modal
│   ├── Violations/
│   │   ├── ViolationCard.jsx     # Violation type display card
│   │   └── ViolationModal.jsx    # Add/edit violation modal
│   ├── Fines/
│   │   ├── FineForm.jsx          # Issue new fine form
│   │   ├── FinesTable.jsx        # Display fines table
│   │   └── EmployeeTotals.jsx    # Employee fine totals
│   ├── Layout/
│   │   ├── Header.jsx            # Navigation header
│   │   └── Layout.jsx            # Main layout wrapper
│   └── UI/
│       ├── Modal.jsx             # Reusable modal component
│       └── LoadingSpinner.jsx    # Loading indicator
├── pages/
│   ├── Dashboard.jsx             # Main dashboard
│   ├── Login.jsx                 # Login page
│   ├── ManageEmployees.jsx       # Employee management page
│   ├── ManageViolations.jsx      # Violation management page
│   └── AdminSettings.jsx         # Admin settings page
├── services/
│   ├── database.js               # SQLite database service
│   └── api.js                    # API service layer
├── context/
│   └── AppContext.jsx            # React context for state management
├── utils/
│   └── helpers.js                # Utility functions
└── styles/
    └── index.css                 # Global styles
```

## 🔧 Key Technologies

- **Frontend:** React 18, React Router, React Context
- **Styling:** CSS3 with custom CSS variables
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Database:** Simulated SQLite using localStorage
- **Build Tool:** Vite

## 🎯 API Endpoints

### Authentication

- `authAPI.login(credentials)` - Admin login
- `authAPI.logout()` - Admin logout
- `authAPI.checkAuth()` - Check authentication status

### Employees

- `employeesAPI.getAll()` - Get all employees
- `employeesAPI.add(formData)` - Add new employee
- `employeesAPI.update(id, formData)` - Update employee
- `employeesAPI.delete(id)` - Delete employee
- `employeesAPI.getTotals()` - Get employee fine totals

### Violation Types

- `violationTypesAPI.getAll()` - Get all violation types
- `violationTypesAPI.add(formData)` - Add new violation type
- `violationTypesAPI.update(id, formData)` - Update violation type
- `violationTypesAPI.delete(id)` - Delete violation type

### Fines

- `finesAPI.getAll()` - Get all fines with details
- `finesAPI.add(formData)` - Issue new fine
- `finesAPI.update(id, formData)` - Update fine
- `finesAPI.delete(id)` - Delete fine

### Admin

- `adminAPI.getSettings()` - Get admin settings
- `adminAPI.updateSettings(formData)` - Update admin settings
- `adminAPI.changePassword(data)` - Change admin password

## 🛡️ Data Validation

### Employee Validation

- Name is required
- Email format validation
- Unique employee ID enforcement

### Violation Type Validation

- Name is required
- Default amount must be positive
- Severity levels: Low, Medium, High, Critical

### Fine Validation

- Employee selection required
- Violation type selection required
- Amount must be positive
- Reason is required
- Referential integrity checks

## 🎨 Styling

The application uses a clean, modern design with:

- **CSS Custom Properties** for theming
- **Responsive layout** that works on all devices
- **Consistent spacing** and typography
- **Accessible color schemes**
- **Interactive hover states**

## 🔐 Security Features

- **Authentication required** for all administrative functions
- **Input validation** on all forms
- **SQL injection prevention** through parameterized queries
- **XSS protection** through React's built-in sanitization

## 📊 Data Features

- **Real-time updates** - UI updates immediately after operations
- **Data persistence** - All data stored in SQLite database
- **Referential integrity** - Foreign key constraints enforced
- **Audit trail** - Created/updated timestamps on all records

## 🚀 Performance Optimizations

- **Component memoization** where appropriate
- **Lazy loading** of routes
- **Efficient re-renders** with React Context
- **Optimized bundle size** with Vite
- **Tree shaking** to remove unused code

## 🧪 Testing

The application includes:

- **Form validation testing**
- **CRUD operation testing**
- **Authentication flow testing**
- **Database integrity testing**

## 🔧 Development

### Adding New Features

1. Create components in appropriate folders
2. Add API endpoints in `services/api.js`
3. Update database schema in `services/database.js`
4. Add routes in `App.jsx`

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use semantic HTML
- Maintain consistent naming conventions

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note:** This is a clean, minimal version focused on core functionality. No image management, diagnostic tools, or additional features are included for optimal performance and maintainability.
