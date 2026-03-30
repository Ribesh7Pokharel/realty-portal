const express = require("express");
const db = require("../db/setup");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/favourites — get current user's favourites
router.get("/", authenticate, (req, res) => {
  try {
    const favourites = db
      .prepare(
        `
        SELECT p.*, f.created_at AS favourited_at
        FROM favourites f
        JOIN properties p ON p.id = f.property_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
      `
      )
      .all(req.user.id);

    return res.json({ favourites });
  } catch (err) {
    console.error("Favourites fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch favourites." });
  }
});

// POST /api/favourites/:propertyId — add to favourites
router.post("/:propertyId", authenticate, (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID." });
    }

    // Check property exists
    const property = db.prepare("SELECT id FROM properties WHERE id = ?").get(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    // Check not already favourited
    const existing = db
      .prepare("SELECT id FROM favourites WHERE user_id = ? AND property_id = ?")
      .get(req.user.id, propertyId);
    if (existing) {
      return res.status(409).json({ error: "Property is already in your favourites." });
    }

    db.prepare("INSERT INTO favourites (user_id, property_id) VALUES (?, ?)").run(req.user.id, propertyId);

    return res.status(201).json({ message: "Property added to favourites." });
  } catch (err) {
    console.error("Add favourite error:", err);
    return res.status(500).json({ error: "Failed to add favourite." });
  }
});

// DELETE /api/favourites/:propertyId — remove from favourites
router.delete("/:propertyId", authenticate, (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID." });
    }

    // Enforce ownership — only delete if it belongs to this user
    const result = db
      .prepare("DELETE FROM favourites WHERE user_id = ? AND property_id = ?")
      .run(req.user.id, propertyId);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Favourite not found." });
    }

    return res.json({ message: "Property removed from favourites." });
  } catch (err) {
    console.error("Remove favourite error:", err);
    return res.status(500).json({ error: "Failed to remove favourite." });
  }
});

module.exports = router;
