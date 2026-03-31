import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form.username, form.password);
      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err?.response?.data?.detail || err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="center-screen">
      <div className="login-card">
        <h1>Medical Store Management</h1>
        <p className="muted">Admin Login</p>

        {error && <div className="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="grid-form">
          <label>
            <span>Username</span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
