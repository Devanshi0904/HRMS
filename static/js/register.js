const BASE_URL = "http://127.0.0.1:8000";

function getData() {

    return {

        username: username.value,
        password: password.value,
        first_name: first_name.value,
        last_name: last_name.value,
        email: email.value

    };

}

function registerUser() {

    fetch(BASE_URL + "/register/", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(getData())

    })

    .then(async res => {

        let data = await res.json();

        if (res.ok) {

            alert("Register Successfully");

            window.location.href = "/";

        } else {

            alert(JSON.stringify(data));

        }

    });

}