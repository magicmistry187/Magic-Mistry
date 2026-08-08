import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  TbRosetteDiscountCheck, 
  TbAward,
  TbBrandFacebook,
  TbBrandTwitter,
  TbBrandInstagram,
  TbBrandLinkedin
} from "react-icons/tb";
import { useAuth } from "../../context/AuthContext";
import LoginRequiredModal from "../auth/LoginRequiredModal";

const Footer = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const categories = [
    { id: 1, name: 'AC Repair', icon: '❄️' },
    { id: 2, name: 'Refrigerator', icon: '🧊' },
    { id: 3, name: 'Washing Machine', icon: '🧺' },
    { id: 4, name: 'Microwave', icon: '♨️' },
    { id: 5, name: 'Mixer Grinder', icon: '🥛' },
    { id: 6, name: 'Pump Motor', icon: '💧' },
    { id: 7, name: 'Air Cooler', icon: '💨' },
    { id: 8, name: 'Induction Cooktop', icon: '🍳' },
    { id: 9, name: 'Stabilizer', icon: '🔌' },
    { id: 10, name: 'Press Iron', icon: '👔' },
    { id: 11, name: 'TV', icon: '📺' },
    { id: 12, name: 'Ceiling Fan', icon: '🌀' },
    { id: 13, name: 'Geyser', icon: '🚿' },
    { id: 14, name: 'Stand Fan', icon: '🌬️' },
    { id: 15, name: 'Table / Wall Fan', icon: '🎐' },
    { id: 16, name: 'Wiring / Switch Board', icon: '⚡' },
  ];

  const handleServiceClick = (e, appliance) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setSelectedAppliance(appliance);
      setShowLoginModal(true);
      return;
    }

    navigate('/booking', {
      state: {
        appliance: appliance 
      }
    });
  };

  const displayedServices = categories.slice(0, 4);
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-[#02182e] text-[#94a9c5] font-sans w-full">
     
      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 pt-8 pb-4">
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Column 1: Brand & Badges */}
          <motion.div variants={itemVariants} className="flex flex-col">
            <h2 className="text-xl font-bold text-white mb-3 tracking-wide">
              Magic Mistry
            </h2>
            <p className="text-[13px] leading-relaxed mb-4 pe-2">
              Professional, certified, and transparent electronics repair service
              you can trust.
            </p>
            <div className="flex flex-col gap-2">

              {/* this function when i add when the client send me the certifications that when they will arange it */}
              {/* <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 border border-[#1a385b] bg-[#09223e] px-3 py-1.5 rounded-md text-xs font-medium w-fit shadow-sm cursor-default"
              >
                <TbRosetteDiscountCheck className="text-base text-[#a8c1de]" />
                ISO 9001:2015
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 border border-[#1a385b] bg-[#09223e] px-3 py-1.5 rounded-md text-xs font-medium w-fit shadow-sm cursor-default"
              >
                <TbAward className="text-base text-[#a8c1de]" />
                NABL Certified
              </motion.div> */}
              
            </div>
             {/* Added Social Media Icons */}
          <div className="flex items-center gap-4 text-[#a8c1de] pt-4">
            <Link to="#" className="hover:text-white hover:scale-110 transition-all duration-200">
              <TbBrandFacebook size={18} />
            </Link>
            <Link to="#" className="hover:text-white hover:scale-110 transition-all duration-200">
              <TbBrandTwitter size={18} />
            </Link>
            <Link to="#" className="hover:text-white hover:scale-110 transition-all duration-200">
              <TbBrandInstagram size={18} />
            </Link>
            <Link to="#" className="hover:text-white hover:scale-110 transition-all duration-200">
              <TbBrandLinkedin size={18} />
            </Link>
          </div>
          </motion.div>

          {/* Column 2: Services */}
          <motion.div variants={itemVariants}>
            <h3 className="text-[14px] font-bold text-white mb-3 tracking-wide">
              Services
            </h3>
            <ul className="flex flex-col gap-2">
              {displayedServices.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={(e) => handleServiceClick(e, link)}
                    className="text-[13px] inline-block transition-all duration-200 hover:translate-x-1 hover:text-white text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate('/booking')}
                  className="text-[13px] font-bold text-[#a8c1de] mt-2 transition-all duration-200 hover:text-white"
                >
                  View More
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Column 3: Company */}
          <motion.div variants={itemVariants}>
            <h3 className="text-[14px] font-bold text-white mb-3 tracking-wide">
              Company
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { name: "About Us", path: "/about" },
                { name: "Contact Us", path: "/contact" },
                { name: "FAQ / Help Center", path: "/faq" },
                { name: "Become a Vendor", path: "/become-a-vendor" },
                { name: "Vendor Dashboard", path: "/vendor-dashboard", isBadge: true, badgeText: "Demo" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`text-[13px] inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1 ${
                      link.isBadge 
                        ? 'text-orange-400 font-bold hover:text-orange-300' 
                        : 'hover:text-white'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.isBadge && (
                      <span className="text-[10px] font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1.5 py-0.2 rounded uppercase">
                        {link.badgeText || 'Demo'}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Legal */}
          <motion.div variants={itemVariants}>
            <h3 className="text-[14px] font-bold text-white mb-3 tracking-wide">
              Legal
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
                { name: "Cookie Policy", path: "/cookies" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-[13px] inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Copyright & Socials Bar */}
        <motion.div
          className="border-t border-[#122e4d] pt-5 mt-2 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs">
            © 2024 Magic Mistry. All rights reserved.
          </p>
          
         
        </motion.div>
        
      </div>
      
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        appliance={selectedAppliance}
      />
    </footer>
  );
};

export default Footer;