import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Menu, X, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo2 from '../../../public/logo2.png';
import { useAuth } from '../../context/AuthContext';
import LocationSelectorModal from './LocationSelectorModal';
import LoginRequiredModal from '../auth/LoginRequiredModal';

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout, location } = useAuth();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showSearchLoginModal, setShowSearchLoginModal] = useState(false);
  const [selectedSearchAppliance, setSelectedSearchAppliance] = useState(null);
  const dropdownRef = useRef(null);

  // Hide/show navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        setIsVisible(currentScrollY < lastScrollY);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // Search Data with direct booking capability
  const searchServices = [
    { id: 1, name: 'AC Service & Repair', category: 'AC Repair', icon: '❄️' },
    { id: 1, name: 'AC Installation', category: 'AC Repair', icon: '❄️' },
    { id: 2, name: 'Refrigerator Repair', category: 'Refrigerator', icon: '🧊' },
    { id: 3, name: 'Washing Machine Repair', category: 'Washing Machine', icon: '🧺' },
    { id: 4, name: 'Microwave Repair', category: 'Microwave', icon: '♨️' },
    { id: 5, name: 'Mixer Grinder Repair', category: 'Mixer Grinder', icon: '🥛' },
    { id: 6, name: 'Pump Motor Repair', category: 'Pump Motor', icon: '💧' },
    { id: 7, name: 'Air Cooler Repair', category: 'Air Cooler', icon: '💨' },
    { id: 8, name: 'Induction Cooktop Repair', category: 'Induction Cooktop', icon: '🍳' },
    { id: 9, name: 'Stabilizer Repair', category: 'Stabilizer', icon: '🔌' },
    { id: 10, name: 'Press Iron Repair', category: 'Press Iron', icon: '👔' },
    { id: 11, name: 'TV Repair', category: 'TV', icon: '📺' },
    { id: 12, name: 'Ceiling Fan Repair', category: 'Ceiling Fan / Fan Repair', icon: '🌀' },
    { id: 13, name: 'Geyser Repair', category: 'Geyser', icon: '🚿' },
    { id: 14, name: 'Stand Fan Repair', category: 'Stand Fan', icon: '🌬️' },
    { id: 15, name: 'Table/Wall Fan Repair', category: 'Table Fan / Wall Fan', icon: '🎐' },
    { id: 16, name: 'Wiring & Switch Board', category: 'Wiring / Switch Board', icon: '⚡' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const matches = searchServices.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Direct booking trigger from Search Box
  const handleSuggestionSelect = (serviceItem) => {
    setSearchQuery(serviceItem.name);
    setShowSuggestions(false);

    const applianceObj = {
      id: serviceItem.id,
      name: serviceItem.category,
      icon: serviceItem.icon,
      serviceName: serviceItem.category,
    };

    if (!isLoggedIn) {
      setSelectedSearchAppliance(applianceObj);
      setShowSearchLoginModal(true);
      return;
    }

    navigate('/booking', {
      state: {
        appliance: applianceObj,
      },
    });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSuggestionSelect(suggestions[0]);
      } else if (searchQuery.trim().length > 0) {
        const fallback = searchServices[0];
        handleSuggestionSelect(fallback);
      }
    }
  };

  // User avatar initials
  const getInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarRenderInfo = () => {
    const avatarMap = {
      okapi: { icon: '🦒', color: 'from-amber-500 to-orange-600' },
      saiga: { icon: '🐂', color: 'from-yellow-600 to-amber-700' },
      harpy: { icon: '🦅', color: 'from-sky-500 to-blue-600' },
      cerata: { icon: '❄️', color: 'from-blue-400 to-indigo-500' },
      gerenuk: { icon: '📡', color: 'from-teal-500 to-emerald-600' },
      hopper: { icon: '🐸', color: 'from-green-400 to-emerald-600' },
      aye_aye: { icon: '🐒', color: 'from-rose-500 to-pink-600' },
      quokka: { icon: '🐹', color: 'from-orange-400 to-amber-500' },
      shoebill: { icon: '🐦', color: 'from-indigo-500 to-purple-600' },
      sparkle: { icon: '🕷️', color: 'from-red-500 to-rose-600' },
      pangolin: { icon: '🛡️', color: 'from-slate-600 to-slate-800' },
      squishblob: { icon: '💧', color: 'from-cyan-400 to-blue-500' },
    };
    return avatarMap[user?.avatar] || null;
  };

  // Dropdown menu animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.92, y: -8 },
    visible: {
      opacity: 1, scale: 1, y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24, duration: 0.2 }
    },
    exit: {
      opacity: 0, scale: 0.92, y: -8,
      transition: { duration: 0.15 }
    }
  };

  const dropdownItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i) => ({
      opacity: 1, x: 0,
      transition: { delay: i * 0.06, duration: 0.2 }
    })
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="w-full">
          {/* Desktop & Tablet Navbar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4 lg:gap-8">

              {/* Logo */}
              <Link to="/" className="shrink-0">
                <img src={logo2} alt="Magic Mistry Logo" loading="lazy" decoding="async" className="h-10 w-auto" />
              </Link>

              {/* Desktop Nav Links (Visible >= 930px) */}
              <div className="hidden min-[930px]:flex items-center space-x-4 lg:space-x-8 shrink-0">
                <Link to="/" className="relative group text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors duration-300 cursor-pointer select-none outline-none focus:outline-none">
                  Find Service
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/become-a-vendor" className="relative group text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors duration-300 cursor-pointer select-none outline-none focus:outline-none">
                  Become a Vendor
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/about" className="relative group text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors duration-300 cursor-pointer select-none outline-none focus:outline-none">
                  About Us
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/faq" className="relative group text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors duration-300 cursor-pointer select-none outline-none focus:outline-none">
                  FAQ
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>

              {/* Desktop Search Bar (Visible >= 930px) */}
              <div className="hidden min-[930px]:flex flex-1 max-w-sm">
                <div className="relative w-full z-50">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Search for AC, Washing Machine, Fridge..."
                    className="w-full px-4 py-2 pl-10 text-sm bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col z-50">
                      {suggestions.length > 0 ? (
                        suggestions.map((item, index) => (
                          <div
                            key={index}
                            onMouseDown={() => handleSuggestionSelect(item)}
                            className="px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors border-b border-slate-100 last:border-none flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{item.icon}</span>
                              <span className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-extrabold text-orange-600 bg-orange-100/70 group-hover:bg-orange-600 group-hover:text-white px-2.5 py-1 rounded-full transition-colors shrink-0">
                              Book Now &rarr;
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-sm text-slate-500 text-center">
                          No services found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Items */}
              <div className="flex items-center space-x-4 min-[930px]:space-x-6 shrink-0">

                {/* Location Button */}
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 px-3 py-1.5 rounded-full transition-all border border-slate-200 cursor-pointer shadow-xs"
                  title="Click to select & save your location"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="hidden min-[930px]:inline max-w-[130px] truncate">
                    {isLoggedIn ? (location || 'Set Your Location') : 'Set Your Location'}
                  </span>
                </button>



                {/* ── USER AVATAR + DROPDOWN or LOGIN BUTTON ── */}
                {isLoggedIn ? (
                  <div className="relative hidden sm:block" ref={dropdownRef}>
                    {/* Avatar Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsDropdownOpen(prev => !prev)}
                      className="avatar-btn flex items-center gap-2 pl-4 border-l border-gray-200 focus:outline-none"
                      aria-haspopup="true"
                      aria-expanded={isDropdownOpen}
                    >
                      {/* Avatar Circle */}
                      <div className="relative">
                        {(() => {
                          const avatarInfo = getAvatarRenderInfo();
                          if (avatarInfo) {
                            return (
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarInfo.color} text-white flex items-center justify-center text-xl shadow-md ring-2 ring-orange-200 ring-offset-1 shrink-0`}>
                                {avatarInfo.icon}
                              </div>
                            );
                          }
                          return (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-blue-200 ring-offset-1 shrink-0">
                              {getInitials()}
                            </div>
                          );
                        })()}
                        {/* Online dot */}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                      </div>
                      {/* Name + chevron */}
                      <div className="hidden min-[930px]:flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-700 max-w-[90px] truncate">
                          {user?.fullName?.split(' ')[0] || 'Profile'}
                        </span>
                        <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </motion.div>
                      </div>
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute right-0 top-[calc(100%+12px)] w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                          style={{ transformOrigin: 'top right' }}
                        >
                          {/* User Info Header */}
                          <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              {(() => {
                                const avatarInfo = getAvatarRenderInfo();
                                if (avatarInfo) {
                                  return (
                                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarInfo.color} text-white flex items-center justify-center text-2xl shadow shrink-0`}>
                                      {avatarInfo.icon}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-base shadow shrink-0">
                                    {getInitials()}
                                  </div>
                                );
                              })()}
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <motion.button
                              custom={0}
                              variants={dropdownItemVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{ x: 4, backgroundColor: '#EFF6FF' }}
                              onClick={() => { setIsDropdownOpen(false); navigate(user?.role === 'admin' ? '/admin-dashboard' : '/dashboard'); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-gray-800">Profile</p>
                                <p className="text-xs text-gray-400">View your dashboard</p>
                              </div>
                            </motion.button>

                            <div className="mx-3 my-1 h-px bg-gray-100" />

                            <motion.button
                              custom={1}
                              variants={dropdownItemVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{ x: 4, backgroundColor: '#FEF2F2' }}
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <LogOut className="w-4 h-4 text-red-500" />
                              </div>
                              <div className="text-left">
                                <p className="font-semibold">Logout</p>
                                <p className="text-xs text-red-400">Sign out of your account</p>
                              </div>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="hidden sm:flex items-center justify-center px-[20px] py-[10px] bg-[#007ACC] outline outline-[3px] outline-[#007ACC] outline-offset-[-3px] rounded-[45px] text-white transition-all duration-[400ms] hover:bg-transparent hover:text-[#007ACC] cursor-pointer"
                  >
                    <span className="font-bold text-[1em] transition-colors duration-[400ms]">Login</span>
                  </button>
                )}

                {/* Mobile Menu Button (Visible < 930px) */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="min-[930px]:hidden p-2 text-gray-600 hover:text-gray-900"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="min-[930px]:hidden max-w-7xl mx-auto px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50">
            <div className="relative w-full z-50">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search for AC, Washing Machine, Fridge..."
                className="w-full px-4 py-2 pl-10 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col z-50">
                  {suggestions.length > 0 ? (
                    suggestions.map((item, index) => (
                      <div
                        key={index}
                        onMouseDown={() => handleSuggestionSelect(item)}
                        className="px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors border-b border-slate-100 last:border-none flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{item.icon}</span>
                          <span className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-extrabold text-orange-600 bg-orange-100/70 group-hover:bg-orange-600 group-hover:text-white px-2.5 py-1 rounded-full transition-colors shrink-0">
                          Book Now &rarr;
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-slate-500 text-center">
                      No services found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="min-[930px]:hidden overflow-hidden bg-gray-50 border-t border-gray-100"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded cursor-pointer select-none outline-none">Find Service</Link>
                  <Link to="/become-a-vendor" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded cursor-pointer select-none outline-none">Become a Vendor</Link>
                  <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded cursor-pointer select-none outline-none">About Us</Link>
                  <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded cursor-pointer select-none outline-none">FAQ</Link>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLocationModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>{isLoggedIn ? (location || 'Set Your Location') : 'Set Your Location'}</span>
                    </div>
                    <span className="text-xs text-orange-600 font-bold">Change</span>
                  </button>

                  {isLoggedIn ? (
                    <div className="px-4 py-3 border-t border-gray-200 mt-2 pt-3 space-y-3">
                      {/* Mobile User Info */}
                      <div className="flex items-center gap-3">
                        {(() => {
                          const avatarInfo = getAvatarRenderInfo();
                          if (avatarInfo) {
                            return (
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarInfo.color} text-white flex items-center justify-center text-xl shadow shrink-0`}>
                                {avatarInfo.icon}
                              </div>
                            );
                          }
                          return (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                              {getInitials()}
                            </div>
                          );
                        })()}
                        <div>
                          <p className="text-sm font-bold text-gray-800">{user?.fullName || 'User'}</p>
                          <p className="text-xs text-gray-500">{user?.email || ''}</p>
                        </div>
                      </div>
                      {/* Mobile Profile Button */}
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); navigate(user?.role === 'admin' ? '/admin-dashboard' : '/dashboard'); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>My Profile / Dashboard</span>
                      </button>
                      {/* Mobile Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                      className="w-full sm:hidden flex items-center justify-center px-[15px] py-[10px] mt-2 bg-[#007ACC] outline outline-[3px] outline-[#007ACC] outline-offset-[-3px] rounded-[5px] text-white font-bold text-[1em] transition-all duration-[400ms] hover:bg-transparent hover:text-[#007ACC] cursor-pointer"
                    >
                      Login
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Spacer div */}
      <div className="h-[126px] min-[930px]:h-16 w-full"></div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Search Booking Login Required Modal */}
      <LoginRequiredModal
        isOpen={showSearchLoginModal}
        onClose={() => setShowSearchLoginModal(false)}
        appliance={selectedSearchAppliance}
      />
    </>
  );
};

export default Navbar;