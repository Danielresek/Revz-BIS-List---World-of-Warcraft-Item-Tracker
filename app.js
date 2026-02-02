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

// Security headers (optional)
try {
  const helmet = require("helmet");
  // Basic helmet defaults
  app.use(helmet());

  // Configure CSP to allow external CDNs and the WoW icon host used by the app.
  // This is intentionally permissive for script/style inline usage during development.
  try {
    app.use(
      helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          // allow inline handlers and elem-src for scripts/styles for development convenience
          scriptSrc: [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
            "https://cdn.jsdelivr.net/npm",
            "'unsafe-inline'",
          ],
          // allow inline event handlers (script attributes) and script elements
          'script-src-attr': ["'unsafe-inline'"],
          'script-src-elem': [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
            "https://cdn.jsdelivr.net/npm",
            "'unsafe-inline'",
          ],
          styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
          'style-src-elem': ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https://wow.zamimg.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
        },
      })
    );
  } catch (err) {
    // Some helmet versions expose CSP differently; if it fails, warn and continue
    console.warn("helmet.contentSecurityPolicy not available or failed to initialize", err);
  }
} catch (err) {
  console.warn("helmet not installed — skipping security headers.");
}

// Session handling
const sessionSecret =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "test" ? "test-session-secret" : undefined);

if (!sessionSecret) {
  throw new Error(
    "SESSION_SECRET is missing. Add it to environment variables."
  );
}

// Optional production session store (Redis) — fallback to MemoryStore if not configured
let sessionStore = undefined;
if (process.env.REDIS_URL) {
  try {
    const RedisStore = require("connect-redis")(session);
    const { createClient } = require("redis");
    const redisClient = createClient({ url: process.env.REDIS_URL });
    // try to connect but do not block startup if it fails
    redisClient.connect().catch((err) => console.warn("Redis connect failed:", err));
    sessionStore = new RedisStore({ client: redisClient });
  } catch (err) {
    console.warn(
      "connect-redis or redis not installed or failed to initialize — using MemoryStore."
    );
  }
}

app.use(
  session({
    name: "sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // secure cookie i prod
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// NOTE: CSRF protection is applied per-route in routers to avoid
// validating tokens on unrelated requests (and to keep GET views stable).

// Passport.js configuration
app.use(passport.initialize());
app.use(passport.session());

// Middleware to make login status and CSRF token available in EJS
app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated ? req.isAuthenticated() : false;
  res.locals.username = req.user ? req.user.username : "";
  res.locals.csrfToken = typeof req.csrfToken === "function" ? req.csrfToken() : null;
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
  // CSRF error handling: give a friendly 403 on invalid token
  if (err && (err.code === "EBADCSRFTOKEN" || /csrf/i.test(err.message || ""))) {
    res.status(403);
    res.render("error", {
      message: "Invalid CSRF token",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
    return;
  }

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
