import { expect } from 'chai';
import app from 'app';
import testConfig from 'test/config';
import specHelper, { EmailData } from 'test/specHelper';
import { UserDocument } from '../../app/domains/user';

import Context = Mocha.Context;

const { modelProvider: { User } } = app;

const withResetPasswordToken = () => {
  before(function () {
    this.token = 'validToken';
    const expires = Date.now() + 10000;
    return User.updateOne(
      { _id: this.user._id },
      {
        'resetPassword.token': this.token,
        'resetPassword.expires': expires,
      },
    );
  });
};

describe('User Auth ', () => {
  const userData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);
  const otherUserData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2);

  describe('POST /logout - Logout', () => {
    specHelper.withUser({
      data: userData,
      key: 'user',
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.post(
          `${testConfig.baseUrl}/api/users/logout`,
          {},
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      204,
    );
  });

  describe('POST /:_id/change-password - Change password', () => {
    const newPassword = 'newPassword';
    describe('by owner', () => {
      specHelper.withUser({
        data: userData,
        key: 'user',
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/api/users/me/change-password`,
            {
              password: this.user.password,
              newPassword,
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        204,
      );
    });
    describe('by other user', () => {
      specHelper.withUser({
        data: userData,
        key: 'user',
      });
      specHelper.withUser({
        data: otherUserData,
        key: 'otherUser',
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/api/users/${this.user._id}/change-password`,
            {
              password: this.user.password,
              newPassword,
            },
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        400,
        { mask: [] },
      );
    });
  });

  describe('POST /forgot - Forgot password', () => {
    describe('by owner', () => {
      let userDoc: UserDocument;
      let sentEmails: EmailData[];

      specHelper.withUser({
        data: userData,
        key: 'user',
      });

      before('cleaning up emails', () => specHelper.fetchAndClearSentEmails());

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/api/users/forgot`,
            { ...specHelper.getClientAuth(), username: this.user.username },
          );
        },
        204,
      );

      before('wait event processing', (done) => {
        setTimeout(done, 500);
      });
      before('fetch user from db', async function () {
        userDoc = await User.findById(this.user._id).select('resetPassword').lean()!;
      });
      before('send request', async () => {
        sentEmails = await specHelper.fetchAndClearSentEmails();
      });

      it('should set reset token for user in db', () => expect(userDoc.resetPassword?.token).to.exist);

      it('should contain 1 email', () => expect(sentEmails.length).to.be.equal(1));

      it('email should be sent to this user', function () {
        return expect(sentEmails[0].to).to.be.equal(this.user.username.toLowerCase());
      });
      it('email should contain reset token of to this user', function () {
        this.user.resetPassword = userDoc.resetPassword;
        return expect(sentEmails[0].html.indexOf(this.user.resetPassword.token)).to.be.above(-1);
      });
    });

    describe('for not existing user', () => {
      specHelper.withUser({
        data: userData,
        key: 'user',
      });
      specHelper.checkResponse(
        () => specHelper.post(
          `${testConfig.baseUrl}/api/users/forgot`,
          { ...specHelper.getClientAuth(), username: 'someFakeUserName' },
        ),
        400,
        { mask: [] },
      );
    });
  });

  describe('POST _id/reset/:token - Reset password', () => {
    describe('with valid token', () => {
      let sentEmails: EmailData[];

      specHelper.withUser({
        data: userData,
        key: 'user',
      });
      before('cleaning up emails', () => specHelper.fetchAndClearSentEmails());
      withResetPasswordToken();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/api/users/reset/${this.token}`,
            { ...specHelper.getClientAuth(), newPassword: 'completelyOtherPassword' },
          );
        },
        200,
        { mask: ['access_token', 'refresh_token'] },
      );

      before('wait event processing', (done) => {
        setTimeout(done, 500);
      });
      before('send request', async () => {
        sentEmails = await specHelper.fetchAndClearSentEmails();
      });

      it('should contain 1 email', () => expect(sentEmails.length).to.be.equal(1));
    });

    describe('with invalid token', () => {
      let sentEmails: EmailData[];
      specHelper.withUser({
        data: userData,
        key: 'user',
      });
      before('cleaning up emails', () => specHelper.fetchAndClearSentEmails());
      withResetPasswordToken();
      specHelper.checkResponse(
        () => specHelper.post(
          `${testConfig.baseUrl}/api/users/reset/invalidToken`,
          { ...specHelper.getClientAuth(), newPassword: 'completelyOtherPassword' },
        ),
        400,
        { mask: [] },
      );
      before('wait event processing', (done) => {
        setTimeout(done, 500);
      });
      before('send request', async () => {
        sentEmails = await specHelper.fetchAndClearSentEmails();
      });

      it('should contain no email', () => expect(sentEmails.length).to.be.equal(0));
    });
  });
});
