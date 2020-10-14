import { ConnectionOptions, Document, Model, Mongoose } from 'mongoose';
import app from 'app';
import healthService from 'app/lib/services/health.service';

import { App } from '../app/domains/app';
import { Es6Module } from '../app/domains/system';

const { config } = app;
const log = app.createLog(module);

type ModelFactory<T extends Document = Document> = (mongoose: Mongoose) => Model<T>;
type ModelFactoryModule<T extends Document = Document> = ModelFactory<T>
| Es6Module<ModelFactory<T>>;

const healthOk = function healthOk(name: string) {
  healthService.updateData(name, true, 'OK');
};

const healthProblem = function healthProblem(name: string, message: string) {
  healthService.updateData(name, false, message);
};

const initMongoose = async (
  // eslint-disable-next-line @typescript-eslint/no-shadow
  app: App,
  mongoUrl: string,
  mongoConfig: Partial<ConnectionOptions>,
  models: string,
  providerName: string,
  connectionName: string,
) => {
  const mongoose = new Mongoose();

  const { connections: [connection] } = await mongoose.connect(
    mongoUrl,
    { ...mongoConfig, useCreateIndex: true, useNewUrlParser: true },
  );
  log.info('Connected to DB');

  const db = mongoose.connection;

  db.on('error', (err) => {
    log.error('DB error', err);
    healthProblem(connectionName, err.message);
  });
  db.on('disconnected', () => {
    log.error('DB disconnected');
    healthProblem(connectionName, 'disconnected');
  });
  db.on('reconnected', () => {
    log.info('DB reconnected');
    healthOk(connectionName);
  });

  healthOk(connectionName);

  const modelProvider = new Proxy({}, {
    get(target: Record<string, any>, memberName) {
      if (!(memberName in target)) {
        return mongoose.model(memberName as string);
      }
      return target[memberName as string];
    },
  });
  (app[models] as ModelFactoryModule[]).forEach((modelModule) => {
    const modelFactory = (modelModule as ModelFactory);
    const model = modelFactory(mongoose);
    log.debug('registered model', model.modelName);
  });
  app.registerProvider(providerName, () => modelProvider);
  app.registerProvider(connectionName, connection);
  return mongoose;
};

module.exports = {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  async init(app: App) {
    try {
      await initMongoose(
        app, config.mongo, config.mongoOptions, 'models', 'modelProvider', 'db',
      );
    } catch (err) {
      log.error('Cannot init mongoose', err);
      process.exit(1);
    }
  },
  initMongoose,
};
