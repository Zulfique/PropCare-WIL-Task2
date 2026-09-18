const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

const ISSUER = 'propcare';
const AUDIENCE = 'propcare-api';

const JWT_VERIFY_OPTIONS = {
  algorithms: ['HS256'],
  issuer: ISSUER,
  audience: AUDIENCE,
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, JWT_VERIFY_OPTIONS);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Invalid JWT token attempt', {
      ip: req.ip,
      url: req.originalUrl,
    });

    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please login again.', 401));
    }
    return next(new AppError('Invalid token. Access denied.', 401));
  }
};

/**
 * Restrict a route to one or more roles.
 * Usage: router.get('/users', authorize('admin'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || roles.indexOf(req.user.role) === -1) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = { authenticate, authorize, ISSUER, AUDIENCE };