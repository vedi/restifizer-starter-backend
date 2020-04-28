export = {
  AUTH_CHANGE_PASSWORD_SCHEMA: {
    properties: {
      password: {
        type: 'string',
      },
      newPassword: {
        type: 'string',
      },
    },
    required: ['password', 'newPassword'],
    additionalProperties: true,
  },
  AUTH_FORGOT_PASSWORD_SCHEMA: {
    properties: {
      username: {
        type: 'string',
      },
    },
    required: ['username'],
    additionalProperties: true,
  },
};
