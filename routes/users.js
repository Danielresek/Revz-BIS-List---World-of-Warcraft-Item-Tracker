const express = require("express");
const router = express.Router();
const passport = require("passport");
const auth = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
let csrfProtection = (req, res, next) => next();
if (process.env.NODE_ENV !== "test" || process.env.FORCE_CSRF === "1") {
  try {
    const csurf = require("csurf");
    csrfProtection = csurf();
  } catch (err) {
    console.warn("csurf not installed — skipping CSRF protection in users routes.");
  }
}

// Rate limiter to prevent brute-force attacks on authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// GET routes to render the signup and login pages (include CSRF token)
router.get("/signup", csrfProtection, (req, res) =>
  res.render("signup", { csrfToken: typeof req.csrfToken === "function" ? req.csrfToken() : null })
);
router.get("/login", csrfProtection, (req, res) =>
  res.render("login", { csrfToken: typeof req.csrfToken === "function" ? req.csrfToken() : null })
);

// Handle user registration via the signup form
router.post("/signup", authLimiter, csrfProtection, auth.signup);

// Handle user login using Passport.js authentication
router.post("/login", authLimiter, csrfProtection, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("login", { error: "Incorrect email or password." });
    }
    // Regenerate session to prevent session fixation, then log the user in
    req.session.regenerate((regErr) => {
      if (regErr) return next(regErr);
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Set userId in the session after successful login
        req.session.userId = user.id;
        return res.redirect("/");
      });
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
