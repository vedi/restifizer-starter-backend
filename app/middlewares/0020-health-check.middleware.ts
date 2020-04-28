import { NextFunction, Request, Response } from 'express-serve-static-core';
import { ExtendedExpressApplication } from '../domains/system';

const healthService = require('app/lib/services/health.service');

export default (expressApp: ExtendedExpressApplication) => {
  expressApp.use(
    (req: Request, res: Response, next: NextFunction) => {
      const matchingPath = req.url.match(/^\/health$/);
      if (!matchingPath) {
        return next();
      }
      return res.status(healthService.isOk() ? 200 : 503).json(healthService.getData());
    },
  );
};
