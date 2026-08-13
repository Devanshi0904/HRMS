const BASE_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access");
let currentProfileId = null;

document.addEventListener("DOMContentLoaded", function () {
    if (!token) {
        window.location.href = "/login_page";
        return;
    }
    loadTaskData();
    loadProfileData();
    loadAttendanceData();
    loadLeaveData();
    loadPayrollData();
});

// UI Navigation
function showSection(sectionId, event) {
    document.querySelectorAll(".dashboard-section").forEach(sec => sec.style.display = "none");
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.style.display = "block";

    if (event) {
        document.querySelectorAll(".nav-tabs-custom .btn").forEach(btn => {
            btn.classList.remove("active");
        });
        event.currentTarget.classList.add("active");
    }
}

// ================= 0. TASK LOGIC =================
let allEmployeeTasks = [];

function loadTaskData() {
    fetch(`${BASE_URL}/api/tasks/`, {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => res.json())
        .then(data => {
            let list = Array.isArray(data) ? data : (data.results || []);
            allEmployeeTasks = list;
            let html = "";

            if (list.length === 0) {
                html = `<tr><td colspan="7" class="text-center py-4">No tasks assigned yet.</td></tr>`;
            } else {
                list.forEach(item => {
                    let statusBadge = item.status === "Completed" ? "bg-success" : (item.status === "In Progress" ? "bg-warning text-dark" : "bg-secondary");
                    let priorityBadge = item.priority === "High" ? "bg-danger" : (item.priority === "Medium" ? "bg-warning text-dark" : "bg-info text-dark");
                    let progress = item.progress_percentage || 0;

                    html += `
                    <tr>
                        <td>
                            <strong>${item.title || "-"}</strong>
                            ${item.description ? `<br><small class="text-muted">${item.description}</small>` : ""}
                        </td>
                        <td><span class="badge ${priorityBadge}">${item.priority || "Low"}</span></td>
                        <td>${item.due_date || "-"}</td>
                        <td><span class="badge ${statusBadge}">${item.status || "Pending"}</span></td>
                        <td style="min-width: 120px;">
                            <div class="progress" style="height: 16px; border-radius: 8px;">
                                <div class="progress-bar bg-primary" role="progressbar" style="width: ${progress}%; font-size: 11px; font-weight: bold;" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">${progress}%</div>
                            </div>
                        </td>
                        <td>${item.employee_remarks || "-"}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary fw-bold" onclick="openEmployeeTaskModal(${item.id})">
                                <i class="bi bi-pencil-square me-1"></i>Update
                            </button>
                        </td>
                    </tr>`;
                });
            }
            const taskBody = document.getElementById("taskData");
            if (taskBody) taskBody.innerHTML = html;
        })
        .catch(err => console.error("Task Fetch Error:", err));
}

function openEmployeeTaskModal(taskId) {
    const task = allEmployeeTasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById("empTaskId").value = task.id;
    document.getElementById("empTaskTitle").innerText = task.title || "Task";
    document.getElementById("empTaskStatus").value = task.status || "Pending";
    document.getElementById("empTaskProgress").value = task.progress_percentage || 0;
    document.getElementById("empTaskRemarks").value = task.employee_remarks || "";
    document.getElementById("empTaskGithub").value = task.github_link || "";

    const modalEl = document.getElementById("employeeTaskModal");
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function updateEmployeeTask(event) {
    event.preventDefault();
    const taskId = document.getElementById("empTaskId").value;

    const data = {
        status: document.getElementById("empTaskStatus").value,
        progress_percentage: parseInt(document.getElementById("empTaskProgress").value) || 0,
        employee_remarks: document.getElementById("empTaskRemarks").value,
        github_link: document.getElementById("empTaskGithub").value
    };

    fetch(`${BASE_URL}/api/tasks/${taskId}/`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) throw new Error("Task update failed");
            return res.json();
        })
        .then(() => {
            alert("Task updated successfully!");
            const modalEl = document.getElementById("employeeTaskModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            loadTaskData();
        })
        .catch(err => {
            console.error("Task Update Error:", err);
            alert("Failed to update task.");
        });
}

// ================= 1. PROFILE LOGIC =================
function loadProfileData() {

    fetch(`${BASE_URL}/api/employee/`, {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => {
            if (!res.ok) throw new Error("Profile fetch failed");
            return res.json();
        })
        .then(data => {
            let list = Array.isArray(data) ? data : (data.results || [data]);

            const emp = list.length > 0 ? list[0] : null;

            if (!emp) {
                console.warn("No employee profile found!");
                return;
            }

            currentProfileId = emp.id;

            document.getElementById("employeeName").innerText = "Welcome, " + (emp.first_name || "Employee");
            document.getElementById("empFirstName").innerText = emp.first_name || "-";
            document.getElementById("empLastName").innerText = emp.last_name || "-";
            document.getElementById("empUsername").innerText = (emp.user && emp.user.username) ? emp.user.username : (emp.username || "-");
            document.getElementById("empEmail").innerText = (emp.user && emp.user.email) ? emp.user.email : (emp.email || "-");
            document.getElementById("empPhone").innerText = emp.phone || "-";
            document.getElementById("empGender").innerText = emp.gender || "-";
            document.getElementById("empDepartment").innerText = emp.department_name || "-";
            document.getElementById("empDesignation").innerText = emp.designation || "-";
            document.getElementById("empType").innerText = emp.employment_type || "-";
            document.getElementById("empDOB").innerText = emp.date_of_birth || "-";
            document.getElementById("empJoiningDate").innerText = emp.joining_date || "-";
            document.getElementById("empBondPeriod").innerText = emp.bond_period || "-";
            document.getElementById("empAddress").innerText = emp.address || "-";
            document.getElementById("empCity").innerText = emp.city || "-";
            document.getElementById("empState").innerText = emp.state || "-";
        })
        .catch(err => console.error("Profile Fetch Error:", err));
}

function toggleProfileEdit() {
    const viewDiv = document.getElementById("profileView");
    const editForm = document.getElementById("profileEditForm");

    if (editForm.style.display === "none") {
        viewDiv.style.display = "none";
        editForm.style.display = "block";

        document.getElementById("editFirstName").value = document.getElementById("empFirstName").innerText !== "-" ? document.getElementById("empFirstName").innerText : "";
        document.getElementById("editLastName").value = document.getElementById("empLastName").innerText !== "-" ? document.getElementById("empLastName").innerText : "";
        document.getElementById("editPhone").value = document.getElementById("empPhone").innerText !== "-" ? document.getElementById("empPhone").innerText : "";
        document.getElementById("editAddress").value = document.getElementById("empAddress").innerText !== "-" ? document.getElementById("empAddress").innerText : "";
        document.getElementById("editCity").value = document.getElementById("empCity").innerText !== "-" ? document.getElementById("empCity").innerText : "";
        document.getElementById("editState").value = document.getElementById("empState").innerText !== "-" ? document.getElementById("empState").innerText : "";
    } else {
        viewDiv.style.display = "block";
        editForm.style.display = "none";
    }
}

function updateProfile(event) {
    event.preventDefault();

    if (!currentProfileId) {
        alert("Employee ID not found! Refresh the page.");
        return;
    }

    const data = {
        first_name: document.getElementById("editFirstName").value,
        last_name: document.getElementById("editLastName").value,
        phone: document.getElementById("editPhone").value,
        address: document.getElementById("editAddress").value,
        city: document.getElementById("editCity").value,
        state: document.getElementById("editState").value,
    };

    fetch(`${BASE_URL}/api/employee/${currentProfileId}/`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) throw new Error("Update failed");
            return res.json();
        })
        .then(() => {
            alert("Profile successfully updated!");
            toggleProfileEdit();
            loadProfileData();
        })
        .catch(err => {
            console.error("Update Error:", err);
            alert("error! in updated profile");
        });
}

// ================= 2. ATTENDANCE LOGIC =================
function handleCheckIn() {
    fetch(`${BASE_URL}/attendance/check-in/`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message || data.detail || "Check In Successful!");
            loadAttendanceData();
        })
        .catch(err => console.error("CheckIn Error:", err));
}

function handleCheckOut() {
    fetch(`${BASE_URL}/attendance/check-out/`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message || data.detail || "Check Out Successful!");
            loadAttendanceData();
        })
        .catch(err => console.error("CheckOut Error:", err));
}

function loadAttendanceData() {
    fetch(`${BASE_URL}/api/attendance/`, {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => res.json())
        .then(data => {
            let list = Array.isArray(data) ? data : (data.results || []);
            let html = "";

            if (list.length === 0) {
                html = `<tr><td colspan="5" class="text-center">No attendance history found.</td></tr>`;
            } else {
                list.forEach(item => {
                    let badgeClass = "bg-success";
                    if (item.status === "Absent") {
                        badgeClass = "bg-warning text-dark";
                    } else if (item.status === "Half Day") {
                        badgeClass = "bg-info";
                    } else if (item.status === "Leave") {
                        badgeClass = "bg-secondary";
                    }

                    html += `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.date || "-"}</td>
                        <td>${item.check_in || "-"}</td>
                        <td>${item.check_out || "-"}</td>
                        <td><span class="badge ${badgeClass}">${item.status || "Present"}</span></td>
                    </tr>`;
                });
            }
            document.getElementById("attendanceData").innerHTML = html;
        })
        .catch(err => console.error("Attendance Error:", err));
}

// ================= 3. LEAVE LOGIC =================
function loadLeaveData() {
    fetch(`${BASE_URL}/api/leave/`, {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => res.json())
        .then(data => {
            let list = Array.isArray(data) ? data : (data.results || []);
            let html = "";

            if (list.length === 0) {
                html = `<tr><td colspan="6" class="text-center">No leave records found.</td></tr>`;
            } else {
                list.forEach(item => {
                    let badge = "bg-warning";
                    if (item.status === "Approved") badge = "bg-success";
                    if (item.status === "Rejected") badge = "bg-danger";

                    html += `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.leave_type || "Casual"}</td>
                        <td>${item.start_date || "-"}</td>
                        <td>${item.end_date || "-"}</td>
                        <td>${item.reason || "-"}</td>
                        <td><span class="badge ${badge}">${item.status || "Pending"}</span></td>
                    </tr>`;
                });
            }
            document.getElementById("leaveData").innerHTML = html;
        })
        .catch(err => console.error("Leave Error:", err));
}

function submitLeave(event) {
    event.preventDefault();

    const leaveData = {
        employee: currentProfileId,
        leave_type: document.getElementById("leaveType").value,
        from_date: document.getElementById("startDate").value,
        to_date: document.getElementById("endDate").value,
        reason: document.getElementById("leaveReason").value
    };

    fetch(`${BASE_URL}/api/leave/`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(leaveData)
    })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) {
                console.error("Server Error Details:", data);
                alert("Leave Error: " + JSON.stringify(data));
                throw new Error("Validation failed");
            }
            return data;
        })
        .then(() => {
            alert("Leave request submitted successfully!");

            // Modal Hide
            const modalEl = document.getElementById("leaveApplyModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            event.target.reset();
            loadLeaveData();
        })
        .catch(err => {
            console.error("Leave Submit Error:", err);
            alert("Leave not Submited: " + JSON.stringify(err));
        });
}

// ================= 4. PAYROLL LOGIC =================
function loadPayrollData() {
    fetch(`${BASE_URL}/api/payroll/`, {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => res.json())
        .then(data => {
            let list = Array.isArray(data) ? data : (data.results || []);
            let html = "";

            if (list.length === 0) {
                html = `<tr><td colspan="7" class="text-center">No payroll records found.</td></tr>`;
            } else {
                list.forEach(item => {
                    let badge = item.status === "Paid" ? "bg-success" : "bg-danger";
                    html += `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.month || "-"} ${item.year || ""}</td>
                        <td>₹${item.basic_salary || 0}</td>
                        <td>₹${item.allowances || 0}</td>
                        <td>₹${item.deductions || 0}</td>
                        <td><strong>₹${item.net_salary || 0}</strong></td>
                        <td><span class="badge ${badge}">${item.status || "Unpaid"}</span></td>
                    </tr>`;
                });
            }
            document.getElementById("payrollData").innerHTML = html;
        })
        .catch(err => console.error("Payroll Error:", err));
}

function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login_page";
}