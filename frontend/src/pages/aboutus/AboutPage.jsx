import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Award, Eye, Sparkles, Shield, Clock } from 'lucide-react';
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
  // Framer Motion Animation Variants (Optimized for smooth framerate without CSS conflict)
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: -35 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const fadeRight = {
    hidden: { opacity: 0, x: 35 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1
      }
    }
  };

  const cardHover = {
    rest: { y: 0, scale: 1 },
    hover: { 
      y: -8, 
      scale: 1.015,
      transition: { type: "spring", stiffness: 350, damping: 22 } 
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans relative overflow-x-hidden">
      {/* Ambient Background Glowing Blobs for Premium Aesthetics */}
      <div className="absolute top-1/4 left-5 w-[420px] h-[420px] bg-blue-100/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none -z-0 animate-pulse" />
      <div className="absolute top-2/3 right-5 w-[420px] h-[420px] bg-orange-100/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none -z-0 animate-pulse" style={{ animationDelay: '2s' }} />

      <Navbar />

      <main className="flex-1 z-10">
        {/* 1. HERO SECTION */}
        <section className="relative w-full overflow-hidden bg-[#0B1E40]">
          {/* Background Laboratory Technicians Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2070&auto=format&fit=crop" 
              alt="Expert Technicians Working in Electronics Laboratory" 
              className="w-full h-full object-cover object-center scale-105 opacity-35 mix-blend-overlay md:opacity-45"
            />
            {/* Deep Navy Gradients for Legibility & Brand Consistency */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1E40] via-[#0B1E40]/90 to-[#0B1E40]/50 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E40] via-transparent to-transparent opacity-50 z-10" />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-36">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-orange-600/30 mb-6 border border-orange-400/40 cursor-default"
              >
                <Sparkles className="w-4 h-4 text-orange-200 fill-orange-200 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Expert Technical Support</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
                The Experts Behind Your Peace of Mind
              </h1>
              <p className="text-slate-300 text-lg sm:text-xl font-normal leading-relaxed max-w-2xl">
                We don't just fix electronics; we restore the pulse of your home and business through meticulous technical precision.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 2. OUR MISSION SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center"
          >
            {/* Mission Text */}
            <motion.div variants={fadeLeft} className="lg:col-span-7">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1E40] mb-6 tracking-tight">
                Our Mission
              </h2>
              <p className="text-slate-600 text-lg sm:text-xl leading-relaxed font-normal">
                At Magic Mistry, our mission is to eliminate the stress of appliance and electronics failure. We are dedicated to providing reliable, fast, and transparent repair services that prioritize the user's journey. By combining technical mastery with an unwavering commitment to honesty, we ensure every customer feels supported from first contact to final resolution.
              </p>
            </motion.div>

            {/* Metric Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Metric 1: Navy */}
              <motion.div 
                variants={fadeRight}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="bg-[#0F2650] text-white rounded-3xl p-8 shadow-xl shadow-slate-300/60 border border-blue-900/40 flex flex-col justify-center relative overflow-hidden group cursor-default"
              >
                <motion.div variants={cardHover} className="flex flex-col z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                      98%
                    </span>
                    <Shield className="w-9 h-9 text-blue-400/30 group-hover:text-blue-400/60 transition-colors duration-300" />
                  </div>
                  <span className="text-slate-300 font-semibold text-base sm:text-lg">
                    Resolution Rate
                  </span>
                </motion.div>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-400/25 transition-colors duration-500 pointer-events-none" />
              </motion.div>

              {/* Metric 2: Orange */}
              <motion.div 
                variants={fadeRight}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="bg-gradient-to-br from-[#FF7200] to-[#E55A00] text-white rounded-3xl p-8 shadow-xl shadow-orange-500/25 border border-orange-400/30 flex flex-col justify-center relative overflow-hidden group cursor-default"
              >
                <motion.div variants={cardHover} className="flex flex-col z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                      2hr
                    </span>
                    <Clock className="w-9 h-9 text-orange-200/40 group-hover:text-white/70 transition-colors duration-300" />
                  </div>
                  <span className="text-orange-100 font-semibold text-base sm:text-lg">
                    Avg. Response
                  </span>
                </motion.div>
                <div className="absolute bottom-0 right-0 -mr-8 -mb-8 w-32 h-32 rounded-full bg-white/15 blur-2xl group-hover:bg-white/25 transition-colors duration-500 pointer-events-none" />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* 3. OUR STORY SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1E40] tracking-tight mb-3">
              Our Story
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto font-medium">
              Built on a foundation of solving real-world frustrations.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch"
          >
            {/* Left Story Card */}
            <motion.div 
              variants={fadeLeft} 
              className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center relative overflow-hidden group hover:border-slate-200 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="absolute top-0 left-0 w-2 sm:w-2.5 h-full bg-gradient-to-b from-[#0B1E40] via-blue-800 to-orange-500 rounded-l-3xl" />
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E40] mb-6 tracking-tight">
                Born from Necessity
              </h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6">
                Magic Mistry started when our founders experienced the chaotic reality of modern repair services—long wait times, hidden costs, and unprofessional results. They realized that homeowners didn't just need a fix; they needed a partner they could trust.
              </p>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                What began as a small local workshop has grown into a tech-enabled service powerhouse, driven by a proprietary tracking system that ensures you're never in the dark about your repair status.
              </p>
            </motion.div>

            {/* Right Vintage Photo Card */}
            <motion.div 
              variants={fadeRight} 
              className="lg:col-span-5 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-200/60 relative group min-h-[350px] sm:min-h-[440px] bg-slate-200"
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B1E40]/70 via-transparent to-transparent opacity-70 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none" />
              
              <AnimatedImage
                src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=2070&auto=format&fit=crop"
                alt="Vintage Electronics Workshop and Craftsman"
                containerClassName="w-full h-full"
                imgClassName="filter grayscale-[35%] sepia-[15%] contrast-110 group-hover:scale-105 group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-700 ease-out"
              />

              <div className="absolute bottom-6 left-6 right-6 z-20 transform translate-y-2 opacity-90 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                <span className="inline-block px-4 py-1.5 bg-white/95 backdrop-blur-md text-[#0B1E40] font-bold text-xs rounded-xl shadow-lg uppercase tracking-wider border border-white/50">
                  Authentic Craftsmanship
                </span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 4. CORE VALUES SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1E40] tracking-tight">
              Core Values
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto"
          >
            {/* Expertise */}
            <motion.div 
              variants={fadeUp}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-200 transition-colors transition-shadow duration-300 text-center group flex flex-col items-center relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Wrench className="w-9 h-9 transform group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-[#0B1E40] mb-3">
                Expertise
              </h3>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Our technicians undergo continuous certification to stay ahead of the latest technological advancements.
              </p>
            </motion.div>

            {/* Reliability */}
            <motion.div 
              variants={fadeUp}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-orange-200 transition-colors transition-shadow duration-300 text-center group flex flex-col items-center relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                <Award className="w-9 h-9 transform group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-[#0B1E40] mb-3">
                Reliability
              </h3>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                When we set a timeline, we stick to it. Your time is as valuable as the devices we service.
              </p>
            </motion.div>

            {/* Transparency */}
            <motion.div 
              variants={fadeUp}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-slate-300 transition-colors transition-shadow duration-300 text-center group flex flex-col items-center relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-slate-100 text-[#0B1E40] rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-[#0B1E40] group-hover:text-white transition-colors duration-300">
                <Eye className="w-9 h-9 transform group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-[#0B1E40] mb-3">
                Transparency
              </h3>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Clear pricing, live tracking, and honest diagnostics. No hidden fees, ever.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* 5. LEADERSHIP TEAM SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-28 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1E40] tracking-tight">
              Leadership Team
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto"
          >
            {/* Robert Chen */}
            <motion.div 
              variants={fadeUp}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow duration-300 text-center flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#0B1E40] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg group-hover:border-orange-500/40 group-hover:shadow-orange-500/20 transition-colors transition-shadow duration-300 mb-6 relative">
                <AnimatedImage 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=650&auto=format&fit=crop" 
                  alt="Robert Chen" 
                  containerClassName="w-full h-full"
                  imgClassName="group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <h3 className="font-extrabold text-2xl text-[#0B1E40]">
                Robert Chen
              </h3>
              <span className="text-xs sm:text-sm font-bold text-orange-600 mt-1 mb-4 block uppercase tracking-widest">
                Chief Executive Officer
              </span>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                A visionary leader with 20 years in tech operations.
              </p>
            </motion.div>

            {/* Sarah Miller */}
            <motion.div 
              variants={fadeUp}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow duration-300 text-center flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg group-hover:border-orange-500/40 group-hover:shadow-orange-500/20 transition-colors transition-shadow duration-300 mb-6 relative">
                <AnimatedImage 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=650&auto=format&fit=crop" 
                  alt="Sarah Miller" 
                  containerClassName="w-full h-full"
                  imgClassName="group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <h3 className="font-extrabold text-2xl text-[#0B1E40]">
                Sarah Miller
              </h3>
              <span className="text-xs sm:text-sm font-bold text-orange-600 mt-1 mb-4 block uppercase tracking-widest">
                Head of Technical Operations
              </span>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Ensuring every repair meets our gold-standard precision.
              </p>
            </motion.div>

            {/* Marcus Vance */}
            <motion.div 
              variants={fadeUp}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow duration-300 text-center flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#0B1E40] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg group-hover:border-orange-500/40 group-hover:shadow-orange-500/20 transition-colors transition-shadow duration-300 mb-6 relative">
                <AnimatedImage 
                  src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=650&auto=format&fit=crop" 
                  alt="Marcus Vance" 
                  containerClassName="w-full h-full"
                  imgClassName="group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <h3 className="font-extrabold text-2xl text-[#0B1E40]">
                Marcus Vance
              </h3>
              <span className="text-xs sm:text-sm font-bold text-orange-600 mt-1 mb-4 block uppercase tracking-widest">
                Customer Success Lead
              </span>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                The voice of our customers within the heart of our operations.
              </p>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
