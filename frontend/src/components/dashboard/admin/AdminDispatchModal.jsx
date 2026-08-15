import React from 'react';
import { motion } from 'framer-motion';
import { X, User, ShieldCheck, MapPin, Phone, Calendar, Clock } from 'lucide-react';

export default function AdminDispatchModal({ isOpen, onClose, dispatchItem }) {
  if (!isOpen || !dispatchItem) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-100"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#02182e] text-white flex items-center justify-center shadow-inner">
              <dispatchItem.applianceIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#02182e] leading-none mb-1">
                Dispatch {dispatchItem.id}
              </h2>
              <p className="text-sm font-semibold text-slate-500">
                {dispatchItem.appliance} Repair
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Details */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Customer Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Name</p>
                  <p className="text-sm font-bold text-slate-800">{dispatchItem.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="text-sm font-bold text-slate-800">+91 98765 43210</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </p>
                  <p className="text-sm font-bold text-slate-800">123 Service Lane, Kolkata, WB</p>
                </div>
              </div>
            </div>

            {/* Technician & Status */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Assignment Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Current Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    dispatchItem.status === 'Assigned' || dispatchItem.status === 'Under Diagnosis' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      dispatchItem.status === 'Assigned' || dispatchItem.status === 'Under Diagnosis' ? 'bg-blue-500' : 'bg-orange-500 animate-pulse'
                    }`} />
                    {dispatchItem.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Assigned Technician</p>
                  {dispatchItem.technicianAvatar ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                        {dispatchItem.technicianAvatar}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{dispatchItem.technician}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 inline-block">
                      Unassigned
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Scheduled Date
                  </p>
                  <p className="text-sm font-bold text-slate-800">Today, 2:30 PM</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                 <Clock className="w-3.5 h-3.5" /> Recent Activity
              </h3>
              <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-600 space-y-3">
                 <div className="flex gap-3">
                   <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                   <div>
                     <p className="font-semibold text-slate-800">Request Created</p>
                     <p className="text-xs text-slate-500">Today at 10:15 AM via Web App</p>
                   </div>
                 </div>
                 {dispatchItem.status !== 'Awaiting Tech' && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">Assigned to {dispatchItem.technician}</p>
                        <p className="text-xs text-slate-500">Today at 10:45 AM by System Auto-Dispatch</p>
                      </div>
                    </div>
                 )}
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
