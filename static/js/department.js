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

// ===================== LOAD DEPARTMENTS & SUB-DEPARTMENTS WITH COUNTS =====================
function loadDepartments() {
    Promise.all([
        fetch(`${BASE_URL}/department/`, { headers: getHeaders() }).then(res => res.json()),
        fetch(`${BASE_URL}/sub-department/`, { headers: getHeaders() }).then(res => res.json()).catch(() => []),
        fetch(`${BASE_URL}/employee/`, { headers: getHeaders() }).then(res => res.json())
    ])
        .then(([deptData, subDeptData, empData]) => {
            let departments = Array.isArray(deptData) ? deptData : (deptData.results || []);
            let subDepartments = Array.isArray(subDeptData) ? subDeptData : (subDeptData.results || []);
            let employees = Array.isArray(empData) ? empData : (empData.results || []);

            let tableRows = "";

            if (departments.length === 0) {
                tableRows = `<tr><td colspan="3" class="text-center py-4 text-muted">No Departments Found</td></tr>`;
            } else {
                departments.forEach(dept => {
                    let deptName = dept.department_name || dept.name || '';
                    let deptId = dept.id;

                    // 1. Aa main department na badha employees filter karo (Total count mate)
                    let mainDeptEmployees = employees.filter(emp =>
                        emp.department == deptId ||
                        emp.department_name === deptName ||
                        emp.department === deptName
                    );

                    // 2. Aa department na sub-departments filter karo ane aeno employee count calculate karo
                    let matchedSubDepts = subDepartments.filter(sub =>
                        sub.department == deptId || sub.department_id == deptId
                    );

                    let subDeptHtml = "";
                    if (matchedSubDepts.length > 0) {
                        subDeptHtml = `<div class="mt-2 d-flex flex-column gap-1">`;
                        matchedSubDepts.forEach(sub => {
                            let subName = sub.sub_department_name || sub.name || '';
                            let subId = sub.id;

                            let subEmpCount = employees.filter(emp => {
                                let empDesig = (emp.designation || '').trim().toLowerCase();
                                let subNameClean = subName.trim().toLowerCase();
                                return empDesig === subNameClean;
                            }).length;

                            subDeptHtml += `
                            <div class="d-flex justify-content-between align-items-center bg-light border px-3 py-1 rounded-3" style="max-width: 450px;">
                                <span class="small text-dark fw-semibold">
                                    <i class="bi bi-diagram-3 me-1 text-primary"></i>${subName} 
                                    <span class="badge bg-secondary bg-opacity-10 text-secondary small ms-1">${subEmpCount} Emp</span>
                                </span>
                                <div>
                                    <button class="btn btn-sm btn-link text-warning p-0 me-2" onclick="editSubDepartment(${subId})" title="Edit">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-link text-danger p-0" onclick="deleteSubDepartment(${subId})" title="Delete">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>`;
                        });
                        subDeptHtml += `</div>`;
                    }

                    tableRows += `
                <tr>
                    <td class="py-3 px-4">
                        <div class="fw-bold text-dark fs-6">${deptName}</div>
                        ${subDeptHtml}
                    </td>
                    <td class="py-3 px-4 align-top">
                        <span class="badge bg-info bg-opacity-10 text-info fw-semibold px-3 py-2 rounded-pill">${mainDeptEmployees.length} Employees Active</span>
                    </td>
                    <td class="py-3 px-4 text-end align-top">
                        <button class="btn btn-sm btn-outline-warning rounded-pill px-3 me-1" onclick="editDepartment(${deptId})">
                            <i class="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteDepartment(${deptId})">
                            <i class="bi bi-trash me-1"></i>Delete
                        </button>
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
        .catch(error => console.error("Error loading data:", error));
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
        let deptNameCell = row.querySelector("td");
        if (deptNameCell) {
            let deptText = deptNameCell.innerText.toLowerCase();

            if (deptText.startsWith(input)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    });
}

// ===================== GET CSRF TOKEN HELPER =====================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ===================== SAVE SUB-DEPARTMENT =====================
function saveSubDepartment() {
    let deptId = document.getElementById("parent_department_id").value;
    let subName = document.getElementById("sub_department_name").value;

    if (!deptId || !subName) {
        alert("Please choose a department and enter sub-department name!");
        return;
    }

    let base = typeof BASE_URL !== 'undefined' ? BASE_URL : 'http://127.0.0.1:8000';

    let csrftoken = '';
    let csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfInput) {
        csrftoken = csrfInput.value;
    }

    let headersObj = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
    };

    if (typeof getHeaders === 'function') {
        let existingHeaders = getHeaders();
        for (let key in existingHeaders) {
            headersObj[key] = existingHeaders[key];
        }
    }

    fetch(`${base}/sub-department/`, {
        method: 'POST',
        headers: headersObj,
        body: JSON.stringify({ department: deptId, sub_department_name: subName })
    })
        .then(res => {
            if (res.ok) {
                let modalEl = document.getElementById('subDepartmentModal');
                let modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();

                document.getElementById("sub_department_name").value = "";
                loadDepartments();
                alert("Sub-department added successfully!");
            } else {
                res.json().then(err => console.error("Server Error:", err));
                alert("Error saving sub-department.");
            }
        })
        .catch(err => console.error("Error:", err));
}

// ===================== EDIT SUB-DEPARTMENT =====================
function editSubDepartment(subId) {
    let newName = prompt("Enter new sub-department name:");
    if (!newName) return;

    fetch(`${BASE_URL}/sub-department/${subId}/`, {
        method: 'PATCH',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sub_department_name: newName })
    })
        .then(res => {
            if (res.ok) {
                alert("Sub-department updated successfully!");
                loadDepartments();
            } else {
                alert("Error updating sub-department.");
            }
        })
        .catch(err => console.error("Error:", err));
}

// ===================== DELETE SUB-DEPARTMENT =====================
function deleteSubDepartment(subId) {
    if (!confirm("Are you sure you want to delete this sub-department?")) return;

    fetch(`${BASE_URL}/sub-department/${subId}/`, {
        method: 'DELETE',
        headers: getHeaders()
    })
        .then(res => {
            if (res.ok || res.status === 204) {
                alert("Sub-department deleted successfully!");
                loadDepartments();
            } else {
                alert("Error deleting sub-department.");
            }
        })
        .catch(err => console.error("Error:", err));
}

// SUB-DEPARTMENT DROPDOWN LOAD SCRIPT
document.addEventListener("DOMContentLoaded", function () {
    let subModal = document.getElementById('subDepartmentModal');

    if (subModal) {
        subModal.addEventListener('shown.bs.modal', function () {
            let base = typeof BASE_URL !== 'undefined' ? BASE_URL : 'http://127.0.0.1:8000';
            let headersObj = typeof getHeaders === 'function' ? getHeaders() : {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                'Content-Type': 'application/json'
            };

            fetch(`${base}/department/`, {
                method: 'GET',
                headers: headersObj
            })
                .then(res => res.json())
                .then(data => {
                    let departments = Array.isArray(data) ? data : (data.results || []);
                    let select = document.getElementById("parent_department_id");

                    if (select) {
                        select.innerHTML = '<option value="">Choose Department</option>';

                        departments.forEach(dept => {
                            let deptName = dept.department_name || dept.name || '';
                            let opt = document.createElement("option");
                            opt.value = dept.id;
                            opt.textContent = deptName;
                            select.appendChild(opt);
                        });
                    }
                })
                .catch(err => console.error("Error loading dropdown:", err));
        });
    }
});