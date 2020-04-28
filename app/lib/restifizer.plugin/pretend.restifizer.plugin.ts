import _ from 'lodash';
import app from 'app';
import createAppError from 'app/lib/createAppError';
import { Schema } from 'mongoose';
import { Controller } from 'restifizer';
import { UserDomain } from '../../domains/user';
import { Scope } from '../../domains/app';

const { consts: { RULES: { ALLOW_FOR_ADMINS_ONLY_RULE } } } = app;

export interface MongooseOptions {
  isAdminMethodName?: string;
}

export interface RestifizerOptions {
  path?: string;
  authenticate: (user: UserDomain, scope: Scope) => Promise<any>;
}

function mongooseFn(schema: Schema, options?: MongooseOptions) {
  const completeOptions: Required<MongooseOptions> = _.merge({
    isAdminMethodName: 'isAdmin',
  }, options || {});

  if (!schema.methods[completeOptions.isAdminMethodName]) {
    throw new Error(`You should define method "${completeOptions.isAdminMethodName}" to make it working`);
  }
}

function restifizer(restifizerController: Controller, options: RestifizerOptions) {
  options = _.merge({
    path: 'pretend',
  }, options || {});

  const { authenticate } = options;

  if (!authenticate || !_.isFunction(authenticate)) {
    throw new Error('You should provide function for authenticate');
  }

  restifizerController.actions[`${options.path}Post`] = restifizerController.normalizeAction({
    method: 'post',
    path: `:_id/${options.path}`,
    async handler(scope: Scope) {
      if (!scope.user || !scope.user.isAdmin()) {
        throw createAppError(ALLOW_FOR_ADMINS_ONLY_RULE);
      }

      const user = await this.locateModel(scope);
      return authenticate(user, scope);
    },
  }, `${options.path}Post`);
}

const plugin = {
  restifizer,
  mongoose: mongooseFn,
};

export default plugin;
