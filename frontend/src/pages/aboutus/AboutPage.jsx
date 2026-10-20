import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Wrench, 
  Award, 
  Clock, 
  Users, 
  Target, 
  Compass, 
  Star, 
  HeartHandshake, 
  MapPin, 
  Sparkles, 
  Check, 
  Zap, 
  PhoneCall, 
  CheckCircle, 
  Calendar, 
  Building2, 
  Shield, 
  FileCheck, 
  Gauge, 
  BadgeCheck,
  Cpu,
  ChevronRight,
  Layers,
  ThumbsUp,
  IndianRupee,
  Flame,
  Droplets,
  Wind,
  Settings,
  Quote,
  ChevronLeft,
  Sliders,
  UserCheck
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

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

/* ─── Appliance Diagnostic Specialization Matrix ─────────────────── */
const APPLIANCE_SPECIALIZATIONS = [
  {
    id: 'ac',
    name: 'Inverter & Split ACs',
    category: 'HVAC Diagnostics',
    icon: Wind,
    failure: 'PCB error codes, copper coil microscopic pinhole gas leaks, low cooling, compressor start tripping.',
    tools: 'Fluke True-RMS Multimeter, Nitrogen pressure leak detector (350 PSI), Digital manifold gauge.',
    protocol: 'Nitrogen leak test performed before any gas top-up to prevent recurring leakage and fraudulent recharges.',
    eta: '30–45 Mins Diagnostic',
    warranty: '90-Day Gas & PCB Warranty',
    badge: 'Inverter Certified',
  },
  {
    id: 'refrigerator',
    name: 'Frost-Free & Inverter Fridges',
    category: 'Refrigeration Cycle',
    icon: Droplets,
    failure: 'Ice buildup in evaporator coils, lower compartment not cooling, linear inverter hum, burnt relay.',
    tools: 'Laser IR thermometer, Bi-metal thermal fuse tester, Sealed-system vacuum recovery pump.',
    protocol: 'Systematic capillary tube flushing and genuine OEM overload protector installation.',
    eta: '25–40 Mins Diagnostic',
    warranty: '30-Day Doorstep Warranty',
    badge: 'Sealed Cycle Lab',
  },
  {
    id: 'washing-machine',
    name: 'Front & Top Load Washers',
    category: 'Motor & Hydraulics',
    icon: Layers,
    failure: 'Vibration during high-speed spin, drain pump blockage, door interlock error, digital control board triac burn.',
    tools: 'Hall sensor tester, Drum spider balance gauge, Digital solenoid test harness.',
    protocol: 'Live water fill, automatic spin balance calibration, and drain line pressure descaling.',
    eta: '30–50 Mins Diagnostic',
    warranty: '30-Day Mechanical Warranty',
    badge: 'Direct Drive Pro',
  },
  {
    id: 'microwave',
    name: 'Microwave & Convection Ovens',
    category: 'High Voltage RF',
    icon: Flame,
    failure: 'Sparks in heating cavity, turntable motor seized, zero heat output, membrane keypad unresponsive.',
    tools: 'High-voltage diode tester, RF microwave leakage detector, Thermal fuse probe.',
    protocol: 'Mandatory high-voltage capacitor safe discharge and microwave radiation emission barrier check.',
    eta: '20–35 Mins Diagnostic',
    warranty: '30-Day Electrical Warranty',
    badge: 'High-Voltage Safety',
  },
  {
    id: 'geyser',
    name: 'Water Geysers & Purifiers',
    category: 'Thermal & Filtration',
    icon: Zap,
    failure: 'Geyser tripping main MCB, slow heating, RO water flow stoppage, high TDS mineral reading.',
    tools: 'Digital TDS meter, Megger insulation tester, Pressure relief valve gauge.',
    protocol: 'Sacrificial anode inspection and tank sediment flushing on every heating element service.',
    eta: '25–35 Mins Diagnostic',
    warranty: '30-Day Free Rework',
    badge: 'Electrical Safety',
  },
];

/* ─── 7-Point Service Protocol Detailed ──────────────────────────── */
const PROTOCOL_STEPS = [
  {
    step: '01',
    title: 'Pre-Visit Customer Briefing',
    phase: 'Intake & Parts Matching',
    desc: 'Technician calls 15 minutes before arrival to confirm appliance symptoms and ensure exact brand OEM parts are on the service bike.',
    tooling: 'Technician Partner App & Route Dispatcher',
    checkpoint: 'Customer confirms symptoms and agrees on estimated arrival window.',
  },
  {
    step: '02',
    title: 'Digital Multimeter Diagnostic',
    phase: 'Precision Technical Root-Cause',
    desc: 'Comprehensive electrical circuit continuity, voltage drop, and capacitor microfarad reading before dismantling any component.',
    tooling: 'Fluke True-RMS Multimeter & Thermal Laser Probe',
    checkpoint: 'Homeowner shown exact faulty meter reading before any component is unscrewed.',
  },
  {
    step: '03',
    title: 'Upfront Price Confirmation',
    phase: 'Zero-Haggling Rate Card Lock',
    desc: 'Exact component and repair labor costs confirmed directly from our digital company rate card before any wrench is turned.',
    tooling: 'Digital Transparent Rate Card',
    checkpoint: 'Zero hidden surprise charges; work proceeds only upon customer digital approval.',
  },
  {
    step: '04',
    title: 'Company-Sealed OEM Replacement',
    phase: 'Authentic Part Installation',
    desc: 'Only 100% factory-sealed genuine spare parts installed with verifiable manufacturer serial and batch hologram.',
    tooling: 'OEM Manufacturer Hologram Packaging',
    checkpoint: 'Sealed packet opened right in front of the customer with old faulty part handed back.',
  },
  {
    step: '05',
    title: '15-Minute Load & Stress Testing',
    phase: 'Live Operational Validation',
    desc: 'The repaired appliance is run under maximum operating capacity (e.g. 18°C cooling or 1200 RPM spin) for a continuous 15 minutes.',
    tooling: 'Digital Clamp Meter & Laser Tachometer',
    checkpoint: 'Customer physically confirms appliance is operating smoothly with zero abnormal noise or leakage.',
  },
  {
    step: '06',
    title: 'Workspace Cleaning & Debris Removal',
    phase: 'Respectful Doorstep Courtesy',
    desc: 'Technician wipes down all panels, vacuums dust, removes cut wires and part packaging, leaving your home spotless.',
    tooling: 'Microfiber Cleaning Kit & Disposal Bag',
    checkpoint: 'Customer inspects clean floor and work area before sign-off.',
  },
  {
    step: '07',
    title: 'Digital Invoice & 30-Day Warranty',
    phase: 'Guarantee & Ironclad Protection',
    desc: 'Instant digital invoice sent via SMS/WhatsApp with our signature 30-day free rework warranty activated immediately.',
    tooling: 'Automated Warranty Registration System',
    checkpoint: '100% Pay After Testing via UPI or Cash only once satisfied.',
  },
];

/* ─── Company Milestones ─────────────────────────────────────────── */
const MILESTONES = [
  {
    year: '2021',
    tag: 'The Beginning',
    title: 'Founded in South Kolkata',
    desc: 'Started by a team of engineers and technicians tired of seeing elderly parents and families get overcharged by unvetted local mechanics.',
  },
  {
    year: '2022',
    tag: 'Rapid Expansion',
    title: 'Hyperlocal Hub Network',
    desc: 'Expanded into Howrah, Hooghly, and Salt Lake with our signature 60-minute doorstep express dispatch and fixed upfront rate cards.',
  },
  {
    year: '2023',
    tag: 'OEM Parts Hub',
    title: 'Direct Spare Parts Supply',
    desc: 'Established authorized supply chains with certified component manufacturers to eliminate counterfeit and duplicate parts from local repairs.',
  },
  {
    year: '2024+',
    tag: '50,000+ Landmark',
    title: 'West Bengal’s Most Trusted Network',
    desc: 'Surpassed 50,000 verified doorstep services, supporting 1,200+ skilled local mistry partners with fair weekly pay and accidental insurance.',
  },
];

/* ─── Leadership & Standards Council ─────────────────────────────── */
const LEADERSHIP_COUNCIL = [
  {
    name: 'Subhashis Mukherjee',
    role: 'Head of Technical Diagnostics & Training',
    exp: '19+ Years Experience',
    bio: 'Former Senior Technical Trainer for national HVAC & Inverter brands. Oversees our South Kolkata diagnostic training lab and technician trade certifications.',
    badge: 'HVAC & Inverter Electronics Master',
  },
  {
    name: 'Ananya Sen',
    role: 'VP of Safety, Vetting & Customer Assurance',
    exp: '12+ Years Experience',
    bio: 'Specialist in service operations and field personnel compliance. Spearheaded our 3-tier police background verification and the 30-day customer warranty cell.',
    badge: 'Operations & Safety Vetting Lead',
  },
  {
    name: 'Debabrata Ghosh',
    role: 'Chief Field Quality Auditor',
    exp: '22+ Years Hands-on Experience',
    bio: 'Veteran master technician who conducts surprise on-site quality spot-checks across Howrah, Salt Lake, and Kolkata to enforce zero-cheat standards.',
    badge: 'Master Field Auditor',
  },
];

/* ─── Service Districts with Dispatch Data ────────────────────────── */
const SERVICE_DISTRICTS = [
  {
    id: 'kolkata-south',
    name: 'South Kolkata & Jadavpur',
    hubAddress: 'Gariahat Service Depot, Kolkata 700029',
    avgEta: '35–45 Mins',
    activeTechs: '140+ Certified Mistrys',
    areas: 'Gariahat, Ballygunge, Tollygunge, Jadavpur, Garia, Behala, Alipore, New Alipore',
    highlight: 'Highest volume hub with dedicated inverter PCB repair bench.',
  },
  {
    id: 'saltlake-newtown',
    name: 'Salt Lake & New Town',
    hubAddress: 'Sector V Express Dispatch Station, Kolkata 700091',
    avgEta: '30–40 Mins',
    activeTechs: '110+ Certified Mistrys',
    areas: 'Sector I to V, Action Area I-III, Rajarhat, Kestopur, Baguiati, Kaikhali',
    highlight: 'Rapid response zone for IT corridors and high-rise apartment complexes.',
  },
  {
    id: 'kolkata-north',
    name: 'Kolkata Central & North',
    hubAddress: 'Shyambazar Central Depot, Kolkata 700004',
    avgEta: '35–50 Mins',
    activeTechs: '95+ Certified Mistrys',
    areas: 'Shyambazar, Girish Park, College Street, Burrabazar, Phoolbagan, Maniktala',
    highlight: 'Specialized in heritage residences, compact apartments, and heavy-duty wiring.',
  },
  {
    id: 'howrah',
    name: 'Howrah & Shibpur',
    hubAddress: 'Howrah Maidan Quick Response Center, Howrah 711101',
    avgEta: '40–50 Mins',
    activeTechs: '80+ Certified Mistrys',
    areas: 'Howrah Station, Shibpur, Santragachi, Salkia, Liluah, Bally, Mandirtala',
    highlight: 'Dedicated cross-river express fleet with specialized water pump & AC technicians.',
  },
  {
    id: 'hooghly',
    name: 'Hooghly & Serampore',
    hubAddress: 'GT Road Service Terminal, Serampore 712201',
    avgEta: '45–60 Mins',
    activeTechs: '65+ Certified Mistrys',
    areas: 'Serampore, Uttarpara, Konnagar, Rishra, Chandannagar, Chinsurah',
    highlight: 'Full suburban doorstep coverage along the Grand Trunk Road belt.',
  },
  {
    id: 'north24',
    name: 'North 24 Parganas Belt',
    hubAddress: 'Jessore Road Dispatch Hub, Dum Dum 700028',
    avgEta: '40–55 Mins',
    activeTechs: '75+ Certified Mistrys',
    areas: 'Dum Dum, Nagerbazar, Belgharia, Sodepur, Barrackpore, Barasat, Madhyamgram',
    highlight: 'Express airport corridor and residential township service grid.',
  },
];

/* ─── Ground Verified Customer Stories ───────────────────────────── */
const CUSTOMER_STORIES = [
  {
    quote: "Our inverter refrigerator stopped cooling on a humid Sunday right before a family lunch. Magic Mistry's technician arrived in 40 minutes, tested the relay on a digital multimeter, and replaced only the faulty start capacitor instead of claiming the compressor was dead. Transparent, professional, and deeply honest.",
    author: "Dr. A. Banerjee",
    location: "Ballygunge Circular Road, South Kolkata",
    appliance: "Samsung Inverter Refrigerator Repair",
    rating: 5,
  },
  {
    quote: "I was deeply skeptical about local mechanics handling an expensive front-load washing machine. Magic Mistry's partner brought proper anti-static tools, installed genuine shock absorbers, and ran a full 15-minute diagnostic spin cycle before requesting payment. Exemplary standard.",
    author: "Rohan Chatterjee",
    location: "New Town, Action Area II",
    appliance: "Bosch Front-Load Washing Machine Service",
    rating: 5,
  },
  {
    quote: "As a senior citizen living alone, safety is my primary concern. The technician showed his police-verified digital ID at the door, wore protective shoe covers, and charged the exact amount shown on the official rate card. Restored my faith in home repairs.",
    author: "Sumita Chakraborty",
    location: "Behala Chowrasta, Kolkata",
    appliance: "Split AC Cooling Diagnostics & Jet Clean",
    rating: 5,
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const [activeProtocolTab, setActiveProtocolTab] = useState(0);
  const [activeApplianceTab, setActiveApplianceTab] = useState(0);
  const [activeDistrictTab, setActiveDistrictTab] = useState(0);

  const currentProtocol = PROTOCOL_STEPS[activeProtocolTab];
  const currentAppliance = APPLIANCE_SPECIALIZATIONS[activeApplianceTab];
  const currentDistrict = SERVICE_DISTRICTS[activeDistrictTab];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-orange-600 selection:text-white">
      <Navbar />

      <main className="flex-1">
        
        {/* ══ 1. HERO SECTION ════════════════════════════════════════ */}
        <section className="relative pt-10 pb-18 lg:pt-16 lg:pb-24 overflow-hidden bg-slate-50 border-b border-slate-200/70">
          {/* Subtle Architectural Dot Matrix Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#0B1E40 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Precision Soft Ambient Radial Gradients */}
          <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-gradient-to-br from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-10 left-10 w-[420px] h-[420px] bg-gradient-to-tr from-orange-100/35 via-amber-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Story & Positioning (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                
                {/* Brand Origin Pill */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-[#0B1E40] text-xs font-bold uppercase tracking-wider mb-6 w-fit"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span>The Magic Mistry Story · Born in Kolkata</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-[#0B1E40] tracking-tight leading-[1.12] mb-5"
                >
                  Fixing Broken Appliances.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">
                    Restoring Household Peace of Mind.
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl"
                >
                  Every Indian home runs on appliances. When your refrigerator stops cooling during a scorching summer
                  or your washing machine breaks down on a hectic morning, daily life comes to a sudden halt.
                  Magic Mistry was built to replace chaotic local mechanic haggling with certified technical precision,
                  transparent fixed rates, and doorstep service you can trust blindly.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap items-center gap-4 mb-10"
                >
                  <button
                    onClick={() => navigate('/booking')}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <span>Book a Doorstep Repair</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => navigate('/become-a-vendor')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300/80 text-[#0B1E40] font-bold text-base shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <Wrench className="w-4 h-4 text-orange-600" />
                    <span>Join as Service Partner</span>
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
                    { title: '50,000+ Repairs', sub: 'Completed in WB', icon: CheckCircle2 },
                    { title: '100% Verified', sub: 'Police & ID Checked', icon: ShieldCheck },
                    { title: '30-Day Warranty', sub: 'Free Rework Guarantee', icon: Award },
                    { title: 'Zero Advance', sub: 'Pay After Testing', icon: IndianRupee },
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

              {/* Right Column: Editorial Visual Showcase (5 cols) */}
              <div className="lg:col-span-5 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Primary Image Frame with Real Technician Photo */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3] sm:aspect-[4/3] group">
                    <img
                      src="/hero-technician.jpg"
                      alt="Certified Magic Mistry Technician diagnosing washing machine"
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
                            Verified Doorstep Care
                          </p>
                        </div>
                        <h4 className="text-base font-extrabold text-white leading-tight">
                          Certified Electronics Technician
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          West Bengal Operations Hub
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold backdrop-blur-xs shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          On Duty
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Metric 1 (Top Left): 100% Pay After Testing */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="absolute -top-4 -left-3 sm:-left-6 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 z-20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0B1E40]">100% Pay After Testing</p>
                      <p className="text-[11px] text-slate-500 font-medium">Zero advance deposit required</p>
                    </div>
                  </motion.div>

                  {/* Floating Metric 2 (Bottom Right): 30-Day Free Rework Warranty */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="absolute -bottom-5 -right-3 sm:-right-6 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 z-20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Award className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0B1E40]">30-Day Service Warranty</p>
                      <p className="text-[11px] text-slate-500 font-medium">Free re-visit if problem recurs</p>
                    </div>
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
                  50,000+
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Households Restored
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Across Kolkata &amp; Bengal districts</p>
              </div>

              <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 text-emerald-600 border border-emerald-100">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-3xl lg:text-4xl font-black text-[#0B1E40] tracking-tight">
                  60 Mins
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Express Arrival Time
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Same-day doorstep dispatch</p>
              </div>

              <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 text-blue-600 border border-blue-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-3xl lg:text-4xl font-black text-[#0B1E40] tracking-tight">
                  98.4%
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  First-Visit Resolution
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Equipped with OEM spare parts</p>
              </div>

              <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center mb-3 text-amber-600 border border-amber-100">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-3xl lg:text-4xl font-black text-[#0B1E40] tracking-tight">
                  4.92 ★
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Customer Rating
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">From 18,000+ verified Google &amp; web reviews</p>
              </div>

            </div>
          </div>
        </section>

        {/* ══ 3. THE PROBLEM & SOLUTION: WHY WE EXIST ════════════════ */}
        <section className="py-20 lg:py-28 bg-slate-100/60 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 font-bold text-xs uppercase tracking-wider mb-4 border border-slate-300/60">
                <Target className="w-3.5 h-3.5 text-orange-600" />
                <span>The Industry Reality</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                Why We Built Magic Mistry
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Before Magic Mistry, getting a home appliance repaired in Kolkata was an exhausting gamble.
                We systematically broke down every customer pain point and replaced it with an ironclad guarantee.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Card 1: The Old Broken Way */}
              <div className="bg-white rounded-3xl p-8 border border-rose-200/80 shadow-md relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 font-black">
                  ✕
                </div>
                <h3 className="text-xl font-extrabold text-[#0B1E40] mb-3">
                  The Traditional Local Mechanic Gamble
                </h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  What Indian households were forced to deal with for decades:
                </p>

                <div className="space-y-3.5 text-sm">
                  {[
                    'Arbitrary visiting charges quoted after opening the appliance.',
                    'Unverified strangers entering private family homes without ID.',
                    'Cheap imitation duplicate parts that fail again within weeks.',
                    'No formal bill or warranty — mechanics disappear when issues reoccur.',
                    'Appliances taken to private workshops for weeks with zero updates.',
                  ].map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-slate-600">
                      <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: The Magic Mistry Standard */}
              <div className="bg-[#0B1E40] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-blue-900">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 font-black">
                  ✓
                </div>
                <h3 className="text-xl font-extrabold text-white mb-3">
                  The Magic Mistry Standard
                </h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  How we transformed home electronics servicing into a professional science:
                </p>

                <div className="space-y-3.5 text-sm">
                  {[
                    '100% Upfront standard rate card. Part costs confirmed before installation.',
                    'Police-verified, background-checked certified technicians in uniform.',
                    'Company-sealed OEM genuine parts with official manufacturer warranty.',
                    '30-Day Free Rework Guarantee if the same symptom returns.',
                    '100% Pay After Service via UPI or Cash only after you test the working appliance.',
                  ].map((sol, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                      <span>{sol}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ══ 4. THE 4 FOUNDATION PILLARS OF OUR OPERATIONS ══════════ */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B1E40] font-bold text-xs uppercase tracking-wider mb-4 border border-blue-200">
                <Award className="w-3.5 h-3.5 text-orange-500" />
                <span>Our Engineering Core</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                The 4 Pillars of Technical Integrity
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                We are not just a booking aggregator. We operate our own diagnostic training labs,
                parts inventory, and technical supervision.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Cpu,
                  title: 'Inverter PCB & Circuit Mastery',
                  desc: 'Modern split ACs and refrigerators are microcomputers. Our technicians receive continuous training in inverter PCB schematics, multimeter testing, and sensor diagnostics.',
                  tag: 'Lab Trained',
                },
                {
                  icon: ShieldCheck,
                  title: 'Rigorous Background Vetting',
                  desc: 'Every field technician undergoes thorough police background verification, address KYC, and hands-on skill audits before visiting customer homes.',
                  tag: '100% Verified',
                },
                {
                  icon: FileCheck,
                  title: 'OEM Component Quality',
                  desc: 'We strictly source factory-sealed capacitors, relays, compressors, and drain pumps directly from authorized brand distributors to eliminate fake parts.',
                  tag: 'Genuine Spares',
                },
                {
                  icon: HeartHandshake,
                  title: 'Pay After Testing Ethics',
                  desc: 'Zero advance deposits. We test your appliance under operational load for 15 minutes before collecting payment via your preferred payment mode.',
                  tag: 'Customer First',
                },
              ].map(({ icon: Icon, title, desc, tag }, i) => (
                <div
                  key={i}
                  className="bg-slate-50/70 rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white text-orange-600 flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-xs border border-slate-200/80">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white text-slate-600 mb-3 border border-slate-200">
                      {tag}
                    </span>
                    <h3 className="text-lg font-black text-[#0B1E40] mb-3 group-hover:text-orange-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Magic Mistry Standard</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ 5. INTERACTIVE APPLIANCE DIAGNOSTIC MATRIX ══════════════ */}
        <section className="py-20 lg:py-28 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
          {/* Subtle Ambient Background Lighting */}
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-300 font-bold text-xs uppercase tracking-wider mb-4 border border-white/15">
                <Cpu className="w-3.5 h-3.5 text-orange-400" />
                <span>Engineering Capabilities</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Appliance Diagnostic Specialization Matrix
              </h2>
              <p className="text-slate-300 text-base sm:text-lg">
                Explore how our technicians isolate root causes using professional testing instrumentation
                instead of trial-and-error guesswork.
              </p>
            </div>

            {/* Interactive Appliance Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
              {APPLIANCE_SPECIALIZATIONS.map((app, idx) => {
                const Icon = app.icon;
                const isSelected = activeApplianceTab === idx;
                return (
                  <button
                    key={app.id}
                    onClick={() => setActiveApplianceTab(idx)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-102'
                        : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{app.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Appliance Detail Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAppliance.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-10 backdrop-blur-md max-w-5xl mx-auto shadow-2xl"
              >
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column (7 cols) */}
                  <div className="lg:col-span-7">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
                        {currentAppliance.category}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        {currentAppliance.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
                      {currentAppliance.name} Diagnostics
                    </h3>

                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Common Failure Symptoms
                        </p>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {currentAppliance.failure}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Standard Diagnostic Protocol
                        </p>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {currentAppliance.protocol}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/booking')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                    >
                      <span>Book {currentAppliance.name} Repair</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right Column: Technical Spec Callouts (5 cols) */}
                  <div className="lg:col-span-5 bg-black/30 rounded-2xl p-6 border border-white/10 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Instrumentation Used
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                          {currentAppliance.tools}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-3 border-t border-white/10">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          On-Site Diagnostic Window
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                          {currentAppliance.eta}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-3 border-t border-white/10">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Warranty Coverage
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                          {currentAppliance.warranty}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </section>

        {/* ══ 6. THE 7-POINT DOORSTEP SERVICE PROTOCOL ═══════════════ */}
        <section className="py-20 lg:py-28 bg-slate-100/70 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-4 border border-emerald-200">
                <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quality Management Standard</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                Our 7-Point Doorstep Service Protocol
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Every single service call follows an exact, documented technical process.
                Click through the steps below to inspect how each phase is executed.
              </p>
            </div>

            {/* Interactive Step Stepper Inspector */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-5xl mx-auto mb-14">
              
              {/* Stepper Buttons Row */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pb-6 border-b border-slate-200">
                {PROTOCOL_STEPS.map((stepItem, idx) => {
                  const isActive = activeProtocolTab === idx;
                  return (
                    <button
                      key={stepItem.step}
                      onClick={() => setActiveProtocolTab(idx)}
                      className={`flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-102'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black font-mono">
                        {stepItem.step}
                      </span>
                      <span className="text-[10px] font-bold truncate max-w-full hidden sm:block mt-0.5">
                        {stepItem.title.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Detailed Content View */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProtocol.step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="pt-8"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-orange-500 font-mono">
                        {currentProtocol.step}
                      </span>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {currentProtocol.phase}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-[#0B1E40]">
                          {currentProtocol.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveProtocolTab((prev) => (prev > 0 ? prev - 1 : PROTOCOL_STEPS.length - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                        title="Previous Step"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-slate-500 px-2">
                        {activeProtocolTab + 1} of {PROTOCOL_STEPS.length}
                      </span>
                      <button
                        onClick={() => setActiveProtocolTab((prev) => (prev < PROTOCOL_STEPS.length - 1 ? prev + 1 : 0))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                        title="Next Step"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                    {currentProtocol.desc}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Professional Tooling Deployed
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-[#0B1E40]">
                        {currentProtocol.tooling}
                      </p>
                    </div>

                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/70">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                        Customer Verification Guarantee
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-950">
                        {currentProtocol.checkpoint}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>

            {/* Complete 7-Step Condensed Overview Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PROTOCOL_STEPS.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveProtocolTab(idx)}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                    activeProtocolTab === idx
                      ? 'border-orange-500 shadow-md ring-2 ring-orange-500/20'
                      : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-lg font-black text-orange-500 font-mono">
                      {p.step}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      ✓
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0B1E40] mb-1 leading-snug">{p.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{p.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ 7. OUR JOURNEY: COMPANY MILESTONES ═════════════════════ */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs uppercase tracking-wider mb-4 border border-amber-200">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Our Track Record</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                From a Kolkata Workshop to 50,000+ Homes
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                How we built a disciplined, technology-driven service network rooted in customer trust.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MILESTONES.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-black text-[#0B1E40] font-mono">
                        {m.year}
                      </span>
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                        {m.tag}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-[#0B1E40] mb-2">{m.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{m.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-semibold text-slate-400">
                    <span>West Bengal Expansion</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ 8. TECHNICAL LEADERSHIP & STANDARDS COUNCIL ════════════ */}
        <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B1E40] font-bold text-xs uppercase tracking-wider mb-4 border border-blue-200">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>The Minds Behind The Quality</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                Field Leadership &amp; Quality Council
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Meet the veteran engineers and safety coordinators who train, certify, and supervise every Magic Mistry partner.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {LEADERSHIP_COUNCIL.map((leader, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#0B1E40] text-white flex items-center justify-center font-black text-xl mb-6 shadow-sm">
                      {leader.name.split(' ').map((n) => n[0]).join('')}
                    </div>

                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 mb-2">
                      {leader.exp}
                    </span>

                    <h3 className="text-xl font-extrabold text-[#0B1E40] mb-1">
                      {leader.name}
                    </h3>

                    <p className="text-xs font-bold text-orange-600 mb-4">
                      {leader.role}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {leader.bio}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{leader.badge}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ 9. TECHNICIAN DIGNITY: ELEVATING BLUE COLLAR TRADES ═════ */}
        <section className="py-20 lg:py-28 bg-[#0B1E40] text-white relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Visual (5 cols) */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-[4/3] sm:aspect-[4/3]">
                  <img
                    src="/technician_workshop.jpg"
                    alt="Magic Mistry Partner at technical workbench"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E40]/90 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Technician Dignity</p>
                    <p className="text-base font-extrabold text-white">Empowering 1,200+ Local Mistrys</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Mission (7 cols) */}
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs uppercase tracking-wider mb-4 border border-orange-500/30">
                  <HeartHandshake className="w-3.5 h-3.5 text-orange-400" />
                  <span>Social Responsibility &amp; Fair Pay</span>
                </span>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-5 leading-tight">
                  Respecting the Hands That Fix Bengal's Homes.
                </h2>

                <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
                  For decades, local mistrys were treated as casual day-laborers with zero job security,
                  unfair commissions, and dangerous working conditions. Magic Mistry was built on the core belief
                  that technical repair is an honorable, skilled profession that deserves dignity, fair weekly earnings,
                  and comprehensive safety protections.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Weekly Guaranteed Payouts',
                      desc: 'Direct bank and UPI transfers every Tuesday with zero hidden deductions.',
                    },
                    {
                      title: '₹2,00,000 Accidental Cover',
                      desc: 'Full on-duty medical and accidental insurance protection for all active technicians.',
                    },
                    {
                      title: 'Professional Uniform & Digital ID',
                      desc: 'Every partner carries a company ID card, printed rate cards, and safety badges.',
                    },
                    {
                      title: 'Skill & Inverter PCB Workshops',
                      desc: 'Free continuous training on modern inverter compressors and microcontroller boards.',
                    },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{benefit.title}</h4>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
                  <button
                    onClick={() => navigate('/become-a-vendor')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>Partner With Us</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-slate-400">
                    Join 1,200+ certified technicians across West Bengal.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ 10. INTERACTIVE SERVICE DISTRICTS & LOCAL COVERAGE ═════ */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider mb-4 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Hyperlocal Presence</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                Service Hubs Across West Bengal
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Click on any region below to inspect active local dispatch depots, average doorstep ETAs, and verified neighborhoods.
              </p>
            </div>

            {/* Region Pill Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
              {SERVICE_DISTRICTS.map((dist, idx) => {
                const isSelected = activeDistrictTab === idx;
                return (
                  <button
                    key={dist.id}
                    onClick={() => setActiveDistrictTab(idx)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B1E40] text-white shadow-md scale-102'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                    <span>{dist.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected District Expanded Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDistrict.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-lg mb-12"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      Primary Dispatch Depot
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#0B1E40]">
                      {currentDistrict.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{currentDistrict.hubAddress}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Average Arrival</p>
                      <p className="text-base font-extrabold text-emerald-600">{currentDistrict.avgEta}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">On-Duty Fleet</p>
                      <p className="text-base font-extrabold text-[#0B1E40]">{currentDistrict.activeTechs}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Neighborhoods Covered:
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {currentDistrict.areas}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                    <p className="text-xs text-slate-500 italic">
                      💡 {currentDistrict.highlight}
                    </p>
                    <button
                      onClick={() => navigate('/booking')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <span>Book Service in {currentDistrict.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Static Grid for Scanning */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {SERVICE_DISTRICTS.map((hub, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveDistrictTab(idx)}
                  className={`bg-slate-50/70 rounded-2xl p-5 border transition-all cursor-pointer ${
                    activeDistrictTab === idx
                      ? 'border-orange-500 shadow-md ring-1 ring-orange-500/30'
                      : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-[#0B1E40]">{hub.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {hub.areas}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ 11. GROUND VERIFIED CUSTOMER STORIES ═══════════════════ */}
        <section className="py-20 lg:py-28 bg-slate-100/60 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-4 border border-emerald-200">
                <Quote className="w-3.5 h-3.5 text-emerald-600" />
                <span>Real Community Feedback</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight mb-4">
                What Kolkata Households Say About Us
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Unfiltered experiences from local families who entrusted us with their essential household appliances.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {CUSTOMER_STORIES.map((story, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-4">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                      "{story.quote}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-orange-600">{story.appliance}</p>
                    <p className="text-sm font-extrabold text-[#0B1E40] mt-0.5">{story.author}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {story.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ 12. CLOSING CALL TO ACTION BANNER ══════════════════════ */}
        <section className="py-20 lg:py-28 bg-slate-100/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0B1E40] via-[#091b3a] to-[#041026] text-white p-8 sm:p-14 lg:p-16 shadow-2xl overflow-hidden text-center">
              
              {/* Subtle Decorative Ambient Lighting */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs uppercase tracking-wider mb-6 border border-orange-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Doorstep Care You Can Rely On</span>
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
                  Ready to Experience Reliable Home Appliance Repair?
                </h2>

                <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join 50,000+ satisfied households across West Bengal. Upfront rates, verified technicians,
                  and 100% pay after testing.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/booking')}
                    className="inline-flex items-center gap-2.5 px-9 py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-extrabold text-base shadow-xl shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <span>Book a Service Now</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <a
                    href="tel:+919830012345"
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-orange-400" />
                    <span>Call Helpline: +91 98300 12345</span>
                  </a>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Zero Advance Deposit
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    30-Day Free Rework Warranty
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    60-Min Express Arrival
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
