import app from 'app';
import { EmailBuilder, EmailType, ResetPasswordPayload } from '../../domains/email';

const { config: { app: { title } } } = app;

const email: EmailBuilder<ResetPasswordPayload> = {
  name: EmailType.ResetPassword,
  templateName: 'reset',
  buildData(payload: ResetPasswordPayload) {
    return {
      appName: title,
      name: `${payload.username}`,
    };
  },
  buildSubject() {
    return 'Your password has been changed';
  },
};

export default email;
