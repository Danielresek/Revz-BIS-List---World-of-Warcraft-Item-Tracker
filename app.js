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
app.set("trust proxy", 1);

// Configure view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware for static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/data", express.static(path.join(__dirname, "data")));

// Logging and body parsing
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session handling + security middlewares
const sessionSecret =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "test" ? "test-session-secret" : undefined);

if (!sessionSecret) {
  throw new Error(
    "SESSION_SECRET is missing. Add it to environment variables."
  );
}

const sessionOptions = {
  name: "sid",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // secure cookie i prod
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// Optional Redis session store configuration (requires REDIS_URL env)
if (process.env.REDIS_URL) {
  try {
    const RedisStore = require("connect-redis")(session);
    const { createClient } = require("redis");
    const redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.connect().catch((err) => console.error("Redis error:", err));
    sessionOptions.store = new RedisStore({ client: redisClient });
    console.log("Using Redis session store");
  } catch (e) {
    console.warn("connect-redis or redis not installed or failed to configure:", e.message || e);
  }
}

app.use(session(sessionOptions));

// Passport.js configuration
app.use(passport.initialize());
app.use(passport.session());

// Helmet (best effort)
try {
  const helmet = require("helmet");
  app.use(helmet());
} catch (e) {
  console.warn("helmet not installed; skipping");
}

// CSRF protection (disabled in test env to keep tests simple)
if (process.env.NODE_ENV !== "test") {
  try {
    const csurf = require("csurf");
    app.use(csurf());
    // expose token to views
    app.use((req, res, next) => {
      try {
        res.locals.csrfToken = req.csrfToken();
      } catch (e) {
        res.locals.csrfToken = undefined;
      }
      next();
    });
  } catch (e) {
    console.warn("csurf not installed; skipping CSRF protection");
  }
}

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
