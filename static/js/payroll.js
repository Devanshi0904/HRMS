const BASE_URL = "http://127.0.0.1:8000/api";

function getHeaders() {
    const token = localStorage.getItem("access");
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

document.addEventListener("DOMContentLoaded", function () {
    loadPayrolls();
    loadEmployeesDropdown();
});

// ===================== CALCULATE NET SALARY =====================
function calculateNetSalary() {
    let basic = parseFloat(document.getElementById("basic_salary").value) || 0;
    let bonus = parseFloat(document.getElementById("bonus").value) || 0;
    let deductions = parseFloat(document.getElementById("deductions").value) || 0;

    let net = basic + bonus - deductions;
    document.getElementById("net_salary").value = net > 0 ? net.toFixed(2) : "0.00";
}

// ===================== LOAD PAYROLLS =====================
function loadPayrolls() {
    fetch(`${BASE_URL}/payroll/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            let payrollList = Array.isArray(data) ? data : (data.results || []);
            let tableRows = "";

            if (payrollList.length === 0) {
                tableRows = `<tr><td colspan="11" class="text-center">No Payroll Records Found</td></tr>`;
            } else {
                payrollList.forEach(item => {
                    let empName = item.employee_name || item.employee || '-';

                    let statusBadge = item.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark';

                    let monthVal = item.month || '-';
                    let yearVal = item.year || '-';
                    let basicSalary = item.basic_salary || item.salary || 0;
                    let bonusVal = item.bonus || item.allowance || 0;
                    let deductionVal = item.deductions || 0;
                    let netSalary = item.net_salary || (parseFloat(basicSalary) + parseFloat(bonusVal) - parseFloat(deductionVal));
                    let payDate = item.payment_date || item.date || '-';

                    tableRows += `
                    <tr>
                        <td>${item.id}</td>
                        <td>${empName}</td>
                        <td>${monthVal}</td>
                        <td>${yearVal}</td>
                        <td>₹${basicSalary}</td>
                        <td>₹${bonusVal}</td>
                        <td>₹${deductionVal}</td>
                        <td><strong>₹${netSalary}</strong></td>
                        <td>${payDate}</td>
                        <td><span class="badge ${statusBadge}">${item.status || 'Pending'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editPayroll(${item.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deletePayroll(${item.id})">Delete</button>
                        </td>
                    </tr>
                `;
                });
            }

            const tableBody = document.getElementById("payrollTableBody");
            if (tableBody) tableBody.innerHTML = tableRows;
        })
        .catch(err => console.error("Error loading payrolls:", err));
}

// ===================== LOAD EMPLOYEES DROPDOWN =====================
function loadEmployeesDropdown() {
    fetch(`${BASE_URL}/employee/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            let employees = Array.isArray(data) ? data : (data.results || []);
            let selectEl = document.getElementById("employee");
            if (selectEl) {
                let options = '<option value="">Select Employee</option>';
                employees.forEach(emp => {
                    let name = emp.first_name ? `${emp.first_name} ${emp.last_name || ''}`.trim() : (emp.username || `Employee #${emp.id}`);
                    options += `<option value="${emp.id}">${name}</option>`;
                });
                selectEl.innerHTML = options;
            }
        })
        .catch(err => console.error("Error loading employees:", err));
}

// ===================== OPEN ADD MODAL =====================
function openAddPayrollModal() {
    document.getElementById("payroll_id").value = "";

    document.getElementById("employee").style.display = "block";
    document.getElementById("employee").value = "";
    document.getElementById("employee_display").style.display = "none";

    document.getElementById("basic_salary").value = "";
    document.getElementById("bonus").value = "0";
    document.getElementById("deductions").value = "0";
    document.getElementById("net_salary").value = "";

    // Default current Month and Year
    const currentDate = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (document.getElementById("month")) document.getElementById("month").value = monthNames[currentDate.getMonth()];
    if (document.getElementById("year")) document.getElementById("year").value = currentDate.getFullYear();

    document.getElementById("payment_date").value = currentDate.toISOString().split('T')[0];
    document.getElementById("status").value = "Paid";

    let modal = new bootstrap.Modal(document.getElementById("payrollModal"));
    modal.show();
}

// ===================== SAVE PAYROLL =====================
function savePayroll() {
    let id = document.getElementById("payroll_id").value;
    if (id === "" || id === null) {
        addPayroll();
    } else {
        updatePayroll(id);
    }
}

// ===================== ADD PAYROLL =====================
function addPayroll() {
    let payrollData = {
        employee: document.getElementById("employee").value,
        basic_salary: document.getElementById("basic_salary").value,
        bonus: document.getElementById("bonus").value || 0,
        deductions: document.getElementById("deductions").value || 0,
        net_salary: document.getElementById("net_salary").value,
        month: document.getElementById("month").value || "August", 
        year: document.getElementById("year").value || 2026,        
        payment_date: document.getElementById("payment_date").value,
        status: document.getElementById("status").value
    };

    if (!payrollData.employee) {
        alert("Please select an employee!");
        return;
    }

    fetch(`${BASE_URL}/payroll/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payrollData)
    })
        .then(async res => {
            let data = await res.json();
            if (res.ok) {
                alert("Payroll Record Added Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        });
}

// ===================== EDIT PAYROLL =====================
function editPayroll(id) {
    fetch(`${BASE_URL}/payroll/${id}/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(item => {
            document.getElementById("payroll_id").value = item.id;

            let empSelect = document.getElementById("employee");
            let empDisplay = document.getElementById("employee_display");

            if (empSelect) {
                empSelect.value = item.employee;
                empSelect.style.display = "none";
            }

            if (empDisplay) {
                empDisplay.value = item.employee_name || `Employee #${item.employee}`;
                empDisplay.style.display = "block";
            }

            document.getElementById("basic_salary").value = item.basic_salary || item.salary || "";
            document.getElementById("bonus").value = item.bonus || item.allowance || 0;
            document.getElementById("deductions").value = item.deductions || 0;
            document.getElementById("net_salary").value = item.net_salary || "";

            if (document.getElementById("month")) document.getElementById("month").value = item.month || "August";
            if (document.getElementById("year")) document.getElementById("year").value = item.year || 2026;

            document.getElementById("payment_date").value = item.payment_date || item.date || "";
            document.getElementById("status").value = item.status || "Paid";

            calculateNetSalary();

            let modal = new bootstrap.Modal(document.getElementById("payrollModal"));
            modal.show();
        })
        .catch(err => console.error("Edit fetch error:", err));
}

// ===================== UPDATE PAYROLL =====================
function updatePayroll(id) {
    let payrollData = {
        employee: document.getElementById("employee").value,
        basic_salary: document.getElementById("basic_salary").value,
        bonus: document.getElementById("bonus").value || 0,
        deductions: document.getElementById("deductions").value || 0,
        net_salary: document.getElementById("net_salary").value,
        month: document.getElementById("month").value,
        year: document.getElementById("year").value,   
        payment_date: document.getElementById("payment_date").value,
        status: document.getElementById("status").value
    };

    fetch(`${BASE_URL}/payroll/${id}/`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payrollData)
    })
        .then(async res => {
            let data = await res.json();
            if (res.ok) {
                alert("Payroll Record Updated Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        });
}

// ===================== DELETE PAYROLL =====================
function deletePayroll(id) {
    if (confirm("Are you sure you want to delete this payroll record?")) {
        fetch(`${BASE_URL}/payroll/${id}/`, {
            method: "DELETE",
            headers: getHeaders()
        })
            .then(res => {
                if (res.ok) {
                    alert("Payroll Record Deleted Successfully");
                    loadPayrolls();
                } else {
                    alert("Failed to delete payroll record.");
                }
            });
    }
}

// ===================== SEARCH PAYROLL =====================
function searchPayroll() {
    let input = document.getElementById("searchPayroll").value.toLowerCase();
    let rows = document.querySelectorAll("#payrollTableBody tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
    });
}