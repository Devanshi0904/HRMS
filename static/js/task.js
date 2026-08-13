const BASE_URL = "http://127.0.0.1:8000/api";

// ===================== GET HEADERS (TOKEN HANDLING) =====================
function getHeaders() {
    let headers = {
        "Content-Type": "application/json"
    };
    let token = localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("access_token");
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    return headers;
}

document.addEventListener("DOMContentLoaded", function () {
    loadTasks();

    let assignBtn = document.getElementById("assignBtn");
    if (assignBtn) {
        assignBtn.style.display = "block";
    }
});

// ===================== LOAD TASKS =====================
function loadTasks() {
    fetch(`${BASE_URL}/tasks/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            let taskList = Array.isArray(data) ? data : (data.results || []);
            let tableRows = "";

            if (taskList.length === 0) {
                tableRows = `<tr><td colspan="9" class="text-center">No Tasks Found</td></tr>`;
            } else {
                taskList.forEach(task => {
                    let badgeColor = task.status === 'Completed' ? 'bg-success' : (task.status === 'In Progress' ? 'bg-warning text-dark' : 'bg-secondary');

                    tableRows += `
                    <tr>
                    
                        <td><strong>${task.title}</strong><br><small class="text-muted">${task.description || ''}</small></td>
                        <td>${task.assigned_to_name || 'Employee'}</td>
                        <td><span class="badge bg-info">${task.priority}</span></td>
                        <td>${task.due_date || '-'}</td>
                        <td><span class="badge ${badgeColor}">${task.status}</span></td>
                        <td>
                            <div class="progress" style="height: 15px;">
                                <div class="progress-bar" role="progressbar" style="width: ${task.progress_percentage}%;" aria-valuenow="${task.progress_percentage}" aria-valuemin="0" aria-valuemax="100">${task.progress_percentage}%</div>
                            </div>
                        </td>
                        <td>${task.employee_remarks || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editTask(${task.id})">Update</button>
                        </td>
                    </tr>
                `;
                });
            }
            document.getElementById("taskTableBody").innerHTML = tableRows;
        })
        .catch(err => console.error("Error loading tasks:", err));
}

// ===================== LOAD EMPLOYEES DROPDOWN =====================

function loadUsersDropdown() {
    return fetch(`${BASE_URL}/employee/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(response => response.json())
        .then(data => {
            let select = document.getElementById('assignedTo');
            if (!select) return;

            select.innerHTML = '<option value="">Select Employee</option>';


            let employeeList = Array.isArray(data) ? data : [];

            employeeList.forEach(emp => {
                let option = document.createElement('option');
                option.value = emp.user || emp.id;

                let empName = (emp.first_name || '') + ' ' + (emp.last_name || '') || emp.username || emp.name || ('Employee ' + emp.id);
                option.textContent = empName.trim();

                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading employees:', error));
}

// ===================== OPEN ADD MODAL =====================
function openAddTaskModal() {
    document.getElementById("task_id").value = "";
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("priority").value = "Low";
    document.getElementById("due_date").value = "";
    document.getElementById("progress_percentage").value = "0";
    document.getElementById("employee_remarks").value = "";
    document.getElementById("status").value = "Pending";

    setFieldsEditable(true);

    loadUsersDropdown().then(() => {
        document.getElementById("assignedTo").value = "";
        let modalElement = document.getElementById('taskModal');
        if (modalElement) {
            let myModal = new bootstrap.Modal(modalElement);
            myModal.show();
        }
    });
}

// ===================== EDIT / UPDATE TASK =====================

function editTask(id) {
    console.log("Editing Task ID:", id); 

    fetch(`${BASE_URL}/tasks/${id}/`, {
        method: "GET",
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(task => {
            
            document.getElementById("task_id").value = task.id;
            document.getElementById("title").value = task.title || "";
            document.getElementById("description").value = task.description || "";
            document.getElementById("priority").value = task.priority || "Low";
            document.getElementById("due_date").value = task.due_date || "";
            document.getElementById("status").value = task.status || "Pending";
            document.getElementById("progress_percentage").value = task.progress_percentage || 0;
            document.getElementById("employee_remarks").value = task.employee_remarks || "";
            document.getElementById("github_link").value = task.github_link || "";

            let isStaff = localStorage.getItem("is_staff") === "true" || localStorage.getItem("is_superuser") === "true";
            setFieldsEditable(isStaff);

            loadUsersDropdown().then(() => {
                document.getElementById("assignedTo").value = task.assigned_to || "";
                let modalElement = document.getElementById('taskModal');
                if (modalElement) {
                    let modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            });
        })
        .catch(err => console.error("Error fetching task details:", err));
}

function setFieldsEditable(isEditable) {
    document.getElementById("title").disabled = !isEditable;
    document.getElementById("description").disabled = !isEditable;
    document.getElementById("assignedTo").disabled = !isEditable;
    document.getElementById("priority").disabled = !isEditable;
    document.getElementById("due_date").disabled = !isEditable;

    document.getElementById("status").disabled = false;
    document.getElementById("progress_percentage").disabled = false;
    document.getElementById("employee_remarks").disabled = false;
}

// ===================== SAVE TASK (ADD OR UPDATE) =====================

function saveTask() {
    let id = document.getElementById("task_id").value;
    let isStaff = localStorage.getItem("is_staff") === "true" || localStorage.getItem("is_superuser") === "true";

    let titleVal = document.getElementById("title").value.trim();
    let descVal = document.getElementById("description").value.trim();
    let assignedVal = document.getElementById("assignedTo").value;
    let priorityVal = document.getElementById("priority").value;
    let dueDateVal = document.getElementById("due_date").value;
    let statusVal = document.getElementById("status").value;
    let progressVal = parseInt(document.getElementById("progress_percentage").value) || 0;
    let remarksVal = document.getElementById("employee_remarks").value.trim();

    let githubVal = document.getElementById("github_link").value.trim();

    let taskData = {};

    if (isStaff || !id) {
        taskData = {
            title: titleVal,
            description: descVal,

            assigned_to: assignedVal ? parseInt(assignedVal) : null,
            priority: priorityVal,
            due_date: dueDateVal || null,
            status: statusVal,
            progress_percentage: progressVal,
            employee_remarks: remarksVal,
            github_link: githubVal || null
        };
    } else {
        taskData = {
            status: statusVal,
            progress_percentage: progressVal,
            employee_remarks: remarksVal,
            github_link: githubVal || null
        };
    }

    let url = id ? `${BASE_URL}/tasks/${id}/` : `${BASE_URL}/tasks/`;
    let method = id ? "PATCH" : "POST";

    fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify(taskData)
    })
        .then(async res => {
            let data = await res.json();
            if (res.ok) {
                alert("Task Saved Successfully!");
                location.reload();
            } else {
                console.error("Server Error Response:", data);
                alert("Error: " + JSON.stringify(data));
            }
        })
        .catch(err => console.error("Error saving task:", err));
}