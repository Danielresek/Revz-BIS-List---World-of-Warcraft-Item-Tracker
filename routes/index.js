const express = require("express");
const { Character } = require("../models");
const router = express.Router();

// GET route for the main page
router.get("/", async (req, res) => {
  try {
    let characters = [];
    // If the user is logged in, fetch their characters
    if (req.user) {
      characters = await Character.findAll({ where: { user_id: req.user.id } });
    }
    // Render the main index page with user and character data
    res.render("index", { user: req.user, characters });
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).send("An error occurred while fetching characters.");
  }
});

module.exports = router;
