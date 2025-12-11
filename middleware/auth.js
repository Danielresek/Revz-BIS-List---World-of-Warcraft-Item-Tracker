const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models");
const validator = require("validator");
const { Op } = require("sequelize"); // Already correct

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      // Identifier to allow username OR email
      { usernameField: "identifier" },
      async (identifier, password, done) => {
        try {
          let user;

          //Check whether identifier is an email or username
          if (validator.isEmail(identifier)) {
            user = await User.findOne({
              where: { email: identifier.toLowerCase() },
            });
          } else {
            user = await User.findOne({
              where: {
                username: { [Op.iLike]: identifier },
              },
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

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

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

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.render("signup", {
      error: "Please enter a valid email address.",
    });
  }

  // Validate passwords match
  if (password !== confirmPassword) {
    return res.render("signup", {
      error: "Passwords do not match.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
    });

    if (existingUser) {
      return res.render("signup", {
        error: "Username or email is already taken.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password_hash: hashedPassword,
    });

    req.session.userId = user.id;
    res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.render("signup", {
      error: "Signup failed. Please try again.",
    });
  }
}

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.session.userId) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports.signup = signup;
module.exports.ensureAuthenticated = ensureAuthenticated;
