# PropCare — Smart Property Maintenance Management

PropCare is a full-stack property maintenance management platform for Obs Realty Group. It includes the Task 2 Express/SQLite application with a JWT-secured REST API and vanilla JavaScript front end, plus the original Task 1 prototype.

## Quick links

| Resource | URL |
| --- | --- |
| Repository | <https://github.com/Zulfique/PropCare-WIL-Task2> |
| Local application | <http://localhost:8124> |
| API health check | <http://localhost:8124/api/health> |
| Task 1 prototype | <https://zulfique.github.io/PropCare-WIL-Task2/prototype/> |
| Render deployment | <https://propcare-wil-task2.onrender.com/> |

## Features

- Residents report maintenance issues with categories, urgency, details, and photos.
- Property managers review requests, manage priorities, and assign technicians.
- Technicians accept jobs, update progress, and complete work.
- Requests retain status history, comments, notifications, and ratings.
- Administrators manage users, roles, categories, and reports.
- Responsive SPA with mobile navigation and keyboard-accessible controls.

## Technology

- Node.js 22.5 or newer
- Express
- SQLite using Node's built-in `node:sqlite`
- JWT authentication
- bcrypt password hashing
- Role-based and object-level authorization
- Helmet security headers
- CORS allow-listing
- Rate limiting
- Express-validator
- Vanilla JavaScript front end
- Jest and Supertest
- Puppeteer browser tests
- GitHub Actions and Render deployment

## Demo accounts

Seeded accounts use `PropCare123!` unless `DEMO_PASSWORD` is configured.

| Role | Email |
| --- | --- |
| Tenant | `sarahwilliams@example.com` |
| Property manager | `michael.jacobs@obsrealty.co.za` |
| Technician | `johan.vdm@obsrealty.co.za` |
| Administrator | `admin@obsrealty.co.za` |

Do not use demo credentials in production.

## Local development

### Requirements

- Node.js 22.5 or newer
- npm

Node 22 is required because the application uses Node's built-in `node:sqlite` module.

### Install

```bash
npm ci
```

### Share a live URL with no account, no API key and no cost

`npm run tunnel` starts the PropCare server on your machine and exposes it over
a **Cloudflare Quick Tunnel** (`trycloudflare.com`). No account, no API key, no
credit card and no Render/paid hosting needed:

- `cloudflared` is downloaded automatically on first use and cached under
  `.tooling/` (git-ignored).
- A temporary `JWT_SECRET` is generated automatically if no `.env` is present,
  so the command works with zero setup.

```bash
npm run tunnel
```

When the tunnel is up you'll see two public URLs to open or share:

```
App     https://<random>.trycloudflare.com
Health  https://<random>.trycloudflare.com/api/health
```

Caveats:

- The URL is only live while `npm run tunnel` is running on your machine.
- The URL is random and changes every time you restart the tunnel.
- It is a preview/demo link, not a permanent production URL. For an always-on
  public deployment, use the Render blueprint (`render.yaml`) on a free Render
  account - that is the only approach that does not need your PC to stay on.

## Security audit

### Production dependencies

No known vulnerabilities in production dependencies.

### Development dependencies

One audit warning remains through Puppeteer's browser-download tooling:

```
puppeteer
└── @puppeteer/browsers
    └── extract-zip
```

This affects only the browser-test tooling, not the production runtime. NPM's automatic fix would downgrade Puppeteer to 19.8.0 using a breaking change, which would break the current test suite. The warning is acceptable for dev-only use.

### Credential logging

The application no longer logs `DEMO_PASSWORD` at startup. The seed message now reads:

```
[propcare] demo account credentials configured.
```
