import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Shield, Mail } from 'lucide-react';

export default function AdminCredsSuccessModal({
  isOpen,
  onClose,
  generatedCreds,
  showToast,
  onShare,
  onGoToVendorList
}) {
  return (
    <AnimatePresence>
      {isOpen && generatedCreds && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-center my-8"
          >
            {/* Checkmark Icon Header */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-[#02182e]">Vendor Credentials Created!</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                The account for <span className="font-bold text-slate-800">{generatedCreds.name}</span> is now active and ready for dispatch.
              </p>
            </div>

            {/* Copyable Fields */}
            <div className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Vendor ID (Login Email)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={generatedCreds.id}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCreds.id);
                      showToast('Vendor ID copied to clipboard!');
                    }}
                    className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Temporary Password (Backend-Generated)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={generatedCreds.tempPassword}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCreds.tempPassword);
                      showToast('Password copied!');
                    }}
                    className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Alert Box */}
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-left flex items-start gap-3">
              <Shield className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                Security: This password is shown only once. Share it with the vendor immediately. It expires in 24 hours.
              </p>
            </div>

            {/* Modal Buttons */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={onShare}
                className="py-3 bg-[#02182e] hover:bg-[#082848] text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" /> Share via Email
              </button>
              <button
                onClick={onGoToVendorList}
                className="py-3 border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Go to Vendor List
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
