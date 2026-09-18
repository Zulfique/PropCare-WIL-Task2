# PropCare — Smart Property Maintenance Management

A property maintenance management platform for **Obs Realty Group (OBS REALTY)**, covering a residential portfolio across the Western Cape. This repository contains the **Task 2 full-stack web application** (Express + SQLite + JWT REST API with an API-driven front end) and the original **Task 1 prototype**.

## What PropCare does

- Residents report issues in under a minute — with category, urgency, details and photos.
- Managers review, prioritise and assign the right technician to their portfolio.
- Technicians accept jobs, update progress and close work out with notes and photos.
- Every request keeps a full status history, conversation trail and rating.
- Admins manage users, roles, categories, notifications and platform reports.
- The one-page app is fully responsive with mobile bottom navigation and an accessible modal/toast system.

## Tech stack (Task 2)

| Layer | Technology |
|-------|------------|
| Runtime | Node.js ≥ 22.5 (uses built-in `node:sqlite`) |
| Back end | Express, JWT auth (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors` |
| Input/security | `express-validator`, `express-rate-limit`, JSON body cap (32 KB) |
| Database | SQLite via `node:sqlite` (auto-created + seeded on first run) |
| Logging | `winston`, `morgan` |
| Front end | Vanilla JS SPA (`public/`) served by Express |
| Tests | `jest` + `supertest` (82 tests) |
| CI/CD | GitHub Actions + Render blueprint |

> `node:sqlite` is experimental in Node 22/23, so the app runs with `--experimental-sqlite`.

## Demo accounts

All seeded accounts use the password `PropCare123!`.

| Role | Email | Can do |
|------|-------|--------|
| Tenant | `sarahwilliams@example.com` | Report issues, track requests, comment, confirm & rate completion |
| Property Manager | `michael.jacobs@obsrealty.co.za` | Review/prioritise, assign technicians, monitor portfolio, reports |
| Technician | `johan.vdm@obsrealty.co.za` | Accept jobs, update status, complete work with notes/photos |
| Administrator | `admin@obsrealty.co.za` | Users, roles, categories, tenants, reports, settings |

## Run locally

```bash
npm install
npm run seed        # optional - DB auto-seeds on first boot anyway
npm start           # node --experimental-sqlite server.js
# open http://localhost:8124
```

Environment: copy `.env.example` to `.env` and set a `JWT_SECRET` of **at least 32 characters**. The server refuses to start without it. See `.env.example` for `PORT`, `DB_PATH` and `DEMO_PASSWORD`.

## Tests

```bash
npm test            # jest + supertest against an in-memory SQLite database
npm run check       # node --check on server.js and src/app.js
```

Test suites cover authentication, RBAC (role + object-level), the request lifecycle state machine, comments/photos/ratings, notifications, reports and security headers.

## API surface

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/auth/login` | Returns JWT + profile (units) |
| GET/POST | `/api/auth/me` · `/api/auth/logout` | Current user / sign out |
| GET/POST | `/api/requests` | Role-scoped list (filters: `status`, `category`, `q`) / tenant create |
| GET | `/api/requests/:id` | Detail with comments, history, rating |
| POST | `/api/requests/:id/status` | State-machine transition (`cancel`, `confirm`, `reopen`, `approve`, `accept`, `reject`, `hold`, `resume`, `complete`) |
| POST | `/api/requests/:id/assign` | Manager assigns technician |
| POST | `/api/requests/:id/rate` · `/comments` · `/photos` | Tenant rating / conversation / photo attach |
| GET | `/api/properties` · `/api/technicians` · `/api/tenants` | Role-scoped directories |
| GET | `/api/categories` · `/api/statuses` · `/api/urgencies` | Reference data |
| GET | `/api/notifications` · `POST /read-all` | Activity feed |
| GET | `/api/reports/summary` | Manager portfolio / admin platform reports |
| GET | `/api/health` | Health check for hosting platforms |

Responses use `{ status: 'success', data: {...} }`; errors use `{ status: 'error', statusCode, message }`.

## Repository structure (Task 2)

```
src/
  db.js                 # SQLite schema + seed data + prepared queries (q)
  services/requests.js  # Business logic, RBAC, status state machine
  middleware/           # auth (JWT/roles), validate, errorHandler
  routes/               # auth, users, properties, requests, technicians,
                        # tenants, categories, notifications, reports
  app.js                # Express app (helmet, rate limits, static, SPA)
  server.js             # Entry point (PORT, JWT secret guard, shutdown)
scripts/seed-cli.js     # npm run seed
public/                 # SPA: index.html, css/styles.css, js/{api,app}.js
tests/                  # jest + supertest suites (auth, requests, rbac, reports)
```

## Hosting

The app is designed to run on **Render** (free tier) with a persistent SQLite disk and an automatic deploy hook:

- `render.yaml` — Render Blueprint (Web Service + persistent `/data` disk). `DB_PATH=/data/propcare.db` keeps the database across deploys.
- `.github/workflows/deploy.yml` — triggers a Render deploy on every push to `main` via the `RENDER_DEPLOY_HOOK_URL` repository secret.
- Set `JWT_SECRET` (≥ 32 chars) in the Render environment, not in code.

The **Task 1 prototype** remains hosted on **GitHub Pages** at [zulfique.github.io/PropCare-WIL-Task1](https://zulfique.github.io/PropCare-WIL-Task1/) via `.github/workflows/build.yml`.

## Branching & CI (Task 2 rubric)

- `main` — releasable; merges only from `develop` (or reviewed PRs).
- `develop` — integration branch for all feature work.
- `feature/*` — short-lived branches (`backend-api`, `frontend-app`, `tests-pipeline`, `hosting-docs`).
- `.github/workflows/ci.yml` — installs deps, syntax-checks all JS, audits dependencies and runs the full test suite on `main`/`develop` and PRs.

## Screens (Task 2 SPA)

Overview dashboard (stats per role), requests list with search/filters, request detail with timeline + conversation + actions, report-an-issue wizard, properties, technicians, tenants, reports with CSV export, notifications, users (admin), roles, categories, profile/settings, and a design gallery with the original mockups.

## Task 1 prototype

The original static prototype lives in `prototype/` (HTML/CSS/JS + mockups). Run it with:

```bash
cd prototype
python -m http.server 8124   # open http://localhost:8124
```

## Notes

- Brand colours: navy `#172336`, teal `#a7cfce`, page background `#f2f4f8`.
- `data/*.db` and `.env` are git-ignored; the database is rebuilt and seeded automatically when missing.