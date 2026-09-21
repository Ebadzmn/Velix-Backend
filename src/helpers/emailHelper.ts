import nodemailer from 'nodemailer';
import config from '../config';
import { ISendEmailOptions } from '../types/email';

const sendEmail = async (options: ISendEmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  await transporter.sendMail({
    from: config.email.from || config.email.user,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const emailHelper = {
  sendEmail,
};
