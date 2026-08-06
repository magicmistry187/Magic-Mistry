import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { IoClose } from 'react-icons/io5';
import { Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { loginUser, googleLogin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const WelcomeModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const from = location.state?.from || '/';
  const reason = location.state?.reason || (from === '/booking' ? 'A user cannot make a booking until they log in.' : null);

  const validate = () => {
    const newErrors = {};

    // Email Validation
    if (!email) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
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

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    const res = await loginUser(email, password);
    setIsLoading(false);

    if (res.success) {
      login(res.user, res.token);
      navigate(from, { replace: true });
    } else {
      setErrors({ password: res.message || 'Invalid email or password.' });
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleLoading(true);
        const response = await googleLogin(tokenResponse.access_token);

        if (response.success) {
          login(response.user, response.token);
          navigate(from, { replace: true });
        } else {
          setErrors({ password: response.message || 'Google login failed. Please try again.' });
        }
      } catch (err) {
        console.error('Google Login Error:', err);
        setErrors({ password: 'Google login failed. Please try again.' });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setErrors({ password: 'Google login was cancelled or failed.' });
    },
  });

  return (
    <div className="min-h-screen w-full bg-[#f4f7f9] flex items-center justify-center p-4 sm:p-6 font-sans text-slate-800 ">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[420px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden flex flex-col"
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
          <div className="text-center mb-6 mt-2">
            <h1 className="text-[28px] font-bold text-[#0a192f] tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-[15px] leading-relaxed px-2">
              Sign in to manage your repairs and service history.
            </p>
          </div>

          {/* Reason Notice Banner */}
          {reason && (
            <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <span className="text-base shrink-0">🔒</span>
              <span>{reason}</span>
            </div>
          )}

         

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

          {/* Or Divider */}
          <div className="flex items-center justify-center gap-4 my-7">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-[11px] font-bold text-gray-400 tracking-wider">
              OR
            </span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
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
                <Link
                  to="/forgot-password"
                  className="text-[13px] font-bold text-[#b86118] hover:text-[#914b10] transition-colors"
                >
                  Forgot Password?
                </Link>
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
                {/* Show / Hide password toggle */}
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
                className="flex-1 bg-[#0a192f] text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-[#122849] transition-colors shadow-sm flex items-center justify-center disabled:opacity-60"
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
                  'Login'
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => {
                  setEmail('');
                  setPassword('');
                  setErrors({});
                }}
                className="flex-1 bg-white border border-gray-300 text-[#0a192f] font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </motion.button>
            </div>
          </form>

          {/* Footer Section */}
          <div className="text-center mt-8 text-[14.5px] text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[#b86118] font-semibold hover:underline transition-all"
            >
              Sign Up
            </Link>
          </div>


        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeModal;
