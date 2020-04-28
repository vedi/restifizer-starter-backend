exports[`User Auth  : POST /:_id/change-password - Change password : by other user : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "The password you provided does not work for this account",
  "details": {
    "rule": "BadPassword"
  }
};
exports[`User Auth  : POST /forgot - Forgot password : for not existing user : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "Invalid Username provided",
  "details": {
    "rule": "InvalidUsername"
  }
};
exports[`User Auth  : POST _id/reset/:token - Reset password : with valid token : response should contain body 1`] = {
  "access_token": "${access_token}",
  "refresh_token": "${refresh_token}",
  "expires_in": 3600,
  "token_type": "bearer"
};
exports[`User Auth  : POST _id/reset/:token - Reset password : with invalid token : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "Password reset token is invalid or has expired",
  "details": {
    "rule": "WrongPasswordResetToken"
  }
};
