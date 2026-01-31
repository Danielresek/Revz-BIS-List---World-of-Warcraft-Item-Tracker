# Copilot Instructions — Revz BIS List 💡

This project is a small Express + Sequelize app with EJS views and lightweight frontend JS. The goal of these instructions is to make an AI coding agent productive quickly by documenting repo-specific architecture, conventions, and developer workflows.

## Quick commands 🔧
- Start (production-like): `npm start` (runs `node ./bin/www`)
- Dev (auto-reload): `npm run dev` (nodemon)
- Run tests (local/CI): `npm test` (uses `NODE_ENV=test`)
- CI uses Node 18 and runs `npm test -- --verbose` (see `.github/workflows/ci.yml`)

## Big picture — architecture & flows 🏗️
- Backend: Express app in `app.js`; routes live under `routes/` and return either rendered EJS pages or JSON for API actions.
- Data layer: Sequelize models in `models/` (User, Character, Item). `models/index.js` picks the DB based on `NODE_ENV`.
  - `NODE_ENV=test` → in-memory SQLite (used for Jest tests)
  - `production` → uses `DATABASE_URL_INTERNAL`; otherwise uses `DATABASE_URL_EXTERNAL` with `DB_DIALECT` default `postgres` and SSL options
- Frontend: server-rendered EJS templates in `views/` plus page-specific JS in `public/javascripts`.
- Static datasets: `data/db.json` is served static (`/data`) and used by client-side search/autocomplete.

## Authentication & sessions 🔐
- Auth uses `passport-local` in `middleware/auth.js`.
  - Login accepts either email OR username (case-insensitive); signups are normalized to lowercase and stored as such.
  - Passwords are hashed with `bcrypt` (salt rounds 10).
  - Signup auto-logs in the user and sets `req.session.userId`.
- Session config lives in `app.js`:
  - Cookie name: `sid` ; `secure` set in production; `SESSION_SECRET` is required (tests fallback to `test-session-secret`).
  - `app.set('trust proxy', 1)` is enabled (important for `secure` cookies behind proxies).
- Use `ensureAuthenticated(req,res,next)` to protect routes (it redirects to `/login` when not authenticated).

## API & conventions ✅
- Routes that mutate or return user-specific data are session-protected and typically redirect to `/login` (302) when not authenticated — tests rely on that behavior.
- JSON API examples:
  - Create character: `POST /characters/add` expects JSON `{ name, characterClass, classIconUrl }` (server maps `characterClass` → `class` in DB)
  - Items: `GET /items/:characterId`, `POST /items`, `PUT /items/:itemId`, `DELETE /items/:itemId` — all require auth.
  - Search: `GET /items/search?q=term` (rate limited)
- Error handling: endpoints return JSON errors or status codes (404/403/500) rather than HTML for API endpoints.

## Security & limits ⚠️
- Rate limiting is applied in these places:
  - Auth (`/signup`, `/login`) → `max: 20` per 15min (see `routes/users.js`)
  - Item search `/items/search` → `max: 30` per minute (see `routes/items.js`)
- When adding new endpoints that could be abused, consider adding `express-rate-limit` similarly.

## Testing patterns & gotchas 🧪
- Tests set `NODE_ENV=test` and rely on in-memory SQLite (see `models/index.js` & `tests/helpers/setup.js`).
- Tests use `supertest` agents (`tests/helpers/testClient.js`) to persist session cookies between requests: use `createClient()` to emulate logged-in flows.
- Tests commonly assert redirects (302) for unauthenticated access and allow `200` or `404` for item endpoints (resource may or may not exist).
- Reusable helper patterns in tests:
  - `uniqueEmail()` / `uniqueUser()` to avoid collisions
  - `signupAndGetAgent()` to sign up and get a logged-in agent for further requests

## Files to consult frequently 📚
- `app.js` — middleware, sessions, static serving
- `models/index.js` — DB selection and sync behavior
- `middleware/auth.js` — passport strategy and `ensureAuthenticated` signature
- `routes/*.js` — canonical behavior for characters, items, users
- `tests/**` — concrete examples of expected API behavior and edge conditions

## PR & change guidance 📝
- Always run `npm test` and ensure tests pass before creating PRs. CI will run tests on `main`.
- If changing auth/session behavior, update tests that use session agents and `req.session.userId` checks.
- If adding DB-affecting changes, prefer adding tests that validate behavior with SQLite in test mode (sync is forced per test run).

---
If anything here is unclear or missing (e.g., extra environment variables used in your environment, or other deployment details), tell me what to expand and I’ll iterate. ✅
