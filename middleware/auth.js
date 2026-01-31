const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const validator = require("validator");
const { Op } = require("sequelize");
const db = require("../models");
const { User } = db;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "identifier" },
      async (identifier, password, done) => {
        try {
          const rawIdentifier = (identifier || "").trim();
          const loweredIdentifier = rawIdentifier.toLowerCase();

          let user;

          // Login with email
          if (validator.isEmail(rawIdentifier)) {
            user = await User.findOne({
              where: db.sequelize.where(
                db.sequelize.fn("lower", db.sequelize.col("email")),
                loweredIdentifier
              ),
            });
          } else {
            // Login with username (case-insensitive for SQLite + Postgres)
            user = await User.findOne({
              where: db.sequelize.where(
                db.sequelize.fn("lower", db.sequelize.col("username")),
                loweredIdentifier
              ),
            });
          }

          if (!user) {
            return done(null, false, {
              message: "Incorrect username/email or password",
            });
          }

          const isMatch = await bcrypt.compare(password, user.password_hash);
          if (!isMatch) {
            return done(null, false, {
              message: "Incorrect username/email or password",
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

// Register a new user
async function signup(req, res) {
  const { username, email, password, confirmPassword } = req.body;

  if (!validator.isEmail(email)) {
    return res.render("signup", {
      error: "Please enter a valid email address.",
    });
  }

  if (password !== confirmPassword) {
    return res.render("signup", { error: "Passwords do not match." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Case-insensitive uniqueness check (works in SQLite + Postgres)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          db.sequelize.where(
            db.sequelize.fn("lower", db.sequelize.col("email")),
            normalizedEmail
          ),
          db.sequelize.where(
            db.sequelize.fn("lower", db.sequelize.col("username")),
            normalizedUsername
          ),
        ],
      },
    });

    if (existingUser) {
      return res.render("signup", {
        error: "Username or email is already taken.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password_hash: hashedPassword,
    });

    // Auto-login via Passport + session (regenerate session to prevent fixation)
    return req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration failed:", err);
        return res.render("signup", {
          error: "Signup succeeded, but login failed.",
        });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login failed:", err);
          return res.render("signup", {
            error: "Signup succeeded, but login failed.",
          });
        }
        req.session.userId = user.id;
        return res.redirect("/");
      });
    });
  } catch (error) {
    console.error(error);
    return res.render("signup", { error: "Signup failed. Please try again." });
  }
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.session.userId) return next();
  return res.redirect("/login");
}

module.exports.signup = signup;
module.exports.ensureAuthenticated = ensureAuthenticated;
