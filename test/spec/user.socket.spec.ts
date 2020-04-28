import specHelper from 'test/specHelper';

const MASK_FIELDS = [
  '_id',
  'createdAt',
  'updatedAt',
  'auth.access_token',
  'auth.refresh_token',
];

describe('User Socket', () => {
  const userData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);

  describe('Sign up', () => {
    before('open socket for user', async function () {
      this.userSocket = await specHelper.connectToSocket({
        extraHeaders: {
          Authorization: `Basic ${specHelper.getBasicAuth()}`,
        },
      });
    });

    specHelper.checkSocketResponse(
      'userSocket',
      () => ({
        route: 'post:/api/users',
        body: userData,
      }),
      201,
      { makeSnapShot: { mask: MASK_FIELDS } },
    );

    after('remove user', function () {
      return specHelper.removeUser(this.response.body);
    });
  });

  describe('Get user list', () => {
    specHelper.withUserSocket({
      data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
      key: 'userSocket',
      userKey: 'user',
    });

    specHelper.checkSocketResponse(
      'userSocket',
      () => ({
        route: 'get:/api/users',
      }),
      403,
      { makeSnapShot: { mask: [] } },
    );
  });

  describe('Get Profile', () => {
    specHelper.withUserSocket({
      data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
      key: 'userSocket',
      userKey: 'user',
    });

    specHelper.checkSocketResponse(
      'userSocket',
      () => ({ route: 'get:/api/users/:_id', params: { _id: 'me' } }),
      200,
      { makeSnapShot: { mask: MASK_FIELDS } },
    );
  });

  describe('Change Profile', () => {
    const NEW_VALUE = 'new-firstName';

    specHelper.withUserSocket({
      data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
      key: 'userSocket',
      userKey: 'user',
    });

    specHelper.checkSocketResponse(
      'userSocket',
      () => ({
        route: 'patch:/api/users/:_id',
        params: { _id: 'me' },
        body: { firstName: NEW_VALUE },
      }),
      200,
      { makeSnapShot: { mask: MASK_FIELDS } },
    );
  });

  describe('Remove Profile', () => {
    specHelper.withUserSocket({
      data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
      key: 'userSocket',
      userKey: 'user',
    });

    specHelper.checkSocketResponse(
      'userSocket',
      () => ({ route: 'delete:/api/users/:_id', params: { _id: 'me' } }),
      204,
    );
  });
});
