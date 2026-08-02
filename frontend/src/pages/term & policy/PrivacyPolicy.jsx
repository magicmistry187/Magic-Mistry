import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shield, Database, Users, Lock, UserCheck, Mail } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const privacyData = [
  {
    id: 1,
    icon: Database,
    title: "1. Information We Collect",
    content: (
      <div className="space-y-4">
        <p>
          We collect information to provide better services to all our users. The
          types of information we collect include:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-slate-800">Personal Data:</span>{" "}
            Name, email address, phone number, and billing information provided
            during registration.
          </li>
          <li>
            <span className="font-semibold text-slate-800">Usage Data:</span>{" "}
            Information about how you use our platform, including access times,
            pages viewed, and device information.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 2,
    icon: Users,
    title: "2. How We Use Your Data",
    content: (
      <div className="space-y-3">
        <p>Your personal information is utilized for the following purposes:</p>
        <ul className="list-none space-y-2">
          {[
            "To facilitate and process your service bookings.",
            "To communicate with you regarding updates, offers, and support.",
            "To maintain and improve the security of our platform.",
            "To analyze usage trends and enhance user experience."
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 3,
    icon: UserCheck,
    title: "3. Data Sharing & Third Parties",
    content: (
      <div className="space-y-5">
        <p>
          We do not sell your personal data to third parties. However, we may
          share your information with trusted partners in the following scenarios:
        </p>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Service Providers
          </h4>
          <p className="text-sm">
            Information may be shared with verified technicians and payment
            gateways solely for the purpose of fulfilling your service requests.
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" /> Legal Compliance
          </h4>
          <p className="text-sm">
            We may disclose your data if required by law, regulation, or legal
            process to protect the rights and safety of our users and platform.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    icon: Lock,
    title: "4. Data Security",
    content: (
      <div className="space-y-4">
        <p>
          We implement industry-standard security measures, including encryption
          and secure server hosting, to protect your personal information from
          unauthorized access, alteration, disclosure, or destruction.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-blue-800 text-sm font-medium">
            While we strive to use commercially acceptable means to protect your
            Personal Data, please note that no method of transmission over the
            internet is 100% secure.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    icon: Shield,
    title: "5. Your Privacy Rights",
    content: (
      <div className="space-y-3">
        <p>Depending on your location, you have the right to:</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {[
            "Access the personal information we hold.",
            "Request corrections to inaccurate data.",
            "Request deletion from our systems.",
            "Opt-out of marketing communications."
          ].map((text, i) => (
            <li key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-3 h-3" />
              </div>
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>
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
      className={`border rounded-2xl mb-4 overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white border-blue-200 shadow-lg shadow-blue-900/5' : 'bg-white/60 border-slate-200 hover:border-blue-300 hover:shadow-md hover:bg-white'}`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left focus:outline-none group"
      >
        <div className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-110' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className={`text-lg md:text-xl font-bold flex-1 transition-colors duration-300 ${isOpen ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
          {item.title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}
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

export default function PrivacyPolicy() {
  const [openSection, setOpenSection] = useState(0);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f8fafc] flex flex-col w-full font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70" 
          />
          <motion.div
            animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-48 -left-24 w-[30rem] h-[30rem] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70" 
          />
          <motion.div
            animate={{ x: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-24 left-1/2 w-[40rem] h-[40rem] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70" 
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-blue-600 mb-6 font-medium text-sm tracking-wide uppercase">
                <Shield className="w-4 h-4" />
                Legal & Security
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Policy</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                We believe in complete transparency. Learn exactly how we collect, use, and protect your personal information.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200/50">
                <Lock className="w-4 h-4" />
                Effective Date: October 24, 2023
              </div>
            </motion.div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 z-10">
          <div className="flex flex-col">
            {privacyData.map((item, index) => (
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-16 -mt-16" />
            <div className="flex items-center gap-5 z-10">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Have questions?</h3>
                <p className="text-slate-600">
                  If you have any concerns regarding how we handle your data, please reach out to our Privacy Team.
                </p>
              </div>
            </div>
            <a
              href="mailto:privacy@fixitpro.com"
              className="z-10 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-blue-600 transition-colors duration-300 whitespace-nowrap gap-2"
            >
              Contact Support
            </a>
          </motion.div>
        </main>
      </div>
      <Footer />
    </>
  );
}