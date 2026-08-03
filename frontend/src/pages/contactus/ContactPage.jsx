import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  Mail, Phone, MapPin, Send, Globe, Share2, Users,
  CheckCircle2, ChevronDown, HelpCircle, ShieldCheck,
  Building2, Server, ArrowRight, MessageSquare, Clock,
  Sparkles, PhoneCall
} from 'lucide-react';

// Motion variants
const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
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

export default function ContactPage() {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Accordion State for FAQs
  const [openFaq, setOpenFaq] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
    }, 1200);
  };

  const faqs = [
    {
      q: 'How do I track my repair?',
      a: 'Use our live tracking portal with your service ID to see exactly where your appliance is in the repair chain and track technician arrival in real-time.'
    },
    {
      q: 'Is there a warranty on repairs?',
      a: 'Yes! All functional repairs completed by Magic Mistry come with a standard 30-day parts and labor warranty for your complete peace of mind.'
    },
    {
      q: 'How are spare part charges calculated?',
      a: 'Our fixed service fee covers inspection and basic labor. If any component needs replacement, our technician will provide an upfront cost breakdown for your approval before replacing anything.'
    }
  ];

  const serviceHubs = [
    {
      city: 'Kolkata & WB',
      role: 'HQ & Primary Service Hub',
      techs: '250+ Active Techs',
      icon: Building2
    },
    {
      city: 'Bangalore',
      role: 'Regional Logistics Center',
      techs: '180+ Active Techs',
      icon: Server
    },
    {
      city: 'Delhi NCR',
      role: 'Northern Service Cluster',
      techs: '150+ Active Techs',
      icon: Building2
    },
    {
      city: 'Hyderabad',
      role: 'Southern Support Node',
      techs: '120+ Active Techs',
      icon: Server
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ── 1. HERO BANNER ────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-b from-[#061229] via-[#0B1E40] to-[#0A192F] text-white py-16 sm:py-24 px-4 overflow-hidden">
          {/* Subtle Grid Background Accent */}
          <div className="absolute inset-0 opacity-10 bg-[radial-[#3b82f6]_1px,transparent_1px] [background-size:16px_16px] pointer-events-none" />
          
          {/* Glow lights */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-64 h-64 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-orange-400 text-xs font-semibold backdrop-blur-md shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>24/7 Certified Technician Support</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-tight text-white"
            >
              Get in Touch
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
            >
              We're here to help with all your electronics and appliance repair needs. Our team of certified technicians is ready to provide fast, professional support.
            </motion.p>
          </div>
        </section>

        {/* ── 2. CONTACT INFO & FORM SECTION ──────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 -mt-8 sm:-mt-12 relative z-10 mb-20">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* LEFT CARD: Contact Information */}
            <motion.div
              variants={fadeInUp}
              className="lg:col-span-5 bg-gradient-to-br from-slate-100/90 to-slate-200/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full space-y-8"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B1E40] tracking-tight mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  {/* Office Address */}
                  <div className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-2xl bg-[#0B1E40] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Office Address
                      </p>
                      <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">
                        4th Floor, Tech Hub, Salt Lake Sector V,
                      </p>
                      <p className="text-sm text-slate-600">Kolkata, WB 700091</p>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-2xl bg-[#0B1E40] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <Phone className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Phone Number
                      </p>
                      <p className="text-sm font-bold text-[#0B1E40] mt-0.5">
                        +91 1800 123 4567
                      </p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-[11px] font-bold">
                        Mon - Sat: 9am to 8pm
                      </span>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-2xl bg-[#0B1E40] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email Address
                      </p>
                      <a
                        href="mailto:support@magicmistry.com"
                        className="text-sm font-semibold text-blue-700 hover:underline mt-0.5 block"
                      >
                        support@magicmistry.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social / Community Links */}
              <div className="pt-6 border-t border-slate-300/60">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Follow Our Updates
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="#website"
                    aria-label="Website"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 flex items-center justify-center shadow-xs transition-all hover:scale-105"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                  <a
                    href="#share"
                    aria-label="Share"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 flex items-center justify-center shadow-xs transition-all hover:scale-105"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                  <a
                    href="#community"
                    aria-label="Community"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 flex items-center justify-center shadow-xs transition-all hover:scale-105"
                  >
                    <Users className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* RIGHT CARD: Send us a Message Form */}
            <motion.div
              variants={fadeInUp}
              className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 shadow-xl border border-slate-100 relative overflow-hidden"
            >
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1E40] tracking-tight mb-6">
                Send us a Message
              </h2>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 text-center flex flex-col items-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0B1E40]">Message Sent Successfully!</h3>
                    <p className="text-slate-600 text-sm max-w-sm">
                      Thank you for contacting Magic Mistry. Our support team will get back to you within 2 business hours.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-[#0B1E40] text-white text-xs font-bold hover:bg-blue-900 transition-all shadow-md"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {formError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                        {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
                          required
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 00000 00000"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Subject
                        </label>
                        <div className="relative">
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all appearance-none cursor-pointer pr-10"
                          >
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Booking Status">Booking &amp; Service Status</option>
                            <option value="Technician Feedback">Technician Feedback</option>
                            <option value="Warranty Claim">Warranty Claim</option>
                            <option value="Business Partnership">Business Partnership</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Your Message */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Your Message *
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="How can we help you today?"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all resize-none"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#0B1E40] hover:bg-blue-900 text-white font-extrabold text-sm shadow-lg shadow-blue-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit Request</span>
                          <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </section>

        {/* ── 3. OUR SERVICE NETWORK SECTION ───────────────────────── */}
        <section className="py-16 bg-slate-100/60 border-t border-b border-slate-200/60 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E40] tracking-tight">
                Our Service Network
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Find a Magic Mistry technician near you in these major hubs.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {serviceHubs.map((hub, idx) => {
                const HubIcon = hub.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B1E40] flex items-center justify-center mb-4 group-hover:bg-[#0B1E40] group-hover:text-white transition-colors">
                      <HubIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#0B1E40]">{hub.city}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                        {hub.role}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                        {hub.techs}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── 4. COMMON QUESTIONS & WORKSHOP SHOWCASE ──────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="bg-[#0B1E40] rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-slate-800">
            {/* Left FAQ column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Common Questions
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Quick answers to help you navigate our support.
                </p>
              </div>

              {/* Accordion List */}
              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm transition-all"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-100 hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>{faq.q}</span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-orange-400' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-5 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <Link
                  to="/faq"
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-wider"
                >
                  <span>Visit full FAQ Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Workshop Image Showcase */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl max-w-md w-full group">
                <img
                  src="/technician_workshop.jpg"
                  alt="FixIt Pro Technician Workshop"
                  className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E40] via-transparent to-transparent opacity-80" />

                {/* Badge Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">Verified Tech Workshop</p>
                      <p className="text-[11px] text-slate-300">99.4% Resolution Success</p>
                    </div>
                  </div>
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
