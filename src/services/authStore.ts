// Client-side authentication store and crypto verification for TunnelXray SOC

export interface RegisteredUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  passwordHash: string;
  verified: boolean;
  createdAt: string;
}

export interface PendingOtp {
  email: string;
  code: string;
  expiresAt: number;
  type: 'signup' | 'reset';
  payload?: {
    fullName?: string;
    passwordHash?: string;
    role?: string;
  };
}

export interface SmtpStatus {
  configured: boolean;
  user: string | null;
  host: string;
}

const USERS_STORAGE_KEY = 'tunnelxray_registered_users';
const PENDING_OTP_KEY = 'tunnelxray_pending_otp';
const CURRENT_SESSION_KEY = 'tunnelxray_user_session';
const SALT = 'tunnelxray_sha256_salt_v1';

// SHA-256 client hashing using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate secure 6-digit OTP
function generateOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const num = (array[0] % 900000) + 100000;
  return num.toString();
}

// Check SMTP server status
export async function checkSmtpStatus(): Promise<SmtpStatus> {
  try {
    const res = await fetch('/api/auth/smtp-status');
    if (!res.ok) throw new Error('Status endpoint unavailable');
    return await res.json();
  } catch {
    return { configured: false, user: null, host: 'smtp.gmail.com' };
  }
}

// Send verification email via backend
async function sendEmailRequest(to: string, name: string | undefined, code: string, type: 'verification' | 'password_reset') {
  try {
    const res = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, name, code, type }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to dispatch verification email');
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      delivered: false,
      code,
      error: err.message,
    };
  }
}

// Helper: Initialize auth store and clean up any demo accounts
export async function initAuthStore() {
  const users = getStoredUsers();
  // Ensure no hardcoded or demo admin remains
  const cleaned = users.filter(u => u.email.toLowerCase() !== 'admin@tunnelxray.io');
  if (cleaned.length !== users.length) {
    saveStoredUsers(cleaned);
  }
  try {
    const session = localStorage.getItem('tunnelxray_session_user');
    if (session && JSON.parse(session).email === 'admin@tunnelxray.io') {
      localStorage.removeItem('tunnelxray_session_user');
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch {}
}

function getStoredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: RegisteredUser[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

function getPendingOtp(): PendingOtp | null {
  try {
    const raw = sessionStorage.getItem(PENDING_OTP_KEY);
    if (!raw) return null;
    const otp: PendingOtp = JSON.parse(raw);
    if (Date.now() > otp.expiresAt) {
      sessionStorage.removeItem(PENDING_OTP_KEY);
      return null;
    }
    return otp;
  } catch {
    return null;
  }
}

function setPendingOtp(otp: PendingOtp) {
  try {
    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(otp));
  } catch (e) {
    console.error('Failed to save OTP to sessionStorage', e);
  }
}

export function clearPendingOtp() {
  try {
    sessionStorage.removeItem(PENDING_OTP_KEY);
  } catch {}
}

// Initiate registration
export async function initiateRegistration(
  fullName: string,
  email: string,
  password: string,
  role: string = 'Security Engineer'
): Promise<{ success: boolean; delivered: boolean; code?: string; message?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (existing && existing.verified) {
    return {
      success: false,
      delivered: false,
      error: 'An account with this email address already exists. Please sign in or reset your password.',
    };
  }

  const passwordHash = await hashPassword(password);
  const code = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  setPendingOtp({
    email: normalizedEmail,
    code,
    expiresAt,
    type: 'signup',
    payload: { fullName, passwordHash, role },
  });

  const emailRes = await sendEmailRequest(normalizedEmail, fullName, code, 'verification');

  if (!emailRes.success || !emailRes.delivered) {
    clearPendingOtp();
    return {
      success: false,
      delivered: false,
      error: emailRes.error || 'Failed to dispatch verification email to your inbox. Please check your email configuration.',
    };
  }

  return {
    success: true,
    delivered: true,
    message: `A 6-digit cryptographic verification code has been dispatched to your email inbox: ${normalizedEmail}. Please check your inbox (and spam folder).`,
  };
}

// Verify registration OTP and create user
export async function verifyRegistrationOtp(
  email: string,
  code: string
): Promise<{ success: boolean; user?: RegisteredUser; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const pending = getPendingOtp();

  if (!pending || pending.email !== normalizedEmail || pending.type !== 'signup') {
    return {
      success: false,
      error: 'No active registration verification session found. Please register again.',
    };
  }

  if (Date.now() > pending.expiresAt) {
    clearPendingOtp();
    return {
      success: false,
      error: 'Verification code has expired (valid for 10 minutes). Please request a new code.',
    };
  }

  if (pending.code !== code.trim()) {
    return {
      success: false,
      error: 'Incorrect 6-digit verification code. Please check and re-enter.',
    };
  }

  // Create or update verified user
  let users = getStoredUsers();
  users = users.filter(u => u.email.toLowerCase() !== normalizedEmail);

  const newUser: RegisteredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    fullName: pending.payload?.fullName || 'SOC Operative',
    role: pending.payload?.role || 'Security Analyst',
    passwordHash: pending.payload?.passwordHash || '',
    verified: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveStoredUsers(users);
  clearPendingOtp();

  // Save session
  setCurrentSession(newUser);

  return {
    success: true,
    user: newUser,
  };
}

// Resend OTP
export async function resendOtp(
  email: string
): Promise<{ success: boolean; delivered: boolean; code?: string; message?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const pending = getPendingOtp();

  if (!pending || pending.email !== normalizedEmail) {
    return {
      success: false,
      delivered: false,
      error: 'No active verification session found. Please restart the process.',
    };
  }

  const newCode = generateOtp();
  pending.code = newCode;
  pending.expiresAt = Date.now() + 10 * 60 * 1000;
  setPendingOtp(pending);

  const emailRes = await sendEmailRequest(
    normalizedEmail,
    pending.payload?.fullName,
    newCode,
    pending.type === 'signup' ? 'verification' : 'password_reset'
  );

  if (!emailRes.success || !emailRes.delivered) {
    return {
      success: false,
      delivered: false,
      error: emailRes.error || 'Failed to resend verification email. Please try again.',
    };
  }

  return {
    success: true,
    delivered: true,
    message: `A fresh 6-digit verification code has been dispatched to your email inbox: ${normalizedEmail}.`,
  };
}

// Login
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: RegisteredUser; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return {
      success: false,
      error: 'No account registered with this email address. Please create an account.',
    };
  }

  const hash = await hashPassword(password);
  if (user.passwordHash !== hash) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your credentials or use Forgot Password.',
    };
  }

  if (!user.verified) {
    return {
      success: false,
      error: 'Account email has not been verified yet.',
    };
  }

  setCurrentSession(user);
  return {
    success: true,
    user,
  };
}

// Initiate Password Reset
export async function initiatePasswordReset(
  email: string
): Promise<{ success: boolean; delivered: boolean; code?: string; message?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return {
      success: false,
      delivered: false,
      error: 'No account found with this email address.',
    };
  }

  const code = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  setPendingOtp({
    email: normalizedEmail,
    code,
    expiresAt,
    type: 'reset',
    payload: { fullName: user.fullName },
  });

  const emailRes = await sendEmailRequest(normalizedEmail, user.fullName, code, 'password_reset');

  if (!emailRes.success || !emailRes.delivered) {
    clearPendingOtp();
    return {
      success: false,
      delivered: false,
      error: emailRes.error || 'Failed to dispatch password recovery email. Please try again.',
    };
  }

  return {
    success: true,
    delivered: true,
    message: `A password recovery code has been dispatched to your email inbox: ${normalizedEmail}.`,
  };
}

// Complete Password Reset
export async function completePasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const pending = getPendingOtp();

  if (!pending || pending.email !== normalizedEmail || pending.type !== 'reset') {
    return {
      success: false,
      error: 'No active password reset session found.',
    };
  }

  if (Date.now() > pending.expiresAt) {
    clearPendingOtp();
    return {
      success: false,
      error: 'Password reset code has expired. Please request a new code.',
    };
  }

  if (pending.code !== code.trim()) {
    return {
      success: false,
      error: 'Invalid verification code. Please check your email and try again.',
    };
  }

  const newHash = await hashPassword(newPassword);
  let users = getStoredUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);

  if (userIndex === -1) {
    return {
      success: false,
      error: 'User account not found.',
    };
  }

  users[userIndex].passwordHash = newHash;
  saveStoredUsers(users);
  clearPendingOtp();

  return {
    success: true,
  };
}

// Session Management
export function getCurrentSession(): RegisteredUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentSession(user: RegisteredUser) {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to set current session', e);
  }
}

export function logout() {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } catch {}
}
