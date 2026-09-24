const express = require('express');
const { authenticate } = require('../middleware/auth');
const { repositories } = require('../repositories');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authenticate);

<<<<<<< HEAD
/**
 * Role-scoped property list. Every role sees only what it is entitled to:
 *   admin      -> the whole portfolio
 *   manager    -> their own managed properties
 *   tenant     -> properties they have raised a request against
 *   technician -> properties their assigned jobs sit in
 */
router.get('/', (req, res, next) => {
  try {
    let rows = [];

    if (req.user.role === 'admin') {
      rows = repositories.properties.listAll();
    } else if (req.user.role === 'manager') {
      rows = repositories.properties.forManager(req.user.id);
    } else if (req.user.role === 'tenant') {
      rows = repositories.properties.forTenant(req.user.id);
    } else if (req.user.role === 'technician') {
      // users.id is U9/U10/... while requests.tech_id is T1/T2/...
      // Resolve the technician record before querying assigned properties.
      const technician = repositories.technicians.findByUserId(req.user.id);
      rows = technician ? repositories.properties.forTechnician(technician.id) : [];
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
  } catch (err) {
    next(err);
=======
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
>>>>>>> upstream/main
  }
});

// GET /api/properties/:id
router.get('/:id', (req, res, next) => {
<<<<<<< HEAD
  try {
    const prop = repositories.properties.findById(req.params.id);

    if (!prop) {
      return next(new AppError('Property not found', 404));
    }

    // Managers may only view properties they manage.
    if (req.user.role === 'manager' && prop.manager_id !== req.user.id) {
      return next(new AppError('You do not have permission to view this property', 403));
    }

    // Tenants and technicians only receive the scoped property list.
    // Do not allow arbitrary property-detail enumeration.
    if (req.user.role === 'tenant' || req.user.role === 'technician') {
      return next(new AppError('You do not have permission to view this property', 403));
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
          // Open requests only - resolved and cancelled work is not "open".
          openRequests: repositories.properties.openCountFor(prop.id),
          totalRequests: repositories.properties
            .requestCounts({})
            .find((p) => p.id === prop.id)?.n || 0,
        },
=======
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
>>>>>>> upstream/main
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
