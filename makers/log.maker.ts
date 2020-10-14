import path from 'path';
import { LoggerInstance } from 'moleculer';
import { App } from '../app/domains/app';

const createLogFactory = (app: App) => (module: NodeModule): LoggerInstance | Console => {
  let label;
  if (module) {
    const { filename } = module;
    label = filename
      ? filename.split(path.sep)
        .slice(-2)
        .join(path.sep)
      : `${module}`;
  } else {
    label = '';
  }

  try {
    return app.moleculerBroker.getLogger(label);
  } catch (err) {
    return console;
  }
};

export = (app: App) => {
  const logFactory = createLogFactory(app);
  app.registerProvider('createLog', () => logFactory);
};
