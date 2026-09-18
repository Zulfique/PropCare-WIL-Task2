const express = require('express');
const { authenticate } = require('../middleware/auth');
const { q } = require('../db');
const { AppError } = require('../middleware/errorHandler');


const router = express.Router();


router.use(authenticate);


// GET /api/properties - role-scoped list
router.get('/', (req, res, next) => {
  try {
    let rows = [];


    if (req.user.role === 'admin') {
      rows = q.propertiesAll().all();
    } else if (req.user.role === 'manager') {
      rows = q.propertiesForManager().all(req.user.id);
    } else if (req.user.role === 'tenant') {
      rows = q.propertiesForRequests().all(req.user.id);
    } else if (req.user.role === 'technician') {
      // users.id is U9/U10/etc, while requests.tech_id is T1/T2/etc.
      // Resolve the technician record before querying assigned properties.
      const technician = q.technicianByUserId().get(req.user.id);


      rows = technician
        ? q.propertiesForTechnician().all(technician.id)
        : [];
    }


    const properties = rows.map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      area: p.area,
      managerId: p.manager_id,
      managerName: p.manager_name,
    }));


    res.status(200).json({
      status: 'success',
      data: { properties },
    });
  } catch (err) {
    next(err);
  }
});


// GET /api/properties/:id
router.get('/:id', (req, res, next) => {
  try {
    const prop = q.propertyById().get(req.params.id);


    if (!prop) {
      return next(new AppError('Property not found', 404));
    }


    // Managers may only view properties they manage.
    if (
      req.user.role === 'manager' &&
      prop.manager_id !== req.user.id
    ) {
      return next(
        new AppError(
          'You do not have permission to view this property',
          403
        )
      );
    }


    // Tenants and technicians only receive the scoped property list.
    // Do not allow arbitrary property-detail enumeration.
    if (
      req.user.role === 'tenant' ||
      req.user.role === 'technician'
    ) {
      return next(
        new AppError(
          'You do not have permission to view this property',
          403
        )
      );
    }


    const openCount =
      q.countByProperty()
        .all()
        .find((p) => p.id === prop.id)?.n || 0;


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
          openRequests: openCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;