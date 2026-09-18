## Hosting

The app is designed to run on **Render** with a persistent SQLite disk.

### Render configuration

- `render.yaml` — Render Blueprint for the web service.
- SQLite database is stored at /data/propcare.db.
- `DB_PATH=/data/propcare.db` keeps the database on the persistent disk.
- `JWT_SECRET` must be configured in the Render environment.
- Render uses /api/health as the service health check.

### GitHub Actions deployment

The deployment workflow is:


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