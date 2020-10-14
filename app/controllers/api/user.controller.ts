import HTTP_STATUSES from 'http-statuses';
import { ExpressTransport } from 'restifizer';
import app from 'app';
import BaseController from 'app/lib/base.restifizer.controller';
import authPlugin from 'app/lib/restifizer.plugin/auth.restifizer.plugin';
import pretendPlugin from 'app/lib/restifizer.plugin/pretend.restifizer.plugin';
import meReplacerPlugin from 'app/lib/restifizer.plugin/me-replacer.restifizer.plugin';
import { USER_DEFAULT_FIELDS, UserDocument, UserResource } from '../../domains/user';
import { Scope } from '../../domains/app';
import { ExtendedExpressApplication } from '../../domains/system';

const {
  config,
  modelProvider: { User },
} = app;

/**
 * @apiDefine UserRequest
 * @apiParam {String} username email, used for signing in
 * @apiParam {String} password
 * @apiParam {String} firstName
 * @apiParam {String} lastName
 * @apiParam {Number} [height]
 * @apiParam {Number} [age]
 * @apiParam {Number=1,2} [gender] MALE: 1, FEMALE: 2
 */
/**
 * @apiDefine UserResponse
 * @apiSuccess {String} username email, used for signing in
 * @apiSuccess {String} firstName
 * @apiSuccess {String} lastName
 * @apiSuccess {Number} [height]
 * @apiSuccess {Number} [age]
 * @apiSuccess {Number=1,2} [gender] MALE: 1, FEMALE: 2
 * @apiSuccess {String(ISODate)} createdAt
 * @apiSuccess {String(ISODate)} updatedAt
 */
/**
 * @apiGroup User
 * @apiName GetUsers
 * @api {get} /api/users Get User List
 * @apiDescription Returns array of users.
 * @apiPermission bearer, admin
 *
 * @apiUse BearerAuthHeader
 * @apiUse UserResponse
 */
/**
 * @apiGroup User
 * @apiName GetUser
 * @api {get} /api/users/:_id Get User
 * @apiDescription Returns user by id. Regular users can get only own profile.
 * @apiPermission bearer
 *
 * @apiParam {String} _id user id, you can use "me" shortcut.
 *
 * @apiUse BearerAuthHeader
 * @apiUse UserResponse
 */
/**
 * @apiGroup User
 * @apiName Create
 * @api {post} /api/users Create User
 * @apiDescription Creates a user.
 * @apiPermission client, bearer
 *
 * @apiUse ClientAuthParams
 * @apiUse BearerAuthHeader
 * @apiUse UserRequest
 * @apiUse UserResponse
 */
/**
 * @apiGroup User
 * @apiName UpdateUser
 * @api {patch} /api/users/:_id Update User
 * @apiDescription Updates user by id. Regular users can update only own profile.
 * @apiPermission bearer
 *
 * @apiParam {String} _id user id, you can use "me" shortcut.
 *
 * @apiUse BearerAuthHeader
 * @apiUse UserRequest
 * @apiUse UserResponse
 */
/**
 * @apiGroup User
 * @apiName RemoveUser
 * @api {delete} /api/users/:_id Remove User
 * @apiDescription Removes user by id. Regular users can remove only own profile.
 * @apiPermission bearer
 *
 * @apiParam {String} _id user id, you can use "me" shortcut.
 *
 * @apiUse BearerAuthHeader
 * @apiUse EmptySuccess
 */
class UserController extends BaseController<
UserDocument,
Record<string, any>,
UserResource
> {
  authDelegate: any;

  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: User,
        },
      },
      path: '/api/users',
      fields: [
        'provider',
        'username',
        'password',
        'firstName',
        'lastName',
        'height',
        'gender',
        'age',
        'createdAt',
        'updatedAt',
        'auth',
      ],
      defaultFields: USER_DEFAULT_FIELDS,
      readOnlyFields: [
        'createdAt',
        'updatedAt',
      ],
      orderBy: { createdAt: -1 },
      actions: {
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),

        insert: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER, BaseController.AUTH.CLIENT],
        }),

        update: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
      },

      plugins: [
        /**
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
         * @apiUse EmptySuccess
         */
        {
          plugin: authPlugin.restifizer,
          options: {
            authenticate: (
              doc: UserDocument,
              scope: Scope<UserDocument>,
            ) => this._authenticate(doc, scope),
            sns: {
              facebook: {
                fieldsToFetch: 'first_name,last_name',
              },
              number: {
                fieldsToFetch: 'first_name,last_name',
              },
            },
          },
        },

        /**
         * @apiGroup User
         * @apiName Pretend
         * @api {post} /api/users/:_id/pretend Pretend
         * @apiDescription Allows to get auth tokens of other users. Allowable for admins only.
         * Draw your attention, additionally to bearer token, you should provide client auth data.
         * @apiPermission bearer
         *
         * @apiUse ClientAuthParams
         * @apiUse BearerAuthHeader
         * @apiParam {String(ID)} _id ID of target user
         * @apiUse AuthSuccess
         */
        {
          plugin: pretendPlugin.restifizer,
          options: {
            authenticate: (
              doc: UserDocument,
              scope: Scope<UserDocument>,
            ) => this._authenticate(doc, scope),
          },
        },
        {
          plugin: meReplacerPlugin.restifizer,
        },
      ],
    });

    super(options);

    this.authDelegate = (<ExtendedExpressApplication>(<ExpressTransport> this.transports[0]).app)
      .oAuthifizer.authDelegate;
    if (!this.authDelegate) {
      throw new Error('"authDelegate" must be provided');
    }
  }

  assignFilter(queryParams: Record<string, any>, fieldName: string, scope: Scope<UserDocument>) {
    return (!scope.isUpdate() || fieldName !== 'password')
      && super.assignFilter(queryParams, fieldName, scope);
  }

  async assignField(fieldName: string, scope: Scope<UserDocument>) {
    if (fieldName === 'password') {
      scope.model.hashedPassword = await User.hashPassword(scope.source.password);
      return undefined;
    } else {
      return super.assignField(fieldName, scope);
    }
  }

  async pre(scope: Scope<UserDocument>) {
    const { params, user } = scope;
    if (this.getClient(scope) || !user!.isAdmin()) {
      if (!scope.isInsert()) {
        if (!params._id || params._id !== user!.id) {
          throw HTTP_STATUSES.FORBIDDEN.createError();
        }
      }
      // do not allow list selecting
      if (scope.isSelect() && !scope.isSelectOne()) {
        throw HTTP_STATUSES.FORBIDDEN.createError();
      }
    }
  }

  async afterSave(scope: Scope<UserDocument>) {
    // user is signing up
    if (scope.isInsert()) {
      scope.context.auth = await this._authenticate(scope.model, scope);
    }
  }

  async post(user: UserResource, scope: Scope<UserDocument>) {
    // handling internal calls to `count`
    if (!user._id) {
      return user;
    }
    if (scope.isInsert() && scope.context.auth) {
      user.auth = scope.context.auth;
    }
    const { user: currentUser } = scope;
    // @ts-ignore
    if (!currentUser || !user._id.equals(currentUser.id)) {
      delete user.provider;
    }
    delete user.hashedPassword;
    return user;
  }

  async _authenticate(user: UserDocument, scope: Scope<UserDocument>) {
    scope.setUser(user);
    const { body, user: currentUser } = scope;

    let { client } = scope;
    if (!client && currentUser && currentUser.isAdmin()) {
      // for admins we're fetching client data from the request
      client = await this.authDelegate.findClient({
        clientId: body.client_id,
        clientSecret: body.client_secret,
      });
    }

    if (client) {
      const [accessToken, refreshToken] = await Promise
        .all([
          this.authDelegate.createAccessToken({ user, client }),
          this.authDelegate.createRefreshToken({ user, client }),
        ]);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: config.security.tokenLife,
        token_type: 'bearer',
      };
    } else {
      return undefined;
    }
  }
}

module.exports = UserController;
