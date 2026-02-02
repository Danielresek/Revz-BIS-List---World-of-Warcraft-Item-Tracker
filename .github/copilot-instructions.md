**Project Overview**

Revz BIS List is a Node.js + Express web app (EJS views currently) that tracks World of Warcraft "Best in Slot" items per character. The backend uses Sequelize ORM and supports PostgreSQL in production and SQLite for test runs. Key entry points and components:

- **App entry**: [app.js](app.js)
- **Routes**: [routes/](routes)
- **Models / DB**: [models/](models)
- **Middleware (auth & session)**: [middleware/auth.js](middleware/auth.js)
- **Frontend templates**: [views/](views)
- **CI workflow**: [.github/workflows/ci.yml](.github/workflows/ci.yml)

**Quick dev commands**

- Start (prod-like): `npm start` (runs `node ./bin/www`)
- Dev (auto-reload): `npm run dev` (uses `nodemon ./bin/www`)
- Run tests: `npm test` (runs `cross-env NODE_ENV=test jest --runInBand`)

**Authentication & sessions (important patterns)**

- Passport LocalStrategy is configured in `middleware/auth.js` and expects the login `identifier` (email or username). The strategy normalizes and lowercases identifiers and uses case-insensitive DB lookups (see `sequelize.fn('lower', ...)`).
- New-user signup is implemented in the same file via exported `signup(req,res)`. Auto-login sets `req.session.userId` after `req.login(user, ...)`.
- Session cookie name: `sid`. `SESSION_SECRET` environment variable is required (throws in `app.js` if missing).

**Database & tests**

- Sequelize is the ORM (`models/index.js`). Tests use an in-memory/SQLite strategy: `devDependencies` include `sqlite3` and `tests/helpers/setup.js` calls `sequelize.sync({ force: true })` before each test.
- Tests assume `NODE_ENV=test`. CI runs `npm test` and the Jest config is present in `package.json`.

**Common code patterns & conventions**

- Case-insensitive uniqueness and lookup: prefer DB-side lowercase comparison rather than relying on JS-only normalization (see `middleware/auth.js`).
- Routes mount at top-level in `app.js`: `/characters` and `/items`. Use `auth.ensureAuthenticated` for protected routes.
- Rate limiting is applied on sensitive endpoints (example: `GET /items/search` uses `express-rate-limit`). Follow existing limiter patterns when adding search or public endpoints.
- Frontend assets: static files served from `/public`, and `/data` is exposed for item lists.

**Files to inspect for examples**

- Authentication flow: [middleware/auth.js](middleware/auth.js)
- Item API patterns and error handling: [routes/items.js](routes/items.js)
- Main view rendering pattern: [routes/index.js](routes/index.js)
- Test DB setup: [tests/helpers/setup.js](tests/helpers/setup.js)

**CI & environment**

- CI runs on GitHub Actions (`.github/workflows/ci.yml`) and executes the same `npm test` command. Keep changes test-friendly: use `process.env.NODE_ENV` checks already present in `app.js` (logger disabled in test env).
- Required env vars: `SESSION_SECRET`. DB connection variables are configured via environment (Sequelize). For local dev, use your preferred Postgres or set up a local DB consistent with `models` config.

**When modifying code**

- Keep changes minimal and consistent with existing style (Express + async/await). Follow existing error-handling pattern: log server-side and return 4xx/5xx with JSON or render pages as present.
- For auth or user data changes, preserve case-insensitive checks and the `identifier` login behavior to avoid breaking existing accounts.

If any of this is unclear or you'd like the draft expanded with examples (e.g., common PR checklist, commit message style, or more file links), say which section to expand and I'll update the file.
