import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  HelpCircle, 
  ShieldCheck,
  Building2, 
  ArrowRight, 
  MessageSquare, 
  Clock,
  Sparkles, 
  PhoneCall,
  MessageCircle,
  Headphones,
  Check,
  AlertCircle,
  RefreshCw,
  BadgeCheck,
  ExternalLink,
  Shield,
  Zap,
  Calendar,
  FileText
} from 'lucide-react';

/* ─── Animation Variants ─────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

/* ─── Inquiry Categories ─────────────────────────────────────────── */
const INQUIRY_TYPES = [
  {
    id: 'repair',
    label: 'Urgent Breakdown / Booking',
    desc: 'Need a certified mistry for AC, fridge, washing machine, or microwave.',
    badge: 'Immediate Dispatch'
  },
  {
    id: 'warranty',
    label: '30-Day Warranty Re-visit',
    desc: 'Claim free rework if a previously repaired symptom returned within 30 days.',
    badge: 'Zero Visit Charge'
  },
  {
    id: 'partner',
    label: 'Technician Partner Query',
    desc: 'Questions about onboarding, weekly payments, or verification documents.',
    badge: 'Vendor Support'
  },
  {
    id: 'amc',
    label: 'Apartment & Bulk AMC',
    desc: 'Annual maintenance contracts for residential societies & commercial offices.',
    badge: 'Custom Corporate'
  }
];

/* ─── Hyperlocal Regional Service Depots ──────────────────────────── */
const REGIONAL_DEPOTS = [
  {
    district: 'Salt Lake & New Town',
    name: 'Central Operations Hub & Testing Lab',
    address: 'Module 402, Webel IT Park, Sector V, Bidhannagar, Kolkata 700091',
    phone: '+91 98300 12345',
    hours: 'Mon - Sun: 8:00 AM - 9:30 PM',
    coverage: 'Salt Lake (Sec I-V), New Town, Rajarhat, Kestopur, Lake Town',
    eta: '30-45 mins average arrival',
    isHQ: true
  },
  {
    district: 'South Kolkata & Jadavpur',
    name: 'South Regional Dispatch Depot',
    address: '74/A, Gariahat Road, Near Triangular Park, Kolkata 700029',
    phone: '+91 98300 12346',
    hours: 'Mon - Sun: 8:00 AM - 9:00 PM',
    coverage: 'Ballygunge, Gariahat, Tollygunge, Jadavpur, Garia, Behala, Alipore',
    eta: '35-50 mins average arrival',
    isHQ: false
  },
  {
    district: 'Kolkata Central & North',
    name: 'Heritage & North Dispatch Terminal',
    address: '18/2, Bidhan Sarani, Shyambazar Five-Point, Kolkata 700004',
    phone: '+91 98300 12347',
    hours: 'Mon - Sun: 8:30 AM - 8:30 PM',
    coverage: 'Shyambazar, Girish Park, College St, Burrabazar, Phoolbagan, Maniktala',
    eta: '35-50 mins average arrival',
    isHQ: false
  },
  {
    district: 'Howrah & Shibpur',
    name: 'Howrah Cross-River Depot',
    address: '112, Grand Trunk Road (South), Howrah Maidan, Howrah 711101',
    phone: '+91 98300 12348',
    hours: 'Mon - Sun: 8:00 AM - 9:00 PM',
    coverage: 'Howrah Station, Shibpur, Santragachi, Salkia, Liluah, Mandirtala',
    eta: '40-50 mins average arrival',
    isHQ: false
  },
  {
    district: 'Hooghly & Serampore',
    name: 'Hooghly Suburban Service Depot',
    address: '56, GT Road, Near Serampore Railway Station, Hooghly 712201',
    phone: '+91 98300 12349',
    hours: 'Mon - Sun: 9:00 AM - 8:00 PM',
    coverage: 'Serampore, Uttarpara, Konnagar, Rishra, Chandannagar, Chinsurah',
    eta: '45-60 mins average arrival',
    isHQ: false
  },
  {
    district: 'North 24 Parganas',
    name: 'Airport Corridor Service Station',
    address: '24/1, Jessore Road, Near Nagerbazar Flyover, Dum Dum 700028',
    phone: '+91 98300 12350',
    hours: 'Mon - Sun: 8:30 AM - 8:30 PM',
    coverage: 'Dum Dum, Nagerbazar, Belgharia, Sodepur, Barasat, Madhyamgram',
    eta: '40-55 mins average arrival',
    isHQ: false
  }
];

/* ─── Frequently Asked Support Questions ─────────────────────────── */
const SUPPORT_FAQS = [
  {
    q: 'How quickly will a technician arrive after I place a call?',
    a: 'For urgent breakdowns in Kolkata, Howrah, and Salt Lake, our average doorstep arrival time is between 35 and 60 minutes. Once booked, you receive live SMS updates with the technician’s name, verified photo ID, phone number, and real-time status.'
  },
  {
    q: 'How does the 30-Day Free Rework Warranty work if a problem recurs?',
    a: 'Every repair is backed by an ironclad 30-day warranty. If the exact same issue returns within 30 days of service, simply select "30-Day Warranty Re-visit" on this page or call our helpline with your original Booking ID. We dispatch a senior supervisor with zero visit charge and zero inspection fee.'
  },
  {
    q: 'Can I send a photo or audio note of the strange sound my appliance is making?',
    a: 'Yes! Our WhatsApp Express Helpdesk (+91 98300 12345) allows you to send photos of PCB error codes, leaking pipes, or audio recordings of abnormal compressor/motor noises. Our master technicians analyze the media before dispatching the right specialist.'
  },
  {
    q: 'Do I have to pay any advance before the technician inspects the appliance?',
    a: 'Never. Magic Mistry follows a strict 100% Pay After Testing policy. The technician diagnoses the appliance, quotes an exact upfront price from our transparent rate card, replaces the faulty part with your approval, tests the appliance for 15 minutes, and only then collects payment via UPI or Cash.'
  },
  {
    q: 'How do I ensure the person at my door is an authentic Magic Mistry technician?',
    a: 'All our mistrys wear official Magic Mistry uniforms, carry a physical laminated company photo ID, and carry a digital verifiable badge on their partner app. When they arrive, they will ask you to confirm the 4-digit service OTP sent to your registered phone number.'
  }
];

export default function ContactPage() {
  const navigate = useNavigate();

  // Inquiry Category State
  const [inquiryType, setInquiryType] = useState('repair');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    district: 'Salt Lake & New Town',
    bookingId: '',
    preferredContact: 'phone', // 'phone' | 'whatsapp' | 'email'
    urgency: 'high', // 'high' | 'normal'
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [formError, setFormError] = useState('');

  // Accordion State for FAQs
  const [openFaq, setOpenFaq] = useState(0);

  // Selected Depot Filter
  const [activeDepotTab, setActiveDepotTab] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setFormError('Please fill out all mandatory fields marked with an asterisk (*).');
      return;
    }

    if (formData.phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    // Generate random realistic Ticket ID
    const randomTicketNumber = Math.floor(10000 + Math.random() * 90000);
    const generatedTicket = {
      id: `MM-${inquiryType.toUpperCase()}-${randomTicketNumber}`,
      name: formData.fullName,
      phone: formData.phone,
      type: INQUIRY_TYPES.find((t) => t.id === inquiryType)?.label,
      urgency: formData.urgency === 'high' ? 'High (Under 15 Mins Response)' : 'Normal (Under 45 Mins)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Simulate verified dispatch response
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedTicket(generatedTicket);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        district: 'Salt Lake & New Town',
        bookingId: '',
        preferredContact: 'phone',
        urgency: 'high',
        message: ''
      });
    }, 1100);
  };

  const selectedDepot = REGIONAL_DEPOTS[activeDepotTab];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-orange-600 selection:text-white">
      <Navbar />

      <main className="flex-1">
        
        {/* ══ 1. HERO SECTION & LIVE DISPATCH STATUS ═════════════════ */}
        <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden bg-[#0B1E40] text-white border-b border-blue-950">
          {/* Subtle Architectural Dot Matrix Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Soft Ambient Radial Flares */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-5">
              
              {/* Real-Time Dispatch Status Pill */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide shadow-inner backdrop-blur-md"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Helpdesk Online · Express Dispatch Active in Kolkata &amp; Bengal</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-white tracking-tight leading-[1.12]"
              >
                Here When Your Home{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                  Needs Urgent Technical Care.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
              >
                Whether you need a 60-minute emergency breakdown dispatch, have a question regarding
                your 30-day warranty, or want to speak directly with an operations supervisor—we answer promptly.
              </motion.p>

            </div>

            {/* Direct Instant Contact Cards Row (3 Pillars) */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 max-w-5xl mx-auto"
            >
              {/* Card 1: Emergency Phone Dispatch */}
              <motion.div
                variants={fadeInUp}
                className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-3xl p-6 backdrop-blur-md transition-all group shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <PhoneCall className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-300 bg-orange-500/20 px-2.5 py-1 rounded-full border border-orange-500/30">
                      Avg. 15s Pickup
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">
                    Emergency Dispatch Helpline
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Immediate breakdown support for leaking ACs, non-cooling fridges, and sparking boards.
                  </p>
                  <p className="text-xl font-black text-white tracking-tight font-mono">
                    +91 98300 12345
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Toll-Free: 1800 123 4567 · 8:00 AM – 9:30 PM
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <a
                    href="tel:+919830012345"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Dispatch Now</span>
                  </a>
                </div>
              </motion.div>

              {/* Card 2: WhatsApp Media Diagnostics */}
              <motion.div
                variants={fadeInUp}
                className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-3xl p-6 backdrop-blur-md transition-all group shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      Avg. 3 Min Reply
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">
                    WhatsApp Photo Diagnostic
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Send photos of PCB error codes, sound clips of rattling motors, or appliance model tags.
                  </p>
                  <p className="text-xl font-black text-white tracking-tight font-mono">
                    +91 98300 12345
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Fastest way to get an estimated rate quote
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <a
                    href="https://wa.me/919830012345?text=Hello%20Magic%20Mistry,%20I%20need%20assistance%20with%20my%20home%20appliance."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                </div>
              </motion.div>

              {/* Card 3: 30-Day Warranty Cell */}
              <motion.div
                variants={fadeInUp}
                className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-3xl p-6 backdrop-blur-md transition-all group shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-500/30">
                      Free Rework Guarantee
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">
                    30-Day Warranty Claim Cell
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Already had a repair and the symptom returned? We re-dispatch a master technician with zero fees.
                  </p>
                  <p className="text-sm font-bold text-slate-200 mt-1">
                    warranty@magicmistry.com
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Direct supervisor escalation cell
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setInquiryType('warranty');
                      const formElement = document.getElementById('contact-form-section');
                      if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-300" />
                    <span>File Warranty Claim</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* ══ 2. SMART INQUIRY CLASSIFIER & CONTACT FORM ══════════════ */}
        <section id="contact-form-section" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Section (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/90 relative overflow-hidden">
              
              {/* Form Category Header */}
              <div className="mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-bold text-xs uppercase tracking-wider mb-3 border border-orange-200">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Verified Response Guarantee</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E40] tracking-tight">
                  Send a Direct Inquiry to Operations
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Select your inquiry type so your message routes directly to the right technician supervisor.
                </p>
              </div>

              {/* Inquiry Type Switcher Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
                {INQUIRY_TYPES.map((t) => {
                  const isSelected = inquiryType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setInquiryType(t.id)}
                      className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B1E40] text-white border-[#0B1E40] shadow-md shadow-blue-950/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 opacity-80">
                        {t.badge}
                      </span>
                      <span className="text-xs sm:text-sm font-black leading-tight block">
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Submission State or Active Form */}
              <AnimatePresence mode="wait">
                {submittedTicket ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-6 sm:p-10 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>

                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                      Ticket Generated: {submittedTicket.id}
                    </span>

                    <h3 className="text-2xl sm:text-3xl font-black text-[#0B1E40] mt-4 mb-2">
                      Inquiry Received &amp; Assigned!
                    </h3>

                    <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed mb-6">
                      Thank you, <strong className="text-slate-900">{submittedTicket.name}</strong>. A service supervisor
                      from our local dispatch depot has been notified. We will reach you on{' '}
                      <strong className="text-slate-900">{submittedTicket.phone}</strong> shortly.
                    </p>

                    {/* Step-by-Step Ticket Tracker */}
                    <div className="bg-white rounded-2xl p-5 border border-emerald-100 text-left max-w-md mx-auto mb-8 shadow-xs space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                        <span className="text-slate-500">Inquiry Classification:</span>
                        <span className="font-bold text-[#0B1E40]">{submittedTicket.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                        <span className="text-slate-500">Priority Level:</span>
                        <span className="font-bold text-orange-600">{submittedTicket.urgency}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Logged At:</span>
                        <span className="font-mono text-slate-700">{submittedTicket.timestamp} IST</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => setSubmittedTicket(null)}
                        className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Submit Another Inquiry
                      </button>

                      <button
                        onClick={() => navigate('/booking')}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <span>Book Instant Doorstep Service</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                    noValidate
                  >
                    {formError && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="e.g. Subrata Mukherjee"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          required
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                            +91
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="98300 00000"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="subrata@example.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                      </div>

                      {/* Service District */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Your Service District
                        </label>
                        <div className="relative">
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer pr-10 font-medium"
                          >
                            <option value="Salt Lake & New Town">Salt Lake &amp; New Town</option>
                            <option value="South Kolkata & Jadavpur">South Kolkata &amp; Jadavpur</option>
                            <option value="Kolkata Central & North">Kolkata Central &amp; North</option>
                            <option value="Howrah & Shibpur">Howrah &amp; Shibpur</option>
                            <option value="Hooghly & Serampore">Hooghly &amp; Serampore</option>
                            <option value="North 24 Parganas">North 24 Parganas</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Conditional Warranty Booking ID Field */}
                    {inquiryType === 'warranty' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>30-Day Warranty Verification Data</span>
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Please enter your original Booking ID or invoice number from your SMS bill.
                          Warranty rework dispatches carry zero inspection charges.
                        </p>
                        <input
                          type="text"
                          name="bookingId"
                          value={formData.bookingId}
                          onChange={handleInputChange}
                          placeholder="e.g. MM-BK-74921 or registered mobile number"
                          className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </motion.div>
                    )}

                    {/* Urgency & Preferred Channel Selector */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Response Priority
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, urgency: 'high' }))}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                              formData.urgency === 'high'
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            🔥 Urgent Breakdown
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, urgency: 'normal' }))}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                              formData.urgency === 'normal'
                                ? 'bg-[#0B1E40] text-white border-[#0B1E40] shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Normal Inquiry
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Preferred Contact Method
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'phone', label: 'Phone Call' },
                            { id: 'whatsapp', label: 'WhatsApp' },
                            { id: 'email', label: 'Email' }
                          ].map((ch) => (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => setFormData((p) => ({ ...p, preferredContact: ch.id }))}
                              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                                formData.preferredContact === ch.id
                                  ? 'bg-slate-800 text-white border-slate-800'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {ch.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Message / Symptoms */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Describe Appliance Issue or Query *
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please describe the appliance brand, model, and symptoms (e.g. 1.5-ton split AC outdoor unit humming but not cooling; or washing machine drum shaking heavily on spin)..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Transmit Direct Request to Dispatch Hub</span>
                          <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        No spam. Your contact details are never shared.
                      </span>
                      <span>Assigned to nearest West Bengal regional depot</span>
                    </div>

                  </motion.form>
                )}
              </AnimatePresence>

            </div>

            {/* Right Column: Key Commitments & Operational Guidance (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Box 1: Verified Doorstep Protocol Notice */}
              <div className="bg-[#0B1E40] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-blue-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Doorstep Safety Standard
                  </span>
                </div>

                <h3 className="text-lg font-black text-white mb-2 leading-snug">
                  Zero Surprise Fees. 100% Verified Staff.
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Every Magic Mistry partner carries police background verification and arrives
                  in branded uniform with printed rate cards.
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Upfront component cost approval before any tool is used</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>15-Minute operational load testing before bill settlement</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Digital GST invoice with 30-day warranty seal</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Operating Hours & Direct Extensions */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-md border border-slate-200/90 space-y-4">
                <h3 className="text-base font-extrabold text-[#0B1E40] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Depot Operating Timings</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-600">Monday – Saturday</span>
                    <span className="font-bold text-[#0B1E40]">8:00 AM – 9:30 PM</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-600">Sunday Emergency Fleet</span>
                    <span className="font-bold text-orange-600">8:30 AM – 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">Public Holidays</span>
                    <span className="font-bold text-emerald-700">Express On-Call Fleet</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Emergency breakdown calls during night hours are routed to our on-duty standby technician queue for 7:30 AM priority dispatch.
                  </p>
                </div>
              </div>

              {/* Box 3: Quick Direct Actions */}
              <div className="bg-slate-100/80 rounded-3xl p-6 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Quick Navigation
                </h4>
                
                <Link
                  to="/booking"
                  className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B1E40] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span>Book Online in 60 Seconds</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  to="/faq"
                  className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B1E40] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Explore Full FAQs &amp; Pricing</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  to="/become-a-vendor"
                  className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B1E40] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Technician / Vendor Onboarding</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* ══ 3. HYPERLOCAL REGIONAL DISPATCH DEPOTS DIRECTORY ═══════ */}
        <section className="py-20 lg:py-24 bg-white border-t border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Physical Depot Network</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                West Bengal Dispatch Depots &amp; Testing Labs
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                We operate physical spare parts depots and diagnostic benches across Kolkata and surrounding districts,
                enabling fast 60-minute express doorstep arrivals.
              </p>
            </div>

            {/* Depot Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
              {REGIONAL_DEPOTS.map((depot, idx) => {
                const isSelected = activeDepotTab === idx;
                return (
                  <button
                    key={depot.district}
                    type="button"
                    onClick={() => setActiveDepotTab(idx)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B1E40] text-white shadow-md scale-102'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                    <span>{depot.district}</span>
                    {depot.isHQ && (
                      <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-md font-mono">
                        HQ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Depot Detail Hero Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDepot.district}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto shadow-xl mb-12"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                        {selectedDepot.district}
                      </span>
                      {selectedDepot.isHQ && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200">
                          Central Operations &amp; Diagnostic Lab
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-[#0B1E40]">
                      {selectedDepot.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>{selectedDepot.address}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Average Arrival
                    </p>
                    <p className="text-base font-extrabold text-emerald-600 font-mono">
                      {selectedDepot.eta}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Localities Covered
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {selectedDepot.coverage}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Depot Contact &amp; Hours
                    </p>
                    <p className="text-sm font-bold text-[#0B1E40] font-mono">
                      {selectedDepot.phone}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedDepot.hours}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs text-slate-500 italic">
                    Equipped with nitrogen pressure testing rigs and genuine inverter PCB spares.
                  </p>

                  <a
                    href={`tel:${selectedDepot.phone}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {selectedDepot.district.split(' ')[0]} Depot</span>
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Static Overview Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {REGIONAL_DEPOTS.map((depot, idx) => (
                <div
                  key={depot.district}
                  onClick={() => setActiveDepotTab(idx)}
                  className={`bg-slate-50/70 rounded-2xl p-5 border transition-all cursor-pointer ${
                    activeDepotTab === idx
                      ? 'border-orange-500 shadow-md ring-1 ring-orange-500/30'
                      : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#0B1E40]">
                      {depot.district}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active Depot
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1 line-clamp-1">{depot.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{depot.coverage}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ 4. FREQUENTLY ASKED SUPPORT QUESTIONS ══════════════════ */}
        <section className="py-20 lg:py-28 bg-slate-100/60 border-b border-slate-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B1E40] font-bold text-xs uppercase tracking-wider mb-3 border border-blue-200">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Support Knowledge Base</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                Frequently Asked Support Questions
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Everything you need to know about dispatch times, warranty claims, and technician safety.
              </p>
            </div>

            {/* Accordion List */}
            <div className="space-y-3.5">
              {SUPPORT_FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-3 text-sm sm:text-base font-bold text-[#0B1E40] hover:text-orange-600 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 text-xs font-black flex items-center justify-center shrink-0 border border-orange-200">
                          {index + 1}
                        </span>
                        <span>{faq.q}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${
                          isOpen ? 'rotate-180 text-orange-600' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider transition-colors"
              >
                <span>Read all 30+ FAQs on our Complete FAQ Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </section>

        {/* ══ 5. DIRECT ESCALATION / GRIEVANCE REDRESSAL ══════════════ */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xs">
              <div className="flex items-start gap-4 max-w-xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#0B1E40]">
                    Direct Grievance &amp; Escalation Cell
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    If an unresolved technical issue has not been addressed within 24 hours, our Customer Experience
                    Ombudsman reviews every case directly:
                  </p>
                  <p className="text-xs font-bold text-slate-700 mt-2">
                    Direct Email: <a href="mailto:escalations@magicmistry.com" className="text-orange-600 hover:underline">escalations@magicmistry.com</a> · Mon–Sat 10 AM to 6 PM
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => navigate('/terms-and-conditions')}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  View Service Level Agreement
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
