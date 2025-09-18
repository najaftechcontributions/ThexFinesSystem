import React, { useState, useCallback, useMemo } from "react";
import { Filter, RotateCcw, TrendingUp, Calendar, Search, X } from "lucide-react";

function FinesFilters({
  filters,
  employees,
  violationTypes,
  onFilterChange,
  onReset,
  showEmployeeTotals,
  onToggleEmployeeTotals,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");

  // Debounced filter change handler
  const handleFilterChange = useCallback((key, value) => {
    onFilterChange({ [key]: value });
  }, [onFilterChange]);

  // Handle search with debouncing
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    // Debounce search by 300ms
    const timeoutId = setTimeout(() => {
      handleFilterChange("searchTerm", value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [handleFilterChange]);

  // Helper function to format date for input
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split('T')[0];
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.startDate || filters.endDate || filters.employeeId ||
           filters.violationTypeId || filters.minAmount || filters.maxAmount ||
           filters.searchTerm;
  }, [filters]);

  // Quick filter presets
  const quickFilters = useMemo(() => [
    {
      label: "Today",
      action: () => {
        const today = new Date().toISOString().split('T')[0];
        handleFilterChange("startDate", today);
        handleFilterChange("endDate", today);
      }
    },
    {
      label: "Last 7 days",
      action: () => {
        const today = new Date();
        const week = new Date(today);
        week.setDate(today.getDate() - 7);
        handleFilterChange("startDate", week.toISOString().split('T')[0]);
        handleFilterChange("endDate", today.toISOString().split('T')[0]);
      }
    },
    {
      label: "Last 30 days",
      action: () => {
        const today = new Date();
        const month = new Date(today);
        month.setDate(today.getDate() - 30);
        handleFilterChange("startDate", month.toISOString().split('T')[0]);
        handleFilterChange("endDate", today.toISOString().split('T')[0]);
      }
    },
    {
      label: "This month",
      action: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        handleFilterChange("startDate", firstDay.toISOString().split('T')[0]);
        handleFilterChange("endDate", today.toISOString().split('T')[0]);
      }
    }
  ], [handleFilterChange]);

  return (
    <div className="filters-container bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Filter Header */}
      <div className="filter-header flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Active
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary btn-sm"
          >
            {isExpanded ? "Hide Filters" : "Show All Filters"}
          </button>
          <button onClick={onReset} className="btn btn-secondary btn-sm">
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            onClick={onToggleEmployeeTotals}
            className={`btn btn-sm ${showEmployeeTotals ? "btn-primary" : "btn-secondary"}`}
          >
            <TrendingUp size={16} />
            {showEmployeeTotals ? "Hide" : "Show"} Totals
          </button>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="search-bar mb-4">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2  translate-top text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by employee name, violation, reason..."
            className="form-input pl-10 pr-10 w-full"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Date Filters - Always Visible */}
      <div className="quick-filters mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 font-medium">Quick filters:</span>
          {quickFilters.map((filter, index) => (
            <button
              key={index}
              onClick={filter.action}
              className="quick-filter-btn px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="expanded-filters space-y-4">
          {/* Date Range Section */}
          <div className="filter-section">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Date Range</h4>
            <div className="grid sm:grid-cols-2 grid-cols-2  gap-4">
              <div className="form-group">
                <label className="form-label text-sm">From Date</label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2  translate-top text-gray-400"
                  />
                  <input
                    type="date"
                    value={formatDateForInput(filters.startDate)}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label text-sm">To Date</label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2  translate-top text-gray-400"
                  />
                  <input
                    type="date"
                    value={formatDateForInput(filters.endDate)}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Filters Section */}
          <div className="filter-section">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
            <div className="grid sm:grid-cols-2 grid-cols-2  gap-4">
              <div className="form-group">
                <label className="form-label text-sm">Employee</label>
                <select
                  value={filters.employeeId || ""}
                  onChange={(e) => handleFilterChange("employeeId", e.target.value)}
                  className="form-select"
                >
                  <option value="">All Employees</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label text-sm">Violation Type</label>
                <select
                  value={filters.violationTypeId || ""}
                  onChange={(e) => handleFilterChange("violationTypeId", e.target.value)}
                  className="form-select"
                >
                  <option value="">All Violations</option>
                  {violationTypes.map((violation) => (
                    <option key={violation.id} value={violation.id}>
                      {violation.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Amount Range Section */}
          <div className="filter-section">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Amount Range</h4>
            <div className="grid sm:grid-cols-2 grid-cols-2  gap-4">
              <div className="form-group">
                <label className="form-label text-sm">Min Amount (₨)</label>
                <input
                  type="number"
                  value={filters.minAmount || ""}
                  onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label text-sm">Max Amount (₨)</label>
                <input
                  type="number"
                  value={filters.maxAmount || ""}
                  onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                  className="form-input"
                  placeholder="999.99"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>

            {filters.searchTerm && (
              <span className="active-filter-tag bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                Search: "{filters.searchTerm}"
                <button
                  onClick={() => handleSearchChange("")}
                  className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.startDate && (
              <span className="active-filter-tag bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                From: {new Date(filters.startDate).toLocaleDateString()}
                <button
                  onClick={() => handleFilterChange("startDate", "")}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.endDate && (
              <span className="active-filter-tag bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                To: {new Date(filters.endDate).toLocaleDateString()}
                <button
                  onClick={() => handleFilterChange("endDate", "")}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.employeeId && (
              <span className="active-filter-tag bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                Employee: {employees.find(e => e.id == filters.employeeId)?.name || 'Unknown'}
                <button
                  onClick={() => handleFilterChange("employeeId", "")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.violationTypeId && (
              <span className="active-filter-tag bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                Violation: {violationTypes.find(v => v.id == filters.violationTypeId)?.name || 'Unknown'}
                <button
                  onClick={() => handleFilterChange("violationTypeId", "")}
                  className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.minAmount && (
              <span className="active-filter-tag bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                Min: ₨{filters.minAmount}
                <button
                  onClick={() => handleFilterChange("minAmount", "")}
                  className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.maxAmount && (
              <span className="active-filter-tag bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                Max: ₨{filters.maxAmount}
                <button
                  onClick={() => handleFilterChange("maxAmount", "")}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FinesFilters;
