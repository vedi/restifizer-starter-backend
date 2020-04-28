import { App } from '../../../domains/app';

const { ServiceBroker } = require('moleculer');
const Validator = require('./validator');

module.exports = {
  async init(app: App) {
    const {
      logger: {
        level: logLevel,
      },
      moleculer: { namespace },
      redis,
    } = app.config;
    const broker = new ServiceBroker({
      logLevel,
      namespace,
      transporter: {
        type: 'Redis',
        options: redis.url,
      },
      validation: true,
      validator: new Validator(),
    });
    app.registerProvider('moleculerBroker', broker);
  },
};
