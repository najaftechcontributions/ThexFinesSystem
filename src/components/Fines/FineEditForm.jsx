import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

function FineEditForm({ fine, employees, violationTypes, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    employee: "",
    violation_type_id: "",
    reason: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    if (fine) {
      // Extract the reason without violation type prefix
      const reasonParts = fine.reason.split(": ");
      const actualReason =
        reasonParts.length > 1 ? reasonParts.slice(1).join(": ") : fine.reason;

      setFormData({
        employee: fine.employee || "",
        violation_type_id: fine.violation_type_id || "",
        reason: actualReason,
        amount: fine.amount || "",
        notes: fine.notes || "",
      });
    }
  }, [fine]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-fill amount when violation type changes
    if (name === "violation_type_id") {
      const violation = violationTypes.find((vt) => vt.id === parseInt(value));
      if (violation && violation.default_amount && !formData.amount) {
        setFormData((prev) => ({
          ...prev,
          amount: violation.default_amount.toString(),
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Find selected employee ID
    const selectedEmployee = employees.find(
      (emp) => emp.name === formData.employee,
    );

    if (
      !selectedEmployee ||
      !formData.violation_type_id ||
      !formData.reason ||
      !formData.amount
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid fine amount");
      return;
    }

    const violation = violationTypes.find(
      (vt) => vt.id === parseInt(formData.violation_type_id),
    );
    const violationTypeName = violation ? violation.name : "Unknown Violation";

    const submitData = {
      employee_id: selectedEmployee.id,
      violation_type_id: formData.violation_type_id,
      reason: `${violationTypeName}: ${formData.reason}`,
      amount: formData.amount,
      notes: formData.notes,
    };

    onSubmit(submitData);
  };

  const selectedViolation = violationTypes.find(
    (vt) => vt.id === parseInt(formData.violation_type_id),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee and Violation Selection */}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Employee *</label>
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
        </div>

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
        </div>
      </div>

      {/* Amount */}
      <div className="form-group">
        <label className="form-label">Amount (PKR) *</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          className="form-input"
          placeholder="0.00"
          step="0.01"
          min="0"
          required
        />
        {selectedViolation && (
          <p className="text-sm text-gray-600 mt-1">
            Default amount for {selectedViolation.name}: ₨
            {selectedViolation.default_amount}
          </p>
        )}
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
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, reason: suggestion }))
                    }
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
        <label className="form-label">Additional Notes</label>
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
      <div className="flex gap-4 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          <X size={20} />
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          <Save size={20} />
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default FineEditForm;
