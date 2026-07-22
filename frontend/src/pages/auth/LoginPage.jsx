import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";

const WelcomeModal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    // Email Validation
    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password Validation
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    // Run client-side validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Mock Authentication Check
    // (Replace this with your actual API/Backend call)
    const MOCK_CORRECT_PASSWORD = "Password123!";
    
    if (password !== MOCK_CORRECT_PASSWORD) {
      setErrors({ password: "Password does not match our records." });
      return;
    }

    // Success state
    console.log("Authentication Successful!", { email });
    alert("Login successful!");
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f7f9] flex items-center justify-center p-4 sm:p-6 font-sans text-slate-800 ">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden flex flex-col"
      >
        {/* Decorative Bottom Gradient Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0a192f] via-orange-400 to-[#b86118]" />

        {/* Close Button */}
        <button 
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <IoClose size={24} />
        </button>

        <div className="p-8 pb-10">
          {/* Header Section */}
          <div className="text-center mb-8 mt-2">
            <h1 className="text-[28px] font-bold text-[#0a192f] tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-[15px] leading-relaxed px-2">
              Sign in to manage your repairs and service history.
            </p>
          </div>

          {/* Google Single Sign-On Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FcGoogle size={20} />
            Continue with Google
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
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
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
                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200" 
                    : "border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                }`}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.span
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 4 }}
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
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <a href="#" className="text-[13px] font-bold text-[#b86118] hover:text-[#914b10] transition-colors">
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-300 tracking-[0.2em] font-mono ${
                  errors.password 
                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200" 
                    : "border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                }`}
              />
              <AnimatePresence>
                {errors.password && (
                  <motion.span
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 4 }}
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
                className="flex-1 bg-[#0a192f] text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-[#122849] transition-colors shadow-sm"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => {
                  setEmail("");
                  setPassword("");
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
            Don't have an account?{" "}
            <a href="#" className="text-[#b86118] font-semibold hover:underline transition-all">
              Sign Up
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeModal;