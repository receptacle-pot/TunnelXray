import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User,
  KeyRound,
  LogOut,
  Activity,
  RefreshCw,
  Clock,
  Send,
  Check
} from 'lucide-react';
import './LoginCard.css';
import { TunnelXrayLogo } from './TunnelXrayLogo';
import {
  initAuthStore,
  login,
  initiateRegistration,
  verifyRegistrationOtp,
  resendOtp,
  initiatePasswordReset,
  completePasswordReset,
  getCurrentSession,
  logout as storeLogout,
  RegisteredUser,
} from '../services/authStore';

type AuthView = 'signin' | 'signup' | 'verify-otp' | 'forgot' | 'reset-password';

export interface UserProfile {
  name: string;
  email: string;
  provider: 'email' | 'google' | 'github';
  avatar?: string;
  role: string;
  sessionStartedAt: string;
}

export interface LoginCardProps {
  onLoginSuccess?: (user: UserProfile) => void;
}

export function LoginCard({ onLoginSuccess }: LoginCardProps = {}) {
  const [view, setView] = useState<AuthView>('signin');
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP Verification states
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiryCountdown, setExpiryCountdown] = useState(600); // 10 minutes (in seconds)

  // Reset Password states
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initial load
  useEffect(() => {
    initAuthStore();

    // Check if user returned from real OAuth redirect callback
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauth_error');
    if (oauthError) {
      setErrorMsg(`OAuth authentication error: ${oauthError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (params.get('oauth_success') === '1') {
      const oauthEmail = params.get('email');
      const oauthName = params.get('name') || oauthEmail?.split('@')[0] || 'Authenticated User';
      const provider = (params.get('provider') || 'google') as 'google' | 'github';

      if (oauthEmail) {
        window.history.replaceState({}, document.title, window.location.pathname);
        const profile: UserProfile = {
          name: oauthName,
          email: oauthEmail,
          provider,
          role: 'SecOps Analyst',
          sessionStartedAt: new Date().toLocaleTimeString(),
        };
        localStorage.setItem('tunnelxray_session_user', JSON.stringify(profile));
        setCurrentUser({
          id: `usr_${provider}_${Date.now()}`,
          email: oauthEmail,
          fullName: oauthName,
          role: 'SecOps Analyst',
          passwordHash: '',
          verified: true,
          createdAt: new Date().toISOString(),
        });
        onLoginSuccess?.(profile);
        return;
      }
    }

    const active = getCurrentSession();
    if (active) {
      setCurrentUser(active);
    }
  }, []);

  // Timers for OTP
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let timer: any;
    if (view === 'verify-otp' && expiryCountdown > 0) {
      timer = setInterval(() => {
        setExpiryCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, expiryCountdown]);

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchView = (newView: AuthView) => {
    clearMessages();
    setView(newView);
    if (newView === 'verify-otp') {
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);

  // OTP digit input handlers
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const copy = [...otpDigits];
      copy[index] = '';
      setOtpDigits(copy);
      return;
    }

    // Handle single character
    const copy = [...otpDigits];
    copy[index] = cleaned[cleaned.length - 1];
    setOtpDigits(copy);

    // Auto-advance to next box
    if (index < 5 && cleaned.length > 0) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const copy = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      copy[i] = pasted[i] || '';
    }
    setOtpDigits(copy);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Authenticating cryptographic credentials...');

    try {
      const result = await login(email, password);
      if (!result.success || !result.user) {
        setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
        setIsLoading(false);
        return;
      }

      setCurrentUser(result.user);
      setSuccessMsg('Authentication successful.');
      setIsLoading(false);

      const profile: UserProfile = {
        name: result.user.fullName,
        email: result.user.email,
        provider: 'email',
        role: result.user.role,
        sessionStartedAt: new Date().toLocaleTimeString(),
      };
      if (rememberMe) {
        localStorage.setItem('tunnelxray_session_user', JSON.stringify(profile));
      }
      onLoginSuccess?.(profile);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'System error during login');
    }
  };

  // Handle Account Registration (Triggers Email OTP)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please accept the Security Policy & Terms of Service.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Generating 6-digit verification code...');

    try {
      const result = await initiateRegistration(name, email, password);
      setIsLoading(false);

      if (!result.success) {
        setErrorMsg(result.error || 'Registration failed');
        return;
      }

      setSuccessMsg(`Verification code dispatched to ${email}. Please check your email inbox!`);

      setResendCooldown(60);
      setExpiryCountdown(600);
      setView('verify-otp');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error initiating registration');
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Verifying cryptographic token...');

    try {
      const result = await verifyRegistrationOtp(email, fullCode);
      setIsLoading(false);

      if (!result.success || !result.user) {
        setErrorMsg(result.error || 'Verification code failed. Please check code.');
        return;
      }

      setCurrentUser(result.user);
      setSuccessMsg('Account verified successfully! Welcome to TunnelXray SOC.');

      const profile: UserProfile = {
        name: result.user.fullName,
        email: result.user.email,
        provider: 'email',
        role: result.user.role,
        sessionStartedAt: new Date().toLocaleTimeString(),
      };
      localStorage.setItem('tunnelxray_session_user', JSON.stringify(profile));
      onLoginSuccess?.(profile);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error during verification');
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    clearMessages();
    setIsLoading(true);
    setLoadingText('Generating fresh security token...');

    try {
      const result = await resendOtp(email);
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.error || 'Failed to resend code');
        return;
      }

      setSuccessMsg(`A fresh verification code has been dispatched to ${email}. Please check your inbox.`);

      setResendCooldown(60);
      setExpiryCountdown(600);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error sending code');
    }
  };

  // Handle Forgot Password Initiation
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Looking up account and dispatching reset code...');

    try {
      const result = await initiatePasswordReset(email);
      setIsLoading(false);

      if (!result.success) {
        setErrorMsg(result.error || 'Account not found.');
        return;
      }

      setSuccessMsg(`Password reset code dispatched to ${email}. Please check your email inbox.`);

      setView('reset-password');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error requesting password reset');
    }
  };

  // Handle Complete Password Reset
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!resetOtp || !newPassword || !confirmNewPassword) {
      setErrorMsg('Please complete all reset fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Updating cryptographic credentials...');

    try {
      const result = await completePasswordReset(email, resetOtp, newPassword);
      setIsLoading(false);

      if (!result.success) {
        setErrorMsg(result.error || 'Password reset failed. Invalid or expired code.');
        return;
      }

      setSuccessMsg('Password successfully updated! You can now sign in with your new credentials.');
      setPassword('');
      setResetOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setView('signin');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error completing password reset');
    }
  };

  // Logout
  const handleLogout = () => {
    storeLogout();
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setView('signin');
  };

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // RENDER: Authenticated Dashboard HUD
  // ==========================================
  if (currentUser) {
    return (
      <div className="login-card-container">
        <div className="login-glass-card authenticated-card">
          <div className="card-ambient-glow" />

          <div className="auth-status-badge">
            <span className="live-indicator-dot" />
            <span>IPsec Session Active • Node #09</span>
          </div>

          <div className="auth-profile-header">
            <div className="auth-avatar">
              <ShieldCheck size={28} />
            </div>
            <h2 className="auth-user-name">{currentUser.fullName}</h2>
            <p className="auth-user-email">{currentUser.email}</p>
            <span className="auth-user-role">{currentUser.role}</span>
          </div>

          <div className="auth-metrics-box">
            <div className="metric-cell">
              <span className="metric-label">Status</span>
              <span className="metric-val text-green">Online</span>
            </div>
            <div className="metric-cell">
              <span className="metric-label">Account</span>
              <span className="metric-val text-green">Verified</span>
            </div>
            <div className="metric-cell">
              <span className="metric-label">Registered</span>
              <span className="metric-val">
                {new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="auth-actions-group">
            <button
              type="button"
              className="action-btn-primary"
              onClick={() => alert(`Active session validated for ${currentUser.fullName}. Security protocols green.`)}
            >
              <Activity size={17} />
              <span>Launch Protocol Analyzer</span>
            </button>

            <button
              type="button"
              className="action-btn-secondary"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: Authentication Forms (Signin / Signup / OTP / Forgot / Reset)
  // ==========================================
  return (
    <div className="login-card-container">
      <div className="login-glass-card">
        <div className="card-ambient-glow" />

        {/* Card Header */}
        <div className="login-header">
          <div className="login-badge-icon">
            <TunnelXrayLogo size={22} />
          </div>
          <h1 className="login-title">TunnelXray</h1>
          <p className="login-subtitle">
            AI-Powered IPsec Protocol Analyzer &amp; Security Assessment Framework
          </p>
        </div>

        {/* Navigation Tabs between Sign In & Sign Up */}
        {view !== 'forgot' && view !== 'reset-password' && view !== 'verify-otp' && (
          <div className="view-switch-nav">
            <button
              type="button"
              className={`view-tab ${view === 'signin' ? 'active' : ''}`}
              onClick={() => switchView('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`view-tab ${view === 'signup' ? 'active' : ''}`}
              onClick={() => switchView('signup')}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Notification Banners */}
        {errorMsg && (
          <div className="login-alert-banner error">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="login-alert-banner success">
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ==================== SIGN IN VIEW ==================== */}
        {view === 'signin' && (
          <>
            <form onSubmit={handleSignIn} className="login-form">
              <div className="input-group">
                <label htmlFor="signin-email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={15} />
                  <input
                    id="signin-email"
                    type="email"
                    required
                    placeholder="analyst@tunnelxray.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="signin-password">Password</label>
                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => switchView('forgot')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={17} />
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="options-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-custom" />
                  <span>Remember this device</span>
                </label>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="spinner-wrap">
                    <span className="spinner" />
                    <span>{loadingText}</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In to TunnelXray</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="login-footer">
              Don't have an account?{' '}
              <button
                type="button"
                className="link-switch"
                onClick={() => switchView('signup')}
              >
                Create an account
              </button>
            </p>
          </>
        )}

        {/* ==================== SIGN UP VIEW ==================== */}
        {view === 'signup' && (
          <>
            <form onSubmit={handleSignUp} className="login-form">
              <div className="input-group">
                <label htmlFor="signup-name">Full Name / Security ID</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={17} />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="Sarah Connor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="signup-email">Work Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={17} />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="sarah.c@security.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="signup-password">Master Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={17} />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password Strength Meter */}
                {password && (
                  <div className="password-strength-bar">
                    <div className="strength-indicators">
                      <div className={`strength-seg ${passwordStrength >= 1 ? 'active' : ''}`} />
                      <div className={`strength-seg ${passwordStrength >= 2 ? 'active' : ''}`} />
                      <div className={`strength-seg ${passwordStrength >= 3 ? 'active' : ''}`} />
                      <div className={`strength-seg ${passwordStrength >= 4 ? 'active' : ''}`} />
                    </div>
                    <span className="strength-label">
                      {passwordStrength <= 1 && 'Weak'}
                      {passwordStrength === 2 && 'Fair'}
                      {passwordStrength === 3 && 'Good'}
                      {passwordStrength >= 4 && 'Strong cryptographic key'}
                    </span>
                  </div>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="signup-confirm-password">Confirm Password</label>
                <div className="input-wrapper">
                  <KeyRound className="input-icon" size={17} />
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="options-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className="checkbox-custom" />
                  <span>I accept the IPsec Security Protocol &amp; Terms</span>
                </label>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="spinner-wrap">
                    <span className="spinner" />
                    <span>{loadingText}</span>
                  </span>
                ) : (
                  <>
                    <span>Send 6-Digit Verification Code</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="login-footer">
              Already registered?{' '}
              <button
                type="button"
                className="link-switch"
                onClick={() => switchView('signin')}
              >
                Sign in here
              </button>
            </p>
          </>
        )}

        {/* ==================== OTP VERIFICATION VIEW ==================== */}
        {view === 'verify-otp' && (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="otp-view-header">
              <div className="otp-icon-badge">
                <Send size={20} />
              </div>
              <h3 className="otp-title">Enter Verification Code</h3>
              <p className="otp-desc">
                We sent a 6-digit cryptographic security code to:
                <br />
                <strong>{email}</strong>
              </p>
            </div>


            {/* 6 Digit Inputs */}
            <div className="otp-inputs-grid">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="otp-digit-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Expiry & Resend Controls */}
            <div className="otp-meta-row">
              <div className="otp-expiry">
                <Clock size={13} />
                <span>Expires in {formatTime(expiryCountdown)}</span>
              </div>

              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
              >
                <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
                <span>
                  {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
                </span>
              </button>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner-wrap">
                  <span className="spinner" />
                  <span>{loadingText}</span>
                </span>
              ) : (
                <>
                  <Check size={17} />
                  <span>Verify &amp; Activate Account</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => switchView('signup')}
            >
              <ArrowLeft size={15} />
              <span>Change email / Back</span>
            </button>
          </form>
        )}

        {/* ==================== FORGOT PASSWORD VIEW ==================== */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="login-form">
            <p className="forgot-instruction">
              Enter your registered account email. We will generate and dispatch a 6-digit recovery code to verify your identity.
            </p>

            <div className="input-group">
              <label htmlFor="forgot-email">Account Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={17} />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="analyst@tunnelxray.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner-wrap">
                  <span className="spinner" />
                  <span>{loadingText}</span>
                </span>
              ) : (
                <>
                  <span>Send Recovery Code</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => switchView('signin')}
            >
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* ==================== RESET PASSWORD VIEW ==================== */}
        {view === 'reset-password' && (
          <form onSubmit={handleCompleteReset} className="login-form">
            <p className="forgot-instruction">
              Enter the 6-digit code sent to <strong>{email}</strong> along with your new password.
            </p>


            <div className="input-group">
              <label htmlFor="reset-code">6-Digit Recovery Code</label>
              <div className="input-wrapper">
                <KeyRound className="input-icon" size={17} />
                <input
                  id="reset-code"
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  style={{ letterSpacing: '4px', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="new-password">New Master Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={17} />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirm-new-password">Confirm New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={17} />
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner-wrap">
                  <span className="spinner" />
                  <span>{loadingText}</span>
                </span>
              ) : (
                <>
                  <span>Save New Password &amp; Sign In</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => switchView('signin')}
            >
              <ArrowLeft size={15} />
              <span>Cancel</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
