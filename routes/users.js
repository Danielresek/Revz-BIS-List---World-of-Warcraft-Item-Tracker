const express = require("express");
const router = express.Router();
const passport = require("passport");
const auth = require("../middleware/auth");

// GET routes to render the signup and login pages
router.get("/signup", (req, res) => res.render("signup"));
router.get("/login", (req, res) => res.render("login"));

// Handle user registration via the signup form
router.post("/signup", auth.signup);

// Handle user login using Passport.js authentication
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Set userId in the session after successful login
      req.session.userId = user.id;
      return res.redirect("/");
    });
  })(req, res, next);
});

// Handle user logout and destroy the session
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy((err) => {
      res.redirect("/");
    });
  });
});

module.exports = router;
