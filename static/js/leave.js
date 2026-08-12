const BASE_URL = "http://127.0.0.1:8000/api";

function getHeaders() {
    const token = localStorage.getItem("access");
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

document.addEventListener("DOMContentLoaded", function () {
    loadLeaves();
    loadEmployeesDropdown();
});

// ===================== LOAD LEAVES =====================
function loadLeaves() {
    fetch(`${BASE_URL}/leave/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            let leaveList = Array.isArray(data) ? data : (data.results || []);
            let tableRows = "";

            if (leaveList.length === 0) {
                tableRows = `<tr><td colspan="8" class="text-center">No Leave Requests Found</td></tr>`;
            } else {
                leaveList.forEach(leave => {
                    let empName = leave.employee_name || leave.employee || '-';

                    let statusBadge = 'bg-secondary';
                    if (leave.status === 'Approved') statusBadge = 'bg-success';
                    else if (leave.status === 'Pending') statusBadge = 'bg-warning text-dark';
                    else if (leave.status === 'Rejected') statusBadge = 'bg-danger';

                    let fromDate = leave.from_date || leave.start_date || '-';
                    let toDate = leave.to_date || leave.end_date || '-';

                    tableRows += `
                    <tr>
                        <td>${leave.id}</td>
                        <td>${empName}</td>
                        <td>${leave.leave_type || '-'}</td>
                        <td>${fromDate}</td>
                        <td>${toDate}</td>
                        <td><span class="badge ${statusBadge}">${leave.status || 'Pending'}</span></td>
                        <td>${leave.reason || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editLeave(${leave.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteLeave(${leave.id})">Delete</button>
                        </td>
                    </tr>
                `;
                });
            }

            const tableBody = document.getElementById("leaveTableBody");
            if (tableBody) tableBody.innerHTML = tableRows;
        })
        .catch(err => console.error("Error loading leaves:", err));
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
function openAddLeaveModal() {
    document.getElementById("leave_id").value = "";

    let empSelect = document.getElementById("employee");
    if (empSelect) {
        empSelect.disabled = false;
        empSelect.style.display = "block";
        empSelect.value = "";
    }

    let empDisplay = document.getElementById("employee_display");
    if (empDisplay) {
        empDisplay.style.display = "none";
        empDisplay.value = "";
    }

    document.getElementById("leave_type").value = "Casual Leave";
    document.getElementById("from_date").value = "";
    document.getElementById("to_date").value = "";
    document.getElementById("reason").value = "";
    document.getElementById("status").value = "Pending";

    let modal = new bootstrap.Modal(document.getElementById("leaveModal"));
    modal.show();
}

// ===================== SAVE LEAVE (ADD / UPDATE) =====================
function saveLeave() {
    let id = document.getElementById("leave_id").value;
    if (id === "" || id === null) {
        addLeave();
    } else {
        updateLeave(id);
    }
}

// ===================== ADD LEAVE =====================
function addLeave() {
    let leaveData = {
        employee: document.getElementById("employee").value,
        leave_type: document.getElementById("leave_type").value,
        from_date: document.getElementById("from_date").value,
        to_date: document.getElementById("to_date").value,
        reason: document.getElementById("reason").value,
        status: document.getElementById("status").value || "Pending"
    };

    if (!leaveData.employee) {
        alert("Please select an employee!");
        return;
    }

    fetch(`${BASE_URL}/leave/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(leaveData)
    })
        .then(async res => {
            let data = await res.json();
            if (res.ok) {
                alert("Leave Request Added Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        });
}

// ===================== EDIT LEAVE =====================
function editLeave(id) {
    fetch(`${BASE_URL}/leave/${id}/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(item => {
            document.getElementById("leave_id").value = item.id;

            let empSelect = document.getElementById("employee");
            let empDisplay = document.getElementById("employee_display");

            if (empSelect) {
                empSelect.value = item.employee;
                empSelect.disabled = true; 
                empSelect.style.display = "block";
            }

            if (empDisplay) {
                empDisplay.style.display = "none";
            }

            document.getElementById("leave_type").value = item.leave_type || "Casual Leave";
            document.getElementById("from_date").value = item.from_date || item.start_date || "";
            document.getElementById("to_date").value = item.to_date || item.end_date || "";
            document.getElementById("reason").value = item.reason || "";
            document.getElementById("status").value = item.status || "Pending";

            let modal = new bootstrap.Modal(document.getElementById("leaveModal"));
            modal.show();
        })
        .catch(err => console.error("Edit fetch error:", err));
}

// ===================== UPDATE LEAVE =====================
function updateLeave(id) {
    let empSelect = document.getElementById("employee");
    if (empSelect) {
        empSelect.disabled = false; 
    }

    let leaveData = {
        employee: empSelect ? empSelect.value : "",
        leave_type: document.getElementById("leave_type").value,
        from_date: document.getElementById("from_date").value,
        to_date: document.getElementById("to_date").value,
        reason: document.getElementById("reason").value,
        status: document.getElementById("status").value
    };

    if (empSelect) {
        empSelect.disabled = true; 
    }

    fetch(`${BASE_URL}/leave/${id}/`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(leaveData)
    })
        .then(async res => {
            let data = await res.json();
            if (res.ok) {
                alert("Leave Request Updated Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        });
}

// ===================== DELETE LEAVE =====================
function deleteLeave(id) {
    if (confirm("Are you sure you want to delete this leave request?")) {
        fetch(`${BASE_URL}/leave/${id}/`, {
            method: "DELETE",
            headers: getHeaders()
        })
            .then(res => {
                if (res.ok) {
                    alert("Leave Request Deleted Successfully");
                    loadLeaves();
                } else {
                    alert("Failed to delete leave request.");
                }
            });
    }
}

// ===================== SEARCH LEAVE =====================
function searchLeave() {
    let input = document.getElementById("searchLeave").value.toLowerCase();
    let rows = document.querySelectorAll("#leaveTableBody tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
    });
}