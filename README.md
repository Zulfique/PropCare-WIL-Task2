# PropCare — Smart Property Maintenance Management

PropCare is a full-stack property maintenance management platform for **Obs Realty Group**. It includes the Task 2 Express/SQLite application with a JWT-secured REST API and a vanilla JavaScript single-page front end, plus the original Task 1 prototype.

> **Canonical repository:** <https://github.com/Zulfique/PropCare-WIL-Task2-v2>
> Legacy repository (kept for history): <https://github.com/Zulfique/PropCare-WIL-Task2>

## Quick links

| Resource | URL |
| --- | --- |
| Repository | <https://github.com/Zulfique/PropCare-WIL-Task2-v2> |
| Live application (Render) | <https://propcare-wil-task2.onrender.com/> |
| API health check | <https://propcare-wil-task2.onrender.com/api/health> |
| Task 1 prototype (GitHub Pages) | <https://zulfique.github.io/PropCare-WIL-Task2-v2/> |
| Local application | <http://localhost:8124> |
| Local API health check | <http://localhost:8124/api/health> |

## What PropCare does

- Residents report issues in under a minute — with category, urgency, details and photos.
- Managers review, prioritise and assign the right technician to their portfolio.
- Technicians accept jobs, update progress and close work out with notes and photos.
- Every request keeps a full status history, conversation trail and rating.
- Admins manage users, roles, categories, notifications and platform reports.
- The one-page app is fully responsive with mobile bottom navigation and an accessible modal/toast system.

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js ≥ 22.5 (uses built-in `node:sqlite`) |
| Back end | Express, JWT auth (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors` |
| Input/security | `express-validator`, `express-rate-limit`, JSON body cap (32 KB) |
| Database | SQLite via `node:sqlite` (auto-created + seeded on first run) |
| Logging | `winston`, `morgan` |
| Front end | Vanilla JS SPA (`public/`) served by Express |
| Tests | `jest` + `supertest` + `puppeteer` (102 automated tests) |
| CI/CD | GitHub Actions (3 workflows) + Render Blueprint |

> `node:sqlite` is experimental in Node 22/23, so the app runs with `--experimental-sqlite`.

## Architecture: design patterns

| Pattern | Where | Why |
|---|---|---|
| **Repository** | `src/repositories/` (`BaseRepository`, `RequestRepository`, `NotificationRepository`, `UserRepository`, `ReferenceRepository`) | Isolates every SQL statement behind a data-access API so services stay testable and the storage engine is swappable. Carried over from Task 1 as the rubric requires. |
| **Observer** | `src/observers/notification.observer.js` | `NotificationSubject` publishes domain events (`request.created`, `request.assigned`, `request.status_changed`, `user.registered`) to `TenantLifecycleObserver`, `ManagerActivityObserver` and `TechnicianAssignmentObserver`. Each observer is isolated, so one failing subscriber cannot break a request. |

Supporting structure: routes → services (business rules) → repositories (data access) → SQLite. Validation, authn/authz and error mapping are applied in the route and service layers.

## Database design

- **10 tables** with `PRAGMA foreign_keys = ON`: users, properties, categories, requests, request_photos, comments, status_history, notifications, ratings, technicians.
- **Keys & integrity:** auto-increment primary keys, foreign keys on every relationship, `UNIQUE` constraints (e.g. one rating per user per request), and `CHECK` constraints on ratings and status values.
- **Indexes:** **14 secondary indexes** covering every foreign key and every filter/sort column used by the API, declared immediately after the schema in `src/db.js`.
- **Efficient queries:** prepared statements reused across requests; aggregate report queries instead of loading rows into application memory.

## Security

- Passwords hashed with **bcrypt** (cost 12); plaintext is never stored or logged.
- **JWT** access tokens carry `sub`, `role`, `tenant_id` and an `aud` claim, which is verified on every request; deactivated users cannot continue to use issued tokens.
- **Authentication vs authorisation are separate:** route middleware establishes identity, then role and object-level checks enforce tenancy scoping.
- **Input validation** on every write route with `express-validator`, plus a 32 KB JSON body cap.
- **Rate limiting** on authentication and write endpoints (429 on abuse).
- **Helmet** security headers, **CORS allow-listing**, and a consistent JSON error envelope with correct status codes (400/401/403/404/409/429).
- The seed log never prints `DEMO_PASSWORD`. A `JWT_SECRET` shorter than 32 characters is rejected outright; if none is set at all, a random one is generated per process (see [Deployment](#deployment-and-hosting-rationale)) so no secret has to be supplied.

## API

RESTful JSON under `/api`. Correct HTTP methods and status codes throughout.

| Area | Example endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Requests | `GET/POST /api/requests`, `GET/PATCH /api/requests/:id` |
| Lifecycle | `POST /api/requests/:id/assign`, `/accept`, `/status`, `/complete` |
| Comments / photos / ratings | `POST /api/requests/:id/comments`, `/photos`, `/ratings` |
| Notifications | `GET /api/notifications`, `POST /api/notifications/:id/read` |
| Admin | `GET/POST/PATCH /api/users`, `/api/categories`, `/api/reports` |
| Health | `GET /api/health` |

Responses use `{ status: 'success', data }` on success, `{ status: 'success', message }` for action-only replies such as logout, and `{ status: 'error', statusCode, message }` on failure. The HTTP status code is always the source of truth; `status` mirrors it for client convenience.

## Demo accounts

All four demo accounts share one password. Set `DEMO_PASSWORD` in the environment to choose it yourself; if you leave it unset, the first boot generates a strong random password instead of shipping a hardcoded default in the repository.

| Role | Email | Can do |
|------|-------|--------|
| Tenant | `sarahwilliams@example.com` | Report issues, track requests, comment, confirm & rate completion |
| Property Manager | `michael.jacobs@obsrealty.co.za` | Review/prioritise, assign technicians, monitor portfolio, reports |
| Technician | `johan.vdm@obsrealty.co.za` | Accept jobs, update status, complete work with notes/photos |
| Administrator | `admin@obsrealty.co.za` | Users, roles, categories, tenants, reports, settings |

### If `DEMO_PASSWORD` is not set

The generated password is **never printed to the logs**. It is written to `demo-credentials.txt` beside the database with `0600` permissions, and is git-ignored via `**/demo-credentials.txt`. Read it back from a host shell:

```bash
cat data/demo-credentials.txt    # locally, or on any host that gives you a shell
```

Delete that file and the database if you want to reseed with a password of your own.

This fallback exists for local and paid-host use. It is **not** how the Render Free deployment is configured: Free instances expose no SSH or dashboard shell, so there would be no way to read the file. `render.yaml` therefore pins `DEMO_PASSWORD` explicitly.

Do not use demo credentials in production.

## Run locally

Prerequisites: **Node.js ≥ 22.5** (uses built-in `node:sqlite`), npm.

```bash
npm ci
Copy-Item .env.example .env   # then set JWT_SECRET (>= 32 chars) in .env
npm run seed                  # optional - the DB auto-seeds on first boot
npm start                     # node --experimental-sqlite server.js
# open http://localhost:8124
```

`JWT_SECRET` is optional: leave it out and the server generates a random one at boot and keeps going. If you do set one, it must be at least 32 characters or startup is refused. See `.env.example` for `PORT`, `DB_PATH` and `DEMO_PASSWORD`. To pin your own so sessions survive restarts, generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Tests

```bash
npm test              # jest + supertest against an in-memory SQLite database
npm run test:serial   # same suite, serialised (debugging)
npm run check         # node --check syntax gate on all entry points
npm run test:browser  # headless Puppeteer walk-through of every screen/button per role
```

| Suite | Scope | Result |
| --- | --- | --- |
| `npm test` | 5 Jest + supertest suites (auth, lifecycle, RBAC, reports, patterns) | **102 / 102 pass** |
| `npm run test:browser` | Headless walk-through of every screen, button and function for all 4 roles + mobile + accessibility | pass |
| `npm run check` | `node --check` syntax gate | pass |
| GitHub Actions | `CI - Lint, Build and Test` on `main` and `develop` | green |

The suites cover authentication, RBAC (role **and** object-level), the request lifecycle state machine, comments/photos/ratings, notifications, reports, security headers, and unit tests for the Repository and Observer patterns. The browser suite additionally verifies responsive mobile navigation, keyboard-only navigation, focus visibility, and that every control on every screen has an accessible name.

## Verification results

| Suite | Scope | Result |
| --- | --- | --- |
| `npm test` | 5 Jest + supertest API suites | **102 / 102 pass** |
| `npm run check` | `node --check` syntax gate | pass |
| GitHub Actions | `CI - Lint, Build and Test` | green |
| GitHub Actions | `Build, Test and Deploy` | green |
| GitHub Actions | `CD - Deploy to Render` | green |
| GitHub Pages | live prototype | HTTP 200 |

The browser suite drives the app end-to-end: login per role, report wizard (photo attach + submit), comment, manager assign, technician completion, user/rating/close lifecycle, CSV export, admin user/category/settings changes, 390px mobile navigation and keyboard-only operation — producing `browser-shots/` (role-organised full-page screenshots) and `browser-shots/summary.txt` as evidence.

## Deployment and hosting rationale

The deployment target is **Render's Free compute plan**, configured entirely in `render.yaml`: no persistent disk to buy, no database to provision, and **no secret, API key or token to supply anywhere**. Creating the Blueprint is the entire setup step.

### Live deployment

- `render.yaml` — Render Blueprint (Free Web Service, Node 22). Builds with `npm ci --omit=dev`, starts with `node --experimental-sqlite server.js`, health-checks `/api/health`, and stores the SQLite file at `DB_PATH=/tmp/propcare.db`. Every value in the file has a working in-code default, and there is not a single `sync: false` entry — that keyword is what makes Render prompt an operator for a value, which is exactly the manual step this configuration removes.
- `.github/workflows/deploy.yml` — **token-free**. Render's Git integration deploys on its own when `main` changes, so no deploy hook is stored or used (a deploy hook is a bearer token). The workflow runs the pre-flight gate (`npm ci`, tests, syntax checks, `npm audit`) and then polls the live `/api/health` until it answers 200. If the hostname does not resolve at all it reports that no service has been created yet and exits cleanly; any HTTP response at all — including 404 or 502 — is treated as "live but still starting" and waited on, so a real outage fails the build while a not-yet-created service does not.
- `server.js` + `src/utils/secret.js` — the JWT signing secret is optional. When `JWT_SECRET` is unset the server generates a random 64-character secret at boot, logs only that it did so (never the value), and continues. A supplied secret that is present but shorter than 32 characters is still rejected outright rather than silently replaced.
- GitHub Pages serves the Task 1 prototype via `.github/workflows/build.yml`.

### Why these choices

| Decision | Rationale |
|---|---|
| **Render Free** over a VM or paid plan | Genuinely $0 with no card, which is the constraint for this demonstration. The cost is stated plainly below rather than hidden. |
| **No persistent disk** | Render's Free plan **cannot** attach one — persistent disks are a paid-plan feature. Requesting one in a Blueprint makes it fail to provision, so the app is designed for the Free plan's ephemeral filesystem and reseeds itself on every cold start. |
| **Generated `JWT_SECRET`** | Removes the last manual secret, and is strictly stronger than the alternative: a fixed secret committed to the repository would let anyone who clones the repo mint valid tokens for the live deployment. Rotating per process means sessions never outlive the process that issued them. |
| **Demo password in code** | Free instances offer no SSH or dashboard shell, so an operator cannot read a generated password off the filesystem. `DEMO_PASSWORD` is therefore pinned in `render.yaml`. It is a public credential for a database of fictional sample data — printed here and on the login screen — not a secret. |
| **SQLite** (`node:sqlite`) | The dataset is small and single-tenant, so SQLite removes an external database dependency entirely. Using Node's built-in module means **no native compilation step**, so CI and Render builds stay fast and reliable. |
| **Express + vanilla JS** | Keeps the deliverable dependency-light and fast to load, which protects the front-end load-time requirement. No framework build step, so the Pages deploy and the Render deploy share the same source. |
| **GitHub Actions** | Tests and live verification run on every push, giving the hands-off pipeline the rubric asks for, with the live URL as the CI/CD proof point. |

**To go live in ~3 minutes:**

1. Sign up at [render.com](https://render.com) (Hobby workspace, free, no card required).
2. **New + → Blueprint** → pick `Zulfique/PropCare-WIL-Task2-v2`. Render reads `render.yaml` and creates the service.
3. That is the whole setup. **Do not add a `JWT_SECRET`** — it is generated automatically — and do not add a disk or database; none are needed.
4. The app is live at <https://propcare-wil-task2.onrender.com/> once the first build finishes. Sign in with any demo account below using `PropCare123!`.
5. Push to `main` and the **Verify live deployment** job confirms the new commit is actually serving.

### What the Free plan costs you, stated plainly

These are Render's documented Free-plan limits, not implementation gaps:

| Limitation | Effect on this app |
|---|---|
| **Spins down after 15 min idle** | The first visitor after a quiet period waits ~30–60 s while the instance wakes. The health check absorbs this, but a demo should be opened shortly before it is presented. |
| **Ephemeral filesystem** | The SQLite file is lost on every redeploy, restart and spin-down. The app **reseeds itself on the next cold start**, so it is always fully populated and immediately usable — but anything created during a session (new requests, comments, ratings) does not survive. |
| **No persistent disk** | Not available on Free at all, hence the self-seeding design above. |
| **No SSH or dashboard shell** | Hence the demo password is pinned in code rather than generated for you to retrieve. |
| **750 instance hours/month per workspace** | One always-on service would consume the entire allowance, so a second service in the same workspace risks suspension until the month resets. |
| **5 GB outbound bandwidth/month** | Ample for a demonstration; exceeding it without a payment method suspends free services. |
| **`/robots.txt` is auto-"disallow" while asleep** | Search engines will not wake the service. Irrelevant for a graded demonstration. |

**If durable data is ever required**, the upgrade path is a paid Starter instance ($7/mo) with a persistent disk mounted at `/data` and `DB_PATH=/data/propcare.db` — the application code needs no changes, only that one environment variable.

## Branching & CI

Professional Gitflow, mapped to the rubric's "Branching and workflow" requirement.

- `main` — releasable; only receives merges from `develop` through a reviewed pull request.
- `develop` — the integration branch for all feature work.
- `feature/*` — short-lived branches: `backend-api`, `frontend-app`, `tests-pipeline`, `hosting-docs`, `a11y-robustness`, `rate-limits-and-diag`, `deploy-readiness`, `deploy-verify`, `fix-browser-test`.
- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, `ci(cd):`, `chore(deploy):`).
- All 9 feature branches merge into `develop` without conflicts.

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | push + PR on `main`/`develop` | Lint, syntax check, dependency audit, full test suite |
| `build.yml` | push + PR | Validate HTML/CSS/JS, build and publish the prototype to GitHub Pages |
| `deploy.yml` | push to `main` | Pre-flight gate, then verify `/api/health` is live on Render (no deploy token) |

## Screens

Overview dashboard (stats per role), requests list with search/filters, request detail with timeline + conversation + actions, report-an-issue wizard, properties, technicians, tenants, reports with CSV export, notifications, users (admin), roles, categories, profile/settings, and a design gallery with the original mockups.

## Requirements alignment

| User story / non-functional requirement | Where it is delivered |
|---|---|
| Tenant reports an issue with photo, category and urgency | `POST /api/requests` + `POST /api/requests/:id/photos`; report-issue wizard |
| Manager reviews and prioritises requests | `GET /api/requests`, `PATCH /api/requests/:id` (priority) |
| Manager assigns a technician | `POST /api/requests/:id/assign`; `ManagerActivityObserver` notified |
| Technician accepts, updates and completes work | `/accept`, `/status`, `/complete` endpoints + status history |
| Both parties converse on a request | `POST /api/requests/:id/comments` |
| Tenant confirms and rates completed work | `POST /api/requests/:id/ratings` (one per user, `CHECK` on score) |
| Admin manages users, roles and categories | `/api/users`, `/api/categories` with role guards |
| Manager views reports and exports CSV | `/api/reports` + client-side CSV export |
| Users are notified of relevant changes | `NotificationSubject` → observers → `/api/notifications` |
| Authentication and role-based access | JWT middleware + RBAC + object-level tenancy checks |
| Works on desktop, tablet and mobile | Responsive CSS, mobile bottom navigation, 390px browser test |
| Keyboard and screen-reader support | Accessible names on all controls, focus management, keyboard-only browser test |
| Feedback for loading, error and success states | Toast/modal system and in-button pending states |
| System is live and reachable | Render + GitHub Pages live URLs with automated health verification |

## Design notes

- Brand colours: navy `#172336`, teal `#a7cfce`, page background `#f2f4f8`.
- No CSS or JavaScript framework, no build step and no web fonts to download, which keeps first paint fast.
- `data/*.db` and `.env` are git-ignored; the database is rebuilt and seeded automatically when missing.

## Security audit

### Production dependencies

No known vulnerabilities in production dependencies.

### Development dependencies

`npm audit` reports **0 vulnerabilities** across both production and development dependencies.

Puppeteer was upgraded from `24.43.1` to `25.12.0` to clear four high-severity advisories that were confined to the browser-download tooling:

```
puppeteer (dev, direct)
├── puppeteer-core
└── @puppeteer/browsers
    └── extract-zip
```

| Advisory | Vulnerable range | Severity | Resolved in |
| --- | --- | --- | --- |
| `puppeteer` | 19.8.1 – 24.43.1 | high | 25.12.0 |
| `puppeteer-core` | 19.8.4 – 24.43.1 | high | 25.12.0 |
| `@puppeteer/browsers` | ≤ 2.13.2 | high | 25.12.0 |
| `extract-zip` | * | high | 25.12.0 |

**Why it was a deliberate major bump:** the remediating version sat outside the previous `^24.20.0` range, and `npm audit fix --force` resolved the advisories by *downgrading* Puppeteer to 19.8.0, which would have broken the browser suite. The upgrade was made explicitly and then validated with the full 70-check browser suite and 102-check unit/API suite rather than applied as an untested automated change.

### Credential logging

The application does not log `DEMO_PASSWORD` at startup. The seed message reads:

```
[propcare] demo accounts ready - password comes from DEMO_PASSWORD
```

## Task 1 prototype

The original static prototype lives in `prototype/` (HTML/CSS/JS + mockups). Run it with:

```bash
cd prototype
python -m http.server 8124   # open http://localhost:8124
```
