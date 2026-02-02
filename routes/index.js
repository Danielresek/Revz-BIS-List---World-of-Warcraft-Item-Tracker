const express = require("express");
const { Character } = require("../models");
const router = express.Router();

// Conditional CSRF protection for pages that render forms / need a token
let csrfProtection = (req, res, next) => next();
if (process.env.NODE_ENV !== "test" || process.env.FORCE_CSRF === "1") {
  try {
    const csurf = require("csurf");
    csrfProtection = csurf();
  } catch (err) {
    console.warn("csurf not installed — skipping CSRF protection for index route.");
  }
}

// GET route for the main page
router.get("/", csrfProtection, async (req, res) => {
  try {
    let characters = [];
    // If the user is logged in, fetch their characters
    if (req.user) {
      characters = await Character.findAll({ where: { user_id: req.user.id } });
    }
    // Render the main index page with user and character data and CSRF token
    const csrfToken = typeof req.csrfToken === "function" ? req.csrfToken() : null;
    res.render("index", { user: req.user, characters, csrfToken });
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).send("An error occurred while fetching characters.");
  }
});

module.exports = router;
