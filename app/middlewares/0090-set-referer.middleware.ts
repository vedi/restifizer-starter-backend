import { NextFunction, Request, Response } from 'express-serve-static-core';
import { ExtendedExpressApplication } from '../domains/system';
import { App } from '../domains/app';

export default (
  expressApp: ExtendedExpressApplication,
  { config: { urls: { defaultClientOrigin } } }: App,
) => {
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.referer) {
      req.headers.referer = `${req.protocol}://${defaultClientOrigin}`;
    }
    next();
  });
};
