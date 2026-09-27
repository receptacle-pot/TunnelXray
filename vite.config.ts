import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { getSmtpConfig, sendVerificationEmail } from './src/server/mailer.ts'
import {
  handleOAuthStatus,
  handleGoogleLoginRedirect,
  handleGoogleCallback,
  handleGithubLoginRedirect,
  handleGithubCallback,
} from './src/server/oauth.ts'

function authApiPlugin(): Plugin {
  return {
    name: 'tunnelxray-auth-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/api/auth/smtp-status' && req.method === 'GET') {
          const config = getSmtpConfig();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            configured: config.isConfigured,
            user: config.user ? `${config.user.slice(0, 3)}***@${config.user.split('@')[1] || ''}` : null,
            host: config.host,
          }));
          return;
        }

        // OAuth configuration status
        if (url === '/api/auth/oauth/config' && req.method === 'GET') {
          handleOAuthStatus(req, res);
          return;
        }

        // Google OAuth endpoints
        if (url === '/api/auth/oauth/google' && req.method === 'GET') {
          handleGoogleLoginRedirect(req, res);
          return;
        }
        if (url === '/api/auth/oauth/google/callback' && req.method === 'GET') {
          await handleGoogleCallback(req, res);
          return;
        }

        // GitHub OAuth endpoints
        if (url === '/api/auth/oauth/github' && req.method === 'GET') {
          handleGithubLoginRedirect(req, res);
          return;
        }
        if (url === '/api/auth/oauth/github/callback' && req.method === 'GET') {
          await handleGithubCallback(req, res);
          return;
        }

        if (url === '/api/auth/send-verification' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
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
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Server error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), authApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      'three128': path.resolve(import.meta.dirname, 'node_modules/three'),
      '@designcodeio/threeui/style.css': path.resolve(import.meta.dirname, 'src/shaders/threeui.css'),
      '@designcodeio/threeui': path.resolve(import.meta.dirname, 'src/shaders/index.ts'),
    },
  },
})
