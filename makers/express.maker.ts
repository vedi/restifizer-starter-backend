import express from 'express';

import { App } from '../app/domains/app';
import { ExtendedExpressApplication } from '../app/domains/system';

export default (app: App) => {
  const expressApp: ExtendedExpressApplication = <ExtendedExpressApplication><any>express();
  expressApp.enable('trust proxy');
  app.middlewares.forEach((middleware) => middleware(expressApp, app));
  app.registerProvider('expressApp', expressApp);
};
