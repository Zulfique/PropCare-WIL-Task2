require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 8124;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  logger.error('JWT_SECRET must be set and at least 32 characters long. See .env.example.');
  process.exit(1);
}

const server = app.listen(PORT, () => {
  logger.info('PropCare server started', {
    url: `http://localhost:${PORT}`,
    env: process.env.NODE_ENV || 'development',
  });
});

// Graceful shutdown for hosting platforms.
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));