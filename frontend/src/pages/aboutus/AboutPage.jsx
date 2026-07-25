import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { ShieldCheck, Award, Users, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#0B1E40] mb-4">About FixIt Pro</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            We are on a mission to simplify appliance repair and home services with verified professionals, transparent pricing, and instant online booking.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 my-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Verified Technicians</h3>
            <p className="text-slate-500 text-sm">Every technician undergoes background checks and rigorous technical evaluation.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Service Guarantee</h3>
            <p className="text-slate-500 text-sm">30-day post-service warranty on all spare parts and repair work.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">10,000+ Happy Homes</h3>
            <p className="text-slate-500 text-sm">Trusted by thousands of families for fast and doorstep electronic repairs.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
