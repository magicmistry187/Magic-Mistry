import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Check, ChevronRight } from 'lucide-react';
import ApplianceIcon from '../common/ApplianceIcon';
import { useLivePricing } from '../../services/pricingService';

export default function ServiceCategories() {
  const navigate = useNavigate();
  const { services } = useLivePricing();
  const [activeTab, setActiveTab] = useState('all');

  const categories = useMemo(() => {
    return services.map((s, idx) => ({
      id: typeof s.id === 'number' ? s.id : (idx + 1),
      name: s.name,
      category: s.category || 'General',
      icon: s.icon,
      basePrice: s.basePrice || 199,
      description: s.description || 'Diagnosis, component repair & doorstep servicing.'
    }));
  }, [services]);

  const tabs = [
    { id: 'all', label: 'All Appliances', count: categories.length },
    { id: 'Cooling', label: 'Cooling & AC' },
    { id: 'Kitchen', label: 'Kitchen & Wash' },
    { id: 'Electrical', label: 'Electrical & Fans' },
  ];

  const filteredCategories = useMemo(() => {
    if (activeTab === 'all') return categories;
    if (activeTab === 'Cooling') {
      return categories.filter(c => 
        c.category === 'Cooling' || 
        /ac|refrigerator|cooler/i.test(c.name)
      );
    }
    if (activeTab === 'Kitchen') {
      return categories.filter(c => 
        c.category === 'Kitchen' || 
        c.category === 'Cleaning' || 
        /washing|microwave|mixer|cooktop|iron/i.test(c.name)
      );
    }
    if (activeTab === 'Electrical') {
      return categories.filter(c => 
        c.category === 'Electrical' || 
        /fan|pump|stabilizer|geyser|switch|wiring/i.test(c.name)
      );
    }
    return categories;
  }, [activeTab, categories]);

  const handleServiceClick = (appliance) => {
    navigate('/booking', {
      state: { appliance }
    });
  };

  return (
    <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            Service Catalog
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E40] tracking-tight">
            Select Your Appliance for Doorstep Service
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Choose an appliance below to check guaranteed base charges and schedule an expert technician in your area.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl overflow-x-auto custom-scrollbar shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#0B1E40] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modern High-Craft Appliance Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredCategories.map((item) => (
          <div
            key={item.id}
            onClick={() => handleServiceClick(item)}
            className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500/50 p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 cursor-pointer"
          >
            {/* Top row: Image & Starting price tag */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
                  <ApplianceIcon
                    id={item.id}
                    name={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  ₹{item.basePrice}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm sm:text-base font-extrabold text-[#0B1E40] group-hover:text-blue-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Bottom row: Action link */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
              <span>Book Technician</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Brand & Genuine Spares Reassurance Banner */}
      <div className="mt-8 bg-gradient-to-r from-slate-900 to-[#0B1E40] text-white rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> All Major Brands Serviced
          </span>
          <h4 className="text-lg sm:text-xl font-extrabold tracking-tight">
            Multi-Brand Diagnostic Experts in West Bengal
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed font-normal">
            LG • Samsung • Whirlpool • Daikin • Voltas • Godrej • Panasonic • Havells • Crompton • Philips • Bajaj • IFB • Haier
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/booking')}
          className="bg-white hover:bg-slate-100 text-[#0B1E40] text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-2 cursor-pointer"
        >
          Schedule Doorstep Visit
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
}
