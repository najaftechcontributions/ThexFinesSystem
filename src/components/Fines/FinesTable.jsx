import React, { useState } from "react";
import { Edit, Trash2, Printer, Mail } from "lucide-react";
import { finesAPI } from "../../services/api";
import Modal from "../UI/Modal";
import FineEditForm from "./FineEditForm";
import toast from "react-hot-toast";

function FinesTable({
  fines,
  employees,
  violationTypes,
  isAuthenticated,
  onUpdate,
}) {
  const [editingFine, setEditingFine] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getEmployee = (employeeName) => {
    return employees.find((emp) => emp.name === employeeName);
  };

  const getViolationType = (reason) => {
    const reasonParts = reason.split(": ");
    const violationTypeName = reasonParts.length > 1 ? reasonParts[0] : "Other";
    return violationTypes.find((vt) => vt.name === violationTypeName);
  };

  const getActualReason = (reason) => {
    const reasonParts = reason.split(": ");
    return reasonParts.length > 1 ? reasonParts.slice(1).join(": ") : reason;
  };

  const handleEdit = (fine) => {
    setEditingFine(fine);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (fine) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this fine? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await finesAPI.delete(fine.id);
      toast.success("Fine deleted successfully");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error deleting fine:", error);
      toast.error("Failed to delete fine");
    }
  };

  const handlePrintReceipt = (fine) => {
    const employee = fine.employee_obj || getEmployee(fine.employee);
    const violation = getViolationType(fine.reason);
    const actualReason = getActualReason(fine.reason);

    const printContent = `
      <html>
        <head>
          <title>Fine Receipt - ${fine.employee}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            .receipt { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .title { font-size: 16px; margin: 5px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; border-bottom: 1px dotted #ccc; }
            .total { font-weight: bold; font-size: 16px; margin-top: 15px; padding-top: 10px; border-top: 2px solid #000; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">ThexSol Fine Tracker</div>
              <div class="title">FINE RECEIPT</div>
              <div>Receipt #${fine.id}</div>
            </div>
            <div class="row"><span><strong>Employee:</strong></span><span>${fine.employee}</span></div>
            <div class="row"><span><strong>Violation:</strong></span><span>${violation?.name || "Other"}</span></div>
            <div class="row"><span><strong>Details:</strong></span><span>${actualReason}</span></div>
            ${fine.notes ? `<div class="row"><span><strong>Notes:</strong></span><span>${fine.notes}</span></div>` : ""}
            <div class="row"><span><strong>Date:</strong></span><span>${new Date(fine.date).toLocaleString()}</span></div>
            <div class="total">
              <div class="row"><span><strong>FINE AMOUNT:</strong></span><span><strong>₨${parseFloat(fine.amount).toFixed(2)}</strong></span></div>
            </div>
            <div class="footer">
              <p>Keep this receipt for your records</p>
              <p>ThexSol Office Management System</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function(){ window.close(); };
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleEmailReceipt = async (fine) => {
    const employee = fine.employee_obj || getEmployee(fine.employee);
    if (!employee || !employee.email) {
      toast.error("Employee email not found");
      return;
    }

    if (!window.confirm(`Send receipt to ${employee.email}?`)) {
      return;
    }

    try {
      await finesAPI.emailReceipt(fine.id);
      toast.success("Receipt emailed successfully!");
    } catch (error) {
      console.error("Error emailing receipt:", error);
      toast.error("Failed to send email");
    }
  };

  const handleEditSubmit = async (fineData) => {
    try {
      await finesAPI.update(editingFine.id, fineData);
      toast.success("Fine updated successfully");
      setIsEditModalOpen(false);
      setEditingFine(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating fine:", error);
      toast.error("Failed to update fine");
    }
  };

  if (fines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No fines recorded
        </h3>
        <p className="text-gray-600">
          {isAuthenticated
            ? "Get started by issuing your first fine above"
            : "No fine records to display"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto overflow_scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Violation</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fines.map((fine) => {
              const employee = fine.employee_obj || getEmployee(fine.employee);
              const violation = getViolationType(fine.reason);
              const actualReason = getActualReason(fine.reason);

              return (
                <tr key={fine.id}>
                  {/* Employee Cell */}
                  <td>
                    <div className="employee-cell">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        {fine.employee?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-medium">
                          {fine.employee || "Unknown Employee"}
                        </div>
                        {employee?.department && (
                          <div className="text-sm text-gray-600">
                            {employee.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Violation Cell */}
                  <td>
                    <div className="violation-cell">
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
                        {(violation?.name || "Other")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">
                          {violation?.name || "Other"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Severity: {violation?.severity || "Medium"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Reason Cell */}
                  <td>
                    <div className="max-w-xs">
                      <div className="truncate" title={actualReason}>
                        {actualReason}
                      </div>
                      {fine.notes && (
                        <div
                          className="text-sm text-gray-600 truncate"
                          title={fine.notes}
                        >
                          Note: {fine.notes}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Amount Cell */}
                  <td>
                    <span className="font-medium text-green-600">
                      ₨{parseFloat(fine.amount).toFixed(2)}
                    </span>
                  </td>

                  {/* Date Cell */}
                  <td>
                    <div className="text-sm">
                      {new Date(fine.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(fine.date).toLocaleTimeString()}
                    </div>
                  </td>

                  {/* Actions Cell */}
                  <td>
                    <div className="flex gap-1">
                      {/* Print Receipt */}
                      <button
                        onClick={() => handlePrintReceipt(fine)}
                        className="btn btn-sm btn-secondary"
                        title="Print Receipt"
                      >
                        <Printer size={16} />
                      </button>


                      {/* Admin Actions */}
                      {isAuthenticated && (
                        <>
                          <button
                            onClick={() => handleEdit(fine)}
                            className="btn btn-sm btn-primary"
                            title="Edit Fine"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(fine)}
                            className="btn btn-sm btn-danger"
                            title="Delete Fine"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFine(null);
        }}
        title="Edit Fine"
        size="lg"
      >
        {editingFine && (
          <FineEditForm
            fine={editingFine}
            employees={employees}
            violationTypes={violationTypes}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingFine(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}

export default FinesTable;
