import React, { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useApp } from "../context/AppContext";
import { employeesAPI } from "../services/api";
import EmployeeCard from "../components/Employees/EmployeeCard";
import EmployeeModal from "../components/Employees/EmployeeModal";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import toast from "react-hot-toast";
import { forceReloadEmployees } from "../utils/helpers";

function ManageEmployees() {
  const { employees, dispatch, isAuthenticated } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterAndSortEmployees();
  }, [employees, searchTerm, sortBy]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeesAPI.getAll();
      dispatch({ type: "SET_EMPLOYEES", payload: response.data });
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortEmployees = () => {
    let filtered = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.department &&
          emp.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.employee_id &&
          emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "department":
          return (a.department || "").localeCompare(b.department || "");
        case "employee_id":
          return (a.employee_id || "").localeCompare(b.employee_id || "");
        default:
          return 0;
      }
    });

    setFilteredEmployees(filtered);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      return;
    }

    try {
      // First try normal deletion
      await employeesAPI.delete(employee.id);
      dispatch({ type: "DELETE_EMPLOYEE", payload: employee.id });
      toast.success("Employee deleted successfully");
    } catch (error) {
      console.error("Error deleting employee:", error);

      // If error mentions existing fines, offer force deletion
      if (error.message.includes("existing fine")) {
        const forceDelete = window.confirm(
          `${error.message}\n\n` +
            `Do you want to delete this employee anyway? ` +
            `Their fine records will be kept for historical purposes but marked as orphaned.`,
        );

        if (forceDelete) {
          try {
            await employeesAPI.delete(employee.id, { force: true });
            dispatch({ type: "DELETE_EMPLOYEE", payload: employee.id });
            toast.success(
              "Employee deleted. Fine records preserved for history.",
            );
          } catch (forceError) {
            console.error("Error force deleting employee:", forceError);
            toast.error("Failed to delete employee");
          }
        }
      } else {
        toast.error(error.message || "Failed to delete employee");
      }
    }
  };

  const handleModalSubmit = async (employeeData) => {
    try {
      if (editingEmployee) {
        const response = await employeesAPI.update(
          editingEmployee.id,
          employeeData,
        );
        dispatch({ type: "UPDATE_EMPLOYEE", payload: response.data.employee });
        toast.success("Employee updated successfully");
      } else {
        const response = await employeesAPI.add(employeeData);
        dispatch({ type: "ADD_EMPLOYEE", payload: response.data.employee });
        toast.success("Employee added successfully");
      }

      // Force reload from localStorage to ensure images are shown
      setTimeout(() => {
        console.log("🔄 Force reloading employees after save...");
        forceReloadEmployees(dispatch);
      }, 100);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Failed to save employee");
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading employees..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">👥 Employee Management</h2>
          <p className="text-gray-600 mt-1">
            Manage employee information and view statistics
          </p>
        </div>
        {isAuthenticated && (
          <button onClick={handleAddEmployee} className="btn btn-primary">
            <Plus size={20} />
            Add Employee
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select pl-10"
              >
                <option value="name">Sort by Name (A-Z)</option>
                <option value="name-desc">Sort by Name (Z-A)</option>
                <option value="department">Sort by Department</option>
                <option value="employee_id">Sort by Employee ID</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            isAuthenticated={isAuthenticated}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No employees found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by adding your first employee"}
          </p>
          {isAuthenticated && !searchTerm && (
            <button onClick={handleAddEmployee} className="btn btn-primary">
              <Plus size={20} />
              Add Employee
            </button>
          )}
        </div>
      )}

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={editingEmployee}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}

export default ManageEmployees;
