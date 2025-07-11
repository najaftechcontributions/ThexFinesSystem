import React from "react";
import { Edit, Trash2, AlertTriangle } from "lucide-react";

function ViolationCard({ violation, isAuthenticated, onEdit, onDelete }) {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow border-l-4 border-blue-500">
      <div className="card-header">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">
              {violation.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {violation.description}
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(violation)}
              className="btn btn-sm btn-primary"
              title="Edit Violation"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(violation)}
              className="btn btn-sm btn-danger"
              title="Delete Violation"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Amount and Severity */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">Default Amount:</span>
            <span className="ml-2 font-bold text-lg text-green-600">
              ₨{violation.default_amount?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-gray-400" />
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}
            >
              {violation.severity || "Medium"}
            </span>
          </div>
        </div>

        {/* Suggestions */}
        {violation.suggestions && violation.suggestions.length > 0 && (
          <div>
            <span className="text-sm text-gray-600">Common Examples:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {violation.suggestions.slice(0, 3).map((suggestion, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {suggestion}
                </span>
              ))}
              {violation.suggestions.length > 3 && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  +{violation.suggestions.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViolationCard;
