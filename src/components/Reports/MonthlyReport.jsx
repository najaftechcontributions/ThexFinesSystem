import React from "react";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";

function MonthlyReport({ data }) {
  const formatCurrency = (amount) => `₨${amount.toFixed(2)}`;

  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + "-01");
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const getMonthlyTrend = () => {
    if (data.length < 2) return "neutral";
    const latest = data[0];
    const previous = data[1];
    return latest.total > previous.total ? "up" : "down";
  };

  const getTotalStats = () => {
    return {
      totalAmount: data.reduce((sum, month) => sum + month.total, 0),
      totalCount: data.reduce((sum, month) => sum + month.count, 0),
      avgPerMonth:
        data.length > 0
          ? data.reduce((sum, month) => sum + month.total, 0) / data.length
          : 0,
    };
  };

  const trend = getMonthlyTrend();
  const stats = getTotalStats();

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={20} />
            Monthly Report
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          No monthly data available
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar size={20} />
          Monthly Fine Report
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Monthly breakdown showing trends and patterns over time
        </p>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Amount</p>
              <p className="text-xl font-bold text-blue-900">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
            <BarChart3 className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Fines</p>
              <p className="text-xl font-bold text-green-900">
                {stats.totalCount}
              </p>
            </div>
            <Calendar className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Avg per Month</p>
              <p className="text-xl font-bold text-purple-900">
                {formatCurrency(stats.avgPerMonth)}
              </p>
            </div>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Monthly Data Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Fine Count</th>
              <th>Total Amount</th>
              <th>Average Fine</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((monthData, index) => {
              const prevMonth = data[index + 1];
              let monthTrend = "neutral";

              if (prevMonth) {
                monthTrend =
                  monthData.total > prevMonth.total
                    ? "up"
                    : monthData.total < prevMonth.total
                      ? "down"
                      : "neutral";
              }

              const avgFine =
                monthData.count > 0 ? monthData.total / monthData.count : 0;

              return (
                <tr
                  key={monthData.month}
                  className={index === 0 ? "bg-blue-50" : ""}
                >
                  <td>
                    <div className="font-medium">
                      {formatMonth(monthData.month)}
                      {index === 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Latest
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {monthData.count}
                    </span>
                  </td>

                  <td>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(monthData.total)}
                    </span>
                  </td>

                  <td>
                    <span className="text-gray-700">
                      {formatCurrency(avgFine)}
                    </span>
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      {monthTrend === "up" && (
                        <>
                          <TrendingUp size={16} className="text-red-500" />
                          <span className="text-red-600 text-sm">
                            Increased
                          </span>
                        </>
                      )}
                      {monthTrend === "down" && (
                        <>
                          <TrendingUp
                            size={16}
                            className="text-green-500 rotate-180"
                          />
                          <span className="text-green-600 text-sm">
                            Decreased
                          </span>
                        </>
                      )}
                      {monthTrend === "neutral" && (
                        <span className="text-gray-500 text-sm">No change</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Trend Analysis */}
      {data.length > 1 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">Trend Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  trend === "up" ? "bg-red-100" : "bg-green-100"
                }`}
              >
                <TrendingUp
                  size={16}
                  className={`${
                    trend === "up"
                      ? "text-red-500"
                      : "text-green-500 rotate-180"
                  }`}
                />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {trend === "up" ? "Fines Increasing" : "Fines Decreasing"}
                </div>
                <div className="text-xs text-gray-600">
                  Compared to previous month
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Peak Month:</strong>{" "}
              {data.reduce(
                (max, month) => (month.total > max.total ? month : max),
                data[0],
              ).month &&
                formatMonth(
                  data.reduce(
                    (max, month) => (month.total > max.total ? month : max),
                    data[0],
                  ).month,
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyReport;
