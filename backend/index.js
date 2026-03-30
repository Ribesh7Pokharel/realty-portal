const express = require("express");
const cors = require("cors");

// Initialize DB (runs migrations + seed)
require("./db/setup");

const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");
const favouriteRoutes = require("./routes/favourites");

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/favourites", favouriteRoutes);

// --- Health check ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// --- 404 handler ---
app.use((req, res) => res.status(404).json({ error: "Route not found." }));

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`🏠 Realty Portal API running on http://localhost:${PORT}`);
});
