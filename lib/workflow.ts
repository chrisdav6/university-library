import { Client as WorkflowClient } from '@upstash/workflow';
import { Client as QStashClient, resend } from '@upstash/qstash';
import config from './config';

export const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qstachUrl,
  token: config.env.upstash.qstashToken,
});

const qstashClient = new QStashClient({
  token: config.env.upstash.qstashToken,
});

export const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  await qstashClient.publishJSON({
    api: {
      name: 'email',
      provider: resend({ token: config.env.resend.resendToken }),
    },
    body: {
      from: 'Chris Davis Dev <hello.chrisdavisdev.online>',
      to: [email],
      subject: subject,
      html: message,
    },
  });
};
