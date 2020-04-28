import { Request, Response } from 'express-serve-static-core';
import emailService from 'app/lib/services/email.service';
import { ExtendedExpressApplication } from '../domains/system';
import { App } from '../domains/app';

export default (expressApp: ExtendedExpressApplication, { config: { isTest } }: App) => {
  if (isTest) {
    expressApp.get('/testing/sent-emails', (req: Request, res: Response) => {
      const { sentEmails } = emailService;
      emailService.sentEmails = [];
      res.json(sentEmails).end();
    });
  }
};
