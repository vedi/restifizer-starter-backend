import _ from 'lodash';
import Restifizer, {
  ActionOptions,
  Controller,
  ControllerOptions,
  ExpressTransportData,
  SocketIoTransportData,
  Transport,
} from 'restifizer';
import app from 'app';
import { Schema } from 'mongoose';
import { ExtendedActionOptions, Scope, SocketHandshake } from '../domains/app';
import { ExtendedExpressRequest } from '../domains/system';
import { ClientDocument } from '../domains/auth';
import { UserDocument } from '../domains/user';

const { consts: { AUTH } } = app;

const defaultAction: ExtendedActionOptions = {
  enabled: true,
  auth: [AUTH.BEARER],
};

/**
 * @apiDefine bearer used, when user already authenticated
 */

/**
 * @apiDefine client used for not authenticated requests
 */

/**
 * @apiDefine BearerAuthHeader used, when user already authenticated
 * @apiHeader {String} Authorization access token value in format: "Bearer {{accessToken}}".
 */

/**
 * @apiDefine ClientAuthParams used for not authenticated requests
 * @apiParam {String} client_id
 * @apiParam {String} client_secret
 */

/**
 * @apiDefine EmptySuccess
 * @apiSuccess (204) {empty} empty
 */

/**
 * @apiDefine AuthSuccess
 * @apiSuccess {String} access_token
 * @apiSuccess {String} refresh_token
 * @apiSuccess {Number} expires_in
 * @apiSuccess {String=bearer} token_type
 */

/**
 * @apiGroup OAuth2
 * @apiName GetTokenWithPassword
 * @api {post} /oauth Sign in
 * @apiUse ClientAuthParams
 * @apiParam {String=password} grant_type
 * @apiParam {String} username
 * @apiParam {String} password
 * @apiUse AuthSuccess
 */

/**
 * @apiGroup OAuth2
 * @apiName GetTokenWithRefreshToken
 * @api {post} /oauth Refresh token
 * @apiUse ClientAuthParams
 * @apiParam {String=refresh_token} grant_type
 * @apiParam {String} refresh_token
 * @apiUse AuthSuccess
 */

class BaseController<M, D, R> extends Restifizer.Controller<M, D, R, Scope<M>> {
  static AUTH = AUTH;

  constructor(options: Partial<ControllerOptions>) {
    super(options || { actions: { default: defaultAction } });
  }

  static createAction(options: Partial<ActionOptions>): ActionOptions {
    return _.defaults(options, defaultAction);
  }

  static getName() {
    return this.name.charAt(0).toLowerCase() + this.name.replace('Controller', '').slice(1);
  }

  getClient(scope: Scope<M>) {
    return scope.getClient();
  }

  createScope(
    controller: Controller<M, D, R, Scope<M>>,
    transport: Transport<any>,
  ): Scope<M> {
    const result = super.createScope(controller, transport);

    result.isResourceOwner = function isResourceOwner(
      userId: Schema.Types.ObjectId | string,
      otherUserId: Schema.Types.ObjectId | string,
    ) {
      userId = userId.toString();
      otherUserId = otherUserId.toString();
      return userId === otherUserId;
    };

    if (transport.transportName === 'express') {
      const expressTransportData = <ExpressTransportData<ExtendedExpressRequest>>
        result.transportData;
      result.getUser = function getUser() {
        const { user } = expressTransportData.req;
        return user && !(user as ClientDocument).clientId ? <UserDocument>user : null;
      };
      result.setUser = function setUser() {
        // Do nothing, passport will inject user by access token in every request
      };
      result.getClient = function getClient() {
        const { user } = expressTransportData.req;
        return user && (user as ClientDocument).clientId ? <ClientDocument>user : null;
      };
      result.getLocale = function getLocale() {
        return expressTransportData.req.getLocale();
      };
      result.getReferrer = function getReferrer() {
        return expressTransportData.req.headers.referer || null;
      };
      result.getSocket = function getSocket() {
        return null;
      };
      result.getIpAddress = function getIpAddress() {
        const { req } = expressTransportData;
        const forwardedFor = req.headers['X-Forwarded-For'];
        if (forwardedFor) {
          const list = (<string>forwardedFor).split(',');
          return list[list.length - 1];
        } else {
          return req.connection.remoteAddress || null;
        }
      };
    } else if (transport.transportName === 'socket.io') {
      const socketIoTransportData = <SocketIoTransportData>result.transportData;
      result.user = null;
      result.getUser = function getUser() {
        return (<SocketHandshake>socketIoTransportData.socket.handshake).user;
      };
      result.getClient = function getClient() {
        return (<SocketHandshake>socketIoTransportData.socket.handshake).client;
      };
      result.setUser = function setUser(user) {
        // TODO: update it, when user is updated
        (<SocketHandshake>socketIoTransportData.socket.handshake).user = user;
        return user;
      };
      result.getReferrer = function getReferrer() {
        return socketIoTransportData.socket.request.headers.referer;
      };
      result.getLocale = function getLocale() {
        // TODO: implement
        return null;
      };
      result.getSocket = function getSocket() {
        return socketIoTransportData.socket;
      };
      result.getIpAddress = function getIpAddress() {
        return null;
      };
    } else {
      throw new Error(`Unsupported transport: ${transport.transportName}`);
    }

    Object.defineProperties(result, {
      user: {
        get() {
          return this.getUser();
        },
        set() {
          return this.setUser();
        },
      },
      client: {
        get() {
          return this.getClient();
        },
      },
      locale: {
        get() {
          return this.getLocale();
        },
      },
      referrer: {
        get() {
          return this.getReferrer();
        },
      },
      socket: {
        get() {
          return this.getSocket();
        },
      },
      ipAddress: {
        get() {
          return this.getIpAddress();
        },
      },
    });

    return result;
  }
}

export = module.exports = BaseController;
