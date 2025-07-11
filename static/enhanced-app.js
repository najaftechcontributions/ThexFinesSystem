// Global variables
const isAdmin = window.location.pathname !== "/guest";
let allFines = [];
let filteredFines = [];
let currentFineId = null;
let violationTypes = [];
let employeesDetailed = [];

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Load data with proper error handling
  loadEmployeesWithDetails();
  loadViolationTypes();
  fetchFines();

  // Initialize fancybox
  if (typeof Fancybox !== "undefined") {
    Fancybox.bind("[data-fancybox]", {
      loop: false,
      keyboard: false,
      toolbar: {
        display: {
          left: ["infobar"],
          middle: [],
          right: ["close"],
        },
      },
      Images: {
        zoom: false,
      },
      Thumbs: {
        showOnStart: false,
      },
    });
  }
});

// Load employees with detailed information including images
async function loadEmployeesWithDetails() {
  try {
    const res = await fetch("/get_employees_detailed");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    employeesDetailed = await res.json();

    if (Array.isArray(employeesDetailed) && employeesDetailed.length > 0) {
      populateEmployeeDropdown();
      populateFilterDropdown();
    }
  } catch (error) {
    console.error("Error loading employees:", error);
    // Fallback - try to get basic employee list
    try {
      const fallbackRes = await fetch("/get_employees");
      const fallbackData = await fallbackRes.json();
      if (Array.isArray(fallbackData)) {
        employeesDetailed = fallbackData.map((name) => ({
          name: name,
          id: null,
        }));
        populateEmployeeDropdown();
        populateFilterDropdown();
      }
    } catch (fallbackError) {
      console.error("Fallback employee loading failed:", fallbackError);
    }
  }
}

// Load violation types from database
async function loadViolationTypes() {
  try {
    const response = await fetch("/get_violation_types");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    violationTypes = await response.json();

    if (Array.isArray(violationTypes) && violationTypes.length > 0) {
      populateViolationTypes();
    }
  } catch (error) {
    console.error("Error loading violation types:", error);
  }
}

// Populate violation types dropdown
function populateViolationTypes() {
  const violationSelect = document.getElementById("violationType");
  if (!violationSelect) return;

  violationSelect.innerHTML = '<option value="">-- Select Type --</option>';

  if (!violationTypes || violationTypes.length === 0) {
    return;
  }

  violationTypes.forEach(function (type) {
    const option = document.createElement("option");
    option.value = type.id;
    option.textContent = type.name;
    option.dataset.defaultAmount = type.default_amount || 0;
    option.dataset.suggestions = JSON.stringify(type.suggestions || []);
    option.dataset.image = type.image_path || "";
    option.dataset.severity = type.severity || "Medium";
    option.dataset.description = type.description || "";
    violationSelect.appendChild(option);
  });
}

// Populate employee dropdown with images and details
function populateEmployeeDropdown() {
  const employeeSelect = document.getElementById("employee");
  if (!employeeSelect) return;

  employeeSelect.innerHTML = '<option value="">-- Choose Employee --</option>';

  if (!employeesDetailed || employeesDetailed.length === 0) {
    return;
  }

  employeesDetailed.forEach(function (emp) {
    const option = document.createElement("option");
    option.value = emp.name;
    option.textContent = emp.name;
    option.dataset.image = emp.image_path || "";
    option.dataset.department = emp.department || "";
    option.dataset.employeeId = emp.employee_id || "";
    option.dataset.phone = emp.phone || "";
    option.dataset.email = emp.email || "";
    employeeSelect.appendChild(option);
  });
}

// Populate filter dropdown
function populateFilterDropdown() {
  const filterSelect = document.getElementById("filterSelect");
  if (!filterSelect) return;

  const currentValue = filterSelect.value;
  filterSelect.innerHTML = '<option value="">-- Show All --</option>';

  if (employeesDetailed && employeesDetailed.length > 0) {
    employeesDetailed.forEach(function (emp) {
      filterSelect.appendChild(new Option(emp.name, emp.name));
    });
  }

  filterSelect.value = currentValue;
}

// Update employee preview when selection changes
function updateEmployeePreview() {
  const employeeSelect = document.getElementById("employee");
  const selectedOption = employeeSelect.options[employeeSelect.selectedIndex];

  const previewImage = document.getElementById("previewEmployeeImage");
  const previewName = document.getElementById("previewName");
  const previewDept = document.getElementById("previewDept");

  if (selectedOption.value) {
    const imagePath = selectedOption.dataset.image;
    const department = selectedOption.dataset.department;
    const employeeId = selectedOption.dataset.employeeId;

    const imageSrc = imagePath
      ? `/employee_image/${imagePath}`
      : "/static/default-avatar.png";
    previewImage.src = imageSrc;
    previewImage.setAttribute("data-src", imageSrc);
    previewName.textContent = selectedOption.value;
    previewDept.textContent = `${department || "No Department"}${employeeId ? ` • ID: ${employeeId}` : ""}`;

    document
      .querySelector(".selected-employee-preview")
      .classList.add("active");
  } else {
    previewImage.src = "/static/default-avatar.png";
    previewName.textContent = "No employee selected";
    previewDept.textContent = "Department • ID";
    document
      .querySelector(".selected-employee-preview")
      .classList.remove("active");
  }
}

// Update violation preview when selection changes
function updateViolationPreview() {
  const violationSelect = document.getElementById("violationType");
  const selectedOption = violationSelect.options[violationSelect.selectedIndex];
  const suggestionsContainer = document.getElementById("reasonSuggestions");
  const amountInput = document.getElementById("amount");
  const previewType = document.getElementById("previewViolationType");
  const previewSeverity = document.getElementById("previewSeverity");
  const previewAmount = document.getElementById("previewDefaultAmount");

  suggestionsContainer.innerHTML = "";

  if (selectedOption && selectedOption.value) {
    const imagePath = selectedOption.dataset.image;
    const severity = selectedOption.dataset.severity;
    const defaultAmount = selectedOption.dataset.defaultAmount;

    previewType.textContent = selectedOption.textContent;
    previewSeverity.textContent = `Severity: ${severity}`;
    previewAmount.textContent = `₨${parseFloat(defaultAmount).toFixed(2)}`;

    document
      .querySelector(".selected-violation-preview")
      .classList.add("active");

    // Set default amount
    if (defaultAmount && !amountInput.value) {
      amountInput.value = parseFloat(defaultAmount).toFixed(2);

      // Visual feedback for amount buttons
      document.querySelectorAll(".amount-btn").forEach((btn) => {
        btn.classList.remove("selected");
        if (btn.textContent.includes(Math.round(defaultAmount))) {
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
          suggestionsContainer.style.display = "none";
          setTimeout(() => (suggestionsContainer.style.display = "block"), 100);
        };
        suggestionsContainer.appendChild(button);
      });
    } catch (error) {
      console.error("Error parsing suggestions:", error);
    }
  } else {
    previewType.textContent = "No violation selected";
    previewSeverity.textContent = "Severity Level";
    previewAmount.textContent = "₨0.00";
    document
      .querySelector(".selected-violation-preview")
      .classList.remove("active");
  }
}

// Preview evidence images
function previewEvidenceImages(event) {
  const files = event.target.files;
  const previewContainer = document.getElementById("evidencePreviews");
  previewContainer.innerHTML = "";

  Array.from(files)
    .slice(0, 5)
    .forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const imagePreview = document.createElement("div");
          imagePreview.className = "evidence-preview";
          imagePreview.innerHTML = `
          <img src="${e.target.result}" alt="Evidence ${index + 1}" data-fancybox="evidence-preview" data-src="${e.target.result}" title="Evidence ${index + 1}">
          <span class="evidence-label">Evidence ${index + 1}</span>
        `;
          previewContainer.appendChild(imagePreview);
        };
        reader.readAsDataURL(file);
      }
    });

  // Rebind fancybox after adding evidence previews
  setTimeout(() => {
    if (typeof Fancybox !== "undefined") {
      Fancybox.bind("[data-fancybox='evidence-preview']", {
        loop: false,
        keyboard: false,
        toolbar: {
          display: {
            left: ["infobar"],
            middle: [],
            right: ["close"],
          },
        },
        Images: {
          zoom: false,
        },
        Thumbs: {
          showOnStart: false,
        },
      });
    }
  }, 100);
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
  document.getElementById("evidenceImages").value = "";
  document.getElementById("reasonSuggestions").innerHTML = "";
  document.getElementById("evidencePreviews").innerHTML = "";

  updateEmployeePreview();
  updateViolationPreview();

  document.getElementById("receipt").classList.add("hidden");
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

  // Prepare form data for file upload
  const formData = new FormData();
  formData.append("employee", employee);
  formData.append(
    "reason",
    `${getViolationTypeLabel(violationType)}: ${reason}`,
  );
  formData.append("amount", amount);
  formData.append("violation_type_id", violationType);
  formData.append("notes", notes);

  // Add evidence files if any
  const evidenceFiles = document.getElementById("evidenceImages").files;
  for (let i = 0; i < evidenceFiles.length; i++) {
    formData.append("evidence_images", evidenceFiles[i]);
  }

  const res = await fetch("/submit_fine", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.status === "success") {
    // Update receipt display with enhanced information
    const selectedEmployee = employeesDetailed.find(
      (emp) => emp.name === employee,
    );
    const selectedViolation = violationTypes.find(
      (vt) => vt.id == violationType,
    );

    document.getElementById("rEmployee").innerText = employee;
    document.getElementById("rEmployeeDept").innerText =
      selectedEmployee?.department || "No Department";
    document.getElementById("rEmployeeId").innerText =
      selectedEmployee?.employee_id
        ? `ID: ${selectedEmployee.employee_id}`
        : "";
    document.getElementById("rViolationType").innerText =
      selectedViolation?.name || "Unknown Violation";
    document.getElementById("rViolationSeverity").innerText =
      `Severity: ${selectedViolation?.severity || "Medium"}`;
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

    // Update images in receipt
    const receiptEmployeeImage = document.getElementById(
      "receiptEmployeeImage",
    );
    const receiptViolationImage = document.getElementById(
      "receiptViolationImage",
    );

    const empImageSrc = selectedEmployee?.image_path
      ? `/employee_image/${selectedEmployee.image_path}`
      : "/static/default-avatar.png";
    receiptEmployeeImage.src = empImageSrc;
    receiptEmployeeImage.setAttribute("data-src", empImageSrc);

    const violImageSrc = selectedViolation?.image_path
      ? `/violation_image/${selectedViolation.image_path}`
      : "/static/default-violation.png";
    receiptViolationImage.src = violImageSrc;
    receiptViolationImage.setAttribute("data-src", violImageSrc);

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
          <div class="row"><span><strong>Violation:</strong></span><span>${violationType}</span></div>
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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

// Render the fines table with current filtered data and images
function renderFinesTable() {
  const table = document.querySelector("#fineTable tbody");
  table.innerHTML = "";

  filteredFines.forEach(function (f) {
    const row = table.insertRow();

    // Employee cell with image
    const employeeCell = row.insertCell(0);
    const employee = employeesDetailed.find((emp) => emp.name === f.employee);

    const employeeContainer = document.createElement("div");
    employeeContainer.className = "employee-cell";

    const employeeImage = document.createElement("img");
    employeeImage.className = "table-employee-avatar";
    employeeImage.src = employee?.image_path
      ? `/employee_image/${employee.image_path}`
      : "/static/default-avatar.png";
    employeeImage.alt = f.employee;
    employeeImage.setAttribute("data-fancybox", `employee-table-${f.id}`);
    employeeImage.setAttribute(
      "data-src",
      employee?.image_path
        ? `/employee_image/${employee.image_path}`
        : "/static/default-avatar.png",
    );
    employeeImage.setAttribute("title", f.employee);
    employeeImage.style.cursor = "pointer";

    const employeeInfo = document.createElement("div");
    employeeInfo.className = "employee-info";
    employeeInfo.innerHTML = `<strong>${f.employee}</strong>${employee?.department ? `<br><small>${employee.department}</small>` : ""}`;

    employeeContainer.appendChild(employeeImage);
    employeeContainer.appendChild(employeeInfo);
    employeeCell.appendChild(employeeContainer);

    // Violation cell with type extraction
    const violationCell = row.insertCell(1);
    const reasonParts = f.reason.split(": ");
    const violationType = reasonParts.length > 1 ? reasonParts[0] : "Other";
    const violation = violationTypes.find((vt) => vt.name === violationType);

    const violationContainer = document.createElement("div");
    violationContainer.className = "violation-cell";

    const violationImage = document.createElement("img");
    violationImage.className = "table-violation-avatar";

    // Use evidence image if available, otherwise use violation image
    if (f.evidence_images && f.evidence_images.trim()) {
      const firstEvidence = f.evidence_images.split(",")[0].trim();
      violationImage.src = `/evidence_image/${firstEvidence}`;
      violationImage.alt = "Evidence Image";
      violationImage.title = "Click to view evidence image";
      violationImage.setAttribute("data-fancybox", `evidence-${f.id}`);
      violationImage.setAttribute(
        "data-src",
        `/evidence_image/${firstEvidence}`,
      );
      violationImage.style.cursor = "pointer";
    } else {
      const violationImageSrc = violation?.image_path
        ? `/violation_image/${violation.image_path}`
        : "/static/default-violation.png";
      violationImage.src = violationImageSrc;
      violationImage.alt = violationType;
      violationImage.title = "Click to view violation type image";
      violationImage.setAttribute("data-fancybox", `violation-${f.id}`);
      violationImage.setAttribute("data-src", violationImageSrc);
      violationImage.style.cursor = "pointer";
    }

    const violationInfo = document.createElement("div");
    violationInfo.className = "violation-info";
    violationInfo.innerHTML = `<strong>${violationType}</strong><br><small class="severity-${(violation?.severity || "medium").toLowerCase()}">${violation?.severity || "Medium"}</small>`;

    violationContainer.appendChild(violationImage);
    violationContainer.appendChild(violationInfo);
    violationCell.appendChild(violationContainer);

    // Reason cell
    const reasonCell = row.insertCell(2);
    const actualReason =
      reasonParts.length > 1 ? reasonParts.slice(1).join(": ") : f.reason;
    if (isAdmin) {
      const reasonInput = document.createElement("input");
      reasonInput.value = actualReason;
      reasonInput.disabled = true;
      reasonInput.className = "table-input";
      reasonCell.appendChild(reasonInput);
    } else {
      reasonCell.innerText = actualReason;
    }

    // Amount cell
    const amountCell = row.insertCell(3);
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

    row.insertCell(4).innerText = f.date;

    // Actions cell
    const actionCell = row.insertCell(5);

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
      editBtn.innerHTML = '<span class="btn-icon">✏️</span>';
      editBtn.title = "Edit Fine";
      editBtn.className = "action-btn edit-btn";
      editBtn.onclick = function () {
        openFineEditModal(f);
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

    // Email receipt button (for all users if employee has email)
    const employee_detail = employeesDetailed.find(
      (emp) => emp.name === f.employee,
    );
    if (employee_detail && employee_detail.email) {
      const emailBtn = document.createElement("button");
      emailBtn.innerHTML = '<span class="btn-icon">📧</span>';
      emailBtn.title = "Email Receipt";
      emailBtn.className = "action-btn email-btn";
      emailBtn.onclick = function () {
        emailReceipt(f.id, employee_detail.email);
      };
      actionCell.appendChild(emailBtn);
    }
  });

  document.getElementById("recordCount").innerText = filteredFines.length;

  // Rebind fancybox for table images
  setTimeout(() => {
    if (typeof Fancybox !== "undefined") {
      // Destroy existing bindings first
      Fancybox.destroy();

      // Rebind to all fancybox elements
      Fancybox.bind("[data-fancybox]", {
        loop: false,
        keyboard: false,
        toolbar: {
          display: {
            left: ["infobar"],
            middle: [],
            right: ["close"],
          },
        },
        Images: {
          zoom: false,
        },
        Thumbs: {
          showOnStart: false,
        },
      });
    }
  }, 100);
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
      const employee = employeesDetailed.find((e) => e.name === emp.employee);

      const row = table.insertRow();

      // Employee cell with image
      const empCell = row.insertCell(0);
      const empContainer = document.createElement("div");
      empContainer.className = "employee-cell";

      const empImage = document.createElement("img");
      empImage.className = "table-employee-avatar";
      empImage.src = employee?.image_path
        ? `/employee_image/${employee.image_path}`
        : "/static/default-avatar.png";

      const empInfo = document.createElement("div");
      empInfo.innerHTML = `<strong>${emp.employee}</strong>`;

      empContainer.appendChild(empImage);
      empContainer.appendChild(empInfo);
      empCell.appendChild(empContainer);

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

      // Add email report button if employee has email
      if (employee && employee.email) {
        const emailReportBtn = document.createElement("button");
        emailReportBtn.innerHTML = '<span class="btn-icon">📊</span>';
        emailReportBtn.title = "Email Complete Report";
        emailReportBtn.className = "action-btn email-btn";
        emailReportBtn.onclick = function () {
          emailEmployeeReport(emp.employee, employee.email);
        };
        actionCell.appendChild(emailReportBtn);
      }
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

// Fine Edit Modal Functions
function openFineEditModal(fine) {
  // Create modal if it doesn't exist
  let modal = document.getElementById("fineEditModal");
  if (!modal) {
    createFineEditModal();
    modal = document.getElementById("fineEditModal");
  }

  // Populate modal with fine data
  document.getElementById("editFineId").value = fine.id;
  document.getElementById("editEmployeeSelect").value = fine.employee;
  document.getElementById("editViolationTypeSelect").value =
    fine.violation_type_id || "";
  document.getElementById("editFineAmount").value = parseFloat(
    fine.amount,
  ).toFixed(2);
  document.getElementById("editFineNotes").value = fine.notes || "";

  // Extract reason without violation type prefix
  const reasonParts = fine.reason.split(": ");
  const actualReason =
    reasonParts.length > 1 ? reasonParts.slice(1).join(": ") : fine.reason;
  document.getElementById("editFineReason").value = actualReason;

  // Handle evidence images
  const currentEvidenceInput = document.getElementById("editCurrentEvidence");
  const currentEvidenceDisplay = document.getElementById(
    "editCurrentEvidenceImages",
  );

  currentEvidenceInput.value = fine.evidence_images || "";
  displayCurrentEvidence(fine.evidence_images, fine.violation_type_id);

  // Clear new evidence previews
  document.getElementById("editNewEvidenceImages").innerHTML = "";
  document.getElementById("editEvidenceImages").value = "";

  // Show modal
  modal.style.display = "block";

  // Update violation preview if violation type is set
  if (fine.violation_type_id) {
    updateEditViolationPreview();
  }
}

function createFineEditModal() {
  const modalHTML = `
    <div id="fineEditModal" class="fine-edit-modal" style="display: none;">
      <div class="fine-edit-modal-content">
        <div class="fine-edit-header">
          <h3>Edit Fine</h3>
          <span class="fine-edit-close" onclick="closeFineEditModal()">&times;</span>
        </div>
        <form id="editFineForm" enctype="multipart/form-data">
          <input type="hidden" id="editFineId">
          <input type="hidden" id="editCurrentEvidence">

          <div class="edit-form-grid">
            <div class="edit-form-group">
              <label for="editEmployeeSelect">Employee:</label>
              <select id="editEmployeeSelect">
                <option value="">-- Choose Employee --</option>
              </select>
            </div>

            <div class="edit-form-group">
              <label for="editViolationTypeSelect">Violation Type:</label>
              <select id="editViolationTypeSelect" onchange="updateEditViolationPreview()">
                <option value="">-- Select Type --</option>
              </select>
            </div>

            <div class="edit-form-group">
              <label for="editFineAmount">Amount (PKR):</label>
              <input type="number" id="editFineAmount" step="0.01" min="0" placeholder="0.00">
            </div>

            <div class="edit-form-group full-width">
              <label for="editFineReason">Violation Details:</label>
              <textarea id="editFineReason" rows="3" placeholder="Describe the violation..."></textarea>
            </div>

            <div class="edit-form-group full-width">
              <label for="editFineNotes">Additional Notes:</label>
              <textarea id="editFineNotes" rows="2" placeholder="Any additional comments..."></textarea>
            </div>

            <div class="edit-form-group full-width">
              <label for="editEvidenceImages">Evidence Images:</label>
              <input type="file" id="editEvidenceImages" name="evidence_images" multiple accept="image/*" onchange="previewEditEvidenceImages(event)">
              <div class="current-evidence" id="editCurrentEvidenceDisplay">
                <h4>Current Evidence:</h4>
                <div id="editCurrentEvidenceImages"></div>
              </div>
              <div class="new-evidence-previews" id="editNewEvidencePreviews">
                <h4>New Evidence Preview:</h4>
                <div id="editNewEvidenceImages"></div>
              </div>
            </div>
          </div>

          <div class="edit-form-actions">
            <button type="button" onclick="saveFineEdit()" class="save-fine-btn">Save Changes</button>
            <button type="button" onclick="closeFineEditModal()" class="cancel-fine-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Populate dropdowns
  populateEditDropdowns();
}

// Display current evidence images or violation image as fallback
function displayCurrentEvidence(evidenceImages, violationTypeId) {
  const container = document.getElementById("editCurrentEvidenceImages");
  container.innerHTML = "";

  if (evidenceImages && evidenceImages.trim()) {
    // Display evidence images
    const images = evidenceImages.split(",");
    images.forEach((imageName, index) => {
      if (imageName.trim()) {
        const imageDiv = document.createElement("div");
        imageDiv.className = "evidence-image-item";
        imageDiv.innerHTML = `
          <img src="/evidence_image/${imageName.trim()}"
               alt="Evidence ${index + 1}"
               class="evidence-thumbnail"
               data-fancybox="current-evidence"
               data-src="/evidence_image/${imageName.trim()}"
               title="Evidence Image ${index + 1}">
          <span class="evidence-label">Evidence ${index + 1}</span>
        `;
        container.appendChild(imageDiv);
      }
    });
  } else {
    // Display violation image as fallback
    const violation = violationTypes.find((vt) => vt.id == violationTypeId);
    if (violation && violation.image_path) {
      const imageDiv = document.createElement("div");
      imageDiv.className = "evidence-image-item";
      imageDiv.innerHTML = `
        <img src="/violation_image/${violation.image_path}"
             alt="Violation Image"
             class="evidence-thumbnail"
             data-fancybox="current-evidence"
             data-src="/violation_image/${violation.image_path}"
             title="Violation Type Image">
        <span class="evidence-label">Violation Image</span>
      `;
      container.appendChild(imageDiv);
    } else {
      container.innerHTML =
        '<p class="no-evidence">No evidence images available</p>';
    }
  }

  // Rebind fancybox for new images
  if (typeof Fancybox !== "undefined") {
    Fancybox.bind("[data-fancybox='current-evidence']", {
      loop: false,
      keyboard: false,
      toolbar: {
        display: {
          left: ["infobar"],
          middle: [],
          right: ["close"],
        },
      },
      Images: {
        zoom: false,
      },
      Thumbs: {
        showOnStart: false,
      },
    });
  }
}

// Preview new evidence images in edit modal
function previewEditEvidenceImages(event) {
  const files = event.target.files;
  const previewContainer = document.getElementById("editNewEvidenceImages");
  previewContainer.innerHTML = "";

  Array.from(files)
    .slice(0, 5)
    .forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const imageDiv = document.createElement("div");
          imageDiv.className = "evidence-image-item";
          imageDiv.innerHTML = `
          <img src="${e.target.result}"
               alt="New Evidence ${index + 1}"
               class="evidence-thumbnail"
               data-fancybox="new-evidence"
               data-src="${e.target.result}"
               title="New Evidence Image ${index + 1}">
          <span class="evidence-label">New Evidence ${index + 1}</span>
        `;
          previewContainer.appendChild(imageDiv);
        };
        reader.readAsDataURL(file);
      }
    });

  // Rebind fancybox for new preview images
  setTimeout(() => {
    if (typeof Fancybox !== "undefined") {
      Fancybox.bind("[data-fancybox='new-evidence']", {
        loop: false,
        keyboard: false,
        toolbar: {
          display: {
            left: ["infobar"],
            middle: [],
            right: ["close"],
          },
        },
        Images: {
          zoom: false,
        },
        Thumbs: {
          showOnStart: false,
        },
      });
    }
  }, 100);
}

function populateEditDropdowns() {
  // Populate employee dropdown
  const employeeSelect = document.getElementById("editEmployeeSelect");
  if (employeeSelect && employeesDetailed) {
    employeeSelect.innerHTML =
      '<option value="">-- Choose Employee --</option>';
    employeesDetailed.forEach((emp) => {
      employeeSelect.appendChild(new Option(emp.name, emp.name));
    });
  }

  // Populate violation type dropdown
  const violationSelect = document.getElementById("editViolationTypeSelect");
  if (violationSelect && violationTypes) {
    violationSelect.innerHTML = '<option value="">-- Select Type --</option>';
    violationTypes.forEach((vt) => {
      violationSelect.appendChild(new Option(vt.name, vt.id));
    });
  }
}

function updateEditViolationPreview() {
  const violationSelect = document.getElementById("editViolationTypeSelect");
  const selectedOption = violationSelect.options[violationSelect.selectedIndex];
  const amountInput = document.getElementById("editFineAmount");

  if (selectedOption && selectedOption.value) {
    const violation = violationTypes.find(
      (vt) => vt.id == selectedOption.value,
    );
    if (violation && violation.default_amount && !amountInput.value) {
      amountInput.value = parseFloat(violation.default_amount).toFixed(2);
    }
  }
}

async function saveFineEdit() {
  const fineId = document.getElementById("editFineId").value;
  const employee = document.getElementById("editEmployeeSelect").value;
  const violationTypeId = document.getElementById(
    "editViolationTypeSelect",
  ).value;
  const amount = parseFloat(document.getElementById("editFineAmount").value);
  const reason = document.getElementById("editFineReason").value.trim();
  const notes = document.getElementById("editFineNotes").value.trim();

  // Validation
  if (!employee) {
    alert("Please select an employee.");
    return;
  }

  if (!violationTypeId) {
    alert("Please select a violation type.");
    return;
  }

  if (!reason) {
    alert("Please provide violation details.");
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid fine amount.");
    return;
  }

  const violationTypeName = getViolationTypeLabel(violationTypeId);
  const fullReason = `${violationTypeName}: ${reason}`;

  try {
    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("employee", employee);
    formData.append("reason", fullReason);
    formData.append("amount", amount);
    formData.append("violation_type_id", violationTypeId);
    formData.append("notes", notes);
    formData.append(
      "current_evidence",
      document.getElementById("editCurrentEvidence").value,
    );

    // Add new evidence files if any
    const evidenceFiles = document.getElementById("editEvidenceImages").files;
    for (let i = 0; i < evidenceFiles.length; i++) {
      formData.append("evidence_images", evidenceFiles[i]);
    }

    const response = await fetch(`/update_fine/${fineId}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.status === "updated") {
      alert("Fine updated successfully!");
      closeFineEditModal();
      fetchFines();
    } else {
      alert("Failed to update fine.");
    }
  } catch (error) {
    console.error("Error updating fine:", error);
    alert("Error updating fine.");
  }
}

function closeFineEditModal() {
  const modal = document.getElementById("fineEditModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Email Functions
async function emailReceipt(fineId, employeeEmail) {
  if (!confirm(`Send receipt to ${employeeEmail}?`)) return;

  try {
    const response = await fetch(`/email_receipt/${fineId}`, {
      method: "POST",
    });

    const result = await response.json();
    if (result.status === "success") {
      alert("Receipt emailed successfully!");
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    console.error("Error emailing receipt:", error);
    alert("Failed to send email.");
  }
}

async function emailEmployeeReport(employeeName, employeeEmail) {
  if (
    !confirm(`Send complete fine report to ${employeeName} (${employeeEmail})?`)
  )
    return;

  try {
    const response = await fetch(
      `/email_employee_report/${encodeURIComponent(employeeName)}`,
      {
        method: "POST",
      },
    );

    const result = await response.json();
    if (result.status === "success") {
      alert("Employee report emailed successfully!");
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    console.error("Error emailing report:", error);
    alert("Failed to send email.");
  }
}
