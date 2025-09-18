import React, { useState } from "react";
import { DollarSign, FileText } from "lucide-react";
import { finesAPI } from "../../services/api";
import toast from "react-hot-toast";

function FineForm({ employees, violationTypes, onSubmit }) {
  const [formData, setFormData] = useState({
    employee: "",
    violation_type_id: "",
    reason: "",
    amount: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedViolation, setSelectedViolation] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "employee") {
      const employee = employees.find((emp) => emp.name === value);
      setSelectedEmployee(employee);
    }

    if (name === "violation_type_id") {
      const violation = violationTypes.find((vt) => vt.id === parseInt(value));
      setSelectedViolation(violation);
      if (violation && violation.default_amount && !formData.amount) {
        setFormData((prev) => ({
          ...prev,
          amount: violation.default_amount.toString(),
        }));
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({ ...prev, reason: suggestion }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedEmployee ||
      !formData.violation_type_id ||
      !formData.reason ||
      !formData.amount
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid fine amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        employee_id: selectedEmployee?.id,
        violation_type_id: formData.violation_type_id,
        reason: `${selectedViolation?.name}: ${formData.reason}`,
        amount: formData.amount,
        notes: formData.notes,
      };

      await finesAPI.add(submitData);

      toast.success("Fine issued successfully!");

      // Reset form
      setFormData({
        employee: "",
        violation_type_id: "",
        reason: "",
        amount: "",
        notes: "",
      });
      setSelectedEmployee(null);
      setSelectedViolation(null);

      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Error submitting fine:", error);
      toast.error(error.message || "Failed to issue fine");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      employee: "",
      violation_type_id: "",
      reason: "",
      amount: "",
      notes: "",
    });
    setSelectedEmployee(null);
    setSelectedViolation(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee and Violation Selection */}
      <div className="form-grid gap-6">
        {/* Employee Selection */}
        <div className="form-group">
          <label className="form-label">Select Employee *</label>
          <select
            name="employee"
            value={formData.employee}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="">-- Choose Employee --</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.name}>
                {employee.name}
              </option>
            ))}
          </select>

          {/* Employee Preview */}
          {selectedEmployee && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "500",
                }}
              >
                {selectedEmployee.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="font-medium">{selectedEmployee.name}</div>
                <div className="text-sm text-gray-600">
                  {selectedEmployee.department &&
                    `${selectedEmployee.department} • `}
                  {selectedEmployee.employee_id &&
                    `ID: ${selectedEmployee.employee_id}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Violation Type Selection */}
        <div className="form-group">
          <label className="form-label">Violation Type *</label>
          <select
            name="violation_type_id"
            value={formData.violation_type_id}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="">-- Select Type --</option>
            {violationTypes.map((violation) => (
              <option key={violation.id} value={violation.id}>
                {violation.name}
              </option>
            ))}
          </select>

          {/* Violation Preview */}
          {selectedViolation && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#fef2f2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {selectedViolation.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{selectedViolation.name}</div>
                  <div className="text-sm text-gray-600">
                    Severity: {selectedViolation.severity} • Default: ₨
                    {selectedViolation.default_amount}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Amount and Evidence */}
      <div className="form-grid gap-6">
        {/* Fine Amount */}
        <div className="form-group">
          <label className="form-label">Fine Amount (PKR) *</label>
          <div className="relative">
            <DollarSign
              size={20}
              className="absolute left-3 top-1/2  translate-top text-gray-400"
            />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="form-input pl-10"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 mt-2">
            {[100, 250, 500, 1000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: amount.toString(),
                  }))
                }
                className="btn btn-sm btn-secondary"
              >
                ₨{amount}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Violation Details */}
      <div className="form-group">
        <label className="form-label">Violation Details *</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleInputChange}
          className="form-input form-textarea"
          placeholder="Describe the violation..."
          rows="3"
          required
        />

        {/* Suggestions */}
        {selectedViolation &&
          selectedViolation.suggestions &&
          selectedViolation.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {selectedViolation.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="btn btn-sm btn-secondary text-xs"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Additional Notes */}
      <div className="form-group">
        <label className="form-label">Additional Notes (Optional)</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className="form-input form-textarea"
          placeholder="Any additional comments..."
          rows="2"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Issuing Fine...
            </div>
          ) : (
            <>
              <FileText size={20} />
              Issue Fine & Generate Receipt
            </>
          )}
        </button>

        <button type="button" onClick={clearForm} className="btn btn-secondary">
          Clear Form
        </button>
      </div>
    </form>
  );
}

export default FineForm;
