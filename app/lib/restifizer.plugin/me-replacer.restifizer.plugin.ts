import { Controller } from 'restifizer';
import { Scope } from '../../domains/app';

export interface RestifizerOptions {
  field?: string;
  replacePattern?: string;
  replacer?: (scope: Scope) => string,
}

function restifizer(
  restifizerController: Controller,
  options: RestifizerOptions = {},
) {
  const {
    field = '_id',
    replacePattern = 'me',
    replacer = ({ user }: Scope) => user && user.id,
  } = options;
  const { actions } = restifizerController;
  Object.values(actions).forEach((action) => {
    const { handler: originalHandler = () => {} } = action;
    action.handler = function handler(scope: Scope) {
      const { params } = scope;
      if (params[field] === replacePattern) {
        const newValue = replacer(scope);
        if (!newValue) {
          throw new Error(`Cannot find matching for ${replacePattern}`);
        }
        params[field] = newValue;
      }
      return originalHandler.call(this, scope);
    };
  });
}

const plugin = {
  restifizer,
};

export default plugin;
