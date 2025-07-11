import React, { useState, useEffect } from "react";
import { Save, X, Plus, Trash2 } from "lucide-react";
import Modal from "../UI/Modal";

function ViolationModal({ isOpen, onClose, violation, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_amount: "",
    severity: "Medium",
    suggestions: [],
  });
  const [newSuggestion, setNewSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (violation) {
      setFormData({
        name: violation.name || "",
        description: violation.description || "",
        default_amount: violation.default_amount?.toString() || "",
        severity: violation.severity || "Medium",
        suggestions: violation.suggestions || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        default_amount: "",
        severity: "Medium",
        suggestions: [],
      });
    }
    setNewSuggestion("");
  }, [violation, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSuggestion = () => {
    if (
      newSuggestion.trim() &&
      !formData.suggestions.includes(newSuggestion.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        suggestions: [...prev.suggestions, newSuggestion.trim()],
      }));
      setNewSuggestion("");
    }
  };

  const removeSuggestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter violation name");
      return;
    }

    if (!formData.default_amount || parseFloat(formData.default_amount) < 0) {
      alert("Please enter a valid default amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        default_amount: formData.default_amount,
        severity: formData.severity,
        suggestions: formData.suggestions.join(","),
      };

      await onSubmit(submitData);

      // Reset form
      setFormData({
        name: "",
        description: "",
        default_amount: "",
        severity: "Medium",
        suggestions: [],
      });
      setNewSuggestion("");
    } catch (error) {
      console.error("Error submitting violation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={violation ? "Edit Violation Type" : "Add New Violation Type"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Violation Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Attendance Issues"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Default Amount (PKR) *</label>
            <input
              type="number"
              name="default_amount"
              value={formData.default_amount}
              onChange={handleInputChange}
              className="form-input"
              placeholder="250.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-input form-textarea"
            placeholder="Describe this violation type..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Severity Level</label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Suggestions */}
        <div className="form-group">
          <label className="form-label">Common Examples/Suggestions</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                className="form-input flex-1"
                placeholder="Add a common example..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSuggestion())
                }
              />
              <button
                type="button"
                onClick={addSuggestion}
                className="btn btn-primary"
              >
                <Plus size={16} />
              </button>
            </div>

            {formData.suggestions.length > 0 && (
              <div className="space-y-2">
                {formData.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                  >
                    <span className="flex-1 text-sm">{suggestion}</span>
                    <button
                      type="button"
                      onClick={() => removeSuggestion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            <X size={20} />
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save size={20} />
                {violation ? "Update" : "Create"} Violation Type
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ViolationModal;
