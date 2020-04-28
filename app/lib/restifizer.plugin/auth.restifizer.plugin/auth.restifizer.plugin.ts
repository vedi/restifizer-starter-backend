import crypto from 'crypto';
import { URL } from 'url';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import { Schema, SchemaType, SchemaTypeOpts } from 'mongoose';
import HTTP_STATUSES from 'http-statuses';
import { Controller } from 'restifizer';
import validateSchema from 'app/lib/validate-schema';
import createAppError from 'app/lib/createAppError';
import fromCallback from 'app/lib/helpers/fromCallback';
import app from 'app';
import authConsts from './auth.consts';
import authSchema from './schemas/auth-plugin.schema';
import FacebookHelper from './sn-helpers/FacebookHelper';
import GoogleHelper from './sn-helpers/GoogleHelper';
import { UserDomain } from '../../../domains/user';
import { Scope } from '../../../domains/app';
import { EmailType } from '../../../domains/email';
import { SnHelper, SnOptions } from './interfaces';

export interface MongooseOptions {
  fields?: { [key: string]: SchemaTypeOpts<any> | Schema | SchemaType };
}

export interface RestifizerOptions {
  authenticate: (user: UserDomain, scope: Scope) => Promise<any>;
  profileFilter: (userData: Partial<UserDomain>) => Partial<UserDomain>;
  sns: { [key in SupportedSn]: SnOptions };
}

type SupportedSn = 'facebook' | 'google' | 'emulation';

const { INTERNAL_SERVER_ERROR } = HTTP_STATUSES;
const {
  AUTH_CHANGE_PASSWORD_SCHEMA,
  AUTH_FORGOT_PASSWORD_SCHEMA,
} = authSchema;
const {
  RULES: {
    ALREADY_LINKED_RULE,
    BAD_PASSWORD_RULE,
    INVALID_USERNAME_RULE,
    OTHER_ALREADY_LINKED_RULE,
    UNLINK_PRIMARY_ACCOUNT_RULE,
    UNSUPPORTED_SN_VALUE_RULE,
    WRONG_PASSWORD_RESET_TOKEN_RULE,
  },
} = authConsts;

const LOCAL_PROVIDER = 'local';

const SALT_ROUNDS = 10;

const requiredForLocalProvider = function requiredForLocalProvider(this: UserDomain) {
  return this.provider === LOCAL_PROVIDER;
};

/**
 * @apiIgnore
 * @apiGroup User
 * @apiName LogoutUser
 * @api {post} /api/users/logout Logout User
 * @apiDescription Logs out the current user.
 * @apiPermission bearer
 *
 * @apiUse BearerAuthHeader
 * @apiUse EmptySuccess
 */
/**
 * @apiIgnore
 * @apiGroup User
 * @apiName ChangeUserPassword
 * @api {post} /api/users/:_id/change-password Change User Password
 * @apiDescription Changes user password. Only owner or admin can change password.
 *
 * @apiParam {String} password the current password of the user
 * @apiParam {String} newPassword
 *
 * @apiPermission bearer
 *
 * @apiUse BearerAuthHeader
 * @apiUse EmptySuccess
 */

/**
 * @apiIgnore
 * @apiGroup User
 * @apiName ForgotUserPassword
 * @api {post} /api/users/forgot Send Restoration Code
 * @apiDescription Initiates password restoration, sending reset code to email.
 * @apiPermission client
 * @apiParam {String} username email of a user, who restores password
 *
 * @apiUse ClientAuthParams
 * @apiUse EmptySuccess
 */
/**
 * @apiIgnore
 * @apiGroup User
 * @apiName ResetUserPassword
 * @api {post} /api/users/reset/:token Reset User Password
 * @apiDescription Resets user password.
 * @apiPermission client
 *
 * @apiParam {String} token restoration token, received in email
 * @apiParam {String} newPassword new password
 *
 * @apiUse ClientAuthParams
 * @apiUse AuthSuccess
 */
function mongooseFn(schema: Schema, options: MongooseOptions) {
  const { fields = {} } = options;
  schema.add({
    username: {
      type: String,
      unique: 'User with this username already exists',
      sparse: true,
      required: [
        requiredForLocalProvider,
        'Path `{PATH}` is required.',
      ],
      trim: true,
      lowercase: true,
      ...fields.username,
    },
    hashedPassword: {
      type: String,
      default: '',
      ...fields.hashedPassword,
    },
    provider: {
      type: String,
      default: LOCAL_PROVIDER,
      required: true,
      ...fields.provider,
    },
    linkedAccounts: {
      ...fields.linkedAccounts,
    },
    resetPassword: {
      token: String,
      expires: Date,
      ...fields.resetPassword,
    },
  });
  schema.statics.logout = function logout(userId: string | Schema.Types.ObjectId) {
    return app.modelProvider.RefreshToken.deleteMany({ user: userId });
  };

  schema.methods.authenticate = async function authenticate(password: string) {
    return bcrypt.compare(password, this.hashedPassword);
  };
  schema.statics.hashPassword = async function hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  };
}

function restifizerFn(restifizerController: Controller, options: RestifizerOptions) {
  const { authenticate, profileFilter } = options;

  const {
    config,
    modelProvider: {
      User,
    },
  } = app;

  function normalize(sn: SupportedSn, query: Record<string, any>) {
    const prefix = `linkedAccounts.${sn}`;
    const result: Record<string, any> = {};
    _.forEach(query.linkedAccounts[sn], (value, key) => {
      result[`${prefix}.${key}`] = value;
    });
    return result;
  }

  const snHelpers: Partial<Record<SupportedSn, SnHelper>> = {};
  function getSnHelper(sn: SupportedSn) {
    if (!config.isTest) {
      return snHelpers[sn];
    } else {
      return snHelpers.emulation;
    }
  }
  const { sns } = options;
  if (config.isTest) {
    snHelpers.emulation = {
      async getProfile(authData) {
        if (!authData) {
          throw INTERNAL_SERVER_ERROR.createError('No emulation data provider');
        }
        return {
          id: authData.id,
          email: authData.email,
          name: authData.name,
          firstName: authData.firstName,
          lastName: authData.lastName,
        };
      },
      buildQuery(profile) {
        return { id: profile.id };
      },
      extract(profile) {
        return <UserDomain>{
          username: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
        };
      },
    };
  } else if (sns) {
    if (sns.facebook) {
      snHelpers.facebook = new FacebookHelper(sns.facebook);
    }
    if (sns.google) {
      snHelpers.google = new GoogleHelper(sns.google);
    }
  }
  restifizerController.actions.snAuth = restifizerController.normalizeAction({
    auth: ['oauth2-client-password'],
    method: 'post',
    path: 'snAuth/:sn',
    handler: async function snAuth(scope: Scope) {
      const { params: { sn }, body: { auth, device_type: deviceType } } = scope;
      const snHelper = getSnHelper(sn);
      if (!snHelper) {
        throw createAppError(UNSUPPORTED_SN_VALUE_RULE, sn);
      }
      const query: Record<string, any> = { linkedAccounts: {} };
      const profile = await snHelper.getProfile(auth);
      query.linkedAccounts[sn] = snHelper.buildQuery(profile);
      let doc = await User.findOne(normalize(sn, query));
      if (!doc) {
        query.provider = sn;
        let userData = snHelper.extract(profile);
        if (_.isFunction(profileFilter)) {
          userData = profileFilter.call(this, userData);
        }
        Object.assign(query, userData);
        query.deviceType = deviceType;
        doc = await User.create(query);
      } else {
        doc.set(`linkedAccounts.${sn}`, query.linkedAccounts[sn]);
        doc.set('deviceType', deviceType);
        await doc.save();
      }
      if (_.isFunction(authenticate)) {
        return authenticate.call(this, doc, scope);
      } else {
        return undefined;
      }
    },
  }, 'snAuth');
  restifizerController.actions.linkAccount = restifizerController.normalizeAction({
    method: 'put',
    path: ':_id/linked-accounts/:sn',
    handler: async function linkAccount(scope: Scope) {
      const { params, body: { auth } } = scope;
      const { sn } = params;
      delete params.sn;
      const query: Record<string, any> = { linkedAccounts: {} };
      const affectedDoc = await this.locateModel(scope);
      const snHelper = getSnHelper(sn);
      if (!snHelper) {
        throw createAppError(UNSUPPORTED_SN_VALUE_RULE, sn);
      }
      const profile = await snHelper.getProfile(auth);

      query.linkedAccounts[sn] = snHelper.buildQuery(profile);
      const doc = await User.findOne(normalize(sn, query));

      // check, if somebody else linked with this data
      if (doc) {
        if (doc.id === affectedDoc.id) {
          throw createAppError(ALREADY_LINKED_RULE);
        } else {
          throw createAppError(OTHER_ALREADY_LINKED_RULE);
        }
      }
      affectedDoc.set(`linkedAccounts.${sn}`, query.linkedAccounts[sn]);
      await affectedDoc.save();

      return undefined;
    },
  }, 'linkAccount');
  restifizerController.actions.unlinkAccount = restifizerController.normalizeAction({
    method: 'delete',
    path: ':_id/linked-accounts/:sn',
    handler: async function linkAccount(scope: Scope) {
      const { params } = scope;
      const { sn } = params;
      delete params.sn;
      const doc = await this.locateModel(scope);
      const snHelper = getSnHelper(sn);
      if (!snHelper) {
        throw createAppError(UNSUPPORTED_SN_VALUE_RULE, sn);
      }
      if (doc.provider === sn) {
        throw createAppError(UNLINK_PRIMARY_ACCOUNT_RULE);
      }
      doc.set(`linkedAccounts.${sn}`, undefined);
      await doc.save();

      return undefined;
    },
  }, 'unlinkAccount');
  restifizerController.actions.logout = restifizerController.normalizeAction({
    auth: ['bearer'],
    method: 'post',
    path: 'logout',
    handler: async function logout(scope: Scope) {
      const { user } = scope;
      if (!user) {
        throw INTERNAL_SERVER_ERROR.createError('No user in context');
      }
      await User.logout(user._id);
      return undefined;
    },
  }, 'logout');
  restifizerController.actions.changePassword = restifizerController.normalizeAction({
    auth: ['bearer'],
    method: 'post',
    path: ':_id/change-password',
    handler: async function changePassword(scope: Scope) {
      const { body, user: currentUser } = scope;
      if (!currentUser) {
        throw INTERNAL_SERVER_ERROR.createError('No user in context');
      }
      const { username } = currentUser;
      const validatedBody = await validateSchema(body, AUTH_CHANGE_PASSWORD_SCHEMA);
      const { password, newPassword } = validatedBody;
      const user = (await User.findOne({ username }))!;
      if (!await user.authenticate(password)) {
        throw createAppError(BAD_PASSWORD_RULE);
      }
      user.hashedPassword = await User.hashPassword(newPassword);
      await user.save();
      return undefined;
    },
  }, 'changePassword');
  restifizerController.actions.forgot = restifizerController.normalizeAction({
    auth: ['oauth2-client-password'],
    method: 'post',
    path: 'forgot',
    handler: async function forgot(scope: Scope) {
      const { origin } = new URL(scope.referrer || '');
      const baseUrl = `${origin}/${config.urls.resetPassword}`;
      const { body } = scope;
      const validatedBody = await validateSchema(body, AUTH_FORGOT_PASSWORD_SCHEMA);
      const user = await User.findOne({ username: validatedBody.username.toLowerCase() });
      if (!user) {
        throw createAppError(INVALID_USERNAME_RULE);
      }
      const buffer: Buffer = await fromCallback((callback) => {
        crypto.randomBytes(20, callback);
      });
      if (buffer) {
        user.resetPassword = {
          token: buffer.toString('hex'),
          expires: new Date(Date.now() + (1000 * config.security.forgotPasswordTokenLife)),
        };
        await user.save();
        await app.emailService.sendEmail(
          EmailType.ForgotPassword,
          {
            email: user.username,
            payload: {
              baseUrl,
              token: user.resetPassword.token,
              username: user.username,
            },
          },
        );
      }
      return undefined;
    },
  }, 'forgot');
  restifizerController.actions.reset = restifizerController.normalizeAction({
    auth: ['oauth2-client-password'],
    method: 'post',
    path: 'reset/:token',
    handler: async function reset(scope: Scope) {
      const { params: { token }, body: { newPassword } } = scope;
      if (!newPassword) {
        throw createAppError(WRONG_PASSWORD_RESET_TOKEN_RULE);
      }
      const user = await User.findOne({
        'resetPassword.token': token,
        'resetPassword.expires': {
          $gt: new Date(),
        },
      });
      if (!user) {
        throw createAppError(WRONG_PASSWORD_RESET_TOKEN_RULE);
      }
      user.hashedPassword = await User.hashPassword(newPassword);
      user.resetPassword = undefined;
      await user.save();
      await app.emailService.sendEmail(
        EmailType.ResetPassword,
        {
          email: user.username,
          payload: {
            username: user.username,
          },
        },
      );
      return authenticate(user, scope);
    },
  }, 'reset');
}

const plugin = {
  mongoose: mongooseFn,
  restifizer: restifizerFn,
};

export default plugin;
