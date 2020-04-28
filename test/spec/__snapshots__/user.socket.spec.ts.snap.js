exports[`User Socket : Sign up : response should contain body 1`] = {
  "provider": "local",
  "username": "fakeusername1",
  "firstName": "firstName 1",
  "lastName": "lastName 1",
  "age": 23,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "auth": {
    "access_token": "${auth.access_token}",
    "refresh_token": "${auth.refresh_token}",
    "expires_in": 3600,
    "token_type": "bearer"
  },
  "_id": "${_id}"
};
exports[`User Socket : Get user list : response should contain body 1`] = {
  "type": "restifizer",
  "status": 403,
  "message": "Forbidden"
};
exports[`User Socket : Get Profile : response should contain body 1`] = {
  "provider": "local",
  "_id": "${_id}",
  "username": "fakeusername1",
  "firstName": "firstName 1",
  "lastName": "lastName 1",
  "age": 23,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`User Socket : Change Profile : response should contain body 1`] = {
  "provider": "local",
  "_id": "${_id}",
  "username": "fakeusername1",
  "firstName": "new-firstName",
  "lastName": "lastName 1",
  "age": 23,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
