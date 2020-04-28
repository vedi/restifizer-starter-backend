import _ from 'lodash';
import fetch from 'node-fetch';
import { SnHelper, SnOptions } from '../interfaces';
import { UserDomain } from '../../../../domains/user';

const FB_URL = 'https://graph.facebook.com';
const FIELDS = ['id'];

export default class FacebookHelper implements SnHelper {
  private options: SnOptions;

  constructor(options: SnOptions) {
    this.options = options;
  }

  async getProfile(authData: any): Promise<Record<string, any>> {
    if (!authData.accessToken) {
      throw new Error('Missing required fields');
    }

    const fieldsToFetch = this.options.fieldsToFetch || 'name';

    const res = await fetch(
      `${FB_URL}/me?fields=id,${fieldsToFetch},email&access_token=${authData.accessToken}`,
    );

    if (res.status < 200 || res.status > 299) {
      throw new Error('wrong response from FB');
    }
    const json = await res.json();
    const hasMissedFields = _.find(FIELDS, (fieldName: string) => !json[fieldName]);
    if (hasMissedFields) {
      throw new Error('Missing required fields from FB');
    }
    return json;
  }

  buildQuery(profile: Record<string, any>): Record<string, any> {
    return { id: profile.id };
  }

  extract(profile: Record<string, any>): Partial<UserDomain> {
    return {
      firstName: profile.first_name,
      lastName: profile.last_name,
      username: profile.email,
    };
  }
}
