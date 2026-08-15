import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplianceIcon from '../common/ApplianceIcon';

export default function ServiceCategories() {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'AC Repair' },
    { id: 2, name: 'Refrigerator' },
    { id: 3, name: 'Washing Machine' },
    { id: 4, name: 'Microwave' },
    { id: 5, name: 'Mixer Grinder' },
    { id: 6, name: 'Pump Motor' },
    { id: 7, name: 'Air Cooler' },
    { id: 8, name: 'Induction Cooktop' },
    { id: 9, name: 'Stabilizer' },
  ];

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
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-slate-300"
          >
            <div className="mb-3 flex items-center justify-center w-12 h-12">
              <ApplianceIcon id={item.id} name={item.name} className="w-12 h-12" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight">
              {item.name}
            </h3>
          </div>
        ))}

        <div
          onClick={() => navigate('/booking')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-slate-300"
        >
          <div className="mb-3 flex items-center justify-center w-12 h-12">
            <ApplianceIcon name="generic" className="w-12 h-12" />
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight">
            View More Services
          </h3>
        </div>
      </div>

    </section>
  );
}
