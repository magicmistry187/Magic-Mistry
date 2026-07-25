import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#0B1E40] mb-4">Contact Us</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Have a question or need assistance with your booking? We are here to help 24/7.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#0B1E40]">Get in Touch</h2>
            <div className="flex items-center gap-4 text-slate-600">
              <Phone className="w-5 h-5 text-blue-600" />
              <span>+91 1800 123 4567 (Toll-Free)</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>support@fixitpro.com</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Bangalore, Karnataka, India</span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name</label>
              <input type="text" placeholder="John Doe" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input type="email" placeholder="john@example.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
              <textarea rows={4} placeholder="How can we help you?" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-[#0B1E40] hover:bg-blue-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
