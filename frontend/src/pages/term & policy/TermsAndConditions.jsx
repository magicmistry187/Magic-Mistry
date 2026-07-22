import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Mock data extracted directly from Main.jpg
const termsData = [
  {
    id: 1,
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
        <p>
          Fixit Pro acts as a professional aggregator and service provider platform
          connecting skilled technicians with homeowners and businesses for
          appliance repair and maintenance needs.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    title: "2. User Accounts",
    content: (
      <div className="space-y-2">
        <p>
          To access certain features of Fixit Pro, you must create a user
          account. You are responsible for:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Maintaining the confidentiality of your account credentials.</li>
          <li>Ensuring all information provided is accurate and up-to-date.</li>
          <li>All activities that occur under your account.</li>
          <li>
            Notifying us immediately of any unauthorized use of your account.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 3,
    title: "3. Service Bookings",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800 mb-1">
            Booking Confirmation
          </h4>
          <p>
            A booking is considered confirmed only when you receive an electronic
            confirmation via email or SMS. Fixit Pro reserves the right to decline
            any service request based on technician availability or service area
            constraints.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-1">
            Inspection & Diagnostic Fees
          </h4>
          <p>
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
    title: "4. Payments & Cancellations",
    content: (
      <div className="space-y-4">
        <p>
          Payment for services rendered must be made through our secure integrated
          payment gateway or as specified during the booking process.
        </p>
        <ul className="space-y-2">
          <li>
            <span className="font-semibold text-slate-800">Cancellations:</span>{" "}
            Bookings cancelled more than 4 hours before the scheduled time incur
            no penalty.
          </li>
          <li>
            <span className="font-semibold text-slate-800">
              Late Cancellations:
            </span>{" "}
            Cancellations made within 4 hours of the scheduled appointment may be
            subject to a nominal cancellation fee.
          </li>
          <li>
            <span className="font-semibold text-slate-800">Refunds:</span> Refund
            requests for prepaid services are processed within 5-7 business days
            if the service was not initiated due to company reasons.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 5,
    title: "5. Vendor Responsibilities",
    content: (
      <div className="space-y-2">
        <p>
          Fixit Pro ensures all technicians are background-checked and professionally
          vetted. However, technicians operate as specialized service partners.
          Fixit Pro warrants that:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            All parts used in repairs are genuine or high-quality equivalent
            components as per the service level agreement.
          </li>
          <li>
            Technicians will follow standard safety protocols during the repair
            process.
          </li>
          <li>
            A limited warranty period of 30 days is provided on labor for the
            specific issue repaired.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 6,
    title: "6. Limitation of Liability",
    content: (
      <div className="space-y-4">
        <p>
          To the maximum extent permitted by law, Fixit Pro shall not be liable for
          any indirect, incidental, or consequential damages resulting from the use
          of our services. This includes but is not limited to loss of data,
          property damage beyond the scope of repair, or business interruption.
        </p>
        <p>
          Our total liability for any claim arising out of the service shall not
          exceed the total amount paid by the customer for that specific service
          booking.
        </p>
      </div>
    ),
  },
  {
    id: 7,
    title: "7. Governing Law",
    content: (
      <p>
        These Terms & Conditions shall be governed by and construed in accordance
        with the laws of India. Any disputes arising under or in connection with
        these terms shall be subject to the exclusive jurisdiction of the courts in
        Bangalore, Karnataka.
      </p>
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

export default function TermsAndConditions() {
  // Set to 0 to have the first item open by default, or null to have all closed initially
  const [openSection, setOpenSection] = useState(0);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col w-full font-sans selection:bg-[#1e3a8a] selection:text-white">
      {/* Header Section */}
      <header className="w-full bg-[#f8fafc] py-12 flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-2 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Last Updated: October 24, 2023
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-12 overflow-hidden">
          
          {/* Accordion List */}
          <div className="flex flex-col">
            {termsData.map((item, index) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openSection === index}
                onClick={() => toggleSection(index)}
              />
            ))}
          </div>

          {/* Contact Support Block (Footer of the document) */}
          <div className="mt-10 border-l-4 border-[#1e3a8a] bg-slate-50 p-5 rounded-r-lg">
            <p className="text-slate-700 text-sm">
              If you have any questions regarding these terms, please contact our
              Legal Department at{" "}
              <a
                href="mailto:legal@fixitpro.com"
                className="font-semibold text-[#1e3a8a] hover:underline"
              >
                legal@fixitpro.com
              </a>
              .
            </p>
          </div>
          
        </div>
      </main>
    </div>
  );
}