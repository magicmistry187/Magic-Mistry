import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiRefreshCcw, FiArrowRight } from "react-icons/fi";
import { HiShieldCheck, HiCheckCircle } from "react-icons/hi2";

export default function OTPVerificationModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const inputRefs = useRef([]);

  // Auto-focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are inputted
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setHasError(false);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move focus to the previous input on backspace if current is empty
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    // Focus on the next logical empty box or the last one
    const nextIndex = pasteData.length < 6 ? pasteData.length : 5;
    inputRefs.current[nextIndex].focus();
  };

  const verifyOtp = () => {
    // Check if fully entered
    if (otp.join("").length !== 6) {
      setHasError(true);
      return;
    }

    setIsVerifying(true);
    setHasError(false);

    // Simulate API verification call (1.5 seconds)
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 1500);
  };

  // If the modal is closed, render nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        className="relative w-full max-w-md bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl p-8"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <FiX size={24} />
        </button>

        <AnimatePresence mode="wait">
          {!isVerified ? (
            <motion.div
              key="verify-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon Container */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="flex items-center justify-center w-16 h-16 bg-blue-100 text-slate-800 rounded-full mb-6"
              >
                <HiShieldCheck size={32} />
              </motion.div>

              {/* Text Content */}
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Verify Your Number
              </h2>
              <p className="text-slate-500 mb-1">
                We've sent a 6-digit code to
              </p>
              <p className="font-medium text-slate-800 mb-8">
                +1 (555) 000-0000
              </p>

              {/* OTP Inputs */}
              <motion.div 
                className="flex gap-2 md:gap-3 mb-8 w-full justify-center"
                animate={hasError ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className={`w-11 h-14 md:w-12 md:h-14 text-center text-xl font-bold rounded-xl border ${
                      hasError ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-800 focus:ring-slate-800'
                    } focus:outline-none focus:ring-1 transition-all bg-slate-50 focus:bg-white shadow-sm`}
                  />
                ))}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={verifyOtp}
                disabled={isVerifying}
                className="w-full py-3.5 bg-[#f97316] hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center h-14"
              >
                {isVerifying ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  "Verify & Proceed"
                )}
              </motion.button>

              {/* Footer Links */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <button className="flex items-center gap-2 text-slate-800 font-semibold text-sm hover:text-slate-600 transition-colors">
                  <FiRefreshCcw size={16} />
                  Resend Code
                </button>
                <button className="text-slate-500 font-medium text-sm hover:text-slate-700 transition-colors">
                  Change Phone Number
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center py-4"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                className="flex items-center justify-center w-16 h-16 bg-blue-100 text-slate-800 rounded-full mb-6"
              >
                <HiCheckCircle size={36} />
              </motion.div>

              {/* Success Content */}
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                Welcome to FixIt Pro!
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-8 px-2">
                Your account has been successfully created. You're now ready to
                book your first professional repair.
              </p>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 bg-[#f97316] hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 h-14"
              >
                Go to login page
                <motion.div
                   initial={{ x: 0 }}
                   animate={{ x: [0, 5, 0] }}
                   transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <FiArrowRight size={18} />
                </motion.div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}