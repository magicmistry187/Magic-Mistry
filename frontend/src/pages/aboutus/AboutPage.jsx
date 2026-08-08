import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Award, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Users, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Compass, 
  Star,
  Settings,
  Shield,
  Building2,
  Cpu,
  History,
  HeartHandshake
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

// Reusable Shimmer Image Loader Component for smooth visuals
const AnimatedImage = ({ src, alt, containerClassName = "", imgClassName = "" }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className={`relative overflow-hidden bg-slate-200/70 ${containerClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />
    </div>
  );
};

export default function AboutPage() {
  const navigate = useNavigate();

  // Framer Motion Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: -35 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const fadeRight = {
    hidden: { opacity: 0, x: 35 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const companyMilestones = [
    {
      year: '2021',
      title: 'Company Foundation',
      description: 'Magic Mistry was incorporated in Kolkata to eliminate chaotic home repair services, unverified mechanics, and hidden fees.'
    },
    {
      year: '2022',
      title: 'Statewide Network Expansion',
      description: 'Expanded across West Bengal (Kolkata, Howrah, Hooghly, Durgapur, Siliguri, Asansol) with 100% background-checked technicians.'
    },
    {
      year: '2023',
      title: '50,000+ Completed Repairs',
      description: 'Reached a landmark milestone of 50,000 successful doorstep appliance repairs with our signature 30-day service warranty.'
    },
    {
      year: '2024',
      title: 'ISO 9001:2015 & NABL Standards',
      description: 'Standardized PCB circuit board diagnostics and quality control processes under certified lab frameworks.'
    }
  ];

  const companyPillars = [
    {
      icon: Cpu,
      title: 'Technical Precision & Training',
      desc: 'Our engineers undergo rigorous diagnostic training on inverter PCB logic, split AC compressors, and modern motor microcontrollers.'
    },
    {
      icon: ShieldCheck,
      title: 'Rigorous Police & Background Vetting',
      desc: 'Every field mechanic is police-verified, background-checked, and certified before visiting customer homes.'
    },
    {
      icon: HeartHandshake,
      title: 'Unwavering Customer-First Ethics',
      desc: 'We operate on a strict 100% Pay-After-Service policy — customers only pay after testing and verifying the working appliance.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans relative overflow-x-hidden">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-1/4 left-5 w-[500px] h-[500px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-2/3 right-5 w-[500px] h-[500px] bg-orange-100/50 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none -z-0" />

      <Navbar />

      <main className="flex-1 z-10">
        
        {/* 1. HERO HEADER SECTION */}
        <section className="relative w-full overflow-hidden bg-[#0B1E40] text-white">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2070&auto=format&fit=crop" 
              alt="Magic Mistry Engineering Laboratory" 
              className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1E40] via-[#0B1E40]/95 to-[#0B1E40]/70 z-10" />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/20 mb-6 border border-orange-400/40">
                <Building2 className="w-4 h-4 text-orange-100" />
                <span>Company Overview &amp; Story</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] mb-6">
                About Magic Mistry
              </h1>
              
              <p className="text-slate-300 text-lg sm:text-xl font-normal leading-relaxed max-w-2xl mb-8">
                Magic Mistry is West Bengal's leading tech-enabled home electronics service organization. Founded on technical precision, absolute pricing transparency, and verified doorstep service, we redefine home appliance care.
              </p>

              {/* Quick Trust Badges */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-xs font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ISO 9001:2015 Certified</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-xs font-bold text-slate-200">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>NABL Quality Standards</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>50,000+ Completed Services</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. STATS & COMPANY METRICS BAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            <div className="p-3">
              <span className="text-3xl sm:text-4xl font-black text-[#0B1E40] block tracking-tight">50,000+</span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold mt-1 block">Satisfied Households</span>
            </div>
            <div className="p-3 border-l border-slate-100">
              <span className="text-3xl sm:text-4xl font-black text-orange-600 block tracking-tight">98%</span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold mt-1 block">First-Visit Resolution</span>
            </div>
            <div className="p-3 border-l border-slate-100">
              <span className="text-3xl sm:text-4xl font-black text-[#0B1E40] block tracking-tight">4.9 ★</span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold mt-1 block">Customer Rating</span>
            </div>
            <div className="p-3 border-l border-slate-100">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 block tracking-tight">100%</span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold mt-1 block">Police-Verified Team</span>
            </div>
          </motion.div>
        </section>

        {/* 3. WHO WE ARE & OUR COMPANY STORY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center"
          >
            <motion.div variants={fadeLeft} className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wide">
                <Building2 className="w-3.5 h-3.5" />
                <span>Our Corporate Background</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight leading-tight">
                Engineering Excellence &amp; Honest Servicing
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Founded in Kolkata, <strong>Magic Mistry</strong> was established to transform the unorganized home electronics repair sector into a professional, transparent, and technology-driven service industry.
              </p>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Prior to Magic Mistry, homeowners faced chronic issues: unpredictable visiting charges, unverified technicians entering their homes, and low-quality imitation spare parts. We engineered a platform that guarantees fixed package pricing, verified field mechanics, and genuine OEM component replacements.
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 text-sm font-bold text-[#0B1E40]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>ISO 9001:2015 Certified Operations Framework</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-bold text-[#0B1E40]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Transparent Upfront Quotes Prior to Repair Work</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-bold text-[#0B1E40]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Comprehensive 30-Day Free Re-Inspection &amp; Warranty</span>
                </div>
              </div>
            </motion.div>

            {/* Right Company Image Box */}
            <motion.div 
              variants={fadeRight}
              className="lg:col-span-6 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative min-h-[400px]"
            >
              <AnimatedImage
                src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=2070&auto=format&fit=crop"
                alt="Magic Mistry Engineering Workshop"
                containerClassName="w-full h-full"
                imgClassName="transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E40]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs font-extrabold bg-orange-500 text-white px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                  Established 2021
                </span>
                <h4 className="text-lg font-bold">Kolkata Engineering Center &amp; Quality Lab</h4>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 4. COMPANY PILLARS & WORK ETHICS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="text-xs font-black uppercase tracking-widest text-orange-600 mb-2 block">Why We Succeed</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight">
              Our Core Company Pillars
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto font-medium mt-2">
              The operational principles that guide our technicians and customer care team every single day.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {companyPillars.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
                      <IconComp className="w-7 h-7" />
                    </div>
                    <h3 className="font-extrabold text-xl text-[#0B1E40] mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* 5. COMPANY HISTORY & MILESTONES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2 block">Our Track Record</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E40] tracking-tight">
              Company History &amp; Growth Milestones
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {companyMilestones.map((evt, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeUp}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#0B1E40] text-white font-black text-sm flex items-center justify-center mb-4 shadow-md">
                    {evt.year}
                  </div>
                  <h3 className="text-base font-extrabold text-[#0B1E40] mb-2">{evt.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 6. MISSION & VISION SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8 items-stretch"
          >
            {/* Mission Card */}
            <motion.div 
              variants={fadeLeft}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 rounded-l-3xl" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
                  <Target className="w-7 h-7" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2 block">Our Mission</span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E40] mb-4">
                  Eliminating Home Repair Anxiety
                </h2>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Our mission is to eliminate home repair hassles across West Bengal. By combining skilled technicians, transparent fixed pricing, and live service status tracking, we ensure every customer gets their appliances working like new without any stress.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-extrabold text-blue-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Zero Hidden Fees Guaranteed</span>
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div 
              variants={fadeRight}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-[#0B1E40] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-orange-500 rounded-l-3xl" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6 shadow-sm">
                  <Compass className="w-7 h-7" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-orange-400 mb-2 block">Our Vision</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
                  Eastern India's Most Trusted Service Network
                </h2>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  To become the household name for doorstep electronics servicing by combining ISO 9001:2015 quality standards with fast 60-minute express service availability in every neighborhood.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-extrabold text-orange-400">
                <CheckCircle2 className="w-4 h-4 text-orange-400" />
                <span>100% Verified Appliance Mechanics</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 7. BOTTOM CORPORATE CALL TO ACTION */}
        <section className="max-w-6xl mx-auto px-4 py-12 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#0B1E40] via-blue-900 to-[#0B1E40] rounded-3xl p-8 sm:p-12 text-white shadow-2xl text-center relative overflow-hidden border border-blue-900/50"
          >
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-extrabold uppercase tracking-wider mb-4">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                Certified Service Quality
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Experience Professional Home Servicing
              </h2>

              <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
                Connect with our certified support team or schedule doorstep service with a 100% pay-after-service guarantee.
              </p>

              <button
                onClick={() => navigate('/booking')}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base px-8 py-4 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Book Service Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
