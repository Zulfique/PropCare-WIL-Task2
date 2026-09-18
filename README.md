# PropCare — WIL Task 2

PropCare is a full-stack property maintenance management web application developed for the Work Integrated Learning (WIL) Task 2 project.

The application provides role-based workflows for tenants, property managers, technicians, and administrators to manage maintenance requests, properties, users, notifications, ratings, and reporting.

---

# Live URLs

## Production Application

**Render application:**

https://propcare-wil-task2.onrender.com

**Production health check:**

https://propcare-wil-task2.onrender.com/api/health

**Production API information:**

https://propcare-wil-task2.onrender.com/api

The production application serves the PropCare frontend and REST API from the same Express application.

---

## GitHub Repository

**Repository:**

https://github.com/Zulfique/PropCare-WIL-Task2

**Main branch:**

https://github.com/Zulfique/PropCare-WIL-Task2/tree/main

---

## GitHub Pages Prototype

The WIL Task 1/static prototype is deployed separately through GitHub Pages.

**Prototype:**

https://zulfique.github.io/PropCare-WIL-Task2/prototype/

The GitHub Pages prototype is a static frontend demonstration and does not replace the full Express/SQLite backend application.

---

## Local Application URLs

The default local development port is **8124**.

**Application:**

http://localhost:8124

**API:**

http://localhost:8124/api

**Health check:**

http://localhost:8124/api/health

**API information:**

http://localhost:8124/api

If the `PORT` environment variable is changed, replace `8124` with the configured port.

Example:

```text
http://localhost:3000
http://localhost:3000/api
http://localhost:3000/api/health
```

---

# Features

## Tenant

* Login and authentication
* View assigned units and properties
* Submit maintenance requests
* Select request category and urgency
* View request history and status
* Search and filter maintenance requests
* Add comments
* Upload request photos
* View notifications
* Confirm completed work
* Reopen completed work when necessary
* Rate completed maintenance requests
* Update personal profile

## Property Manager

* View managed properties
* View maintenance requests for managed properties
* Review and update maintenance requests
* Assign technicians
* Change request urgency
* Add comments and notes
* View tenant information
* View notifications
* View portfolio-level maintenance reports

## Technician

* View assigned properties
* View assigned maintenance jobs
* Accept or reject jobs
* Place jobs on hold
* Resume work
* Mark jobs as completed
* Add comments
* View notifications

## Administrator

* View platform-wide information
* Manage users
* Activate and deactivate user accounts
* View all properties and requests
* View platform-wide reports
* Access administrative functionality

---

# Technology Stack

## Backend

* Node.js
* Express.js
* SQLite
* Node `node:sqlite`
* JSON Web Tokens (JWT)
* bcryptjs
* express-validator
* Helmet
* CORS
* Winston
* Morgan
* Express Rate Limit

## Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap
* Google Fonts

## Testing

* Jest
* Supertest
* Puppeteer

## Deployment

* Render
* GitHub Actions
* GitHub Pages

---

# Project Structure

```text
PropCare-WIL-Task2/
│
├── .github/
│   └── workflows/
│       ├── build.yml
│       ├── ci.yml
│       └── deploy.yml
│
├── public/
│   ├── css/
│   ├── js/
│   ├── index.html
│   └── ...
│
├── prototype/
│   ├── *.html
│   ├── js/
│   ├── data/
│   └── ...
│
├── scripts/
│   ├── browser-test.js
│   ├── seed-cli.js
│   └── ...
│
├── src/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── notifications.js
│   │   ├── properties.js
│   │   ├── reports.js
│   │   ├── requests.js
│   │   ├── technicians.js
│   │   ├── tenants.js
│   │   └── users.js
│   │
│   ├── services/
│   │   └── requests.js
│   │
│   ├── utils/
│   │   └── logger.js
│   │
│   ├── app.js
│   └── db.js
│
├── tests/
│   ├── auth.test.js
│   ├── properties.test.js
│   ├── rbac.test.js
│   └── ...
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── render.yaml
├── server.js
└── README.md
```

---

# Requirements

The current project requires:

* Node.js **22.5.0 or later**
* npm
* Git

Check your installed versions:

```powershell
node --version
npm --version
git --version
```

Node should report version 22.5.0 or newer.

Example:

```text
v22.20.0
10.x.x
git version 2.x.x
```

---

# Windows PowerShell Setup

The following instructions are intended for Windows PowerShell.

## 1. Clone the repository

```powershell
git clone https://github.com/Zulfique/PropCare-WIL-Task2.git
```

Enter the project:

```powershell
cd PropCare-WIL-Task2
```

Verify the repository:

```powershell
git status
```

---

# 2. Install Dependencies

For a clean installation using the committed lockfile:

```powershell
npm ci
```

If you intentionally need to regenerate/update dependencies:

```powershell
npm install
```

For normal setup, prefer:

```powershell
npm ci
```

---

# 3. Create the Environment File

Copy the example environment configuration:

```powershell
Copy-Item .env.example .env
```

Open the file:

```powershell
notepad .env
```

Do not commit `.env` to Git.

---

# 4. Configure JWT_SECRET

The application requires a JWT secret of at least 32 characters.

Generate a secure random secret with Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `.env`:

```text
JWT_SECRET=your-generated-secret
```

Do not use the example value in production.

The application will refuse to start if `JWT_SECRET` is missing or shorter than 32 characters.

---

# 5. Configure the Local Environment

A typical development `.env` file looks like:

```text
PORT=8124

JWT_SECRET=replace-with-a-long-random-secret

JWT_EXPIRES_IN=2h

NODE_ENV=development

DB_PATH=data/propcare.db

DEMO_PASSWORD=change-this-demo-password

CORS_ORIGINS=http://localhost:8124
```

For a simple same-origin local installation, `CORS_ORIGINS` may be left empty if the frontend is being served directly by the same Express server.

---

# Environment Variables

| Variable         | Purpose                    | Example                    |
| ---------------- | -------------------------- | -------------------------- |
| `PORT`           | HTTP server port           | `8124`                     |
| `JWT_SECRET`     | JWT signing secret         | Random 32+ character value |
| `JWT_EXPIRES_IN` | JWT expiration period      | `2h`                       |
| `NODE_ENV`       | Runtime environment        | `development`              |
| `DB_PATH`        | SQLite database location   | `data/propcare.db`         |
| `DEMO_PASSWORD`  | Demo/seed account password | Local secret               |
| `CORS_ORIGINS`   | Allowed browser origins    | `http://localhost:8124`    |
| `PPC_BASE`       | Browser test base URL      | `http://localhost:8124`    |
| `PPC_CHROME`     | Optional Chrome executable | Windows Chrome path        |

The authoritative example configuration is:

```text
.env.example
```

---

# Database

PropCare uses SQLite.

The default database path is:

```text
data/propcare.db
```

The path can be changed using:

```text
DB_PATH
```

For Render, the configured database path is:

```text
/data/propcare.db
```

Render uses a persistent disk mounted at:

```text
/data
```

The database is initialized and seeded by the application.

---

# Running the Application

## Production-style local start

From the project root:

```powershell
npm start
```

This runs:

```text
node --experimental-sqlite server.js
```

The default application URL is:

```text
http://localhost:8124
```

Open it in your browser:

```powershell
Start-Process "http://localhost:8124"
```

---

# Development Mode

For automatic restart during development:

```powershell
npm run dev
```

This runs the application through Nodemon.

The application is normally available at:

```text
http://localhost:8124
```

---

# Start From a Clean PowerShell Session

If you have just opened PowerShell:

```powershell
cd "C:\Path\To\PropCare-WIL-Task2"
npm ci
Copy-Item .env.example .env
notepad .env
npm start
```

Then open:

```text
http://localhost:8124
```

Replace the project path with the actual location of your repository.

---

# Stop the Application

Press:

```text
Ctrl + C
```

in the PowerShell window running PropCare.

---

# Check Whether the Server Is Running

Use:

```powershell
Invoke-WebRequest "http://localhost:8124/api/health"
```

Or:

```powershell
curl.exe "http://localhost:8124/api/health"
```

Expected response:

```json
{
  "status": "success",
  "message": "PropCare API is running"
}
```

---

# API URLs

The API base URL locally is:

```text
http://localhost:8124/api
```

The production API base URL is:

```text
https://propcare-wil-task2.onrender.com/api
```

---

# API Health

## Local

```text
GET http://localhost:8124/api/health
```

## Production

```text
GET https://propcare-wil-task2.onrender.com/api/health
```

---

# API Information

## Local

```text
GET http://localhost:8124/api
```

## Production

```text
GET https://propcare-wil-task2.onrender.com/api
```

The API information endpoint provides the main available API resources.

---

# Authentication Endpoints

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Full local URLs:

```text
POST http://localhost:8124/api/auth/login
GET  http://localhost:8124/api/auth/me
POST http://localhost:8124/api/auth/logout
```

Production:

```text
POST https://propcare-wil-task2.onrender.com/api/auth/login
GET  https://propcare-wil-task2.onrender.com/api/auth/me
POST https://propcare-wil-task2.onrender.com/api/auth/logout
```

---

# User Endpoints

```text
GET /api/users/me
PUT /api/users/me
PUT /api/users/:id/status
```

Example local URLs:

```text
GET http://localhost:8124/api/users/me
PUT http://localhost:8124/api/users/me
PUT http://localhost:8124/api/users/:id/status
```

---

# Property Endpoints

```text
GET /api/properties
GET /api/properties/:id
```

Example:

```text
GET http://localhost:8124/api/properties
GET http://localhost:8124/api/properties/P1
```

---

# Maintenance Request Endpoints

Main request endpoints include:

```text
GET  /api/requests
GET  /api/requests/:id
POST /api/requests
POST /api/requests/:id/action
POST /api/requests/:id/comment
POST /api/requests/:id/photo
POST /api/requests/:id/rate
```

Example local URLs:

```text
GET  http://localhost:8124/api/requests
GET  http://localhost:8124/api/requests/REQ-1045
POST http://localhost:8124/api/requests
POST http://localhost:8124/api/requests/REQ-1045/action
POST http://localhost:8124/api/requests/REQ-1045/comment
POST http://localhost:8124/api/requests/REQ-1045/photo
POST http://localhost:8124/api/requests/REQ-1045/rate
```

---

# Technician Endpoints

```text
GET /api/technicians
```

Local:

```text
GET http://localhost:8124/api/technicians
```

Production:

```text
GET https://propcare-wil-task2.onrender.com/api/technicians
```

---

# Tenant Endpoints

```text
GET /api/tenants
```

Local:

```text
GET http://localhost:8124/api/tenants
```

---

# Category, Status and Urgency Endpoints

Reference data is served through the API.

Examples include:

```text
GET /api/categories
GET /api/statuses
GET /api/urgencies
```

Local:

```text
GET http://localhost:8124/api/categories
GET http://localhost:8124/api/statuses
GET http://localhost:8124/api/urgencies
```

---

# Notification Endpoints

```text
GET  /api/notifications
POST /api/notifications/read-all
```

Local:

```text
GET  http://localhost:8124/api/notifications
POST http://localhost:8124/api/notifications/read-all
```

---

# Reporting

The reporting endpoint is:

```text
GET /api/reports/summary
```

Local:

```text
GET http://localhost:8124/api/reports/summary
```

Production:

```text
GET https://propcare-wil-task2.onrender.com/api/reports/summary
```

Reports are restricted according to the authenticated user's role.

Administrators receive platform-level reporting.

Property managers receive reports scoped to properties they manage.

---

# Authentication

The API uses JWT bearer authentication.

After a successful login, the API returns a JWT.

Authenticated requests use:

```text
Authorization: Bearer <token>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

JWT verification includes:

* Signing secret
* HS256 algorithm restriction
* Issuer validation
* Audience validation
* Token expiration
* Current database user lookup
* Account active-state verification

Deactivated accounts cannot continue using previously issued tokens.

---

# Role-Based Access Control

PropCare has four main roles:

```text
tenant
manager
technician
admin
```

Authorization is enforced by the backend.

Frontend visibility is not treated as a security boundary.

---

# Tenant Access

Tenants can:

* View their assigned units
* Create requests for their assigned units
* View their own requests
* Comment on permitted requests
* View notifications
* Rate eligible completed requests
* Update their profile

When creating a request, the backend verifies that the selected unit belongs to the authenticated tenant.

The property is derived from the validated unit rather than trusted from browser input.

---

# Property Manager Access

Managers can access:

* Properties in their managed portfolio
* Requests associated with those properties
* Assigned technicians
* Portfolio reports
* Relevant tenant/request information

Manager request and report queries are scoped to managed properties.

---

# Technician Access

Technicians can access:

* Properties associated with their assigned maintenance work
* Requests assigned to their technician account
* Technician-specific request actions
* Relevant notifications

The application maps the authenticated user ID to the corresponding technician record before performing technician-specific queries.

---

# Administrator Access

Administrators have platform-wide access to administrative resources.

Administrators can:

* Manage users
* Activate accounts
* Deactivate accounts
* View platform-wide requests
* View platform-wide properties
* View reports
* Perform administrative operations

---

# Maintenance Request Workflow

A typical maintenance request follows a workflow similar to:

```text
Submitted
    ↓
Under Review
    ↓
Assigned
    ↓
In Progress
    ↓
Completed
    ↓
Closed
```

Other supported states/actions may include:

```text
On Hold
Rejected
Cancelled
Reopened
```

Available transitions depend on:

* Current request status
* User role
* Request ownership
* Technician assignment
* Property manager relationship

---

# Request Security

Maintenance requests use object-level authorization.

A user cannot access or modify an arbitrary request simply by knowing its request ID.

The server verifies the relationship between the authenticated user and the request.

Checks include:

* Tenant ownership
* Technician assignment
* Manager property ownership
* Administrator privileges

This prevents unauthorized cross-user and cross-property access.

---

# Property Security

Property access is also role-scoped.

Administrators can access all properties.

Managers receive properties within their managed portfolio.

Tenants receive properties associated with their assigned units/requests.

Technicians receive properties associated with their assigned maintenance work.

Property detail access is separately authorized rather than relying only on the property list.

---

# Request Creation Security

Tenants cannot freely choose an arbitrary property when submitting a request.

The server:

1. Identifies the authenticated tenant.
2. Retrieves the tenant's assigned units.
3. Matches the submitted unit.
4. Rejects units that are not assigned to that tenant.
5. Derives the property from the validated unit.
6. Creates the request using the server-derived property.

This prevents clients from changing a property ID to another property.

---

# Ratings

A maintenance request can be rated only when:

1. The authenticated user is the requesting tenant.
2. The request has reached `completed`.
3. The request has not already been rated.

Ratings use a whole-number scale from:

```text
1–5
```

---

# Input Validation

Incoming API data is validated with `express-validator`.

Validation covers areas including:

* Email addresses
* Password requirements
* User roles
* Categories
* Urgency
* Status
* Request IDs
* Request titles
* Request details
* Unit names
* Technician IDs
* Comments
* Ratings
* Profile updates
* Search/filter parameters

Invalid input produces an appropriate API error response.

---

# Security Controls

The application includes server-side controls including:

* JWT authentication
* JWT issuer validation
* JWT audience validation
* JWT algorithm restriction
* Active-account checks
* Role-based authorization
* Object-level authorization
* Password hashing with bcrypt
* Input validation
* CORS allow-listing
* Helmet security headers
* JSON request size limits
* API rate limiting
* Authentication rate limiting
* Centralized error handling
* Application logging
* Protection against unauthorized property/request access
* Disabled Express `X-Powered-By` header

---

# CORS

CORS is controlled by:

```text
CORS_ORIGINS
```

Multiple origins can be supplied as a comma-separated list.

Example:

```text
CORS_ORIGINS=http://localhost:8124,https://example.com
```

Only trusted browser origins should be configured for production.

Requests without an `Origin` header, such as many server-to-server or command-line requests, are permitted.

---

# Error Handling

The backend uses centralized error handling.

API errors use a JSON structure similar to:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation error"
}
```

Invalid JSON payloads return HTTP 400.

Oversized JSON request bodies return HTTP 413.

Unexpected server errors are handled centrally without unnecessarily exposing implementation details.

---

# Logging

Application logging is handled through the project logger.

Important application/security events can include:

* Authentication events
* Login failures
* User creation
* Profile changes
* Account status changes
* Request creation
* Request assignment
* Request status changes
* Notifications
* Unexpected application errors

Secrets, passwords, and authentication tokens should never be committed or intentionally logged.

---

# Testing

## Run All Tests

```powershell
npm test
```

The test command uses the Node SQLite experimental flag required by the project.

---

# Run Tests in Watch Mode

```powershell
npm run test:watch
```

---

# Run Syntax Checks

```powershell
npm run check
```

This checks the backend and frontend JavaScript files for syntax errors.

---

# Check Git Whitespace

```powershell
git diff --check
```

---

# Browser Testing

The project includes Puppeteer browser tests.

Run:

```powershell
npm run test:browser
```

Run screenshot-only browser testing:

```powershell
npm run test:browser:shots
```

---

# Browser Test Configuration

The browser test can use:

```text
PPC_BASE
```

to specify the application URL.

Example:

```powershell
$env:PPC_BASE = "http://localhost:8124"
npm run test:browser
```

A custom Chrome/Chromium executable can be specified with:

```powershell
$env:PPC_CHROME = "C:\Path\To\chrome.exe"
npm run test:browser
```

Do not commit machine-specific browser executable paths.

---

# Recommended Local Verification

After making changes, run:

```powershell
npm ci
npm run check
npm test
git diff --check
```

Then start the application:

```powershell
npm start
```

Open:

```text
http://localhost:8124
```

Then run the browser tests:

```powershell
npm run test:browser
```

---

# Complete Development Workflow

From a clean clone:

```powershell
git clone https://github.com/Zulfique/PropCare-WIL-Task2.git
cd PropCare-WIL-Task2
npm ci
Copy-Item .env.example .env
notepad .env
npm run check
npm test
npm start
```

Open:

```text
http://localhost:8124
```

In a second PowerShell window, from the same project directory:

```powershell
$env:PPC_BASE = "http://localhost:8124"
npm run test:browser
```

---

# Seed Data

The project includes seed/demo data.

The seed process is idempotent and runs as part of application initialization.

A seed CLI is also available:

```powershell
npm run seed
```

The seed command uses:

```text
scripts/seed-cli.js
```

Do not use real production credentials for demo data.

---

# Demo Accounts

The frontend includes demo account selections for:

* Sarah Williams — Tenant
* Michael Jacobs — Property Manager
* Johan van der Merwe — Technician
* System Admin — Administrator

The demo password is controlled by:

```text
DEMO_PASSWORD
```

Do not treat demo credentials as production credentials.

Production credentials should be configured securely through Render environment variables/secrets.

---

# Render Deployment

The Render configuration is stored in:

```text
render.yaml
```

Render service name:

```text
propcare-wil-task2
```

Production service:

```text
https://propcare-wil-task2.onrender.com
```

Production health endpoint:

```text
https://propcare-wil-task2.onrender.com/api/health
```

---

# Deploying to Render

## Option 1 — Render Blueprint

Connect the GitHub repository to Render and create a Blueprint using:

```text
render.yaml
```

The configuration defines:

* Node runtime
* Node 22
* Production environment
* Build command
* Start command
* Health check
* Persistent SQLite disk
* JWT configuration
* Demo password configuration

---

# Render Build Command

The configured Render build command is:

```text
npm ci
```

---

# Render Start Command

The configured Render start command is:

```text
node --experimental-sqlite server.js
```

---

# Render Health Check

Render checks:

```text
/api/health
```

Full production URL:

```text
https://propcare-wil-task2.onrender.com/api/health
```

---

# Render Environment Variables

Render requires secure configuration for:

```text
NODE_VERSION=22
NODE_ENV=production
PORT=10000
JWT_EXPIRES_IN=2h
DB_PATH=/data/propcare.db
JWT_SECRET=<secure random secret>
DEMO_PASSWORD=<secure demo password>
```

The Render configuration intentionally marks sensitive variables such as `JWT_SECRET` and `DEMO_PASSWORD` as values that must be configured securely.

Do not commit production secrets to GitHub.

---

# Render Persistent Storage

The Render configuration uses a persistent disk:

```text
Disk name: propcare-data
Mount path: /data
Size: 1 GB
```

The SQLite database is stored at:

```text
/data/propcare.db
```

---

# GitHub Actions

The repository contains three GitHub Actions workflows:

```text
.github/workflows/ci.yml
.github/workflows/build.yml
.github/workflows/deploy.yml
```

---

# CI Workflow

The CI workflow:

```text
.github/workflows/ci.yml
```

runs on pushes to:

```text
main
develop
```

and pull requests targeting:

```text
main
```

The workflow performs checks including:

* Node.js setup
* Dependency installation
* JavaScript syntax checks
* Frontend syntax checks
* Production dependency audit
* Jest test suite
* Prototype HTML validation
* Application HTML validation

---

# GitHub Pages Workflow

The GitHub Pages workflow is:

```text
.github/workflows/build.yml
```

It validates and deploys the static prototype.

The deployed prototype is:

```text
https://zulfique.github.io/PropCare-WIL-Task2/prototype/
```

---

# Render Deployment Workflow

The Render deployment workflow is:

```text
.github/workflows/deploy.yml
```

It:

1. Checks out the repository.
2. Installs dependencies.
3. Runs automated tests.
4. Runs syntax checks.
5. Looks for a Render deployment hook.
6. Triggers the Render deployment when configured.
7. Waits for the production health endpoint.
8. Fails if the health endpoint does not become healthy within the configured wait period.

The required GitHub repository secret is:

```text
RENDER_DEPLOY_HOOK_URL
```

A Render deployment hook must be configured before the workflow can automatically trigger Render.

---

# GitHub Actions URLs

Repository:

https://github.com/Zulfique/PropCare-WIL-Task2

Actions:

https://github.com/Zulfique/PropCare-WIL-Task2/actions

Workflows:

https://github.com/Zulfique/PropCare-WIL-Task2/actions/workflows/ci.yml

https://github.com/Zulfique/PropCare-WIL-Task2/actions/workflows/build.yml

https://github.com/Zulfique/PropCare-WIL-Task2/actions/workflows/deploy.yml

---

# Important GitHub Files

Repository configuration files:

```text
package.json
.env.example
render.yaml
server.js
README.md
```

GitHub Actions:

```text
.github/workflows/ci.yml
.github/workflows/build.yml
.github/workflows/deploy.yml
```

---

# Useful GitHub URLs

Repository:

https://github.com/Zulfique/PropCare-WIL-Task2

Source code:

https://github.com/Zulfique/PropCare-WIL-Task2/tree/main/src

Frontend:

https://github.com/Zulfique/PropCare-WIL-Task2/tree/main/public

Prototype:

https://github.com/Zulfique/PropCare-WIL-Task2/tree/main/prototype

Tests:

https://github.com/Zulfique/PropCare-WIL-Task2/tree/main/tests

Scripts:

https://github.com/Zulfique/PropCare-WIL-Task2/tree/main/scripts

Workflows:

https://github.com/Zulfique/PropCare-WIL-Task2/tree/main/.github/workflows

Environment example:

https://github.com/Zulfique/PropCare-WIL-Task2/blob/main/.env.example

Package configuration:

https://github.com/Zulfique/PropCare-WIL-Task2/blob/main/package.json

Render configuration:

https://github.com/Zulfique/PropCare-WIL-Task2/blob/main/render.yaml

---

# Troubleshooting

## `node` is not recognized

Install Node.js 22 or later, then restart PowerShell.

Check:

```powershell
node --version
```

---

## Node version is too old

Check:

```powershell
node --version
```

The project requires:

```text
Node >=22.5.0
```

Upgrade Node.js before running the application.

---

# `npm ci` fails

Try:

```powershell
npm install
```

Then:

```powershell
npm run check
npm test
```

If dependencies are badly corrupted:

```powershell
Remove-Item -Recurse -Force node_modules
npm ci
```

---

# `JWT_SECRET` Error

If the server reports that `JWT_SECRET` is missing or too short:

```powershell
notepad .env
```

Set:

```text
JWT_SECRET=<32+ character random value>
```

You can generate one with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Restart the server:

```powershell
npm start
```

---

# Port Already in Use

Check port 8124:

```powershell
Get-NetTCPConnection -LocalPort 8124 -ErrorAction SilentlyContinue
```

You can change the port:

```powershell
$env:PORT = "8125"
npm start
```

Then open:

```text
http://localhost:8125
```

---

# Check a Different Port

For example:

```powershell
$env:PORT = "3000"
npm start
```

Application:

```text
http://localhost:3000
```

Health:

```text
http://localhost:3000/api/health
```

---

# CORS Errors

Check:

```text
CORS_ORIGINS
```

For local development:

```text
CORS_ORIGINS=http://localhost:8124
```

If using another port:

```text
CORS_ORIGINS=http://localhost:3000
```

Restart the application after changing `.env`.

---

# Browser Test Cannot Find Chrome

Set:

```powershell
$env:PPC_CHROME = "C:\Path\To\chrome.exe"
```

Then:

```powershell
npm run test:browser
```

The browser test also supports:

```powershell
$env:PPC_BASE = "http://localhost:8124"
```

---

# Browser Test Against Render

Set:

```powershell
$env:PPC_BASE = "https://propcare-wil-task2.onrender.com"
```

Then:

```powershell
npm run test:browser
```

Only use this when testing the deployed application and when the Render service is available.

---

# Health Check Fails

Local:

```powershell
Invoke-WebRequest "http://localhost:8124/api/health"
```

Production:

```powershell
Invoke-WebRequest "https://propcare-wil-task2.onrender.com/api/health"
```

If the local health check fails, inspect the PowerShell window running:

```powershell
npm start
```

If the production health check fails, inspect the Render deployment logs.

---

# Check Git Status

```powershell
git status
```

---

# Check Recent Commits

```powershell
git log --oneline --decorate -10
```

---

# Check Changed Files

```powershell
git diff --name-only
```

---

# Check Whitespace Errors

```powershell
git diff --check
```

---

# Recommended Commit Verification

Before committing changes:

```powershell
npm run check
npm test
git diff --check
git status
```

For frontend/browser-related changes:

```powershell
npm run test:browser
```

---

# Security Guidelines

When modifying PropCare:

1. Keep authorization checks on the server.
2. Validate every externally supplied value.
3. Never trust IDs supplied by the browser.
4. Verify object ownership before modifying resources.
5. Never hard-code production credentials.
6. Never commit `.env`.
7. Never commit JWT secrets.
8. Never commit deployment hooks.
9. Use secure Render environment variables for production secrets.
10. Add regression tests for security-sensitive changes.
11. Run the test suite before committing.
12. Run syntax checks before committing.
13. Use portable paths in scripts.
14. Avoid machine-specific configuration.
15. Keep documentation synchronized with the implementation.

---

# Project Status

PropCare currently implements the core WIL Task 2 property maintenance workflow, including:

* Authentication
* JWT authorization
* Role-based access control
* Object-level authorization
* Property management
* Tenant maintenance requests
* Technician assignment
* Request status workflows
* Notifications
* Comments
* Ratings
* Reporting
* Input validation
* Security headers
* Rate limiting
* CORS configuration
* SQLite persistence
* Automated testing
* Browser testing
* GitHub Actions
* Render deployment configuration
* GitHub Pages prototype deployment

The application should be tested locally and through the configured deployment/CI environment before being considered production-ready.

---

# Quick Reference

## Local

```text
Application
http://localhost:8124

API
http://localhost:8124/api

Health
http://localhost:8124/api/health
```

## Production

```text
Application
https://propcare-wil-task2.onrender.com

API
https://propcare-wil-task2.onrender.com/api

Health
https://propcare-wil-task2.onrender.com/api/health
```

## Prototype

```text
https://zulfique.github.io/PropCare-WIL-Task2/prototype/
```

## Repository

```text
https://github.com/Zulfique/PropCare-WIL-Task2
```

## GitHub Actions

```text
https://github.com/Zulfique/PropCare-WIL-Task2/actions
```

---

# Quick Start

For a new Windows installation:

```powershell
git clone https://github.com/Zulfique/PropCare-WIL-Task2.git
cd PropCare-WIL-Task2
npm ci
Copy-Item .env.example .env
notepad .env
npm run check
npm test
npm start
```

Then open:

```text
http://localhost:8124
```

Health check:

```text
http://localhost:8124/api/health
```

Browser test:

```powershell
$env:PPC_BASE = "http://localhost:8124"
npm run test:browser
```

---

# License

This project was developed as part of a Work Integrated Learning (WIL) academic project.

Refer to the repository and associated academic requirements for applicable usage and submission conditions.

---

# Author

**PropCare WIL Task 2**

Repository:

https://github.com/Zulfique/PropCare-WIL-Task2
