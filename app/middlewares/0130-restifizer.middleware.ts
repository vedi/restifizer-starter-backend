import _ from 'lodash';
import { NextFunction, Response } from 'express';
import Restifizer from 'restifizer';
import { App, AuthOptions, ExtendedActionOptions } from '../domains/app';
import { ExtendedExpressApplication, ExtendedExpressRequest } from '../domains/system';

const { ExpressTransport, SocketIoTransport } = Restifizer;

export default (
  expressApp: ExtendedExpressApplication,
  app: App,
) => {
  const {
    consts: { AUTH },
    restControllers: Controllers,
  } = app;
  const log = app.createLog(module);
  const expressTransport = new ExpressTransport({ app: expressApp });

  function prepareAuth(options: { auth?: AuthOptions | AuthOptions[] }) {
    if (options.auth) {
      // make options.auth to be an array
      if (!Array.isArray(options.auth)) {
        options.auth = [options.auth];
      } else {
        options.auth = _.uniq(options.auth);
      }

      const auth = <AuthOptions[]>options.auth;

      // always add basic auth to client auth
      if (auth.includes(AUTH.CLIENT) && !auth.includes(AUTH.BASIC)) {
        auth.push(AUTH.BASIC);
      }
    }
  }

  // @ts-ignore
  expressTransport.getAuth = function getAuth(options: ExtendedActionOptions) {
    prepareAuth(options);
    const auths = [
      // TODO: Improve typing for oAuthifizer
      expressApp.oAuthifizer.authenticate(options.auth as AuthOptions),
      (req: ExtendedExpressRequest, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
          // options
          return res.status(401).send({
            message: 'User is not logged in',
          });
        }

        return next();
      },
    ];
    return options.auth
      ? auths
      : (req: Express.Request, res: Express.Response, callback: () => void) => {
        callback();
      };
  };

  const socketIoTransport = new SocketIoTransport({
    sio: app.sio,
  });

  const restifizer = new Restifizer({
    transports: [expressTransport, socketIoTransport],
    // @ts-ignore
    log,
  });

  Controllers.forEach((ControllerClass) => {
    restifizer.addController(ControllerClass);
  });

  app.registerProvider('restifizer', restifizer);
};
