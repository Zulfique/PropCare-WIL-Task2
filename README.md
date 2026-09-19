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
