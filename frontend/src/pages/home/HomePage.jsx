import React from 'react';
import Navbar from '../../components/common/Navbar';
import HeroSection from '../../components/home/HeroSection';
import ServiceCategories from '../../components/home/ServiceCategories';
import HowItWorks from '../../components/home/HowItWorks';
import WhyTrustUs from '../../components/home/WhyTrustUs';
import Footer from '../../components/common/Footer';

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

        {/* Why Customers Trust Us Section */}
        <div id="why-trust-us" className="scroll-mt-20">
          <WhyTrustUs />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
