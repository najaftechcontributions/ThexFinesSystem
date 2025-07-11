import React, { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useApp } from "../context/AppContext";
import { violationTypesAPI } from "../services/api";
import ViolationCard from "../components/Violations/ViolationCard";
import ViolationModal from "../components/Violations/ViolationModal";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import toast from "react-hot-toast";
import { forceReloadViolations } from "../utils/helpers";

function ManageViolations() {
  const { violationTypes, dispatch, isAuthenticated } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingViolation, setEditingViolation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filteredViolations, setFilteredViolations] = useState([]);

  useEffect(() => {
    loadViolationTypes();
  }, []);

  useEffect(() => {
    filterAndSortViolations();
  }, [violationTypes, searchTerm, sortBy, filterSeverity]);

  const loadViolationTypes = async () => {
    try {
      setIsLoading(true);
      const response = await violationTypesAPI.getAll();
      dispatch({ type: "SET_VIOLATION_TYPES", payload: response.data });
    } catch (error) {
      console.error("Error loading violation types:", error);
      toast.error("Failed to load violation types");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortViolations = () => {
    let filtered = violationTypes.filter((vt) => {
      const matchesSearch =
        vt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vt.description &&
          vt.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSeverity = !filterSeverity || vt.severity === filterSeverity;
      return matchesSearch && matchesSeverity;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "amount-desc":
          return (b.default_amount || 0) - (a.default_amount || 0);
        case "amount-asc":
          return (a.default_amount || 0) - (b.default_amount || 0);
        case "severity":
          const severityOrder = { Low: 1, Medium: 2, High: 3, Critical: 4 };
          return (
            (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0)
          );
        default:
          return 0;
      }
    });

    setFilteredViolations(filtered);
  };

  const handleAddViolation = () => {
    setEditingViolation(null);
    setIsModalOpen(true);
  };

  const handleEditViolation = (violation) => {
    setEditingViolation(violation);
    setIsModalOpen(true);
  };

  const handleDeleteViolation = async (violation) => {
    if (
      !window.confirm(`Are you sure you want to delete "${violation.name}"?`)
    ) {
      return;
    }

    try {
      await violationTypesAPI.delete(violation.id);
      dispatch({ type: "DELETE_VIOLATION_TYPE", payload: violation.id });
      toast.success("Violation type deleted successfully");
    } catch (error) {
      console.error("Error deleting violation type:", error);
      toast.error("Failed to delete violation type");
    }
  };

  const handleModalSubmit = async (violationData) => {
    try {
      if (editingViolation) {
        const response = await violationTypesAPI.update(
          editingViolation.id,
          violationData,
        );
        dispatch({
          type: "UPDATE_VIOLATION_TYPE",
          payload: response.data.violationType,
        });
        toast.success("Violation type updated successfully");
      } else {
        const response = await violationTypesAPI.add(violationData);
        dispatch({
          type: "ADD_VIOLATION_TYPE",
          payload: response.data.violationType,
        });
        toast.success("Violation type added successfully");
      }

      // Force reload from localStorage to ensure images are shown
      setTimeout(() => {
        console.log("🔄 Force reloading violations after save...");
        forceReloadViolations(dispatch);
      }, 100);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving violation type:", error);
      toast.error("Failed to save violation type");
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading violation types..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">⚠️ Violation Management</h2>
          <p className="text-gray-600 mt-1">
            Configure violation types, penalties, and severity levels
          </p>
        </div>
        {isAuthenticated && (
          <button onClick={handleAddViolation} className="btn btn-primary">
            <Plus size={20} />
            Add Violation Type
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
                placeholder="Search violation types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="form-select"
            >
              <option value="">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
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
                <option value="amount-desc">Sort by Amount (High-Low)</option>
                <option value="amount-asc">Sort by Amount (Low-High)</option>
                <option value="severity">Sort by Severity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Violation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredViolations.map((violation) => (
          <ViolationCard
            key={violation.id}
            violation={violation}
            isAuthenticated={isAuthenticated}
            onEdit={handleEditViolation}
            onDelete={handleDeleteViolation}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredViolations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No violation types found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterSeverity
              ? "Try adjusting your search criteria"
              : "Get started by adding your first violation type"}
          </p>
          {isAuthenticated && !searchTerm && !filterSeverity && (
            <button onClick={handleAddViolation} className="btn btn-primary">
              <Plus size={20} />
              Add Violation Type
            </button>
          )}
        </div>
      )}

      {/* Violation Modal */}
      <ViolationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        violation={editingViolation}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}

export default ManageViolations;
