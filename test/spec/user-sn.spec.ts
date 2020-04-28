import { expect } from 'chai';
import config from 'test/config';
import userSnData from 'test/data/user-sn.data';
import specHelper from 'test/specHelper';
import { UserResource } from '../../app/domains/user';

import Context = Mocha.Context;

const MASK_TOKENS = ['access_token', 'refresh_token'];

const withUserProfile = (options?: {
  key?: string;
  fromKey?: string;
}) => {
  const {
    key = 'userProfile',
    fromKey,
  } = options || {};
  before('fetch profile', async function () {
    this[key] = <UserResource>(await specHelper.getUser(fromKey ? this[fromKey] : { auth: this.response.body }, {}, 'me'));
  });
};

const withSignInSocial = (
  sn: 'facebook' | 'google',
  snData: any,
  options?: { key: string },
) => {
  const { key = 'user' } = options || {};
  before(function () {
    this[key] = {};
    return specHelper.signInSocial(sn, snData, this[key]);
  });
};

const withRemoveUserProfile = (options?: { key?: string }) => {
  const { key = 'userProfile' } = options || {};
  after('remove user', function () {
    return specHelper.removeUser(this[key]);
  });
};

describe('User SN', () => {
  const [fb1, fb2] = userSnData.facebook;
  const [google] = userSnData.google;

  describe('Sign In new user', () => {
    specHelper.checkResponse(
      () => specHelper.post(
        `${config.baseUrl}/api/users/snAuth/facebook`,
        { ...fb1, ...specHelper.getClientAuth() },
      ),
      200,
      { mask: MASK_TOKENS },
    );

    withUserProfile();

    it('should have same username', function () {
      expect(this.userProfile.username).to.be.equal(fb1.auth.email);
    });

    it('should have same firstName', function () {
      expect(this.userProfile.firstName).to.be.equal(fb1.auth.firstName);
    });

    withRemoveUserProfile();
  });

  describe('Sign In with the same data', () => {
    withSignInSocial('facebook', fb1);
    withUserProfile({ key: 'initialUserProfile', fromKey: 'user' });

    specHelper.checkResponse(
      () => specHelper.post(
        `${config.baseUrl}/api/users/snAuth/facebook`,
        { ...fb1, ...specHelper.getClientAuth() },
      ),
      200,
      { mask: MASK_TOKENS },
    );

    withUserProfile();

    it('should have the same user _id', function () {
      return expect(this.userProfile._id).to.be.equal(this.initialUserProfile._id);
    });

    withRemoveUserProfile();
  });

  describe('Link another sn', () => {
    withSignInSocial('facebook', fb1);
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.put(
          `${config.baseUrl}/api/users/me/linked-accounts/google`,
          google,
          {
            headers: {
              Authorization: `Bearer ${this.user.auth!.access_token}`,
            },
          },
        );
      },
      204,
    );
    withUserProfile({ fromKey: 'user' });
    withRemoveUserProfile();
  });

  describe('Link same sn second time to other user', () => {
    withSignInSocial('facebook', fb1);
    withSignInSocial('facebook', fb2, { key: 'otherUser' });

    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.put(
          `${config.baseUrl}/api/users/me/linked-accounts/facebook`,
          fb1,
          {
            headers: {
              Authorization: `Bearer ${this.otherUser.auth!.access_token}`,
            },
          },
        );
      },
      400,
      { mask: [] },
    );

    withUserProfile();
    withUserProfile({ key: 'otherUserProfile', fromKey: 'otherUser' });

    withRemoveUserProfile();
    withRemoveUserProfile({ key: 'otherUserProfile' });
  });

  describe('Sign In with linked sn', () => {
    withSignInSocial('facebook', fb1);
    withUserProfile({ key: 'initialUserProfile', fromKey: 'user' });

    before('link other sn', function () {
      return specHelper.linkSocial('google', google, this.user);
    });

    specHelper.checkResponse(
      () => specHelper.post(
        `${config.baseUrl}/api/users/snAuth/google`,
        { ...google, ...specHelper.getClientAuth() },
      ),
      200,
      { mask: MASK_TOKENS },
    );

    withUserProfile();

    it('should have the same user _id', function () {
      return expect(this.userProfile._id).to.be.equal(this.initialUserProfile._id);
    });

    withRemoveUserProfile();
  });

  describe('Unlink another sn', () => {
    withSignInSocial('facebook', fb1);
    withUserProfile({ fromKey: 'user' });

    before('link other sn', function () {
      return specHelper.linkSocial('google', google, this.user);
    });

    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.delete(
          `${config.baseUrl}/api/users/me/linked-accounts/google`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.user.auth!.access_token}`,
            },
          },
        );
      },
      204,
    );

    withRemoveUserProfile();
  });
});
