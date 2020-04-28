import app from 'app';
import { Callback } from '../app/domains/system';

const { config, createLog, modelProvider: { Client } } = app;
const log = createLog(module);

exports.up = async (next: Callback) => {
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

exports.down = (next: Callback) => {
  log.info('Removing default client');

  return Client.deleteOne({ clientId: config.defaultClient.clientId }, next);
};
