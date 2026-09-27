import fs from 'fs';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

export function getOAuthConfig() {
  let envContent = '';
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
  } catch {}

  const parseEnv = (key: string, defaultVal = '') => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
    return process.env[key] || defaultVal;
  };

  return {
    googleClientId: parseEnv('GOOGLE_CLIENT_ID'),
    googleClientSecret: parseEnv('GOOGLE_CLIENT_SECRET'),
    githubClientId: parseEnv('GITHUB_CLIENT_ID'),
    githubClientSecret: parseEnv('GITHUB_CLIENT_SECRET'),
  };
}

export function handleOAuthStatus(_req: IncomingMessage, res: ServerResponse) {
  const config = getOAuthConfig();
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      googleConfigured: Boolean(config.googleClientId && config.googleClientSecret),
      githubConfigured: Boolean(config.githubClientId && config.githubClientSecret),
      googleClientId: config.googleClientId ? `${config.googleClientId.slice(0, 8)}...` : null,
      githubClientId: config.githubClientId ? `${config.githubClientId.slice(0, 8)}...` : null,
    })
  );
}

// Redirect to Google's real OAuth login page
export function handleGoogleLoginRedirect(req: IncomingMessage, res: ServerResponse) {
  const config = getOAuthConfig();
  const host = req.headers.host || '127.0.0.1:5173';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const redirectUri = `${protocol}://${host}/api/auth/oauth/google/callback`;

  if (!config.googleClientId) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'GOOGLE_CLIENT_ID is not configured in .env. To log in with Google, please add your Google OAuth Client ID.',
      })
    );
    return;
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    config.googleClientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(
    'openid email profile'
  )}&access_type=offline&prompt=select_account`;

  res.statusCode = 302;
  res.setHeader('Location', authUrl);
  res.end();
}

// Handle Google callback with auth code
export async function handleGoogleCallback(req: IncomingMessage, res: ServerResponse) {
  const config = getOAuthConfig();
  const host = req.headers.host || '127.0.0.1:5173';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const redirectUri = `${protocol}://${host}/api/auth/oauth/google/callback`;

  const parsedUrl = new URL(req.url || '', `http://${host}`);
  const code = parsedUrl.searchParams.get('code');
  const error = parsedUrl.searchParams.get('error');

  if (error || !code) {
    res.statusCode = 302;
    res.setHeader('Location', `/?oauth_error=${encodeURIComponent(error || 'Google login cancelled')}`);
    res.end();
    return;
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to obtain access token from Google');
    }

    // Fetch user profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = (await userRes.json()) as any;

    if (!userData.email) {
      throw new Error('No email found in Google account profile');
    }

    const email = userData.email;
    const name = userData.name || email.split('@')[0];
    const picture = userData.picture || '';

    // Redirect to app with authenticated user parameters
    const appRedirect = `/?oauth_success=1&provider=google&email=${encodeURIComponent(
      email
    )}&name=${encodeURIComponent(name)}&picture=${encodeURIComponent(picture)}`;

    res.statusCode = 302;
    res.setHeader('Location', appRedirect);
    res.end();
  } catch (err: any) {
    res.statusCode = 302;
    res.setHeader('Location', `/?oauth_error=${encodeURIComponent(err.message || 'Google OAuth failed')}`);
    res.end();
  }
}

// Redirect to GitHub's real OAuth login page
export function handleGithubLoginRedirect(req: IncomingMessage, res: ServerResponse) {
  const config = getOAuthConfig();
  const host = req.headers.host || '127.0.0.1:5173';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const redirectUri = `${protocol}://${host}/api/auth/oauth/github/callback`;

  if (!config.githubClientId) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'GITHUB_CLIENT_ID is not configured in .env. To log in with GitHub, please add your GitHub OAuth App Client ID.',
      })
    );
    return;
  }

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    config.githubClientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent('read:user user:email')}`;

  res.statusCode = 302;
  res.setHeader('Location', authUrl);
  res.end();
}

// Handle GitHub callback with auth code
export async function handleGithubCallback(req: IncomingMessage, res: ServerResponse) {
  const config = getOAuthConfig();
  const host = req.headers.host || '127.0.0.1:5173';
  const parsedUrl = new URL(req.url || '', `http://${host}`);
  const code = parsedUrl.searchParams.get('code');
  const error = parsedUrl.searchParams.get('error');

  if (error || !code) {
    res.statusCode = 302;
    res.setHeader('Location', `/?oauth_error=${encodeURIComponent(error || 'GitHub login cancelled')}`);
    res.end();
    return;
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to obtain access token from GitHub');
    }

    // Fetch user profile from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'TunnelXray-SOC',
      },
    });
    const userData = (await userRes.json()) as any;

    // Fetch email if not public
    let email = userData.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'TunnelXray-SOC',
        },
      });
      const emails = await emailRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e: any) => e.primary && e.verified) || emails[0];
        email = primary?.email;
      }
    }

    if (!email) {
      email = `${userData.login}@users.noreply.github.com`;
    }

    const name = userData.name || userData.login;
    const picture = userData.avatar_url || '';

    const appRedirect = `/?oauth_success=1&provider=github&email=${encodeURIComponent(
      email
    )}&name=${encodeURIComponent(name)}&picture=${encodeURIComponent(picture)}`;

    res.statusCode = 302;
    res.setHeader('Location', appRedirect);
    res.end();
  } catch (err: any) {
    res.statusCode = 302;
    res.setHeader('Location', `/?oauth_error=${encodeURIComponent(err.message || 'GitHub OAuth failed')}`);
    res.end();
  }
}
