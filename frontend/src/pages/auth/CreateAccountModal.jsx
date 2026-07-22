import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiArrowRight, FiX } from 'react-icons/fi';
// import { Link } from 'react-router-dom'; // You can remove this if no longer used elsewhere in this file
import OTPVerificationModal from './OTPVerificationModal';

export default function CreateAccountModal({ isOpen = true, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isOTPVisible, setIsOTPVisible] = useState(false); // 1. Added OTP visibility state
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (!nameRegex.test(formData.fullName)) {
      newErrors.fullName = 'Please enter a valid full name (letters only, min 3 chars).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-15 digit phone number.';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 chars, 1 uppercase, 1 number, and 1 special character.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // 2. Trigger the OTP modal upon successful validation
      setIsOTPVisible(true); 
    }
  };

  if (!isOpen) return null;

  // 3. Conditionally render the OTP Verification Modal instead of the form
  if (isOTPVisible) {
    return (
      <OTPVerificationModal 
        phoneNumber={formData.phone} 
        onClose={onClose} 
      />
    );
  }

  return (
    <AnimatePresence>
      <div className=" ">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-slate-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Close modal"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 pt-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1A30] tracking-tight">
                Create Account
              </h2>
              <p className="text-slate-500 mt-2 text-xs sm:text-sm font-normal px-2">
                Join the community of trusted electronics pros.
              </p>
            </div>

            {/* Google Sign Up Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              className="w-full py-2.5 sm:py-3 px-4 flex items-center justify-center gap-3 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Sign up with Google</span>
            </motion.button>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative z-10 bg-white px-3 text-xs font-semibold text-slate-400 tracking-wider">
                OR
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2.5 sm:py-3 bg-slate-50/80 border rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.fullName
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full px-4 py-2.5 sm:py-3 bg-slate-50/80 border rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.email
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-4 py-2.5 sm:py-3 bg-slate-50/80 border rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.phone
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 sm:py-3 pr-11 bg-slate-50/80 border rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.password
                        ? 'border-red-400 focus:ring-red-400/20'
                        : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.password}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:grid sm:grid-cols-5 gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="w-full sm:col-span-2 py-3 px-4 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </motion.button>
                
                {/* 4. Removed the Link tag so this acts as a proper form submit button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full sm:col-span-3 py-3 px-4 bg-[#FF6A00] hover:bg-[#e55f00] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  <span>Create Account</span>
                  <FiArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <a
                  href="/frontend/src/pages/auth/LoginPage.jsx"
                  className="font-bold text-[#0B1A30] hover:underline"
                >
                  Login
                </a>
              </p>

              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                By signing up, you agree to our{' '}
                <a href="#terms" className="underline hover:text-slate-600">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="underline hover:text-slate-600">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}