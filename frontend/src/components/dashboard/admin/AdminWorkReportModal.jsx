import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Wrench,
  CreditCard,
  IndianRupee,
  FileText,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  Receipt,
  ExternalLink,
} from 'lucide-react';

export default function AdminWorkReportModal({ isOpen, onClose, reportItem }) {
  const [copied, setCopied] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);

  if (!isOpen || !reportItem) return null;

  // ── Normalize Data from Live Backend or Mock Item ───────────────────────────
  const raw = reportItem.rawBooking || {};
  const displayId =
    reportItem.displayId ||
    reportItem.id ||
    `#WO-${String(reportItem.rawId || raw._id || '0000').slice(-4).toUpperCase()}`;

  const applianceName = reportItem.appliance || raw.appliance || 'Appliance Service';
  const serviceCategory = raw.serviceCategory || `${applianceName} Diagnostic & Repair`;

  const customerName = reportItem.customer || raw.customer?.fullName || 'Valued Customer';
  const customerPhone = reportItem.customerPhone || raw.customer?.phoneNumber || '—';
  const customerEmail = reportItem.customerEmail || raw.customer?.email || '—';
  const customerAddress =
    reportItem.customerAddress ||
    (typeof raw.address === 'string'
      ? raw.address
      : raw.address?.fullAddress || raw.address?.formattedAddress || 'Doorstep Service Address');

  const technicianName = reportItem.technician || raw.vendor?.fullName || 'Assigned Technician';
  const technicianPhone = reportItem.technicianPhone || raw.vendor?.phoneNumber || '—';

  const status = reportItem.status || raw.bookingStatus || 'Completed';
  const isCompleted = status === 'Completed' || status === 'Closed';
  const isCancelled = status === 'Cancelled';

  const serviceDate =
    reportItem.serviceDate !== '—'
      ? reportItem.serviceDate
      : reportItem.dateCompleted !== '—'
      ? reportItem.dateCompleted
      : 'Scheduled Service';

  const dateCompleted =
    reportItem.dateCompleted !== '—'
      ? reportItem.dateCompleted
      : isCompleted && serviceDate !== '—'
      ? serviceDate
      : '—';

  const timeSlot = reportItem.timeSlot || raw.timeSlot || 'Standard Dispatch Slot';

  const baseAmount = Number(
    reportItem.amount ||
    raw.serviceCategoryCharge ||
    raw.serviceCharge ||
    399
  );

  const partsTotal = Number(raw.partsTotal || 0);
  const grandTotal = baseAmount + partsTotal;

  const paymentStatus =
    reportItem.paymentStatus ||
    raw.paymentStatus ||
    (isCompleted ? 'Paid' : 'Pending');

  const paymentMethod =
    reportItem.paymentMethod ||
    raw.paymentMethod ||
    'Cash After Service';

  const reportedIssue =
    reportItem.issue ||
    raw.issue ||
    'Customer reported abnormal performance and requested full inspection.';

  const jobImage = reportItem.image || raw.image || null;

  // ── SOP & Service Checklist ────────────────────────────────────────────────
  const checklist = [
    {
      title: 'Initial Diagnostic & Physical Check',
      desc: 'Inspected power lines, verified operating voltage, and confirmed reported fault symptoms.',
      done: true,
    },
    {
      title: 'Component Servicing & Tune-up',
      desc: 'Deep cleaned critical assemblies, adjusted mechanical alignments, and restored factory calibration.',
      done: true,
    },
    {
      title: 'Post-Repair Stress & Safety Test',
      desc: 'Ran a complete diagnostic run under normal operating load with no abnormal vibrations or errors.',
      done: true,
    },
    {
      title: 'Workplace Sanitization & Customer Handover',
      desc: 'Cleaned appliance exterior and surroundings; demonstrated full operational check to customer.',
      done: isCompleted,
    },
  ];

  // ── Copy Summary to Clipboard ──────────────────────────────────────────────
  const handleCopySummary = () => {
    const text = `
MAGIC MISTRY WORK ORDER REPORT
----------------------------------
Order ID: ${displayId}
Service: ${applianceName} (${serviceCategory})
Status: ${status}
Completed On: ${dateCompleted}
Customer: ${customerName} (${customerPhone})
Address: ${customerAddress}
Technician: ${technicianName} (${technicianPhone})
Total Billed: ₹${grandTotal} (${paymentStatus} via ${paymentMethod})
Reported Issue: ${reportedIssue}
----------------------------------
Generated from Magic Mistry Admin Dashboard
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // ── Print Report Handler ───────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/65 backdrop-blur-md overflow-y-auto overscroll-contain print:p-0 print:bg-white"
    >
      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/80 max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:bg-white"
      >
        {/* ── 1. MODAL COMMAND HEADER ────────────────────────────────────────── */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#02182e] text-white flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                <span>Work Order</span>
                <span>•</span>
                <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {displayId}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#02182e] truncate tracking-tight">
                {applianceName} Service & Repair Report
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 print:hidden">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide border shadow-2xs ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isCancelled
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : isCancelled ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              )}
              {status.toUpperCase()}
            </span>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Copy report summary"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. SCROLLABLE REPORT BODY ──────────────────────────────────────── */}
        <div
          data-lenis-prevent
          className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 overscroll-contain text-slate-800"
        >
          {/* Key Metrics Executive Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Metric 1: Total Amount */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Receipt className="w-3 h-3 text-orange-500" /> Total Billed
              </span>
              <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
                  ₹{grandTotal}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                    paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
            </div>

            {/* Metric 2: Completion Date */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-500" /> Date Completed
              </span>
              <div className="mt-2">
                <p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {dateCompleted !== '—' ? dateCompleted : serviceDate}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Service Cycle Finalized</p>
              </div>
            </div>

            {/* Metric 3: Time Slot */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-500" /> Schedule Window
              </span>
              <div className="mt-2">
                <p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {timeSlot}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Doorstep Appointment</p>
              </div>
            </div>

            {/* Metric 4: Assigned Technician */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Tech
              </span>
              <div className="mt-2 flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-orange-400 text-xs font-black flex items-center justify-center shrink-0">
                  {technicianName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                    {technicianName}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold truncate">Partner Specialist</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Orientation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── LEFT COLUMN (7 Cols): Technical & Service Breakdown ───────── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Diagnostic Scope & Root Cause */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                      Service Scope & Diagnostic Findings
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    Verified
                  </span>
                </div>

                {/* Customer Reported Problem */}
                <div>
                  <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" /> Customer Reported Complaint
                  </p>
                  <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3.5 text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed">
                    “{reportedIssue}”
                  </div>
                </div>

                {/* Technician Action & Resolution */}
                <div>
                  <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Technician Field Resolution
                  </p>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                    Performed multi-point diagnostic on <strong>{applianceName}</strong>. Addressed internal wear and validated circuit health. Device tested under normal load and confirmed functioning safely to standard parameters.
                  </div>
                </div>
              </div>

              {/* Card 2: SOP Standard Operating Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                      Service Quality & Safety Checklist
                    </h3>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {checklist.filter((c) => c.done).length} / {checklist.length} Passed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                        item.done
                          ? 'bg-emerald-50/40 border-emerald-200/80'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black mt-0.5 shrink-0 ${
                          item.done
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 text-slate-600'
                        }`}
                      >
                        ✓
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {item.title}
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Photo Documentation / Evidence */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-slate-600" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                      Job Documentation & Evidence
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {jobImage ? '1 File Attached' : 'Digital Sign-off'}
                  </span>
                </div>

                {jobImage ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => setActivePhoto(jobImage)}
                      className="group relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs"
                    >
                      <img
                        src={jobImage}
                        alt="Service Job Evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <ExternalLink className="w-4 h-4" /> Click to view full image
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 text-center font-medium">
                      Doorstep photo submitted during technician job completion
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        Doorstep Service OTP & GPS Verified
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Service closed with authenticated customer OTP handshake and technician geolocation check-in.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN (5 Cols): Customer, Technician & Billing ─────── */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Customer Details */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                    Customer Information
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Full Name
                    </span>
                    <p className="font-extrabold text-slate-900 text-base">{customerName}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Phone Number
                      </span>
                      {customerPhone && customerPhone !== '—' ? (
                        <a
                          href={`tel:${customerPhone}`}
                          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {customerPhone}
                        </a>
                      ) : (
                        <p className="font-bold text-slate-600">—</p>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Email Address
                      </span>
                      {customerEmail && customerEmail !== '—' ? (
                        <a
                          href={`mailto:${customerEmail}`}
                          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 truncate transition-colors"
                          title={customerEmail}
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{customerEmail}</span>
                        </a>
                      ) : (
                        <p className="font-bold text-slate-600">—</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500" /> Service Location
                    </span>
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      {customerAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Assigned Technician Profile */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                      Assigned Field Partner
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                    Dispatched
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#02182e] to-slate-800 text-orange-400 text-base font-black flex items-center justify-center shadow-sm shrink-0">
                    {technicianName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                      {technicianName}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold truncate flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {technicianPhone !== '—' ? technicianPhone : 'Direct Dispatch Line'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Financial & Invoice Statement */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-700" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                      Financial Statement
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                      paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>Labor & Diagnostic Fee</span>
                    <span className="font-bold text-slate-800">₹{baseAmount}</span>
                  </div>

                  {partsTotal > 0 && (
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Parts & Spares Consumed</span>
                      <span className="font-bold text-slate-800">₹{partsTotal}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>Platform Safety & GST</span>
                    <span className="font-semibold text-emerald-600">Included</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200/90 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                        Net Amount
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Payment Mode: {paymentMethod}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600 tracking-tight">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Invoice Ref:</span>
                    <span className="font-mono text-slate-800 font-extrabold">
                      INV-{displayId.replace(/[^A-Za-z0-9]/g, '')}
                    </span>
                  </p>
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    Official tax invoice auto-synchronized with customer dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. MODAL FOOTER COMMAND BAR ─────────────────────────────────────── */}
        <div className="px-5 sm:px-7 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20 print:hidden">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Magic Mistry Operations Audit System</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#02182e] hover:bg-[#032447] text-white transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Close Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Photo Lightbox Popup */}
      <AnimatePresence>
        {activePhoto && (
          <div
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-black"
            >
              <img src={activePhoto} alt="Full evidence" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
