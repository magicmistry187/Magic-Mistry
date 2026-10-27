import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Award,
  BadgeCheck,
  Clock,
  IndianRupee,
  Briefcase,
  MapPin,
  ChevronRight,
  Star,
  Zap,
  TrendingUp,
  Users,
  PhoneCall,
  Headphones,
  Sparkles,
  Sliders,
  HelpCircle,
  ChevronDown,
  Check,
  ExternalLink,
  Layers,
  Shield,
  Activity,
  Truck,
  AlertCircle,
  Calendar,
  Building2,
  ThumbsUp,
  Flame,
  CheckCircle
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { getApplianceImage } from '../../assets/applianceImages';

/* ─── Animation Variants ─────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.05 } 
  },
};

/* ─── Trade Data for Interactive Earnings Calculator ─────────────── */
const TRADE_PROFILES = [
  {
    id: 'ac',
    name: 'AC & Refrigeration',
    icon: '❄️',
    avgPayoutPerJob: 650,
    dailyJobsDefault: 4,
    fuelAllowanceMonth: 3500,
    partsMarginRate: 15,
    popularIssues: ['PCB Circuit Repair', 'Compressor Tripping', 'Gas Charging / Leakage', 'Cooling Coil Service'],
    tag: 'Highest Summer Demand',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'washing',
    name: 'Washing Machine',
    icon: '🧺',
    avgPayoutPerJob: 580,
    dailyJobsDefault: 4,
    fuelAllowanceMonth: 3000,
    partsMarginRate: 14,
    popularIssues: ['Drum Bearing Noise', 'Drain Motor Failure', 'Inverter Board Repair', 'Spin Cycle Vibration'],
    tag: 'Year-Round Steady Volume',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'fridge',
    name: 'Refrigerator & Deep Freezer',
    icon: '🧊',
    avgPayoutPerJob: 540,
    dailyJobsDefault: 4,
    fuelAllowanceMonth: 2800,
    partsMarginRate: 12,
    popularIssues: ['Thermostat Fault', 'Defrost Timer & Sensor', 'Relay / OLP Replacement', 'Inverter Compressor PCB'],
    tag: 'High Ticket Spare Parts',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'electrical',
    name: 'Electrical & Geyser',
    icon: '⚡',
    avgPayoutPerJob: 460,
    dailyJobsDefault: 5,
    fuelAllowanceMonth: 3200,
    partsMarginRate: 10,
    popularIssues: ['Short Circuit & MCB Trip', 'Heating Element Replacement', 'Thermostat Safety Valve', 'Switchboard Rewiring'],
    tag: 'Fast Turnaround Jobs',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'kitchen',
    name: 'Microwave & Kitchen Appliances',
    icon: '🍳',
    avgPayoutPerJob: 420,
    dailyJobsDefault: 5,
    fuelAllowanceMonth: 2500,
    partsMarginRate: 12,
    popularIssues: ['Magnetron Failure', 'High Voltage Diode / Capacitor', 'Mixer Motor Armature', 'Induction IGBT Board'],
    tag: 'Compact Diagnostic Jobs',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
  },
];

/* ─── Reality Check Comparison Matrix ────────────────────────────── */
const COMPARISON_ROWS = [
  {
    feature: 'Lead Generation',
    independent: 'Unpredictable walk-ins; hours wasted waiting at shop with zero calls.',
    magic: 'Steady 4–6 pre-booked doorstep service slots dispatched directly via app.',
  },
  {
    feature: 'Payment Collection',
    independent: 'Customers delay, bargain down agreed rates, or leave unpaid balances.',
    magic: '100% Guaranteed weekly automated direct bank/UPI transfer every Tuesday.',
  },
  {
    feature: 'Travel & Fuel Waste',
    independent: 'Running 15–25 km across the city burning fuel for small uncertain repairs.',
    magic: 'Hyperlocal smart dispatch restricted within 5–8 km of your home pin code.',
  },
  {
    feature: 'Spare Parts Sourcing',
    independent: 'Searching crowded physical wholesale markets; high risk of duplicate parts.',
    magic: 'Company-sealed OEM genuine parts delivered directly with wholesale technician margin.',
  },
  {
    feature: 'Customer Trust & Pricing',
    independent: 'Customers suspect overcharging; frequent arguments over visiting fees.',
    magic: 'Standard printed rate card and customer app transparency protect your dignity.',
  },
  {
    feature: 'Accidental Safety',
    independent: 'Zero insurance coverage; all medical & fall risk borne entirely by you.',
    magic: 'Free ₹2,00,000 on-job accidental insurance protection on all active dispatches.',
  },
];

/* ─── 4 Pillars of Partner Dignity & Growth ──────────────────────── */
const PILLARS = [
  {
    icon: TrendingUp,
    title: 'Guaranteed Lead Volume',
    desc: 'No more slow seasons. We run round-the-clock digital marketing and corporate partnerships to keep your daily job queue booked with verified home appointments.',
    highlight: '4–6 daily slots',
  },
  {
    icon: IndianRupee,
    title: 'Tuesday Payout Guarantee',
    desc: 'Every completed service is recorded in your live digital passbook. Bank transfers or UPI settlements are credited automatically every Tuesday with zero hidden deductions.',
    highlight: 'Zero payment delays',
  },
  {
    icon: MapPin,
    title: 'Hyperlocal Geo-Dispatch',
    desc: 'Our dispatch algorithm clusters bookings within a strict 5–8 km radius of your registered address. Spend less time in traffic, save fuel, and reach home for dinner on time.',
    highlight: 'Max 8 km commute',
  },
  {
    icon: Headphones,
    title: 'Senior Master Engineer Support',
    desc: 'Facing a rare inverter error code or complex microcontroller board on-site? Call our senior master technician hotline for instant schematic and testing guidance.',
    highlight: 'Instant phone/video help',
  },
];

/* ─── Real Partner Testimonials (Local & Authentic) ─────────────── */
const TESTIMONIALS = [
  {
    name: 'Subrata Mukherjee',
    trade: 'AC & HVAC Specialist',
    location: 'Salt Lake & New Town, Kolkata',
    experience: '8 Years in Trade',
    partnerSince: 'Partner since 2023',
    rating: 4.94,
    jobsCompleted: 684,
    monthlyEarning: '₹58,400',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    quote:
      'Before joining Magic Mistry, I had a small repair stall in Kankurgachi. Half my day was wasted waiting for calls or bargaining with customers who refused to pay visiting charges. Now, I do 4 to 5 jobs a day within a 6 km radius. My weekly payment arrives in my SBI account every Tuesday morning like clockwork.',
  },
  {
    name: 'Rajesh Karmakar',
    trade: 'Washing Machine & Microwave Expert',
    location: 'Howrah & Shibpur',
    experience: '6 Years in Trade',
    partnerSince: 'Partner since 2024',
    rating: 4.89,
    jobsCompleted: 432,
    monthlyEarning: '₹52,800',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    quote:
      'The biggest advantage is genuine parts supply. Earlier, local shopkeepers sold low-grade capacitors and drain pumps that failed in two months, and customers blamed me. With Magic Mistry, we get brand-certified parts with bill and warranty. Customers respect us as professional engineers.',
  },
  {
    name: 'Bikash Mondal',
    trade: 'Inverter Refrigerator & Home Electrical',
    location: 'Jadavpur & Garia, South Kolkata',
    experience: '10 Years in Trade',
    partnerSince: 'Partner since 2023',
    rating: 4.96,
    jobsCompleted: 790,
    monthlyEarning: '₹64,200',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
    quote:
      'I value my independence. If I have personal work or a family emergency, I simply switch my app status to Offline for the day. There is no penalty or manager shouting. You are your own boss, but with the backing and continuous income of a premier company.',
  },
];

/* ─── Real Technician FAQ ────────────────────────────────────────── */
const FAQS = [
  {
    q: 'Is there any joining fee, registration charge, or security deposit?',
    a: 'No. Magic Mistry does NOT charge any upfront joining fee, security deposit, or registration charge. Onboarding is 100% free. We believe in empowering skilled technicians, not burdening them with startup costs.',
  },
  {
    q: 'When and how do I receive my earnings?',
    a: 'All completed jobs are tracked in your vendor app ledger with full itemized transparency (visiting fees, labor, and spare parts commission). Your total earnings are transferred directly to your registered Bank Account via NEFT/IMPS or UPI every Tuesday morning.',
  },
  {
    q: 'Can I continue running my own private repair shop or doing personal jobs?',
    a: 'Yes, absolutely! You are an independent professional partner. You can toggle your app status to "Online" when you want to receive bookings, and "Offline" when you are busy with private work or resting. You maintain complete control over your working hours.',
  },
  {
    q: 'What happens if a customer cancels after I have already traveled to their home?',
    a: 'Your time and fuel are protected. If a customer cancels after you have already arrived at their doorstep or is unreachable, our system immediately compensates you with a standardized Doorstep Visiting Reimbursement credited to your ledger.',
  },
  {
    q: 'How are spare parts arranged when a customer needs component replacement?',
    a: 'You do not have to invest large sums of your own money. You can request required OEM parts directly through our technician inventory system with doorstep delivery to the customer address, or install customer-approved parts with fixed installation labor charges.',
  },
  {
    q: 'What if I encounter an unfamiliar inverter error code or complex circuit board?',
    a: 'You are never alone on a job. You have direct one-tap access to our Master Technical Engineering Desk. You can share photos or video call our senior master engineer for immediate circuit schematics, multimeter test points, and diagnostic advice.',
  },
  {
    q: 'What documents are required to get onboarded as an authorized partner?',
    a: 'You only need: 1) Valid Government ID (Aadhar Card or Voter ID), 2) A passport-size photograph, 3) Bank account or UPI details for weekly payouts, and 4) Basic tools and proof of hands-on appliance repair experience (previous shop experience or trade certificate).',
  },
];

/* ─── Supported Appliance Demand Grid ────────────────────────────── */
const APPLIANCE_DEMAND_CARDS = [
  {
    id: 1,
    name: 'Air Conditioner',
    category: 'HVAC & Cooling',
    avgTicket: '₹650 – ₹1,800',
    frequency: 'Very High Summer Surge',
    demandLevel: 'Surge',
    repairs: ['PCB Repair', 'Gas Refill', 'Coil Welding', 'Complete Chemical Overhaul'],
  },
  {
    id: 2,
    name: 'Refrigerator',
    category: 'Cooling & Preservation',
    avgTicket: '₹450 – ₹1,400',
    frequency: 'Consistent All 12 Months',
    demandLevel: 'High',
    repairs: ['Inverter Compressor', 'Defrost Sensor', 'Capillary Gas Leak', 'Thermostat Swap'],
  },
  {
    id: 3,
    name: 'Washing Machine',
    category: 'Laundry & Electronics',
    avgTicket: '₹500 – ₹1,500',
    frequency: 'High Repeat Booking',
    demandLevel: 'High',
    repairs: ['Main PCB Board', 'Drain Motor', 'Drum Shockers & Bearings', 'Water Inlet Valve'],
  },
  {
    id: 4,
    name: 'Microwave Oven',
    category: 'Kitchen Electronics',
    avgTicket: '₹400 – ₹950',
    frequency: 'Quick Diagnostic Turnaround',
    demandLevel: 'Medium',
    repairs: ['Magnetron Unit', 'Touchpad Membrane', 'High-Voltage Capacitor', 'Door Microswitch'],
  },
  {
    id: 13,
    name: 'Geyser & Water Heater',
    category: 'Heating & Electrical',
    avgTicket: '₹450 – ₹1,100',
    frequency: 'High Winter Demand',
    demandLevel: 'Seasonal',
    repairs: ['Copper Heating Coil', 'Thermostat Safety Cutout', 'Tank Descaling', 'Power Wiring'],
  },
  {
    id: 16,
    name: 'Electrical Switchboard',
    category: 'Home Power Systems',
    avgTicket: '₹350 – ₹850',
    frequency: 'Daily Continuous Volume',
    demandLevel: 'High',
    repairs: ['MCB Distribution Board', 'Phase Neutral Shortage', 'Earth Leakage Fix', 'Concealed Wiring'],
  },
];

export default function BecomeAVendorPage() {
  const navigate = useNavigate();

  /* ── Interactive Calculator State ── */
  const [selectedTradeId, setSelectedTradeId] = useState('ac');
  const [dailyJobs, setDailyJobs] = useState(4);
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);



  const selectedTrade = useMemo(() => {
    return TRADE_PROFILES.find((t) => t.id === selectedTradeId) || TRADE_PROFILES[0];
  }, [selectedTradeId]);

  /* ── Financial Calculations ── */
  const workingDaysMonth = 26; // Standard 6-day week
  const monthlyCompletedJobs = dailyJobs * workingDaysMonth;
  const monthlyServiceEarnings = monthlyCompletedJobs * selectedTrade.avgPayoutPerJob;
  const monthlyGrossTakeHome = monthlyServiceEarnings + selectedTrade.fuelAllowanceMonth;
  const weeklyBankDeposit = Math.round(monthlyGrossTakeHome / 4);

  const handleApplyWithTrade = (tradeName) => {
    navigate('/vendor-apply', {
      state: {
        selectedService: tradeName || selectedTrade.name,
      },
    });
  };

  const toggleFaq = (idx) => {
    setFaqOpenIndex(faqOpenIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-orange-600 selection:text-white">
      {/* ══ TOP LIVE DISPATCH STATUS RIBBON ═════════════════════════ */}
      <div className="bg-[#07142b] border-b border-blue-950/60 text-slate-300 py-2.5 px-4 text-xs tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-white">Live Technician Dispatch:</span>
            <span className="text-slate-300 hidden sm:inline">
              164+ doorstep repair bookings active today across Kolkata, Howrah &amp; Hooghly
            </span>
            <span className="text-slate-300 sm:hidden">
              160+ leads active in WB
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
            <span className="hidden md:inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% Free Onboarding · No Joining Fee
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <a
              href="tel:+919830012345"
              className="hover:text-white transition-colors flex items-center gap-1 text-slate-300 font-semibold"
            >
              <PhoneCall className="w-3 h-3 text-orange-400" />
              Partner Desk: +91 98300 12345
            </a>
          </div>
        </div>
      </div>

      <Navbar />

      <main className="flex-1">
        {/* ══ 1. HERO SECTION ════════════════════════════════════════ */}
        <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden bg-slate-50 border-b border-slate-200/60">
          {/* Subtle Architectural Dot Matrix Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#0B1E40 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Precision Soft Ambient Radial Gradients */}
          <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-gradient-to-br from-blue-100/50 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-10 left-10 w-[420px] h-[420px] bg-gradient-to-tr from-orange-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Authoritative Value Proposition (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                
                {/* Verified Network Pill */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-[#0B1E40] text-xs font-bold uppercase tracking-wider mb-6 w-fit"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span>Authorized Partner Network · West Bengal</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-[#0B1E40] tracking-tight leading-[1.12] mb-5"
                >
                  Turn Your Repair Expertise Into a{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">
                    High-Income Business.
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl"
                >
                  Stop sitting idle in local repair shops waiting for walk-ins or arguing over bargaining rates.
                  Partner with Magic Mistry to access verified doorstep repair jobs within <strong>5–8 km</strong> of your home,
                  guaranteed weekly bank transfers, and original OEM parts support with <strong>₹0 joining fee</strong>.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap items-center gap-4 mb-10"
                >
                  <button
                    onClick={() => handleApplyWithTrade()}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <span>Apply as Partner</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <a
                    href="#earnings-calculator"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300/80 text-[#0B1E40] font-bold text-base shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-orange-600" />
                    <span>Calculate Earnings</span>
                  </a>

                  <button
                    onClick={() => navigate('/vendor-dashboard')}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-4 text-slate-600 hover:text-[#0B1E40] text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <BadgeCheck className="w-4 h-4 text-slate-400" />
                    <span>Existing Partner Login</span>
                  </button>
                </motion.div>

                {/* Micro Trust Badges Row */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/70"
                >
                  {[
                    { title: '₹0 Joining Fee', sub: '100% Free Signup', icon: Zap },
                    { title: 'Weekly Payout', sub: 'Direct Bank / UPI', icon: IndianRupee },
                    { title: '5–8 KM Radius', sub: 'Hyperlocal Area', icon: MapPin },
                    { title: '₹2 Lakh Cover', sub: 'Accidental Safety', icon: ShieldCheck },
                  ].map(({ title, sub, icon: Icon }, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-200/50">
                        <Icon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0B1E40] leading-none">{title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{sub}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

              </div>

              {/* Right Column: Authentic Editorial Visual & Detailed Partner Trust Badges (5 cols) */}
              <div className="lg:col-span-5 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Primary Image Frame with Real Workshop Photo */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3] sm:aspect-[4/3] group">
                    <img
                      src="/technician_workshop.jpg"
                      alt="Certified Magic Mistry Partner in electronics workshop"
                      className="w-full h-full object-cover object-center select-none group-hover:scale-105 transition-transform duration-700"
                      loading="eager"
                    />

                    {/* Gradient vignette for text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E40]/90 via-[#0B1E40]/25 to-transparent pointer-events-none" />

                    {/* Overlaid Bottom Context Banner */}
                    <div className="absolute bottom-4 left-4 right-4 text-white z-10 flex items-end justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            Authorized Service Partner
                          </p>
                        </div>
                        <h4 className="text-base font-extrabold text-white leading-tight">
                          Certified Appliance Specialist
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Kolkata, Howrah &amp; Greater Districts
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/90 text-white text-[11px] font-bold backdrop-blur-xs shadow-xs">
                          <Star className="w-3 h-3 fill-white text-white" />
                          4.92 Rating
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Metric 1 (Top Left): Average Monthly Earnings */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="absolute -top-4 -left-3 sm:-left-6 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 z-20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0B1E40]">₹35K – ₹65K+ / mo</p>
                      <p className="text-[11px] text-slate-500 font-medium">Weekly direct bank deposit</p>
                    </div>
                  </motion.div>

                  {/* Floating Metric 2 (Bottom Right): 100% Free Onboarding */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="absolute -bottom-5 -right-3 sm:-right-6 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 z-20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0B1E40]">100% Free Onboarding</p>
                      <p className="text-[11px] text-slate-500 font-medium">Zero deposit · ₹0 joining fee</p>
                    </div>
                  </motion.div>

                  {/* Floating Metric 3 (Top Right): 5-8 KM Local Radius */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                    className="hidden sm:flex absolute -top-5 -right-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-2.5 px-3.5 items-center gap-2 z-20"
                  >
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                    <span className="text-xs font-bold text-[#0B1E40]">5–8 km Hyperlocal Radius</span>
                  </motion.div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ 2. VERIFIED MARKET METRICS STRIP ═══════════════════════ */}
        <section className="bg-white border-b border-slate-200/70 py-10 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              
              <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center mb-3 text-orange-600 border border-orange-100">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-3xl lg:text-4xl font-black text-[#0B1E40] tracking-tight">
                  1,250+
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Active Technicians in WB
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Kolkata, Howrah, Hooghly &amp; districts</p>
              </div>

              <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 text-emerald-600 border border-emerald-100">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <span className="text-3xl lg:text-4xl font-black text-[#0B1E40] tracking-tight">
                  ₹42,500
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Avg. Monthly Take-Home
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Top partners earn ₹68,000+</p>
              </div>

              <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 text-blue-600 border border-blue-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-3xl lg:text-4xl font-black text-[#0B1E40] tracking-tight">
                  Every Tuesday
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  100% On-Time Payout
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated direct bank / UPI deposit</p>
              </div>

              <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center mb-3 text-amber-600 border border-amber-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-3xl lg:text-4xl font-black text-[#0B1E40] tracking-tight">
                  5–8 KM
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Hyperlocal Max Radius
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Save fuel and stay close to family</p>
              </div>

            </div>
          </div>
        </section>

        {/* ══ 3. INTERACTIVE PARTNER EARNINGS CALCULATOR ══════════════ */}
        <section id="earnings-calculator" className="py-20 lg:py-28 bg-slate-100/60 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-xs uppercase tracking-wider mb-4 border border-orange-200">
                <Sliders className="w-3.5 h-3.5" />
                <span>Transparent Financial Estimator</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                Calculate Your Real Monthly Earnings
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                No guesswork or vague promises. Select your core repair trade and daily capacity
                to see your projected weekly payout and monthly take-home.
              </p>
            </div>

            {/* Main Interactive Calculator Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-10 max-w-5xl mx-auto">
              
              {/* Step A: Select Trade Category */}
              <div className="mb-10">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5">
                  1. Select Your Primary Repair Specialty:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {TRADE_PROFILES.map((trade) => {
                    const isSelected = selectedTradeId === trade.id;
                    return (
                      <button
                        key={trade.id}
                        type="button"
                        onClick={() => {
                          setSelectedTradeId(trade.id);
                          setDailyJobs(trade.dailyJobsDefault);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="text-2xl block mb-2">{trade.icon}</span>
                          <span className={`text-xs font-extrabold block leading-snug ${
                            isSelected ? 'text-orange-950' : 'text-[#0B1E40]'
                          }`}>
                            {trade.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-2 font-medium">
                          Avg ₹{trade.avgPayoutPerJob}/job
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step B: Slider for Daily Jobs */}
              <div className="mb-10 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <label htmlFor="daily-jobs-slider" className="text-sm font-bold text-[#0B1E40]">
                      2. How Many Doorstep Repairs Can You Complete Per Day?
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Based on standard 6 working days per week ({workingDaysMonth} days/month)
                    </p>
                  </div>
                  <div className="inline-flex items-baseline gap-1 bg-white px-4 py-2 rounded-xl border border-slate-200 text-orange-600 font-black text-xl shadow-2xs self-start sm:self-auto">
                    <span>{dailyJobs}</span>
                    <span className="text-xs font-semibold text-slate-500">jobs / day</span>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  id="daily-jobs-slider"
                  type="range"
                  min="2"
                  max="7"
                  step="1"
                  value={dailyJobs}
                  onChange={(e) => setDailyJobs(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600 focus:outline-none"
                />

                <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
                  <span>2 jobs (Part-time / 3 hrs)</span>
                  <span>4 jobs (Normal full day)</span>
                  <span>7 jobs (High capacity pro)</span>
                </div>
              </div>

              {/* Step C: Real-Time Results Matrix */}
              <div className="grid md:grid-cols-12 gap-6 items-center pt-6 border-t border-slate-200">
                
                {/* Result Breakdown Columns (7 cols) */}
                <div className="md:col-span-7 grid grid-cols-2 gap-4">
                  
                  <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/70">
                    <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                      Weekly Bank Deposit
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-[#0B1E40] mt-1.5">
                      ₹{weeklyBankDeposit.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-orange-700 font-medium mt-1">
                      Transferred every Tuesday morning
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Monthly Take-Home
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1.5">
                      ₹{monthlyGrossTakeHome.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                      Service fees + fuel allowance
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-medium text-slate-500">Monthly Completed Jobs</p>
                    <p className="text-lg font-bold text-[#0B1E40] mt-0.5">
                      {monthlyCompletedJobs} Verified Repairs
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-medium text-slate-500">Fuel &amp; Travel Subsidy</p>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">
                      +₹{selectedTrade.fuelAllowanceMonth.toLocaleString('en-IN')}/mo
                    </p>
                  </div>

                </div>

                {/* Direct CTA (5 cols) */}
                <div className="md:col-span-5 flex flex-col justify-center bg-[#0B1E40] text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block mb-1">
                      Lock In This Tier
                    </span>
                    <h4 className="text-xl font-black text-white mb-2">
                      Ready to Earn ₹{monthlyGrossTakeHome.toLocaleString('en-IN')}+?
                    </h4>
                    <p className="text-slate-300 text-xs mb-5 leading-relaxed">
                      Start with priority dispatch in your neighborhood pin code. Verification completes in 24 hours.
                    </p>

                    <button
                      type="button"
                      onClick={() => handleApplyWithTrade(selectedTrade.name)}
                      className="w-full py-3.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Apply for {selectedTrade.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-3">
                      ✓ Zero upfront fees · Pre-approved rate card
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ══ 4. REALITY CHECK: LOCAL MECHANIC VS MAGIC MISTRY ═══════ */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider mb-4 border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                <span>The Professional Upgrade</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                Local Mechanic Hustle vs. Magic Mistry Partner
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Why hundreds of skilled independent technicians in West Bengal are moving their career
                to Magic Mistry. Compare the reality of everyday repair work.
              </p>
            </div>

            {/* Comparison Table / Matrix */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 max-w-5xl mx-auto">
              
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-[#0B1E40] text-white p-5 sm:p-6 text-xs sm:text-sm font-black tracking-wider uppercase">
                <div className="col-span-4 sm:col-span-3 text-slate-300">Aspect of Work</div>
                <div className="col-span-4 sm:col-span-4 text-rose-300 flex items-center gap-1.5">
                  <span>Traditional Local Hustle</span>
                </div>
                <div className="col-span-4 sm:col-span-5 text-orange-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-400" />
                  <span>Magic Mistry Certified Partner</span>
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100 bg-white">
                {COMPARISON_ROWS.map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center transition-colors ${
                      i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                    }`}
                  >
                    <div className="col-span-4 sm:col-span-3 font-extrabold text-[#0B1E40] pr-2">
                      {row.feature}
                    </div>

                    <div className="col-span-4 sm:col-span-4 text-slate-500 pr-3 font-normal leading-relaxed flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                      <span>{row.independent}</span>
                    </div>

                    <div className="col-span-4 sm:col-span-5 text-[#0B1E40] font-semibold leading-relaxed flex items-start gap-1.5 bg-orange-50/40 p-2.5 rounded-xl border border-orange-100/60">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                      <span>{row.magic}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </section>

        {/* ══ 5. THE 4 FOUNDATION PILLARS OF PARTNER SUCCESS ═════════ */}
        <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B1E40] font-bold text-xs uppercase tracking-wider mb-4 border border-blue-200">
                <Award className="w-3.5 h-3.5 text-orange-500" />
                <span>Technician First Ecosystem</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                4 Reasons Skilled Technicians Choose Magic Mistry
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                We believe skilled technicians are the backbone of modern society. Our platform
                is engineered to maximize your take-home income, dignity, and personal safety.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PILLARS.map(({ icon: Icon, title, desc, highlight }, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-2xs">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 mb-3 border border-slate-200/60">
                      {highlight}
                    </span>
                    <h3 className="text-lg font-black text-[#0B1E40] mb-3 group-hover:text-orange-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-orange-600">
                    <span>Verified Guarantee</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ 6. SUPPORTED APPLIANCE CATEGORIES & DEMAND RADAR ═══════ */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-bold text-xs uppercase tracking-wider mb-4 border border-orange-200">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>High Demand Categories</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight">
                  Appliances We Service Daily
                </h2>
                <p className="text-slate-500 text-base mt-2 max-w-xl">
                  Choose one specialization or take leads across multiple categories.
                  We provide continuous training for newer inverter PCB technologies.
                </p>
              </div>

              <button
                onClick={() => handleApplyWithTrade()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B1E40] hover:bg-blue-900 text-white font-bold text-sm transition-colors cursor-pointer self-start md:self-auto shrink-0 shadow-xs"
              >
                <span>View Full Application Form</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {APPLIANCE_DEMAND_CARDS.map((card) => {
                const imgUrl = getApplianceImage(card.id, card.name);
                return (
                  <div
                    key={card.id}
                    className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/80 hover:border-orange-300 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Image & Demand Badge */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-white p-2 border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={card.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Wrench className="w-7 h-7 text-orange-500" />
                          )}
                        </div>

                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          card.demandLevel === 'Surge'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {card.frequency}
                        </span>
                      </div>

                      {/* Title & Category */}
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {card.category}
                      </p>
                      <h4 className="text-lg font-black text-[#0B1E40] mb-2 mt-0.5">
                        {card.name} Repair
                      </h4>

                      {/* Typical payout */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-medium text-slate-500">Avg. Payout:</span>
                        <span className="text-sm font-extrabold text-[#0B1E40] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {card.avgTicket}
                        </span>
                      </div>

                      {/* Popular Repairs */}
                      <div className="space-y-1.5 pt-3 border-t border-slate-200/70">
                        <p className="text-[11px] font-bold text-slate-400 uppercase">Common Jobs:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {card.repairs.map((rep, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/70"
                            >
                              {rep}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyWithTrade(card.name)}
                      className="mt-6 w-full py-2.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-xs font-bold text-[#0B1E40] hover:text-orange-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Apply for {card.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ══ 7. ONBOARDING ROADMAP (CLEAR 4-STEP TIMELINE) ═════════ */}
        <section className="py-20 lg:py-28 bg-slate-100/70 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-4 border border-emerald-200">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fast-Track 24-Hour Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                How Onboarding Works
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                We respect your time. From submitting your application to receiving your first
                paid customer booking takes less than 24 to 48 hours.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 relative">
              {[
                {
                  step: '01',
                  time: 'Takes 2 Minutes',
                  title: 'Online Application',
                  desc: 'Fill out the basic online form with your name, phone number, preferred service pin codes, and trade experience.',
                  icon: Briefcase,
                },
                {
                  step: '02',
                  time: 'Within 24 Hours',
                  title: 'Telephonic Screening',
                  desc: 'Our technical manager conducts a brief phone assessment to review your repair knowledge, tools, and Aadhar proof.',
                  icon: Headphones,
                },
                {
                  step: '03',
                  time: 'Instant Digital Setup',
                  title: 'Partner Kit & App',
                  desc: 'Receive your official Magic Mistry digital badge, partner app credentials, and standard service rate cards.',
                  icon: BadgeCheck,
                },
                {
                  step: '04',
                  time: 'Day 2 Onwards',
                  title: 'Start Earning',
                  desc: 'Switch your status to Online, accept your first doorstep dispatch within 5 km of home, and receive weekly payouts.',
                  icon: IndianRupee,
                },
              ].map(({ step, time, title, desc, icon: Icon }, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl font-black text-orange-500 font-mono">
                        {step}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {time}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#0B1E40] mb-4 border border-slate-100">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>

                    <h4 className="text-lg font-black text-[#0B1E40] mb-2">{title}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>No physical office rush</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => navigate('/vendor-apply')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>Start Step 1: Submit Application</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </section>

        {/* ══ 8. REAL PARTNER STORIES (WEST BENGAL) ══════════════════ */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs uppercase tracking-wider mb-4 border border-amber-200">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Verified Partner Experiences</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                Hear From Technicians Like You
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Real stories from local mistrys who transformed their unpredictable daily hustle
                into a respected, high-earning profession.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="bg-slate-50/70 rounded-3xl p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow"
                >
                  <div>
                    {/* Partner Header */}
                    <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-slate-200/70">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-orange-500/80 shadow-2xs"
                      />
                      <div>
                        <h4 className="font-bold text-[#0B1E40] text-base leading-tight">
                          {t.name}
                        </h4>
                        <p className="text-xs text-orange-600 font-semibold mt-0.5">
                          {t.trade}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{t.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stars and verified badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-1.5">{t.rating}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {t.jobsCompleted} Completed Jobs
                      </span>
                    </div>

                    {/* Quote */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic">
                      "{t.quote}"
                    </p>
                  </div>

                  {/* Monthly stats badge */}
                  <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Avg. Monthly Take-Home:</span>
                    <span className="font-black text-[#0B1E40] text-sm bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {t.monthlyEarning}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ 9. REQUIREMENTS & ELIGIBILITY CHECKLIST ════════════════ */}
        <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Info (6 cols) */}
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-bold text-xs uppercase tracking-wider mb-4 border border-orange-200">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Partner Criteria</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-5">
                  What You Need to Get Started
                </h2>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8">
                  We maintain strict quality benchmarks so households welcome our partners with trust.
                  If you have practical skill and an honest work ethic, you are ready to join.
                </p>

                <div className="space-y-3.5">
                  {[
                    {
                      title: '1+ Year Practical Repair Experience',
                      desc: 'Hands-on experience diagnosing electronics, wiring, or refrigeration systems.',
                    },
                    {
                      title: 'Government Identity Proof',
                      desc: 'Valid Aadhar Card, Voter ID, or Driving License for background clearance.',
                    },
                    {
                      title: 'Own Basic Diagnostic Hand Tools',
                      desc: 'Multimeter, screwdrivers, spanners, and gauges suitable for your trade.',
                    },
                    {
                      title: 'Smartphone with WhatsApp & GPS',
                      desc: 'To receive dispatch notifications, customer addresses, and digital bills.',
                    },
                    {
                      title: 'Two-Wheeler (Recommended for 5–8 km Travel)',
                      desc: 'Enables quick arrival at customer doorsteps and saves transit time.',
                    },
                  ].map((req, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0B1E40]">{req.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{req.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => navigate('/vendor-apply')}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0B1E40] hover:bg-blue-900 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    <span>Check Eligibility &amp; Apply</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right: What Magic Mistry Provides (6 cols) */}
              <div className="lg:col-span-6">
                <div className="bg-[#0B1E40] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-2">
                    Company Backing
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
                    What Magic Mistry Provides Every Partner
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-8">
                    You bring the technical talent; we handle everything else to make your life hassle-free.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        title: '100% Free Registration (₹0 Hidden Cost)',
                        detail: 'No joining charges, security deposits, or monthly software fees.',
                      },
                      {
                        title: 'Pre-Negotiated Standard Rate Cards',
                        detail: 'Fixed customer pricing so you never face haggling or disputes on site.',
                      },
                      {
                        title: 'Original OEM Spare Parts Supply',
                        detail: 'Direct access to company-sealed parts with technician profit margin.',
                      },
                      {
                        title: '₹2,00,000 Accidental Protection',
                        detail: 'Comprehensive medical and accidental coverage during active duty.',
                      },
                      {
                        title: 'Senior Master Engineer Video Helpline',
                        detail: 'On-demand technical guidance for tricky circuit boards and microcontrollers.',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-white">{item.title}</p>
                          <p className="text-xs text-slate-300 mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
                    <span>Questions before applying?</span>
                    <a
                      href="tel:+919830012345"
                      className="text-orange-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call Helpline
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ 10. REAL TECHNICIAN FREQUENTLY ASKED QUESTIONS ═════════ */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200/70">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider mb-4 border border-slate-200">
                <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                Got Questions? Honest Answers.
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Everything you need to know about payouts, work flexibility, spare parts, and customer policies.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = faqOpenIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                    >
                      <span className="font-extrabold text-[#0B1E40] text-sm sm:text-base pr-2">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-orange-600' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50"
                        >
                          <p>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="text-sm font-bold text-[#0B1E40]">Still have a specific question about your location?</p>
                <p className="text-xs text-slate-600 mt-0.5">Our Kolkata onboarding supervisor is ready to speak with you.</p>
              </div>
              <a
                href="tel:+919830012345"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call +91 98300 12345</span>
              </a>
            </div>

          </div>
        </section>

        {/* ══ 11. CLOSING CALL TO ACTION BANNER ══════════════════════ */}
        <section className="py-20 lg:py-28 bg-slate-100/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0B1E40] via-[#091b3a] to-[#041026] text-white p-8 sm:p-14 lg:p-16 shadow-2xl overflow-hidden text-center">
              
              {/* Subtle Decorative Ambient Lighting */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs uppercase tracking-wider mb-6 border border-orange-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join in 24 Hours</span>
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
                  Start Receiving Verified Repair Bookings This Week.
                </h2>

                <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join 1,250+ certified technicians in West Bengal. Experience reliable weekly earnings,
                  genuine spare parts backing, and total schedule freedom with zero joining fees.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/vendor-apply')}
                    className="inline-flex items-center gap-2.5 px-9 py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-extrabold text-base shadow-xl shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <span>Submit Partner Application</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <a
                    href="tel:+919830012345"
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-orange-400" />
                    <span>Talk to Partner Desk</span>
                  </a>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    100% Free Signup
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    24h Verification
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Weekly Direct UPI / Bank Settlement
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* ══ MOBILE STICKY FLOATING APPLY BAR ═══════════════════════ */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 flex items-center justify-between gap-3 shadow-xl">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#0B1E40] truncate">Become a Magic Mistry Partner</p>
          <p className="text-[11px] text-emerald-600 font-bold">Earn ₹35K - ₹65K+ / mo · ₹0 Fee</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/vendor-apply')}
          className="px-5 py-2.5 rounded-xl bg-orange-600 active:bg-orange-700 text-white text-xs font-extrabold shrink-0 shadow-md flex items-center gap-1 cursor-pointer"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
