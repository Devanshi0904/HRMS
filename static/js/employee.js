// ===================== CONSTANTS & HEADERS =====================
const BASE_URL = "http://127.0.0.1:8000/api";

function getHeaders() {
    const token = localStorage.getItem("access");
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

document.addEventListener("DOMContentLoaded", function () {
    loadEmployees();
    loadDepartment();
});

// ===================== LOAD EMPLOYEES =====================

// ===================== LOAD EMPLOYEES =====================
function loadEmployees() {
    fetch(`${BASE_URL}/employee/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Employees Data:", data);
            let employees = Array.isArray(data) ? data : (data.results || []);

            let tableRows = "";
            if (employees.length === 0) {
                tableRows = `<tr><td colspan="8" class="text-center">No Employees Found</td></tr>`;
            } else {
                employees.forEach(emp => {
                    tableRows += `
                    <tr>
                        <td>${emp.first_name || '-'}</td>
                        <td>${emp.last_name || '-'}</td>
                        <td>${emp.email || '-'}</td>
                        <td>${emp.department_name || '-'}</td>
                        <td>${emp.phone || '-'}</td>
                        <td>${emp.designation || '-'}</td>
                        <td>${emp.salary || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editEmployee(${emp.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${emp.id})">Delete</button>
                        </td>
                    </tr>
                `;
                });
            }

            document.getElementById("employeeTableBody").innerHTML = tableRows;
        })
        .catch(error => {
            console.error("Error fetching employees:", error);
        });
}

// ===================== LOAD DEPARTMENTS =====================
function loadDepartment() {
    fetch(`${BASE_URL}/department/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            let departments = Array.isArray(data) ? data : (data.results || []);
            let html = `<option value="">Select Department</option>`;

            departments.forEach(item => {
                html += `<option value="${item.id}">${item.department_name}</option>`;
            });

            const deptSelect = document.getElementById("department");
            if (deptSelect) {
                deptSelect.innerHTML = html;
            }
        })
        .catch(err => console.error("Error loading departments:", err));
}

// ===================== CLEAR FORM =====================
function clearForm() {
    document.getElementById("employee_id").value = "";
    document.getElementById("first_name").value = "";
    document.getElementById("last_name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("department").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("gender").value = "Male";
    document.getElementById("employment_type").value = "Intern";
    document.getElementById("date_of_birth").value = "";
    document.getElementById("joining_date").value = "";
    document.getElementById("designation").value = "";
    document.getElementById("salary").value = "";
    document.getElementById("bond_period").value = "No Bond";
    document.getElementById("address").value = "";
    document.getElementById("city").value = "";
    document.getElementById("state").value = "";
}

// ===================== GET FORM DATA =====================
function getData() {
    let data = {
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        email: document.getElementById("email").value,
        department: document.getElementById("department").value,
        phone: document.getElementById("phone").value,
        gender: document.getElementById("gender").value,
        employment_type: document.getElementById("employment_type").value,
        date_of_birth: document.getElementById("date_of_birth").value,
        joining_date: document.getElementById("joining_date").value,
        designation: document.getElementById("designation").value,
        salary: document.getElementById("salary").value,
        bond_period: document.getElementById("bond_period").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value
    };

    return data;
}

// ===================== SAVE (ADD / UPDATE) =====================
function saveEmployee() {
    const empId = document.getElementById("employee_id").value;
    if (empId === "") {
        addEmployee();
    } else {
        updateEmployee(empId);
    }
}

// ===================== ADD EMPLOYEE =====================
function addEmployee() {
    fetch(`${BASE_URL}/employee/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(getData())
    })
        .then(async res => {
            let data = await res.json();
            if (res.ok) {
                alert("Employee Added Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        })
        .catch(err => console.error("Add employee error:", err));
}

// ===================== EDIT EMPLOYEE =====================
function editEmployee(id) {
    fetch(`${BASE_URL}/employee/${id}/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(item => {
            document.getElementById("employee_id").value = item.id || "";

            const usernameField = document.getElementById("username");
            if (usernameField) {
                usernameField.value = item.username || "";
            }

            document.getElementById("first_name").value = item.first_name || "";
            document.getElementById("last_name").value = item.last_name || "";
            document.getElementById("email").value = item.email || "";

            document.getElementById("department").value = item.department || "";

            document.getElementById("phone").value = item.phone || "";
            document.getElementById("gender").value = item.gender || "Male";
            document.getElementById("employment_type").value = item.employment_type || "Intern";
            document.getElementById("date_of_birth").value = item.date_of_birth || "";
            document.getElementById("joining_date").value = item.joining_date || "";
            document.getElementById("designation").value = item.designation || "";
            document.getElementById("salary").value = item.salary || "";
            document.getElementById("bond_period").value = item.bond_period || "No Bond";
            document.getElementById("address").value = item.address || "";
            document.getElementById("city").value = item.city || "";
            document.getElementById("state").value = item.state || "";

            let modal = new bootstrap.Modal(document.getElementById("employeeModal"));
            modal.show();
        })
        .catch(err => console.error("Edit fetch error:", err));
}

// ===================== UPDATE EMPLOYEE =====================
function updateEmployee(id) {
    fetch(`${BASE_URL}/employee/${id}/`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(getData())
    })
        .then(async res => {
            let data = await res.json();
            if (res.ok) {
                alert("Employee Updated Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        })
        .catch(err => console.error("Update employee error:", err));
}

// ===================== DELETE EMPLOYEE =====================
function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete this employee?")) {
        fetch(`${BASE_URL}/employee/${id}/`, {
            method: "DELETE",
            headers: getHeaders()
        })
            .then(res => {
                if (res.ok) {
                    alert("Employee Deleted Successfully");
                    loadEmployees();
                } else {
                    alert("Failed to delete employee.");
                }
            })
            .catch(err => console.error("Delete employee error:", err));
    }
}

// ===================== SEARCH EMPLOYEE =====================
function searchEmployee() {
    let value = document.getElementById("searchEmployee").value.toLowerCase();
    let rows = document.querySelectorAll("#employeeTableBody tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
    });
}