// @ts-ignore
import swig from 'swig-templates';
import app from 'app';
import fromCallback from 'app/lib/helpers/fromCallback';
import { EmailBuilder, EmailData, EmailParams, EmailType, IEmailService } from '../../domains/email';

const { config: { i18n: { defaultLocale }, isTest, ses: { from } } } = app;

const log = app.createLog(module);

class EmailService implements IEmailService {
  private emails?: Record<EmailType, EmailBuilder<any>>;

  public sentEmails?: Record<string, any>[];

  constructor() {
    if (isTest) {
      this.sentEmails = [];
    }
  }

  async init() {
    this.emails = app.emails.reduce(
      (result, emailBuilder) => {
        result[emailBuilder.name] = emailBuilder;
        return result;
      },
      {} as Record<EmailType, EmailBuilder<any>>,
    );
    app.registerProvider('emailService', this);
  }

  async sendEmail<T>(emailType: EmailType, params: EmailParams<T>): Promise<boolean> {
    try {
      const emailBuilder: EmailBuilder<T> = this.emails![emailType];
      const { email, locale, payload } = params;
      const template = this.buildTemplatePath(emailBuilder.templateName, locale);
      const templateData = emailBuilder.buildData(payload);
      const compiledTemplate = templateData
        ? (await fromCallback<(data: any) => string>((callback: Function) => {
          swig.compileFile(template, {}, callback);
        }))
        : template;
      const html = templateData
        ? (<(data: any) => string>compiledTemplate)(templateData)
        : <string>compiledTemplate;
      const mailOptions: EmailData = {
        to: email,
        from,
        subject: emailBuilder.buildSubject(payload),
        html,
      };
      log.info(`Sending mail to: ${mailOptions.to}`);
      if (!isTest) {
        await app.moleculerBroker.call('email.send', mailOptions);
      } else {
        log.debug('emailService._sendEmail stub called');
        this.sentEmails!.push(mailOptions);
      }
      return true;
    } catch (err) {
      log.error(`Cannot send mail: ${err}`);
      return false;
    }
  }

  buildTemplatePath(name: string, locale: string = defaultLocale): string {
    return `app/views/${locale}/templates/${name}.email.view.html`;
  }
}
export default new EmailService();
