import { NextFunction, Request, Response } from 'express-serve-static-core';
import { ExtendedExpressApplication } from '../domains/system';

export default (expressApp: ExtendedExpressApplication) => {
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    // Code was taken from here: https://github.com/jshttp/basic-auth/blob/master/index.js
    let auth: string | undefined = req.headers.authorization;
    if (!auth) {
      return next();
    }

    // malformed
    const parts = auth.split(' ');
    if (parts[0].toLowerCase() !== 'basic') {
      return next();
    }
    if (!parts[1]) {
      return next();
    }
    [, auth] = parts;

    // credentials
    auth = Buffer.from(auth, 'base64').toString();
    const matchResult = auth.match(/^([^:]*):(.*)$/);
    if (!matchResult) {
      return next();
    }

    if (!req.body) {
      req.body = {};
    }
    [, req.body.client_id, req.body.client_secret] = matchResult;

    return next();
  });
};
