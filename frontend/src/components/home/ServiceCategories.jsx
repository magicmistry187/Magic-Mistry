import React from 'react';
import { useNavigate } from 'react-router-dom';
import ApplianceIcon from '../common/ApplianceIcon';
import { useLivePricing } from '../../services/pricingService';

export default function ServiceCategories() {
  const navigate = useNavigate();
  const { services } = useLivePricing();

  const categories = services.map((s, idx) => ({
    id: typeof s.id === 'number' ? s.id : (idx + 1),
    name: s.name,
    icon: s.icon,
    basePrice: s.basePrice
  }));

  const handleServiceClick = (appliance) => {
    navigate('/booking', {
      state: {
        appliance: appliance 
      }
    });
  };


  return (
    <section id="services" className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E40]">
          Our Electronics Repair Services
        </h2>
        <p className="text-slate-600 mt-2 text-sm max-w-xl mx-auto font-medium">
          Select your appliance below to get instant transparent pricing and book a verified technician.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((item) => (
          <div
            key={item.id}
            onClick={() => handleServiceClick(item)}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 group"
          >
            <div className="mb-3 flex items-center justify-center w-16 h-16 p-2 rounded-2xl bg-slate-50/70 border border-slate-100 group-hover:bg-white group-hover:shadow-xs group-hover:border-slate-200 transition-all duration-300">
              <ApplianceIcon id={item.id} name={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-indigo-900 transition-colors leading-tight">
              {item.name}
            </h3>
          </div>
        ))}

        <div
          onClick={() => navigate('/booking')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 group"
        >
          <div className="mb-3 flex items-center justify-center w-16 h-16 p-2 rounded-2xl bg-slate-50/70 border border-slate-100 group-hover:bg-white group-hover:shadow-xs group-hover:border-slate-200 transition-all duration-300">
            <ApplianceIcon name="generic" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300 text-indigo-600" />
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-indigo-900 transition-colors leading-tight">
            View More Services
          </h3>
        </div>
      </div>

    </section>
  );
}
