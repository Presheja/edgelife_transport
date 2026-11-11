/* Email. Optional: if SMTP is not configured, nothing breaks.
   Every submission is already saved in Supabase before we try to send. */
import 'server-only';
import nodemailer from 'nodemailer';

function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT || 465);
  return nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
}

/** Alert to dispatch. replyTo lets dispatch answer the customer straight from their inbox. */
export async function notify(subject: string, lines: [string, string][], replyTo?: string) {
  const t = transport();
  const to = process.env.NOTIFY_TO;
  if (!t || !to) return;
  try {
    const text = lines.map(([k, v]) => `${k}: ${v || '-'}`).join('\n') + '\n\nOpen the admin: ' + (process.env.SITE_URL || 'https://edgelifetransport.com') + '/admin';
    await t.sendMail({ from: `EdgeLIFE Website <${process.env.SMTP_USER}>`, to, subject, text, ...(replyTo ? { replyTo } : {}) });
  } catch (e) {
    console.error('[EdgeLIFE] email notification failed', e);
  }
}

/** Plain, short email to a customer. Replies land in the EdgeLIFE inbox. */
export async function sendToCustomer(to: string, subject: string, text: string) {
  const t = transport();
  if (!t || !to) return;
  try {
    await t.sendMail({ from: `EdgeLIFE Transportation <${process.env.SMTP_USER}>`, to, subject, text, replyTo: process.env.NOTIFY_TO || process.env.SMTP_USER });
  } catch (e) {
    console.error('[EdgeLIFE] customer email failed', e);
  }
}
