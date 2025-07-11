import React from "react";
import { TrendingUp, Users, AlertTriangle, DollarSign } from "lucide-react";

function ReportSummary({ data }) {
  const formatCurrency = (amount) => `₨${amount.toFixed(2)}`;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp size={20} />
          Overall Summary
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Complete overview of fine management statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Fines */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Total Fines Issued
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {data.totalFines || 0}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {data.totalFines > 0
                  ? "Violations recorded"
                  : "No violations yet"}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <AlertTriangle className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Amount</p>
              <p className="text-3xl font-bold text-green-900">
                {formatCurrency(data.totalAmount || 0)}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Total penalties collected
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <DollarSign className="text-green-700" size={24} />
            </div>
          </div>
        </div>

        {/* Average Fine */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Average Fine
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {formatCurrency(data.averageAmount || 0)}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Per violation average
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <TrendingUp className="text-purple-700" size={24} />
            </div>
          </div>
        </div>

        {/* Total Employees */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Total Employees
              </p>
              <p className="text-3xl font-bold text-orange-900">
                {data.totalEmployees || 0}
              </p>
              <p className="text-xs text-orange-700 mt-1">In the system</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-full">
              <Users className="text-orange-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">Quick Stats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {data.totalViolationTypes || 0}
            </div>
            <div className="text-xs text-gray-600">Violation Types</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {data.totalFines > 0
                ? Math.round((data.totalAmount / data.totalFines) * 100) / 100
                : 0}
            </div>
            <div className="text-xs text-gray-600">Avg per Fine</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {data.totalEmployees > 0
                ? Math.round((data.totalFines / data.totalEmployees) * 100) /
                  100
                : 0}
            </div>
            <div className="text-xs text-gray-600">Fines per Employee</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {data.totalEmployees > 0
                ? Math.round((data.totalAmount / data.totalEmployees) * 100) /
                  100
                : 0}
            </div>
            <div className="text-xs text-gray-600">Amount per Employee</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportSummary;
