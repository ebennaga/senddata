import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST!,
  port: parseInt(process.env.MAIL_PORT ?? '587'),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USERNAME!,
    pass: process.env.MAIL_PASSWORD!,
  },
});

export interface SendPertaminaMailOptions {
  to: string[];
  subject: string;
  filename: string;
  content: string;
}

export async function sendPertaminaMail(opts: SendPertaminaMailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM_ADDRESS!,
      to: opts.to.join(','),
      subject: opts.subject,
      text: '',
      attachments: [
        {
          filename: opts.filename,
          content: opts.content,
          contentType: 'text/plain',
        },
      ],
    });

    return info.rejected.length === 0;
  } catch {
    return false;
  }
}
