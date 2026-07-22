import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  TbRosetteDiscountCheck, 
  TbAward,
  TbBrandFacebook,
  TbBrandTwitter,
  TbBrandInstagram,
  TbBrandLinkedin
} from "react-icons/tb";

const Footer = () => {
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
      {/* 
        WIDER LAYOUT: 
        - max-w-[1400px] allows the footer to stretch wider on desktop
        - px-6 md:px-12 ensures the side gaps aren't overly huge
      */}
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
              FixIt Pro
            </h2>
            <p className="text-[13px] leading-relaxed mb-4 pe-2">
              Professional, certified, and transparent electronics repair service
              you can trust.
            </p>
            <div className="flex flex-col gap-2">
              <motion.div 
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
              </motion.div>
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
              {[
                { name: "AC Repair", path: "/services/ac-repair" },
                { name: "Refrigerator Service", path: "/services/refrigerator" },
                { name: "Washing Machine", path: "/services/washing-machine" },
                { name: "Microwave Repair", path: "/services/microwave" },
                { name: "Television Service", path: "/services/television" },
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

          {/* Column 3: Company */}
          <motion.div variants={itemVariants}>
            <h3 className="text-[14px] font-bold text-white mb-3 tracking-wide">
              Company
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { name: "About Us", path: "/about" },
                { name: "Contact Us", path: "/contact" },
                { name: "Become a Vendor", path: "/become a vandor" },
                // { name: "Blog", path: "/blog" },
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
            © 2024 FixIt Electronics Repair
          </p>
          
         
        </motion.div>
        
      </div>
    </footer>
  );
};

export default Footer;