import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText, User, Calendar, CreditCard, Wrench, AlertTriangle, Scale, Mail } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const termsData = [
  {
    id: 1,
    icon: FileText,
    title: "1. Introduction",
    content: (
      <div className="space-y-4">
        <p>
          Welcome to Fixit Pro. These Terms & Conditions govern your use of our
          website, mobile application, and the professional repair services
          offered through our platform. By accessing or using Fixit Pro, you agree
          to be bound by these terms. If you do not agree to all of these terms,
          please do not use our services.
        </p>
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <p className="text-slate-700">
            Fixit Pro acts as a professional aggregator and service provider platform
            connecting skilled technicians with homeowners and businesses for
            appliance repair and maintenance needs.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    icon: User,
    title: "2. User Accounts",
    content: (
      <div className="space-y-3">
        <p>
          To access certain features of Fixit Pro, you must create a user
          account. You are responsible for:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {[
            "Maintaining the confidentiality of your account credentials.",
            "Ensuring all information provided is accurate and up-to-date.",
            "All activities that occur under your account.",
            "Notifying us immediately of any unauthorized use."
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span className="text-sm text-slate-700">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 3,
    icon: Calendar,
    title: "3. Service Bookings",
    content: (
      <div className="space-y-5">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 md:p-5">
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> Booking Confirmation
          </h4>
          <p className="text-sm text-slate-600">
            A booking is considered confirmed only when you receive an electronic
            confirmation via email or SMS. Fixit Pro reserves the right to decline
            any service request based on technician availability or service area
            constraints.
          </p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 md:p-5">
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-500" /> Inspection & Diagnostic Fees
          </h4>
          <p className="text-sm text-slate-600">
            A standard visit and diagnostic fee applies to all service requests.
            This fee is mandatory regardless of whether you choose to proceed with
            the suggested repairs after the initial assessment.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    icon: CreditCard,
    title: "4. Payments & Cancellations",
    content: (
      <div className="space-y-4">
        <p className="mb-4">
          Payment for services rendered must be made through our secure integrated
          payment gateway or as specified during the booking process.
        </p>
        <div className="space-y-3">
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Cancellations</h4>
              <p className="text-sm text-slate-600">Bookings cancelled more than 4 hours before the scheduled time incur no penalty.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-bold">!</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Late Cancellations</h4>
              <p className="text-sm text-slate-600">Cancellations made within 4 hours of the scheduled appointment may be subject to a nominal cancellation fee.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Refunds</h4>
              <p className="text-sm text-slate-600">Refund requests for prepaid services are processed within 5-7 business days if the service was not initiated due to company reasons.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    icon: Wrench,
    title: "5. Vendor Responsibilities",
    content: (
      <div className="space-y-3">
        <p>
          Fixit Pro ensures all technicians are background-checked and professionally
          vetted. However, technicians operate as specialized service partners.
          Fixit Pro warrants that:
        </p>
        <ul className="list-none space-y-3 mt-4">
          {[
            "All parts used in repairs are genuine or high-quality equivalent components as per the SLA.",
            "Technicians will follow standard safety protocols during the repair process.",
            "A limited warranty period of 30 days is provided on labor for the specific issue repaired."
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">{i + 1}</span>
              </div>
              <span className="text-sm text-slate-700 leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 6,
    icon: AlertTriangle,
    title: "6. Limitation of Liability",
    content: (
      <div className="space-y-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl">
          <p className="text-red-900 text-sm font-medium mb-3">
            To the maximum extent permitted by law, Fixit Pro shall not be liable for
            any indirect, incidental, or consequential damages resulting from the use
            of our services. This includes but is not limited to loss of data,
            property damage beyond the scope of repair, or business interruption.
          </p>
          <p className="text-red-900 text-sm font-medium">
            Our total liability for any claim arising out of the service shall not
            exceed the total amount paid by the customer for that specific service
            booking.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    icon: Scale,
    title: "7. Governing Law",
    content: (
      <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <Scale className="w-5 h-5 text-slate-600" />
        </div>
        <p className="text-slate-700 text-sm leading-relaxed">
          These Terms & Conditions shall be governed by and construed in accordance
          with the laws of India. Any disputes arising under or in connection with
          these terms shall be subject to the exclusive jurisdiction of the courts in
          <span className="font-semibold text-slate-900"> Bangalore, Karnataka</span>.
        </p>
      </div>
    ),
  },
];

const AccordionItem = ({ item, isOpen, onClick, index }) => {
  const Icon = item.icon;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-2xl mb-4 overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white border-indigo-200 shadow-lg shadow-indigo-900/5' : 'bg-white/60 border-slate-200 hover:border-indigo-300 hover:shadow-md hover:bg-white'}`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left focus:outline-none group"
      >
        <div className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-110' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className={`text-lg md:text-xl font-bold flex-1 transition-colors duration-300 ${isOpen ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
          {item.title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 md:px-6 pb-6 pt-2 text-slate-600 text-base leading-relaxed pl-[84px] md:pl-[96px]">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function TermsAndConditions() {
  const [openSection, setOpenSection] = useState(0);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f8fafc] flex flex-col w-full font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -40, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 w-[35rem] h-[35rem] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70" 
          />
          <motion.div
            animate={{ y: [0, 40, 0], scale: [1, 1.25, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute top-64 -right-32 w-[45rem] h-[45rem] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70" 
          />
        </div>

        {/* Header Section */}
        <header className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 z-10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-indigo-600 mb-6 font-medium text-sm tracking-wide uppercase">
                <FileText className="w-4 h-4" />
                Legal Agreements
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Conditions</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                These terms govern your use of Fixit Pro. Please read them carefully to understand your rights and our obligations.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200/50">
                <Calendar className="w-4 h-4" />
                Last Updated: October 24, 2023
              </div>
            </motion.div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 z-10">
          <div className="flex flex-col">
            {termsData.map((item, index) => (
              <AccordionItem
                key={item.id}
                item={item}
                index={index}
                isOpen={openSection === index}
                onClick={() => toggleSection(index)}
              />
            ))}
          </div>

          {/* Contact Support Block */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-16 -mt-16" />
            <div className="flex items-center gap-5 z-10">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Have legal questions?</h3>
                <p className="text-slate-600">
                  If you need clarification on any of these terms, please contact our Legal Department.
                </p>
              </div>
            </div>
            <a
              href="mailto:legal@fixitpro.com"
              className="z-10 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-indigo-600 transition-colors duration-300 whitespace-nowrap gap-2"
            >
              Contact Legal
            </a>
          </motion.div>
        </main>
      </div>
      <Footer />
    </>
  );
}