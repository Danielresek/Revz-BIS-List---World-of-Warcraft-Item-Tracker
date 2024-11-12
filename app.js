const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

// Import routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const characterRoutes = require("./routes/characters");
const itemRoutes = require("./routes/items");

// Import database and initialize models
const db = require("./models");

// Configure Passport
require("./middleware/auth")(passport);

const app = express();

// Configure view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware for static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/data", express.static(path.join(__dirname, "data")));

// Logging and body parsing
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session handling
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Passport.js configuration
app.use(passport.initialize());
app.use(passport.session());

// Middleware to make login status available in EJS
app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.username = req.user ? req.user.username : "";
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/", usersRouter);
app.use("/characters", characterRoutes);
app.use("/items", itemRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  next(createError(404));
});

// Error handling
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
