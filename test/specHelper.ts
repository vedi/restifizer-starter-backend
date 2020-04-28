import _ from 'lodash';
import request, { RequestPromise } from 'request-promise';
import { CoreOptions } from 'request';
import io from 'socket.io-client';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiThings from 'chai-things';
import chaiSnapshot from 'mocha-chai-snapshot';
import { SocketIoRequest, SocketIoTransportData } from 'restifizer';
import { UserResource } from 'app/domains/user';
import testConfig from 'test/config';

const {
  config,
  modelProvider: {
    RefreshToken,
    User,
  },
} = require('app/app');

chai.use(chaiAsPromised);
chai.use(chaiThings);
chai.use(chaiSnapshot);

chai.should();
const { expect } = chai;

export enum FIXTURE_TYPES {
  USER = 'user.data',
}

export interface EmailData {
  to: string;
  html: string;
}

const clientAuth = {
  client_id: testConfig.client.id,
  client_secret: testConfig.client.secret,
};

function assertUserAuth(userData: Pick<UserResource, 'auth'>) {
  if (!userData.auth) {
    throw new Error('User should be authenticated');
  }
}

const specHelper = {

  FIXTURE_TYPES,

  get(uri: string, options?: Partial<CoreOptions>) {
    return this.request('GET', uri, undefined, options);
  },
  post(uri: string, body: any, options?: Partial<CoreOptions>) {
    return this.request('POST', uri, body, options);
  },
  patch(uri: string, body: any, options?: Partial<CoreOptions>) {
    return this.request('PATCH', uri, body, options);
  },
  put(uri: string, body: any, options?: Partial<CoreOptions>) {
    return this.request('PUT', uri, body, options);
  },
  delete(uri: string, body: any, options?: Partial<CoreOptions>) {
    return this.request('DELETE', uri, body, options);
  },
  request(method: string, uri: string, body: any, options?: Partial<CoreOptions>) {
    return request({
      method,
      uri,
      body,
      resolveWithFullResponse: true,
      simple: false,
      json: true,
      ...options,
    });
  },

  connectToSocket(
    options: SocketIOClient.ConnectOpts & { extraHeaders?: Record<string, any> } = {},
  ): Promise<SocketIOClient.Socket> {
    return new Promise((resolve) => {
      options.extraHeaders = options.extraHeaders || {};
      options.extraHeaders.referer = testConfig.baseUrl;
      const socket = io.connect(testConfig.baseUrl, options);
      socket.on('connect', () => {
        resolve(socket);
      });
    });
  },

  getFixture(fixtureType: FIXTURE_TYPES, seed?: number, data?: object) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const resolvedRequire = require(`./data/${fixtureType}`);
    const fixtureProvider = resolvedRequire?.default || resolvedRequire;
    let result;
    if (_.isArray(fixtureProvider)) {
      if (_.isUndefined(seed)) {
        seed = Math.floor(Math.random() * fixtureProvider.length);
      } else if (!_.isNumber(seed) || seed >= fixtureProvider.length) {
        throw new Error(`Wrong seed value: ${seed}`);
      }

      result = { ...fixtureProvider[seed] };
    } else if (_.isFunction(fixtureProvider)) {
      seed = seed || Math.floor(Math.random() * 1000000);
      result = fixtureProvider(seed);
    } else {
      throw new Error(`Unsupported fixture provider: ${fixtureType}`);
    }
    return Object.assign(result, data || {});
  },

  getClientAuth() {
    return { ...clientAuth };
  },

  getBasicAuth(client?: { clientId: string, clientSecret: string }) {
    const clientId = client ? client.clientId : clientAuth.client_id;
    const clientSecret = client ? client.clientSecret : clientAuth.client_secret;

    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  },

  getAdminUser() {
    return { ...config.defaultUser };
  },

  async fetchAndClearSentEmails(): Promise<EmailData[]> {
    const result = await this.get(`${testConfig.baseUrl}/testing/sent-emails`);
    return result.body;
  },

  async createUser(data: Partial<UserResource>, login = false): Promise<UserResource> {
    const result = await this.post(
      `${testConfig.baseUrl}/api/users`,
      { ...this.getClientAuth(), ...data },
    );
    data._id = result.body._id;
    if (login) {
      await this.signInUser(data);
    }
    return result.body;
  },

  async signInUser(data: Partial<UserResource>) {
    const result = await this.post(
      `${testConfig.baseUrl}/oauth`,
      {
        grant_type: 'password',
        ..._.pick(data, 'username', 'password'),
        ...this.getClientAuth(),
      },
    );
    data.auth = {
      access_token: result.body.access_token,
      refresh_token: result.body.refresh_token,
    };
    return result.body;
  },

  async signInSocial(
    sn: 'facebook' | 'google',
    data: any,
    userData: Partial<UserResource>,
  ) {
    const result = await this
      .post(`${testConfig.baseUrl}/api/users/snAuth/${sn}`,
        { ...data, ...this.getClientAuth() });
    userData.auth = {
      access_token: result.body.access_token,
      refresh_token: result.body.refresh_token,
    };
    return result.body;
  },

  linkSocial(
    sn: 'facebook' | 'google',
    data: any,
    userData: Partial<UserResource>,
  ) {
    return this.put(
      `${testConfig.baseUrl}/api/users/me/linked-accounts/${sn}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
  },

  async getUser(
    adminUserData: Partial<UserResource>,
    data?: Partial<UserResource>,
    userId?: string,
  ) {
    assertUserAuth(adminUserData);
    data = data || adminUserData;
    userId = userId || data._id;
    const result = await this.get(
      `${testConfig.baseUrl}/api/users/${userId}`,
      { headers: { Authorization: `Bearer ${adminUserData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async removeUser(data: Partial<UserResource>) {
    return data._id && User.deleteOne({ _id: data._id });
  },

  withAdminUser(adminUserData: Partial<UserResource> = config.defaultUser) {
    before(async function () {
      this.adminUser = _.cloneDeep(adminUserData);
      const { _id } = await User.findOne({ username: adminUserData.username }).lean();
      this.adminUser._id = _id;
      return specHelper.signInUser(this.adminUser);
    });
  },

  withUser(options: { data?: Partial<UserResource>, key?: string, login?: boolean }) {
    const { data, key = 'user', login = true } = options;
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
      await specHelper.createUser(this[key], login);
    });

    after(function () {
      return specHelper.removeUser(this[key]);
    });
  },

  withUserSocket(options: {
    data?: Partial<UserResource>,
    key?: string,
    shouldWithUser?: boolean,
    userKey?: string,
  }) {
    const { data, key = 'userSocket', userKey = 'user', shouldWithUser = true } = options;
    if (shouldWithUser) {
      specHelper.withUser({
        data,
        key: userKey,
        login: true,
      });
    }
    before('open socket for user', async function () {
      this[key] = await specHelper.connectToSocket({
        extraHeaders: {
          Authorization: `Bearer ${this[userKey].auth.access_token}`,
        },
      });
    });
  },

  checkResponse(
    sendResponse: () => RequestPromise<any>,
    status = 200,
    makeSnapShot?: { isForced?: true, mask?: any[] },
  ) {
    before('send request', async function () {
      this.response = await sendResponse.call(this);
    });
    it(`should return status ${status}`, function () {
      return expect(this.response.statusCode).to.be.equal(status);
    });
    if (makeSnapShot) {
      it('response should contain body', function () {
        // eslint-disable-next-line no-restricted-properties
        return makeSnapShot.isForced
          // eslint-disable-next-line no-restricted-properties
          ? expect(specHelper.maskPaths(
            this.response.body,
            makeSnapShot.mask || [],
          )).isForced.matchSnapshot(this)
          : expect(specHelper.maskPaths(
            this.response.body,
            makeSnapShot.mask || [],
          )).matchSnapshot(this);
      });
    }
  },

  checkSocketResponse(
    userSocketKey: string,
    createRequestFn: () => SocketIoRequest,
    status = 200,
    options: {
      beforeFn?: () => Promise<void>,
      makeSnapShot?: { isForced?: true, mask?: any[] },
    } = {},
  ) {
    if (options.beforeFn) {
      before(options.beforeFn);
    }
    before('send request', function (done) {
      this[userSocketKey].once('restifizer', (data: SocketIoTransportData) => {
        this.response = data.result;
        done();
      });
      this[userSocketKey].emit('restifizer', createRequestFn.call(this));
    });
    it(`should return status ${status}`, function () {
      return expect(this.response.statusCode).to.be.equal(status);
    });
    if (options.makeSnapShot) {
      const { makeSnapShot } = options;
      // eslint-disable-next-line mocha/no-identical-title
      it('response should contain body', function () {
        // eslint-disable-next-line no-restricted-properties
        return makeSnapShot.isForced
          // eslint-disable-next-line no-restricted-properties
          ? specHelper.maskPaths(
            this.response.body,
            makeSnapShot.mask || [],
          ).should.isForced.matchSnapshot(this)
          : specHelper.maskPaths(
            this.response.body,
            makeSnapShot.mask || [],
          ).should.matchSnapshot(this);
      });
    }
  },

  prepareDb: async () => {
    await Promise
      .all([
        User.deleteMany({ username: { $ne: config.defaultUser.username } }),
        RefreshToken.deleteMany({}),
      ]);
  },

  maskPaths(obj: Record<string, any> | Record<string, any>[], paths: any[]) {
    const MASK_VALUE = '---';
    const mask = (target: Record<string, any>, idx: number) => {
      const result = _.cloneDeep(target);
      paths.forEach((item) => {
        const isObject = !Array.isArray(item) && _.isObject(item);
        const path = isObject ? item.replace : item;
        if (_.get(target, path)) {
          let newFieldValue;
          let newValue = isObject ? item.newValue : undefined;
          if (_.isUndefined(newValue)) {
            newValue = path ? `${path}` : MASK_VALUE;
          }
          if ((!isObject || item.useIdx !== false) && idx !== -1) {
            newValue = `${newValue}[${idx}]`;
          }
          newValue = `$\{${newValue}}`;
          if (isObject) {
            const replacedValue = item.withPath ? _.get(target, item.withPath) : item.withValue;
            newFieldValue = !_.isUndefined(replacedValue)
              ? (_.get(target, path) || '')
                .replace(new RegExp(replacedValue, 'g'), newValue)
              : newValue;
          } else {
            newFieldValue = newValue;
          }
          _.set(result, path, newFieldValue);
        }
      });
      return result;
    };
    return Array.isArray(obj) ? obj.map(mask) : mask(obj, -1);
  },
};

module.exports = specHelper;

export default specHelper;
