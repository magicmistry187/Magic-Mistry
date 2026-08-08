import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MousePointerClick, 
  CalendarCheck, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import ApplianceIcon from '../common/ApplianceIcon';

export default function HowItWorks() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      number: '01',
      title: 'Select Appliance & Issue',
      shortDesc: 'Choose your appliance category and select the required service package.',
      detailDesc: 'Browse through our 16+ electronics repair categories. Pick your specific issue with guaranteed upfront pricing.',
      icon: MousePointerClick,
      badge: 'Step 1',
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/20',
      highlights: ['Instant Fixed Price', '16+ Appliance Categories', 'Photo Upload Optional'],
      demoAppliance: { id: 1, name: 'AC Repair' }
    },
    {
      id: 2,
      number: '02',
      title: 'Choose Date & Time Slot',
      shortDesc: 'Select a convenient day and time window for doorstep technician visit.',
      detailDesc: 'We fit into your busy schedule. Pick same-day express service or schedule up to 7 days in advance.',
      icon: CalendarCheck,
      badge: 'Step 2',
      gradient: 'from-purple-500 to-indigo-500',
      shadowColor: 'shadow-purple-500/20',
      highlights: ['Same Day Visit Available', 'Flexible 2-Hour Time Windows', 'Instant Booking Confirmation'],
      demoAppliance: { id: 3, name: 'Washing Machine' }
    },
    {
      id: 3,
      number: '03',
      title: 'Expert Doorstep Repair',
      shortDesc: 'Verified technician arrives with authentic spare parts and diagnostic tools.',
      detailDesc: 'Our background-checked Mistry inspects the device, confirms component replacement costs upfront, and fixes it safely.',
      icon: Wrench,
      badge: 'Step 3',
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/20',
      highlights: ['Verified & Trained Technicians', '100% Genuine Spare Parts', 'Clean & Neat Workstation'],
      demoAppliance: { id: 2, name: 'Refrigerator' }
    },
    {
      id: 4,
      number: '04',
      title: 'Test & Pay After Service',
      shortDesc: 'Verify the working appliance before making payment via Cash or UPI.',
      detailDesc: 'Zero advance deposit needed! Pay only when you are 100% satisfied. Backed by our 30-day warranty guarantee.',
      icon: ShieldCheck,
      badge: 'Step 4',
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
      highlights: ['Pay After Repair', 'Cash / UPI Flexible', '30-Day Free Warranty'],
      demoAppliance: { id: 11, name: 'TV' }
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Hassle-Free 4-Step Booking</span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-extrabold text-[#0B1E40] tracking-tight"
        >
          How Magic Mistry Works
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed"
        >
          Getting your home electronics repaired has never been this simple, transparent, and secure.
        </motion.p>
      </div>

      {/* Steps Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
      >
        {/* Connecting Progress Line for Desktop */}
        <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200 -z-10 rounded-full">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 origin-left rounded-full"
          />
        </div>

        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = activeStep === index;

          return (
            <motion.div
              key={step.id}
              variants={itemVariants}
              onMouseEnter={() => setActiveStep(index)}
              className={`group relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isActive 
                  ? 'border-blue-600 shadow-xl -translate-y-2 ring-4 ring-blue-500/10' 
                  : 'border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Header Badges */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-2xl font-black tracking-tighter ${
                    isActive ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'
                  }`}>
                    {step.number}
                  </span>

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-lg ${step.shadowColor} transform group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>

                {/* Title & Short Description */}
                <h3 className="text-lg font-extrabold text-[#0B1E40] mb-2 group-hover:text-blue-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {step.shortDesc}
                </p>

                {/* Feature Highlights List */}
                <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                  {step.highlights.map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-6 pt-3 flex items-center justify-between text-xs font-bold text-blue-600 opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center gap-1.5">
                  <ApplianceIcon id={step.demoAppliance.id} name={step.demoAppliance.name} className="w-5 h-5" />
                  <span className="text-[11px] text-slate-500 font-medium">{step.demoAppliance.name}</span>
                </span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-12 text-center"
      >
        <button
          onClick={() => navigate('/booking')}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
        >
          <span>Book Technician In 60 Seconds</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </section>
  );
}
