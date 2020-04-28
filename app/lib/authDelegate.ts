import crypto from 'crypto';
import HTTP_STATUSES from 'http-statuses';
import {
  CleanUpTokensParams,
  CreateAccessTokenParams,
  CreateRefreshTokenParams,
  FindClientParams,
  FindClientResult,
  FindUserByTokenParams,
  FindUserByTokenResult,
  FindUserParams,
  GetTokenInfoParams,
  IAuthDelegate,
} from 'oauthifizer';
import jwt, { VerifyCallback } from 'jsonwebtoken';
import app from 'app';
import { UserDocument } from '../domains/user';
import { AccessTokenPayload, ClientDocument, RefreshTokenDocument } from '../domains/auth';
import fromCallback from './helpers/fromCallback';

const { config, modelProvider: { User, Client, RefreshToken } } = app;

class AuthDelegate implements IAuthDelegate<UserDocument, ClientDocument> {
  tokenLife: number;

  constructor() {
    this.tokenLife = config.security.tokenLife;
  }

  async createAuthorizationCode() {
    throw HTTP_STATUSES.NOT_ACCEPTABLE.createError();
  }

  async findAuthorizationCode() {
    throw HTTP_STATUSES.NOT_ACCEPTABLE.createError();
  }

  async findUser({ login, password }: FindUserParams) {
    if (login && password) {
      const user = await User.findOne({
        username: login.toLowerCase(),
        suspendedAt: { $exists: false },
      });
      if (!user || !await user.authenticate(password)) {
        return null;
      }
      return user;
    } else {
      throw new Error('Wrong context!');
    }
  }

  async findUserByToken(
    { accessToken, refreshToken }: FindUserByTokenParams,
  ): Promise<FindUserByTokenResult<UserDocument>> {
    let token: AccessTokenPayload | RefreshTokenDocument | null = null;
    if (accessToken) {
      const accessTokenPayload: AccessTokenPayload = <AccessTokenPayload>(await fromCallback(
        (callback: VerifyCallback) => {
          jwt.verify(accessToken, config.security.tokenSecret, callback);
        },
      ));
      if (!accessTokenPayload) {
        throw new Error('Token expired');
      }
      token = accessTokenPayload;
    } else if (refreshToken) {
      token = await RefreshToken.findOne({ token: refreshToken });
    } else {
      throw new Error('Wrong context!');
    }

    if (token) {
      const user = await User.findOne({ _id: token.user, suspendedAt: { $exists: false } });
      if (!user) {
        throw new Error('Unknown user');
      }
      const info = { scope: token.scopes };
      return { obj: user, info };
    } else {
      return { obj: false };
    }
  }

  async findClient(
    { clientId, clientSecret }: FindClientParams,
  ): Promise<FindClientResult<ClientDocument>> {
    const client = await Client.findOne({ clientId });
    if (client && (clientSecret === false
      || client.clientSecret === clientSecret)) {
      return client;
    } else {
      return false;
    }
  }

  async cleanUpTokens({
    client,
    user,
    authorizationCode,
  }: CleanUpTokensParams<UserDocument, ClientDocument, any>): Promise<void> {
    const { _id: clientId } = client;
    if (!clientId) {
      throw new Error('Client ID unspecified');
    }
    const userId = user ? user._id : authorizationCode.userId;
    const query = { user: userId, client: clientId };
    await Promise.all([
      RefreshToken.deleteMany(query),
    ]);
  }

  async createAccessToken(params: CreateAccessTokenParams<UserDocument, ClientDocument, any>) {
    const {
      authorizationCode,
      client,
    } = params;

    let { user } = params;

    if (!user) {
      user = await User
        .findOne({ _id: authorizationCode.userId, suspendedAt: { $exists: false } });
    }
    if (!user) {
      throw new Error('Unknown user');
    }
    params.user = user;

    const payload: AccessTokenPayload = {
      user: user._id,
      client: client.id,
    };
    const result: string = await fromCallback((callback) => (
      jwt.sign(
        payload,
        config.security.tokenSecret,
        { expiresIn: config.security.tokenLife },
        callback,
      )
    ));
    return result;
  }

  async createRefreshToken(params: CreateRefreshTokenParams<UserDocument, ClientDocument, any>) {
    const { authorizationCode, client } = params;
    let { user } = params;
    if (!user) {
      user = await User.findOne({ _id: authorizationCode.userId, suspendedAt: { $exists: false } });
    }
    if (!user) {
      throw new Error('Unknown user');
    }
    const refreshToken = {
      token: crypto.randomBytes(32).toString('base64'),
      client: client._id,
      user: user._id,
    };
    const result = await RefreshToken.create(refreshToken);
    return result.token;
  }

  async getTokenInfo(params: GetTokenInfoParams<UserDocument, any>) {
    const { authorizationCode } = params;
    let { user } = params;
    if (!user) {
      user = await User.findOne({ _id: authorizationCode.userId, suspendedAt: { $exists: false } });
    }
    if (!user) {
      throw new Error('Unknown user');
    }
    return { expires_in: `${this.tokenLife}` };
  }
}

export default AuthDelegate;
