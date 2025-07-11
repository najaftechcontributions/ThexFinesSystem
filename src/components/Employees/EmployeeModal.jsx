import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import Modal from "../UI/Modal";

function EmployeeModal({ isOpen, onClose, employee, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    employee_id: "",
    phone: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        department: employee.department || "",
        employee_id: employee.employee_id || "",
        phone: employee.phone || "",
        email: employee.email || "",
      });
    } else {
      setFormData({
        name: "",
        department: "",
        employee_id: "",
        phone: "",
        email: "",
      });
    }
  }, [employee, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter employee name");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("department", formData.department.trim());
      submitData.append("employee_id", formData.employee_id.trim());
      submitData.append("phone", formData.phone.trim());
      submitData.append("email", formData.email.trim());

      await onSubmit(submitData);

      // Reset form
      setFormData({
        name: "",
        department: "",
        employee_id: "",
        phone: "",
        email: "",
      });
    } catch (error) {
      console.error("Error submitting employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? "Edit Employee" : "Add New Employee"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Details */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Employee name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input
              type="text"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              className="form-input"
              placeholder="EMP001"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="form-input"
              placeholder="HR, IT, Finance, etc."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="+92-300-1234567"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            placeholder="employee@company.com"
          />
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
                {employee ? "Update" : "Create"} Employee
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EmployeeModal;
