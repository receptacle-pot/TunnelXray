import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, name, code, type } = req.body || {};
  if (!to || !code) {
    return res.status(400).json({ error: 'Missing "to" or "code" parameter' });
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const from = process.env.SMTP_FROM || (user ? `TunnelXray Security <${user}>` : 'TunnelXray Security <no-reply@tunnelxray.io>');

  if (!user || !pass) {
    return res.status(500).json({
      success: false,
      delivered: false,
      error: 'SMTP credentials not configured in environment variables.',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const isReset = type === 'password_reset';
    const subject = isReset
      ? `TunnelXray - Password Reset Security Code [${code}]`
      : `TunnelXray - Verify Your Account [${code}]`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 40px 20px; }
    .card { max-width: 520px; margin: 0 auto; background: #0c0d12; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 14px; padding: 36px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
    .logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 18px; }
    .logo-title { font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; }
    p { color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; }
    .code-box { background: #000000; border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 10px; padding: 22px; text-align: center; margin: 28px 0; }
    .code-val { font-family: 'Courier New', monospace; font-size: 34px; font-weight: 800; letter-spacing: 12px; color: #ffffff; margin: 0; }
    .expiry-note { font-size: 12px; color: #71717a; margin-top: 10px; }
    .warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #fca5a5; margin-top: 24px; }
    .footer { text-align: center; font-size: 11px; color: #52525b; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-row">
      <div class="logo-title">TunnelXray SOC</div>
    </div>
    <h1>${isReset ? 'Password Reset Verification' : 'Verify Your Email Address'}</h1>
    <p>Hello${name ? ` ${name}` : ''},</p>
    <p>${
      isReset
        ? 'We received a request to reset the password for your TunnelXray account. Enter the verification code below to authorize the password change:'
        : 'Welcome to TunnelXray SOC. To activate your account, please enter the single-use 6-digit cryptographic verification code below:'
    }</p>
    <div class="code-box">
      <div class="code-val">${code}</div>
      <div class="expiry-note">This code will expire in 10 minutes.</div>
    </div>
    <p>If you did not initiate this request, no action is required.</p>
    <div class="warning-box">
      <strong>Security Notice:</strong> Never share this code with anyone. TunnelXray support will never ask for your verification code.
    </div>
    <div class="footer">
      TunnelXray Security Operations Platform • Cryptographic Zero-Trust Protocol
    </div>
  </div>
</body>
</html>`;

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: `Your verification code is: ${code}. It expires in 10 minutes.`,
      html,
    });

    return res.status(200).json({
      success: true,
      delivered: true,
      messageId: info.messageId,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Email delivery failed' });
  }
}
