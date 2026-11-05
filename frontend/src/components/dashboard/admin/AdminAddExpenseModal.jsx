import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, IndianRupee, Calendar, CreditCard, Tag, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { saveAdminExpense } from '../../../utils/adminExpenses';

export default function AdminAddExpenseModal({ isOpen, onClose, onExpenseAdded }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [beneficiary, setBeneficiary] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!title.trim()) {
      setError('Please enter an expense title or purpose.');
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid expense amount greater than ₹0.');
      return;
    }

    const newRecord = saveAdminExpense({
      title: title.trim(),
      category,
      amount: numericAmount,
      date,
      paymentMode,
      beneficiary: beneficiary.trim() || 'Platform Operational Vendor',
      notes: notes.trim(),
      status: 'Paid',
    });

    if (newRecord) {
      if (onExpenseAdded) onExpenseAdded(newRecord);
      onClose();
      // Reset form
      setTitle('');
      setAmount('');
      setBeneficiary('');
      setNotes('');
      setError('');
    } else {
      setError('Failed to record expense. Please try again.');
    }
  };

  const CATEGORY_OPTIONS = [
    'Infrastructure',
    'Marketing',
    'Communications',
    'Tools & Equipment',
    'Office & Admin',
    'Legal & Compliance',
    'Other Operational',
  ];

  const PAYMENT_MODES = [
    'UPI',
    'Bank Transfer',
    'Corporate Card',
    'Cash',
    'Cheque',
  ];

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs overflow-y-auto overscroll-contain"
    >
      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col my-auto"
      >
        {/* Header */}
        <div className="bg-[#02182e] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">Record Operational Expense</h3>
              <p className="text-xs text-slate-400">Log platform overhead, tooling, or vendor bills</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              Expense Title / Purpose *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AWS Cloud Hosting, Technician Toolkits, Leaflets..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              Beneficiary / Vendor Name
            </label>
            <input
              type="text"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="e.g. Amazon Web Services, Local Print Shop, Google Ads..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              Notes &amp; Reference (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add invoice reference number or context for accounting..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

