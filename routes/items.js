const express = require("express");
const { Item } = require("../models");
const router = express.Router();
const auth = require("../middleware/auth");
const { Op } = require("sequelize");
const rateLimit = require("express-rate-limit");
let csrfProtection = (req, res, next) => next();
if (process.env.NODE_ENV !== "test" || process.env.FORCE_CSRF === "1") {
  try {
    const csurf = require("csurf");
    csrfProtection = csurf();
  } catch (err) {
    console.warn("csurf not installed — skipping CSRF protection in items routes.");
  }
}

// Temporary CSRF debug logging removed.

// Global limiter for item routes to mitigate abuse (applies to all item endpoints)
const itemsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for search endpoint (stricter)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// Attach global limiter to items router
router.use(itemsLimiter);

// Search for items by name
router.get("/search", searchLimiter, auth.ensureAuthenticated, async (req, res) => {
  const { q } = req.query;
  try {
    const items = await Item.findAll({
      where: {
        name: {
          [Op.iLike]: `%${q}%`,
        },
      },
    });
    res.json(items);
  } catch (error) {
    console.error("Error searching items:", error);
    res.status(500).json({ message: "Error searching items", error });
  }
});

// Update the status of an item
router.put("/:id/status", auth.ensureAuthenticated, csrfProtection, async (req, res) => {
  try {
    const itemId = req.params.id;
    const { status } = req.body;

    if (!["received", "pending"].includes(status)) {
      return res.status(400).send("Invalid status value");
    }

    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).send("Item not found");
    }

    item.status = status;
    await item.save();

    res.status(200).send("Item status updated successfully");
  } catch (error) {
    console.error("Error updating item status:", error);
    res.status(500).send("An error occurred while updating item status");
  }
});

// GET all items for a specific character
router.get("/:characterId", auth.ensureAuthenticated, async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { character_id: req.params.characterId },
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Error fetching items", error });
  }
});

// Add a new item
router.post("/", auth.ensureAuthenticated, csrfProtection, async (req, res) => {
  const { name, description, slot, boss, character_id, icon } = req.body;
  try {
    const newItem = await Item.create({
      name,
      description,
      slot,
      boss,
      character_id,
      icon,
    });
    res.json(newItem);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Error creating item", error });
  }
});

// DELETE an item by itemId
router.delete("/:itemId", auth.ensureAuthenticated, csrfProtection, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByPk(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    await item.destroy();
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item", error });
  }
});

// Update an item by itemId
router.put("/:itemId", auth.ensureAuthenticated, csrfProtection, async (req, res) => {
  const { itemId } = req.params;
  const { name, description, slot, boss, character_id, icon } = req.body;

  try {
    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.update({
      name,
      description,
      slot,
      boss,
      character_id,
      icon,
    });

    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Error updating item", error });
  }
});

module.exports = router;
