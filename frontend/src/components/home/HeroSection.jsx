import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../auth/LoginRequiredModal';
import LazyImage from '../common/LazyImage';

const HeroSection = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-8, 8, -8],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative flex items-center justify-center bg-slate-50 p-4 sm:p-8 overflow-hidden">
      {/* Background Glowing Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-7xl bg-white border border-slate-100 rounded-[2rem] p-8 lg:p-12 shadow-2xl shadow-slate-200/50"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text & Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center"
          >
            {/* Kicker */}
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
              <span className="h-px w-8 bg-orange-600"></span>
              <span className="text-orange-700 font-bold tracking-wider text-sm uppercase">
                Trusted by 10,000+ Homes
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B1E40] leading-[1.15] mb-6"
            >
              Expert Electronics <br className="hidden lg:block" />
              Repair at Your <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B1E40] to-blue-600">
                Doorstep
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-slate-600 text-lg mb-8 leading-relaxed max-w-lg"
            >
              Fast, reliable, and transparent appliance repair services. Book a
              certified technician in minutes and track your service in real-time.
            </motion.p>

            {/* Primary CTA Buttons */}
            <motion.div variants={itemVariants} className="mb-10 flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowLoginModal(true);
                  } else {
                    navigate('/booking');
                  }
                }}
                className="flex items-center gap-2 bg-[#0B1E40] hover:bg-blue-900 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                Book Service Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const servicesElem = document.getElementById('services');
                  if (servicesElem) {
                    servicesElem.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/booking');
                  }
                }}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[#0B1E40] px-8 py-4 rounded-full font-semibold transition-all cursor-pointer"
              >
                View Pricing
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column: Image & Floating Elements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative h-full w-full"
          >
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] sm:h-[500px] lg:h-[600px] w-full group">
              <div className="absolute inset-0 bg-[#0B1E40]/5 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
              <LazyImage
                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop"
                alt="Expert Technician"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Floating Component */}
            <motion.div
              variants={floatVariants}
              initial="initial"
              animate="animate"
              className="absolute -bottom-6 -left-6 sm:bottom-8 sm:-left-12 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] p-4 sm:p-5 flex items-center gap-4 border border-slate-100 z-20 w-[90%] sm:w-auto"
            >
              <div className="bg-orange-700 text-white p-3 sm:p-4 rounded-full flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[#0B1E40] font-bold text-sm sm:text-base">
                  Verified Professionals
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Background checked &amp; trained
                </p>
              </div>
            </motion.div>

            {/* Secondary Floating Stat Card */}
            <motion.div
              variants={floatVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: "2s" }}
              className="absolute top-8 -right-6 sm:-right-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-white z-20"
            >
              <div className="bg-green-100 text-green-600 p-2.5 rounded-full flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[#0B1E40] font-extrabold text-lg leading-none">
                  4.9/5
                </h4>
                <p className="text-slate-500 text-xs font-medium mt-1">
                  Customer Rating
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
};

export default HeroSection;
