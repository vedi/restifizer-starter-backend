import { Request, Response } from 'express-serve-static-core';
import morgan from 'morgan';
import chalk from 'chalk';
import { ExtendedExpressApplication } from '../domains/system';
import { App } from '../domains/app';

type Color = 'green' | 'red' | 'yellow' | 'cyan';

export default (expressApp: ExtendedExpressApplication, { config }: App) => {
  if (config.isProduction || config.logger.suppressStdout) {
    return;
  }

  const detailedLogging = config.logger.level !== 'warn' && config.logger.level !== 'error';

  // Enable logger (morgan)
  morgan.token('resdata', (req: Request, res: Response & {
    restfulResult?: any,
    controlizerResult?: any,
  }) => {
    const status = res.statusCode;
    let color: Color = 'green';

    if (status >= 500) {
      color = 'red';
    } else if (status >= 400) {
      color = 'yellow';
    } else if (status >= 300) {
      color = 'cyan';
    }

    if (detailedLogging && res.statusCode !== 404) {
      const body = req.body ? JSON.stringify(req.body, null, 2) : '';
      let result;
      if (res.restfulResult) {
        result = JSON.stringify(res.restfulResult, null, 2);
      } else if (res.controlizerResult) {
        result = JSON.stringify(res.controlizerResult, null, 2);
      } else {
        result = res.statusMessage;
      }
      return chalk[color](`\n-> ${body}\n<- ${result}`);
    } else {
      return '';
    }
  });

  expressApp.use(morgan(':method :url :status :response-time ms - :res[content-length] :resdata'));
};
