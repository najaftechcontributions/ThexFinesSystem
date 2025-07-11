import React from "react";
import { Filter, RotateCcw, TrendingUp } from "lucide-react";

function FinesFilters({
  filters,
  employees,
  onFilterChange,
  onReset,
  showEmployeeTotals,
  onToggleEmployeeTotals,
}) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Employee Filter */}
        <div className="form-group">
          <label className="form-label text-sm">Filter by Employee</label>
          <select
            value={filters.employee}
            onChange={(e) => handleFilterChange("employee", e.target.value)}
            className="form-select"
          >
            <option value="">-- Show All --</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.name}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="form-group">
          <label className="form-label text-sm">Sort by</label>
          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="form-select pl-10"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="employee">Employee Name</option>
            </select>
          </div>
        </div>

        {/* Min Amount Filter */}
        <div className="form-group">
          <label className="form-label text-sm">Min Amount</label>
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange("minAmount", e.target.value)}
            className="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        {/* Max Amount Filter */}
        <div className="form-group">
          <label className="form-label text-sm">Max Amount</label>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
            className="form-input"
            placeholder="999.99"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button onClick={onReset} className="btn btn-secondary btn-sm">
            <RotateCcw size={16} />
            Reset Filters
          </button>

          <button
            onClick={onToggleEmployeeTotals}
            className={`btn btn-sm ${showEmployeeTotals ? "btn-primary" : "btn-secondary"}`}
          >
            <TrendingUp size={16} />
            {showEmployeeTotals ? "Hide" : "Show"} Employee Totals
          </button>
        </div>

        {/* Active Filters Indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {(filters.employee || filters.minAmount || filters.maxAmount) && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              Filters Active
            </span>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.employee || filters.minAmount || filters.maxAmount) && (
        <div className="flex flex-wrap gap-2">
          {filters.employee && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Employee: {filters.employee}
              <button
                onClick={() => handleFilterChange("employee", "")}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                ×
              </button>
            </span>
          )}

          {filters.minAmount && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Min: ₨{filters.minAmount}
              <button
                onClick={() => handleFilterChange("minAmount", "")}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                ×
              </button>
            </span>
          )}

          {filters.maxAmount && (
            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              Max: ₨{filters.maxAmount}
              <button
                onClick={() => handleFilterChange("maxAmount", "")}
                className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default FinesFilters;
