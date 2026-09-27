import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export function getSmtpConfig() {
  let envContent = '';
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
  } catch {
    // ignore
  }

  const parseEnv = (key: string, defaultVal = '') => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
    return process.env[key] || defaultVal;
  };

  const user = parseEnv('SMTP_USER');
  const pass = parseEnv('SMTP_PASS');
  const host = parseEnv('SMTP_HOST', 'smtp.gmail.com');
  const port = parseInt(parseEnv('SMTP_PORT', '465'), 10);
  const secure = parseEnv('SMTP_SECURE', 'true') === 'true' || port === 465;
  const from = parseEnv('SMTP_FROM', user ? `TunnelXray Security <${user}>` : 'TunnelXray Security <no-reply@tunnelxray.io>');

  const isConfigured = Boolean(user && pass);

  return { user, pass, host, port, secure, from, isConfigured };
}

export async function sendVerificationEmail({
  to,
  name,
  code,
  type = 'verification',
}: {
  to: string;
  name?: string;
  code: string;
  type?: 'verification' | 'password_reset';
}) {
  const config = getSmtpConfig();

  if (!config.isConfigured) {
    return {
      success: true,
      delivered: false,
      code,
      message: 'SMTP credentials not configured yet in .env. Code displayed on-screen for development preview.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const isReset = type === 'password_reset';
    const subject = isReset
      ? `TunnelXray - Password Reset Security Code [${code}]`
      : `TunnelXray - Verify Your Account [${code}]`;

    const html = `
      <!DOCTYPE html>
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
              : 'Thank you for registering with TunnelXray. Please use the cryptographic 6-digit verification code below to activate your account:'
          }</p>
          
          <div class="code-box">
            <div class="code-val">${code}</div>
            <div class="expiry-note">This code expires in 10 minutes.</div>
          </div>

          <p>If you did not request this security code, please disregard this email or notify your SOC administrator immediately.</p>

          <div class="warning-box">
            <strong>Security Notice:</strong> TunnelXray engineers will never ask for your verification code or password.
          </div>

          <div class="footer">
            TunnelXray Security Operations Center • NIST SP 800-77 Rev. 1 Compliant<br>
            Automated System Message — Do not reply directly to this email.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
    });

    return {
      success: true,
      delivered: true,
      code,
      message: `Verification code successfully sent to ${to}`,
    };
  } catch (error: any) {
    console.error('Error sending verification email via SMTP:', error);
    return {
      success: false,
      delivered: false,
      code,
      error: error?.message || 'Failed to send email via SMTP server.',
    };
  }
}
