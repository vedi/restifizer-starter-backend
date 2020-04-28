import { Context, ServiceSchema } from 'moleculer';
import { Job } from 'bee-queue';
// @ts-ignore
import QueueService from 'moleculer-bee-queue';
import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';
import app from 'app';

const QUEUE_NAME = 'mail.send';

const { config: { ses: sesConfig, redis } } = app;

export default () => {
  const EmailService: ServiceSchema = {
    name: 'email',
    mixins: [QueueService({ redis })],
    settings: {
    },
    actions: {
      send: {
        params: {
          properties: {
            subject: { type: 'string' },
            to: { type: 'string', format: 'email' },
            from: { type: 'string', format: 'email' },
            html: { type: 'string' },
          },
          required: ['subject', 'to', 'from', 'html'],
        },
        async handler(ctx: Context) {
          const job: Job = this.createJob(QUEUE_NAME, ctx.params);
          this.logger.info(`Email job for ${job.data.to} created`);
          await job.retries(2).save();
        },
      },
    },
    queues: {
      [QUEUE_NAME](job: Job) {
        this.logger.info('Sending new mail to', job.data.to);
        return this.transport.sendMail(job.data);
      },
    },
    methods: {
    },
    async started(): Promise<void> {
      const ses = new AWS.SES(sesConfig);
      this.transport = nodemailer.createTransport({
        SES: ses,
      });
    },
  };
  return EmailService;
};
