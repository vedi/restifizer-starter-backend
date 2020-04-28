import OAuthifizer from 'oauthifizer';
import AuthDelegate from 'app/lib/authDelegate';
import { ExtendedExpressApplication } from '../domains/system';

export default (expressApp: ExtendedExpressApplication) => {
  const authDelegate = new AuthDelegate();
  const oAuthifizer = new OAuthifizer(authDelegate);
  expressApp.route('/oauth').post(oAuthifizer.getToken());
  expressApp.oAuthifizer = oAuthifizer;
};
