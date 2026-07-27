import React from 'react';
import Navbar from '../../components/common/Navbar';
import HeroSection from '../../components/home/HeroSection';
import ServiceCategories from '../../components/home/ServiceCategories';
import HowItWorks from '../../components/home/HowItWorks';
import Footer from '../../components/common/Footer';
import { Shield, Clock, ThumbsUp, Wrench } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 space-y-12">
        {/* Hero Section */}
        <HeroSection />

        {/* Services Categories Section */}
        <ServiceCategories />

        {/* How It Works Section */}
        <div id="how-it-works" className="scroll-mt-20">
          <HowItWorks />
        </div>

        {/* Why Choose Us / Trust Banner */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-[#0B1E40] to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
            <h2 className="text-3xl font-extrabold text-center mb-8">
              Why Customers Trust FixIt Pro
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">30-Day Warranty</h3>
                <p className="text-xs text-blue-200">Guaranteed quality repairs with hassle-free warranty.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-300">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">Same Day Visit</h3>
                <p className="text-xs text-blue-200">Book in minutes and get quick doorstep assistance.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center text-green-300">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">Transparent Pricing</h3>
                <p className="text-xs text-blue-200">Upfront quotes with no hidden charges.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">Genuine Parts</h3>
                <p className="text-xs text-blue-200">Only authentic spares with manufacturer standards.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
