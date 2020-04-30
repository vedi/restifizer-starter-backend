import testConfig from 'test/config';
import specHelper from 'test/specHelper';
import { expect } from 'chai';

import Context = Mocha.Context;

const MASK_FIELDS = [
  '_id',
  'createdAt',
  'updatedAt',
  'auth.access_token',
  'auth.refresh_token',
];

describe('REST /users', () => {
  const adminUser = specHelper.getAdminUser();

  describe('POST / - Create', () => {
    const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);
    specHelper.checkResponse(
      () => specHelper.post(
        `${testConfig.baseUrl}/api/users`,
        { ...user, ...specHelper.getClientAuth() },
      ),
      201,
      { mask: MASK_FIELDS },
    );
    after('remove user', function () {
      return specHelper.removeUser(this.response.body);
    });
  });

  describe('GET / - Get list', () => {
    describe('by user', () => {
      specHelper.withUser({
        data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
        key: 'user',
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/api/users`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        403,
      );
    });

    describe('by admin', () => {
      specHelper.withUser({
        data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
        key: 'user',
      });

      before('sign in admin', () => specHelper.signInUser(adminUser));

      specHelper.checkResponse(
        () => specHelper.get(
          `${testConfig.baseUrl}/api/users`,
          { headers: { Authorization: `Bearer ${adminUser.auth!.access_token}` } },
        ),
        200,
        { mask: MASK_FIELDS },
      );
    });
  });

  describe('GET /:_id - Get Profile', () => {
    describe('by owner', () => {
      specHelper.withUser({
        data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
        key: 'user',
      });
      specHelper.withUser({
        data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
        key: 'otherUser',
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/api/users/me`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        { mask: MASK_FIELDS },
      );

      it('should be the same _id', function () {
        expect(this.response.body._id).to.be.equal(this.user._id);
      });
    });

    describe('by other user', () => {
      specHelper.withUser({
        data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
        key: 'user',
      });
      specHelper.withUser({
        data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
        key: 'otherUser',
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/api/users/${this.user._id}`,
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
      );
    });
  });

  describe('Change Profile', () => {
    const NEW_VALUE = 'new-firstName';

    specHelper.withUser({
      data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
      key: 'user',
    });
    specHelper.withUser({
      data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
      key: 'otherUser',
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.patch(
          `${testConfig.baseUrl}/api/users/me`,
          {
            firstName: NEW_VALUE,
          },
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      200,
      { mask: MASK_FIELDS },
    );

    it('should be the same _id', function () {
      expect(this.response.body._id).to.be.equal(this.user._id);
    });
  });

  describe('Remove Profile', () => {
    specHelper.withUser({
      data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
      key: 'user',
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.delete(
          `${testConfig.baseUrl}/api/users/me`,
          {},
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      204,
    );
  });
});
