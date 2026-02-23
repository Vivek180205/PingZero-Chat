import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {

    if (!username.trim() || !password.trim()) {
      alert("All fields required");
      return;
    }

    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      alert("Invalid credentials");
      return;
    }

    const token = await response.text();
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username.toLowerCase());

    navigate("/chat");
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Login</h2>

        <input
          placeholder="Username"
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button onClick={login}>Sign In</button>
        <p className="switch-text">
            Don't have an account?{" "}
            <span onClick={()=>navigate("/signup")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}