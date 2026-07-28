import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer, CheckCircle2, Shield, Wrench } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 print:m-0 print:shadow-none print:w-full"
        >
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-5 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg">Tax Invoice & Payment Receipt</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Invoice Document Body */}
          <div className="p-8 space-y-6 text-slate-800" id="invoice-content">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <img src="/logo2.png" alt="Magic Mistry" className="h-10 w-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Magic-Mistry Appliance Services Pvt Ltd</p>
                <p className="text-xs text-slate-400">GSTIN: 29AAAAA0000A1Z5 | Support: support@magicmistry.com</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2">
                  PAID IN FULL
                </span>
                <p className="text-sm font-extrabold text-slate-900">INVOICE: #{booking.id || 'INV-84920'}</p>
                <p className="text-xs text-slate-500">Date: {booking.date || 'July 20, 2026'}</p>
              </div>
            </div>

            {/* Billed To & Service Details */}
            <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Info</p>
                <p className="font-bold text-slate-900 text-sm">{booking.customerName || 'Rahul Sharma'}</p>
                <p className="text-slate-600 mt-0.5">{booking.address || 'Flat 402, Green Valley Apts, Indiranagar, Bangalore'}</p>
                <p className="text-slate-500 mt-1">Phone: +91 98765 43210</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Service Technician</p>
                <p className="font-bold text-slate-900 text-sm">{booking.technician || 'Suresh Kumar'}</p>
                <p className="text-slate-600 mt-0.5">Certified HVAC Specialist</p>
                <p className="text-slate-500 mt-1">Payment Method: Online (UPI / Card)</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold rounded-l-xl">Service Description</th>
                    <th className="py-3 px-4 font-bold text-center">Qty</th>
                    <th className="py-3 px-4 font-bold text-right">Price</th>
                    <th className="py-3 px-4 font-bold text-right rounded-r-xl">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      {booking.service || 'Split AC Deep Cleaning & Inspection'}
                    </td>
                    <td className="py-3.5 px-4 text-center">1</td>
                    <td className="py-3.5 px-4 text-right font-medium">{booking.price || '₹1,499'}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{booking.price || '₹1,499'}</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 text-slate-600">Standard Safety & Gas Checkup</td>
                    <td className="py-3.5 px-4 text-center">1</td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-600">INCLUDED</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">₹0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Calculation Strip */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-slate-100 gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Includes 30-Day Magic-Mistry Service Warranty</span>
              </div>
              <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{booking.price || '₹1,499'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes (GST 18%):</span>
                  <span className="font-semibold text-slate-800">Included</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount Paid:</span>
                  <span className="text-blue-700 text-base">{booking.price || '₹1,499'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-100">
              Thank you for trusting Magic-Mistry! For assistance, email support@magicmistry.com or call 1800-123-4567.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
