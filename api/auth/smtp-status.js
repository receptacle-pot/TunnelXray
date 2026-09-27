export default function handler(req, res) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const isConfigured = Boolean(user && pass);

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    configured: isConfigured,
    user: user ? `${user.slice(0, 3)}***@${user.split('@')[1] || ''}` : null,
    host,
  });
}
