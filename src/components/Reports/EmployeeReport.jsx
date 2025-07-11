import React from "react";
import { Users, TrendingDown, Mail, Award } from "lucide-react";

function EmployeeReport({ employees, allEmployees }) {
  const formatCurrency = (amount) => `₨${amount.toFixed(2)}`;

  const getEmployee = (employeeName) => {
    return allEmployees.find((emp) => emp.name === employeeName);
  };

  const getTopPerformers = () => {
    // Employees with no fines are top performers
    const employeesWithFines = employees.map((emp) => emp.employee);
    return allEmployees.filter((emp) => !employeesWithFines.includes(emp.name));
  };

  const topPerformers = getTopPerformers();

  if (employees.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users size={20} />
            Employee Report
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h4 className="text-lg font-medium text-green-600 mb-2">
            Perfect Record!
          </h4>
          <p className="text-gray-600">No employee fines recorded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users size={20} />
          Employee Fine Report
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Detailed breakdown by employee with totals and statistics
        </p>
      </div>

      {/* Top Performers Section */}
      {topPerformers.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
            <Award size={18} />
            Top Performers (No Fines)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topPerformers.slice(0, 6).map((employee) => (
              <div
                key={employee.id}
                className="flex items-center gap-2 bg-white p-2 rounded border"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-medium">
                  {employee.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="text-sm font-medium text-green-700">
                    {employee.name}
                  </div>
                  <div className="text-xs text-green-600">
                    {employee.department || "No Dept"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {topPerformers.length > 6 && (
            <p className="text-sm text-green-600 mt-2">
              +{topPerformers.length - 6} more employees with perfect records
            </p>
          )}
        </div>
      )}

      {/* Employee Fine Details */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Total Fines</th>
              <th>Fine Count</th>
              <th>Average Fine</th>
              <th>Last Fine</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((empData) => {
              const employee = getEmployee(empData.employee);
              const riskLevel =
                empData.fine_count > 5
                  ? "high"
                  : empData.fine_count > 2
                    ? "medium"
                    : "low";

              return (
                <tr key={empData.employee}>
                  {/* Employee Info */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                        {empData.employee?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-medium">{empData.employee}</div>
                        {employee?.email && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={12} />
                            {employee.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td>
                    <span className="text-sm text-gray-700">
                      {employee?.department || "Not specified"}
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td>
                    <span className="font-bold text-lg text-red-600">
                      {formatCurrency(empData.total_amount)}
                    </span>
                  </td>

                  {/* Fine Count */}
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        riskLevel === "high"
                          ? "bg-red-100 text-red-800"
                          : riskLevel === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {empData.fine_count}
                    </span>
                  </td>

                  {/* Average Fine */}
                  <td>
                    <span className="text-gray-700">
                      {formatCurrency(empData.avg_amount)}
                    </span>
                  </td>

                  {/* Last Fine */}
                  <td>
                    <span className="text-sm text-gray-600">
                      {empData.last_fine
                        ? new Date(empData.last_fine).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </td>

                  {/* Risk Status */}
                  <td>
                    <div className="flex items-center gap-2">
                      <TrendingDown
                        size={16}
                        className={
                          riskLevel === "high"
                            ? "text-red-500"
                            : riskLevel === "medium"
                              ? "text-yellow-500"
                              : "text-green-500"
                        }
                      />
                      <span
                        className={`text-sm font-medium ${
                          riskLevel === "high"
                            ? "text-red-600"
                            : riskLevel === "medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {riskLevel === "high"
                          ? "High Risk"
                          : riskLevel === "medium"
                            ? "Medium Risk"
                            : "Low Risk"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {employees.filter((emp) => emp.fine_count > 5).length}
          </div>
          <div className="text-sm text-red-700">High Risk Employees</div>
        </div>

        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {
              employees.filter(
                (emp) => emp.fine_count > 2 && emp.fine_count <= 5,
              ).length
            }
          </div>
          <div className="text-sm text-yellow-700">Medium Risk Employees</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {topPerformers.length}
          </div>
          <div className="text-sm text-green-700">Perfect Record Employees</div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeReport;
