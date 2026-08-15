import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, FileText, Camera, Clock, User, Phone, MapPin } from 'lucide-react';

export default function AdminWorkReportModal({ isOpen, onClose, reportItem }) {
  if (!isOpen || !reportItem) return null;

  // Mock data for the completed report
  const checklist = [
    { title: 'Initial Diagnostic', desc: 'Checked all primary components for faults.' },
    { title: 'Part Replacement', desc: 'Replaced faulty drum seal.' },
    { title: 'Testing & Calibration', desc: 'Ran a full diagnostic cycle to ensure stability.' },
    { title: 'Cleanup', desc: 'Cleaned the appliance exterior and workspace.' },
  ];

  const photos = [
    'https://images.unsplash.com/photo-1581092921461-7031e4bfb83e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400'
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[#f4f7fb] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
              <span>Work History</span>
              <span>›</span>
              <span className="text-slate-700">{reportItem.id}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#02182e] tracking-tight">
              {reportItem.appliance} Repair Report
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold px-4 py-1.5 rounded-full flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              COMPLETED
            </span>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column (8 Cols): Service Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Duration & Basic Info */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    TOTAL DURATION
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-4xl font-mono font-extrabold text-slate-900 tracking-wider">
                      01:45:20
                    </span>
                  </div>
                </div>
                <div className="h-12 w-px bg-slate-200 hidden sm:block"></div>
                <div className="flex gap-8">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">TECHNICIAN</span>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><User className="w-4 h-4 text-slate-500"/> {reportItem.technician}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">COMPLETED ON</span>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> {reportItem.dateCompleted}</p>
                  </div>
                </div>
              </div>

              {/* Service Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Completed Service Checklist</h3>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    4 / 4 Completed
                  </span>
                </div>
                <div className="space-y-3">
                  {checklist.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-start gap-3.5">
                      <div className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center bg-emerald-600 text-white text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technician Notes */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Technician Notes</h3>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  Customer reported a loud noise during the spin cycle. Found the drum seal completely worn out. Replaced it with an OEM part. Tested for 20 minutes across different loads, no abnormal noise detected. Cleaned the surrounding area.
                </p>
              </div>
            </div>

            {/* Right Column (4 Cols): Documentation & Customer */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Customer Info */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                 <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" /> Client Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Name</p>
                    <p className="text-sm font-bold text-slate-800">{reportItem.customer}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</p>
                    <p className="text-sm font-bold text-slate-800">+91 98765 43210</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3"/> Address</p>
                    <p className="text-sm font-bold text-slate-800">123 Service Lane, Kolkata, WB</p>
                  </div>
                </div>
              </div>

              {/* Photo Documentation */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-slate-700" />
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Documentation</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">2 Attached</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">BEFORE (Diagnostic)</span>
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                       <img src={photos[0]} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">AFTER (Resolution)</span>
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                       <img src={photos[1]} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#02182e] text-white hover:bg-[#042b52] transition-colors shadow-md hover:shadow-lg cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}
