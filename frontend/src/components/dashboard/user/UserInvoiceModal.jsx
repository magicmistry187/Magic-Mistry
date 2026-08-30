// UserInvoiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// User Dashboard Component — Shows a printable tax invoice for a booking.
// Used exclusively in: pages/dashboard/UserDashboardPage.jsx
// Renamed from: InvoiceModal.jsx  →  UserInvoiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileText, Wrench, Shield } from 'lucide-react';

export default function UserInvoiceModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceId = booking.id || booking._id || 'INV-' + Math.floor(100000 + Math.random() * 900000);
  const invoiceDate = booking.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <AnimatePresence>
      {/* 
        The backdrop container:
        - On screen: fixed overlay with dark blur
        - On print: static display block at top of page, no background or padding
      */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:static print:block print:p-0 print:m-0 print:bg-white print:overflow-visible">
        
        {/* Print Styles: Hide non-invoice elements, clean page margins */}
        <style>{`
          @media print {
            /* Hide the main website header, navbar, footer, and dashboard body */
            nav, footer, header, main, .print\\:hidden {
              display: none !important;
            }

            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              overflow: visible !important;
            }

            /* Force A4 print format */
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }

            /* Expand invoice card to full width without borders/shadows */
            #invoice-print-card {
              position: static !important;
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              background: #ffffff !important;
              transform: none !important;
              opacity: 1 !important;
            }
          }
        `}</style>

        <motion.div
          id="invoice-print-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-full print:m-0 print:p-0"
        >
          {/* Top Modal Control Bar (Hidden during Print) */}
          <div className="bg-gradient-to-r from-[#0B1E40] via-[#0A192F] to-[#0B1E40] text-white px-6 py-4 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              <h3 className="font-extrabold text-base">Tax Invoice &amp; Payment Receipt</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Document Body */}
          <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white" id="invoice-document-body">
            {/* Header: Company Info + Invoice Meta */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <img src="/logo2.png" alt="Magic Mistry" className="h-9 w-auto object-contain" />
                  <span className="text-xl font-black text-[#0B1E40] tracking-tight">Magic Mistry</span>
                </div>
                <p className="text-xs text-slate-600 font-bold">Magic Mistry Appliance Services Pvt. Ltd.</p>
                <p className="text-[11px] text-slate-500">Salt Lake Sector V, Kolkata, WB 700091</p>
                <p className="text-[11px] text-slate-400">GSTIN: 19AAACM9823F1Z8 | Email: support@magicmistry.com</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300 mb-2">
                  ✓ PAID IN FULL
                </span>
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tax Invoice</p>
                <p className="text-base font-black text-[#0B1E40]">#{invoiceId}</p>
                <p className="text-xs text-slate-500 font-semibold">Date: {invoiceDate}</p>
              </div>
            </div>

            {/* Customer & Technician Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Billed To (Customer)</p>
                <p className="font-bold text-slate-900 text-sm">{booking.customerName || 'Customer'}</p>
                <p className="text-slate-600 mt-0.5 leading-snug">
                  {typeof booking.address === 'object' && booking.address !== null
                    ? [booking.address.house || booking.address.flat || booking.address.addressLine1, booking.address.street, booking.address.landmark, booking.address.city, booking.address.state, booking.address.pincode].filter(Boolean).join(', ')
                    : (booking.address || 'Address on File, Kolkata')}
                </p>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Service Details</p>
                <p className="font-bold text-slate-900 text-sm">Assigned Technician: {booking.technician || 'Verified Expert'}</p>
                <p className="text-slate-600 mt-0.5">Status: Completed &amp; Verified</p>
                <p className="text-slate-600">Payment: Cash / Digital Payment After Service</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0B1E40] text-white">
                    <th className="py-2.5 px-4 font-bold rounded-l-lg">Service Item / Appliance</th>
                    <th className="py-2.5 px-4 font-bold text-center">Qty</th>
                    <th className="py-2.5 px-4 font-bold text-right">Rate</th>
                    <th className="py-2.5 px-4 font-bold text-right rounded-r-lg">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-orange-500 shrink-0 print:hidden" />
                      <span>{booking.service || 'Appliance Inspection & Repair Service'}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">1</td>
                    <td className="py-3 px-4 text-right font-medium">{booking.price || '₹299'}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{booking.price || '₹299'}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-4 text-slate-600">30-Day Service Guarantee &amp; Diagnostic Checkup</td>
                    <td className="py-2.5 px-4 text-center font-semibold">1</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-600">INCLUDED</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-600">₹0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations & Warranty Box */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-4 border-t border-slate-200 gap-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-amber-50 px-3.5 py-2.5 rounded-xl border border-amber-200 max-w-sm">
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>30-Day Magic Mistry Warranty:</strong> Includes 100% cover on functional repair &amp; labor.
                </span>
              </div>

              <div className="w-full sm:w-56 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{booking.price || '₹299'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST 18%):</span>
                  <span className="font-semibold text-slate-800">Included</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#0B1E40] pt-2 border-t border-slate-200">
                  <span>Total Amount Paid:</span>
                  <span className="text-orange-600 text-base">{booking.price || '₹299'}</span>
                </div>
              </div>
            </div>

            {/* Invoice Footer / Sign-off */}
            <div className="pt-6 border-t border-slate-200 text-center space-y-1">
              <p className="text-[11px] font-bold text-slate-600">
                This is a computer-generated tax invoice. No physical signature required.
              </p>
              <p className="text-[10px] text-slate-400">
                Thank you for choosing Magic Mistry! For queries, contact support@magicmistry.com or call +91 1800 123 4567.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
