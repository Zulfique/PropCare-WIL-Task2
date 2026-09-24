const express = require('express');
const { authenticate } = require('../middleware/auth');
const { repositories } = require('../repositories');
const { resolveActor } = require('../services/requests');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authenticate);

/**
 * Build the report summary for a caller.
 *
 * All aggregation is pushed into SQL (see RequestRepository.totals /
 * countByStatus / countByCategory) rather than loading every row into memory
 * and reducing it in JavaScript.
 */
function buildSummary(user) {
  const actor = resolveActor(user);
  const totals = repositories.requests.totals(actor);


  const byCategory = repositories.requests
    .countByCategory(actor)
    .map((c) => ({ name: c.name, count: c.n }))

const RESOLVED_STATUSES = [
  'closed',
  'completed',
];

const URGENCIES = ['low', 'normal', 'high', 'urgent'];

function buildSummary(scopeRows) {
  const stats = {
    total: 0,
    open: 0,
    resolved: 0,
    byCategory: [],
    byProperty: [],
    byStatus: [],
  };


  if (!scopeRows) return stats;


  const by = (keyFn, nameFn, rows) => {
    const source = rows || scopeRows;
    const map = new Map();


    source.forEach((r) => {
      const key = keyFn(r);


      if (!map.has(key)) {
        map.set(key, {
          name: nameFn(r),
          count: 0,
        });
      }


      map.get(key).count += 1;
    });


    return Array.from(map.values())
      .sort((a, b) => b.count - a.count);
  };


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
  });


  stats.byStatus = Array.from(statusMap.entries())
    .map(([status, count]) => ({
      status,
      count,
    }))

    .sort((a, b) => b.count - a.count);

  const byStatus = repositories.requests
    .countByStatus(actor)
    .map((s) => ({ status: s.status, count: s.n }))
    .sort((a, b) => b.count - a.count);


  const scope = actor.role === 'manager' ? { managerId: actor.id } : {};
  const byProperty = repositories.properties
    .requestCounts({ ...scope, openOnly: true })
    .filter((p) => p.n > 0)
    .map((p) => ({ id: p.id, name: p.name, count: p.n }))
    .sort((a, b) => b.count - a.count);

  return {
    total: totals.total,
    open: totals.open,
    resolved: totals.resolved,
    byCategory,
    byStatus,
    byProperty,
  };

  const urgencyMap = {};
  scopeRows.forEach((r) => {
    const u = r.urgency || 'normal';
    urgencyMap[u] = (urgencyMap[u] || 0) + 1;
  });
  stats.byUrgency = Object.entries(urgencyMap)
    .map(([urgency, count]) => ({ urgency, count }))
    .sort((a, b) => b.count - a.count);


  stats.byCategory = by(
    (r) => r.category,
    (r) => r.category_name
  );


  // 'Open issues by property' must reflect only requests that are still open
  // (submitted, under review, assigned, in progress, on hold), so the counts
  // are derived from the open subset of the scope rows.
  const openRows = scopeRows.filter((r) => OPEN_STATUSES.includes(r.status));
  stats.byProperty = by(
    (r) => r.property_id,
    (r) => r.property_name,
    openRows
  );


  return stats;

}

/**
 * GET /api/reports/summary
 * Manager: stats scoped to their portfolio. Admin: platform-wide stats.
 */
router.get('/summary', (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const summary = buildSummary(req.user);

      summary.users = {
        tenants: repositories.users.countByRole('tenant'),
        managers: repositories.users.countByRole('manager'),
        technicians: repositories.users.countByRole('technician'),
        admins: repositories.users.countByRole('admin'),
      };
      summary.properties = repositories.properties.countAll();
      summary.units = repositories.properties.countUnits();

      return res.status(200).json({ status: 'success', data: { summary } });
    }

    if (req.user.role === 'manager') {
      const summary = buildSummary(req.user);

      // `properties` is a scalar on the admin payload, so the per-property
      // breakdown for managers lives under its own, clearly named key.
      summary.portfolio = repositories.properties
        .requestCounts({ managerId: req.user.id, openOnly: true })
        .map((p) => ({ id: p.id, name: p.name, count: p.n }));

      return res.status(200).json({ status: 'success', data: { summary } });
    }

    return next(new AppError('Only managers and administrators can view reports.', 403));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
