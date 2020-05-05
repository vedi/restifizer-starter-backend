const app = require('app/app');

const { config, createLog, modelProvider: { Client } } = app;
const log = createLog(module);

module.exports.up = async (next) => {
  try {
    log.info('Creating default client');
    const client = await Client.findOne({ clientId: config.defaultClient.clientId });
    if (!client) {
      await Client.create(config.defaultClient);
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports.down = (next) => {
  log.info('Removing default client');

  return Client.deleteOne({ clientId: config.defaultClient.clientId }, next);
};
