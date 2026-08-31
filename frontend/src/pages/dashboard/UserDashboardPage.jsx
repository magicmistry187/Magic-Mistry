import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAddressesApi, createAddressApi, updateAddressApi, deleteAddressApi } from '../../services/operations/addressAPI';
import { getMyBookingsApi, cancelBookingApi } from '../../services/operations/bookingAPI';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  LayoutDashboard, Wrench, Heart, Settings, LogOut, Bell,
  Star, CheckCircle2, Clock, AlertCircle, ChevronRight, ChevronLeft, ChevronDown,
  Phone, Mail, MapPin, Calendar, Award, TrendingUp,
  Zap, Shield, User, Edit3, ToggleLeft, ToggleRight,
  Package, ArrowRight, Download, CreditCard, Navigation,
  Plus, Search, Filter, MessageSquare, Check, RefreshCw,
  Home, Briefcase, Tag, Trash2, HelpCircle, Camera, ShieldCheck, LocateFixed,
  Loader2
} from 'lucide-react';

// ── User Dashboard Components (renamed with User__ prefix for clarity) ───────
import UserTechnicianMapModal from '../../components/dashboard/user/UserTechnicianMapModal';
import UserInvoiceModal       from '../../components/dashboard/user/UserInvoiceModal';
import UserAddressModal        from '../../components/dashboard/user/UserAddressModal';
import UserRatingModal         from '../../components/dashboard/user/UserRatingModal';
import ApplianceIcon           from '../../components/common/ApplianceIcon';
import { parseAddressString }  from '../../utils/addressParser';


// ─── Initial Data ────────────────────────────────────────────────────────────
const initialBookings  = [];   // populated from backend via getMyBookingsApi
const savedAppliances  = [];
const initialAddresses = [];

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        In Progress
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Pending
      </span>
    );
  }
  if (status === 'Accepted') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-600" />
        Accepted
      </span>
    );
  }
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
      Cancelled
    </span>
  );
};

// ─── Motion Variants ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Helper: re-map backend address list to UI shape ────────────────────────
const mapAddresses = (list) =>
  (Array.isArray(list) ? list : []).map((a) => {
    const parsed = parseAddressString(a);
    return {
      id: a._id || a.id,
      _id: a._id || a.id,
      type: a.addressType || a.type || 'Home',
      addressType: a.addressType || a.type || 'Home',
      flat: parsed.flat || a.house || a.addressLine1 || '',
      house: a.house || parsed.flat || '',
      addressLine1: a.addressLine1 || a.house || parsed.flat || '',
      street: parsed.street || a.street || '',
      landmark: parsed.landmark || a.landmark || '',
      city: parsed.city || a.city || '',
      state: parsed.state || a.state || '',
      country: a.country || 'India',
      pincode: parsed.pincode || a.pincode || '',
      isDefault: !!a.isDefault,
      location: a.location,
      latitude: a.location?.coordinates?.[1] ?? a.latitude ?? null,
      longitude: a.location?.coordinates?.[0] ?? a.longitude ?? null,
    };
  });

export default function UserDashboardPage() {
  const { user, token, logout, location, updateLocation, updateProfile, loading } = useAuth();
  const navigate = useNavigate();

  // Role guard — redirect vendors/admins to their correct dashboard
  React.useEffect(() => {
    if (loading) return; // wait for auth to rehydrate
    if (user?.role === 'vendor') {
      navigate('/vendor-dashboard', { replace: true });
    } else if (user?.role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Bookings list state
  const [bookingsList, setBookingsList] = useState(initialBookings);

  // Fetch real backend bookings and addresses on mount
  React.useEffect(() => {
    async function loadData() {
      if (!token) return;
      
      // Load Bookings
      const resBookings = await getMyBookingsApi(token);
      if (resBookings.success && Array.isArray(resBookings.bookings)) {
        const formatted = resBookings.bookings.map((b) => ({
          id: b._id || 'BK-' + Date.now().toString().slice(-6),
          service: b.serviceCategory || b.appliance || 'Appliance Service',
          applianceIcon: '🔧',
          technician: b.vendor?.fullName || 'Verification Pending',
          techRating: '4.9',
          techJobs: '100+',
          techAvatar: 'MM',
          date: b.serviceDate ? new Date(b.serviceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
          time: b.timeSlot || 'Scheduled Slot',
          status: b.bookingStatus || 'Pending',
          price: `₹${b.serviceCategoryCharge ?? 299}`,
          customerName: user?.fullName || 'Customer',
          address: b.address,
          image: b.image,
          rawBooking: b,
        }));
        setBookingsList(formatted);
      }

      // Load Addresses
      const resAddrs = await getAddressesApi(token);
      if (resAddrs.success && Array.isArray(resAddrs.addresses)) {
        setAddresses(mapAddresses(resAddrs.addresses));
      } else {
        setAddresses([]);
      }
    }
    loadData();
  }, [token, user]);

  // Navigation tabs: 'overview', 'bookings', 'history', 'payments', 'addresses', 'support', 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedBookingForMap, setSelectedBookingForMap] = useState(null);

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addresses, setAddresses] = useState(initialAddresses);

  // Derive authentic active location strictly from saved addresses
  const activeBackendAddress = React.useMemo(() => {
    if (addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      const str = [def.flat || def.house, def.street, def.landmark, def.city, def.state, def.pincode]
        .filter(Boolean)
        .join(', ')
        .replace(/^(current location|location),\s*/i, '')
        .trim();
      return str;
    }
    return '';
  }, [addresses]);

  const handleOpenEditDefaultAddress = () => {
    const defaultAddr = (Array.isArray(addresses) && addresses.length > 0)
      ? (addresses.find((a) => a.isDefault) || addresses[0])
      : (activeBackendAddress || (user?.location && user.location !== 'Set Your Location' ? user.location : null));

    setEditingAddress(defaultAddr || null);
    setIsAddressModalOpen(true);
  };

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);

  // My Bookings Filter state ('All', 'In Progress', 'Completed', 'Cancelled')
  const [bookingsFilter, setBookingsFilter] = useState('All');

  // Settings State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [whatsappNotifs, setWhatsappNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Mobile Expandable Header Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync user details when user state rehydrates
  React.useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.email) setEmail(user.email);
      if (user.phoneNumber) setPhone(user.phoneNumber);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!fullName || !fullName.trim()) {
      showToast('Full Name is required');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
        location: location && location !== 'Set Your Location' ? location : '',
      });
      if (res && res.success) {
        setIsEditingProfile(false);
        showToast('Profile updated successfully!');
      } else {
        showToast(res?.message || 'Failed to update profile');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getInitials = () => {
    const name = user?.fullName || fullName;
    if (!name) return 'R';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    if (newStatus === 'Cancelled' && token) {
      await cancelBookingApi(bookingId, token);
    }
  };

  const handleOpenMap = (booking) => {
    setSelectedBookingForMap(booking);
    setSelectedTech({
      name: booking.technician || 'Suresh Kumar',
      rating: booking.techRating || '4.9',
      jobs: booking.techJobs || '120+',
      phone: '+919876543210',
    });
    setIsMapOpen(true);
  };

  const handleOpenInvoice = (booking) => {
    setSelectedBookingForInvoice(booking);
    setIsInvoiceOpen(true);
  };

  const handleSaveAddress = async (addressObj) => {
    const formattedStr = [
      addressObj.flat || addressObj.house,
      addressObj.street,
      addressObj.landmark,
      addressObj.city,
      addressObj.state,
      addressObj.pincode,
    ].filter(Boolean).join(', ');

    // If user explicitly checked isDefault, or if it is the very first address
    const makeDefault = addressObj.isDefault !== undefined ? !!addressObj.isDefault : (addresses.length === 0 && !editingAddress);

    const payload = {
      addressType: addressObj.type || addressObj.addressType || 'Home',
      house: addressObj.flat || addressObj.house || addressObj.street || 'Home',
      addressLine1: addressObj.flat || addressObj.house || addressObj.street || '',
      street: addressObj.street || addressObj.flat || 'Area',
      landmark: addressObj.landmark || '',
      city: addressObj.city || '',
      state: addressObj.state || '',
      pincode: addressObj.pincode || '',
      country: addressObj.country || 'India',
      isDefault: makeDefault,
    };

    if (addressObj.latitude && addressObj.longitude) {
      payload.latitude = addressObj.latitude;
      payload.longitude = addressObj.longitude;
      payload.location = {
        type: 'Point',
        coordinates: [Number(addressObj.longitude), Number(addressObj.latitude)],
      };
    }

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') : null);

    if (authToken) {
      if (editingAddress && (editingAddress.id || editingAddress._id)) {
        await updateAddressApi(editingAddress.id || editingAddress._id, payload, authToken);
        showToast('Address updated successfully!');
      } else {
        await createAddressApi(payload, authToken);
        showToast('Address added successfully!');
      }
      const resAddrs = await getAddressesApi(authToken);
      if (resAddrs.success && Array.isArray(resAddrs.addresses)) {
        const mapped = mapAddresses(resAddrs.addresses);
        setAddresses(mapped);
        // If it was marked default or there's a default address, sync active location
        const def = mapped.find(a => a.isDefault) || (makeDefault ? mapped[0] : null);
        if (def) {
          const defStr = [def.flat, def.street, def.landmark, def.city, def.state, def.pincode]
            .filter(Boolean).join(', ');
          updateLocation(defStr, def.latitude && def.longitude ? { lat: def.latitude, lng: def.longitude } : null);
        }
      }
    } else {
      if (editingAddress) {
        setAddresses(prev => prev.map(a => a.id === addressObj.id ? { ...addressObj, isDefault: makeDefault } : a));
      } else {
        setAddresses(prev => [...prev, { ...addressObj, isDefault: makeDefault }]);
      }
      if (makeDefault) {
        updateLocation(formattedStr);
      }
      showToast('Address saved locally.');
    }

    setEditingAddress(null);
  };

  // ── Set a saved address as the default (persists to backend) ───────────────
  const handleSetDefault = async (addrId) => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') : null);
    if (authToken) {
      await updateAddressApi(addrId, { isDefault: true }, authToken);
      const resAddrs = await getAddressesApi(authToken);
      if (resAddrs.success && Array.isArray(resAddrs.addresses)) {
        const mapped = mapAddresses(resAddrs.addresses);
        setAddresses(mapped);
        const def = mapped.find(a => a.isDefault);
        if (def) {
          const defStr = [def.flat, def.street, def.landmark, def.city, def.state, def.pincode]
            .filter(Boolean).join(', ');
          updateLocation(defStr, def.latitude && def.longitude ? { lat: def.latitude, lng: def.longitude } : null);
        }
      }
      showToast('Default address updated!');
    } else {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addrId })));
      showToast('Default address updated locally.');
    }
  };

  const handleDeleteAddress = async (id) => {
    const targetId = id || '';
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') : null);
    
    // Optimistically update local state immediately
    const remaining = addresses.filter((a) => a.id !== targetId && a._id !== targetId);
    setAddresses(remaining);

    if (authToken && targetId) {
      try {
        const res = await deleteAddressApi(targetId, authToken);
        if (res.success) {
          showToast('Address deleted successfully!');
          const resAddrs = await getAddressesApi(authToken);
          if (resAddrs.success && Array.isArray(resAddrs.addresses)) {
            const mapped = mapAddresses(resAddrs.addresses);
            setAddresses(mapped);
            if (mapped.length > 0) {
              const newDef = mapped.find((a) => a.isDefault) || mapped[0];
              const defStr = [newDef.flat || newDef.house, newDef.street, newDef.landmark, newDef.city, newDef.state, newDef.pincode]
                .filter(Boolean)
                .join(', ');
              updateLocation(defStr);
            } else {
              updateLocation('');
            }
          } else {
            updateLocation('');
          }
        } else {
          showToast(res.message || 'Address deleted.');
        }
      } catch (err) {
        console.error('Error deleting address:', err);
        showToast('Address deleted.');
      }
    } else {
      if (remaining.length === 0) {
        updateLocation('');
      }
      showToast('Address deleted.');
    }
  };

  const handleSubmitRating = ({ bookingId, rating, review }) => {
    setBookingsList(prev => prev.map(b => b.id === bookingId ? { ...b, ratingSubmitted: rating, review } : b));
  };

  // Nav menu definition
  const sidebarNavItems = [
    { id: 'overview',  label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'bookings',  label: 'Active Repairs',   icon: Wrench },
    { id: 'history',   label: 'Booking History',  icon: Clock },
    { id: 'payments',  label: 'Payments',         icon: CreditCard },
    { id: 'addresses', label: 'Saved Addresses',  icon: MapPin },
    { id: 'support',   label: 'Support',          icon: HelpCircle },
    { id: 'settings',  label: 'User Settings',    icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans antialiased text-slate-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 print:hidden">
        
        {/* ── MOBILE & TABLET EXPANDABLE HEADER CARD (Visible on screens < lg) ── */}
        <div className="lg:hidden bg-white rounded-3xl p-3.5 sm:p-4 shadow-sm border border-slate-200/90 mb-6 transition-all duration-200">
          
          {/* Header Row: User Info + Active Tab Badge + Switch Tab Button */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: User Profile & Current Section */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 leading-none truncate">
                  Welcome back, {user?.fullName?.split(' ')[0] || 'Customer'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {(() => {
                    const currentItem = sidebarNavItems.find(i => i.id === activeTab) || sidebarNavItems[0];
                    const CurrentIcon = currentItem.icon;
                    return (
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 bg-slate-100/80 px-2.5 py-0.5 rounded-lg truncate">
                        <CurrentIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">{currentItem.label}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Right: Switch Tab Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                isMobileMenuOpen
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 border-slate-200/80'
              }`}
            >
              <span>{isMobileMenuOpen ? 'Close' : 'Switch Tab'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180 text-orange-400' : 'text-slate-400'}`} />
            </button>
          </div>

          {/* Collapsible Dropdown Grid of Sections */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3.5 mt-3.5 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    Select Section
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {sidebarNavItems.map((item) => {
                      const isActive = activeTab === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                            isActive
                              ? 'bg-[#061e38] text-white shadow-md'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 bg-slate-50/80 border border-slate-100'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-orange-500 text-white' : 'bg-white text-slate-500 border border-slate-200/60 shadow-2xs'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="flex-1 truncate">{item.label}</span>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Logout Option in Expanded Menu */}
                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── DESKTOP SIDEBAR NAVIGATION (Visible on screens lg+) ─────────────── */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 sticky top-28">

              {/* User Profile Summary */}
              <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-200">
                  {getInitials()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                    Welcome back
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                    Manage your electronics
                  </p>
                </div>
              </div>

              {/* Nav Links List */}
              <nav className="space-y-1">
                {sidebarNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="pt-4 border-t border-slate-100">
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5 text-rose-500" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* ───────────────────────────────────────────────────────────────── */}
              {/* 1. DASHBOARD OVERVIEW TAB (Matching Reference Screenshot 1)      */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* Top Welcome Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Customer'}.
                      </h1>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Here is a quick overview of your current services and saved appliances.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenEditDefaultAddress}
                      className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 bg-white hover:bg-orange-50 px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs transition-colors cursor-pointer max-w-full truncate"
                      title="Add or Change Address"
                    >
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="truncate">{activeBackendAddress || 'Set Your Location'}</span>
                      <span className="text-[10px] text-orange-600 font-extrabold bg-orange-100 px-1.5 py-0.5 rounded shrink-0">
                        {activeBackendAddress ? 'Change' : 'Set'}
                      </span>
                    </button>
                  </div>

                  {/* ─ RECENT / ACTIVE BOOKINGS SECTION ─ */}
                  {(() => {
                    const totalCount = bookingsList.length;

                    if (totalCount === 0) {
                      return (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                              <h2 className="font-extrabold text-slate-900 text-lg">
                                Service Tracking
                              </h2>
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                0 Bookings
                              </span>
                            </div>
                            <button
                              onClick={() => navigate('/booking')}
                              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" /> Book New Service
                            </button>
                          </div>

                          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                            <div className="text-center py-4">
                              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                                <Wrench className="w-7 h-7 text-orange-500" />
                              </div>
                              <h3 className="text-base font-extrabold text-slate-900">No Repair Orders Yet</h3>
                              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                                Submit a new service request to track technician assignment, arrival time, and repair diagnostic progress live.
                              </p>
                            </div>

                            {/* Service Progress Stepper Placeholder */}
                            <div className="pt-4 border-t border-slate-200/60 max-w-xl mx-auto">
                              <div className="relative flex items-center justify-between px-4">
                                <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-200 z-0" />

                                {/* Step 1: Received */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-7 h-7 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                    1
                                  </div>
                                  <span className="text-xs font-semibold text-slate-400 mt-2">Received</span>
                                </div>

                                {/* Step 2: Technician Assigned */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">
                                    2
                                  </div>
                                  <span className="text-xs font-semibold text-slate-400 mt-2">Assigned</span>
                                </div>

                                {/* Step 3: Under Diagnosis */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">
                                    3
                                  </div>
                                  <span className="text-xs font-semibold text-slate-400 mt-2">Under Diagnosis</span>
                                </div>

                                {/* Step 4: Repaired */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">
                                    4
                                  </div>
                                  <span className="text-xs font-semibold text-slate-400 mt-2">Repaired</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    const displayedBookings = bookingsList.slice(0, 2);

                    return (
                      <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <h2 className="font-extrabold text-slate-900 text-lg">
                              Recent Bookings
                            </h2>
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-700 border border-orange-200">
                              Showing {displayedBookings.length} of {totalCount} {totalCount === 1 ? 'Booking' : 'Bookings'}
                            </span>
                          </div>
                        </div>

                        {/* List maximum 2 booking tracking cards in Overview */}
                        <div className="space-y-6">
                          {displayedBookings.map((activeBooking) => (
                            <div key={activeBooking.id} className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100 space-y-5 sm:space-y-6">
                              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-6">

                                {/* Service Title & Booking ID */}
                                <div className="flex items-start gap-3.5 sm:gap-4">
                                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 shadow-xs p-2">
                                    <ApplianceIcon name={activeBooking.service} className="w-7 h-7 sm:w-9 sm:h-9" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                                        {activeBooking.service}
                                      </h3>
                                      <StatusBadge status={activeBooking.status} />
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 mt-1">
                                      Booking ID: <span className="font-bold text-slate-600">{activeBooking.id}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                                      📅 {activeBooking.date} • ⏰ {activeBooking.time}
                                    </p>
                                  </div>
                                </div>

                                {/* Technician Card Box */}
                                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
                                  <div>
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                                      Assigned Technician
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm">
                                        {activeBooking.techAvatar || 'MM'}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1">
                                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{activeBooking.technician || 'Verification Pending'}</span>
                                          <Shield className="w-3.5 h-3.5 text-blue-600 fill-blue-100 shrink-0" />
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                                          <span className="font-bold text-slate-800">{activeBooking.techRating || '4.9'}</span> ({activeBooking.techJobs || '100+'} jobs)
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleOpenMap(activeBooking)}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                                  >
                                    <Navigation className="w-4 h-4 text-orange-500" />
                                    Track on Map
                                  </button>
                                </div>
                              </div>

                              {/* ─ Animated Progress Stepper Bar ─ */}
                              <div className="pt-4 border-t border-slate-200/60">
                                <div className="relative flex items-center justify-between max-w-xl mx-auto px-2 sm:px-4">
                                  {/* Background Line */}
                                  <div className="absolute top-1/2 left-6 sm:left-8 right-6 sm:right-8 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                                  {/* Active Orange Progress Fill Line */}
                                  <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{
                                      width:
                                        activeBooking.status === 'Completed'
                                          ? '100%'
                                          : activeBooking.status === 'In Progress'
                                          ? '50%'
                                          : activeBooking.status === 'Accepted'
                                          ? '25%'
                                          : '0%',
                                    }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="absolute top-1/2 left-6 sm:left-8 -translate-y-1/2 h-1 bg-orange-500 z-0"
                                  />

                                  {/* Step 1: Requested/Assigned */}
                                  <div className="relative z-10 flex flex-col items-center">
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white flex items-center justify-center text-xs shadow-md ${
                                      ['Accepted', 'In Progress', 'Completed'].includes(activeBooking.status)
                                        ? 'bg-orange-500 shadow-orange-200'
                                        : activeBooking.status === 'Pending'
                                        ? 'bg-amber-500 ring-4 ring-amber-200'
                                        : 'bg-slate-300 text-slate-600'
                                    }`}>
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-900 mt-2 text-center leading-tight max-w-[55px] sm:max-w-none">
                                      {activeBooking.status === 'Pending' ? 'Received' : 'Assigned'}
                                    </span>
                                  </div>

                                  {/* Step 2: Under Diagnosis */}
                                  <div className="relative z-10 flex flex-col items-center">
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white flex items-center justify-center text-xs shadow-md ${
                                      activeBooking.status === 'In Progress'
                                        ? 'bg-orange-500 ring-4 ring-orange-200'
                                        : activeBooking.status === 'Completed'
                                        ? 'bg-orange-500'
                                        : 'bg-slate-200 text-slate-400'
                                    }`}>
                                      {activeBooking.status === 'In Progress' ? (
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                      ) : activeBooking.status === 'Completed' ? (
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      ) : (
                                        2
                                      )}
                                    </div>
                                    <span className={`text-[10px] sm:text-xs font-extrabold mt-2 text-center leading-tight max-w-[65px] sm:max-w-none ${activeBooking.status === 'In Progress' ? 'text-orange-600' : 'text-slate-500'}`}>Under Diagnosis</span>
                                  </div>

                                  {/* Step 3: Repaired */}
                                  <div className="relative z-10 flex flex-col items-center">
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white flex items-center justify-center text-xs shadow-md ${
                                      activeBooking.status === 'Completed' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                      {activeBooking.status === 'Completed' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : 3}
                                    </div>
                                    <span className={`text-[10px] sm:text-xs font-semibold mt-2 text-center leading-tight max-w-[55px] sm:max-w-none ${activeBooking.status === 'Completed' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>Repaired</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* View All Button when there are more than 2 bookings */}
                        {totalCount > 2 && (
                          <div className="pt-2 text-center border-t border-slate-100">
                            <button
                              onClick={() => setActiveTab('bookings')}
                              className="w-full sm:w-auto px-6 py-3 bg-[#0a192f] hover:bg-[#122849] text-white text-xs font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                            >
                              View All Bookings ({totalCount})
                              <ChevronRight className="w-4 h-4 text-orange-400" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })()}

                  {/* ─ QUICK ACTIONS / SAVED APPLIANCES GRID ─ */}
                  <div className="space-y-4">
                    <h2 className="font-extrabold text-slate-900 text-lg">Quick Actions</h2>
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid sm:grid-cols-3 gap-6"
                    >
                      {/* Dark Blue Book New Service Card */}
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        onClick={() => navigate('/booking')}
                        className="bg-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl cursor-pointer group border border-slate-800 relative overflow-hidden"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xl mb-1">Book New Service</h3>
                          <p className="text-xs text-slate-400">Schedule a repair or maintenance.</p>
                        </div>
                      </motion.div>

                      {/* Quick Action Category 1: AC Repair & Cleaning */}
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        onClick={() => navigate('/booking')}
                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-orange-200 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1">
                            <ApplianceIcon name="ac" className="w-8 h-8" />
                          </div>
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Popular</span>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-extrabold text-slate-900 text-base">AC Repair & Deep Clean</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Instant booking & diagnostic check-up</p>
                        </div>
                        <button
                          onClick={() => navigate('/booking')}
                          className="mt-6 w-full py-2.5 border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-xs font-extrabold rounded-2xl transition-colors cursor-pointer"
                        >
                          Book Service
                        </button>
                      </motion.div>

                      {/* Quick Action Category 2: Appliance Diagnostics */}
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        onClick={() => navigate('/booking')}
                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-orange-200 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-amber-500" />
                          </div>
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">Fast Repair</span>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-extrabold text-slate-900 text-base">Home Appliance Checkup</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Fridge, Fan, TV, Washing Machine</p>
                        </div>
                        <button
                          onClick={() => navigate('/booking')}
                          className="mt-6 w-full py-2.5 border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-xs font-extrabold rounded-2xl transition-colors cursor-pointer"
                        >
                          Book Service
                        </button>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* ─ RECENT HISTORY TABLE (Matching Reference Screenshot 1) ─ */}
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-extrabold text-slate-900 text-lg">Recent History</h2>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                      >
                        View full history <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 uppercase font-extrabold border-b border-slate-100">
                            <th className="py-3.5 px-4 rounded-l-2xl">Date</th>
                            <th className="py-3.5 px-4">Appliance / Service</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Total Paid</th>
                            <th className="py-3.5 px-4 text-center rounded-r-2xl">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bookingsList.length > 0 ? (
                            bookingsList.slice(0, 5).map((row) => (
                              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-4 px-4 font-bold text-slate-600">{row.date}</td>
                                <td className="py-4 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                                  <ApplianceIcon name={row.service} className="w-5 h-5 shrink-0" />
                                  <span>{row.service}</span>
                                </td>
                                <td className="py-4 px-4">
                                  <StatusBadge status={row.status} />
                                </td>
                                <td className="py-4 px-4 font-extrabold text-slate-900">{row.price}</td>
                                <td className="py-4 px-4 text-center">
                                  <button
                                    onClick={() => handleOpenInvoice(row)}
                                    className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                                    title="Download Invoice"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                                No recent bookings found. Click 'Book New Service' to create a booking request.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </motion.div>
              )}


              {/* ───────────────────────────────────────────────────────────────── */}
              {/* 2. MY BOOKINGS / ACTIVE REPAIRS TAB                              */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
                      <p className="text-slate-500 text-sm mt-1">Track status and details for all your repair requests.</p>
                    </div>
                    <button
                      onClick={() => navigate('/booking')}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Book New Service
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {['All', 'Pending', 'Accepted', 'In Progress', 'On The Way', 'Completed', 'Cancelled'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setBookingsFilter(tab)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                          bookingsFilter === tab
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Bookings Card List — each with its own status stepper */}
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                    {bookingsList
                      .filter(b => bookingsFilter === 'All' || b.status === bookingsFilter)
                      .length === 0 ? (
                        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
                          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                            <Package className="w-6 h-6" />
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-base">No bookings found</h3>
                          <p className="text-xs text-slate-400 mt-1">No bookings match the selected filter.</p>
                        </div>
                      ) : (
                        bookingsList
                          .filter(b => bookingsFilter === 'All' || b.status === bookingsFilter)
                          .map((item) => {
                            // Determine stepper progress
                            const STEPS = [
                              { label: 'Order Placed', key: 'placed' },
                              { label: 'Technician Assigned', key: 'assigned' },
                              { label: 'In Progress', key: 'progress' },
                              { label: 'Completed', key: 'done' },
                            ];
                            const stepIndex =
                              item.status === 'Cancelled'
                                ? -1
                                : item.status === 'Completed'
                                ? 3
                                : item.status === 'In Progress'
                                ? 2
                                : item.status === 'Accepted' || item.status === 'On The Way'
                                ? 1
                                : 0; // Pending

                            const isCancelled = item.status === 'Cancelled';

                            return (
                              <motion.div
                                key={item.id}
                                variants={itemVariants}
                                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                              >
                                {/* Card Header */}
                                <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-5">
                                  {/* Left: Service info */}
                                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 p-2">
                                      <ApplianceIcon name={item.service} className="w-7 h-7 sm:w-8 sm:h-8" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">{item.service}</h3>
                                        <StatusBadge status={item.status} />
                                      </div>
                                      <p className="text-xs font-medium text-slate-400 mt-0.5">
                                        Booking ID: <span className="font-bold text-slate-700">{item.id}</span>
                                      </p>
                                      <div className="flex items-center gap-2.5 sm:gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {item.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {item.time}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {item.technician || 'Verification Pending'}
                                        </span>
                                        {item.address && (
                                          <span className="flex items-center gap-1 text-slate-600">
                                            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                            <span className="truncate max-w-[200px] sm:max-w-xs" title={typeof item.address === 'object' ? [item.address.house || item.address.flat, item.address.street, item.address.city].filter(Boolean).join(', ') : item.address}>
                                              {typeof item.address === 'object'
                                                ? [item.address.house || item.address.flat, item.address.street, item.address.city].filter(Boolean).join(', ')
                                                : item.address}
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Price + Actions */}
                                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{item.price}</span>
                                    <div className="flex items-center gap-2">
                                      {['Pending', 'Accepted', 'In Progress', 'On The Way'].includes(item.status) && (
                                        <button
                                          onClick={() => handleOpenMap(item)}
                                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                          <Navigation className="w-3.5 h-3.5 text-orange-500" /> Track
                                        </button>
                                      )}
                                      {item.status === 'Completed' && (
                                        <button
                                          onClick={() => handleOpenInvoice(item)}
                                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                                        >
                                          <Download className="w-3.5 h-3.5" /> Invoice
                                        </button>
                                      )}
                                      {item.status === 'Cancelled' && (
                                        <button
                                          onClick={() => navigate('/booking')}
                                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                                        >
                                          Re-book
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Status Tracking Stepper */}
                                <div className={`px-3 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-slate-100 ${isCancelled ? 'bg-rose-50/50' : 'bg-slate-50/50'}`}>
                                  {isCancelled ? (
                                    <div className="flex items-center gap-3 py-3">
                                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-4 h-4 text-rose-500" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-rose-700">Booking Cancelled</p>
                                        <p className="text-xs text-rose-400 mt-0.5">This booking was cancelled. You can re-book anytime.</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="pt-4">
                                      <div className="relative flex items-start justify-between max-w-xl mx-auto px-1 sm:px-4">
                                        {/* Background connector line */}
                                        <div className="absolute top-3 sm:top-3.5 left-2 sm:left-3.5 right-2 sm:right-3.5 h-1 bg-slate-200 z-0" />
                                        {/* Orange progress fill */}
                                        <motion.div
                                          initial={{ width: '0%' }}
                                          animate={{
                                            width:
                                              stepIndex >= 3 ? '100%'
                                              : stepIndex === 2 ? '66%'
                                              : stepIndex === 1 ? '33%'
                                              : '0%',
                                          }}
                                          transition={{ duration: 0.6, ease: 'easeOut' }}
                                          className="absolute top-3 sm:top-3.5 left-2 sm:left-3.5 h-1 bg-orange-500 z-0"
                                        />

                                        {STEPS.map((step, idx) => {
                                          const isDone = stepIndex > idx;
                                          const isActive = stepIndex === idx;
                                          return (
                                            <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                                              <div
                                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow transition-all ${
                                                  isDone
                                                    ? 'bg-orange-500 text-white shadow-orange-200'
                                                    : isActive
                                                    ? item.status === 'Completed'
                                                      ? 'bg-emerald-500 text-white shadow-emerald-200'
                                                      : 'bg-orange-500 text-white ring-4 ring-orange-200 shadow-orange-200'
                                                    : 'bg-slate-200 text-slate-400'
                                                }`}
                                              >
                                                {isDone || (isActive && item.status === 'Completed') ? (
                                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                ) : isActive ? (
                                                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                ) : (
                                                  idx + 1
                                                )}
                                              </div>
                                              <span
                                                className={`text-[9px] sm:text-[10px] font-bold mt-1.5 sm:mt-2 text-center leading-tight max-w-[50px] sm:max-w-[70px] ${
                                                  isDone
                                                    ? 'text-orange-600'
                                                    : isActive
                                                    ? item.status === 'Completed'
                                                      ? 'text-emerald-700'
                                                      : 'text-orange-600'
                                                    : 'text-slate-400'
                                                }`}
                                              >
                                                {step.label}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })
                      )}
                  </motion.div>
                </motion.div>
              )}


              {/* ───────────────────────────────────────────────────────────────── */}
              {/* 3. BOOKING HISTORY TAB                                            */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Booking History</h1>
                    <p className="text-slate-500 text-sm mt-1">Complete log of all past service & repair transactions.</p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 uppercase font-extrabold border-b border-slate-100">
                            <th className="py-3.5 px-4 rounded-l-2xl">Booking ID</th>
                            <th className="py-3.5 px-4">Service</th>
                            <th className="py-3.5 px-4">Date</th>
                            <th className="py-3.5 px-4">Technician</th>
                            <th className="py-3.5 px-4">Price</th>
                            <th className="py-3.5 px-4 text-center rounded-r-2xl">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {bookingsList.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-4 px-4 font-bold text-slate-900">{item.id}</td>
                              <td className="py-4 px-4">
                                <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                  <ApplianceIcon name={item.service} className="w-5 h-5 shrink-0" />
                                  <span>{item.service}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-500">{item.date}</td>
                              <td className="py-4 px-4 text-slate-600">{item.technician || 'Unassigned'}</td>
                              <td className="py-4 px-4 font-extrabold text-slate-900">{item.price}</td>
                              <td className="py-4 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {item.status === 'Completed' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenInvoice(item)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                                      >
                                        Invoice
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedBookingForRating(item);
                                          setIsRatingModalOpen(true);
                                        }}
                                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
                                        title="Rate Service"
                                      >
                                        <Star className={`w-4 h-4 ${item.ratingSubmitted ? 'fill-amber-400' : ''}`} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ───────────────────────────────────────────────────────────────── */}
              {/* 4. PAYMENTS TAB                                                   */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments</h1>
                    <p className="text-slate-500 text-sm mt-1">Payment methods and billing information.</p>
                  </div>

                  {/* Feature In Progress Banner */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-sm"
                  >
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                        <Wrench className="w-6 h-6 text-amber-500" />
                      </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">This Feature is In Progress</h2>
                      <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                        Online payment integration is currently under development. We're working hard to bring you a seamless payment experience soon!
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Coming Soon
                    </span>
                  </motion.div>

                  {/* Available Payment Methods */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-base">Currently Accepted Payment Methods</h3>
                    <p className="text-xs text-slate-500">At this time, we accept the following payment options at the time of service:</p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* UPI Card */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-3xl p-6 border-2 border-violet-200 shadow-sm flex items-start gap-4 cursor-default"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100">
                          <Phone className="w-7 h-7 text-violet-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-slate-900 text-base">UPI Payment</h4>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                              ✓ Available
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Pay via any UPI app — Google Pay, PhonePe, Paytm, BHIM, or any UPI-linked bank account. Quick, instant & secure.
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-bold text-slate-600">Pay directly to technician on service day</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Cash Card */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm flex items-start gap-4 cursor-default"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                          <CreditCard className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-slate-900 text-base">Cash on Delivery</h4>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                              ✓ Available
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Pay in cash directly to your assigned technician after the repair is completed. No advance required.
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-bold text-slate-600">Pay after repair is completed</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">Need Help with Payments?</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        If you have any billing queries or issues, please contact our support team from the Support tab.
                        Online card/wallet payments will be available in a future update.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}



              {/* ───────────────────────────────────────────────────────────────── */}
              {/* 5. SAVED ADDRESSES TAB                                            */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Addresses</h1>
                      <p className="text-slate-500 text-sm mt-1">Manage your home and work repair locations.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setIsAddressModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-orange-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Address
                    </button>
                  </div>

                  {/* ─ CURRENT ACTIVE PRIMARY LOCATION CARD BANNER ─ */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">CURRENT ACTIVE LOCATION</span>
                          {activeBackendAddress && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full flex items-center gap-1 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Synced
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-extrabold text-white mt-0.5 break-words">
                          {activeBackendAddress || 'No address set'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {activeBackendAddress
                            ? 'Used for automatic technician dispatch on booking'
                            : 'Click "Set Location" to add your service address'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleOpenEditDefaultAddress}
                      className="px-4 py-2.5 bg-white text-slate-900 hover:bg-orange-50 hover:text-orange-600 font-extrabold text-xs rounded-2xl transition-colors shrink-0 shadow-md cursor-pointer"
                    >
                      {activeBackendAddress ? 'Change Address' : 'Set Location'}
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {addresses.length === 0 ? (
                      <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center bg-slate-50/70 rounded-3xl border border-dashed border-slate-200 p-8">
                        <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center mb-4 text-orange-500 shadow-sm">
                          <MapPin className="w-8 h-8" />
                        </div>
                        <p className="font-extrabold text-slate-800 text-lg">No saved address yet</p>
                        <p className="text-slate-400 text-sm mt-1 max-w-sm">
                          Set your location or add an address so technicians can be dispatched to your doorstep.
                        </p>
                        <button
                          onClick={() => {
                            setEditingAddress(null);
                            setIsAddressModalOpen(true);
                          }}
                          className="mt-5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-orange-200 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Set Your Location / Add Address
                        </button>
                      </div>
                    ) : (
                      addresses.map((addr) => {
                        const addrId = addr.id || addr._id;
                        return (
                          <div key={addrId} className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${addr.isDefault ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-100'}`}>
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1 bg-orange-50 text-orange-600 font-extrabold text-xs rounded-full flex items-center gap-1">
                                    {addr.type === 'Home' ? <Home className="w-3.5 h-3.5" /> : addr.type === 'Office' ? <Briefcase className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5" />}
                                    {addr.type}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full flex items-center gap-1">
                                      <Check className="w-3 h-3 text-emerald-600" /> Default
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingAddress(addr);
                                      setIsAddressModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                                    title="Edit Address"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAddress(addrId)}
                                    className="p-1.5 text-rose-400 hover:text-rose-600 cursor-pointer transition-colors"
                                    title="Delete Address"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* House / Flat / Building No */}
                              {addr.flat && (
                                <p className="font-extrabold text-slate-900 text-base mt-3">
                                  {addr.flat}
                                </p>
                              )}

                              {/* Street / Area / Locality */}
                              <p className={`text-xs text-slate-600 leading-relaxed ${addr.flat ? 'mt-1' : 'mt-3 font-extrabold text-slate-900 text-base'}`}>
                                {addr.street || 'Street / Locality'}
                              </p>

                              {/* Landmark */}
                              {addr.landmark && (
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <span className="font-medium text-slate-400">Landmark:</span> {addr.landmark}
                                </p>
                              )}

                              {/* City, State - Pincode */}
                              <p className="text-xs font-semibold text-slate-700 mt-1.5">
                                {[addr.city, addr.state].filter(Boolean).join(', ')}{addr.pincode ? ` - ${addr.pincode}` : ''}
                              </p>

                              {/* Country */}
                              {addr.country && (
                                <p className="text-[11px] text-slate-400 mt-0.5">{addr.country}</p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => !addr.isDefault && handleSetDefault(addrId)}
                              disabled={addr.isDefault}
                              className={`w-full py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                                addr.isDefault
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                  : 'bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 cursor-pointer'
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              {addr.isDefault ? 'Default Location' : 'Set as Default'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {/* ───────────────────────────────────────────────────────────────── */}
              {/* 6. SUPPORT TAB                                                    */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {activeTab === 'support' && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Help & Support</h1>
                    <p className="text-slate-500 text-sm mt-1">24/7 dedicated customer care and support center.</p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400">Toll Free Support</p>
                          <p className="font-extrabold text-slate-900 text-lg">1800-123-4567</p>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                          <Mail className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400">Email Support</p>
                          <p className="font-extrabold text-slate-900 text-lg">support@magicmistry.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ───────────────────────────────────────────────────────────────── */}
              {/* 7. USER SETTINGS TAB                                              */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage profile information, notifications, and security settings.</p>
                  </div>

                  {/* User Hero Card (Matching Vendor Hero Card) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Cover Banner */}
                    <div className="h-20 sm:h-28 bg-gradient-to-r from-[#061e38] via-[#0a2f57] to-[#061e38] relative">
                      <div className="absolute bottom-0 right-0 opacity-10">
                        <User className="w-32 h-32 text-white rotate-12 translate-x-4 translate-y-4" />
                      </div>
                    </div>

                    <div className="px-4 sm:px-6 pb-5">
                      {/* Avatar + Edit Button Row */}
                      <div className="flex items-end justify-between -mt-8 mb-4 relative z-10">
                        <div className="flex items-end gap-3">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center ring-4 ring-white shadow-lg">
                            {getInitials()}
                          </div>
                        </div>

                        {!isEditingProfile ? (
                          <button
                            onClick={() => setIsEditingProfile(true)}
                            className="px-3 sm:px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                          >
                            <span>✎</span> Edit Profile
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsEditingProfile(false)}
                              disabled={isSavingProfile}
                              className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveProfile}
                              disabled={isSavingProfile}
                              className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              {isSavingProfile ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>{isSavingProfile ? 'Saving...' : 'Save'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Name & Title & Location Tag */}
                      <div className="mb-4">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">{fullName || 'Magic Mistry Customer'}</h2>
                        <p className="text-sm text-slate-500 font-medium">{email || 'customer@magicmistry.com'}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={handleOpenEditDefaultAddress}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Click to add or change address"
                          >
                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                            <span>{activeBackendAddress || 'Set Your Location'}</span>
                            <span className="text-[10px] text-orange-600 font-extrabold bg-orange-100 px-1.5 py-0.5 rounded ml-0.5">
                              {activeBackendAddress ? 'Change' : 'Set'}
                            </span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-bold text-slate-600">Customer ID: USR-{String(user?._id || '101').slice(-4).toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Stats Row (Matching Vendor Profile) */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-3 text-center">
                          <p className="text-sm sm:text-xl font-extrabold text-slate-900">{bookingsList.length}</p>
                          <p className="text-[9px] sm:text-xs text-slate-500 font-semibold mt-0.5">Total Bookings</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-3 text-center">
                          <p className="text-sm sm:text-xl font-extrabold text-slate-900">
                            {bookingsList.filter(b => b.status === 'In Progress' || b.status === 'Confirmed' || b.status === 'Pending').length}
                          </p>
                          <p className="text-[9px] sm:text-xs text-slate-500 font-semibold mt-0.5">Active Repairs</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-3 text-center">
                          <p className="text-sm sm:text-xl font-extrabold text-slate-900">{addresses.length}</p>
                          <p className="text-[9px] sm:text-xs text-slate-500 font-semibold mt-0.5">Saved Addresses</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details & Location Card (Exact match to Vendor Credentials & Banking Card) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-600" />
                        Account &amp; Location Details
                      </h3>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Customer
                      </span>
                    </div>

                    {!isEditingProfile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                        {[
                          { label: 'Full Name', value: fullName || 'User' },
                          { label: 'Phone Number', value: phone || 'Not provided' },
                          { label: 'Email Address', value: email || 'user@example.com' },
                          { label: 'Account Role', value: 'Customer (Verified)' },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 sm:p-3">
                            <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{label}</p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 break-words">{value}</p>
                          </div>
                        ))}

                        {/* Location Card with direct Popup trigger in View Mode */}
                        <div className="sm:col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              Service / Primary Location
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5 break-words">
                              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                              {activeBackendAddress || 'Set Your Location'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddress(null);
                              setIsAddressModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-orange-400" />
                            <span>Manage Address</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Account Role
                          </label>
                          <input
                            type="text"
                            disabled
                            value="Customer (Verified)"
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-500 cursor-not-allowed"
                          />
                        </div>

                        {/* ── EXACT LOCATION INPUT FIELD WITH MODAL TRIGGER ── */}
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Service / Primary Location <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              value={location}
                              onChange={(e) => updateLocation(e.target.value)}
                              placeholder="e.g. Salt Lake, Kolkata, West Bengal"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-36 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAddress(null);
                                setIsAddressModalOpen(true);
                              }}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5 text-orange-400" />
                              <span>Address Modal</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                            <LocateFixed className="w-3 h-3 text-orange-500 inline" />
                            Type address or click <strong>"Address Modal"</strong> to enter full structured address with GPS detection.
                          </p>
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            disabled={isSavingProfile}
                            className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSavingProfile ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>{isSavingProfile ? 'Saving Changes...' : 'Save Changes'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notification Switches Card */}
                  {/* <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-4">
                      <Bell className="w-5 h-5 text-amber-500" /> Notification Preferences
                    </h3>

                    <div className="divide-y divide-slate-100">
                      {[
                        { label: 'Push Notifications', desc: 'Get live technician tracking & booking alerts', val: pushNotifs, set: setPushNotifs },
                        { label: 'WhatsApp Alerts', desc: 'Receive instant booking receipts & technician details on WhatsApp', val: whatsappNotifs, set: setWhatsappNotifs },
                        { label: 'Email Newsletters', desc: 'Promotional offers, seasonal service discounts & maintenance tips', val: emailNotifs, set: setEmailNotifs },
                      ].map((item) => (
                        <div key={item.label} className="py-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => item.set(!item.val)}
                            className={`transition-colors duration-200 focus:outline-none ${item.val ? 'text-orange-500' : 'text-slate-300'}`}
                          >
                            {item.val ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div> */}
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── USER DASHBOARD MODALS ────────────────────────────────────────────── */}
      {/* UserTechnicianMapModal — shows live technician GPS tracker to the user */}
      <UserTechnicianMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        technician={selectedTech}
        booking={selectedBookingForMap}
      />

      {/* UserInvoiceModal — shows printable tax invoice for a completed booking */}
      <UserInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        booking={selectedBookingForInvoice}
      />

      {/* UserAddressModal — add / edit a saved address for the logged-in user */}
      <UserAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />

      {/* UserRatingModal — lets the user rate a completed booking */}
      <UserRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        booking={selectedBookingForRating}
        onSubmitRating={handleSubmitRating}
      />

      {/* ── FLOATING TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
