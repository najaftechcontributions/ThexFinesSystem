import React, { useState, useCallback, useMemo } from "react";
import { Filter, RotateCcw, TrendingUp, Calendar, Search, X, Clock, CalendarDays, CalendarRange } from "lucide-react";

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

  const handleFilterChange = useCallback((key, value) => {
    onFilterChange({ [key]: value });
  }, [onFilterChange]);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    const timeoutId = setTimeout(() => {
      handleFilterChange("searchTerm", value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [handleFilterChange]);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const hasActiveFilters = useMemo(() => {
    return filters.startDate || filters.endDate || filters.employeeId ||
           filters.violationTypeId || filters.minAmount || filters.maxAmount ||
           filters.searchTerm;
  }, [filters]);

  const quickFilters = useMemo(() => [
    {
      label: "Today",
      icon: Clock,
      gradient: "from-blue-500 to-blue-600",
      action: () => {
        const today = new Date().toISOString().split('T')[0];
        handleFilterChange("startDate", today);
        handleFilterChange("endDate", today);
      }
    },
    {
      label: "Last 7 days",
      icon: CalendarDays,
      gradient: "from-purple-500 to-purple-600",
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
      icon: CalendarRange,
      gradient: "from-indigo-500 to-indigo-600",
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
      icon: Calendar,
      gradient: "from-teal-500 to-teal-600",
      action: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        handleFilterChange("startDate", firstDay.toISOString().split('T')[0]);
        handleFilterChange("endDate", today.toISOString().split('T')[0]);
      }
    }
  ], [handleFilterChange]);

  return (
    <div className="filters-container">
      {/* Filter Header */}
      <div className="filters-header">
        <div className="filters-title-section">
          <div className="filters-icon-wrapper">
            <Filter size={22} />
          </div>
          <div>
            <h3 className="filters-title">Filters & Search</h3>
            <p className="filters-subtitle">Narrow down your results</p>
          </div>
          {hasActiveFilters && (
            <span className="active-badge">
              {Object.values(filters).filter(v => v).length} Active
            </span>
          )}
        </div>

        <div className="filters-action-buttons">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="filter-toggle-btn"
          >
            <Filter size={16} />
            {isExpanded ? "Hide Advanced" : "Advanced"}
          </button>
          <button onClick={onReset} className="filter-reset-btn">
            <RotateCcw size={16} />
            Reset All
          </button>
          <button
            onClick={onToggleEmployeeTotals}
            className={`filter-totals-btn ${showEmployeeTotals ? 'active' : ''}`}
          >
            <TrendingUp size={16} />
            {showEmployeeTotals ? "Hide" : "Show"} Totals
          </button>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by employee name, violation type, or reason..."
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => handleSearchChange("")} className="search-clear-btn">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Date Filters - Always Visible */}
      <div className="quick-filters-section">
        <div className="quick-filters-label">
          <Clock size={16} />
          <span>Quick Filters</span>
        </div>
        <div className="quick-filters-grid">
          {quickFilters.map((filter, index) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={index}
                onClick={filter.action}
                className={`quick-filter-chip bg-gradient-to-r ${filter.gradient}`}
              >
                <IconComponent size={16} />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters-section">
          <div className="active-filters-label">
            <Filter size={16} />
            <span>Active Filters:</span>
            <button onClick={onReset} className="clear-all-filters-btn">
              Clear All
            </button>
          </div>
          <div className="active-filters-tags">
            {filters.searchTerm && (
              <span className="filter-tag tag-search">
                <Search size={14} />
                <span className="filter-tag-content">
                  <span className="filter-tag-label">Search:</span>
                  <span className="filter-tag-value">"{filters.searchTerm}"</span>
                </span>
                <button
                  onClick={() => handleSearchChange("")}
                  className="filter-tag-remove"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.startDate && (
              <span className="filter-tag tag-date">
                <Calendar size={14} />
                <span className="filter-tag-content">
                  <span className="filter-tag-label">From:</span>
                  <span className="filter-tag-value">{new Date(filters.startDate).toLocaleDateString()}</span>
                </span>
                <button
                  onClick={() => handleFilterChange("startDate", "")}
                  className="filter-tag-remove"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.endDate && (
              <span className="filter-tag tag-date">
                <Calendar size={14} />
                <span className="filter-tag-content">
                  <span className="filter-tag-label">To:</span>
                  <span className="filter-tag-value">{new Date(filters.endDate).toLocaleDateString()}</span>
                </span>
                <button
                  onClick={() => handleFilterChange("endDate", "")}
                  className="filter-tag-remove"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.employeeId && (
              <span className="filter-tag tag-employee">
                <span className="filter-tag-content">
                  <span className="filter-tag-label">Employee:</span>
                  <span className="filter-tag-value">{employees.find(e => e.id == filters.employeeId)?.name || 'Unknown'}</span>
                </span>
                <button
                  onClick={() => handleFilterChange("employeeId", "")}
                  className="filter-tag-remove"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.violationTypeId && (
              <span className="filter-tag tag-violation">
                <span className="filter-tag-content">
                  <span className="filter-tag-label">Violation:</span>
                  <span className="filter-tag-value">{violationTypes.find(v => v.id == filters.violationTypeId)?.name || 'Unknown'}</span>
                </span>
                <button
                  onClick={() => handleFilterChange("violationTypeId", "")}
                  className="filter-tag-remove"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.minAmount && (
              <span className="filter-tag tag-amount">
                <span className="filter-tag-content">
                  <span className="filter-tag-label">Min Amount:</span>
                  <span className="filter-tag-value">₨{filters.minAmount}</span>
                </span>
                <button
                  onClick={() => handleFilterChange("minAmount", "")}
                  className="filter-tag-remove"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.maxAmount && (
              <span className="filter-tag tag-amount">
                <span className="filter-tag-content">
                  <span className="filter-tag-label">Max Amount:</span>
                  <span className="filter-tag-value">₨{filters.maxAmount}</span>
                </span>
                <button
                  onClick={() => handleFilterChange("maxAmount", "")}
                  className="filter-tag-remove"
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="expanded-filters">
          {/* Date Range Section */}
          <div className="filter-section">
            <h4 className="filter-section-title">
              <Calendar size={16} />
              Date Range
            </h4>
            <div className="filter-section-grid">
              <div className="form-group">
                <label className="form-label">From Date</label>
                <div className="relative">
                  <Calendar size={16} className="form-input-icon" />
                  <input
                    type="date"
                    value={formatDateForInput(filters.startDate)}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="form-input form-input-with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">To Date</label>
                <div className="relative">
                  <Calendar size={16} className="form-input-icon" />
                  <input
                    type="date"
                    value={formatDateForInput(filters.endDate)}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    className="form-input form-input-with-icon"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Filters Section */}
          <div className="filter-section">
            <h4 className="filter-section-title">
              <Filter size={16} />
              Categories
            </h4>
            <div className="filter-section-grid">
              <div className="form-group">
                <label className="form-label">Employee</label>
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
                <label className="form-label">Violation Type</label>
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
            <h4 className="filter-section-title">
              <TrendingUp size={16} />
              Amount Range
            </h4>
            <div className="filter-section-grid">
              <div className="form-group">
                <label className="form-label">Min Amount (₨)</label>
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
                <label className="form-label">Max Amount (₨)</label>
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
    </div>
  );
}

export default FinesFilters;
