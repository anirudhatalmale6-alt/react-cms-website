const { sendMail } = require('../config/mail');

async function sendNotification(to, subject, html) {
  return sendMail({ to, subject, html });
}

async function sendWithAttachment(to, subject, html, attachments) {
  return sendMail({ to, subject, html, attachments });
}

function buildHtmlEmail(title, body) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="background:#2563eb;padding:24px 32px;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;">${title}</h1>
        </div>
        <div style="padding:32px;">
          ${body}
        </div>
        <div style="background:#f8fafc;padding:16px 32px;text-align:center;color:#94a3b8;font-size:12px;">
          <p style="margin:0;">This is an automated message from your CMS.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { sendNotification, sendWithAttachment, buildHtmlEmail };
