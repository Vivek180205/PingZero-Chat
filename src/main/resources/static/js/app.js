let stompClient = null;
let token = null;
let currentUser = null;


/* Showing Sign Up */
function showSignUp(){
    document.getElementById("signUpSection").style.display = "flex";
    document.getElementById("loginSection").style.display = "none";
}
/* Showing Login */
function showLogin(){
    document.getElementById("loginSection").style.display = "flex";
    document.getElementById("signUpSection").style.display = "none";
}

/* LOGIN */
function login() {

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username || !password) {
        alert("Enter username and password");
        return;
    }

    fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Invalid credentials");
            }
            return response.text();
        })
        .then(data => {

            token = data;
            localStorage.setItem("jwt", token);
            currentUser = username.toLowerCase();

            document.getElementById("loginSection").style.display = "none";
            document.getElementById("signUpSection").style.display = "none";
            document.getElementById("chatSection").style.display = "block";

            connectWebSocket();
        })
        .catch(error => {
            alert("Login failed");
            console.error(error);
        });
}

/* SIGN UP */
function signUp(){

    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;

    fetch("/auth/register",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    }).then(response => {
        if(response.ok){
            alert("Signup Successful. Please login.");
            showLogin();
        }
        else {
            alert("Signup failed!");
            }
        })
        .catch( error =>
        console.error("ERROR:"+ error));
}

/* CONNECT WEBSOCKET */
function connectWebSocket() {

    const socket = new SockJS('/chat');

    stompClient = new StompJs.Client({
        webSocketFactory: () => socket,
        connectHeaders: {
            Authorization: "Bearer " + token
        },
        onConnect: function () {

            // MESSAGE SUBSCRIBE
            stompClient.subscribe('/topic/messages', function (message) {
                showMessage(JSON.parse(message.body));
            });

            // HISTORY
            stompClient.subscribe('/user/queue/history', function (message) {
                const history = JSON.parse(message.body);
                history.forEach(msg => showMessage(msg));
            });

            // TYPING SUBSCRIBE
            stompClient.subscribe('/topic/typing', function (message) {

                const data = JSON.parse(message.body);

                if (data.user === currentUser) return;

                const indicator = document.getElementById("typingIndicator");

                if (data.status === "START") {
                    indicator.innerText = data.user + " is typing...";
                } else {
                    indicator.innerText = "";
                }
            });


            stompClient.publish({
                destination: "/app/history"
            });
        }
    });

    stompClient.activate();
}

/* SEND MESSAGE */
function sendMessage() {

    const content = document.getElementById("message").value;

    if (!content.trim()) return;

    stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify({
            content: content,
            type: "CHAT"
        })
    });

    document.getElementById("message").value = "";
}

/* DISPLAY MESSAGE */
function showMessage(message) {

    const chat = document.getElementById("chat");

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");

    if (message.sender === currentUser) {
        msgDiv.classList.add("self");
        msgDiv.innerHTML = `
            <div class="message-content">${message.content}</div>
        `;
    } else {
        msgDiv.classList.add("other");
        msgDiv.innerHTML = `
            <div class="sender">${message.sender}</div>
            <div class="message-content">${message.content}</div>
        `;
    }

    chat.appendChild(msgDiv);
    chat.scrollTop = chat.scrollHeight;
}

/* ENTER KEY SEND */
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

/* TYPING EVENT SEND */
document.addEventListener("DOMContentLoaded", function () {

    const inputField = document.getElementById("message");

    if (!inputField) return;

    let typingTimer = null;
    let typing = false;

    inputField.addEventListener("input", function () {

        if (!stompClient || !stompClient.connected) return;

        if (!typing) {
            typing = true;

            stompClient.publish({
                destination: "/app/chat.typing",
                body: JSON.stringify({ status: "START" })
            });
        }

        clearTimeout(typingTimer);

        typingTimer = setTimeout(() => {
            typing = false;

            stompClient.publish({
                destination: "/app/chat.typing",
                body: JSON.stringify({ status: "STOP" })
            });
        }, 1500);
    });

});

