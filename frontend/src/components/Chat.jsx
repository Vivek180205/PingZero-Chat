import { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "../styles/chat.css";

export default function Chat() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const chatRef = useRef(null);
  const typingTimeout = useRef(null);
  const stompRef = useRef(null);

  const currentUser = sessionStorage.getItem("username");
  const token = sessionStorage.getItem("token");

  /* ================= CONNECT WEBSOCKET ================= */
  useEffect(() => {

    const socket = new SockJS("http://localhost:8080/chat");

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: "Bearer " + token
      },
      onConnect: () => {

        // 🔥 Live messages
        client.subscribe("/topic/messages", (msg) => {
          const message = JSON.parse(msg.body);
          setMessages(prev => [...prev, message]);
        });

        // 🔥 History
        client.subscribe("/user/queue/history", (msg) => {
          const history = JSON.parse(msg.body);
          setMessages(history);
        });

        // 🔥 Typing
        client.subscribe("/topic/typing", (msg) => {
          const data = JSON.parse(msg.body);

          if (data.user !== currentUser) {
            if (data.status === "START") {
              setTypingUser(data.user);
            } else {
              setTypingUser("");
            }
          }
        });

        // request history
        client.publish({ destination: "/app/history" });
      }
    });

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
    };

  }, [token, currentUser]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {

    if (!input.trim()) return;
    if (!stompRef.current) return;

    stompRef.current.publish({
      destination: "/app/sendMessage",
      body: JSON.stringify({
        content: input,
        type: "CHAT"
      })
    });

    setInput("");
  };

  /* ================= TYPING EVENT ================= */
  const handleTyping = (value) => {

    setInput(value);

    if (!stompRef.current) return;

    stompRef.current.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ status: "START" })
    });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      stompRef.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({ status: "STOP" })
      });
    }, 1500);
  };

  /* ================= ENTER KEY SEND ================= */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="chat-container">

      <header>
        PingZero 🚀
        <button className="logout-btn" onClick={logout}>Logout</button>
      </header>

      <div className="chat-box" ref={chatRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === currentUser ? "self" : "other"}`}
          >
            {msg.sender !== currentUser && (
              <div className="sender">{msg.sender}</div>
            )}
            <div className="content">{msg.content}</div>
          </div>
        ))}
      </div>

      {typingUser && (
        <div className="typing-indicator">
          {typingUser} is typing...
        </div>
      )}

      <div className="input-area">
        <input
          value={input}
          onChange={(e)=>handleTyping(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}