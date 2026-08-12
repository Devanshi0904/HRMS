document.getElementById("loginForm").addEventListener("submit", function(e) {

    e.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    fetch("http://127.0.0.1:8000/login/", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: username,
            password: password
        })

    })

    .then(response => response.json())

    .then(data => {

        console.log(data);

        if (data.access) {

            // Save Login Data
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            localStorage.setItem("role", data.role);

            if (data.employee_id) {
                localStorage.setItem("employee_id", data.employee_id);
            }

            document.getElementById("msg").innerHTML =
                "<span class='text-success'>Login Successful...</span>";

            setTimeout(function() {

                // ADMIN
                if (data.role === "admin") {

                    window.location.href = "/dashboard/";

                }

                // EMPLOYEE

                else if (data.role === "employee") {
                    window.location.href = "/employee-dashboard/";
                }

            }, 700);

        }

        else {

            document.getElementById("msg").innerHTML =
                "<span class='text-danger'>" +
                (data.message || "Invalid Username or Password") +
                "</span>";

        }

    })

    .catch(error => {

        document.getElementById("msg").innerHTML =
            "<span class='text-danger'>Server Error</span>";

        console.log(error);

    });

});