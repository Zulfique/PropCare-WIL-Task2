const express = require('express');
const { authenticate } = require('../middleware/auth');
const { q } = require('../db');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authenticate);

/** Role-scoped property ids the user is actually involved with via requests. */
function accessiblePropertyIds(user) {
  if (user.role === 'tenant') return q.propertiesForRequests().all(user.id).map((p) => p.id);
  if (user.role === 'technician') return q.propertiesForTechnician().all(user.id).map((p) => p.id);
  return [];
}

/** Open request count for a property, scoped to the user for managers. */
function openCountFor(prop, user) {
  const rows =
    user.role === 'manager'
      ? q.countOpenByPropertyForManager().all(user.id)
      : q.countOpenByProperty().all();
  return rows.find((p) => p.id === prop.id)?.n || 0;
}

// GET /api/properties - role-scoped list
router.get('/', (req, res) => {
  let rows;
  if (req.user.role === 'admin') {
    rows = q.propertiesAll().all();
  } else if (req.user.role === 'manager') {
    rows = q.propertiesForManager().all(req.user.id);
  } else if (req.user.role === 'tenant') {
    rows = q.propertiesForRequests().all(req.user.id);
  } else if (req.user.role === 'technician') {
    // Technician properties must come from requests assigned to
    // that technician, not from tenant ownership.
    rows = q.propertiesForTechnician().all(req.user.id);
  } else {
    rows = [];
  }
  const properties = rows.map((p) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    area: p.area,
    managerId: p.manager_id,
    managerName: p.manager_name,
  }));
  res.status(200).json({ status: 'success', data: { properties } });
});

// GET /api/properties/:id - role-scoped detail with open request count
router.get('/:id', (req, res, next) => {
  const prop = q.propertyById().get(req.params.id);
  if (!prop) {
    return next(new AppError('Property not found', 404));
  }
  if (req.user.role === 'admin') {
    // admin sees every property
  } else if (req.user.role === 'manager') {
    if (prop.manager_id !== req.user.id) {
      return next(new AppError('You do not have permission to view this property', 403));
    }
  } else {
    // tenants and technicians can view properties they have requests on
    if (accessiblePropertyIds(req.user).indexOf(prop.id) === -1) {
      return next(new AppError('You do not have permission to view this property', 403));
    }
  }
  res.status(200).json({
    status: 'success',
    data: {
      property: {
        id: prop.id,
        name: prop.name,
        address: prop.address,
        area: prop.area,
        managerId: prop.manager_id,
        managerName: prop.manager_name,
        openRequests: openCountFor(prop, req.user),
      },
    },
  });
});

module.exports = router;