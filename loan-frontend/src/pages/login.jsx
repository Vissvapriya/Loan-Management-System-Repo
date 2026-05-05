import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const url = isRegistering
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    const payload = isRegistering
      ? { name, email, password, role }
      : { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred");
      }

      // Store the token and user details
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Navigate based on user role
      if (data.user.role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Loan Management System</h2>
        <p className="subtitle">
          {isRegistering ? "Create your account" : "Login to your account"}
        </p>

        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="Enter Full Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            >
              <option value="customer">Customer</option>
              <option value="owner">Owner</option>
            </select>
          </>
        )}

        <input
          type="email"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <input
          type="password"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing..." : isRegistering ? "Register" : "Login"}
        </button>

        <p 
          style={{ marginTop: "15px", cursor: "pointer", color: "#3498db", fontSize: "0.9em" }}
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
          }}
        >
          {isRegistering 
            ? "Already have an account? Login here" 
            : "Don't have an account? Register here"}
        </p>
      </div>
    </div>
  );
}

export default Login;