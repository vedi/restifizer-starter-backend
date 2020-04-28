import http from 'http';
import Sio from 'socket.io';
import redis from 'socket.io-redis';
import { ExtendedExpressApplication } from '../domains/system';
import { App, SocketHandshake } from '../domains/app';

export default (expressApp: ExtendedExpressApplication, app: App) => {
  const log = app.createLog(module);
  const server = http.createServer(expressApp);
  const sio = Sio(server);
  const { config } = app;
  app.registerProvider('httpServer', server);
  app.registerProvider('sio', sio);

  sio.adapter(redis(config.redis.url));

  const { authDelegate } = expressApp.oAuthifizer;

  sio.use(async (socket, next) => {
    let clientData;
    let token;
    const auth = socket.request.headers.authorization || socket.request._query.authorization;
    if (auth) {
      const parts = auth.split(' ');
      let value = parts[1];
      if (value) {
        if (parts[0].toLowerCase() === 'basic') {
          // credentials
          value = Buffer.from(value, 'base64').toString();
          value = value.match(/^([^:]*):(.*)$/);
          if (value) {
            clientData = {
              clientId: value[1],
              clientSecret: value[2],
            };
          }
        } else if (parts[0].toLowerCase() === 'bearer') {
          token = value;
        }
      }
    }

    try {
      const handshake = (<SocketHandshake>socket.handshake);
      if (token) {
        const user = await authDelegate.findUserByToken({ accessToken: token });
        if (!(!user || !user.obj)) {
          handshake.user = user.obj;
          next();
        } else {
          next(new Error('Wrong credentials'));
        }
      } else if (clientData) {
        const client = await authDelegate.findClient(clientData);
        if (client) {
          handshake.client = client;
          next();
        } else {
          next(new Error('Wrong client data'));
        }
      } else {
        const err = new Error('No auth data available');
        log.error(err);
        next(err);
      }
    } catch (err) {
      next(err);
    }
  });

  sio.on('connection', (socket) => {
    log.info('connected');

    socket.on('error', (err) => {
      log.error('Error happened');
      log.error(err);
    });
  });
};
