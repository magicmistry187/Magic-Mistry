import React, { useState, useEffect } from 'react';
import { MousePointer2, Calendar, Wrench } from 'lucide-react';

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      {/* Main Container */}
      <div 
        className={`w-full max-w-5xl bg-white rounded-xl shadow-sm border border-gray-200 p-10 md:p-14 transition-all duration-1000 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-[#0f2842] mb-16 tracking-wide">
          How It Works
        </h2>

        {/* Steps Container */}
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-0">
          
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-gray-200 -z-10"></div>

          {/* Step 1: Pick Appliance */}
          <div className="flex flex-col items-center w-full md:w-1/3 text-center group">
            <div className="relative flex items-center justify-center w-20 h-20 bg-white rounded-full border border-gray-300 shadow-sm transition-all duration-500 ease-in-out group-hover:-translate-y-2 group-hover:shadow-md group-hover:border-blue-300 z-10 cursor-pointer">
              <MousePointer2 className="w-8 h-8 text-[#0f2842] transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
              1. Pick Appliance
            </h3>
            <p className="mt-3 text-sm text-gray-500 max-w-[250px] leading-relaxed">
              Select the device that needs repair and tell us the issue.
            </p>
          </div>

          {/* Step 2: Book Slot */}
          <div className="flex flex-col items-center w-full md:w-1/3 text-center group">
            <div className="relative flex items-center justify-center w-20 h-20 bg-[#1c3654] rounded-full border-[6px] border-[#e8ecf1] shadow-md transition-all duration-500 ease-in-out group-hover:-translate-y-2 group-hover:shadow-lg group-hover:border-[#d1dce8] z-10 cursor-pointer">
              <Calendar className="w-8 h-8 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-[#1c3654]">
              2. Book Slot
            </h3>
            <p className="mt-3 text-sm text-gray-500 max-w-[250px] leading-relaxed">
              Choose a convenient date and time for the technician visit.
            </p>
          </div>

          {/* Step 3: Get Repaired */}
          <div className="flex flex-col items-center w-full md:w-1/3 text-center group">
            <div className="relative flex items-center justify-center w-20 h-20 bg-white rounded-full border-2 border-[#e6d9ce] shadow-sm transition-all duration-500 ease-in-out group-hover:-translate-y-2 group-hover:shadow-md group-hover:border-orange-300 z-10 cursor-pointer">
              <Wrench className="w-8 h-8 text-[#0f2842] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-orange-600">
              3. Get Repaired
            </h3>
            <p className="mt-3 text-sm text-gray-500 max-w-[250px] leading-relaxed">
              Expert technician fixes your appliance at your doorstep.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HowItWorks;