# PropCare — Smart Property Maintenance Management

A property maintenance management platform for **Obs Realty Group (OBS REALTY)**, covering a residential portfolio across the Western Cape. This repository contains the **Task 2 full-stack web application** (Express + SQLite + JWT REST API with an API-driven front end) and the original **Task 1 prototype**.

## Quick links

| What | URL |
|------|-----|
| This repository | <https://github.com/Zulfique/PropCare-WIL-Task2> |
| App running locally | <http://localhost:8124> |
| API health check | <http://localhost:8124/api/health> |
| Task 1 prototype (live, GitHub Pages) | <https://zulfique.github.io/PropCare-WIL-Task2/> |
| Task 2 deployment target (Render — pending deploy hook) | <https://propcare-wil-task2.onrender.com/> |

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

Prerequisites: **Node.js ≥ 22.5** (uses built-in `node:sqlite`), npm.

```bash
npm install
Copy-Item .env.example .env   # then set JWT_SECRET (>= 32 chars) in .env
npm run seed                  # optional - DB auto-seeds and seeds on first boot anyway
npm start                     # node --experimental-sqlite server.js
# open http://localhost:8124
```

The server refuses to start without a valid `JWT_SECRET` (at least 32 characters). See `.env.example` for `PORT`, `DB_PATH` and `DEMO_PASSWORD`. On Windows, PowerShell users can generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Tests

```bash
npm test            # jest + supertest against an in-memory SQLite database
npm run check       # node --check syntax gate
npm run test:browser  # headless Puppeteer walk-through of every screen/button per role
```

Test suites cover authentication, RBAC (role + object-level), the request lifecycle state machine, comments/photos/ratings, notifications, reports and security headers. The browser suite additionally verifies responsive mobile navigation, keyboard-only navigation, focus visibility, and that every control on every screen has an accessible name.

## Verification

Verification should be based on the actual GitHub Actions run for the commit being reviewed.

| Check | Command / workflow | Result |
| --- | --- | --- |
| Automated tests | `npm test` | Reported by GitHub Actions |
| Syntax checks | `npm run check` | Reported by GitHub Actions |
| Dependency audit | `npm audit --omit=dev --audit-level=high` | Reported by GitHub Actions |
| HTML validation | `html-validate` | Reported by GitHub Actions |
| CI | `.github/workflows/ci.yml` | Reported by GitHub Actions |
| Render deployment | `.github/workflows/deploy.yml` | Reported by GitHub Actions |
| Render health | `/api/health` | Checked after deployment |

Do not treat the results in this README as a substitute for the actual GitHub Actions run. The GitHub Actions result for the specific commit is the source of truth.

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

The app is designed to run on **Render** with a persistent SQLite disk.

### Render configuration

- `render.yaml` — Render Blueprint for the web service.
- SQLite database is stored at `/data/propcare.db`.
- `DB_PATH=/data/propcare.db` keeps the database on the persistent disk.
- `JWT_SECRET` must be configured in the Render environment.
- Render uses `/api/health` as the service health check.

### GitHub Actions deployment

The deployment workflow is:

```text
.github/workflows/deploy.yml


It runs when:


code is pushed to main, or
the workflow is manually started from GitHub Actions.


Before deployment, GitHub Actions runs:


npm ci
npm test
npm run check


A Render deployment is then triggered using either:


the RENDER_DEPLOY_HOOK_URL GitHub repository secret, or
the optional hook_url input when manually running the workflow.


After triggering Render, the workflow polls:


https://propcare-wil-task2.onrender.com/api/health


until the service becomes healthy.


If the Render deploy hook is not configured, the test and syntax-check stages still run, but the Render deployment is skipped with a warning.


Configure the Render deploy hook
Open the Render service.
Open Settings → Deploy Hook.
Copy the Render deploy hook URL.
In GitHub open Settings → Secrets and variables → Actions.
Create this repository secret:
RENDER_DEPLOY_HOOK_URL
Paste the Render deploy hook URL as the secret value.


After that, a push to main will run the checks and trigger the Render deployment.


Render environment

Set the following environment variables in Render:


JWT_SECRET=<long random secret, at least 32 characters>
NODE_ENV=production
PORT=10000
JWT_EXPIRES_IN=2h
DB_PATH=/data/propcare.db
DEMO_PASSWORD=PropCare123!


Do not commit JWT_SECRET to the repository.


Manual deployment

The deployment workflow can also be started manually from:


GitHub → Actions → CD - Deploy to Render → Run workflow


You may provide the Render deploy hook URL through the hook_url input instead of storing it as a repository secret.


Deployment health

A successful deployment requires the Render health endpoint to respond successfully:


GET /api/health


The GitHub Actions deployment workflow waits for this endpoint after triggering Render.


The Render service URL is:


https://propcare-wil-task2.onrender.com/


The health endpoint is:


https://propcare-wil-task2.onrender.com/api/health


## Screens (Task 2 SPA)

Overview dashboard (stats per role), requests list with search/filters, request detail with timeline + conversation + actions, report-an-issue wizard, properties, technicians, tenants, reports with CSV export, notifications, users (admin), roles, categories, profile/settings, and a design gallery with the original mockups.

## Task 1 prototype

The original static prototype lives in `prototype/` (HTML/CSS/JS + mockups). Run it with:

```bash
cd prototype
python -m http.server 8124   # open http://localhost:8124
```

Then open:

http://localhost:8124

## Notes

- Brand colours: navy `#172336`, teal `#a7cfce`, page background `#f2f4f8`.
- `data/*.db` and `.env` are git-ignored; the database is rebuilt and seeded automatically when missing.