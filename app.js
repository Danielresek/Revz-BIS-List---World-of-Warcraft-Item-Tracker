const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

// Importer ruter
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const characterRoutes = require("./routes/characters");
const itemRoutes = require("./routes/items");

// Importer database og initier modeller
const db = require("./models");

// Konfigurer Passport
require("./middleware/auth")(passport);

const app = express();

// Konfigurer view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware for statiske filer
app.use(express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/data", express.static(path.join(__dirname, "data")));

// Loggføring og body parsing
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Sesjonshåndtering
app.use(
  session({
    secret: process.env.SESSION_SECRET || "din_hemmelige_nøkkel", // Sikrere med miljøvariabel
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // 'true' hvis du bruker HTTPS
  })
);

// Passport.js konfigurasjon
app.use(passport.initialize());
app.use(passport.session());

// Middleware for å gjøre innloggingsstatus tilgjengelig i EJS
app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.username = req.user ? req.user.username : "";
  next();
});

// Ruter
app.use("/", indexRouter);
app.use("/", usersRouter);
app.use("/characters", characterRoutes);
app.use("/items", itemRoutes);

// Håndter 404-feil
app.use((req, res, next) => {
  next(createError(404));
});

// Feilhåndtering
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
