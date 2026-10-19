import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MousePointerClick, 
  CalendarCheck, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export default function HowItWorks() {
  const navigate = useNavigate();
  const [selectedStep, setSelectedStep] = useState(0);

  const steps = [
    {
      id: 1,
      stepNumber: '01',
      title: 'Select Appliance & Problem',
      summary: 'Pick from 16+ appliance categories and view fixed base rates.',
      details: [
        'Select your exact model (Split AC, Double-Door Refrigerator, Front Load Washer).',
        'Transparent upfront pricing without hidden visiting fees.',
        'Upload an optional photo if you want our technician to see the fault beforehand.'
      ],
      icon: MousePointerClick,
    },
    {
      id: 2,
      stepNumber: '02',
      title: 'Pick a Date & Time Window',
      summary: 'Choose same-day express service or schedule up to 7 days ahead.',
      details: [
        'Convenient 2-hour arrival windows so you never wait all day.',
        'Express same-day dispatch available in Kolkata, Howrah & Salt Lake.',
        'Instant confirmation sent to your phone with technician assignment.'
      ],
      icon: CalendarCheck,
    },
    {
      id: 3,
      stepNumber: '03',
      title: 'Expert Doorstep Diagnosis',
      summary: 'Verified technician arrives with diagnostic tools and genuine spares.',
      details: [
        'Technician inspects the appliance and explains the fault clearly.',
        'Part costs are confirmed with you before any replacement takes place.',
        'Clean, respectful in-home service with tidy cleanup afterwards.'
      ],
      icon: Wrench,
    },
    {
      id: 4,
      stepNumber: '04',
      title: 'Test & Pay After Satisfaction',
      summary: 'Inspect your working appliance before paying via Cash or UPI.',
      details: [
        'Zero advance deposit needed — you test the repair first.',
        'Pay safely using Google Pay, PhonePe, Paytm, or Cash.',
        '30-Day unconditional rework warranty automatically activated.'
      ],
      icon: ShieldCheck,
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
          Seamless 4-Step Process
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1E40] tracking-tight">
          How Magic Mistry Works
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          From booking to a running appliance in four simple, transparent steps.
        </p>
      </div>

      {/* Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = selectedStep === idx;

          return (
            <div
              key={step.id}
              onClick={() => setSelectedStep(idx)}
              className={`rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-white border-blue-600 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                {/* Step Top Bar */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-black text-blue-600 tracking-wider">
                    STEP {step.stepNumber}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0B1E40] shrink-0">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>

                {/* Title & Summary */}
                <h3 className="text-base font-extrabold text-[#0B1E40] mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {step.summary}
                </p>

                {/* Detailed checklist */}
                <ul className="space-y-2 pt-3 border-t border-slate-100">
                  {step.details.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2 text-[11px] text-slate-600 font-medium leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom active marker */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Doorstep Guarantee</span>
                <span className="text-blue-600">✓ Ready</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Banner */}
      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => navigate('/booking')}
          className="inline-flex items-center gap-2.5 bg-[#0B1E40] hover:bg-blue-900 text-white text-sm font-extrabold px-8 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span>Book Repair in 60 Seconds</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
}
