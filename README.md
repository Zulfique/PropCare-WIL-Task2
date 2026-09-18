# PropCare WIL Task 2


PropCare is a full-stack property maintenance management application for Obs Realty Group.


## Technology


- Node.js 22+
- Express
- SQLite
- JWT authentication
- bcrypt password hashing
- Role-based access control
- REST API
- HTML/CSS/JavaScript
- Jest
- Supertest
- Puppeteer


## Roles


The application supports:


- Tenant
- Property Manager
- Technician
- Administrator


Access to requests, properties, users, technicians, tenants and reports is scoped according to the authenticated user's role.


## Local development


### Requirements


- Node.js 22.5 or newer
- npm


### Install


```bash
npm ci
npm start


The default development port is:


8124
Environment configuration


Copy .env.example to .env.


PowerShell:


Copy-Item .env.example .env


Configure the values for your environment.


Example:


PORT=8124
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=2h
NODE_ENV=development
DB_PATH=data/propcare.db
DEMO_PASSWORD=<demo password>
CORS_ORIGINS=


Never commit a real .env file or production secrets.


Testing


Run the automated test suite:


npm test


Run JavaScript syntax checks:


npm run check


Run the browser smoke test:


npm run test:browser


Run the browser test with screenshots:


npm run test:browser:shots


Check the working tree:


git diff --check
API


The API base path is:


/api


Health:


GET /api/health


Authentication:


POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout


Requests:


GET /api/requests
POST /api/requests
GET /api/requests/:id


Properties:


GET /api/properties
GET /api/properties/:id


Reference data:


GET /api/categories
GET /api/statuses
GET /api/urgencies


Reports:


GET /api/reports/summary


Security


The application implements:


- JWT issuer validation
- JWT audience validation
- HS256 algorithm restriction
- Current account-status verification
- Role-based authorization
- Object-level request authorization
- Role-scoped property access
- bcrypt password hashing
- Helmet security headers
- CORS allow-listing
- Authentication rate limiting
- General API rate limiting
- JSON request-size limits
- Express-validator input validation


Deactivated accounts are rejected even when they still possess a previously issued JWT.


Render deployment


The Render Blueprint is:


render.yaml


The production SQLite database uses the persistent Render disk:


/data/propcare.db


The Render health check is:


/api/health
Render environment variables


Configure these values in Render:


NODE_ENV=production
PORT=10000
JWT_EXPIRES_IN=2h
DB_PATH=/data/propcare.db
JWT_SECRET=<long random secret>
DEMO_PASSWORD=<demo password>


Production secrets must not be committed to Git.


GitHub Actions
Continuous Integration


The CI workflow is:


.github/workflows/ci.yml


It performs:


Dependency installation
Backend syntax checks
Frontend syntax checks
Production dependency audit
Automated tests
Prototype HTML validation
Task 2 HTML validation
GitHub Pages


The prototype deployment workflow is:


.github/workflows/build.yml


The prototype is published at:


https://zulfique.github.io/PropCare-WIL-Task2/prototype/
Render CD


The Render deployment workflow is:


.github/workflows/deploy.yml


A push to main:


Installs dependencies
Runs automated tests
Runs syntax checks
Selects the Render deployment hook
Triggers Render when a hook is configured
Waits for the Render health endpoint
Configure Render deployment


Create a Render Deploy Hook for the service.


Store the hook in GitHub Actions secrets as:


RENDER_DEPLOY_HOOK_URL


The workflow also supports supplying hook_url when manually running the workflow.


Deployment health


Render service:


https://propcare-wil-task2.onrender.com/


Health endpoint:


https://propcare-wil-task2.onrender.com/api/health


A successful deployment must return a successful response from the health endpoint.


Project structure
.
├── .github/
│   └── workflows/
├── public/
├── prototype/
├── scripts/
├── src/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── db.js
├── tests/
├── .env.example
├── package.json
├── render.yaml
├── README.md
└── server.js
Notes


SQLite uses Node's built-in node:sqlite module and therefore requires a compatible Node.js version.


The prototype directory contains the Task 1 deliverable and is kept separate from the Task 2 Express application.




---


# 3. Fix `scripts/browser-test.js`


This is still hard-coded to:


```js
const PUPPETEER_PATH = 'C:/Users/27635/AppData/Roaming/npm/node_modules/puppeteer';
const CHROME = 'C:/Users/27635/.cache/puppeteer/.../chrome.exe';


That's not portable.


At minimum, change the beginning to:


const fs = require('fs');
const path = require('path');


const PUPPETEER_PATH =
  process.env.PPC_PUPPETEER_PATH ||
  'C:/Users/27635/AppData/Roaming/npm/node_modules/puppeteer';


const CHROME =
  process.env.PPC_CHROME || undefined;


const BASE =
  process.env.PPC_BASE ||
  'http://localhost:8124';


Then change:


const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1440, height: 900 },
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
});


to:


const browser = await puppeteer.launch({
  ...(CHROME ? { executablePath: CHROME } : {}),
  headless: 'new',
  defaultViewport: {
    width: 1440,
    height: 900,
  },
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--window-size=1440,900',
  ],
});
Important


Your repository currently says Puppeteer is a global installation rather than a project dependency.


That is fragile.


A better fix is to add Puppeteer to devDependencies:


"puppeteer": "^24.20.0"


Then:


const puppeteer = require('puppeteer');


instead of:


const puppeteer = require(PUPPETEER_PATH);


That makes the browser test reproducible in GitHub Actions and on another Windows machine.


4. Add the missing deactivation regression test


Your current tests/rbac.test.js has the deactivation login test, but it doesn't test an already-issued JWT.


Add this:


it('rejects an existing token after the account is deactivated', async () => {
  const adminToken = await login('admin@obsrealty.co.za');


  const created = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Existing Token User',
      email: 'existing.token@example.com',
      password: 'ExistingPass1!',
      role: 'tenant',
    });


  expect(created.status).toBe(201);


  const userId = created.body.data.user.id;


  const userToken = await login(
    'existing.token@example.com'
  );


  const deactivate = await request(app)
    .put(`/api/users/${userId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      active: false,
    });


  expect(deactivate.status).toBe(200);


  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${userToken}`);


  expect(res.status).toBe(403);
  expect(res.body.message).toContain('deactivated');
});


Your newly updated auth.js should then pass this test because it now executes:


const user = q.userByIdFull().get(decoded.id);


and subsequently checks:


if (!user.active) {
```

Now let me write the browser-test.js file. First let me check if it exists:Now let me check the browser-test.js file:
<tool_call>
<function=bash>
<parameter=command>
ls "C:\Users\27635\Downloads\Video Idea\PropCare-WIL-Task2\scripts\browser-test.js" 2>/dev/null && echo "exists" || echo "not found"