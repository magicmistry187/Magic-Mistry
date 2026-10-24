import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  MapPin,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Calendar,
  Wrench,
  ShieldCheck,
  Phone,
  Sparkles,
  ArrowRight,
  Tag,
  HelpCircle,
  LocateFixed,
  Check,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../auth/LoginRequiredModal';
import ApplianceIcon from './ApplianceIcon';
import { useLivePricing } from '../../services/pricingService';
import { formatCleanAddress } from '../../utils/addressParser';

const logo2 = '/logo2.png';

// Curated popular repair tags for instant 1-tap search
const POPULAR_SEARCH_TAGS = [
  'AC Repair',
  'Washing Machine',
  'Refrigerator',
  'Geyser',
  'Ceiling Fan',
  'Switch Board',
];

const Navbar = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const currentPath = routerLocation.pathname;

  const { isLoggedIn, user, logout, location, updateLocation } = useAuth();
  const isAdmin =
    (user?.role || '').toLowerCase() === 'admin' ||
    (user?.email && user.email.toLowerCase().trim() === 'magicmistry187@gmail.com');
  const isVendor = (user?.role || '').toLowerCase() === 'vendor' || !!user?.vendorId;

  const cleanDisplayLocation = useMemo(() => formatCleanAddress(location), [location]);

  // Navbar dynamic states
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Overlay states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [showSearchLoginModal, setShowSearchLoginModal] = useState(false);
  const [selectedSearchAppliance, setSelectedSearchAppliance] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Refs for click outside and keyboard shortcuts
  const dropdownRef = useRef(null);
  const locationPopupRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // 1. Refined scroll handler: stays visible at top, hides only on confident scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update background elevation
      setIsScrolled(currentScrollY > 15);

      // Keep navbar fixed visible if menu, dropdown, or search is open
      if (isMobileMenuOpen || isDropdownOpen || isLocationPopupOpen || isSearchFocused) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide only after scrolling past top banner threshold (> 90px)
      if (currentScrollY > 90) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 10) {
          setIsVisible(false); // scrolling down
        } else if (lastScrollY - currentScrollY > 6) {
          setIsVisible(true); // scrolling up
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobileMenuOpen, isDropdownOpen, isLocationPopupOpen, isSearchFocused]);

  // 2. Click outside listeners for all overlays
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (locationPopupRef.current && !locationPopupRef.current.contains(e.target)) {
        setIsLocationPopupOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Global keyboard shortcuts: Cmd+K / Ctrl+K to search, Escape to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setIsSearchFocused(true);
        } else if (mobileSearchRef.current) {
          mobileSearchRef.current.focus();
        }
      } else if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setIsDropdownOpen(false);
        setIsLocationPopupOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 4. Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Logout handler
  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  // Role-based dashboard routing
  const getDashboardRoute = useCallback(() => {
    if (isAdmin) return '/admin-dashboard';
    if (isVendor) return '/vendor-dashboard';
    return '/dashboard';
  }, [isAdmin, isVendor]);

  // Profile / Address redirect
  const handleGoToProfile = () => {
    setIsLocationPopupOpen(false);
    setIsMobileMenuOpen(false);
    if (isAdmin) {
      navigate('/admin-dashboard');
    } else if (isVendor) {
      navigate('/vendor-dashboard?tab=profile', { state: { tab: 'profile' } });
    } else {
      navigate('/dashboard?tab=addresses', { state: { tab: 'addresses' } });
    }
  };

  // Live service catalog integration
  const { services } = useLivePricing();

  const searchServices = useMemo(() => {
    const list = [];
    services.forEach((s, idx) => {
      const catId = typeof s.id === 'number' ? s.id : idx + 1;
      list.push({
        id: catId,
        name: `${s.name} Service & Repair`,
        category: s.name,
        price: s.basePrice || 250,
      });
      if (Array.isArray(s.subServices)) {
        s.subServices.forEach((sub) => {
          list.push({
            id: catId,
            name: `${s.name} - ${sub.label}`,
            category: s.name,
            price: sub.price,
          });
        });
      }
    });
    return list;
  }, [services]);

  // Active appliance icon matched from search query
  const activeSearchAppliance = useMemo(() => {
    if (!searchQuery.trim()) return null;
    if (suggestions.length > 0) {
      return suggestions[0];
    }
    const q = searchQuery.toLowerCase().trim();
    return (
      searchServices.find(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      ) || null
    );
  }, [searchQuery, suggestions, searchServices]);

  // Search input change handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedIndex(-1);
    if (query.trim().length > 0) {
      const matches = searchServices.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(matches);
      setIsSearchFocused(true);
    } else {
      setSuggestions([]);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsSearchFocused(false);
  };

  // Direct booking trigger from Search Box
  const handleSuggestionSelect = (serviceItem) => {
    setSearchQuery(serviceItem.name);
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);

    const applianceObj = {
      id: serviceItem.id,
      name: serviceItem.category,
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

  // Keyboard navigation inside search suggestions (Up/Down/Enter)
  const handleSearchKeyDown = (e) => {
    const activeList = suggestions.length > 0 ? suggestions : searchServices.slice(0, 5);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < activeList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < activeList.length) {
        handleSuggestionSelect(activeList[selectedIndex]);
      } else if (activeList.length > 0) {
        handleSuggestionSelect(activeList[0]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  // Geolocation trigger for current address
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.state_district ||
            'Detected Location';
          const detectedLocStr = `${detectedCity}, ${data.address?.state || ''}`.replace(/^, |, $/g, '');
          await updateLocation(detectedLocStr, { lat: latitude, lng: longitude });
        } catch {
          await updateLocation(`Sector (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        } finally {
          setIsDetectingLocation(false);
          setIsLocationPopupOpen(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
        alert('Could not determine your GPS location. Please select or enter your address in your dashboard.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // User avatar initials
  const getInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
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

  // Primary navigation items
  const NAV_ITEMS = [
    {
      label: 'Find Services',
      to: '/',
      isActive: currentPath === '/' || currentPath === '/how-it-works' || currentPath === '/find-service',
    },
    {
      label: 'Pricing',
      to: '/pricing',
      isActive: currentPath === '/pricing',
    },
    {
      label: 'Become a Partner',
      to: '/become-a-vendor',
      isActive: currentPath === '/become-a-vendor' || currentPath === '/become-a-vandor' || currentPath === '/vendor-apply',
      badge: 'Earn',
    },
    {
      label: 'About Us',
      to: '/about',
      isActive: currentPath === '/about',
    },
    {
      label: 'FAQ',
      to: '/faq',
      isActive: currentPath === '/faq',
    },
  ];

  return (
    <>
      {/* ── Fixed Master Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
            : 'bg-white border-b border-slate-100/90'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px] gap-2 lg:gap-4 xl:gap-6">
            {/* ── 1. Brand Identity with Typography ── */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 group transition-transform active:scale-95"
                aria-label="Magic Mistry Home"
              >
                <img
                  src={logo2}
                  alt="Magic Mistry Emblem"
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-auto object-contain transition-all group-hover:brightness-105"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center tracking-tight font-black text-[17px] text-[#0B1E40] leading-none">
                    <span>Magic</span>
                    <span className="text-orange-500 ml-0.5">Mistry</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                    Doorstep Service
                  </span>
                </div>
              </Link>
            </div>

            {/* ── 2. Primary Navigation Links (Desktop >= 1024px) ── */}
            <nav className="hidden min-[1024px]:flex items-center gap-0.5 xl:gap-1 shrink-0" aria-label="Main Navigation">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 select-none ${
                    item.isActive
                      ? 'text-blue-700 bg-blue-50/90 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* ── 3. Omni-Search Spotlight Capsule (Desktop >= 1024px) ── */}
            <div className="hidden min-[1024px]:flex relative shrink-0" ref={searchContainerRef}>
              <div className="relative">
                <div
                  className={`relative flex items-center rounded-xl transition-all duration-200 ${
                    isSearchFocused
                      ? 'w-72 xl:w-80 bg-white ring-2 ring-blue-500/20 border-blue-500 shadow-sm'
                      : 'w-48 xl:w-64 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {/* Dynamic Appliance Icon or Search Icon */}
                  <div className="absolute left-3 flex items-center justify-center pointer-events-none transition-transform duration-200">
                    {activeSearchAppliance ? (
                      <div className="w-4.5 h-4.5 flex items-center justify-center">
                        <ApplianceIcon
                          id={activeSearchAppliance.id}
                          name={activeSearchAppliance.category}
                          className="w-4.5 h-4.5 object-contain"
                        />
                      </div>
                    ) : (
                      <Search className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Search repairs..."
                    className="w-full h-9.5 pl-9 pr-12 text-[13px] bg-transparent text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
                    aria-label="Search appliances and repair services"
                  />

                  {/* Clear Button or Cmd+K Badge */}
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="absolute right-2.5 hidden xl:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs select-none pointer-events-none">
                      <span>⌘</span>
                      <span>K</span>
                    </div>
                  )}
                </div>

                {/* Suggestions Popover Card: Always comfortable 380px width */}
                <AnimatePresence>
                  {isSearchFocused && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      data-lenis-prevent
                      className="absolute top-full right-0 xl:left-0 xl:right-auto mt-2 w-[380px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto custom-scrollbar"
                    >
                      {/* Empty state: popular quick chips */}
                      {!searchQuery.trim() ? (
                        <div className="p-4">
                          <div className="flex items-center gap-1.5 px-1 pb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Popular Repairs</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {POPULAR_SEARCH_TAGS.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onMouseDown={() => {
                                  setSearchQuery(tag);
                                  const matches = searchServices.filter((s) =>
                                    s.name.toLowerCase().includes(tag.toLowerCase())
                                  );
                                  setSuggestions(matches);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 rounded-xl border border-slate-200/70 transition-all cursor-pointer select-none"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div className="py-1">
                          <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                            <span>Services ({suggestions.length})</span>
                            <span className="text-[10px] text-slate-400 font-normal">Use ↑↓ & Enter</span>
                          </div>
                          {suggestions.map((item, index) => {
                            const isSelected = selectedIndex === index;
                            return (
                              <div
                                key={`${item.id}-${index}`}
                                onMouseDown={() => handleSuggestionSelect(item)}
                                className={`px-4 py-2.5 cursor-pointer transition-colors border-b border-slate-50 last:border-none flex items-center justify-between group ${
                                  isSelected ? 'bg-orange-50/80 text-orange-800' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                                  <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 border border-slate-200/60 p-1 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-orange-200 transition-colors">
                                    <ApplianceIcon
                                      id={item.id}
                                      name={item.category}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="flex flex-col text-left min-w-0 flex-1">
                                    <span className="font-semibold text-xs sm:text-[13px] text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                                      {item.name}
                                    </span>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                      <span className="font-medium truncate">{item.category}</span>
                                      {item.price && (
                                        <>
                                          <span>•</span>
                                          <span className="font-bold text-emerald-600">From ₹{item.price}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[11px] font-bold text-orange-600 bg-orange-100 group-hover:bg-orange-600 group-hover:text-white px-2.5 py-1 rounded-full transition-colors shrink-0">
                                  Book &rarr;
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-xs text-slate-500 font-medium">
                            No repair service matched "{searchQuery}"
                          </p>
                          <button
                            type="button"
                            onMouseDown={() => {
                              clearSearch();
                              navigate('/booking');
                            }}
                            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                          >
                            <span>Browse full appliance repair catalog</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── 4. Right Controls: Location, Auth State, CTAs ── */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Location Selector Pill */}
              <div className="relative" ref={locationPopupRef}>
                <button
                  type="button"
                  onClick={() => setIsLocationPopupOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-800 border border-slate-200/80 text-slate-700 transition-all select-none cursor-pointer shadow-2xs"
                  title="Active service area"
                  aria-expanded={isLocationPopupOpen}
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="max-w-[105px] sm:max-w-[130px] truncate text-left">
                    {cleanDisplayLocation || 'Set Location'}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      isLocationPopupOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Location Details Popover Card */}
                <AnimatePresence>
                  {isLocationPopupOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute right-0 sm:left-0 sm:right-auto top-[calc(100%+8px)] w-76 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                      style={{ transformOrigin: 'top right' }}
                    >
                      {/* Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">
                              Service Coverage Area
                            </p>
                            <p className="text-[10px] text-orange-600/90 font-medium">
                              Fast doorstep dispatch within 60 mins
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsLocationPopupOpen(false)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-white/70 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Current Location Display */}
                      <div className="p-4 space-y-3">
                        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Active Destination
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 leading-snug">
                            {cleanDisplayLocation || 'No specific location configured yet.'}
                          </p>
                        </div>

                        {/* Detect GPS Location Button */}
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={isDetectingLocation}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all cursor-pointer disabled:opacity-60"
                        >
                          <LocateFixed className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                          <span>{isDetectingLocation ? 'Detecting Location...' : 'Use My Current GPS Location'}</span>
                        </button>
                      </div>

                      {/* Manage in Dashboard */}
                      {isLoggedIn && (
                        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={handleGoToProfile}
                            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                            <span>
                              {isVendor ? 'Manage Service Area in Vendor Portal' : 'Manage Saved Addresses in Profile'}
                            </span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Logged In User State ── */}
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Avatar Profile Capsule */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all select-none cursor-pointer focus:outline-none"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    {/* User Avatar Circle */}
                    <div className="relative shrink-0">
                      {(() => {
                        const avatarInfo = getAvatarRenderInfo();
                        if (avatarInfo) {
                          return (
                            <div
                              className={`w-8.5 h-8.5 rounded-full bg-gradient-to-br ${avatarInfo.color} text-white flex items-center justify-center text-lg shadow-xs ring-2 ring-white`}
                            >
                              {avatarInfo.icon}
                            </div>
                          );
                        }
                        return (
                          <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white">
                            {getInitials()}
                          </div>
                        );
                      })()}
                      {/* Active Status Dot */}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    {/* First Name & Role */}
                    <div className="hidden sm:flex flex-col text-left leading-tight">
                      <span className="text-xs font-bold text-slate-800 max-w-[85px] truncate">
                        {user?.fullName?.split(' ')[0] || 'My Account'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {isAdmin ? 'Admin' : isVendor ? 'Partner' : 'Customer'}
                      </span>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute right-0 top-[calc(100%+8px)] w-68 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100"
                        style={{ transformOrigin: 'top right' }}
                      >
                        {/* User Identity Header */}
                        <div className="p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0">
                              {(() => {
                                const avatarInfo = getAvatarRenderInfo();
                                if (avatarInfo) {
                                  return (
                                    <div
                                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarInfo.color} text-white flex items-center justify-center text-xl shadow-xs`}
                                    >
                                      {avatarInfo.icon}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                    {getInitials()}
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {user?.fullName || 'User'}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{user?.email || ''}</p>
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isAdmin
                                      ? 'bg-purple-100 text-purple-700'
                                      : isVendor
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {isAdmin ? '🛡️ Administrator' : isVendor ? '⚡ Verified Partner' : '✓ Customer'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="p-1.5 space-y-0.5">
                          {/* Dashboard Item */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate(getDashboardRoute());
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 transition-colors text-left cursor-pointer"
                          >
                            <LayoutDashboard className="w-4 h-4 text-blue-600" />
                            <div className="flex-1">
                              <p className="leading-tight">
                                {isAdmin ? 'Admin Control Center' : isVendor ? 'Technician Portal' : 'My Dashboard'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-normal">
                                {isAdmin ? 'System metrics & claims' : 'Manage your profile & activity'}
                              </p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </button>

                          {/* My Bookings (Customers Only) */}
                          {!isAdmin && !isVendor && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsDropdownOpen(false);
                                navigate('/dashboard?tab=bookings', { state: { tab: 'bookings' } });
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 transition-colors text-left cursor-pointer"
                            >
                              <Calendar className="w-4 h-4 text-amber-500" />
                              <div className="flex-1">
                                <p className="leading-tight">My Repair Bookings</p>
                                <p className="text-[10px] text-slate-400 font-normal">
                                  Track scheduled technician visits
                                </p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </button>
                          )}

                          {/* Saved Addresses / Pricing (Admin and Customers Only) */}
                          {!isVendor && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsDropdownOpen(false);
                                if (isAdmin) {
                                  navigate('/admin-dashboard?tab=price-config');
                                } else {
                                  navigate('/dashboard?tab=addresses');
                                }
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 transition-colors text-left cursor-pointer"
                            >
                              <MapPin className="w-4 h-4 text-emerald-600" />
                              <div className="flex-1">
                                <p className="leading-tight">
                                  {isAdmin ? 'Pricing & Rates Config' : 'Saved Addresses'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-normal">
                                  {isAdmin ? 'Update fuel & appliance charges' : 'Configure delivery location'}
                                </p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </button>
                          )}
                        </div>

                        {/* Support & Logout */}
                        <div className="p-1.5 space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate('/faq');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <HelpCircle className="w-4 h-4 text-slate-400" />
                            <span>Help & Customer FAQ</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Sign Out of Magic Mistry</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* ── Logged Out Guest State ── */
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer select-none"
                  >
                    Log In
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/booking')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-500/20 active:scale-95 transition-all cursor-pointer select-none"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ── Mobile Menu Hamburger Toggle (< 1024px) ── */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="min-[1024px]:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Secondary Search Bar (< 1024px) ── */}
        <div className="min-[1024px]:hidden px-4 pb-3 pt-0 bg-white border-t border-slate-100">
          <div className="relative w-full">
            <div className="relative flex items-center w-full rounded-xl bg-slate-100/90 border border-slate-200/80 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <div className="absolute left-3 flex items-center justify-center pointer-events-none">
                {activeSearchAppliance ? (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <ApplianceIcon
                      id={activeSearchAppliance.id}
                      name={activeSearchAppliance.category}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                ) : (
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              <input
                ref={mobileSearchRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search AC, Washing Machine, Fridge..."
                className="w-full h-9 pl-9 pr-8 text-xs bg-transparent text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Suggestions Dropdown */}
            {searchQuery.trim().length > 0 && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-72 overflow-y-auto custom-scrollbar">
                {suggestions.map((item, index) => (
                  <div
                    key={`mob-${item.id}-${index}`}
                    onMouseDown={() => handleSuggestionSelect(item)}
                    className="px-3 py-2.5 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors border-b border-slate-100 last:border-none flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                        <ApplianceIcon id={item.id} name={item.category} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0 flex flex-col text-left flex-1">
                        <span className="font-bold text-slate-800 truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full shrink-0">
                      Book &rarr;
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-Over Drawer Navigation ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs min-[1024px]:hidden"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              data-lenis-prevent
              className="fixed top-0 right-0 bottom-0 w-[84%] max-w-sm bg-white z-50 shadow-2xl flex flex-col min-[1024px]:hidden overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                  <img src={logo2} alt="Magic Mistry" className="h-8 w-auto" />
                  <span className="font-black text-sm text-[#0B1E40]">
                    Magic<span className="text-orange-500">Mistry</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {/* 1. User Identity or Guest Auth */}
                {isLoggedIn ? (
                  <div className="p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        {(() => {
                          const avatarInfo = getAvatarRenderInfo();
                          if (avatarInfo) {
                            return (
                              <div
                                className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarInfo.color} text-white flex items-center justify-center text-xl shadow-xs`}
                              >
                                {avatarInfo.icon}
                              </div>
                            );
                          }
                          return (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                              {getInitials()}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                        <span
                          className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-700'
                              : isVendor
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isAdmin ? '🛡️ Administrator' : isVendor ? '⚡ Verified Partner' : '✓ Customer'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors text-center"
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/signup');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs text-center"
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {/* 2. Fast Book Service Primary CTA */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/booking');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs rounded-xl shadow-xs shadow-orange-500/20 active:scale-97 transition-all cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Book Doorstep Technician</span>
                </button>

                {/* 3. Active Location Status */}
                {cleanDisplayLocation && (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service City</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{cleanDisplayLocation}</p>
                      </div>
                    </div>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={handleGoToProfile}
                        className="text-xs font-bold text-orange-600 bg-orange-100/60 px-2.5 py-1 rounded-lg shrink-0"
                      >
                        Change
                      </button>
                    )}
                  </div>
                )}

                {/* 4. Primary Navigation Links */}
                <div className="space-y-1">
                  <p className="px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={`mob-nav-${item.label}`}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        item.isActive
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </Link>
                  ))}
                </div>

                {/* 5. User Account Shortcuts (when logged in) */}
                {isLoggedIn && (
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <p className="px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      My Account
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(getDashboardRoute());
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span>{isAdmin ? 'Admin Dashboard' : isVendor ? 'Vendor Portal' : 'Customer Dashboard'}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>

                    {!isAdmin && !isVendor && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate('/dashboard?tab=bookings');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <span>My Bookings</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </button>
                    )}
                  </div>
                )}

                {/* 6. Emergency Support & Helpline */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold">Doorstep Helpline</span>
                  </div>
                  <p className="text-[11px] text-amber-700/90 mt-1">
                    Have an urgent appliance breakdown? Speak with our operations team.
                  </p>
                  <a
                    href="tel:+918000000000"
                    className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <span>Call Support</span>
                  </a>
                </div>
              </div>

              {/* Drawer Footer with Logout */}
              {isLoggedIn && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/70 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Spacer Div to prevent content overlap ── */}
      <div className="h-[108px] min-[1024px]:h-[68px] w-full" aria-hidden="true" />

      {/* ── Login Required Modal for Direct Search Booking ── */}
      <LoginRequiredModal
        isOpen={showSearchLoginModal}
        onClose={() => setShowSearchLoginModal(false)}
        appliance={selectedSearchAppliance}
      />
    </>
  );
};

export default Navbar;