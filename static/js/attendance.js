// =========================================================
// ATTENDANCE CALENDAR JS
// =========================================================

const ATTENDANCE_BASE_URL = "http://127.0.0.1:8000/api";


// =========================================================
// GLOBAL VARIABLES
// =========================================================

let allEmployees = [];
let allAttendance = [];

let selectedEmployeeId = "";
let selectedEmployeeName = "";

let selectedStatus = "";

let currentCalendarDate = new Date();


// =========================================================
// HEADERS
// =========================================================

function attendanceHeaders() {

    const token = localStorage.getItem("access");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    return headers;
}


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    initializeYearDropdown();

    initializeDate();

    initializeEmployeeSearch();

    initializeStatusButton();

    initializeSearchButton();

    initializeMonthButtons();

    initializeViewButtons();

    renderCalendar();

});


// =========================================================
// YEAR DROPDOWN
// =========================================================

function initializeYearDropdown() {

    const yearSelect =
        document.getElementById("attendanceYearFilter");

    if (!yearSelect) {
        return;
    }

    const currentYear =
        new Date().getFullYear();

    yearSelect.innerHTML =
        `<option value="">Select Year</option>`;

    for (
        let year = currentYear;
        year >= currentYear - 10;
        year--
    ) {

        yearSelect.innerHTML += `
            <option value="${year}">
                ${year}
            </option>
        `;

    }

    yearSelect.value = currentYear;

}


// =========================================================
// DATE
// =========================================================

function initializeDate() {

    const dateInput =
        document.getElementById(
            "attendanceDateFilter"
        );

    if (!dateInput) {
        return;
    }

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    dateInput.value =
        `${year}-${month}-${day}`;

    currentCalendarDate =
        new Date(
            year,
            today.getMonth(),
            1
        );

}


// =========================================================
// EMPLOYEE SEARCH
// =========================================================

function initializeEmployeeSearch() {

    const input =
        document.getElementById(
            "attendanceEmployeeSearch"
        );

    const suggestions =
        document.getElementById(
            "employeeSuggestions"
        );

    if (!input || !suggestions) {
        return;
    }


    // Load employee data
    loadEmployees();


    // Search typing
    input.addEventListener(
        "input",
        function () {

            const search =
                input.value
                    .trim()
                    .toLowerCase();


            selectedEmployeeId = "";

            document.getElementById(
                "attendanceEmployeeId"
            ).value = "";


            if (!search) {

                suggestions.innerHTML = "";

                suggestions.style.display =
                    "none";

                return;

            }


            const filtered =
                allEmployees.filter(
                    employee => {

                        const name =
                            getEmployeeName(
                                employee
                            ).toLowerCase();

                        return name.includes(search);

                    }
                );


            showEmployeeSuggestions(
                filtered
            );

        }
    );


    // Click outside
    document.addEventListener(
        "click",
        function (event) {

            if (
                !event.target.closest(
                    ".employee-search-wrapper"
                )
            ) {

                suggestions.style.display =
                    "none";

            }

        }
    );

}


// =========================================================
// LOAD EMPLOYEES
// =========================================================

async function loadEmployees() {

    try {

        const response =
            await fetch(
                `${ATTENDANCE_BASE_URL}/employee/`,
                {
                    method: "GET",
                    headers: attendanceHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Employee API Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        allEmployees =
            Array.isArray(data)
                ? data
                : (
                    data.results || []
                );


        console.log(
            "Employees:",
            allEmployees
        );


    } catch (error) {

        console.error(
            "Employee loading error:",
            error
        );

    }

}


// =========================================================
// GET EMPLOYEE NAME
// =========================================================

function getEmployeeName(employee) {

    return (

        employee.name ||

        employee.full_name ||

        employee.employee_name ||

        (
            `${employee.first_name || ""} ${employee.last_name || ""
            }`
        ).trim() ||

        (
            employee.user_name ||
            employee.username ||
            ""
        )

    );

}


// =========================================================
// SHOW EMPLOYEE SUGGESTIONS
// =========================================================

function showEmployeeSuggestions(
    employees
) {

    const suggestions =
        document.getElementById(
            "employeeSuggestions"
        );

    if (!suggestions) {
        return;
    }


    suggestions.innerHTML = "";


    if (!employees.length) {

        suggestions.innerHTML = `
            <div class="employee-suggestion-item">
                <div class="employee-avatar-small">
                    ?
                </div>

                <div>
                    <div class="employee-suggestion-name">
                        No employee found
                    </div>
                </div>
            </div>
        `;

        suggestions.style.display =
            "block";

        return;

    }


    employees.forEach(
        employee => {

            const name =
                getEmployeeName(
                    employee
                );


            const firstLetter =
                name
                    ? name.charAt(0)
                        .toUpperCase()
                    : "E";


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "employee-suggestion-item";


            item.innerHTML = `

                <div class="employee-avatar-small">
                    ${firstLetter}
                </div>

                <div>

                    <div class="employee-suggestion-name">
                        ${escapeHtml(name || "Employee")}
                    </div>

                    <div class="employee-suggestion-id">
                        Employee ID: ${employee.id}
                    </div>

                </div>

            `;


            item.addEventListener(
                "click",
                function () {

                    selectEmployee(
                        employee
                    );

                }
            );


            suggestions.appendChild(
                item
            );

        }
    );


    suggestions.style.display =
        "block";

}


// =========================================================
// SELECT EMPLOYEE
// =========================================================

function selectEmployee(
    employee
) {

    const input =
        document.getElementById(
            "attendanceEmployeeSearch"
        );

    const hidden =
        document.getElementById(
            "attendanceEmployeeId"
        );

    const suggestions =
        document.getElementById(
            "employeeSuggestions"
        );


    const name =
        getEmployeeName(
            employee
        );


    selectedEmployeeId =
        String(employee.id);


    selectedEmployeeName =
        name;


    if (input) {

        input.value =
            name;

    }


    if (hidden) {

        hidden.value =
            employee.id;

    }


    if (suggestions) {

        suggestions.innerHTML =
            "";

        suggestions.style.display =
            "none";

    }

}


// =========================================================
// STATUS BUTTON
// =========================================================

function initializeStatusButton() {

    const button =
        document.getElementById(
            "attendanceStatusButton"
        );

    const menu =
        document.getElementById(
            "attendanceStatusMenu"
        );

    if (!button || !menu) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            menu.classList.toggle(
                "show"
            );

        }
    );


    const statusButtons =
        menu.querySelectorAll(
            "button"
        );


    statusButtons.forEach(
        statusButton => {

            statusButton.addEventListener(
                "click",
                function () {

                    selectedStatus =
                        this.dataset.status || "";


                    const text =
                        document.getElementById(
                            "attendanceStatusText"
                        );


                    if (text) {

                        text.innerText =
                            selectedStatus ||
                            "All Status";

                    }


                    menu.classList.remove(
                        "show"
                    );

                }
            );

        }
    );


    document.addEventListener(
        "click",
        function () {

            menu.classList.remove(
                "show"
            );

        }
    );

}


// =========================================================
// SEARCH BUTTON
// =========================================================

function initializeSearchButton() {

    const button =
        document.getElementById(
            "attendanceSearchBtn"
        );

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function () {

            await searchAttendance();

        }
    );

}


// =========================================================
// SEARCH ATTENDANCE
// =========================================================

async function searchAttendance() {

    const employeeId =
        document.getElementById(
            "attendanceEmployeeId"
        )?.value || "";


    const date =
        document.getElementById(
            "attendanceDateFilter"
        )?.value || "";


    const year =
        document.getElementById(
            "attendanceYearFilter"
        )?.value || "";


    // Employee selected?
    selectedEmployeeId =
        employeeId;


    // Date selected?
    if (date) {

        const selectedDate =
            new Date(
                date + "T00:00:00"
            );


        currentCalendarDate =
            new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                1
            );

    }

    else if (year) {

        currentCalendarDate =
            new Date(
                parseInt(year),
                currentCalendarDate.getMonth(),
                1
            );

    }


    try {

        showLoading();


        // IMPORTANT:
        // Backend currently does not filter
        // query parameters.
        // So fetch all attendance records.

        const response =
            await fetch(
                `${ATTENDANCE_BASE_URL}/attendance/`,
                {
                    method: "GET",
                    headers: attendanceHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Attendance API Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        allAttendance =
            Array.isArray(data)
                ? data
                : (
                    data.results || []
                );


        console.log(
            "Attendance data:",
            allAttendance
        );


        renderCalendar();


    } catch (error) {

        console.error(
            "Attendance fetch error:",
            error
        );


        showError(
            "Unable to load attendance data."
        );

    }

}


// =========================================================
// MONTH BUTTONS
// =========================================================
// =====================================================
// SMALL MONTHLY CALENDAR
// =====================================================

let calendarDate = new Date();

function renderAttendanceCalendar(records = []) {

    const calendar =
        document.getElementById("attendanceCalendarDays");

    const title =
        document.getElementById("calendarMonthTitle");

    if (!calendar || !title) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const monthName = calendarDate.toLocaleString(
        "default",
        {
            month: "long"
        }
    );

    title.innerText =
        `${monthName} ${year}`;

    calendar.innerHTML = "";

    // First day of month
    const firstDay =
        new Date(year, month, 1).getDay();

    // Total days
    const totalDays =
        new Date(year, month + 1, 0).getDate();

    // Empty cells before first date
    for (let i = 0; i < firstDay; i++) {

        calendar.innerHTML += `
            <div class="calendar-day empty"></div>
        `;
    }

    // Dates
    for (let day = 1; day <= totalDays; day++) {

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const record =
            records.find(item => {

                const recordDate =
                    item.date ||
                    item.attendance_date ||
                    "";

                return recordDate.substring(0, 10)
                    === dateString;

            });

        let statusClass = "no-record";

        if (record) {

            const status =
                String(record.status || "")
                    .toLowerCase()
                    .trim();

            if (status === "present") {
                statusClass = "present";
            }

            else if (status === "absent") {
                statusClass = "absent";
            }

            else if (status === "leave") {
                statusClass = "leave";
            }

            else if (status === "late") {
                statusClass = "late";
            }
        }

        calendar.innerHTML += `
            <div class="calendar-day ${statusClass}"
                 title="${dateString}">

                <span class="calendar-day-number">
                    ${day}
                </span>

            </div>
        `;
    }
}


function initializeMonthButtons() {

    const previous =
        document.getElementById(
            "previousMonthBtn"
        );

    const next =
        document.getElementById(
            "nextMonthBtn"
        );


    if (previous) {

        previous.addEventListener(
            "click",
            function () {

                currentCalendarDate =
                    new Date(
                        currentCalendarDate.getFullYear(),
                        currentCalendarDate.getMonth() - 1,
                        1
                    );

                renderCalendar();

            }
        );

    }


    if (next) {

        next.addEventListener(
            "click",
            function () {

                currentCalendarDate =
                    new Date(
                        currentCalendarDate.getFullYear(),
                        currentCalendarDate.getMonth() + 1,
                        1
                    );

                renderCalendar();

            }
        );

    }

}


// =========================================================
// VIEW BUTTONS
// =========================================================

function initializeViewButtons() {

    const monthlyButton =
        document.getElementById(
            "monthlyViewBtn"
        );

    const yearlyButton =
        document.getElementById(
            "yearlyViewBtn"
        );


    if (monthlyButton) {

        monthlyButton.addEventListener(
            "click",
            function () {

                document.getElementById(
                    "monthlyAttendance"
                ).style.display = "block";


                document.getElementById(
                    "yearlyAttendance"
                ).style.display = "none";


                monthlyButton.classList.add(
                    "active"
                );


                yearlyButton.classList.remove(
                    "active"
                );

            }
        );

    }


    if (yearlyButton) {

        yearlyButton.addEventListener(
            "click",
            function () {

                document.getElementById(
                    "monthlyAttendance"
                ).style.display = "none";


                document.getElementById(
                    "yearlyAttendance"
                ).style.display = "block";


                monthlyButton.classList.remove(
                    "active"
                );


                yearlyButton.classList.add(
                    "active"
                );


                createYearlySummary();

            }
        );

    }

}


// =========================================================
// RENDER CALENDAR
// =========================================================

function renderCalendar() {

    const calendar =
        document.getElementById(
            "attendanceCalendar"
        );


    const title =
        document.getElementById(
            "calendarMonthTitle"
        );


    if (!calendar || !title) {
        return;
    }


    const year =
        currentCalendarDate.getFullYear();


    const month =
        currentCalendarDate.getMonth();


    const monthName =
        currentCalendarDate.toLocaleString(
            "default",
            {
                month: "long"
            }
        );


    title.innerText =
        `${monthName} ${year}`;


    calendar.innerHTML =
        "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // Date filter
    const selectedDate =
        document.getElementById(
            "attendanceDateFilter"
        )?.value || "";


    let startDay = 1;


    if (selectedDate) {

        const filterDate =
            new Date(
                selectedDate + "T00:00:00"
            );


        if (
            filterDate.getFullYear() === year &&
            filterDate.getMonth() === month
        ) {

            startDay =
                filterDate.getDate();

        }

    }


    // Empty cells before first day
    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "calendar-day empty";

        calendar.appendChild(
            empty
        );

    }


    // Days
    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "calendar-day";


        // If selected date exists,
        // hide dates before selected date

        if (day < startDay) {

            cell.classList.add(
                "empty"
            );

            cell.innerHTML =
                "";

            calendar.appendChild(
                cell
            );

            continue;

        }


        const dateString =
            formatDate(
                year,
                month,
                day
            );


        const todayString =
            getTodayString();


        if (
            dateString ===
            todayString
        ) {

            cell.classList.add(
                "today"
            );

        }


        if (
            selectedDate &&
            dateString === selectedDate
        ) {

            cell.classList.add(
                "selected-date"
            );

        }


        const record =
            findAttendanceRecord(
                dateString
            );


        let status =
            record
                ? normalizeStatus(
                    record.status
                )
                : "No Record";


        // Apply status filter
        if (
            selectedStatus &&
            status !== selectedStatus
        ) {

            status =
                "No Record";

        }


        let statusClass =
            "no-record";


        if (
            status === "Present"
        ) {

            statusClass =
                "present";

        }

        else if (
            status === "Absent"
        ) {

            statusClass =
                "absent";

        }

        else if (
            status === "Leave"
        ) {

            statusClass =
                "leave";

        }


        cell.innerHTML = `

            <div class="calendar-day-number">
                ${day}
            </div>

            <div class="calendar-status ${statusClass}">
                ${status}
            </div>

            ${record
                ? `
                    <div class="calendar-time">
                        ${record.check_in
                    ? "IN: " +
                    formatTime(
                        record.check_in
                    )
                    : ""
                }
                    </div>

                    <div class="calendar-time">
                        ${record.check_out
                    ? "OUT: " +
                    formatTime(
                        record.check_out
                    )
                    : ""
                }
                    </div>
                `
                : ""
            }

        `;


        calendar.appendChild(
            cell
        );

    }


    updateCalendarSummary();

}


// =========================================================
// FIND ATTENDANCE RECORD
// =========================================================

function findAttendanceRecord(
    date
) {

    let records =
        allAttendance.filter(
            record => {

                const recordDate =
                    getRecordDate(
                        record
                    );

                return (
                    recordDate === date
                );

            }
        );


    // Employee filter
    if (selectedEmployeeId) {

        records =
            records.filter(
                record => {

                    const employeeId =
                        getRecordEmployeeId(
                            record
                        );

                    return (
                        String(employeeId) ===
                        String(selectedEmployeeId)
                    );

                }
            );

    }


    if (!records.length) {
        return null;
    }


    // Status filter
    if (selectedStatus) {

        const statusRecord =
            records.find(
                record =>
                    normalizeStatus(
                        record.status
                    ) === selectedStatus
            );


        return (
            statusRecord ||
            null
        );

    }


    return records[0];

}


// =========================================================
// GET RECORD DATE
// =========================================================

function getRecordDate(record) {

    return (
        record.date ||
        record.attendance_date ||
        ""
    ).substring(0, 10);

}


// =========================================================
// GET RECORD EMPLOYEE ID
// =========================================================

function getRecordEmployeeId(
    record
) {

    if (
        record.employee &&
        typeof record.employee === "object"
    ) {

        return (
            record.employee.id
        );

    }


    return (
        record.employee_id ||
        record.employee
    );

}


// =========================================================
// NORMALIZE STATUS
// =========================================================

function normalizeStatus(status) {

    const value =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    if (
        value === "present"
    ) {

        return "Present";

    }


    if (
        value === "absent"
    ) {

        return "Absent";

    }


    if (
        value === "leave"
    ) {

        return "Leave";

    }


    return "No Record";

}


// =========================================================
// CALENDAR DATE FORMAT
// =========================================================

function formatDate(
    year,
    month,
    day
) {

    return (

        year +
        "-" +
        String(
            month + 1
        ).padStart(2, "0") +
        "-" +
        String(day).padStart(
            2,
            "0"
        )

    );

}


// =========================================================
// TODAY
// =========================================================

function getTodayString() {

    const today =
        new Date();


    return formatDate(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

}


// =========================================================
// FORMAT TIME
// =========================================================

function formatTime(time) {

    if (!time) {
        return "";
    }


    return String(time)
        .substring(0, 5);

}


// =========================================================
// CALENDAR SUMMARY
// =========================================================

function updateCalendarSummary() {

    const year =
        currentCalendarDate.getFullYear();


    const month =
        currentCalendarDate.getMonth();


    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    let present = 0;
    let absent = 0;
    let leave = 0;
    let noRecord = 0;


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const date =
            formatDate(
                year,
                month,
                day
            );


        const record =
            findAttendanceRecord(
                date
            );


        if (!record) {

            noRecord++;

            continue;

        }


        const status =
            normalizeStatus(
                record.status
            );


        if (
            status === "Present"
        ) {

            present++;

        }

        else if (
            status === "Absent"
        ) {

            absent++;

        }

        else if (
            status === "Leave"
        ) {

            leave++;

        }

        else {

            noRecord++;

        }

    }


    setText(
        "calendarPresentCount",
        present
    );


    setText(
        "calendarAbsentCount",
        absent
    );


    setText(
        "calendarLeaveCount",
        leave
    );


    setText(
        "calendarNoRecordCount",
        noRecord
    );

}


// =========================================================
// YEARLY SUMMARY
// =========================================================

function createYearlySummary() {

    const selectedYear =
        document.getElementById(
            "attendanceYearFilter"
        )?.value;


    const year =
        selectedYear
            ? parseInt(
                selectedYear
            )
            : currentCalendarDate.getFullYear();


    let present = 0;
    let absent = 0;
    let leave = 0;


    let records =
        allAttendance.filter(
            record => {

                const date =
                    getRecordDate(
                        record
                    );

                return (
                    date.startsWith(
                        String(year)
                    )
                );

            }
        );


    if (selectedEmployeeId) {

        records =
            records.filter(
                record => {

                    return (
                        String(
                            getRecordEmployeeId(
                                record
                            )
                        ) ===
                        String(
                            selectedEmployeeId
                        )
                    );

                }
            );

    }


    records.forEach(
        record => {

            const status =
                normalizeStatus(
                    record.status
                );


            if (
                status === "Present"
            ) {

                present++;

            }

            else if (
                status === "Absent"
            ) {

                absent++;

            }

            else if (
                status === "Leave"
            ) {

                leave++;

            }

        }
    );


    setText(
        "yearPresent",
        present
    );


    setText(
        "yearAbsent",
        absent
    );


    setText(
        "yearLeave",
        leave
    );

}


// =========================================================
// SET TEXT
// =========================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.innerText =
            value;

    }

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );

    div.innerText =
        value || "";

    return div.innerHTML;

}


// =========================================================
// LOADING
// =========================================================

function showLoading() {

    const calendar =
        document.getElementById(
            "attendanceCalendar"
        );


    if (calendar) {

        calendar.innerHTML = `

            <div
                style="
                    grid-column:1 / -1;
                    padding:60px;
                    text-align:center;
                    color:#64748b;
                "
            >

                <i
                    class="bi bi-arrow-repeat"
                    style="
                        font-size:30px;
                    "
                ></i>

                <p>
                    Loading attendance...
                </p>

            </div>

        `;

    }

}


// =========================================================
// ERROR
// =========================================================

function showError(
    message
) {

    const calendar =
        document.getElementById(
            "attendanceCalendar"
        );


    if (calendar) {

        calendar.innerHTML = `

            <div
                style="
                    grid-column:1 / -1;
                    padding:60px;
                    text-align:center;
                    color:#dc2626;
                "
            >

                <i
                    class="bi bi-exclamation-circle"
                    style="
                        font-size:35px;
                    "
                ></i>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

        `;

    }

}