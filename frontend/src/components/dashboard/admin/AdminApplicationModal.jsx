import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck, X, Clock, User, Mail, Phone, MapPin, Briefcase, Wrench, ShieldCheck, ExternalLink, CheckCircle2, UserX, UserCheck } from 'lucide-react';

export default function AdminApplicationModal({
  isOpen,
  onClose,
  selectedApplication,
  vendorCredentials,
  showToast,
  onViewVendorCreds,
  onReject,
  onApprove,
  StockLevelBadge
}) {
  return (
    <AnimatePresence>
      {isOpen && selectedApplication && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-8"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-[#02182e] to-[#09223e] text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl font-bold shrink-0">
                  <FileCheck className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold tracking-tight">Vendor Application Form Details</h3>
                    <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[11px] font-black rounded-full uppercase tracking-wider">
                      {selectedApplication.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Submitted by <span className="font-bold text-white">{selectedApplication.name}</span> on {selectedApplication.date || 'Oct 24, 2026'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable Form Structure */}
            <div className="p-6 space-y-6 overflow-y-auto bg-slate-50/50 flex-1">

              {/* Status Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Application Status:</span>
                  <StockLevelBadge level={selectedApplication.status} />
                </div>
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-500" /> Registered Service Partner Request
                </div>
              </div>

              {/* Section 1: Personal Information */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-[#02182e] font-extrabold text-sm pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Section 1: Personal Information</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedApplication.name}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</span>
                    <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedApplication.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Number</span>
                    <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedApplication.phone}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">City / Operating Location</span>
                    <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedApplication.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Work & Service Details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-[#02182e] font-extrabold text-sm pb-2 border-b border-slate-100">
                  <Briefcase className="w-4 h-4 text-orange-500" />
                  <span>Section 2: Work & Service Expertise</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Primary Specialization</span>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 font-extrabold rounded-xl border border-orange-200 mt-1">
                      <Wrench className="w-3.5 h-3.5" /> {selectedApplication.service || selectedApplication.serviceType || 'General'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Years of Experience</span>
                    <p className="font-extrabold text-slate-900 text-sm mt-1">
                      {selectedApplication.experience !== undefined && selectedApplication.experience !== null
                        ? `${selectedApplication.experience} Year${Number(selectedApplication.experience) === 1 ? '' : 's'}`
                        : '5+ Years'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Vendor Bio & Background</span>
                  <div className="mt-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 leading-relaxed">
                    "{selectedApplication.experienceDescription || selectedApplication.notes || 'Experienced technician applying for Magic Mistry dispatch service.'}"
                  </div>
                </div>
              </div>

              {/* Section 3: Submitted Verification Documents */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-[#02182e] font-extrabold text-sm pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Section 3: Identity & Verification Proofs</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {((selectedApplication.documents && selectedApplication.documents.length > 0)
                    ? selectedApplication.documents
                    : (selectedApplication.docs || ['Govt Photo ID', 'Trade License Cert', 'Background Verification'])
                  ).map((doc, idx) => {
                    const docName = typeof doc === 'object' ? (doc.fileName || doc.type || `Document ${idx + 1}`) : doc;
                    const docUrl = typeof doc === 'object' ? doc.url : null;
                    const isPdf = typeof docName === 'string' && docName.toLowerCase().endsWith('.pdf');

                    return (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-extrabold text-slate-800 truncate" title={docName}>{docName}</span>
                        </div>
                        {docUrl ? (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                            onClick={() => {
                              showToast?.(`Opening ${docName}...`);
                            }}
                          >
                            View {isPdf ? 'PDF' : 'Doc'} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              showToast?.(`Document file not available`);
                            }}
                            className="text-[11px] font-extrabold text-slate-400 flex items-center gap-1 cursor-not-allowed shrink-0"
                          >
                            No File
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Applicant agreed to Magic Mistry Code of Conduct & Background Checks.</span>
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 flex-wrap gap-y-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <div className="flex items-center gap-2 flex-wrap">

                {/* View Vendor ID & Pass — shown when approved or ID already generated */}
                {(selectedApplication.status === 'Approved' || vendorCredentials?.[selectedApplication.id] || vendorCredentials?.[selectedApplication.applicationId]) && (
                  <button
                    type="button"
                    onClick={() => onViewVendorCreds(selectedApplication)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" /> View Vendor ID & Pass
                  </button>
                )}

                {/* Approve / Reject — only if Pending AND no ID generated yet */}
                {selectedApplication.status === 'Pending' && !vendorCredentials?.[selectedApplication.id] && (
                  <>
                    <button
                      type="button"
                      onClick={() => onReject(selectedApplication.id)}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserX className="w-4 h-4" /> Reject Application
                    </button>
                    <button
                      type="button"
                      onClick={() => onApprove(selectedApplication)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" /> Approve & Create Vendor ID
                    </button>
                  </>
                )}

              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
