# PropCare — WIL Task 2

PropCare is a property maintenance management web application developed for the Work Integrated Learning (WIL) Task 2 project.

The application provides role-based workflows for tenants, property managers, technicians, and administrators to manage maintenance requests, properties, users, notifications, ratings, and reporting.

## Features

### Tenant

- Login and authentication
- View assigned units and properties
- Submit maintenance requests
- Select request category and urgency
- View request history and status
- Search and filter maintenance requests
- Add comments
- View notifications
- Confirm completed work
- Reopen completed work when necessary
- Rate completed maintenance requests
- Update personal profile

### Property Manager

- View managed properties
- View maintenance requests for managed properties
- Review and update maintenance requests
- Assign technicians
- Change request urgency
- Add comments and notes
- View tenant information
- View notifications
- View portfolio-level maintenance reports

### Technician

- View assigned properties
- View assigned maintenance jobs
- Accept or reject jobs
- Place jobs on hold
- Resume work
- Mark jobs as completed
- Add comments
- View notifications

### Administrator

- View platform-wide information
- Manage users
- Activate and deactivate user accounts
- View all properties and requests
- View platform-wide reports
- Access administrative functionality

## Technology Stack

### Backend

- Node.js
- Express.js
- SQLite
- `node:sqlite`
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator
- Helmet
- CORS
- Winston

### Frontend

- HTML
- CSS
- JavaScript
- Bootstrap

### Testing

- Jest
- Supertest
- Puppeteer

### Deployment

- Render
- GitHub Actions
- GitHub Pages for the static prototype

## Project Structure

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
├── scripts/
│   └── browser-test.js
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
│   │   └── tenants.js
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
├── render.yaml
├── server.js
└── README.md
