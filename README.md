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


Run the complete Jest/Supertest suite:


npm test


Run JavaScript syntax checks:


npm run check


Run the browser test:


npm run test:browser


Run the browser test with screenshots:


npm run test:browser:shots


Check the working tree for whitespace errors:


git diff --check
API


The API base path is:


/api


Health check:


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


The production SQLite database is stored on the persistent Render disk:


/data/propcare.db


The Render health check is:


/api/health
Render environment


Configure these values in Render:


NODE_ENV=production
PORT=10000
JWT_EXPIRES_IN=2h
DB_PATH=/data/propcare.db
JWT_SECRET=<long random secret>
DEMO_PASSWORD=<demo password>


Do not commit production secrets.


GitHub Actions
CI


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
Runs tests
Runs syntax checks
Selects the Render deploy hook
Triggers Render when a hook is configured
Waits for the Render health endpoint
Configure Render deployment


Create a Render Deploy Hook for the service.


Add it to GitHub as:


RENDER_DEPLOY_HOOK_URL


under:


GitHub
→ Settings
→ Secrets and variables
→ Actions


The Render workflow also supports supplying hook_url manually through GitHub Actions.


Deployment health


The Render service is:


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
├── server.js
└── README.md
Notes


SQLite uses Node's built-in node:sqlite module and therefore requires a compatible Node.js version.


The prototype directory contains the Task 1 deliverable and is kept separate from the Task 2 Express application.


Notes
Brand colours: navy #172336, teal #a7cfce, page background #f2f4f8.


data/*.db and .env are git-ignored; the database is rebuilt and seeded automatically when missing.



---


# 9. `package.json`


Update only the `check` script.


Change:


```json
"check": "node --check server.js && node --check src/app.js && node --check src/db.js && node --check src/services/requests.js && node --check public/js/api.js && node --check public/js/app.js"


to:


"check": "node --check server.js && node --check src/app.js && node --check src/db.js && node --check src/middleware/auth.js && node --check src/middleware/errorHandler.js && node --check src/middleware/validate.js && node --check src/routes/auth.js && node --check src/routes/users.js && node --check src/routes/properties.js && node --check src/routes/requests.js && node --check src/routes/technicians.js && node --check src/routes/tenants.js && node --check src/routes/categories.js && node --check src/routes/notifications.js && node --check src/routes/reports.js && node --check public/js/api.js && node --check public/js/app.js"


Everything else in package.json can stay unchanged.


10. Add tests/properties.test.js


This file currently does not exist in the repository.


Create:


const request = require('supertest');
const app = require('../src/app');


const PASSWORD = 'PropCare123!';


async function login(email) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email,
      password: PASSWORD,
    });


  expect(res.status).toBe(200);


  return res.body.data.token;
}


describe('Property access', () => {
  it('lists only properties containing jobs assigned to the technician', async () => {
    const token = await login('johan.vdm@obsrealty.co.za');


    const res = await request(app)
      .get('/api/properties')
      .set('Authorization', `Bearer ${token}`);


    expect(res.status).toBe(200);


    const properties = res.body.data.properties;
    const ids = properties.map((property) => property.id);


    // Johan is U9 and technician T1.
    // Current seed assigns T1 jobs on P1 and P5.
    expect(new Set(ids)).toEqual(
      new Set(['P1', 'P5'])
    );
  });


  it('does not expose unrelated properties to the technician', async () => {
    const token = await login('johan.vdm@obsrealty.co.za');


    const res = await request(app)
      .get('/api/properties')
      .set('Authorization', `Bearer ${token}`);


    expect(res.status).toBe(200);


    const ids = res.body.data.properties.map(
      (property) => property.id
    );


    expect(ids).not.toContain('P3');
    expect(ids).not.toContain('P7');
    expect(ids).not.toContain('P8');
    expect(ids).not.toContain('P9');
  });
});


11. Add the existing-token deactivation test


In tests/rbac.test.js, add this test inside the deactivation tests:


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


12. Browser test


I don't recommend replacing your huge scripts/browser-test.js just for this.


At the top of the file, make sure you have:


const CHROME = process.env.PPC_CHROME || undefined;


Then change the Puppeteer launch section to:


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


This removes dependency on a hard-coded Windows user's Chrome/Puppeteer cache.


13. Reports


Your current src/routes/reports.js is already using scoped rows for byStatus.


Do not replace it again.


The important current implementation is:


const statusMap = new Map();


scopeRows.forEach((r) => {
  stats.total += 1;


  if (OPEN_STATUSES.includes(r.status)) {
    stats.open += 1;
  } else if (RESOLVED_STATUSES.includes(r.status)) {
    stats.resolved += 1;
  }


  statusMap.set(
    r.status,
    (statusMap.get(r.status) || 0) + 1
  );


stats.byStatus = Array.from(statusMap.entries())
  .map(([status, count]) => ({
    status,
    count,
  }))
  .sort((a, b) => b.count - a.count);


That fix is already in the repository.


14. Request service


The important tenant-property fix is also already present.


Keep:


const units = q.unitsForUser().all(tenant.id);


const selectedUnit = units.find(
  (u) => u.name === body.unit
);


if (!selectedUnit) {
  throw new AppError(
    'You can only submit a request for one of your assigned units.',
    400
  );
}


const propertyId = selectedUnit.property_id;


Do not restore the old:


units.length
  ? units[0].property_id
  : 'P1'


fallback.


15. Verification


After making the changes, from the repository root run:


npm ci


Then:


npm test


Then:


npm run check


Then:


git diff --check


Then:


node --check src/routes/properties.js
node --check src/middleware/auth.js
node --check src/middleware/validate.js
node --check tests/properties.test.js
node --check tests/rbac.test.js


Finally:


npm run test:browser
16. Review the actual changes


Use:


git diff -- src/routes/properties.js
git diff -- src/middleware/auth.js
git diff -- src/middleware/validate.js
git diff -- src/app.js
git diff -- render.yaml
git diff -- .env.example
git diff -- README.md
git diff -- package.json
git diff -- scripts/browser-test.js
git diff -- tests/properties.test.js
git diff -- tests/rbac.test.js


Then:


git status
17. Commit


If all tests pass:


git add src/routes/properties.js src/middleware/auth.js src/middleware/validate.js src/app.js render.yaml .env.example README.md package.json scripts/browser-test.js tests/properties.test.js tests/rbac.test.js


Then:


git commit -m "fix: harden authentication and project configuration"


Then:


git push origin main