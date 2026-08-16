# PropCare — Smart Property Maintenance Management

Interactive HTML/CSS/JS prototype for **Obs Realty Group (OBS REALTY)**: a property maintenance management system for a residential portfolio across the Western Cape.

## Purpose

PropCare connects residents, property managers and technicians in one auditable maintenance workflow:

- Residents report issues in under a minute — with category, urgency and photos.
- Managers review, prioritise and assign the right technician.
- Technicians accept jobs, update progress and close work out with notes and photos.
- Every request keeps a full status history and conversation trail.

## Demo accounts

Open the **[live prototype](https://zulfique.github.io/PropCare-WIL-Task1/prototype/)**, pick a demo account from the dropdown, and sign in (any password works — demo only).

| Role | Person | Email |
|------|--------|-------|
| Tenant | Sarah Williams | sarah.williams@example.com |
| Property Manager | Michael Jacobs | michael.jacobs@horizon.co.za |
| Technician | Daniel Adams | daniel.adams@horizon.co.za |
| Administrator | Lauren Daniels | lauren.daniels@horizon.co.za |

*All demo passwords are accepted during prototype testing.*

## Screens

- **Login** — Split-screen design with brand benefits on left, login form on right
- **Dashboard/Overview** — Tenant overview with stats, recent requests, workload pulse
- **My requests** — Searchable requests list with status filters
- **Profile** — User profile settings
- **Notifications** — Activity center with all notifications
- **Property management** — Property and portfolio views
- Additional screens for detailed workflows (request detail, report-an-issue wizard, etc.)

## Structure

```
prototype/
  ├── login.html              # Entry point: login screen with demo account selector
  ├── index.html              # Dashboard/overview for logged-in users
  ├── 
  ├── css/
  │   └── style.css           # All styling: colors, layout, components, responsive design
  │
  ├── js/
  │   └── app.js              # Main application logic, shell mounting, navigation
  │
  ├── data/
  │   └── seed-data.js        # Consolidated demo data for all views (users, properties, requests, etc.)
  │
  └── assets/
      └── favicon.svg         # App favicon
```

## Design System

**Colors:**
- Navy: `#101d31` (primary dark background)
- Teal: `#2fc4ac` (accent color)
- Background: `#f4f6f8` (page background)
- Text: `#16202c` (primary text)

**Typography:**
- Font family: Inter, system fonts
- Responsive sizing across all breakpoints

**Components:**
- Login screen with split layout
- Cards with consistent shadows
- Data tables with filtering
- Badges for status and priority
- Responsive navigation sidebar
- Top bar with user menu

## Run locally

```bash
cd prototype
python -m http.server 8124
# open http://localhost:8124/login.html
```

Or open `prototype/login.html` directly in any modern browser.

## View Live

**[ Click here to view the live prototype on GitHub Pages ✨](https://zulfique.github.io/PropCare-WIL-Task1/prototype/index.html)**

## Getting Started

1. Open `login.html` to see the login screen
2. Select a demo account from the dropdown (e.g., "Sarah Williams — Tenant")
3. Use any password (demo only, no validation)
4. Click "Sign in to PropCare" to access the dashboard

## Features

- **Responsive Design** — Works on desktop, tablet, and mobile
- **Demo Data** — All data is in-browser, changes reset on page refresh
- **No External APIs** — Fully self-contained prototype
- **Accessible** — Semantic HTML, keyboard navigation, color contrast
- **Modern CSS** — CSS custom properties, Grid, Flexbox, Gradients
- **Vanilla JavaScript** — No frameworks, lightweight and fast

## Development

### Architecture

The prototype follows a single-page app pattern with consolidated data management:

- **`login.html`** — Entry point with authentication UI
- **`index.html`** — Dashboard/main app shell (mounts via `js/app.js`)
- **`js/app.js`** — Core application logic:
  - Loads seed data from `window.PROPCARE_SEED`
  - Manages navigation and view mounting
  - Handles user state and session logic
- **`data/seed-data.js`** — Consolidated demo data source:
  - 15 tenant users
  - 8 technician users
  - 5 staff users (managers & admins)
  - 10 properties with unit configurations
  - 39 auto-generated maintenance requests
  - Status, category, and role label definitions
  - Pre-initialized notifications
- **`css/style.css`** — Unified design system with CSS custom properties

### Data Model

All demo data is exposed via `window.PROPCARE_SEED`:

```javascript
{
  categories: ["Plumbing", "Electrical", ...],
  statusLabels: { submitted, assigned, accepted, ... },
  roleLabels: { tenant, manager, technician, admin },
  defaultState: {
    users,        // All user accounts
    properties,   // Property portfolio
    requests,     // Maintenance requests
    notifications // Activity feed
  }
}
```

### Styling Approach

- **`css/style.css`** — Single unified stylesheet using:
  - CSS custom properties (variables) for colors, spacing, and sizing
  - Mobile-first responsive design
  - CSS Grid and Flexbox for layouts
  - Semantic class names for maintainability
  - Brand colors: Navy (`#101d31`), Teal (`#2fc4ac`), Light background (`#f4f6f8`)

### Adding Features

To extend the prototype:

1. Add demo data to `data/seed-data.js` → `window.PROPCARE_SEED.defaultState`
2. Update style definitions in `css/style.css`
3. Extend `js/app.js` to handle new views or interactions
4. Create new pages by following the existing `login.html` / `index.html` structure

## Seed Data Overview

The `data/seed-data.js` file defines the complete demo environment:

### Users (23 total)
- **15 Tenants**: Sarah Williams (u1), Liam Naidoo (u2), etc.
- **8 Technicians**: Daniel Adams (t1), Priya Naidoo (t2), etc.
- **5 Staff**: Michael Jacobs (m1, manager), Ayesha Patel (m2, manager), Lauren Daniels (a1, admin), Chris van der Merwe (a2, admin), Nandi Maseko (s1, admin)

### Properties (10 total)
Managed by Michael Jacobs and Ayesha Patel across the Western Cape:
- Oak Avenue Residences (4 units)
- The Rondebosch Collection (6 units)
- Kenilworth Mews (3 units)
- Observatory Lofts (3 units)
- Bellville Grove (2 units)
- Century City Quays (2 units)
- Durbanville House (2 units)
- Milnerton Sands (1 unit)
- Newlands Park (1 unit)
- Mowbray Terraces (1 unit)

### Requests (40 total)
- **1 Primary request** - Kitchen sink leaking (REQ-1045, high priority, submitted)
- **39 Generated requests** - Auto-populated with varied statuses:
  - Categories: Plumbing, Electrical, Heating & cooling, Security, Appliances, Building & access
  - Statuses: Submitted, Assigned, Accepted, In progress, Completed, Closed
  - Priorities: Low, Medium, High
  - Dates: June 2024 dataset
  - Ratings for completed requests

## CI / Deploy

`.github/workflows/build.yml` validates the HTML and JavaScript on every push/PR and deploys the prototype to GitHub Pages on `main`.

## Live Prototype (GitHub Pages)

View the live prototype here:

### https://zulfique.github.io/PropCare-WIL-Task1/prototype/index.html

The prototype is automatically deployed to GitHub Pages whenever changes are pushed to the `main` branch. The `prototype` folder is served as the root of the Pages site.

## Notes

- **Prototype only** — no external services, all data is in-browser demo data
- **Demo credentials** — email and password are pre-filled but not validated
- **Brand colors**:
  - Navy: `#101d31`
  - Teal: `#2fc4ac`
  - Soft Navy: `#16233a`
  - Background: `#f4f6f8`
- **Font** — Inter (system fonts fallback)
- **Browser support** — Modern browsers (Chrome, Firefox, Safari, Edge)

## License

Internal prototype for Obs Realty Group.
