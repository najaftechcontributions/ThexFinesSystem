import React from "react";
import { Edit, Trash2, Phone } from "lucide-react";

function EmployeeCard({ employee, onEdit, onDelete, isAuthenticated }) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center gap-3">
          <div className="avatar bg-blue-100 text-blue-600 flex items-center justify-center">
            {employee.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{employee.name}</h3>
            <p className="text-gray-600">{employee.department}</p>
            {employee.employee_id && (
              <p className="text-sm text-gray-500">
                ID: {employee.employee_id}
              </p>
            )}
          </div>
          {isAuthenticated && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(employee)}
                className="btn btn-sm btn-secondary"
                title="Edit Employee"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(employee)}
                className="btn btn-sm btn-danger"
                title="Delete Employee"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-4 space-y-2">
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={14} />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeCard;
