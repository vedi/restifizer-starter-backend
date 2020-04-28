import _ from 'lodash';
import fetch from 'node-fetch';

import { SnHelper, SnOptions } from '../interfaces';
import { UserDomain } from '../../../../domains/user';

const GOOGLE_URL = 'https://www.googleapis.com/oauth2/v3';
const FIELDS = ['sub', 'name'];

export default class GoogleHelper implements SnHelper {
  private options: SnOptions;

  constructor(options: SnOptions) {
    this.options = options;
  }

  async getProfile(authData: any): Promise<Record<string, any>> {
    if (!authData.idToken) {
      throw new Error('Missing required fields');
    }

    const res = await fetch(
      `${GOOGLE_URL}/tokeninfo?id_token=${authData.idToken}`,
    );

    if (res.status < 200 || res.status > 299) {
      throw new Error('wrong response from Google');
    }
    const json = await res.json();

    if (!_.includes(this.options.audiences, json.aud)) {
      throw new Error('wrong credentials');
    }

    if (1000 * json.exp < Date.now()) {
      throw new Error('token expired');
    }
    const hasMissedFields = _.find(FIELDS, (fieldName) => !json[fieldName]);
    if (hasMissedFields) {
      throw new Error('Missing required fields from Google');
    }
    return json;
  }

  buildQuery(profile: Record<string, any>): Record<string, any> {
    return { id: profile.sub };
  }

  extract(profile: Record<string, any>): Partial<UserDomain> {
    return {
      username: profile.email,
      firstName: profile.given_name,
      lastName: profile.family_name,
    };
  }
}

module.exports = GoogleHelper;
