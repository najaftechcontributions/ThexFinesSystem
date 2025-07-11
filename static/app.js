// Global variables
const isAdmin = window.location.pathname !== "/guest";
let allFines = [];
let filteredFines = [];
let currentFineId = null;
let violationTypes = [];

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchFines();
  loadEmployees();
  loadViolationTypes();
});

// Load violation types from database
async function loadViolationTypes() {
  try {
    const response = await fetch("/get_violation_types");
    violationTypes = await response.json();
    populateViolationTypes();
  } catch (error) {
    console.error("Error loading violation types:", error);
  }
}

// Populate violation types dropdown
function populateViolationTypes() {
  const violationSelect = document.getElementById("violationType");
  if (!violationSelect) return;

  violationSelect.innerHTML = '<option value="">-- Select Type --</option>';

  violationTypes.forEach(function (type) {
    const option = document.createElement("option");
    option.value = type.id;
    option.textContent = type.name;
    option.dataset.defaultAmount = type.default_amount;
    option.dataset.suggestions = JSON.stringify(type.suggestions);
    violationSelect.appendChild(option);
  });
}

// Update reason suggestions based on violation type
function updateReasonSuggestions() {
  const violationSelect = document.getElementById("violationType");
  const selectedOption = violationSelect.options[violationSelect.selectedIndex];
  const suggestionsContainer = document.getElementById("reasonSuggestions");
  const amountInput = document.getElementById("amount");

  suggestionsContainer.innerHTML = "";

  if (selectedOption && selectedOption.value) {
    // Set default amount
    const defaultAmount = selectedOption.dataset.defaultAmount;
    if (defaultAmount && !amountInput.value) {
      amountInput.value = parseFloat(defaultAmount).toFixed(2);

      // Visual feedback for amount buttons
      document.querySelectorAll(".amount-btn").forEach((btn) => {
        btn.classList.remove("selected");
        if (btn.textContent.includes(defaultAmount)) {
          btn.classList.add("selected");
        }
      });
    }

    // Show suggestions
    try {
      const suggestions = JSON.parse(
        selectedOption.dataset.suggestions || "[]",
      );

      suggestions.forEach(function (suggestion) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "suggestion-btn";
        button.textContent = suggestion;
        button.onclick = function () {
          document.getElementById("reason").value = suggestion;
          // Hide suggestions after selection
          suggestionsContainer.style.display = "none";
          setTimeout(() => (suggestionsContainer.style.display = "block"), 100);
        };
        suggestionsContainer.appendChild(button);
      });
    } catch (error) {
      console.error("Error parsing suggestions:", error);
    }
  }
}

// Set predefined amount
function setAmount(amount) {
  document.getElementById("amount").value = amount;

  // Visual feedback
  document
    .querySelectorAll(".amount-btn")
    .forEach((btn) => btn.classList.remove("selected"));
  event.target.classList.add("selected");
}

// Clear form
function clearForm() {
  document.getElementById("employee").value = "";
  document.getElementById("violationType").value = "";
  document.getElementById("reason").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("notes").value = "";
  document.getElementById("reasonSuggestions").innerHTML = "";

  // Update preview
  document.getElementById("previewName").textContent = "No employee selected";

  // Hide receipt if visible
  document.getElementById("receipt").classList.add("hidden");

  // Reset amount buttons
  document
    .querySelectorAll(".amount-btn")
    .forEach((btn) => btn.classList.remove("selected"));
}

// Enhanced receipt generation
async function generateReceipt() {
  const employee = document.getElementById("employee").value;
  const violationType = document.getElementById("violationType").value;
  const reason = document.getElementById("reason").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const notes = document.getElementById("notes").value;

  // Enhanced validation
  if (!employee) {
    alert("Please select an employee.");
    document.getElementById("employee").focus();
    return;
  }

  if (!violationType) {
    alert("Please select a violation type.");
    document.getElementById("violationType").focus();
    return;
  }

  if (!reason.trim()) {
    alert("Please provide violation details.");
    document.getElementById("reason").focus();
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid fine amount.");
    document.getElementById("amount").focus();
    return;
  }

  const res = await fetch("/submit_fine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employee: employee,
      reason: `${getViolationTypeLabel(violationType)}: ${reason}`,
      amount: amount,
    }),
  });

  const data = await res.json();
  if (data.status === "success") {
    // Update receipt display with enhanced information
    document.getElementById("rEmployee").innerText = employee;
    document.getElementById("rViolationType").innerText =
      getViolationTypeLabel(violationType);
    document.getElementById("rReason").innerText = reason;
    document.getElementById("rAmount").innerText = amount.toFixed(2);
    document.getElementById("rDate").innerText = new Date().toLocaleString();

    // Handle notes
    if (notes.trim()) {
      document.getElementById("rNotes").innerText = notes;
      document.getElementById("rNotesRow").style.display = "flex";
    } else {
      document.getElementById("rNotesRow").style.display = "none";
    }

    document.getElementById("receipt").classList.remove("hidden");

    // Clear form after successful submission
    clearForm();

    // Refresh data
    fetchFines();

    // Get the last inserted fine ID
    setTimeout(function () {
      if (allFines.length > 0) {
        currentFineId = Math.max.apply(
          Math,
          allFines.map(function (f) {
            return f.id;
          }),
        );
      }
    }, 500);

    // Show success animation
    showSuccessAnimation();
  } else {
    alert("Error submitting fine: " + (data.message || "Unknown error"));
  }
}

// Get violation type label
function getViolationTypeLabel(typeId) {
  const violationType = violationTypes.find((vt) => vt.id == typeId);
  return violationType ? violationType.name : "Unknown Violation";
}

// Show success animation
function showSuccessAnimation() {
  const receipt = document.getElementById("receipt");
  receipt.style.animation = "slideInUp 0.5s ease-out";

  setTimeout(() => {
    receipt.style.animation = "";
  }, 500);
}

// Enhanced print functions
function printQuickReceipt() {
  const employee = document.getElementById("rEmployee").innerText;
  const violationType = document.getElementById("rViolationType").innerText;
  const reason = document.getElementById("rReason").innerText;
  const amount = document.getElementById("rAmount").innerText;
  const date = document.getElementById("rDate").innerText;
  const notes = document.getElementById("rNotes").innerText;

  const printContent = `
    <html>
      <head>
        <title>Fine Receipt - ${employee}</title>
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
            <div>Receipt #${currentFineId || "N/A"}</div>
          </div>
          <div class="row"><span><strong>Employee:</strong></span><span>${employee}</span></div>
          <div class="row"><span><strong>Type:</strong></span><span>${violationType}</span></div>
          <div class="row"><span><strong>Details:</strong></span><span>${reason}</span></div>
          ${notes ? `<div class="row"><span><strong>Notes:</strong></span><span>${notes}</span></div>` : ""}
          <div class="row"><span><strong>Date:</strong></span><span>${date}</span></div>
          <div class="total">
            <div class="row"><span><strong>FINE AMOUNT:</strong></span><span><strong>₨${amount}</strong></span></div>
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
}

function printFullReceipt() {
  if (currentFineId) {
    window.open("/print_receipt/" + currentFineId, "_blank");
  } else {
    alert("Receipt ID not found. Please try the quick print option.");
  }
}

// Fetch all fines from server
async function fetchFines() {
  try {
    const response = await fetch("/get_fines");
    allFines = await response.json();
    applyFilters();
    updateGrandTotal();
  } catch (error) {
    console.error("Error fetching fines:", error);
  }
}

// Apply filters and sorting to the fines table
function applyFilters() {
  const employeeFilter = document.getElementById("filterSelect").value;
  const sortOption = document.getElementById("sortSelect").value;
  const minAmount = parseFloat(document.getElementById("minAmount").value) || 0;
  const maxAmount =
    parseFloat(document.getElementById("maxAmount").value) || Infinity;

  // Filter fines
  filteredFines = allFines.filter(function (fine) {
    const matchesEmployee = !employeeFilter || fine.employee === employeeFilter;
    const matchesAmount = fine.amount >= minAmount && fine.amount <= maxAmount;
    return matchesEmployee && matchesAmount;
  });

  // Sort fines
  filteredFines.sort(function (a, b) {
    switch (sortOption) {
      case "date-desc":
        return new Date(b.date) - new Date(a.date);
      case "date-asc":
        return new Date(a.date) - new Date(b.date);
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      case "employee":
        return a.employee.localeCompare(b.employee);
      default:
        return 0;
    }
  });

  renderFinesTable();
  updateFilteredTotal();
}

// Render the fines table with current filtered data
function renderFinesTable() {
  const table = document.querySelector("#fineTable tbody");
  table.innerHTML = "";

  filteredFines.forEach(function (f) {
    const row = table.insertRow();
    row.insertCell(0).innerText = f.employee;

    // Reason cell
    const reasonCell = row.insertCell(1);
    if (isAdmin) {
      const reasonInput = document.createElement("input");
      reasonInput.value = f.reason;
      reasonInput.disabled = true;
      reasonInput.className = "table-input";
      reasonCell.appendChild(reasonInput);
    } else {
      reasonCell.innerText = f.reason;
    }

    // Amount cell
    const amountCell = row.insertCell(2);
    if (isAdmin) {
      const amountInput = document.createElement("input");
      amountInput.type = "number";
      amountInput.value = parseFloat(f.amount).toFixed(2);
      amountInput.disabled = true;
      amountInput.className = "table-input";
      amountCell.appendChild(amountInput);
    } else {
      amountCell.innerHTML = `<span class="amount-display">₨${parseFloat(f.amount).toFixed(2)}</span>`;
    }

    row.insertCell(3).innerText = f.date;

    // Actions cell
    const actionCell = row.insertCell(4);

    // Print receipt button (available to all users)
    const printBtn = document.createElement("button");
    printBtn.innerHTML = '<span class="btn-icon">🖨️</span>';
    printBtn.title = "Print Receipt";
    printBtn.className = "action-btn print-receipt-btn";
    printBtn.onclick = function () {
      window.open("/print_receipt/" + f.id, "_blank");
    };
    actionCell.appendChild(printBtn);

    // Admin-only buttons
    if (isAdmin) {
      const editBtn = document.createElement("button");
      editBtn.innerHTML = '<span class="btn-icon">✏️</span> Edit';
      editBtn.className = "action-btn edit-btn";
      editBtn.onclick = function () {
        const editing = editBtn.textContent.includes("Save");
        const reasonInput = reasonCell.querySelector("input");
        const amountInput = amountCell.querySelector("input");

        if (editing) {
          updateFine(f.id, reasonInput.value, parseFloat(amountInput.value));
          reasonInput.disabled = true;
          amountInput.disabled = true;
          editBtn.innerHTML = '<span class="btn-icon">✏️</span> Edit';
        } else {
          reasonInput.disabled = false;
          amountInput.disabled = false;
          editBtn.innerHTML = '<span class="btn-icon">💾</span> Save';
        }
      };
      actionCell.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.innerHTML = '<span class="btn-icon">🗑️</span>';
      delBtn.title = "Delete Fine";
      delBtn.className = "action-btn delete-btn";
      delBtn.onclick = function () {
        deleteFine(f.id);
      };
      actionCell.appendChild(delBtn);
    }
  });

  document.getElementById("recordCount").innerText = filteredFines.length;
}

// Update filtered total display
function updateFilteredTotal() {
  const total = filteredFines.reduce(function (sum, fine) {
    return sum + parseFloat(fine.amount);
  }, 0);
  document.getElementById("filteredTotal").innerText = total.toFixed(2);
}

// Update grand total display
function updateGrandTotal() {
  const total = allFines.reduce(function (sum, fine) {
    return sum + parseFloat(fine.amount);
  }, 0);
  document.getElementById("grandTotal").innerText = total.toFixed(2);
}

// Reset all filters to default values
function resetFilters() {
  document.getElementById("filterSelect").value = "";
  document.getElementById("sortSelect").value = "date-desc";
  document.getElementById("minAmount").value = "";
  document.getElementById("maxAmount").value = "";
  applyFilters();
}

// Toggle employee totals section
async function toggleEmployeeTotals() {
  const section = document.getElementById("employeeTotalsSection");
  const button = document.getElementById("totalsToggle");

  if (section.classList.contains("hidden")) {
    await loadEmployeeTotals();
    section.classList.remove("hidden");
    button.innerText = "Hide Employee Totals";
  } else {
    section.classList.add("hidden");
    button.innerText = "Show Employee Totals";
  }
}

// Load employee totals data
async function loadEmployeeTotals() {
  try {
    const response = await fetch("/get_employee_totals");
    const totals = await response.json();

    const table = document.querySelector("#employeeTotalsTable tbody");
    table.innerHTML = "";

    totals.forEach(function (emp) {
      const row = table.insertRow();
      row.insertCell(0).innerHTML = "<strong>" + emp.employee + "</strong>";
      row.insertCell(1).innerHTML =
        "<strong>₨" + emp.total_amount + "</strong>";
      row.insertCell(2).innerText = emp.fine_count;
      row.insertCell(3).innerText = "₨" + emp.avg_amount;
      row.insertCell(4).innerText = emp.first_fine;
      row.insertCell(5).innerText = emp.last_fine;

      const actionCell = row.insertCell(6);
      const filterBtn = document.createElement("button");
      filterBtn.innerText = "Filter";
      filterBtn.className = "action-btn filter-btn";
      filterBtn.onclick = function () {
        document.getElementById("filterSelect").value = emp.employee;
        applyFilters();
      };
      actionCell.appendChild(filterBtn);
    });
  } catch (error) {
    console.error("Error loading employee totals:", error);
  }
}

// Update a fine record
async function updateFine(id, reason, amount) {
  if (!reason || isNaN(amount) || amount <= 0) {
    alert("Invalid update values.");
    return;
  }

  try {
    const res = await fetch("/update_fine/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason, amount: amount }),
    });

    const result = await res.json();
    if (result.status !== "updated") {
      alert("Failed to update fine.");
    } else {
      fetchFines();
    }
  } catch (error) {
    console.error("Error updating fine:", error);
    alert("Error updating fine.");
  }
}

// Delete a fine record
async function deleteFine(id) {
  if (!confirm("Delete this fine? This action cannot be undone.")) return;

  try {
    await fetch("/delete_fine/" + id, { method: "DELETE" });
    fetchFines();
  } catch (error) {
    console.error("Error deleting fine:", error);
    alert("Error deleting fine.");
  }
}

// Load employees for dropdowns
async function loadEmployees() {
  try {
    const res = await fetch("/get_employees");
    const names = await res.json();

    const employeeSelect = document.getElementById("employee");
    const filterSelect = document.getElementById("filterSelect");

    // Populate fine submission dropdown
    if (employeeSelect) {
      employeeSelect.innerHTML =
        '<option value="">-- Choose Employee --</option>';
      names.forEach(function (name) {
        employeeSelect.appendChild(new Option(name, name));
      });

      // Update preview when selection changes
      employeeSelect.onchange = function () {
        const previewName = document.getElementById("previewName");
        if (this.value) {
          previewName.textContent = this.value;
        } else {
          previewName.textContent = "No employee selected";
        }
      };
    }

    // Populate filter dropdown
    if (filterSelect) {
      const currentValue = filterSelect.value;
      filterSelect.innerHTML = '<option value="">-- Show All --</option>';
      names.forEach(function (name) {
        filterSelect.appendChild(new Option(name, name));
      });
      filterSelect.value = currentValue;
    }
  } catch (error) {
    console.error("Error loading employees:", error);
  }
}
