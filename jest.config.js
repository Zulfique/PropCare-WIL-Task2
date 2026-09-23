const path = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: [path.resolve(__dirname, 'tests/setup-env.js')],
};