import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { useToast } from "../components/Toast";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastEl } = useToast();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFieldError((fe) => ({ ...fe, [e.target.name]: null }));
  }

  function validate() {
    const errors = {};
    if (mode === "register" && (!form.name || form.name.trim().length < 2)) {
      errors.name = "Name must be at least 2 characters.";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email.";
    }
    if (!form.password || form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    setFieldError(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({ name: form.name, email: form.email, password: form.password });

      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setForm({ name: "", email: "", password: "" });
    setFieldError({});
  }

  return (
    <div style={styles.page}>
      <ToastEl />
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.logo}>✦ Realty Portal</div>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Find your perfect home</h1>
          <p style={styles.heroSub}>Save your favourite properties and manage your search in one beautiful place.</p>
        </div>
        <div style={styles.decoration} />
      </div>

      {/* Right panel — form */}
      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>{mode === "login" ? "Welcome back" : "Create account"}</h2>
          <p style={styles.formSub}>
            {mode === "login" ? "Sign in to your buyer portal" : "Start saving your favourite properties"}
          </p>

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            {mode === "register" && (
              <Field
                label="Full Name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                error={fieldError.name}
              />
            )}
            <Field
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              error={fieldError.email}
            />
            <Field
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              error={fieldError.password}
            />

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8, padding: "14px" }} disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p style={styles.switch}>
            {mode === "login" ? "New to Realty Portal? " : "Already have an account? "}
            <button onClick={switchMode} style={styles.switchLink}>
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange, placeholder, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#1a1714", letterSpacing: "0.02em" }}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: "12px 14px",
          border: `1.5px solid ${error ? "#8b3a2a" : "#e0d9d0"}`,
          borderRadius: 4,
          fontSize: 14,
          outline: "none",
          background: "#fff",
          color: "#1a1714",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = error ? "#8b3a2a" : "#c9a84c")}
        onBlur={(e) => (e.target.style.borderColor = error ? "#8b3a2a" : "#e0d9d0")}
      />
      {error && <span style={{ fontSize: 12, color: "#8b3a2a" }}>{error}</span>}
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
  },
  left: {
    flex: 1,
    background: "#1a1714",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px",
    position: "relative",
    overflow: "hidden",
  },
  logo: {
    fontFamily: "Playfair Display, serif",
    fontSize: 20,
    color: "#c9a84c",
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
  hero: { zIndex: 1 },
  heroTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: "clamp(32px, 4vw, 52px)",
    color: "#f8f5f0",
    lineHeight: 1.15,
    marginBottom: 20,
  },
  heroSub: { fontSize: 16, color: "#8a8480", lineHeight: 1.7, maxWidth: 360 },
  decoration: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 400,
    height: 400,
    border: "60px solid #c9a84c18",
    borderRadius: "50%",
  },
  right: {
    width: "min(100%, 480px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    background: "#f8f5f0",
  },
  formBox: { width: "100%", maxWidth: 380 },
  formTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: 32,
    color: "#1a1714",
    marginBottom: 8,
  },
  formSub: { fontSize: 14, color: "#6b6560", marginBottom: 36 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  switch: { textAlign: "center", marginTop: 28, fontSize: 14, color: "#6b6560" },
  switchLink: {
    background: "none",
    border: "none",
    color: "#c9a84c",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
  },
};
