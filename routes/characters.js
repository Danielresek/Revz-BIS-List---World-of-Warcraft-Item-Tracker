const express = require("express");
const { Character, User } = require("../models");
const { ensureAuthenticated } = require("../middleware/auth"); // Middleware for autentisering
const router = express.Router();

// Route to display profile page with a list of characters for the logged-in user
router.get("/profile", ensureAuthenticated, async (req, res) => {
  try {
    // Fetch all characters belonging to the logged-in user
    const characters = await Character.findAll({
      where: { user_id: req.user.id },
    });
    // Fetch the user's data
    const user = await User.findOne({ where: { id: req.user.id } });

    // Render the profile page with user and character data
    res.render("profile", { user, characters });
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.redirect("/");
  }
});

// Route to create a new character
router.post("/add", ensureAuthenticated, async (req, res) => {
  const { name, characterClass, classIconUrl } = req.body;
  const userId = req.user.id;

  // Log the data received by the server for debugging purposes
  console.log("Received data:", { name, characterClass, classIconUrl, userId });

  try {
    // Create a new character in the database
    const newCharacter = await Character.create({
      name,
      class: characterClass,
      classIconUrl,
      user_id: userId,
    });
    res.json({ success: true, character: newCharacter });
  } catch (error) {
    console.error("Error creating character:", error);
    res
      .status(500)
      .json({ success: false, message: "Error creating character" });
  }
});

// API endpoint to fetch all characters for a specific user (returns JSON only)
router.get("/:userId", ensureAuthenticated, async (req, res) => {
  try {
    // Fetch all characters for the specified user ID
    const characters = await Character.findAll({
      where: { user_id: req.params.userId },
    });
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching characters", error });
  }
});

// DELETE route to delete a character based on its ID
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  const characterId = req.params.id;
  try {
    // Find the character by its primary key (ID)
    const character = await Character.findByPk(characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }
    // Check if the logged-in user owns the character
    if (character.user_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    // Delete the character from the database
    await character.destroy();
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting character:", error);
    res.status(500).json({ message: "Failed to delete character" });
  }
});

// PUT route to update a character based on its ID
router.put("/:id", ensureAuthenticated, async (req, res) => {
  const characterId = req.params.id;
  const { name } = req.body;

  try {
    // Find the character by its primary key (ID)
    const character = await Character.findByPk(characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }
    // Check if the logged-in user owns the character
    if (character.user_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update the character's name
    character.name = name;
    await character.save();
    res.json({ success: true, character });
  } catch (error) {
    console.error("Error updating character:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update character" });
  }
});

// Route to fetch all characters for the logged-in user (returns JSON)
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    // Fetch all characters for the logged-in user
    const characters = await Character.findAll({
      where: { user_id: req.user.id },
    });
    res.json(characters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ message: "Error fetching characters", error });
  }
});

module.exports = router;
