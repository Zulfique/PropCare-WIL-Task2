const express = require('express');
const { authenticate } = require('../middleware/auth');
const { q } = require('../db');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authenticate);

function buildSummary(scopeRows) {
  const statuses = q.countByStatus().all();
  const stats = {
    total: 0,
    open: 0,
    resolved: 0,
    byCategory: [],
    byProperty: [],
    byStatus: statuses.map((s) => ({ status: s.status, count: s.n })),
  };

  if (!scopeRows) return stats;

  const by = (keyFn, nameFn) => {
    const map = new Map();
    scopeRows.forEach((r) => {
      const k = keyFn(r);
      if (!map.has(k)) map.set(k, { name: nameFn(r), count: 0 });
      map.get(k).count += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  };

  scopeRows.forEach((r) => {
    stats.total += 1;
    if (['submitted', 'under-review', 'assigned', 'in-progress', 'on-hold'].includes(r.status)) {
      stats.open += 1;
    } else if (['closed', 'completed'].includes(r.status)) {
      stats.resolved += 1;
    }
  });
  stats.byCategory = by((r) => r.category, (r) => r.category_name);
  stats.byProperty = by((r) => r.property_id, (r) => r.property_name);

  return stats;
}

// GET /api/reports/summary
// Manager: stats scoped to their portfolio. Admin: platform-wide stats.
router.get('/summary', (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const all = q.requestAll().all();
      const summary = buildSummary(all);
      summary.users = {
        tenants: q.tenantCount().get().n,
        managers: q.managerCount().get().n,
        technicians: q.technicianCount().get().n,
        admins: q.adminCount().get().n,
      };
      summary.properties = q.propertyCount().get().n;
      summary.units = q.unitCount().get().n;
      return res.status(200).json({ status: 'success', data: { summary } });
    }

    if (req.user.role === 'manager') {
      const rows = q.requestByManagerProps().all(req.user.id);
      const summary = buildSummary(rows);
      summary.properties = q.countByPropertyForManager().all(req.user.id)
        .map((p) => ({ id: p.id, name: p.name, count: p.n }));
      return res.status(200).json({ status: 'success', data: { summary } });
    }

    return next(new AppError('Only managers and administrators can view reports.', 403));
  } catch (err) {
    next(err);
  }
});

module.exports = router;