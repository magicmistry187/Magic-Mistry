import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Wrench, 
  ArrowRight,
  Lock,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';

export default function WhyTrustUs() {
  const navigate = useNavigate();

  const comparisonRows = [
    {
      feature: 'Pricing Transparency',
      magic: 'Fixed upfront rate card. Part costs confirmed before installation.',
      local: 'Arbitrary prices quoted on the spot. Frequent surprise charges.',
    },
    {
      feature: 'Payment Terms',
      magic: '100% Pay After Service via Cash or UPI once tested.',
      local: 'Advance deposit or visiting charge demanded upfront.',
    },
    {
      feature: 'Service Warranty',
      magic: '30-Day Free Rework Guarantee if the same issue reoccurs.',
      local: 'Zero warranty. Mechanic rarely answers after leaving.',
    },
    {
      feature: 'Spare Parts Quality',
      magic: '100% Brand-Certified OEM parts with manufacturer warranty.',
      local: 'Often unbranded, duplicate or refurbished components.',
    },
    {
      feature: 'Technician Verification',
      magic: 'Police-verified, background-checked, and skilled in PCB circuits.',
      local: 'Unvetted strangers entering your private home.',
    },
  ];

  const pillarCards = [
    {
      id: 1,
      icon: ShieldCheck,
      title: '30-Day Free Rework Warranty',
      description: 'If the repaired issue reoccurs within 30 days, we re-inspect and fix it with zero service charges.',
      tag: 'Guaranteed'
    },
    {
      id: 2,
      icon: Clock,
      title: 'Same-Day 60-Min Arrival',
      description: 'Express technician dispatch across Kolkata, Howrah, Hooghly, and major West Bengal districts.',
      tag: 'Express'
    },
    {
      id: 3,
      icon: Lock,
      title: 'Zero Advance Deposit',
      description: 'You test the repaired appliance in front of the technician before paying a single rupee.',
      tag: 'Risk-Free'
    },
    {
      id: 4,
      icon: Wrench,
      title: '100% Genuine Spare Parts',
      description: 'We install factory-certified replacement parts. You decide before any part is replaced.',
      tag: 'Authentic'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
          The Magic Mistry Standard
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1E40] tracking-tight">
          Why Homeowners Trust Us Over Local Mechanics
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          We founded Magic Mistry to eliminate unfair repair quotes, duplicate spare parts, and unaccountable service calls.
        </p>
      </div>

      {/* Modern High-Contrast Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="py-4 px-6 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-1/3">
                  Service Feature
                </th>
                <th className="py-4 px-6 text-xs font-extrabold text-blue-700 uppercase tracking-wider bg-blue-50/60 w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Magic Mistry Verified
                  </div>
                </th>
                <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider w-1/3">
                  Unorganized Local Mechanics
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 bg-blue-50/30 font-medium text-slate-800">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed text-xs sm:text-sm">{row.magic}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-medium">
                    <div className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed text-xs sm:text-sm">{row.local}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Core Pillars Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {pillarCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#0B1E40] mb-2 leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Standard</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grounded Key Stats Row */}
      <div className="bg-[#0B1E40] text-white rounded-2xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        <div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">4.9 ★</p>
          <p className="text-xs text-slate-300 font-semibold mt-1">Average Customer Rating</p>
        </div>
        <div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">30 Days</p>
          <p className="text-xs text-slate-300 font-semibold mt-1">Rework Warranty Period</p>
        </div>
        <div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">100%</p>
          <p className="text-xs text-slate-300 font-semibold mt-1">Background Checked</p>
        </div>
        <div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">₹0</p>
          <p className="text-xs text-slate-300 font-semibold mt-1">Advance Booking Charge</p>
        </div>
      </div>

    </section>
  );
}
