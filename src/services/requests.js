const { db, q, OPEN_STATUSES } = require('../db');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

function listForUser(user) {
  if (user.role === 'admin') return q.requestAll().all();
  if (user.role === 'tenant') return q.requestByTenant().all(user.id);
  if (user.role === 'technician') {
    const tech = q.technicianByUserId().get(user.id);
    return tech ? q.requestByTechnician().all(tech.id) : [];
  }
  // manager - requests on managed properties
  return q.requestByManagerProps().all(user.id);
}

function rowToDetail(row) {
  if (!row) return null;
  return {
    id: row.id,
    propertyId: row.property_id,
    propertyName: row.property_name,
    unit: row.unit,
    tenantId: row.tenant_id,
    tenantName: row.tenant_name,
    category: row.category,
    categoryName: row.category_name,
    title: row.title,
    detail: row.detail,
    urgency: row.urgency,
    status: row.status,
    techId: row.tech_id,
    technicianId: row.tech_id,
    technicianName: row.technician_name,
    technicianSkill: row.technician_skill,
    created: row.created,
    updated: row.updated,
    photos: row.photos,
  };
}

function listToDetail(rows) {
  return rows.map((r) => ({
    id: r.id,
    propertyId: r.property_id,
    propertyName: r.property_name,
    unit: r.unit,
    category: r.category,
    categoryName: r.category_name,
    title: r.title,
    detail: r.detail,
    urgency: r.urgency,
    status: r.status,
    techId: r.tech_id,
    created: r.created,
    updated: r.updated,
    photos: r.photos,
  }));
}

/**
 * Object-level authorisation: does this user have access to this request?
 */
function canView(user, row) {
  const owner = q.userByIdFull().get(row.tenant_id);
  if (user.role === 'admin') return true;
  if (user.role === 'tenant') return row.tenant_id === user.id;
  if (user.role === 'technician') {
    const tech = q.technicianByUserId().get(user.id);
    return !!tech && row.tech_id === tech.id;
  }
  // manager - owns the property the request belongs to
  const prop = q.propertyById().get(row.property_id);
  return prop && prop.manager_id === user.id;
}

function getDetail(user, id) {
  const row = q.requestById().get(id);
  if (!row) {
    throw new AppError(`Request ${id} not found`, 404);
  }
  if (!canView(user, row)) {
    throw new AppError('You do not have permission to view this request.', 403);
  }
  const detail = rowToDetail(row);
  detail.comments = q.commentsForRequest().all(id).map((c) => ({
    by: c.name,
    role: c.role_label,
    when: c.created_at,
    text: c.text,
  }));
  detail.history = q.historyForRequest().all(id).map((h) => ({
    status: h.status,
    when: h.created_at,
  }));
  const rating = q.ratingForRequest().get(id);
  detail.rating = rating ? rating.stars : null;
  return detail;
}

/** Valid status transitions per role, keyed by current status. */
const TRANSITIONS = {
  tenant: {
    submitted: ['cancel'],
    'under-review': ['cancel'],
    completed: ['confirm', 'reopen', 'rate'],
    onHoldUnused: [],
  },
  manager: {
    submitted: ['assign', 'approve'],
    'under-review': ['assign', 'approve'],
    completed: ['approve'],
  },
  technician: {
    assigned: ['accept', 'reject'],
    'in-progress': ['hold', 'complete'],
    'on-hold': ['resume'],
    submitted: ['accept'],
  },
  admin: {
    submitted: ['cancel', 'approve'],
    'under-review': ['approve'],
  },
};

function allowedActions(user, row) {
  const perRole = TRANSITIONS[user.role] || {};
  return perRole[row.status] || [];
}

function canPerform(user, row, action) {
  if (action === 'assign') return user.role === 'manager' && ['submitted', 'under-review'].indexOf(row.status) !== -1;
  if (action === 'rate') return user.role === 'tenant' && row.status === 'completed';
  return allowedActions(user, row).indexOf(action) !== -1;
}

const ACTION_NOTE = {
  cancel: 'Request cancelled.',
  confirm: 'Work confirmed and request closed.',
  reopen: 'Request reopened - work not fully resolved.',
  approve: 'Approved and closed by property manager.',
  accept: 'Job accepted by technician.',
  reject: 'Job rejected by technician.',
  hold: 'Placed on hold (awaiting parts or access).',
  resume: 'Work resumed.',
  complete: 'Work marked complete - awaiting tenant confirmation.',
};

function applyStatusAction(user, id, action, text) {
  const row = q.requestById().get(id);
  if (!row) {
    throw new AppError(`Request ${id} not found`, 404);
  }
  if (!canView(user, row)) {
    throw new AppError('You do not have permission to update this request.', 403);
  }
  if (!canPerform(user, row, action)) {
    throw new AppError(`Action "${action}" is not allowed for ${user.role} on a ${row.status} request.`, 400);
  }

  let nextStatus = null;
  switch (action) {
    case 'cancel': nextStatus = 'cancelled'; break;
    case 'confirm': nextStatus = 'closed'; break;
    case 'approve': nextStatus = 'closed'; break;
    case 'accept': nextStatus = 'in-progress'; break;
    case 'reject': nextStatus = 'rejected'; break;
    case 'hold': nextStatus = 'on-hold'; break;
    case 'resume': nextStatus = 'in-progress'; break;
    case 'complete': nextStatus = 'completed'; break;
    case 'reopen': nextStatus = 'in-progress'; break;
    default: break;
  }

  const when = new Date().toISOString();
  const note = text || ACTION_NOTE[action] || 'Status updated.';
  q.updateRequestStatus().run(nextStatus, when, id);
  q.insertHistory().run(id, statusLabel(nextStatus), when);
  q.insertComment().run(id, user.id, user.name, roleLabel(user.role), note, when);

  // Notify the tenant (and manager for technician actions) about the change.
  notifyForRequest(row, user, action, id);

  logger.info('Request status action', { action, requestId: id, userId: user.id });
  return getDetail(user, id);
}

function notifyForRequest(row, actor, action, requestId) {
  const stamp = new Date().toISOString();
  const tenantName = row.tenant_name;
  if (action === 'confirm' || action === 'approve' || action === 'cancel') {
    q.insertNotification().run(row.tenant_id, '\u2705', `Request ${requestId} was ${action}ed by ${actor.name}.`, stamp);
  }
  if (action === 'accept' || action === 'complete') {
    const techName = row.technician_name || actor.name;
    const title = action === 'accept'
      ? `${techName} accepted job ${requestId}.`
      : `${techName} marked ${requestId} complete - awaiting confirmation.`;
    if (row.tenant_id) q.insertNotification().run(row.tenant_id, '\uD83D\uDD27', title, stamp);
  }
  // Notify the property manager for tenant + technician actions
  if (action === 'cancel' || action === 'confirm' || action === 'reopen' || action === 'complete') {
    const prop = q.propertyById().get(row.property_id);
    if (prop && prop.manager_id !== actor.id) {
      q.insertNotification().run(prop.manager_id, '\uD83D\uDD27',
        `${actor.name} ${action === 'complete' ? 'completed' : action + 'ed'} ${requestId}.`, stamp);
    }
  }
}

function assignRequest(manager, id, technicianId, urgency, note) {
  const row = q.requestById().get(id);
  if (!row) {
    throw new AppError(`Request ${id} not found`, 404);
  }
  if (!canView(manager, row)) {
    throw new AppError('You do not have permission to assign this request.', 403);
  }
  if (manager.role !== 'manager') {
    throw new AppError('Only a property manager can assign a technician.', 403);
  }
  if (['submitted', 'under-review'].indexOf(row.status) === -1) {
    throw new AppError('Only submitted or under-review requests can be assigned.', 400);
  }
  const tech = q.technicianById().get(technicianId);
  if (!tech) {
    throw new AppError('Technician not found.', 404);
  }

  const when = new Date().toISOString();
  q.updateRequestAssign().run(technicianId, urgency, 'assigned', when, id);
  q.insertHistory().run(id, statusLabel('assigned'), when);
  const noteText = note || `Assigned to ${tech.name}.`;
  q.insertComment().run(id, manager.id, manager.name, roleLabel('manager'), noteText, when);

  q.insertNotification().run(tech.user_id, '\uD83D\uDD27', `You have been assigned ${id} - ${row.title}.`, when);
  q.insertNotification().run(row.tenant_id, '\uD83D\uDD27',
    `${manager.name} assigned a technician to ${id}.`, when);

  logger.info('Request assigned', { requestId: id, technicianId, managerId: manager.id });
  return getDetail(manager, id);
}

function rateRequest(tenant, id, stars) {
  const row = q.requestById().get(id);
  if (!row) {
    throw new AppError(`Request ${id} not found`, 404);
  }
  if (row.tenant_id !== tenant.id) {
    throw new AppError('Only the requesting tenant can rate this request.', 403);
  }
  if (row.status !== 'completed') {
    throw new AppError('Only completed requests can be rated.', 400);
  }
  const existing = q.ratingForRequest().get(id);
  if (existing) {
    throw new AppError('This request has already been rated.', 400);
  }
  const when = new Date().toISOString();
  q.insertRating().run(id, tenant.id, stars, when);
  q.insertComment().run(id, tenant.id, tenant.name, roleLabel('tenant'),
    `Tenant rated the completed work ${stars} out of 5.`, when);
  const prop = q.propertyById().get(row.property_id);
  if (prop) {
    q.insertNotification().run(prop.manager_id, '\u2B50',
      `${tenant.name} rated ${id} ${stars}/5.`, when);
  }
  return getDetail(tenant, id);
}

function commentOnRequest(user, id, text) {
  const row = q.requestById().get(id);
  if (!row) {
    throw new AppError(`Request ${id} not found`, 404);
  }
  if (!canView(user, row)) {
    throw new AppError('You do not have permission to comment on this request.', 403);
  }
  const when = new Date().toISOString();
  q.insertComment().run(id, user.id, user.name, roleLabel(user.role), text, when);
  return getDetail(user, id);
}

function addPhoto(user, id) {
  const row = q.requestById().get(id);
  if (!row) {
    throw new AppError(`Request ${id} not found`, 404);
  }
  if (!canView(user, row)) {
    throw new AppError('You do not have permission to update this request.', 403);
  }
  q.incrementPhotos().run(new Date().toISOString(), id);
  return getDetail(user, id);
}

function createRequest(tenant, body) {
  const row = q.nextReqNumber().get();
  const nextNum = (row.n || 1079) + 1;
  const id = `REQ-${nextNum}`;
  const now = new Date().toISOString();

  const units = q.unitsForUser().all(tenant.id);
  // Derive property_id from the unit the tenant submitted, rather than always
  // defaulting to the first unit in the tenant's unit list.
  const selectedUnit = units.find((u) => u.name === body.unit);
  if (!selectedUnit) {
    throw new AppError('You can only submit a request for one of your assigned units.', 400);
  }
  const propertyId = selectedUnit.property_id;

  q.insertRequest().run(
    id,
    propertyId,
    body.unit,
    tenant.id,
    body.category,
    body.title,
    body.detail || 'No further details provided.',
    body.urgency,
    now,
    now,
    Math.min(Math.max(parseInt(body.photos, 10) || 0, 0), 20)
  );
  q.insertHistory().run(id, statusLabel('submitted'), now);

  // Notify the property manager of a new request.
  const prop = q.propertyById().get(propertyId);
  if (prop) {
    q.insertNotification().run(prop.manager_id, '\uD83D\uDD27',
      `New request ${id} submitted by ${tenant.name}.`, now);
  }

  logger.info('New request created', { requestId: id, tenantId: tenant.id, category: body.category });
  return getDetail(tenant, id);
}

function roleLabel(role) {
  return { tenant: 'Tenant', manager: 'Property Manager', technician: 'Technician', admin: 'Administrator' }[role] || role;
}

function statusLabel(status) {
  return {
    submitted: 'Submitted',
    'under-review': 'Under review',
    assigned: 'Assigned',
    'in-progress': 'In progress',
    'on-hold': 'On hold',
    completed: 'Completed',
    closed: 'Closed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  }[status] || status;
}

module.exports = {
  listForUser,
  listToDetail,
  getDetail,
  canView,
  applyStatusAction,
  assignRequest,
  rateRequest,
  commentOnRequest,
  addPhoto,
  createRequest,
  roleLabel,
  statusLabel,
  OPEN_STATUSES,
};