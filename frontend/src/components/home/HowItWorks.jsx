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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group cursor-pointer">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100 transition-all duration-300 group-hover:bg-[#0f2842] group-hover:scale-110 shadow-sm">
              <MousePointer2 className="w-8 h-8 text-[#0f2842] group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-[#0f2842] transition-colors">
              Select Your Appliance
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Choose the appliance you need help with from our wide range of repair services.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group cursor-pointer">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100 transition-all duration-300 group-hover:bg-[#0f2842] group-hover:scale-110 shadow-sm">
              <Calendar className="w-8 h-8 text-[#0f2842] group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-[#0f2842] transition-colors">
              Choose Time Slot
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Pick a date and time slot that fits your busy schedule seamlessly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group cursor-pointer">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100 transition-all duration-300 group-hover:bg-[#0f2842] group-hover:scale-110 shadow-sm">
              <Wrench className="w-8 h-8 text-[#0f2842] group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-[#0f2842] transition-colors">
              Expert Repairs
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Our verified technician arrives at your doorstep to fix the problem efficiently.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
