/* Email notifications. Optional: if SMTP is not configured, nothing breaks.
   Every submission is already saved in Supabase before we try to send. */
import 'server-only';
import nodemailer from 'nodemailer';

export async function notify(subject: string, lines: [string, string][]) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFY_TO) return;
  try {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 465),
      secure: Number(SMTP_PORT || 465) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    const text = lines.map(([k, v]) => `${k}: ${v || '-'}`).join('\n');
    await transport.sendMail({ from: `EdgeLIFE Website <${SMTP_USER}>`, to: NOTIFY_TO, subject, text });
  } catch (e) {
    console.error('[EdgeLIFE] email notification failed', e);
  }
}
