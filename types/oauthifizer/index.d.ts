declare module 'oauthifizer' {
  import { Request } from 'express-serve-static-core';
  import { RequestHandler } from 'express';

  export interface Info {
    scope?: string;
  }

  export interface TokenInfo {
    expires_in: string;
  }

  export interface CreateAuthorizationCodeParams<U, C> {
    user: U;
    client: C;
    codeValue: string;
    redirectUri: string;
    scope: any;
  }

  export interface FindAuthorizationCodeParams<C> {
    client: C;
    codeValue: string;
    redirectUri: string;
  }

  export interface FindUserParams {
    login: string;
    password: string;
    req: Request;
  }

  export interface FindUserByTokenParams {
    req: Request;
    accessToken: string;
    refreshToken: string;
  }

  export interface FindUserByTokenResult<U> {
    obj: U | false
    info?: Info;
  }

  export interface FindClientParams {
    clientId: string;
    clientSecret: string | false;
  }

  export type FindClientResult<C> = C | false;

  export interface CleanUpTokensParams<U, C, A> {
    client: C;
    user?: U;
    authorizationCode?: A;
  }

  export interface CreateAccessTokenParams<U, C, A> {
    client: C;
    user?: U | null;
    authorizationCode?: A;
  }

  export interface CreateRefreshTokenParams<U, C, A> {
    client: C;
    user?: U | null;
    authorizationCode?: A;
  }

  export interface GetTokenInfoParams<U, A> {
    user?: U | null;
    authorizationCode?: A;
  }

  interface IAuthDelegate<U, C, A = any> {
    /**
     * Create authorization code
     * @return Promise<void>
     */
    createAuthorizationCode(params: CreateAuthorizationCodeParams<U, C>): Promise<void>;

    /**
     * Get authorization code object
     * @return Promise with authorization code object if found, null - if not found
     */
    findAuthorizationCode(params: FindAuthorizationCodeParams<C>): Promise<A | null>;

    /**
     * Get user object
     * @param params value object containing: login, password
     * @return Promise with user model if found, null - if not found
     */
    findUser(params: FindUserParams): Promise<U |null>;

    /**
     * Get user data by token
     * @param params value object containing: accessToken | refreshToken
     * @return Promise with object with user, and info; or null - if not found
     */
    findUserByToken(params: FindUserByTokenParams): Promise<FindUserByTokenResult<U>>;

    /**
     * Get client object
     * @param params value object containing: clientId, clientSecret,
     * if clientSecret is false we do not need to check it
     * @return Promise with client model if found, false - if not found
     */
    findClient(params: FindClientParams): Promise<FindClientResult<C>>;

    /**
     * Clean up tokens
     * @param params value object containing: user|authorizationCode, client
     * @return Promise with no params
     */
    cleanUpTokens(params: CleanUpTokensParams<U, C, A>): Promise<void>;

    /**
     * Create access token by user and client
     * @param params value object containing: user|authorizationCode, client, scope, tokenValue,
     * refreshTokenValue
     * @return Promise with token
     */
    createAccessToken(params: CreateAccessTokenParams<U, C, A>): Promise<string>

    /**
     * Create refresh token by user and client
     * @param params value object containing: user|authorizationCode, client, scope, tokenValue,
     * refreshTokenValue
     * @return Promise with token
     */
    createRefreshToken(params: CreateRefreshTokenParams<U, C, A>): Promise<string>;

    /**
     * Get additional token info.
     * @param params value object, containing: client, scope, tokenValue, refreshTokenValue,
     * user|authorizationCode
     * @return Promise with an arbitrary object
     */
    getTokenInfo(params: GetTokenInfoParams<U, A>): Promise<TokenInfo>;
  }

  export default class OAuthifizer<U, C, A> {
    constructor(authDelegate: IAuthDelegate<U, C, A>);

    exchange(): RequestHandler;

    getToken(): RequestHandler;

    getAuthorizationCode(): RequestHandler;

    authenticate(authTypes: string | string[], options: Record<string, any>): RequestHandler;
  }
}
