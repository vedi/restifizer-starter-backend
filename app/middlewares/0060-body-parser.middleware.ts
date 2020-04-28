import bodyParser from 'body-parser';
import { ExtendedExpressApplication } from '../domains/system';

export default (expressApp: ExtendedExpressApplication) => {
  expressApp.use(bodyParser.urlencoded({
    extended: true,
  }));
  expressApp.use(bodyParser.json());
};
