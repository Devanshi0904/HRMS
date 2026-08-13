// =========================================================
// ATTENDANCE JS
// =========================================================

const ATTENDANCE_BASE_URL = "http://127.0.0.1:8000/api";


function attendanceHeaders() {

    const token = localStorage.getItem("access");

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    setCurrentMonth();
    setYears();

    loadEmployees();
    loadAttendance();

});


// =========================================================
// CURRENT MONTH
// =========================================================

function setCurrentMonth() {

    const input = document.getElementById("attendanceMonth");

    if (!input) return;

    const today = new Date();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    input.value = `${today.getFullYear()}-${month}`;
}


// =========================================================
// YEAR DROPDOWN
// =========================================================

function setYears() {

    const select = document.getElementById("attendanceYear");

    if (!select) return;

    const currentYear = new Date().getFullYear();

    select.innerHTML = `<option value="">Select Year</option>`;

    for (let year = currentYear; year >= currentYear - 5; year--) {

        select.innerHTML += `
            <option value="${year}">
                ${year}
            </option>
        `;

    }
}


// =========================================================
// LOAD EMPLOYEES
// =========================================================

// =========================================================
// LOAD EMPLOYEES FOR SEARCH
// =========================================================

let attendanceEmployees = [];

function loadEmployees() {

    fetch(`${ATTENDANCE_BASE_URL}/employee/`, {
        method: "GET",
        headers: attendanceHeaders()
    })

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Employee API Error: " + response.status
                );
            }

            return response.json();

        })

        .then(data => {

            attendanceEmployees =
                Array.isArray(data)
                    ? data
                    : (data.results || []);

            setupEmployeeSearch();

        })

        .catch(error => {

            console.error(
                "Employee loading error:",
                error
            );

        });
}
// =========================================================
// EMPLOYEE SEARCH + SUGGESTIONS
// =========================================================

function setupEmployeeSearch() {

    const searchInput =
        document.getElementById(
            "attendanceEmployeeSearch"
        );

    const hiddenInput =
        document.getElementById(
            "attendanceEmployee"
        );

    const suggestions =
        document.getElementById(
            "employeeSuggestions"
        );


    if (!searchInput || !hiddenInput || !suggestions) {
        return;
    }


    searchInput.addEventListener("input", function () {

        const search =
            this.value
                .trim()
                .toLowerCase();


        hiddenInput.value = "";


        if (!search) {

            suggestions.innerHTML = "";
            suggestions.style.display = "none";

            loadAttendance();

            return;
        }


        const filteredEmployees =
            attendanceEmployees.filter(emp => {

                const name =
                    getEmployeeName(emp)
                        .toLowerCase();

                return name.includes(search);

            });


        suggestions.innerHTML = "";


        if (filteredEmployees.length === 0) {

            suggestions.innerHTML = `
                <div class="employee-no-result">
                    <i class="bi bi-person-x"></i>
                    No employee found
                </div>
            `;

            suggestions.style.display = "block";

            return;
        }


        filteredEmployees.forEach(emp => {

            const name =
                getEmployeeName(emp);


            const item =
                document.createElement("div");

            item.className =
                "employee-suggestion";


            item.innerHTML = `
                <div class="employee-suggestion-icon">
                    <i class="bi bi-person-fill"></i>
                </div>

                <div class="employee-suggestion-info">
                    <strong>${name}</strong>
                    <small>Employee ID: #${emp.id}</small>
                </div>
            `;


            item.addEventListener(
                "click",
                function () {

                    searchInput.value = name;

                    hiddenInput.value =
                        emp.id;

                    suggestions.innerHTML = "";

                    suggestions.style.display =
                        "none";

                    loadAttendance();

                }
            );


            suggestions.appendChild(item);

        });


        suggestions.style.display =
            "block";

    });


    // Click outside -> suggestions hide
    document.addEventListener(
        "click",
        function (event) {

            if (
                !event.target.closest(
                    ".employee-search-filter"
                )
            ) {

                suggestions.style.display =
                    "none";

            }

        }
    );
}
// =========================================================
// GET EMPLOYEE NAME
// =========================================================

function getEmployeeName(emp) {

    const firstName = emp.first_name || "";
    const lastName = emp.last_name || "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    if (fullName) {
        return fullName;
    }

    if (emp.username) {
        return emp.username;
    }

    return "Employee #" + emp.id;
}
// =========================================================
// LOAD ATTENDANCE
// =========================================================

function loadAttendance() {

    const month =
        document.getElementById("attendanceMonth")?.value || "";

    const employee =
        document.getElementById("attendanceEmployee")?.value || "";

    let url =
        `${ATTENDANCE_BASE_URL}/attendance/`;

    fetch(url, {
        method: "GET",
        headers: attendanceHeaders()
    })

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Attendance API Error: " + response.status
                );
            }

            return response.json();

        })

        .then(data => {

            console.log("Attendance API:", data);

            let records =
                Array.isArray(data)
                    ? data
                    : (data.results || []);

            /*
             * IMPORTANT:
             * Backend currently does not filter month/year.
             * So filtering is done here in frontend.
             */

            if (month) {

                const [selectedYear, selectedMonth] =
                    month.split("-");

                records = records.filter(record => {

                    const date =
                        record.date ||
                        record.attendance_date ||
                        "";

                    if (!date) {
                        return false;
                    }

                    const recordYear =
                        date.substring(0, 4);

                    const recordMonth =
                        date.substring(5, 7);

                    return (
                        recordYear === selectedYear &&
                        recordMonth === selectedMonth
                    );

                });

            }

            if (employee) {

                records = records.filter(record => {

                    return String(record.employee) ===
                        String(employee);

                });

            }

            displayAttendance(records);

        })

        .catch(error => {

            console.error(
                "Attendance loading error:",
                error
            );

        });
}
// =========================================================
// DISPLAY ATTENDANCE
// =========================================================

function displayAttendance(records) {

    const tbody =
        document.getElementById("attendanceTableBody");

    const empty =
        document.getElementById("emptyAttendance");


    if (!tbody) return;


    tbody.innerHTML = "";


    if (records.length === 0) {

        if (empty) {
            empty.style.display = "block";
        }

        updateStatistics([]);

        return;

    }


    if (empty) {
        empty.style.display = "none";
    }


    records.forEach(record => {

        const employee =
            record.employee_name ||
            record.employee?.name ||
            record.employee_name ||
            "Employee";


        const date =
            record.date ||
            record.attendance_date ||
            "-";


        const checkIn =
            record.check_in ||
            record.check_in_time ||
            "-";


        const checkOut =
            record.check_out ||
            record.check_out_time ||
            "-";


        const status =
            record.status ||
            "Present";


        const workingHours =
            calculateWorkingHours(
                checkIn,
                checkOut
            );


        const statusClass =
            status.toLowerCase().replace(/\s+/g, "-");


        tbody.innerHTML += `

            <tr>

                <td>
                    #${record.id || "-"}
                </td>

                <td>
                    <strong>
                        ${employee}
                    </strong>
                </td>

                <td>
                    ${date}
                </td>

                <td>
                    ${checkIn}
                </td>

                <td>
                    ${checkOut}
                </td>

                <td>
                    ${workingHours}
                </td>

                <td>

                    <span class="
                        attendance-status
                        ${statusClass}
                    ">

                        ${status}

                    </span>

                </td>

                <td>

                    <button
                        class="
                            attendance-action-btn
                            attendance-edit-btn
                        "
                        onclick="editAttendance(${record.id})">

                        <i class="bi bi-pencil"></i>

                    </button>


                    <button
                        class="
                            attendance-action-btn
                            attendance-delete-btn
                        "
                        onclick="deleteAttendance(${record.id})">

                        <i class="bi bi-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });


    updateStatistics(records);

}


// =========================================================
// STATISTICS
// =========================================================

function updateStatistics(records) {

    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;

    records.forEach(record => {

        const status =
            (record.status || "")
                .toLowerCase();

        if (status === "present") {
            present++;
        }

        else if (status === "absent") {
            absent++;
        }

        else if (status === "half day") {
            halfDay++;
        }

        else if (status === "leave") {
            leave++;
        }

    });

    const total =
        document.getElementById("totalEmployees");

    const presentElement =
        document.getElementById("presentCount");

    const absentElement =
        document.getElementById("absentCount");

    const lateElement =
        document.getElementById("lateCount");

    const leaveElement =
        document.getElementById("leaveCount");

    if (total)
        total.innerText = records.length;

    if (presentElement)
        presentElement.innerText = present;

    if (absentElement)
        absentElement.innerText = absent;

    if (lateElement)
        lateElement.innerText = halfDay;

    if (leaveElement)
        leaveElement.innerText = leave;
}


// =========================================================
// WORKING HOURS
// =========================================================

function calculateWorkingHours(checkIn, checkOut) {

    if (
        !checkIn ||
        !checkOut ||
        checkIn === "-" ||
        checkOut === "-"
    ) {
        return "-";
    }


    const start =
        new Date(`2000-01-01T${checkIn}`);

    const end =
        new Date(`2000-01-01T${checkOut}`);


    let difference =
        (end - start) / 1000;


    if (difference < 0) {
        difference += 24 * 60 * 60;
    }


    const hours =
        Math.floor(difference / 3600);


    const minutes =
        Math.floor((difference % 3600) / 60);


    return `${hours}h ${minutes}m`;

}


// =========================================================
// FILTER STATUS
// =========================================================

function filterAttendance() {

    const status =
        document.getElementById(
            "attendanceStatus"
        ).value.toLowerCase();


    const rows =
        document.querySelectorAll(
            "#attendanceTableBody tr"
        );


    rows.forEach(row => {

        if (!status) {

            row.style.display = "";

            return;

        }


        const text =
            row.innerText.toLowerCase();


        row.style.display =
            text.includes(status)
                ? ""
                : "none";

    });

}


// =========================================================
// MODAL PREPARE
// =========================================================

function prepareAttendanceForm() {

    document.getElementById(
        "attendance_id"
    ).value = "";


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "attendanceDate"
    ).value = today;


    document.getElementById(
        "checkIn"
    ).value = "";


    document.getElementById(
        "checkOut"
    ).value = "";


    document.getElementById(
        "markStatus"
    ).value = "Present";

}


// =========================================================
// SAVE ATTENDANCE
// =========================================================

function saveAttendance() {

    const employee =
        document.getElementById(
            "markEmployee"
        ).value;


    const date =
        document.getElementById(
            "attendanceDate"
        ).value;


    const checkIn =
        document.getElementById(
            "checkIn"
        ).value;


    const checkOut =
        document.getElementById(
            "checkOut"
        ).value;


    const status =
        document.getElementById(
            "markStatus"
        ).value;


    if (!employee) {

        alert("Please select employee.");

        return;

    }


    if (!date) {

        alert("Please select attendance date.");

        return;

    }


    const payload = {

        employee: employee,

        date: date,

        check_in: checkIn || null,

        check_out: checkOut || null,

        status: status

    };


    fetch(
        `${ATTENDANCE_BASE_URL}/attendance/`,
        {

            method: "POST",

            headers: attendanceHeaders(),

            body: JSON.stringify(payload)

        }
    )

        .then(async response => {

            const data =
                await response.json();


            if (response.ok) {

                alert(
                    "Attendance saved successfully."
                );


                const modal =
                    bootstrap.Modal.getInstance(
                        document.getElementById(
                            "attendanceModal"
                        )
                    );


                if (modal) {
                    modal.hide();
                }


                loadAttendance();

            }

            else {

                alert(
                    "Error: " +
                    JSON.stringify(data)
                );

            }

        })

        .catch(error => {

            console.error(
                "Save attendance error:",
                error
            );

            alert(
                "Unable to save attendance."
            );

        });

}


// =========================================================
// DELETE
// =========================================================

function deleteAttendance(id) {

    if (
        !confirm(
            "Are you sure you want to delete this attendance?"
        )
    ) {
        return;
    }


    fetch(
        `${ATTENDANCE_BASE_URL}/attendance/${id}/`,
        {

            method: "DELETE",

            headers: attendanceHeaders()

        }
    )

        .then(response => {

            if (response.ok) {

                alert(
                    "Attendance deleted successfully."
                );

                loadAttendance();

            }

            else {

                alert(
                    "Failed to delete attendance."
                );

            }

        })

        .catch(error => {

            console.error(
                "Delete error:",
                error
            );

        });

}


// =========================================================
// EDIT
// =========================================================

function editAttendance(id) {

    fetch(
        `${ATTENDANCE_BASE_URL}/attendance/${id}/`,
        {

            method: "GET",

            headers: attendanceHeaders()

        }
    )

        .then(response => response.json())

        .then(data => {

            document.getElementById(
                "attendance_id"
            ).value = data.id;


            document.getElementById(
                "markEmployee"
            ).value =
                data.employee;


            document.getElementById(
                "attendanceDate"
            ).value =
                data.date;


            document.getElementById(
                "checkIn"
            ).value =
                data.check_in || "";


            document.getElementById(
                "checkOut"
            ).value =
                data.check_out || "";


            document.getElementById(
                "markStatus"
            ).value =
                data.status || "Present";


            const modal =
                new bootstrap.Modal(
                    document.getElementById(
                        "attendanceModal"
                    )
                );


            modal.show();

        })

        .catch(error => {

            console.error(
                "Edit attendance error:",
                error
            );

        });

}


// =========================================================
// MONTHLY / YEARLY VIEW
// =========================================================

function showMonthlyView() {

    document.getElementById(
        "monthlyAttendance"
    ).style.display = "block";


    document.getElementById(
        "yearlyAttendance"
    ).style.display = "none";


    document.getElementById(
        "monthlyViewBtn"
    ).classList.add("active");


    document.getElementById(
        "yearlyViewBtn"
    ).classList.remove("active");

}


function showYearlyView() {

    document.getElementById(
        "monthlyAttendance"
    ).style.display = "none";


    document.getElementById(
        "yearlyAttendance"
    ).style.display = "block";


    document.getElementById(
        "monthlyViewBtn"
    ).classList.remove("active");


    document.getElementById(
        "yearlyViewBtn"
    ).classList.add("active");


    loadYearlyAttendance();

}


// =========================================================
// YEARLY ATTENDANCE
// =========================================================

function loadYearlyAttendance() {

    const year =
        document.getElementById(
            "attendanceYear"
        )?.value;

    if (!year) {
        return;
    }

    const employee =
        document.getElementById(
            "attendanceEmployee"
        )?.value || "";

    fetch(
        `${ATTENDANCE_BASE_URL}/attendance/`,
        {
            method: "GET",
            headers: attendanceHeaders()
        }
    )

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Attendance API Error: " +
                    response.status
                );
            }

            return response.json();

        })

        .then(data => {

            let records =
                Array.isArray(data)
                    ? data
                    : (data.results || []);

            /*
             * Filter selected year
             */

            records = records.filter(record => {

                const date =
                    record.date ||
                    record.attendance_date ||
                    "";

                return date.substring(0, 4) ===
                    String(year);

            });

            /*
             * Filter employee
             */

            if (employee) {

                records = records.filter(record => {

                    return String(record.employee) ===
                        String(employee);

                });

            }

            createYearlyReport(records);

        })

        .catch(error => {

            console.error(
                "Yearly attendance error:",
                error
            );

        });
}


// =========================================================
// YEARLY REPORT
// =========================================================

function createYearlyReport(records) {

    const tbody =
        document.getElementById(
            "yearlyTableBody"
        );


    tbody.innerHTML = "";


    const months = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];


    months.forEach((month, index) => {

        const monthNumber =
            String(index + 1)
                .padStart(2, "0");


        const monthRecords =
            records.filter(record => {

                const date =
                    record.date ||
                    record.attendance_date ||
                    "";


                return date.substring(5, 7)
                    === monthNumber;

            });


        let present = 0;
        let absent = 0;
        let late = 0;
        let leave = 0;


        monthRecords.forEach(record => {

            const status =
                (record.status || "")
                    .toLowerCase();


            if (status === "present") {
                present++;
            }

            else if (status === "absent") {
                absent++;
            }

            else if (status === "late") {
                late++;
            }

            else if (status === "leave") {
                leave++;
            }

        });


        const workingDays =
            present +
            absent +
            late +
            leave;


        const attendancePercent =
            workingDays > 0
                ? Math.round(
                    ((present + late) /
                        workingDays) * 100
                )
                : 0;


        tbody.innerHTML += `

            <tr>

                <td>
                    <strong>
                        ${month}
                    </strong>
                </td>

                <td>
                    <span class="attendance-status present">
                        ${present}
                    </span>
                </td>

                <td>
                    <span class="attendance-status absent">
                        ${absent}
                    </span>
                </td>

                <td>
                    <span class="attendance-status late">
                        ${late}
                    </span>
                </td>

                <td>
                    <span class="attendance-status leave">
                        ${leave}
                    </span>
                </td>

                <td>
                    ${workingDays}
                </td>

                <td>
                    <strong>
                        ${attendancePercent}%
                    </strong>
                </td>

            </tr>

        `;

    });

}