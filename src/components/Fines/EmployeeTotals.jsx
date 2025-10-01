import React, { useState, useEffect } from "react";
import { Filter, TrendingUp } from "lucide-react";
import { employeesAPI } from "../../services/api";
import toast from "react-hot-toast";

function EmployeeTotals({ employees, onFilterByEmployee }) {
  const [employeeTotals, setEmployeeTotals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployeeTotals();
  }, []);

  const loadEmployeeTotals = async () => {
    try {
      setIsLoading(true);
      const response = await employeesAPI.getTotals();
      setEmployeeTotals(response.data);
    } catch (error) {
      console.error("Error loading employee totals:", error);
      toast.error("Failed to load employee totals");
    } finally {
      setIsLoading(false);
    }
  };



  const getEmployee = (employeeName) => {
    return employees.find((emp) => emp.name === employeeName);
  };

  if (isLoading) {
    return (
      <div className="card mt-3">
        <div className="card-header">
          <h4 className="text-lg font-semibold">Employee Fine Totals</h4>
        </div>
        <div className="flex justify-center py-8">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (employeeTotals.length === 0) {
    return (
      <div className="card mt-3">
        <div className="card-header">
          <h4 className="text-lg font-semibold">Employee Fine Totals</h4>
        </div>
        <div className="text-center py-8 text-gray-500">
          No employee fine data available
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-3">
      <div className="card-header">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp size={20} />
          Employee Fine Totals
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Summary of fines by employee with totals and statistics
        </p>
      </div>

      <div className="overflow-x-auto overflow_scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Total Fines</th>
              <th>Fine Count</th>
              <th>Average Fine</th>
              <th>First Fine</th>
              <th>Last Fine</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employeeTotals.map((empTotal) => {
              const employee = getEmployee(empTotal.employee);
              const avatarStyle = {
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor:
                  empTotal.fine_count > 0 ? "#ef4444" : "#22c55e",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "500",
                border: "none",
              };

              return (
                <tr key={empTotal.employee}>
                  {/* Employee Cell */}
                  <td>
                    <div className="employee-cell">
                      <div style={avatarStyle}>
                        {empTotal.employee?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-medium">{empTotal.employee}</div>
                        {employee?.department && (
                          <div className="text-sm text-gray-600">
                            {employee.department}
                          </div>
                        )}
                        {empTotal.fine_count === 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            Perfect Record
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Total Amount */}
                  <td>
                    <span
                      className={`font-bold text-lg ${empTotal.total_amount > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      ₨{empTotal.total_amount.toFixed(2)}
                    </span>
                  </td>

                  {/* Fine Count */}
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        empTotal.fine_count > 0
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {empTotal.fine_count}
                    </span>
                  </td>

                  {/* Average Fine */}
                  <td>
                    <span className="text-gray-700">
                      ₨{empTotal.avg_amount.toFixed(2)}
                    </span>
                  </td>

                  {/* First Fine */}
                  <td>
                    <div className="text-sm">
                      {empTotal.first_fine
                        ? new Date(empTotal.first_fine).toLocaleDateString()
                        : "-"}
                    </div>
                  </td>

                  {/* Last Fine */}
                  <td>
                    <div className="text-sm">
                      {empTotal.last_fine
                        ? new Date(empTotal.last_fine).toLocaleDateString()
                        : "-"}
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex gap-2">
                      {/* Filter Button */}
                      <button
                        onClick={() => {
                          const emp = getEmployee(empTotal.employee);
                          if (emp) {
                            onFilterByEmployee(emp.id);
                          }
                        }}
                        className="btn btn-sm btn-secondary"
                        title="Filter by this employee"
                      >
                        <Filter size={16} />
                      </button>


                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Total Employees</div>
            <div className="text-xl font-bold text-blue-600">
              {employeeTotals.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Employees with Fines</div>
            <div className="text-xl font-bold text-red-600">
              {employeeTotals.filter((emp) => emp.fine_count > 0).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Perfect Record</div>
            <div className="text-xl font-bold text-green-600">
              {employeeTotals.filter((emp) => emp.fine_count === 0).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Fine Amount</div>
            <div className="text-xl font-bold text-purple-600">
              ₨
              {employeeTotals
                .reduce((sum, emp) => sum + emp.total_amount, 0)
                .toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeTotals;
