import React from 'react';
import Navbar from '../../components/common/Navbar';
import HeroSection from '../../components/home/HeroSection';
import ServiceCategories from '../../components/home/ServiceCategories';
import WhyTrustUs from '../../components/home/WhyTrustUs';
import HowItWorks from '../../components/home/HowItWorks';
import CustomerReviews from '../../components/home/CustomerReviews';
import CoverageBanner from '../../components/home/CoverageBanner';
import Footer from '../../components/common/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section with Interactive Appliance Search & Quick Shortcuts */}
        <HeroSection />

        {/* 2. Categorized Appliance Catalog with Upfront Prices */}
        <ServiceCategories />

        {/* 3. The Magic Mistry Standard vs. Local Mechanics Comparison & Core Pillars */}
        <div id="why-trust-us" className="scroll-mt-20">
          <WhyTrustUs />
        </div>

        {/* 4. How It Works (4-Step Reassuring Doorstep Workflow) */}
        <div id="how-it-works" className="scroll-mt-20">
          <HowItWorks />
        </div>

        {/* 5. Verified Customer Stories from Kolkata & West Bengal */}
        <CustomerReviews />

        {/* 6. Service Coverage in West Bengal & Closing Conversion Banner */}
        <CoverageBanner />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
