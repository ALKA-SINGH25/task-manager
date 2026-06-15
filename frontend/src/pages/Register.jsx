import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthActions from "../hooks/useAuth";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { register, error, loading } = useAuthActions();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const success = await register(form.name, form.email, form.password);
    if (success) navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <span style={{ 
            background: 'var(--gradient-primary)', 
            padding: '2px 6px', 
            borderRadius: '6px', 
            color: '#fff', 
            marginRight: '6px',
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
          }}>✓</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: '800' }}>TaskFlow</span>
        </div>
        <div className="auth-title">Create Account</div>
        <div className="auth-subtitle">Get started for free</div>

        <input
          className="input"
          placeholder="Full name..."
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Email address..."
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input"
          placeholder="Password..."
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <div className="auth-error">{error}</div>}

        <button
          className="btn-submit auth-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <div className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;