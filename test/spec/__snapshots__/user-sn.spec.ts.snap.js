exports[`User SN : Sign In new user : response should contain body 1`] = {
  "access_token": "${access_token}",
  "refresh_token": "${refresh_token}",
  "expires_in": 3600,
  "token_type": "bearer"
};
exports[`User SN : Sign In with the same data : response should contain body 1`] = {
  "access_token": "${access_token}",
  "refresh_token": "${refresh_token}",
  "expires_in": 3600,
  "token_type": "bearer"
};
exports[`User SN : Link another sn : response should contain body 1`] = undefined;
exports[`User SN : Link same sn second time to other user : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "Other user is already linked this account",
  "details": {
    "rule": "OtherAlreadyLinkedRule"
  }
};
exports[`User SN : Sign In with linked sn : response should contain body 1`] = {
  "access_token": "${access_token}",
  "refresh_token": "${refresh_token}",
  "expires_in": 3600,
  "token_type": "bearer"
};
