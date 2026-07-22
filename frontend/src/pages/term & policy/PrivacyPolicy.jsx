import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Mock data for Privacy Policy
const privacyData = [
  {
    id: 1,
    title: "1. Information We Collect",
    content: (
      <div className="space-y-4">
        <p>
          We collect information to provide better services to all our users. The
          types of information we collect include:
        </p>
        <ul className="list-disc pl-5 space-y-1">
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
    title: "2. How We Use Your Data",
    content: (
      <div className="space-y-2">
        <p>Your personal information is utilized for the following purposes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>To facilitate and process your service bookings.</li>
          <li>To communicate with you regarding updates, offers, and support.</li>
          <li>To maintain and improve the security of our platform.</li>
          <li>To analyze usage trends and enhance user experience.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 3,
    title: "3. Data Sharing & Third Parties",
    content: (
      <div className="space-y-4">
        <p>
          We do not sell your personal data to third parties. However, we may
          share your information with trusted partners in the following scenarios:
        </p>
        <div>
          <h4 className="font-semibold text-slate-800 mb-1">Service Providers</h4>
          <p>
            Information may be shared with verified technicians and payment
            gateways solely for the purpose of fulfilling your service requests.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-1">Legal Compliance</h4>
          <p>
            We may disclose your data if required by law, regulation, or legal
            process to protect the rights and safety of our users and platform.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "4. Data Security",
    content: (
      <div className="space-y-4">
        <p>
          We implement industry-standard security measures, including encryption
          and secure server hosting, to protect your personal information from
          unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p>
          While we strive to use commercially acceptable means to protect your
          Personal Data, please note that no method of transmission over the
          internet is 100% secure.
        </p>
      </div>
    ),
  },
  {
    id: 5,
    title: "5. Your Privacy Rights",
    content: (
      <div className="space-y-2">
        <p>Depending on your location, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the personal information we hold about you.</li>
          <li>Request corrections to any inaccurate or incomplete data.</li>
          <li>Request the deletion of your personal data from our systems.</li>
          <li>Opt-out of marketing communications at any time.</li>
        </ul>
      </div>
    ),
  },
];

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-200 last:border-none">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left focus:outline-none group"
      >
        <h3
          className={`text-xl font-bold transition-colors duration-200 ${
            isOpen ? "text-[#1e3a8a]" : "text-[#1e293b] group-hover:text-[#1e3a8a]"
          }`}
        >
          {item.title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown
            className={`w-6 h-6 ${
              isOpen ? "text-[#1e3a8a]" : "text-slate-400 group-hover:text-[#1e3a8a]"
            }`}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-slate-600 text-sm md:text-base leading-relaxed">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PrivacyPolicy() {
  const [openSection, setOpenSection] = useState(0);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col w-full font-sans selection:bg-[#1e3a8a] selection:text-white">
      {/* Header Section */}
      <header className="w-full bg-[#f8fafc] py-14 flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-2 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Effective Date: October 24, 2023
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-12 overflow-hidden">
          
          {/* Accordion List */}
          <div className="flex flex-col">
            {privacyData.map((item, index) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openSection === index}
                onClick={() => toggleSection(index)}
              />
            ))}
          </div>

          {/* Contact Support Block */}
          <div className="mt-10 border-l-4 border-[#1e3a8a] bg-slate-50 p-5 rounded-r-lg">
            <p className="text-slate-700 text-sm">
              If you have any concerns regarding how we handle your data, please reach out to our
              Privacy Team at{" "}
              <a
                href="mailto:privacy@fixitpro.com"
                className="font-semibold text-[#1e3a8a] hover:underline"
              >
                privacy@fixitpro.com
              </a>
              .
            </p>
          </div>
          
        </div>
      </main>
    </div>
  );
}