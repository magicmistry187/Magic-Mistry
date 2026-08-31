import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, AlertCircle, X } from 'lucide-react';

export default function VendorPayoutModal({
  showPayoutModal,
  setShowPayoutModal,
  todayEarnings,
  payoutDays,
  setPayoutDays,
  payoutNotes,
  setPayoutNotes,
  handleConfirmPayout
}) {
  return (
    <AnimatePresence>
      {showPayoutModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                Request Payout
              </h3>
              <button onClick={() => setShowPayoutModal(false)} className="p-2 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors border border-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 font-medium">Payouts are processed within 1-2 business days. Minimum payout amount is ₹500.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Available Balance (₹)</label>
                <input type="text" readOnly value={`₹${(Number(todayEarnings) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Days of Work</label>
                <input type="number" value={payoutDays} onChange={e => setPayoutDays(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g., 5" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Additional Notes</label>
                <textarea value={payoutNotes} onChange={e => setPayoutNotes(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24" placeholder="Optional notes to admin..." />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setShowPayoutModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleConfirmPayout} className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md active:scale-95">Confirm Request</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
