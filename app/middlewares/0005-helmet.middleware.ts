import helmet from 'helmet';

import { ExtendedExpressApplication } from '../domains/system';

export default (expressApp: ExtendedExpressApplication) => {
  expressApp.use(helmet());
};
