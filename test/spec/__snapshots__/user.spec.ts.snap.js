exports[`REST /users : POST / - Create : response should contain body 1`] = {
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
exports[`REST /users : GET / - Get list : by user : response should contain body 1`] = {
  "type": "restifizer",
  "status": 403,
  "message": "Forbidden"
};
exports[`REST /users : GET / - Get list : by admin : response should contain body 1`] = [
  {
    "_id": "${_id[0]}",
    "username": "fakeusername1",
    "firstName": "firstName 1",
    "lastName": "lastName 1",
    "age": 23,
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  },
  {
    "_id": "${_id[1]}",
    "provider": "local",
    "username": "admin@vedidev.com",
    "firstName": "Admin",
    "lastName": "Admin",
    "createdAt": "${createdAt[1]}",
    "updatedAt": "${updatedAt[1]}"
  }
];
exports[`REST /users : GET /:_id - Get Profile : by owner : response should contain body 1`] = {
  "provider": "local",
  "_id": "${_id}",
  "username": "fakeusername1",
  "firstName": "firstName 1",
  "lastName": "lastName 1",
  "age": 23,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`REST /users : GET /:_id - Get Profile : by other user : response should contain body 1`] = {
  "type": "restifizer",
  "status": 403,
  "message": "Forbidden"
};
exports[`REST /users : Change Profile : response should contain body 1`] = {
  "provider": "local",
  "_id": "${_id}",
  "username": "fakeusername1",
  "firstName": "new-firstName",
  "lastName": "lastName 1",
  "age": 23,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
