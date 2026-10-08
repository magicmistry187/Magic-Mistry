import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { IoClose } from 'react-icons/io5';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { loginUser, googleLogin, loginVendor } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CANONICAL_ADMIN_USER, CANONICAL_ADMIN_TOKEN, activateAdminSession } from '../../utils/adminAuth';

const WelcomeModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loginRole, setLoginRole] = useState(() => (
    location.state?.isAdminLogin ? 'admin' : location.state?.isVendorLogin ? 'vendor' : 'user'
  ));
  const isVendorLogin = loginRole === 'vendor';
  const isAdminLogin = loginRole === 'admin';

  const [email, setEmail] = useState(() => (location.state?.isAdminLogin ? 'magicmistry187@gmail.com' : ''));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleError, setGoogleError] = useState('');

  const from = location.state?.from || '/';
  const reason = location.state?.reason || (from === '/booking' ? 'A user cannot make a booking until they log in.' : null);

  const handleDirectAdminLogin = () => {
    activateAdminSession();
    login(CANONICAL_ADMIN_USER, CANONICAL_ADMIN_TOKEN);
    navigate('/admin-dashboard', { replace: true });
  };

  const handleRoleChange = (newRole) => {
    setLoginRole(newRole);
    setErrors({});
    setGoogleError('');
    if (newRole === 'admin') {
      setEmail('magicmistry187@gmail.com');
    } else {
      setEmail('');
    }
    setPassword('');
  };

  const validate = () => {
    const newErrors = {};

    // For Admin Portal, bypass strict validation to allow 1-click access
    if (isAdminLogin) {
      return newErrors;
    }

    // Email/ID Validation
    if (!email) {
      newErrors.email = isVendorLogin
        ? 'Vendor ID or Email is required.'
        : isAdminLogin
        ? 'Admin Email is required.'
        : 'Email address is required.';
    } else if (!isVendorLogin && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password Validation
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGoogleError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    let res;
    try {
      if (isAdminLogin) {
        // First try backend if credentials were supplied
        if (email && password) {
          try {
            res = await loginUser(email, password);
          } catch (_) {}
        }
        // If credentials worked or not, ensure super admin session is activated
        if (!res || !res.success) {
          res = {
            success: true,
            token: CANONICAL_ADMIN_TOKEN,
            user: CANONICAL_ADMIN_USER,
          };
        }
      } else if (isVendorLogin) {
        res = await loginVendor(email, password);
      } else {
        res = await loginUser(email, password);
      }
    } catch (err) {
      res = { success: false, message: err.message || 'Login connection failed.' };
    } finally {
      setIsLoading(false);
    }

    if (res && res.success) {
      const isAdmin = (res.user?.email && res.user.email.toLowerCase().trim() === 'magicmistry187@gmail.com') ||
                      (email && email.toLowerCase().trim() === 'magicmistry187@gmail.com') ||
                      isAdminLogin;
      if (isAdmin && res.user) {
        res.user.role = 'admin';
        activateAdminSession();
      }
      login(res.user, res.token);

      if (isAdmin || res.user?.role === 'admin' || isAdminLogin) {
        navigate('/admin-dashboard', { replace: true });
      } else if (res.user?.role === 'vendor' || isVendorLogin) {
        navigate('/vendor-dashboard', { replace: true });
      } else {
        const safeDestination = (from.startsWith('/admin') || from.startsWith('/vendor')) ? '/dashboard' : from;
        navigate(safeDestination, { replace: true });
      }
    } else {
      setErrors({ password: res?.message || 'Invalid email or password.' });
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleLoading(true);
        setGoogleError('');
        const response = await googleLogin(tokenResponse.access_token);

        if (response.success) {
          const isAdmin = (response.user?.email && response.user.email.toLowerCase().trim() === 'magicmistry187@gmail.com') || isAdminLogin;
          if (isAdmin && response.user) {
            response.user.role = 'admin';
          }
          login(response.user, response.token);

          if (isAdmin || response.user?.role === 'admin' || isAdminLogin) {
            navigate('/admin-dashboard', { replace: true });
          } else if (response.user?.role === 'vendor' || isVendorLogin) {
            navigate('/vendor-dashboard', { replace: true });
          } else {
            const safeDestination = (from.startsWith('/admin') || from.startsWith('/vendor')) ? '/dashboard' : from;
            navigate(safeDestination, { replace: true });
          }
        } else {
          setGoogleError(response.message || 'Google login failed. Please try again.');
        }
      } catch (err) {
        console.error('Google Login Error:', err);
        setGoogleError('Google login failed. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google Sign-In Error:', errorResponse);
      setGoogleError('Google login was cancelled or failed. Please check browser popups or try again.');
    },
  });

  return (
    <div className="min-h-screen w-full bg-[#f4f7f9] flex items-center justify-center p-4 sm:p-6 font-sans text-slate-800 ">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden flex flex-col"
      >
        {/* Decorative Bottom Gradient Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0a192f] via-orange-400 to-[#b86118]" />

        {/* Close Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <IoClose size={24} />
        </button>

        <div className="p-8 pb-10">
          {/* Header Section */}
          <div className="text-center mb-6 mt-2 min-h-[88px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={loginRole}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isAdminLogin && <ShieldCheck className="w-6 h-6 text-orange-600 inline" />}
                  <h1 className="text-[26px] font-bold text-[#0a192f] tracking-tight">
                    {isAdminLogin ? 'Admin Portal' : isVendorLogin ? 'Vendor Login' : 'Welcome Back'}
                  </h1>
                </div>
                <p className="text-gray-500 text-[14px] leading-relaxed px-2">
                  {isAdminLogin
                    ? 'Sign in to access Magic Mistry Admin Dashboard.'
                    : isVendorLogin
                    ? 'Sign in to access your vendor dashboard.'
                    : 'Sign in to manage your repairs and service history.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3 Tabs: Customer / Technician / Admin Portal */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6 relative">
            <button
              type="button"
              onClick={() => handleRoleChange('user')}
              className={`relative flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all z-10 ${
                loginRole === 'user'
                  ? 'text-[#0a192f]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Customer
              {loginRole === 'user' && (
                <motion.div
                  layoutId="activeLoginTab"
                  className="absolute inset-0 bg-white rounded-md shadow-[0_1px_3px_rgb(0,0,0,0.1)] -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('vendor')}
              className={`relative flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all z-10 ${
                loginRole === 'vendor'
                  ? 'text-[#0a192f]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Technician
              {loginRole === 'vendor' && (
                <motion.div
                  layoutId="activeLoginTab"
                  className="absolute inset-0 bg-white rounded-md shadow-[0_1px_3px_rgb(0,0,0,0.1)] -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`relative flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all z-10 ${
                loginRole === 'admin'
                  ? 'text-[#0a192f]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin Portal
              {loginRole === 'admin' && (
                <motion.div
                  layoutId="activeLoginTab"
                  className="absolute inset-0 bg-white rounded-md shadow-[0_1px_3px_rgb(0,0,0,0.1)] -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Reason Notice Banner */}
          <AnimatePresence>
            {reason && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2.5 shadow-sm overflow-hidden"
              >
                <span className="text-base shrink-0">🔒</span>
                <span>{reason}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Login for Customer & Admin */}
          <AnimatePresence>
            {!isVendorLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full"
                    />
                  ) : (
                    <>
                      <FcGoogle size={20} />
                      Continue with Google
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {googleError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium text-center"
                    >
                      {googleError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Or Divider */}
                <div className="flex items-center justify-center gap-4 my-6">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <span className="text-[11px] font-bold text-gray-400 tracking-wider">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Quick Admin Access Banner for Developers & Admins */}
            {isAdminLogin && (
              <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>One-Click Developer & Super Admin Access</span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  Direct root access as <strong>magicmistry187@gmail.com</strong>. Click below to bypass passwords and open the dashboard instantly.
                </p>
                <button
                  type="button"
                  onClick={handleDirectAdminLogin}
                  className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold rounded-lg shadow-sm transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
                >
                  <span>Instant Open Admin Dashboard</span>
                  <span>➔</span>
                </button>
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                {isVendorLogin ? 'Vendor ID or Email' : isAdminLogin ? 'Admin Email Address' : 'Email Address'}
              </label>
              <input
                type={isVendorLogin ? 'text' : 'email'}
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminLogin ? 'magicmistry187@gmail.com' : isVendorLogin ? 'Enter Vendor ID or Email' : 'name@company.com'}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                    : 'border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200'
                }`}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.span
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="text-xs font-medium text-red-500"
                  >
                    {errors.email}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                {!isVendorLogin && !isAdminLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-[13px] font-bold text-[#b86118] hover:text-[#914b10] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-4 pr-11 py-2.5 text-sm outline-none transition-all placeholder:text-gray-300 ${
                    showPassword ? '' : 'tracking-[0.2em] font-mono'
                  } ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                      : 'border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.span
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="text-xs font-medium text-red-500"
                  >
                    {errors.password}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#0a192f] text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-[#122849] transition-colors shadow-sm flex items-center justify-center disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: 'linear',
                    }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  isAdminLogin ? 'Enter Admin Panel' : 'Login'
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => {
                  if (isAdminLogin) {
                    setEmail('magicmistry187@gmail.com');
                  } else {
                    setEmail('');
                  }
                  setPassword('');
                  setErrors({});
                }}
                className="flex-1 bg-white border border-gray-300 text-[#0a192f] font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                Reset
              </motion.button>
            </div>
          </form>

          {/* Footer Section */}
          <div className="text-center mt-7 text-[14px] text-gray-600 min-h-[24px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={loginRole}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isAdminLogin ? (
                  <p className="text-xs text-slate-500">
                    Administrator access is restricted to verified personnel only.
                  </p>
                ) : !isVendorLogin ? (
                  <>
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-[#b86118] font-semibold hover:underline transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    Want to become a vendor?{' '}
                    <Link
                      to="/become-a-vendor"
                      className="text-[#b86118] font-semibold hover:underline transition-all"
                    >
                      Apply Here
                    </Link>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeModal;
