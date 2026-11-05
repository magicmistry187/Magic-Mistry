import React, { useState, useEffect } from 'react';
import { formatCleanAddress } from '../../../utils/addressParser';
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
  Star,
  MessageSquare,
  Quote,
  ThumbsUp,
  Edit3,
} from 'lucide-react';
import { getBookingReview, saveBookingReview, getRatingSentiment } from '../../../utils/bookingReviews';

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
    formatCleanAddress(reportItem.customerAddress || raw.address) || 'Doorstep Service Address';

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

  // ── Customer Rating & Review Resolution ────────────────────────────────────
  const [reviewInfo, setReviewInfo] = useState(() =>
    getBookingReview(reportItem, applianceName, status)
  );
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editRating, setEditRating] = useState(() => reviewInfo?.rating || 5);
  const [editComment, setEditComment] = useState(() => reviewInfo?.review || '');
  const [editHoverRating, setEditHoverRating] = useState(0);

  useEffect(() => {
    if (reportItem) {
      const rev = getBookingReview(reportItem, applianceName, status);
      setReviewInfo(rev);
      setEditRating(rev?.rating || 5);
      setEditComment(rev?.review || '');
      setIsEditingReview(false);
    }
  }, [reportItem, applianceName, status]);

  const handleSaveReview = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetId = reportItem.rawId || raw._id || reportItem.id || displayId;
    const saved = saveBookingReview(targetId, {
      rating: editRating,
      review: editComment,
      customer: customerName,
      appliance: applianceName,
    });
    if (saved) {
      setReviewInfo(saved);
      setIsEditingReview(false);
    }
  };

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
Customer Rating: ${reviewInfo.rating ? `${Number(reviewInfo.rating).toFixed(1)} / 5.0 (${reviewInfo.sentiment || 'Verified'})` : 'Unrated'}
Customer Feedback: "${reviewInfo.review || 'No review recorded'}"
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs overflow-y-auto overscroll-contain"
    >
      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col max-h-[92vh] my-auto"
      >
        {/* ── 1. MODAL COMMAND HEADER ────────────────────────────────────────── */}
        <div className="bg-[#02182e] text-white px-5 sm:px-7 py-4.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/20">
                  {displayId}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isCancelled
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCompleted ? 'bg-emerald-400' : isCancelled ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                  />
                  {status}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
                <span>{applianceName}</span>
                <span className="text-slate-400 font-normal text-xs hidden sm:inline">
                  &bull; Complete Service &amp; Inspection Audit
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-700/60 bg-slate-800/40 cursor-pointer"
              title="Copy Summary"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-700/60 bg-slate-800/40 cursor-pointer"
              title="Print Order Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer ml-1"
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
          {/* Key Metrics Executive Ribbon (5 columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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

            {/* Metric 5: Customer Rating & Satisfaction */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" /> Customer Rating
              </span>
              <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1">
                  {reviewInfo.rating ? (
                    <>
                      {Number(reviewInfo.rating).toFixed(1)}
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" />
                    </>
                  ) : (
                    <span className="text-sm font-bold text-slate-400">Unrated</span>
                  )}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                    reviewInfo.rating >= 4.5
                      ? 'bg-emerald-100 text-emerald-800'
                      : reviewInfo.rating
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {reviewInfo.rating ? (reviewInfo.sentiment || 'Verified') : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Orientation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── LEFT COLUMN (7 Cols): Technical & Service Breakdown ───────── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Service Specifications */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                      Service Scope &amp; Categorization
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    ID: {displayId}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Target Appliance
                    </span>
                    <p className="font-extrabold text-slate-900">{applianceName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Service Category
                    </span>
                    <p className="font-semibold text-slate-800">{serviceCategory}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Time Slot Booked
                    </span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {timeSlot}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Scheduled Date
                    </span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {serviceDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Reported Issue & Fault Diagnostics */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                    Customer Reported Symptoms &amp; Faults
                  </h3>
                </div>

                <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>Reported Description:</span>
                  </p>
                  <p className="text-slate-800 italic">&ldquo;{reportedIssue}&rdquo;</p>
                </div>

                {jobImage && (
                  <div className="pt-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-slate-500" /> Customer Uploaded Evidence
                    </span>
                    <div
                      onClick={() => setActivePhoto(jobImage)}
                      className="relative w-36 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group cursor-pointer"
                    >
                      <img
                        src={jobImage}
                        alt="Customer diagnostic proof"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Standard Operating Procedure (SOP) Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                      Technician Execution SOP Checklist
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    4-Point Quality Guarantee
                  </span>
                </div>

                <div className="space-y-3">
                  {checklist.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="mt-0.5">
                        {step.done ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {step.title}
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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

              {/* Card 3: Dedicated Customer Rating & Feedback */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#02182e] tracking-tight">
                      Customer Rating &amp; Feedback
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        reviewInfo.rating
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {reviewInfo.rating ? `${reviewInfo.sentiment || 'Verified'}` : 'Pending Review'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingReview(!isEditingReview)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title={isEditingReview ? 'Cancel edit' : 'Edit rating & note'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditingReview ? (
                  <form onSubmit={handleSaveReview} className="space-y-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Set Customer Rating (1 - 5 Stars)
                      </label>
                      <div className="flex items-center gap-1.5 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setEditHoverRating(star)}
                            onMouseLeave={() => setEditHoverRating(0)}
                            onClick={() => setEditRating(star)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                (editHoverRating || editRating) >= star
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-sm font-black text-slate-800 ml-2">
                          {editRating}.0 Stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                        Customer Feedback Comment
                      </label>
                      <textarea
                        rows={2}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder="Customer review statement (e.g. prompt arrival, professional service)..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingReview(false)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveReview}
                        className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Rating</span>
                      </button>
                    </div>
                  </form>
                ) : reviewInfo.rating ? (
                  <div className="space-y-3.5">
                    {/* Visual Star Rating and Score */}
                    <div className="flex items-center justify-between bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                star <= Math.round(reviewInfo.rating)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-base sm:text-lg font-black text-slate-900 ml-1">
                          {Number(reviewInfo.rating).toFixed(1)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">Verified Customer</span>
                      </span>
                    </div>

                    {/* Customer Review Quote */}
                    <div className="relative bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                      <Quote className="w-5 h-5 text-slate-300 absolute top-3 left-3 -scale-x-100 opacity-60" />
                      <p className="text-xs sm:text-sm text-slate-700 font-medium italic pl-6 leading-relaxed">
                        &ldquo;{reviewInfo.review}&rdquo;
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">Feedback by {customerName}</span>
                        <span className="text-slate-400">
                          {dateCompleted !== '—' ? dateCompleted : serviceDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 space-y-2">
                    <div className="w-9 h-9 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Star className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No Customer Review Recorded Yet</p>
                    <p className="text-[11px] text-slate-400">
                      {isCompleted
                        ? 'Customer has completed service. You can log an offline satisfaction rating below.'
                        : 'Customer feedback will be collected automatically upon service completion.'}
                    </p>
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => setIsEditingReview(true)}
                        className="mt-1 px-3 py-1.5 text-xs font-bold bg-[#02182e] text-white rounded-xl hover:bg-[#032447] cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-orange-400" />
                        <span>Log Satisfaction Score</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Card 4: Financial & Invoice Statement */}
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
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Base Labor &amp; Diagnostic</span>
                    <span className="font-bold text-slate-800">₹{baseAmount}</span>
                  </div>

                  {partsTotal > 0 && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Parts &amp; Spares Consumed</span>
                      <span className="font-bold text-slate-800">₹{partsTotal}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>Platform Safety &amp; GST</span>
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
            data-lenis-prevent
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer overflow-y-auto overscroll-contain"
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
