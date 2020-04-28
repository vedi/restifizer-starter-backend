import app from 'app';
import { EmailBuilder, EmailType, ForgotPasswordPayload } from '../../domains/email';

const { config: { app: { title } } } = app;

const email: EmailBuilder<ForgotPasswordPayload> = {
  name: EmailType.ForgotPassword,
  templateName: 'forgot',
  buildData(payload: ForgotPasswordPayload) {
    return {
      appName: title,
      name: payload.username,
      url: `${payload.baseUrl}?token=${payload.token}`,
    };
  },
  buildSubject() {
    return 'Reset password';
  },
};

export default email;
