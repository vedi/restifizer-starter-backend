const { version } = require('package.json');

const healthService = require('app/lib/services/health.service');

module.exports = async () => {
  healthService.updateData('version', true, version);
};
