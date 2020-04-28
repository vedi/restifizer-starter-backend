export = {
  RULES: {
    BAD_PASSWORD_RULE: {
      name: 'BadPassword',
      message: 'The password you provided does not work for this account',
    },
    ALREADY_LINKED_RULE: {
      name: 'AlreadyLinkedRule',
      message: 'User is already linked this account',
    },
    OTHER_ALREADY_LINKED_RULE: {
      name: 'OtherAlreadyLinkedRule',
      message: 'Other user is already linked this account',
    },
    WRONG_PASSWORD_RESET_TOKEN_RULE: {
      name: 'WrongPasswordResetToken',
      message: 'Password reset token is invalid or has expired',
    },
    INVALID_USERNAME_RULE: {
      name: 'InvalidUsername',
      message: 'Invalid Username provided',
    },
    UNSUPPORTED_SN_VALUE_RULE: {
      name: 'UnsupportedSnValue',
      message: 'Unsupported "sn" value',
    },
    UNLINK_PRIMARY_ACCOUNT_RULE: {
      name: 'UnlinkPrimaryAccount',
      message: 'You cannot unlink account used in signing up',
    },
  },
};
