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
    loadDepartments();
});

// ===================== LOAD DEPARTMENTS =====================
function loadDepartments() {
    fetch(`${BASE_URL}/department/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP status: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Department API Response:", data);
            let departments = Array.isArray(data) ? data : (data.results || []);
            let tableRows = "";

            if (departments.length === 0) {
                tableRows = `<tr><td colspan="4" class="text-center">No Departments Found</td></tr>`;
            } else {
                departments.forEach(dept => {
                    tableRows += `
                    <tr>
                        <td>${dept.id}</td>
                        <td>${dept.department_name || dept.name || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editDepartment(${dept.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${dept.id})">Delete</button>
                        </td>
                    </tr>
                `;
                });
            }

            const deptTable = document.getElementById("departmentTableBody");
            if (deptTable) {
                deptTable.innerHTML = tableRows;
            }
        })
        .catch(error => console.error("Error loading departments:", error));
}

// ===================== CLEAR FORM =====================
function clearForm() {
    const deptId = document.getElementById("department_id");
    const deptName = document.getElementById("department_name");
    const deptDesc = document.getElementById("description");

    if (deptId) deptId.value = "";
    if (deptName) deptName.value = "";
    if (deptDesc) deptDesc.value = "";
}

// ===================== SAVE (ADD / UPDATE) =====================
function saveDepartment() {
    let id = document.getElementById("department_id").value;
    if (id === "" || id === null) {
        addDepartment();
    } else {
        updateDepartment(id);
    }
}

// ===================== ADD DEPARTMENT =====================
function addDepartment() {
    let deptName = document.getElementById("department_name").value;
    let deptDesc = document.getElementById("description") ? document.getElementById("description").value : "";

    fetch(`${BASE_URL}/department/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
            department_name: deptName,
            description: deptDesc
        })
    })
        .then(async response => {
            let data = await response.json();
            if (response.ok) {
                alert("Department Added Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        })
        .catch(err => console.error("Add department error:", err));
}

// ===================== EDIT DEPARTMENT =====================
function editDepartment(id) {
    fetch(`${BASE_URL}/department/${id}/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(item => {
            document.getElementById("department_id").value = item.id;
            document.getElementById("department_name").value = item.department_name || item.name;

            const deptDesc = document.getElementById("description");
            if (deptDesc) deptDesc.value = item.description || "";

            let modal = new bootstrap.Modal(document.getElementById("departmentModal"));
            modal.show();
        })
        .catch(err => console.error("Edit fetch error:", err));
}

// ===================== UPDATE DEPARTMENT =====================
function updateDepartment(id) {
    let deptName = document.getElementById("department_name").value;
    let deptDesc = document.getElementById("description") ? document.getElementById("description").value : "";

    fetch(`${BASE_URL}/department/${id}/`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
            department_name: deptName,
            description: deptDesc
        })
    })
        .then(async response => {
            let data = await response.json();
            if (response.ok) {
                alert("Department Updated Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        })
        .catch(err => console.error("Update department error:", err));
}

// ===================== DELETE DEPARTMENT =====================
function deleteDepartment(id) {
    if (confirm("Are you sure you want to delete this department?")) {
        fetch(`${BASE_URL}/department/${id}/`, {
            method: "DELETE",
            headers: getHeaders()
        })
            .then(response => {
                if (response.ok) {
                    alert("Department Deleted Successfully");
                    loadDepartments();
                } else {
                    alert("Failed to delete department.");
                }
            })
            .catch(err => console.error("Delete department error:", err));
    }
}

// ===================== SEARCH DEPARTMENT =====================
function searchDepartment() {
    let input = document.getElementById("searchDepartment").value.toLowerCase();
    let rows = document.querySelectorAll("#departmentTableBody tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
    });
}