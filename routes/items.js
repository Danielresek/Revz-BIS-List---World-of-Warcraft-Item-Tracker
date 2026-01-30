const express = require("express");
const { Item, Character } = require("../models");
const router = express.Router();
const auth = require("../middleware/auth");
const { Op } = require("sequelize");
const rateLimit = require("express-rate-limit");

// Rate limiter for search endpoint
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

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
router.put("/:id/status", auth.ensureAuthenticated, async (req, res) => {
  try {
    const itemId = req.params.id;
    const { status } = req.body;

    if (!["received", "pending"].includes(status)) {
      return res.status(400).send("Invalid status value");
    }

    const item = await Item.findByPk(itemId, { include: [{ model: Character }] });
    if (!item) {
      return res.status(404).send("Item not found");
    }

    if (!item.Character || item.Character.user_id !== req.user.id) {
      return res.status(403).send("Unauthorized");
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
    const character = await Character.findByPk(req.params.characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }
    if (character.user_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

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
router.post("/", auth.ensureAuthenticated, async (req, res) => {
  const { name, description, slot, boss, character_id, icon } = req.body;
  try {
    if (!character_id || isNaN(parseInt(character_id, 10))) {
      return res.status(400).json({ message: "Invalid character_id" });
    }

    const character = await Character.findByPk(character_id);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    if (character.user_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const newItem = await Item.create({
      name,
      description,
      slot,
      boss,
      character_id,
      icon,
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Error creating item", error });
  }
});

// DELETE an item by itemId
router.delete("/:itemId", auth.ensureAuthenticated, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByPk(itemId, { include: [{ model: Character }] });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!item.Character || item.Character.user_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await item.destroy();
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item", error });
  }
});

// Update an item by itemId
router.put("/:itemId", auth.ensureAuthenticated, async (req, res) => {
  const { itemId } = req.params;
  const { name, description, slot, boss, character_id, icon } = req.body;

  try {
    const item = await Item.findByPk(itemId, { include: [{ model: Character }] });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!item.Character || item.Character.user_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // If changing ownership via character_id, ensure target character belongs to user
    if (character_id && character_id !== item.character_id) {
      const targetChar = await Character.findByPk(character_id);
      if (!targetChar) return res.status(404).json({ message: "Target character not found" });
      if (targetChar.user_id !== req.user.id) return res.status(403).json({ message: "Unauthorized to assign item to this character" });
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
