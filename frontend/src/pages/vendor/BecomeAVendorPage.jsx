import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Calendar, CreditCard, Star, Shield, Users,
  CheckCircle2, ArrowRight, Wrench, Award,
  BadgeCheck, Clock, IndianRupee, Briefcase, MapPin,
  ChevronRight, Quote
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

/* ─── Animation Variants ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

/* ─── Why Partner Data ────────────────────────────────────────────── */
const benefits = [
  {
    icon: TrendingUp,
    title: 'Consistent Leads',
    desc: 'Never worry about finding customers again. Our platform connects you with a steady stream of verified repair requests in your area.',
    color: 'blue',
  },
  {
    icon: Calendar,
    title: 'Flexible Schedule',
    desc: 'You decide when and where you work. Accept jobs that fit your schedule and manage your availability from the app.',
    color: 'orange',
  },
  {
    icon: CreditCard,
    title: 'Weekly Payments',
    desc: 'Get paid for your hard work every pay cycle, every week. Our transparent billing ensures direct bank transfers.',
    color: 'green',
  },
];

/* ─── Path to Success Steps ──────────────────────────────────────── */
const steps = [
  {
    num: 1,
    icon: Briefcase,
    title: 'Sign Up & Submit Details',
    desc: 'Fill out our online application form with your details and work experience.',
    color: '#0B1E40',
  },
  {
    num: 2,
    icon: BadgeCheck,
    title: 'Get Verified Online',
    desc: 'Our team reviews your profile. Verification typically takes 24–48 hours.',
    color: '#FF7200',
  },
  {
    num: 3,
    icon: Star,
    title: 'Start Earning',
    desc: 'Once approved, jobs start flowing directly and you start earning weekly.',
    color: '#16a34a',
  },
];

/* ─── Requirements Data ──────────────────────────────────────────── */
const requirements = [
  { icon: Wrench,       text: 'Minimum 1 year of hands-on repair experience' },
  { icon: BadgeCheck,   text: 'Valid government-issued ID proof' },
  { icon: Shield,       text: 'Clean background verification record' },
  { icon: MapPin,       text: 'Own tools and ability to travel within service area' },
  { icon: Clock,        text: 'Availability of at least 20 hours per week' },
  { icon: Award,        text: 'Relevant trade certification (preferred, not mandatory)' },
];

/* ─── Stats ──────────────────────────────────────────────────────── */
const stats = [
  { value: '5,000+', label: 'Active Vendors', icon: Users },
  { value: '₹35K+',  label: 'Avg. Monthly Earning', icon: IndianRupee },
  { value: '4.8★',   label: 'Vendor Satisfaction', icon: Star },
  { value: '24hr',   label: 'Onboarding Time', icon: Clock },
];

/* ═══════════════════════════════════════════════════════════════════ */
export default function BecomeAVendorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans relative overflow-x-hidden">
      {/* Ambient Blobs */}
      <div className="absolute top-1/4 left-5 w-[420px] h-[420px] bg-blue-100/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none -z-0 animate-pulse" />
      <div
        className="absolute top-2/3 right-5 w-[420px] h-[420px] bg-orange-100/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none -z-0 animate-pulse"
        style={{ animationDelay: '2s' }}
      />

      <Navbar />

      <main className="flex-1 z-10">

        {/* ══ 1. HERO ════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-8 overflow-hidden">
          {/* Glowing blobs — same as home */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />

          {/* White card container — same as home */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-7xl bg-white border border-slate-100 rounded-[2rem] p-8 lg:p-12 shadow-2xl shadow-slate-200/50"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left Column: Text & Content */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
                }}
                initial="hidden"
                animate="visible"
                className="flex flex-col justify-center"
              >
                {/* Kicker */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                  className="flex items-center gap-2 mb-6"
                >
                  <span className="h-px w-8 bg-orange-600" />
                  <span className="text-orange-700 font-bold tracking-wider text-sm uppercase">
                    Join 5,000+ Partners Nationwide
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B1E40] leading-[1.15] mb-6"
                >
                  Partner with Fixit Pro &amp;<br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                    Grow Your Business
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                  className="text-slate-600 text-lg mb-8 leading-relaxed max-w-lg"
                >
                  Access a steady stream of verified leads, manage your own schedule, and
                  enjoy transparent weekly payments — trusted network of repair technicians in India.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                  className="mb-10 flex flex-wrap gap-4"
                >
                  <button
                    onClick={() => navigate('/vendor-apply')}
                    className="flex items-center gap-2 bg-[#0B1E40] hover:bg-blue-900 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  >
                    Apply Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/vendor-dashboard')}
                    className="flex items-center gap-2 bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-700 px-7 py-4 rounded-full font-bold transition-all shadow-sm hover:shadow cursor-pointer"
                  >
                    Vendor Dashboard
                    <ArrowRight className="w-4 h-4 text-orange-600" />
                  </button>
                </motion.div>

                {/* Badges Certifications */}
                {/* <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-2 border border-slate-200 bg-white shadow-sm rounded-full px-5 py-2.5 cursor-default hover:border-[#0B1E40] transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-[#0B1E40] fill-[#0B1E40]/10" />
                    <span className="text-sm font-bold text-[#0B1E40]">ISO 9001:2015</span>
                  </div>
                  <div className="flex items-center gap-2 border border-slate-200 bg-white shadow-sm rounded-full px-5 py-2.5 cursor-default hover:border-[#0B1E40] transition-colors">
                    <Award className="w-5 h-5 text-[#0B1E40] fill-[#0B1E40]/10" />
                    <span className="text-sm font-bold text-[#0B1E40]">NABL Certified</span>
                  </div>
                </motion.div> */}
              </motion.div>

              {/* Right Column: Image & Floating Elements */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                className="relative h-full w-full"
              >
                {/* Main Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] sm:h-[500px] lg:h-[600px] w-full group">
                  <div className="absolute inset-0 bg-[#0B1E40]/5 group-hover:bg-transparent transition-colors z-10 duration-500" />
                  <img
                    src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=2069&auto=format&fit=crop"
                    alt="Vendor Technician at Work"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Floating card — bottom left (same style as home) */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-6 sm:bottom-8 sm:-left-12 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] p-4 sm:p-5 flex items-center gap-4 border border-slate-100 z-20 w-[90%] sm:w-auto"
                >
                  <div className="bg-orange-700 text-white p-3 sm:p-4 rounded-full flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[#0B1E40] font-bold text-sm sm:text-base">
                      5,000+ Active Vendors
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                      Growing network across India
                    </p>
                  </div>
                </motion.div>

                {/* Floating stat card — top right (same style as home) */}
                <motion.div
                  animate={{ y: [8, -8, 8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  className="absolute top-8 -right-6 sm:-right-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-white z-20"
                >
                  <div className="bg-green-100 text-green-600 p-2.5 rounded-full flex-shrink-0">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[#0B1E40] font-extrabold text-lg leading-none">
                      ₹35K+
                    </h4>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                      Avg. Monthly Earning
                    </p>
                  </div>
                </motion.div>
              </motion.div>

            </div>
          </motion.div>
        </section>

        {/* ══ 2. STATS STRIP ════════════════════════════════════════ */}
        <section className="bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-100"
            >
              {stats.map(({ value, label, icon: Icon }, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex flex-col items-center justify-center text-center px-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-[#0B1E40]">{value}</span>
                  <span className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ 3. WHY PARTNER ════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1E40] tracking-tight mb-4">
              Why Partner with Us?
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
              We give you the tools, leads, and support to build a thriving repair business on your terms.
            </p>
            <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-orange-500" />
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {benefits.map(({ icon: Icon, title, desc, color }, i) => {
              const colorMap = {
                blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   borderHover: 'hover:border-blue-200',   iconHover: 'group-hover:bg-blue-600'   },
                orange: { bg: 'bg-orange-50',  text: 'text-orange-500', borderHover: 'hover:border-orange-200', iconHover: 'group-hover:bg-orange-500' },
                green:  { bg: 'bg-green-50',   text: 'text-green-600',  borderHover: 'hover:border-green-200',  iconHover: 'group-hover:bg-green-600'  },
              };
              const c = colorMap[color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  style={{ willChange: 'transform' }}
                  className={`bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/50
                    ${c.borderHover} group flex flex-col items-start relative overflow-hidden cursor-default
                    [transition:transform_0.28s_ease,box-shadow_0.28s_ease,border-color_0.28s_ease]
                    hover:[transform:translateY(-10px)] hover:shadow-2xl`}
                >
                  {/* Top accent line on hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
                  <div className={`w-16 h-16 ${c.bg} ${c.text} rounded-2xl flex items-center justify-center mb-6 shadow-inner ${c.iconHover} group-hover:text-white transition-colors duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-xl text-[#0B1E40] mb-3">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ══ 4. PATH TO SUCCESS ════════════════════════════════════ */}
        <section id="path-to-success" className="bg-slate-100/70 py-20 lg:py-28 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1E40] tracking-tight mb-4">
                Your Path to Success
              </h2>
              <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
                Getting started is fast. The following 3 steps will guide you from registration
                to your first earnings in no time.
              </p>
              <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-orange-500" />
            </motion.div>

            {/* ── Number circles row (desktop) with connector line ── */}
            <div className="relative hidden md:grid md:grid-cols-3 gap-8 mb-4">
              {/* Horizontal connector line running through all 3 circles */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[calc(16.67%)] right-[calc(16.67%)] h-px bg-gradient-to-r from-[#0B1E40] via-orange-400 to-green-500 opacity-25 pointer-events-none" />
              {steps.map(({ num, color }, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex justify-center relative z-10"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg"
                    style={{ backgroundColor: color }}
                  >
                    {num}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Cards row ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {steps.map(({ num, icon: Icon, title, desc, color }, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50
                    hover:shadow-2xl hover:-translate-y-2
                    transition-[transform,box-shadow] duration-300 ease-out will-change-transform
                    flex flex-col items-center text-center relative group cursor-default overflow-hidden"
                >
                  {/* Mobile-only number circle (hidden md+, shown on small screens) */}
                  <div className="md:hidden mt-7 mb-1">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-base shadow-md"
                      style={{ backgroundColor: color }}
                    >
                      {num}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="pt-8 pb-4 px-8 flex justify-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="px-8 pb-9">
                    <h3
                      className="font-extrabold text-lg sm:text-xl mb-3 transition-colors duration-300"
                      style={{ color }}
                    >
                      {title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>

                  {/* Top colour bar on hover */}
                  <div
                    className="absolute top-0 inset-x-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: color }}
                  />

                  {/* Bottom glow */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundColor: color }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ 5. VENDOR REQUIREMENTS ════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left: Text */}
            <motion.div variants={fadeLeft}>
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-orange-200">
                <CheckCircle2 className="w-4 h-4" />
                Vendor Requirements
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1E40] tracking-tight mb-4">
                What We Look For in a Partner
              </h2>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8">
                We maintain high standards so our customers always receive the best service.
                Make sure you meet these criteria before applying.
              </p>

              <motion.div
                variants={stagger}
                className="space-y-4"
              >
                {requirements.map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#0B1E40]/5 flex items-center justify-center shrink-0 group-hover:bg-orange-50 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-[#0B1E40] group-hover:text-orange-500 transition-colors duration-300" />
                    </div>
                    <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed pt-1">{text}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA inside requirements */}
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/vendor-apply')}
                className="mt-10 inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-full font-bold text-base shadow-lg shadow-orange-500/30 transition-colors cursor-pointer"
              >
                Check My Eligibility
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Right: Illustration Card */}
            <motion.div variants={fadeRight} className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[420px] sm:h-[500px] group">
                <div className="absolute inset-0 bg-[#0B1E40]/10 group-hover:bg-transparent transition-colors z-10 duration-500" />
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2070&auto=format&fit=crop"
                  alt="Skilled technician at work"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-8 left-8 bg-white rounded-2xl shadow-2xl p-5 flex items-center gap-4 border border-slate-100 z-20"
                >
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[#0B1E40] font-bold text-sm">Verified & Active</p>
                    <p className="text-slate-500 text-xs mt-0.5">Background-checked partners</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ══ 6. TESTIMONIAL ════════════════════════════════════════ */}
        <section className="bg-[#0B1E40] py-20 lg:py-28 relative overflow-hidden">
          {/* Decorative large quote */}
          <div className="absolute top-10 right-10 text-white/5 font-black text-[14rem] leading-none select-none pointer-events-none">
            "
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
            >
              <Quote className="w-12 h-12 text-orange-400 fill-orange-400/20 mx-auto mb-8" />
              <blockquote className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-relaxed mb-10 italic">
                "Joining Magic Mistry was the best decision for my repair shop. My lead flow increased by 300%
                within the first month, and the automated weekly payments make managing finances effortless."
              </blockquote>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-500/40 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop"
                    alt="David Lee"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-base">David Lee</p>
                  <p className="text-slate-400 text-sm">Senior Appliance Repair Expert · Partner since 2023</p>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ 7. FINAL CTA BANNER ═══════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="relative bg-gradient-to-br from-[#0B1E40] to-blue-900 rounded-3xl p-10 sm:p-16 text-white shadow-2xl overflow-hidden text-center"
          >
            {/* Decorative blobs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                Apply to Join Our Network
              </h2>
              <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-xl mx-auto">
                Start the fast-track journey, joining your craft with modern business.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/vendor-apply')}
                className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-400 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-orange-600/40 transition-colors cursor-pointer"
              >
                Submit Application
                <ArrowRight className="w-6 h-6" />
              </motion.button>
              <p className="text-slate-400 text-sm mt-6 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                Your data is safe with us · 100% Secure &amp; Transparent
              </p>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
