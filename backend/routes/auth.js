const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/setup");
const { signToken } = require("../middleware/auth");

const router = express.Router();

// --- Validation helpers ---
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Check for existing user
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user
    const result = db
      .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
      .run(name.trim(), email.toLowerCase(), password_hash, "buyer");

    const user = { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase(), role: "buyer" };
    const token = signToken(user);

    return res.status(201).json({ message: "Account created successfully.", token, user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = signToken(payload);

    return res.json({
      message: "Login successful.",
      token,
      user: payload,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

// GET /api/auth/me — verify token and return current user
router.get("/me", require("../middleware/auth").authenticate, (req, res) => {
  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  return res.json({ user });
});

module.exports = router;
