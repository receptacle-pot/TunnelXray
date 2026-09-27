import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env if present
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          val = val.replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  } catch (err) {
    console.warn('Could not read .env file:', err.message);
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const DIST_DIR = path.resolve(__dirname, 'dist');

function getSmtpConfig() {
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const from = process.env.SMTP_FROM || (user ? `TunnelXray Security <${user}>` : 'TunnelXray Security <no-reply@tunnelxray.io>');
  const isConfigured = Boolean(user && pass);
  return { user, pass, host, port, secure, from, isConfigured };
}

async function sendVerificationEmail({ to, name, code, type = 'verification' }) {
  const config = getSmtpConfig();
  if (!config.isConfigured) {
    return {
      success: true,
      delivered: false,
      code,
      message: 'SMTP credentials not configured in production environment variables.',
    };
  }

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
    from: config.from,
    to,
    subject,
    text: `Your verification code is: ${code}. It expires in 10 minutes.`,
    html,
  });

  return {
    success: true,
    delivered: true,
    messageId: info.messageId,
  };
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

const server = http.createServer(async (req, res) => {
  const urlPath = req.url ? req.url.split('?')[0] : '/';

  // API: SMTP status check
  if (urlPath === '/api/auth/smtp-status' && req.method === 'GET') {
    const config = getSmtpConfig();
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        configured: config.isConfigured,
        user: config.user ? `${config.user.slice(0, 3)}***@${config.user.split('@')[1] || ''}` : null,
        host: config.host,
      })
    );
    return;
  }

  // API: Send email verification
  if (urlPath === '/api/auth/send-verification' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const { to, name, code, type } = data;
        if (!to || !code) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing "to" or "code" parameter' }));
          return;
        }

        const result = await sendVerificationEmail({ to, name, code, type });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      }
    });
    return;
  }

  // Static File Serving from dist/
  let sanitizedPath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(DIST_DIR, sanitizedPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    if (ext !== '.html') {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Fallback to index.html for SPA routing
  const fallbackPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(fallbackPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    fs.createReadStream(fallbackPath).pipe(res);
    return;
  }

  res.statusCode = 404;
  res.end('Not Found. Please run "npm run build" first.');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Production Server] TunnelXray SOC running on http://0.0.0.0:${PORT}`);
  console.log(`[Production Server] Serving dist from: ${DIST_DIR}`);
});
