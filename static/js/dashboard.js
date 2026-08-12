const BASE_URL = "http://127.0.0.1:8000/api";

function getHeaders() {
    const token = localStorage.getItem("access");
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

document.addEventListener("DOMContentLoaded", function () {
    loadDashboardCounts();
});

function loadDashboardCounts() {
    // 1. Total Employees
    fetch(`${BASE_URL}/employee/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            let count = Array.isArray(data) ? data.length : (data.results ? data.results.length : (data.count || 0));
            let el = document.getElementById("totalEmployees");
            if (el) el.innerText = count;
        })
        .catch(err => console.error("Employee fetch error:", err));

    // 2. Total Departments
    fetch(`${BASE_URL}/department/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            let count = Array.isArray(data) ? data.length : (data.results ? data.results.length : (data.count || 0));
            let el = document.getElementById("totalDepartments");
            if (el) el.innerText = count;
        })
        .catch(err => console.error("Department fetch error:", err));

    // 3. Today's Attendance
    fetch(`${BASE_URL}/attendance/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            let count = Array.isArray(data) ? data.length : (data.results ? data.results.length : (data.count || 0));
            let el = document.getElementById("totalAttendance");
            if (el) el.innerText = count;
        })
        .catch(err => console.error("Attendance fetch error:", err));

    // 4. Pending Leave
    fetch(`${BASE_URL}/leave/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            let list = Array.isArray(data) ? data : (data.results || []);
            let pendingCount = list.filter(item => item.status === 'Pending').length;
            let el = document.getElementById("pendingLeave");
            if (el) el.innerText = pendingCount;
        })
        .catch(err => console.error("Leave fetch error:", err));
}