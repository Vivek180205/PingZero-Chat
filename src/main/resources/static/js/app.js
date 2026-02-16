let stompClient = null;
let token = null;
let currentUser = null;

/* LOGIN */
function login() {

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.text())
        .then(data => {

            token = data;
            localStorage.setItem("jwt", token);
            currentUser = username.toLowerCase();

            document.getElementById("loginSection").style.display = "none";
            document.getElementById("chatSection").style.display = "block";

            connectWebSocket();
        })
        .catch(error => {
            alert("Login failed");
            console.error(error);
        });
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

            stompClient.subscribe('/topic/messages', function (message) {
                showMessage(JSON.parse(message.body));
            });

            stompClient.subscribe('/user/queue/history', function (message) {

                const history = JSON.parse(message.body);
                history.forEach(msg => showMessage(msg));
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
