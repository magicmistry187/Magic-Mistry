import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  Search, ChevronDown, HelpCircle, PhoneCall, Mail,
  ShieldCheck, Wrench, CreditCard, Clock, Sparkles,
  ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare, ArrowRight
} from 'lucide-react';

const faqCategories = [
  { id: 'all', name: 'All Questions', icon: HelpCircle },
  { id: 'booking', name: 'Booking & Scheduling', icon: Clock },
  { id: 'pricing', name: 'Pricing & Payments', icon: CreditCard },
  { id: 'services', name: 'Repairs & Technicians', icon: Wrench },
  { id: 'warranty', name: 'Warranty & Support', icon: ShieldCheck }
];

const allFaqs = [
  {
    id: 1,
    category: 'booking',
    q: 'How do I book an appliance repair service?',
    a: 'Booking is simple! Select your appliance on our home page or booking portal, choose your preferred date and time slot, enter your delivery address in Kolkata/West Bengal, and confirm. No advance payment is needed.'
  },
  {
    id: 2,
    category: 'booking',
    q: 'Can I reschedule or cancel my service booking?',
    a: 'Yes, you can easily reschedule or cancel your booking through your user dashboard under "My Bookings" up to 2 hours before the scheduled time slot without any cancellation fee.'
  },
  {
    id: 3,
    category: 'booking',
    q: 'How soon will a technician arrive at my home?',
    a: 'We offer flexible time slots starting from 2 hours after booking. Our verified technician will arrive within your chosen time slot and will call you 15 minutes before arrival.'
  },
  {
    id: 4,
    category: 'pricing',
    q: 'How are service & inspection charges calculated?',
    a: 'We charge a flat, transparent inspection & service fee for each appliance type. This fee covers technician visit, complete diagnostic, and basic labor.'
  },
  {
    id: 5,
    category: 'pricing',
    q: 'Are spare part replacement costs included in the base fee?',
    a: 'Spare parts are charged extra if replacement is necessary. The technician will inspect the appliance, show you the damaged part, and provide an exact cost estimate before proceeding.'
  },
  {
    id: 6,
    category: 'pricing',
    q: 'What payment methods do you accept?',
    a: 'You only pay after the repair is completed. We accept Cash, UPI (Google Pay, PhonePe, Paytm, BHIM), and all major Credit/Debit cards directly to the technician.'
  },
  {
    id: 7,
    category: 'services',
    q: 'Which appliances do you repair?',
    a: 'We repair ACs (Split & Window), Refrigerators, Washing Machines, Microwaves, Water Purifiers/RO, Geysers, Chimneys, Induction Cooktops, and Air Coolers.'
  },
  {
    id: 8,
    category: 'services',
    q: 'Are your repair technicians background-verified?',
    a: 'Yes! All Magic Mistry technicians undergo thorough background verification, identity check, police clearance, and technical skill certification before joining our platform.'
  },
  {
    id: 9,
    category: 'warranty',
    q: 'Do repairs come with a service warranty?',
    a: 'Absolutely. All functional repairs and replaced spare parts carry an official 30-day Magic Mistry warranty. If the same issue recurs within 30 days, we fix it for free.'
  },
  {
    id: 10,
    category: 'warranty',
    q: 'What if I am not satisfied with the repair quality?',
    a: 'Customer satisfaction is our top priority. If you encounter any issue after service, contact our support team within 30 days and we will dispatch a senior supervisor to resolve it.'
  }
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(1);
  const [helpfulFeedback, setHelpfulFeedback] = useState({});

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleFeedback = (faqId, isHelpful) => {
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: isHelpful }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ── HERO HEADER ────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-b from-[#061229] via-[#0B1E40] to-[#0A192F] text-white py-16 sm:py-20 px-4 overflow-hidden">
          {/* Subtle Grid Accent */}
          <div className="absolute inset-0 opacity-10 bg-[radial-[#3b82f6]_1px,transparent_1px] [background-size:16px_16px] pointer-events-none" />
          
          <div className="relative max-w-4xl mx-auto text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-orange-400 text-xs font-semibold backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Help Center &amp; Support Hub</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-tight text-white"
            >
              Frequently Asked Questions
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
            >
              Have questions about booking, technician visits, transparent pricing, or warranties? We're here to clarify everything.
            </motion.p>

            {/* Search Input Box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-4 max-w-xl mx-auto"
            >
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions by keyword (e.g. warranty, payment, AC)..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/95 text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/30 shadow-xl transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CATEGORY TABS & FAQ ACCORDION SECTION ─────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth mb-8">
            {faqCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1E40] text-white shadow-md shadow-blue-950/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                const feedback = helpfulFeedback[faq.id];

                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 focus:outline-none group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B1E40] flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5 group-hover:bg-[#0B1E40] group-hover:text-white transition-colors">
                          ?
                        </span>
                        <h3 className="font-extrabold text-[#0B1E40] text-base sm:text-lg leading-snug group-hover:text-blue-700 transition-colors">
                          {faq.q}
                        </h3>
                      </div>
                      <span className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition-colors shrink-0 mt-0.5">
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-orange-500' : ''
                          }`}
                        />
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100"
                        >
                          <div className="pl-11 space-y-4">
                            <p>{faq.a}</p>

                            {/* Helpful rating micro-interaction */}
                            <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
                              <span>Was this helpful?</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleFeedback(faq.id, true)}
                                  className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                                    feedback === true
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>Yes</span>
                                </button>
                                <button
                                  onClick={() => handleFeedback(faq.id, false)}
                                  className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                                    feedback === false
                                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  <span>No</span>
                                </button>
                              </div>
                              {feedback !== undefined && (
                                <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Thank you for your feedback!
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No matching questions found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching with a different keyword or contact our 24/7 support team directly.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 px-4 py-2 bg-[#0B1E40] text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* ── STILL HAVE QUESTIONS BANNER ───────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-[#0B1E40] to-[#0A192F] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-black">Still have questions?</h3>
              <p className="text-slate-300 text-sm max-w-md">
                Can't find the answer you're looking for? Contact our support team directly — we're ready 24/7.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                to="/contact"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all text-center flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Us</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="tel:+9118001234567"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-orange-400" />
                <span>+91 1800 123 4567</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
