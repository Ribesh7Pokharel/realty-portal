const express = require("express");
const db = require("../db/setup");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/properties — list all properties with favourite status for current user
router.get("/", authenticate, (req, res) => {
  try {
    const properties = db
      .prepare(
        `
        SELECT p.*,
          CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
        FROM properties p
        LEFT JOIN favourites f ON f.property_id = p.id AND f.user_id = ?
        ORDER BY p.created_at DESC
      `
      )
      .all(req.user.id);

    return res.json({ properties });
  } catch (err) {
    console.error("Properties error:", err);
    return res.status(500).json({ error: "Failed to fetch properties." });
  }
});

// GET /api/properties/:id
router.get("/:id", authenticate, (req, res) => {
  try {
    const property = db
      .prepare(
        `
        SELECT p.*,
          CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
        FROM properties p
        LEFT JOIN favourites f ON f.property_id = p.id AND f.user_id = ?
        WHERE p.id = ?
      `
      )
      .get(req.user.id, req.params.id);

    if (!property) return res.status(404).json({ error: "Property not found." });
    return res.json({ property });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch property." });
  }
});

module.exports = router;
