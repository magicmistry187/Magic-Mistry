import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, ShoppingCart, MapPin, Menu, X, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@example.com' });

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

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  // 1. THIS MUST BE ABOVE YOUR RETURN STATEMENT
  const searchData = [
    "AC Service & Repair",
    "AC Installation",
    "Fridge Repair",
    "Washing Machine Repair",
    "Microwave Repair"
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const filteredResults = searchData.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredResults);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (selection) => {
    setSearchQuery(selection);
    setShowSuggestions(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="w-full">
          {/* Desktop & Tablet Navbar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <span className="text-3xl font-bold text-blue-900">€</span>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  to="/find-service"
                  className="relative group text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors duration-300"
                >
                  Find Service
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>

                <Link
                  to="/how-it-works"
                  className="relative group text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors duration-300"
                >
                  How it Works
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>

                <Link
                  to="/business-solutions"
                  className="relative group text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors duration-300"
                >
                  Business Solutions
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>

              {/* Desktop Search Bar - Visible on md screens and up */}
              <div className="hidden md:flex flex-1 max-w-sm mx-4">
                {/* Added z-50 and relative so the dropdown stays on top and attached to the input */}
                <div className="hidden md:flex flex-1 max-w-sm mx-4">
                  <div className="relative w-full z-50">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                      onBlur={() => setShowSuggestions(false)}
                      placeholder="Search for AC, Fridge .."
                      className="w-full px-4 py-2 pl-10 text-sm bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col">
                        {suggestions.length > 0 ? (
                          suggestions.map((item, index) => (
                            <div
                              key={index}
                              onMouseDown={() => handleSuggestionSelect(item)}
                              className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors border-b border-gray-50 last:border-none flex items-center gap-2"
                            >
                              <Search className="w-3 h-3 text-gray-400" />
                              {item}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-sm text-gray-500 text-center">
                            No results found for "{searchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Right Items */}
              <div className="flex items-center space-x-4 md:space-x-6">

                {/* Location - Hidden on mobile */}
                <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden md:inline">Bangalore, IN</span>
                </div>

                {/* Bell Icon */}
                {/* Custom Keyframe for the ringing animation */}
                <style>
                  {`
          @keyframes ring {
            0% { transform: rotate(0deg); }
            15% { transform: rotate(15deg); }
            30% { transform: rotate(-15deg); }
            45% { transform: rotate(10deg); }
            60% { transform: rotate(-10deg); }
            75% { transform: rotate(5deg); }
            85% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
          }
          .group:hover .bell-ring {
            animation: ring 0.8s ease-in-out;
            transform-origin: top center;
          }
        `}
                </style>

                {/* Button with the 'group' class to trigger the hover state */}
                <button className="group p-[15px] rounded-[10px] text-gray-600 transition-colors duration-500 hover:bg-gray-100 hover:text-gray-900">
                  <Bell className="w-6 h-6 bell-ring" />
                </button>

                {/* Cart Icon */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">0</span>
                </button>

                {/* User Profile or Login Button */}
                {isLoggedIn ? (
                  // User Profile Section
                  <div className="hidden sm:flex items-center space-x-3 pl-4 border-l border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs font-medium text-gray-700">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1 text-gray-600 hover:text-red-600 ml-2"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // New Animated Login Button with SVG
                  <button
                    onClick={handleLogin}
                    className="hidden sm:flex items-center justify-center  px-[20px] py-[10px] bg-[#007ACC] outline outline-[3px] outline-[#007ACC] outline-offset-[-3px] rounded-[45px] text-white transition-all duration-[400ms] hover:bg-transparent hover:text-[#007ACC]"
                  >

                    <span className="font-bold text-[1em] transition-colors duration-[400ms]">Login</span>
                  </button>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

              </div>

            </div>
          </div>

          {/* Mobile Search Bar - Visible only on mobile (below md) */}
          <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50">
            {/* Added z-50 so the dropdown stays above the rest of the page on mobile */}
            <div className="relative w-full z-50">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                placeholder="Search for AC, Fridge .."
                className="w-full px-4 py-2 pl-10 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

              {/* Mobile Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col">
                  {suggestions.length > 0 ? (
                    suggestions.map((item, index) => (
                      <div
                        key={index}
                        onMouseDown={() => handleSuggestionSelect(item)}
                        className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors border-b border-gray-50 last:border-none flex items-center gap-2"
                      >
                        <Search className="w-3 h-3 text-gray-400" />
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-500 text-center">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-gray-50 border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">

                {/* Mobile Nav Links */}
                <a href="#" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">Find Service</a>
                <a href="#" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">How it Works</a>
                <a href="#" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">Business Solutions</a>

                {/* Mobile Location */}
                <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 border-t border-gray-200 mt-2 pt-3">
                  <MapPin className="w-4 h-4" />
                  <span>Bangalore, IN</span>
                </div>

                {/* Mobile User Profile or Login */}
                {isLoggedIn ? (
                  <div className="px-4 py-3 border-t border-gray-200 mt-2 pt-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm font-semibold text-red-600 border border-red-600 rounded hover:bg-red-50 flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="w-full sm:hidden flex items-center justify-center px-[15px] py-[10px] mt-2 bg-[#007ACC] outline outline-[3px] outline-[#007ACC] outline-offset-[-3px] rounded-[5px] text-white font-bold text-[1em] transition-all duration-[400ms] hover:bg-transparent hover:text-[#007ACC]"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </nav>

      {/* 
        SPACER DIV:
        Because the nav is 'fixed', it loses its height in the document flow. 
        This div takes up the exact same amount of space so components below it aren't hidden.
        - On mobile: The navbar includes the search bar natively, taking up ~126px height.
        - On desktop (md): The navbar is standard 64px (h-16).
      */}
      <div className="h-[126px] md:h-16 w-full"></div>
    </>
  );
};

export default Navbar;