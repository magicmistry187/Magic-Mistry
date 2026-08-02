import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FiRefreshCcw } from 'react-icons/fi';
import {
  Mail, ShieldCheck, KeyRound, Eye, EyeOff,
  CheckCircle2, ArrowLeft, Loader2, Lock,
} from 'lucide-react';
import { sendOtp } from '../../services/api';

/* ─────────────────────────────────────────────────────────
   Password-strength helper
───────────────────────────────────────────────────────── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[@$!%*?&]/.test(pw)) score++;
  const map = [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
  ];
  return { score, ...map[score] };
}

/* ─────────────────────────────────────────────────────────
   Shared page-level animation variants
───────────────────────────────────────────────────────── */
const stepVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0,  transition: { duration: 0.35, ease: 'easeOut' } },
  exit:   { opacity: 0, x: -40, transition: { duration: 0.25, ease: 'easeIn' } },
};

/* ─────────────────────────────────────────────────────────
   STEP 1 — Enter Email
───────────────────────────────────────────────────────── */
function StepEmail({ onNext }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return 'Email address is required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    const res = await sendOtp(email.trim());
    setLoading(false);
    if (res.success) {
      onNext(email.trim());
    } else {
      setError(`${res.message}` || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <motion.div
      key="step-email"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full"
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
          <Mail className="w-8 h-8 text-[#0a192f]" />
        </div>
      </div>

      <h1 className="text-[26px] font-bold text-[#0a192f] text-center tracking-tight mb-1">
        Forgot Your Password?
      </h1>
      <p className="text-gray-500 text-[14px] text-center leading-relaxed mb-7 px-2">
        Enter your registered email address and we'll send you a one-time verification code.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fp-email" className="text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <input
            id="fp-email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="name@company.com"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                : 'border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200'
            }`}
          />
          <AnimatePresence>
            {error && (
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-medium text-red-500 mt-0.5"
              >
                {error}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-[#0a192f] text-white font-semibold text-sm py-3 rounded-lg hover:bg-[#122849] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Send Verification Code
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 2 — Verify OTP
───────────────────────────────────────────────────────── */
function StepOTP({ email, onNext, onBack }) {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e, idx) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError('');
    setResendMsg('');
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text/plain').slice(0, 6);
    if (!/^\d+$/.test(data)) return;
    const next = [...otp];
    for (let i = 0; i < data.length; i++) next[i] = data[i];
    setOtp(next);
    const focusIdx = Math.min(data.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // For this frontend-only flow we verify locally —
  // a real backend would expose POST /auth/verifyOtp
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      triggerShake();
      return;
    }
    setVerifying(true);
    setError('');
    // Simulate a short network round-trip (replace with real API call when backend is ready)
    await new Promise((r) => setTimeout(r, 900));
    setVerifying(false);
    // On success, advance. On failure, shake + show error.
    onNext(code);
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg('');
    setError('');
    const res = await sendOtp(email);
    setResending(false);
    if (res.success) {
      setResendMsg('A new code has been sent to your inbox.');
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } else {
      setError(res.message || 'Failed to resend code.');
    }
  };

  return (
    <motion.div
      key="step-otp"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full"
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-8 h-8 text-[#b86118]" />
        </div>
      </div>

      <h2 className="text-[24px] font-bold text-[#0a192f] text-center tracking-tight mb-1">
        Check Your Email
      </h2>
      <p className="text-gray-500 text-[13.5px] text-center leading-relaxed mb-1 px-2">
        We sent a 6-digit code to
      </p>
      <p className="text-[#0a192f] font-bold text-sm text-center mb-6 truncate px-4">
        {email}
      </p>

      {/* Feedback banners */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium text-center"
          >
            {error}
          </motion.div>
        )}
        {resendMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium text-center"
          >
            {resendMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP inputs */}
      <motion.div
        className="flex gap-2 sm:gap-3 justify-center mb-7"
        animate={shake ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.45 }}
      >
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all bg-slate-50 focus:bg-white shadow-sm ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                : digit
                ? 'border-[#0a192f] bg-white'
                : 'border-gray-200 focus:border-[#0a192f] focus:ring-1 focus:ring-[#0a192f]/20'
            }`}
          />
        ))}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVerify}
        disabled={verifying}
        className="w-full bg-[#0a192f] text-white font-semibold text-sm py-3 rounded-lg hover:bg-[#122849] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {verifying ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Verify Code
          </>
        )}
      </motion.button>

      <div className="flex flex-col items-center gap-2.5 mt-5">
        <button
          onClick={handleResend}
          disabled={resending}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#b86118] hover:text-[#914b10] transition-colors disabled:opacity-50"
        >
          <FiRefreshCcw size={13} className={resending ? 'animate-spin' : ''} />
          {resending ? 'Resending…' : 'Resend Code'}
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Change email address
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 3 — Set New Password
───────────────────────────────────────────────────────── */
function StepNewPassword({ email, otp, onSuccess }) {
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  const strength = getPasswordStrength(password);

  const validate = () => {
    const e = {};
    const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password)      e.password = 'New password is required.';
    else if (!re.test(password))
      e.password = 'Min 8 chars, 1 uppercase, 1 number, 1 special character.';
    if (!confirm)       e.confirm = 'Please confirm your password.';
    else if (password !== confirm)
      e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    // ── Placeholder: replace with real API call when backend exposes
    //    POST /auth/resetPassword  { email, otp, newPassword }
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    onSuccess();
  };

  return (
    <motion.div
      key="step-newpw"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full"
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm">
          <KeyRound className="w-8 h-8 text-violet-700" />
        </div>
      </div>

      <h2 className="text-[24px] font-bold text-[#0a192f] text-center tracking-tight mb-1">
        Set New Password
      </h2>
      <p className="text-gray-500 text-[13.5px] text-center leading-relaxed mb-6 px-2">
        Choose a strong password to secure your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* New password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type={showPw ? 'text' : 'password'}
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              placeholder="Min 8 chars, uppercase, number, symbol"
              className={`w-full border rounded-lg pl-9 pr-10 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 ${
                errors.password
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                  : 'border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {password && (
            <div className="mt-1 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      strength.score >= n ? strength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[11px] font-bold ${
                strength.score <= 1 ? 'text-red-500'
                : strength.score === 2 ? 'text-amber-500'
                : strength.score === 3 ? 'text-blue-600'
                : 'text-emerald-600'
              }`}>
                {strength.label} password
              </p>
            </div>
          )}

          <AnimatePresence>
            {errors.password && (
              <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-xs font-medium text-red-500">
                {errors.password}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type={showCf ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }}
              placeholder="Re-enter your new password"
              className={`w-full border rounded-lg pl-9 pr-10 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 ${
                errors.confirm
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                  : confirm && confirm === password
                  ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200'
                  : 'border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCf((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Match indicator */}
          {confirm && confirm === password && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Passwords match
            </motion.p>
          )}
          <AnimatePresence>
            {errors.confirm && (
              <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-xs font-medium text-red-500">
                {errors.confirm}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-[#b86118] to-amber-600 hover:from-[#914b10] hover:to-amber-700 text-white font-semibold text-sm py-3 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              Reset Password
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 4 — Success
───────────────────────────────────────────────────────── */
function StepSuccess() {
  const navigate = useNavigate();

  return (
    <motion.div
      key="step-success"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full flex flex-col items-center text-center"
    >
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center mb-6 shadow-lg"
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-[24px] font-bold text-[#0a192f] tracking-tight mb-2"
      >
        Password Reset! 🎉
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-gray-500 text-[13.5px] leading-relaxed mb-8 px-2 max-w-xs"
      >
        Your password has been successfully reset. You can now log in with your new password.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/login')}
        className="w-full bg-[#0a192f] text-white font-semibold text-sm py-3 rounded-lg hover:bg-[#122849] transition-colors shadow-sm"
      >
        Back to Login
      </motion.button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP INDICATOR (dots)
───────────────────────────────────────────────────────── */
function StepDots({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-7">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 h-2 bg-[#0a192f]'
              : i < current
              ? 'w-2 h-2 bg-[#0a192f]/40'
              : 'w-2 h-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]   = useState(0); // 0=email, 1=otp, 2=newpw, 3=success
  const [email, setEmail] = useState('');
  const [otp, setOtp]     = useState('');

  const stepLabels = ['Email', 'Verify', 'New Password', 'Done'];
  const showDots   = step < 3;

  return (
    <div className="min-h-screen w-full bg-[#f4f7f9] flex items-center justify-center p-4 sm:p-6 font-sans text-slate-800">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[420px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.07)] relative overflow-hidden flex flex-col"
      >
        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0a192f] via-orange-400 to-[#b86118]" />

        {/* Close / back to login */}
        <button
          onClick={() => navigate('/login')}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer z-10"
          aria-label="Back to login"
        >
          <IoClose size={24} />
        </button>

        <div className="p-8 pb-10">
          {/* Brand header */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Magic Mistry
            </span>
            <span className="text-gray-200">›</span>
            <span className="text-xs font-bold text-[#b86118] uppercase tracking-wider">
              Account Recovery
            </span>
          </div>

          {/* Step progress dots (hidden on success) */}
          {showDots && <StepDots current={step} total={3} />}

          {/* Step content — AnimatePresence for cross-fade + slide transitions */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepEmail
                key="email"
                onNext={(e) => { setEmail(e); setStep(1); }}
              />
            )}
            {step === 1 && (
              <StepOTP
                key="otp"
                email={email}
                onNext={(code) => { setOtp(code); setStep(2); }}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <StepNewPassword
                key="newpw"
                email={email}
                otp={otp}
                onSuccess={() => setStep(3)}
              />
            )}
            {step === 3 && <StepSuccess key="success" />}
          </AnimatePresence>

          {/* Footer — login link (hidden on success step) */}
          {step < 3 && (
            <div className="text-center mt-7 text-[14px] text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-[#b86118] font-semibold hover:underline transition-all">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
