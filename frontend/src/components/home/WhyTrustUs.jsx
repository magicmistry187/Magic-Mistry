import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  ThumbsUp, 
  Wrench, 
  Award, 
  CheckCircle2, 
  Star, 
  Users, 
  Shield, 
  ArrowRight,
  Zap,
  Lock,
  Sparkles
} from 'lucide-react';

export default function WhyTrustUs() {
  const navigate = useNavigate();

  const trustFeatures = [
    {
      id: 1,
      icon: ShieldCheck,
      title: '30-Day Service Warranty',
      desc: 'Complete peace of mind. If any issue reoccurs within 30 days, we re-inspect and fix it completely free.',
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/30',
      badge: 'Guaranteed'
    },
    {
      id: 2,
      icon: Clock,
      title: 'Express Doorstep Visit',
      desc: 'Fastest doorstep arrival across West Bengal. Schedule same-day express service within 60 minutes.',
      gradient: 'from-orange-500 to-amber-600',
      shadowColor: 'shadow-orange-500/30',
      badge: '60-Min Visit'
    },
    {
      id: 3,
      icon: ThumbsUp,
      title: 'Transparent Upfront Pricing',
      desc: 'No hidden visiting fees or surprise bills. Clear fixed package prices confirmed before work begins.',
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/30',
      badge: 'No Hidden Fees'
    },
    {
      id: 4,
      icon: Wrench,
      title: '100% Genuine Spare Parts',
      desc: 'We only use authentic, factory-certified replacement components with manufacturer warranty tags.',
      gradient: 'from-purple-500 to-violet-600',
      shadowColor: 'shadow-purple-500/30',
      badge: 'OEM Quality'
    },
    {
      id: 5,
      icon: Award,
      title: 'NABL & ISO Certified Mechanics',
      desc: 'Every technician is police-verified, background-checked, and expert in PCB circuit board diagnosis.',
      gradient: 'from-pink-500 to-rose-600',
      shadowColor: 'shadow-pink-500/30',
      badge: 'Police Verified'
    },
    {
      id: 6,
      icon: Lock,
      title: 'Zero Deposit — Pay After Service',
      desc: 'Never pay in advance! Inspect and test your fully repaired appliance before paying via Cash or UPI.',
      gradient: 'from-cyan-500 to-blue-600',
      shadowColor: 'shadow-cyan-500/30',
      badge: 'Pay Later'
    }
  ];

  const stats = [
    { label: 'Happy Customers', value: '50,000+', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Avg User Rating', value: '4.9 ★', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Verified Mechanics', value: '100%', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Free Warranty', value: '30 Days', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' }
  ];

  // Smooth Stagger Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1]
      }
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Outer Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-[#06152B] rounded-3xl p-6 sm:p-12 text-white shadow-2xl overflow-hidden border border-slate-800/90"
      >
        
        {/* Animated Background Ambient Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -20, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-3xl pointer-events-none" 
        />

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Unmatched Trust &amp; Quality Guarantee</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
          >
            Why Customers Trust{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Magic Mistry
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed"
          >
            West Bengal's premier certified electronics repair platform engineered for honesty, speed, and complete customer satisfaction.
          </motion.p>
        </div>

        {/* Animated Live Counter Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 relative z-10"
        >
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={idx} 
                variants={cardVariants}
                whileHover={{ scale: 1.04, y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white/10 hover:border-blue-400/40 transition-colors shadow-lg"
              >
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-2.5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  <StatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-300 font-semibold mt-0.5">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 6 Smooth Animated Feature Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
        >
          {trustFeatures.map((feat) => {
            const IconComp = feat.icon;
            return (
              <motion.div
                key={feat.id}
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 350, damping: 22 } 
                }}
                className="group relative bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 hover:border-blue-400/60 shadow-xl hover:shadow-blue-500/15 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Top Subtle Shimmer Highlight */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                <div>
                  {/* Icon & Badge Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} text-white flex items-center justify-center shadow-lg ${feat.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <IconComp className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 group-hover:text-blue-300 transition-colors duration-200">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                {/* Bottom Verification Status */}
                <div className="mt-6 pt-3 border-t border-slate-800/90 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verified Protection</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-blue-400" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 pt-8 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10"
        >
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20 animate-bounce" />
              Need Fast Appliance Repair in West Bengal?
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Serving Kolkata, Howrah, Hooghly, Durgapur, Siliguri, Asansol &amp; surrounding districts.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/booking')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm px-8 py-4 rounded-full shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer shrink-0"
          >
            <span>Book Certified Technician Now</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </motion.button>
        </motion.div>

      </motion.div>
    </section>
  );
}
