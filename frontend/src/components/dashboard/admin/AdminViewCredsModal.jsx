import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, CheckCircle2, Mail, Lock, Copy, AlertTriangle } from 'lucide-react';

export default function AdminViewCredsModal({
  isOpen,
  onClose,
  viewingCreds,
  showToast
}) {
  return (
    <AnimatePresence>
      {isOpen && viewingCreds && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#02182e]">Vendor Credentials</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{viewingCreds.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Approved badge */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-800">Vendor is Approved — ID & password have been generated.</span>
            </div>

            {/* Copyable Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Vendor Login ID (Email)</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">{viewingCreds.id}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(viewingCreds.id);
                      showToast('Vendor ID copied!');
                    }}
                    className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Temporary Password</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-mono font-bold text-slate-800 truncate">{viewingCreds.tempPassword}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(viewingCreds.tempPassword);
                      showToast('Password copied!');
                    }}
                    className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Warning */}
            {/* <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                Ensure the vendor has changed their temporary password. If not, the password can be reset from the vendor portal.
              </p>
            </div> */}

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#02182e] hover:bg-[#082848] text-white font-extrabold text-xs rounded-xl shadow transition-colors cursor-pointer"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
