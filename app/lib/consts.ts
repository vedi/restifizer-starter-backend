const { FORBIDDEN } = require('http-statuses');

const consts = {
  AUTH: {
    BASIC: 'basic',
    BEARER: 'bearer',
    CLIENT: 'oauth2-client-password',
  },
  EVENTS: {
    UPDATE_HEALTH: 'UPDATE_HEALTH',
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    RESET_PASSWORD: 'RESET_PASSWORD',
  },
  RULES: {
    ALLOW_FOR_ADMINS_ONLY_RULE: {
      name: 'AllowForAdminsOnly',
      message: 'The action is allowable for admins only',
      httpStatus: FORBIDDEN,
    },
    INVALID_RECEIPT: {
      name: 'InvalidReceipt',
      message: 'Invalid receipt',
    },
    NOT_ENOUGH_PARAMS: {
      name: 'NotEnoughParams',
      message: 'Not enough params',
    },
  },
  DEFAULT_PAGE_SIZE: 20,
};

export type Consts = typeof consts;

export default consts;
module.exports = consts;
