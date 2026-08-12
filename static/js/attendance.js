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
    loadAttendance();
});

// ===================== LOAD ATTENDANCE =====================
function loadAttendance() {
    fetch(`${BASE_URL}/attendance/`, {
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
            console.log("Attendance API Response:", data);
            let attendanceList = Array.isArray(data) ? data : (data.results || []);
            let tableRows = "";

            if (attendanceList.length === 0) {
                tableRows = `<tr><td colspan="6" class="text-center">No Attendance Records Found</td></tr>`;
            } else {
                attendanceList.forEach(att => {
                    let empName = att.employee_name || (att.employee ? `Employee #${att.employee}` : '-');

                    tableRows += `
                    <tr>
                    
                        <td>${empName}</td>
                        <td>${att.date || '-'}</td>
                        <td>
                            <span class="badge ${att.status === 'Present' ? 'bg-success' : 'bg-danger'}">
                                ${att.status || '-'}
                            </span>
                        </td>
                        <td>${att.check_in || '-'}</td>
                        <td>${att.check_out || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editAttendance(${att.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteAttendance(${att.id})">Delete</button>
                        </td>
                    </tr>
                `;
                });
            }

            const tableBody = document.getElementById("attendanceTableBody");
            if (tableBody) {
                tableBody.innerHTML = tableRows;
            }
        })
        .catch(error => console.error("Error loading attendance:", error));
}

// ===================== CLEAR FORM =====================
function clearAttendanceForm() {
    if (document.getElementById("attendance_id")) document.getElementById("attendance_id").value = "";
    if (document.getElementById("employee")) document.getElementById("employee").value = "";
    if (document.getElementById("date")) document.getElementById("date").value = "";
    if (document.getElementById("status")) document.getElementById("status").value = "Present";
    if (document.getElementById("check_in")) document.getElementById("check_in").value = "";
    if (document.getElementById("check_out")) document.getElementById("check_out").value = "";
}

// ===================== SAVE (ADD / UPDATE) =====================
function saveAttendance() {
    let id = document.getElementById("attendance_id").value;
    if (id === "" || id === null) {
        addAttendance();
    } else {
        updateAttendance(id);
    }
}

// ===================== ADD ATTENDANCE =====================
function addAttendance() {
    let attendanceData = {
        employee: document.getElementById("employee").value,
        date: document.getElementById("date").value,
        status: document.getElementById("status").value,
        check_in: document.getElementById("check_in").value || null,
        check_out: document.getElementById("check_out").value || null
    };

    fetch(`${BASE_URL}/attendance/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(attendanceData)
    })
        .then(async response => {
            let data = await response.json();
            if (response.ok) {
                alert("Attendance Added Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        })
        .catch(err => console.error("Add attendance error:", err));
}

// ===================== EDIT ATTENDANCE =====================
function editAttendance(id) {
    fetch(`${BASE_URL}/attendance/${id}/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(item => {
            document.getElementById("attendance_id").value = item.id;
            document.getElementById("employee").value = item.employee;
            document.getElementById("date").value = item.date;
            document.getElementById("status").value = item.status;
            if (document.getElementById("check_in")) document.getElementById("check_in").value = item.check_in || "";
            if (document.getElementById("check_out")) document.getElementById("check_out").value = item.check_out || "";

            let modal = new bootstrap.Modal(document.getElementById("attendanceModal"));
            modal.show();
        })
        .catch(err => console.error("Edit fetch error:", err));
}

// ===================== UPDATE ATTENDANCE =====================
function updateAttendance(id) {
    let attendanceData = {
        employee: document.getElementById("employee").value,
        date: document.getElementById("date").value,
        status: document.getElementById("status").value,
        check_in: document.getElementById("check_in").value || null,
        check_out: document.getElementById("check_out").value || null
    };

    fetch(`${BASE_URL}/attendance/${id}/`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(attendanceData)
    })
        .then(async response => {
            let data = await response.json();
            if (response.ok) {
                alert("Attendance Updated Successfully");
                location.reload();
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        })
        .catch(err => console.error("Update attendance error:", err));
}

// ===================== DELETE ATTENDANCE =====================
function deleteAttendance(id) {
    if (confirm("Are you sure you want to delete this attendance record?")) {
        fetch(`${BASE_URL}/attendance/${id}/`, {
            method: "DELETE",
            headers: getHeaders()
        })
            .then(response => {
                if (response.ok) {
                    alert("Attendance Deleted Successfully");
                    loadAttendance();
                } else {
                    alert("Failed to delete attendance record.");
                }
            })
            .catch(err => console.error("Delete attendance error:", err));
    }
}

// ===================== SEARCH ATTENDANCE =====================
function searchAttendance() {
    let input = document.getElementById("searchAttendance").value.toLowerCase();
    let rows = document.querySelectorAll("#attendanceTableBody tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
    });
}