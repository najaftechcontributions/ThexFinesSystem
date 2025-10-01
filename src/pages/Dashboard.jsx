import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { finesAPI, employeesAPI, violationTypesAPI } from "../services/api";
import FineForm from "../components/Fines/FineForm";
import FinesTable from "../components/Fines/FinesTable";
import FinesFilters from "../components/Fines/FinesFilters";
import EmployeeTotals from "../components/Fines/EmployeeTotals";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadFines();
  }, [filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [employeesRes, violationTypesRes] = await Promise.all([
        employeesAPI.getAll(),
        violationTypesAPI.getAll(),
      ]);

      dispatch({ type: "SET_EMPLOYEES", payload: employeesRes.data });
      dispatch({
        type: "SET_VIOLATION_TYPES",
        payload: violationTypesRes.data,
      });

      // Load fines separately with filters
      await loadFines();
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFines = async () => {
    try {
      const params = {};

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.violationTypeId) params.violationTypeId = filters.violationTypeId;

      const finesRes = await finesAPI.getAll(params);

      console.log("📊 Fines loaded with filters:", {
        filters: params,
        count: finesRes.data?.length,
      });

      dispatch({ type: "SET_FINES", payload: finesRes.data });

      // Apply frontend-only filters (amount range, sorting)
      applyFilters(finesRes.data);
    } catch (error) {
      console.error("Error loading fines:", error);
      toast.error("Failed to load fines");
    }
  };

  const applyFilters = (finesData = fines) => {
    try {
      let filtered = [...finesData];

      // Filter by search term (frontend only)
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchTerm = filters.searchTerm.toLowerCase().trim();
        filtered = filtered.filter((fine) => {
          // Search in employee name
          const employeeMatch = fine.employee?.toLowerCase().includes(searchTerm);

          // Search in violation type (extracted from reason)
          const reasonParts = fine.reason?.split(": ") || [];
          const violationType = reasonParts.length > 1 ? reasonParts[0] : "";
          const violationTypeMatch = violationType.toLowerCase().includes(searchTerm);

          // Search in actual reason (after the violation type)
          const actualReason = reasonParts.length > 1 ? reasonParts.slice(1).join(": ") : fine.reason || "";
          const reasonMatch = actualReason.toLowerCase().includes(searchTerm);

          // Search in notes
          const notesMatch = fine.notes?.toLowerCase().includes(searchTerm);

          // Search in amount (as string)
          const amountMatch = fine.amount?.toString().includes(searchTerm);

          return employeeMatch || violationTypeMatch || reasonMatch || notesMatch || amountMatch;
        });
      }

      // Filter by amount range (frontend only)
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

      // Sort (frontend only)
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "date-desc":
            return new Date(b.date || b.fine_date) - new Date(a.date || a.fine_date);
          case "date-asc":
            return new Date(a.date || a.fine_date) - new Date(b.date || b.fine_date);
          case "amount-desc":
            return b.amount - a.amount;
          case "amount-asc":
            return a.amount - b.amount;
          case "employee":
            return (a.employee || "").localeCompare(b.employee || "");
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
        startDate: "",
        endDate: "",
        employeeId: "",
        violationTypeId: "",
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
          <div
            className="card-header cursor-pointer"
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          >
            <div>
              <h3 className="text-xl font-semibold">💰 Issue a Fine</h3>
              <p className="text-gray-600 mt-1">
                Select an employee and violation type with visual confirmation
              </p>
            </div>
            <div className="flex items-center text-gray-500">
              {isAccordionOpen ? (
                <ChevronUp size={20} className="transition-transform duration-200" />
              ) : (
                <ChevronDown size={20} className="transition-transform duration-200" />
              )}
            </div>
          </div>

          <div
            className={`accordion-content ${
              isAccordionOpen ? 'accordion-open' : 'accordion-closed'
            }`}
          >
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
          </div>
        </section>
      )}

      {/* Fine Records Section */}
      <section className="card">
        <div
          className="card-header cursor-pointer"
          onClick={() => setIsRecordsOpen(!isRecordsOpen)}
        >
          <div>
            <h3 className="text-xl font-semibold">📋 Fine Records</h3>
            <p className="text-gray-600 mt-1">
              View and manage all fine records with filtering options
            </p>
          </div>
          <div className="flex items-center text-gray-500">
            {isRecordsOpen ? (
              <ChevronUp size={20} className="transition-transform duration-200" />
            ) : (
              <ChevronDown size={20} className="transition-transform duration-200" />
            )}
          </div>
        </div>

        <div
          className={`accordion-content ${
            isRecordsOpen ? 'accordion-open' : 'accordion-closed'
          }`}
        >
          {/* Filters */}
          <FinesFilters
            filters={filters}
            employees={employees}
            violationTypes={violationTypes}
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
              onFilterByEmployee={(employeeId) => handleFilterChange({ employeeId })}
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
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
