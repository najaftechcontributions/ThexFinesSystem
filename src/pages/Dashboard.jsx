import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { finesAPI, employeesAPI, violationTypesAPI } from "../services/api";
import FineForm from "../components/Fines/FineForm";
import FinesTable from "../components/Fines/FinesTable";
import FinesFilters from "../components/Fines/FinesFilters";
import EmployeeTotals from "../components/Fines/EmployeeTotals";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

function Dashboard() {
  const {
    isAuthenticated,
    employees,
    violationTypes,
    fines,
    dispatch,
    filters,
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [showEmployeeTotals, setShowEmployeeTotals] = useState(false);
  const [filteredFines, setFilteredFines] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [fines, filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [employeesRes, violationTypesRes, finesRes] = await Promise.all([
        employeesAPI.getAll(),
        violationTypesAPI.getAll(),
        finesAPI.getAll(),
      ]);

      console.log("📊 Dashboard data loaded:", {
        employees: employeesRes.data?.length,
        violationTypes: violationTypesRes.data?.length,
        fines: finesRes.data?.length,
        sampleFine: finesRes.data?.[0],
      });

      dispatch({ type: "SET_EMPLOYEES", payload: employeesRes.data });
      dispatch({
        type: "SET_VIOLATION_TYPES",
        payload: violationTypesRes.data,
      });
      dispatch({ type: "SET_FINES", payload: finesRes.data });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    try {
      let filtered = [...fines];

      // Filter by employee
      if (filters.employee) {
        filtered = filtered.filter(
          (fine) => fine.employee === filters.employee,
        );
      }

      // Filter by amount range
      if (filters.minAmount) {
        filtered = filtered.filter(
          (fine) => fine.amount >= parseFloat(filters.minAmount),
        );
      }
      if (filters.maxAmount) {
        filtered = filtered.filter(
          (fine) => fine.amount <= parseFloat(filters.maxAmount),
        );
      }

      // Sort
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "date-desc":
            return new Date(b.date) - new Date(a.date);
          case "date-asc":
            return new Date(a.date) - new Date(b.date);
          case "amount-desc":
            return b.amount - a.amount;
          case "amount-asc":
            return a.amount - b.amount;
          case "employee":
            return a.employee.localeCompare(b.employee);
          default:
            return 0;
        }
      });

      setFilteredFines(filtered);
    } catch (error) {
      console.error("❌ Error applying filters:", error);
      setFilteredFines([]);
    }
  };

  const handleFilterChange = (newFilters) => {
    dispatch({ type: "SET_FILTERS", payload: newFilters });
  };

  const resetFilters = () => {
    dispatch({
      type: "SET_FILTERS",
      payload: {
        employee: "",
        sortBy: "date-desc",
        minAmount: "",
        maxAmount: "",
      },
    });
  };

  const calculateTotals = () => {
    const filteredTotal = filteredFines.reduce(
      (sum, fine) => sum + parseFloat(fine.amount),
      0,
    );
    const grandTotal = fines.reduce(
      (sum, fine) => sum + parseFloat(fine.amount),
      0,
    );

    return {
      filtered: filteredTotal.toFixed(2),
      grand: grandTotal.toFixed(2),
      count: filteredFines.length,
    };
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-8">
      {/* Fine Submission Section - Only for authenticated users */}
      {isAuthenticated && (
        <section className="card">
          <div className="card-header">
            <div>
              <h3 className="text-xl font-semibold">💰 Issue a Fine</h3>
              <p className="text-gray-600 mt-1">
                Select an employee and violation type with visual confirmation
              </p>
            </div>
          </div>

          {employees.length === 0 || violationTypes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📋</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Setup Required
              </h4>
              <p className="text-gray-600 mb-4">
                {employees.length === 0 && violationTypes.length === 0
                  ? "Add employees and violation types first"
                  : employees.length === 0
                    ? "Add employees first to issue fines"
                    : "Add violation types first to issue fines"}
              </p>
              <div className="flex gap-3 justify-center">
                {employees.length === 0 && (
                  <a href="/employees" className="btn btn-primary">
                    Add Employees
                  </a>
                )}
                {violationTypes.length === 0 && (
                  <a href="/violations" className="btn btn-primary">
                    Add Violations
                  </a>
                )}
              </div>
            </div>
          ) : (
            <FineForm
              employees={employees}
              violationTypes={violationTypes}
              onSubmit={loadData}
            />
          )}
        </section>
      )}

      {/* Fine Records Section */}
      <section className="card">
        <div className="card-header">
          <h3 className="text-xl font-semibold">📋 Fine Records</h3>
        </div>

        {/* Filters */}
        <FinesFilters
          filters={filters}
          employees={employees}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          showEmployeeTotals={showEmployeeTotals}
          onToggleEmployeeTotals={() =>
            setShowEmployeeTotals(!showEmployeeTotals)
          }
        />

        {/* Employee Totals */}
        {showEmployeeTotals && (
          <EmployeeTotals
            employees={employees}
            onFilterByEmployee={(employee) => handleFilterChange({ employee })}
          />
        )}

        {/* Fines Table */}
        <FinesTable
          fines={filteredFines}
          employees={employees}
          violationTypes={violationTypes}
          isAuthenticated={isAuthenticated}
          onUpdate={loadData}
        />

        {/* Summary */}
        <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <strong className="text-lg">
              Filtered Total: ₨{totals.filtered}
            </strong>
            <span className="text-gray-600 ml-2">({totals.count} records)</span>
          </div>
          <div>
            <strong className="text-lg">Grand Total: ₨{totals.grand}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
