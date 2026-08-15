import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Printer, X, Wrench, Shield } from 'lucide-react';

export default function VendorTaxInvoiceModal({
  showTaxInvoiceModal,
  generatedInvoiceData,
  handleSameTabPrintOrSavePDF,
  handleCloseInvoiceModal
}) {
  return (
    <AnimatePresence>
      {showTaxInvoiceModal && generatedInvoiceData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto tax-invoice-modal-overlay">
          <motion.div
            id="invoice-vendor-print-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto"
          >
            {/* Single Control Header Bar (Hidden during print) */}
            <div className="bg-gradient-to-r from-[#0B1E40] via-[#0A192F] to-[#0B1E40] text-white px-6 py-4 flex items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-base">Tax Invoice &amp; Payment Receipt</h3>
              </div>

              <div className="flex items-center gap-2">
                {/* SAME TAB PRINT / SAVE AS PDF BUTTON */}
                <button
                  onClick={handleSameTabPrintOrSavePDF}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Download PDF / Print Invoice
                </button>

                <button
                  onClick={handleCloseInvoiceModal}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer ml-1"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white" id="invoice-document-body">
              
              {/* Company Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-black text-[#0B1E40] tracking-tight">Magic Mistry</span>
                  </div>
                  <p className="text-xs text-slate-600 font-bold">Magic Mistry Appliance Services Pvt. Ltd.</p>
                  <p className="text-[11px] text-slate-500">Salt Lake Sector V, Kolkata, WB 700091</p>
                  <p className="text-[11px] text-slate-400">GSTIN: 19AAACM9823F1Z8 | Email: support@magicmistry.com</p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300 mb-2">
                    ✓ {generatedInvoiceData.status || 'PAID IN FULL'}
                  </span>
                  <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tax Invoice</p>
                  <p className="text-base font-black text-[#0B1E40]">#{generatedInvoiceData.invoiceId}</p>
                  <p className="text-xs text-slate-500 font-semibold">Date: {generatedInvoiceData.date}</p>
                </div>
              </div>

              {/* Customer & Technician Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Billed To (Customer)</p>
                  <p className="font-bold text-slate-900 text-sm">{generatedInvoiceData.customerName}</p>
                  <p className="text-slate-600 mt-0.5 leading-snug">{generatedInvoiceData.address}</p>
                  <p className="text-slate-500 mt-0.5">Phone: {generatedInvoiceData.customerPhone}</p>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                  <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Service &amp; Payment Details</p>
                  <p className="font-bold text-slate-900 text-sm">Technician: {generatedInvoiceData.technician}</p>
                  <p className="text-slate-600 mt-0.5">Service: {generatedInvoiceData.serviceTitle}</p>
                  <p className="text-slate-600 font-semibold text-blue-800 mt-0.5">Payment: {generatedInvoiceData.paymentMethod}</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0B1E40] text-white">
                      <th className="py-2.5 px-4 font-bold rounded-l-lg">Service Item / Component</th>
                      <th className="py-2.5 px-4 font-bold text-center">Qty</th>
                      <th className="py-2.5 px-4 font-bold text-right">Rate (₹)</th>
                      <th className="py-2.5 px-4 font-bold text-right rounded-r-lg">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {generatedInvoiceData.parts.map((p, pIdx) => {
                      const amt = (parseFloat(p.qty) || 1) * (parseFloat(p.price) || 0);
                      return (
                        <tr key={pIdx}>
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <Wrench className="w-3.5 h-3.5 text-orange-500 shrink-0 no-print" />
                            <span>{p.description}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">{p.qty}</td>
                          <td className="py-3 px-4 text-right font-medium">₹{parseFloat(p.price).toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">₹{amt.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-4 text-slate-600 font-medium">30-Day Service Guarantee &amp; Diagnostic Checkup</td>
                      <td className="py-2.5 px-4 text-center font-semibold">1</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-600">INCLUDED</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-600">₹0.00</td>
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

                <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-800">₹{generatedInvoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  {generatedInvoiceData.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount Applied:</span>
                      <span className="font-bold">-₹{generatedInvoiceData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes (GST 5%):</span>
                    <span className="font-semibold text-slate-800">₹{generatedInvoiceData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[#0B1E40] pt-2 border-t border-slate-200">
                    <span>Total Amount Paid:</span>
                    <span className="text-orange-600 text-base">₹{generatedInvoiceData.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {generatedInvoiceData.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong>Customer Remarks:</strong> {generatedInvoiceData.notes}
                </div>
              )}

              {/* Invoice Footer / Sign-off */}
              <div className="pt-6 border-t border-slate-200 text-center space-y-1">
                <p className="text-[11px] font-bold text-slate-600">
                  This is a computer-generated tax invoice. No physical signature required.
                </p>
                <p className="text-[10px] text-slate-400">
                  Thank you for choosing Magic Mistry! For queries, contact support@magicmistry.com or call +91 1800 123 4567.
                </p>
              </div>

              {/* Modal Footer Return Button (Hidden during print) */}
              <div className="pt-4 border-t border-slate-100 flex justify-end no-print">
                <button
                  onClick={handleCloseInvoiceModal}
                  className="px-6 py-2.5 bg-[#061e38] hover:bg-[#0a2f57] text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  ✓ Done &amp; Return to Dashboard Queue
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
