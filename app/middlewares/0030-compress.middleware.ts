import compress from 'compression';
import { ExtendedExpressApplication } from '../domains/system';

export default (expressApp: ExtendedExpressApplication) => {
  expressApp.use(compress());
};
