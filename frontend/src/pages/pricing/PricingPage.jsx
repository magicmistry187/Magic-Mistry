import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { APPLIANCE_SUB_SERVICES } from '../../components/Booking/BookingContext';
import ApplianceIcon from '../../components/common/ApplianceIcon';

export default function PricingPage() {
  const navigate = useNavigate();
  const categories = Object.values(APPLIANCE_SUB_SERVICES);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Header Section */}
        <div className="bg-[#0B1E40] text-white pt-32 pb-24 px-4 text-center relative overflow-hidden">
          {/* Animated Background Blobs */}
          <motion.div 
            animate={{ 
              x: [0, 50, 0], 
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none"
          />
          <motion.div 
            animate={{ 
              x: [0, -50, 0], 
              y: [0, 30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 right-10 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mx-auto relative z-10"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">Service & Repair Pricing</h1>
            <p className="text-lg text-slate-300 font-medium">Transparent, upfront pricing for all your appliance repair needs. No hidden charges.</p>
          </motion.div>
        </div>

        {/* Pricing Transparency Info */}
        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 mb-16">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between"
           >
              <div>
                <h3 className="text-xl font-bold text-[#0B1E40] mb-2 flex items-center gap-2">
                  <ShieldCheck className="text-green-600 w-6 h-6" />
                  How our pricing works
                </h3>
                <p className="text-slate-600 max-w-3xl leading-relaxed">
                  The prices listed below are the <strong>fixed service/visit charges</strong> for our technicians. 
                  If any spare parts are required to complete the repair, the technician will inform you of the additional cost <strong>before</strong> proceeding.
                </p>
              </div>
           </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-200"
              >
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-b border-slate-100 p-6 flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm border border-slate-100 text-3xl"
                  >
                    <ApplianceIcon id={cat.id} name={cat.name} className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-xl font-extrabold text-[#0B1E40]">{cat.name}</h2>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <motion.ul 
                    variants={listVariants}
                    className="space-y-1 flex-1 mb-8"
                  >
                    {cat.subServices.map((sub, sIdx) => (
                      <motion.li 
                        key={sIdx} 
                        variants={listItemVariants}
                        className="flex justify-between items-center border-b border-slate-50/50 py-3 px-3 last:border-0 rounded-xl group cursor-default transition-all duration-300 hover:translate-x-1.5 hover:bg-indigo-50/60"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors flex-shrink-0"></span>
                          <span className="text-sm text-slate-700 font-medium group-hover:text-indigo-950 transition-colors pr-2 leading-tight">{sub.label}</span>
                        </div>
                        <span 
                          className="text-sm font-black text-[#0B1E40] whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 group-hover:border-indigo-200 group-hover:bg-indigo-100 group-hover:text-indigo-700 group-hover:scale-105 transform transition-all shadow-sm"
                        >
                          ₹{sub.price}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/booking', { state: { appliance: { id: cat.id, name: cat.name } } })}
                    className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:bg-[#0B1E40] hover:border-[#0B1E40] text-[#0B1E40] hover:text-white py-3.5 rounded-xl font-bold transition-colors text-sm cursor-pointer mt-auto group shadow-sm"
                  >
                    Book {cat.name} 
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
