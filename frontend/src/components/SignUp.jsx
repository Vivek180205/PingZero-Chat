import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function SignUp() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {

    if (!username.trim() || !password.trim()) {
      alert("All fields required");
      return;
    }

    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      alert("Signup successful. Please login.");
      navigate("/");
    } else {
      alert("Signup failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Sign Up</h2>

        <input
          placeholder="Username"
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button onClick={register}>Register</button>

        <p className="switch-text">
          Already have an account?{" "}
          <span onClick={()=>navigate("/")}>Sign In</span>
        </p>
      </div>
    </div>
  );
}