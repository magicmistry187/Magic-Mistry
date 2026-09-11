import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, AlertCircle, X, Wrench, Fuel, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function VendorPayoutModal({
  showPayoutModal,
  setShowPayoutModal,
  todayEarnings = 0,
  servicePayout = 0,
  fuelPayout = 0,
  totalDistanceKm = 0,
  componentCharges = 0,
  payoutDays,
  setPayoutDays,
  payoutNotes,
  setPayoutNotes,
  handleConfirmPayout
}) {
  const finalPayout = Number(todayEarnings) || (Number(servicePayout) + Number(fuelPayout));

  return (
    <AnimatePresence>
      {showPayoutModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                Request Vendor Payout
              </h3>
              <button 
                onClick={() => setShowPayoutModal(false)} 
                className="p-2 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-0.5">
                  <p className="font-extrabold">Verified Vendor Settlement Policy</p>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    You receive <strong>50% of all Service Charges</strong> plus <strong>100% of Verified Fuel Reimbursement</strong>. Spare parts/component charges are excluded.
                  </p>
                </div>
              </div>

              {/* Itemized Payout Breakdown Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Payout Calculation Breakdown
                </p>

                <div className="space-y-2 text-xs">
                  {/* Service charges 50% */}
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block">Service Charges (50% Share)</span>
                        <span className="text-[10px] text-slate-500">Diagnostic, labor & repair service fees</span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-sm">
                      ₹{(Number(servicePayout) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Fuel payout */}
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Fuel className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block">Fuel Charges Payout</span>
                        <span className="text-[10px] text-slate-500">
                          {Number(totalDistanceKm) > 0 ? `${Number(totalDistanceKm).toFixed(1)} KM traveled (All services)` : 'Trip distance allowance'}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-orange-600 text-sm">
                      +₹{(Number(fuelPayout) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Components excluded */}
                  <div className="flex items-center justify-between p-2.5 bg-white/70 rounded-xl border border-dashed border-slate-200">
                    <div>
                      <span className="font-bold text-slate-600 block">Component / Hardware Parts</span>
                      <span className="text-[10px] text-slate-400">0% vendor payout (Spare parts cost)</span>
                    </div>
                    <span className="font-bold text-slate-400 text-xs line-through">
                      ₹{(Number(componentCharges) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (₹0.00)
                    </span>
                  </div>
                </div>

                {/* Total Net Payout */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase">Total Net Available Payout</span>
                    <span className="text-[10px] text-emerald-600 block font-bold">50% Service + 100% Fuel</span>
                  </div>
                  <span className="text-xl font-black text-emerald-600">
                    ₹{finalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Days of Work</label>
                <input 
                  type="number" 
                  value={payoutDays} 
                  onChange={e => setPayoutDays(e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  placeholder="e.g., 5" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Additional Settlement Notes</label>
                <textarea 
                  value={payoutNotes} 
                  onChange={e => setPayoutNotes(e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-20" 
                  placeholder="Optional notes to accounts team..." 
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed">
                  Payouts are settled directly to your registered bank account or UPI ID within 1-2 business days.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setShowPayoutModal(false)} 
                className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPayout} 
                className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm &amp; Submit Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
