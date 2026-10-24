import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, ArrowUp, ArrowRight } from 'lucide-react';
import {
  TbBrandFacebook,
  TbBrandInstagram,
  TbBrandTwitter,
  TbBrandLinkedin,
  TbBrandWhatsapp,
} from 'react-icons/tb';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../auth/LoginRequiredModal';

const logo2 = '/logo2.png';

// ── Top 6 High-Intent Repair Services ───────────────────────────────
const POPULAR_SERVICES = [
  { id: 1, name: 'AC Repair & Jet Service' },
  { id: 2, name: 'Refrigerator Repair' },
  { id: 3, name: 'Washing Machine Repair' },
  { id: 13, name: 'Geyser & Water Heater' },
  { id: 4, name: 'Microwave Oven Repair' },
  { id: 12, name: 'Ceiling Fan & Electrical' },
];

const Footer = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleServiceClick = (e, appliance) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setSelectedAppliance(appliance);
      setShowLoginModal(true);
      return;
    }

    navigate('/booking', {
      state: {
        appliance: appliance,
      },
    });
  };

  const handleScrollToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.1 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0B111E] text-slate-400 font-sans border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Grid: 4 Balanced, Breathable Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* ── Brand & Contact Info (lg:col-span-4) ── */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
                aria-label="Magic Mistry Home"
              >
                <img
                  src={logo2}
                  alt="Magic Mistry Logo"
                  className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="flex items-center font-black text-xl tracking-tight text-white leading-none">
                  <span>Magic</span>
                  <span className="text-orange-500 ml-1">Mistry</span>
                </div>
              </Link>

              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                Doorstep electronics repair and home appliance maintenance across West Bengal.
                Certified technicians, upfront transparent pricing, and 30-day rework warranty.
              </p>

              {/* Minimal Contact Details */}
              <div className="space-y-2 pt-1 text-xs text-slate-300">
                <a
                  href="tel:+919830012345"
                  className="inline-flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>+91 98300 12345</span>
                  <span className="text-[10px] text-slate-500">(8:00 AM – 9:30 PM)</span>
                </a>
                <div className="flex items-center gap-2">
                  <a
                    href="mailto:magicmistry187@gmail.com"
                    className="inline-flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>magicmistry187@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                {
                  icon: TbBrandFacebook,
                  label: 'Facebook',
                  url: 'https://facebook.com',
                },
                {
                  icon: TbBrandInstagram,
                  label: 'Instagram',
                  url: 'https://instagram.com',
                },
                {
                  icon: TbBrandTwitter,
                  label: 'Twitter',
                  url: 'https://twitter.com',
                },
                {
                  icon: TbBrandLinkedin,
                  label: 'LinkedIn',
                  url: 'https://linkedin.com',
                },
                {
                  icon: TbBrandWhatsapp,
                  label: 'WhatsApp',
                  url: 'https://wa.me/919830012345',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Magic Mistry on ${item.label}`}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 flex items-center justify-center transition-all duration-150"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ── Column 2: Popular Services (lg:col-span-3) ── */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Popular Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              {POPULAR_SERVICES.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={(e) => handleServiceClick(e, service)}
                    className="hover:text-white transition-colors duration-150 text-left cursor-pointer"
                  >
                    {service.name}
                  </button>
                </li>
              ))}
              <li className="pt-1.5">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>All 16+ Services & Rates</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Column 3: Customers & Booking (lg:col-span-3) ── */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              For Customers
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/booking" className="hover:text-white transition-colors duration-150">
                  Book a Repair
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors duration-150">
                  Transparent Rate Card
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors duration-150">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors duration-150">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors duration-150">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Column 4: Partners & Company (lg:col-span-2) ── */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Partner & Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/become-a-vendor"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors duration-150"
                >
                  <span>Join as Partner</span>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded">
                    Earn
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  state={{ isVendorLogin: true }}
                  className="hover:text-white transition-colors duration-150"
                >
                  Partner Login
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors duration-150">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors duration-150">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors duration-150">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom Bar: Copyright & Back to Top ── */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p>© {new Date().getFullYear()} Magic Mistry. All rights reserved.</p>
            <div className="flex items-center gap-3 text-slate-400">
              <span>UPI</span>
              <span>•</span>
              <span>Cards</span>
              <span>•</span>
              <span>NetBanking</span>
              <span>•</span>
              <span>Cash on Service</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleScrollToTop}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-slate-400"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auth Modal Trigger */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        appliance={selectedAppliance}
      />
    </footer>
  );
};

export default Footer;