import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
} from '../../services/operations/addressAPI';
import { getMyBookingsApi, cancelBookingApi } from '../../services/operations/bookingAPI';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  LayoutDashboard,
  Wrench,
  Clock,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  User,
  CreditCard,
  Navigation,
  Plus,
  MessageSquare,
  Check,
  Home,
  Briefcase,
  Tag,
  Trash2,
  HelpCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Receipt,
  Zap,
  LogOut,
} from 'lucide-react';
import { TbBrandWhatsapp } from 'react-icons/tb';

// ── Modals & Shared UI Components ─────────────────────────────────────
import UserTechnicianMapModal from '../../components/dashboard/user/UserTechnicianMapModal';
import UserInvoiceModal from '../../components/dashboard/user/UserInvoiceModal';
import UserAddressModal from '../../components/dashboard/user/UserAddressModal';
import UserRatingModal from '../../components/dashboard/user/UserRatingModal';
import ChatModal from '../../components/common/ChatModal';
import ApplianceIcon from '../../components/common/ApplianceIcon';
import { parseAddressString, formatCleanAddress } from '../../utils/addressParser';
import { getLiveBasePriceForAppliance } from '../../services/pricingService';
import { getInvoiceForBooking, normalizeInvoiceForUI } from '../../services/invoiceService';

// ── Status Badge Component ───────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const norm = String(status || '').toLowerCase().trim();

  if (norm === 'in progress' || norm === 'on the way') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {status}
      </span>
    );
  }
  if (norm === 'accepted' || norm === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 border border-blue-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        {status}
      </span>
    );
  }
  if (norm === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Completed
      </span>
    );
  }
  if (norm === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">
        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
      {status || 'Pending'}
    </span>
  );
};

// ── Helper: Map Backend Address List to UI Format ─────────────────────
const mapAddresses = (list) =>
  (Array.isArray(list) ? list : []).map((a) => {
    const parsed = parseAddressString(a);
    const cleanFlat = (parsed.flat || '').trim();
    const isRealFlat = cleanFlat && !cleanFlat.includes(',') && cleanFlat.length <= 25;
    return {
      id: a._id || a.id,
      _id: a._id || a.id,
      type: a.addressType || a.type || 'Home',
      addressType: a.addressType || a.type || 'Home',
      flat: isRealFlat ? cleanFlat : '',
      house: isRealFlat ? cleanFlat : '',
      addressLine1: parsed.street || a.street || '',
      street: parsed.street || a.street || '',
      landmark: parsed.landmark || a.landmark || '',
      city: parsed.city || a.city || '',
      state: parsed.state || a.state || '',
      country: a.country || 'India',
      pincode: parsed.pincode === '000000' ? '' : parsed.pincode || a.pincode || '',
      isDefault: !!a.isDefault,
      location: a.location,
      latitude: a.location?.coordinates?.[1] ?? a.latitude ?? null,
      longitude: a.location?.coordinates?.[0] ?? a.longitude ?? null,
    };
  });

export default function UserDashboardPage() {
  const { user, token, logout, location, updateLocation, updateProfile, loading } = useAuth();
  const { playNotificationSound } = useSocket();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Role guard: redirect admin or vendors to their dedicated dashboards
  useEffect(() => {
    if (loading) return;
    const isAdminEmail =
      user?.email && user.email.toLowerCase().trim() === 'magicmistry187@gmail.com';
    if (user?.role === 'admin' || isAdminEmail) {
      navigate('/admin-dashboard', { replace: true });
    } else if (user?.role === 'vendor' || !!user?.vendorId) {
      navigate('/vendor-dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Main State
  const [bookingsList, setBookingsList] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Active Tab: 'overview' | 'bookings' | 'history' | 'payments' | 'addresses' | 'support' | 'settings'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'overview';
  });

  // Sync tab with URL query or router state
  useEffect(() => {
    const targetTab =
      routerLocation.state?.tab || new URLSearchParams(routerLocation.search).get('tab');
    if (targetTab) {
      setActiveTab(targetTab);
    }
  }, [routerLocation]);

  // Modals State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedBookingForMap, setSelectedBookingForMap] = useState(null);

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);

  // Filter state for Bookings
  const [bookingsFilter, setBookingsFilter] = useState('All');

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  // Format single booking helper
  const formatUserBooking = useCallback(
    (b) => {
      const inv = getInvoiceForBooking(b._id || b.id, b);
      const normalizedInv = inv ? normalizeInvoiceForUI(inv, b) : null;
      const realPriceNum =
        normalizedInv?.total ??
        (Number(b.serviceCharge) > 0
          ? Number(b.serviceCharge)
          : b.serviceCategoryCharge ??
            getLiveBasePriceForAppliance(b.serviceCategory || b.appliance, 299));

      return {
        id: b._id || 'BK-' + Date.now().toString().slice(-6),
        service: b.serviceCategory || b.appliance || 'Appliance Service',
        applianceIcon: '🔧',
        technician: b.vendor?.fullName || 'Verification Pending',
        techRating: '4.9',
        techJobs: '100+',
        techAvatar: 'MM',
        date: b.serviceDate
          ? new Date(b.serviceDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '—',
        time: b.timeSlot || 'Scheduled Slot',
        status: b.bookingStatus || 'Pending',
        price: `₹${realPriceNum}`,
        realPrice: realPriceNum,
        invoice: normalizedInv,
        invoiceId: normalizedInv?.invoiceId,
        customerName: user?.fullName || 'Customer',
        address: b.address,
        image: b.image,
        rawBooking: {
          ...b,
          invoice: normalizedInv,
          serviceCharge: realPriceNum,
        },
      };
    },
    [user?.fullName]
  );

  // Load initial backend bookings and addresses
  useEffect(() => {
    async function loadData() {
      if (!token) {
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      try {
        const [resBookings, resAddrs] = await Promise.all([
          getMyBookingsApi(token),
          getAddressesApi(token),
        ]);

        if (resBookings.success && Array.isArray(resBookings.bookings)) {
          const formatted = resBookings.bookings.map(formatUserBooking);
          setBookingsList(formatted);
        } else {
          setBookingsList([]);
        }

        if (resAddrs.success && Array.isArray(resAddrs.addresses)) {
          setAddresses(mapAddresses(resAddrs.addresses));
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error('[UserDashboard] Error loading data:', err);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [token, formatUserBooking]);

  // Sync profile fields on user change
  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.email) setEmail(user.email);
      if (user.phoneNumber) setPhone(user.phoneNumber);
    }
  }, [user]);

  // Real-time socket events
  useSocketEvent('booking:status_changed', (updatedBooking) => {
    if (!updatedBooking) return;
    const bId = String(updatedBooking._id || updatedBooking.id);
    const formatted = formatUserBooking(updatedBooking);

    setBookingsList((prev) => {
      const idx = prev.findIndex(
        (b) => String(b.id) === bId || String(b.rawBooking?._id) === bId
      );
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = formatted;
        return next;
      }
      return [formatted, ...prev];
    });

    if (playNotificationSound) playNotificationSound();
    showToast(`Status updated to "${updatedBooking.bookingStatus}"`);

    if (updatedBooking.bookingStatus === 'Completed') {
      setSelectedBookingForInvoice(formatted);
      setSelectedBookingForRating(formatted);
      setIsInvoiceOpen(true);
    }
  });

  useSocketEvent('invoice:generated', (invoice) => {
    if (!invoice) return;
    if (playNotificationSound) playNotificationSound();
    showToast(`Invoice #${invoice.invoiceNumber || ''} generated for your completed service!`);
  });

  useSocketEvent('booking:cancelled', (cancelledBooking) => {
    if (!cancelledBooking) return;
    const bId = String(cancelledBooking._id || cancelledBooking.id);

    setBookingsList((prev) =>
      prev.map((b) => {
        if (String(b.id) === bId || String(b.rawBooking?._id) === bId) {
          return {
            ...b,
            status: 'Cancelled',
            rawBooking: { ...b.rawBooking, bookingStatus: 'Cancelled' },
          };
        }
        return b;
      })
    );

    showToast('Booking has been cancelled.');
  });

  // Active address string
  const activeBackendAddress = useMemo(() => {
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
    const defaultAddr =
      Array.isArray(addresses) && addresses.length > 0
        ? addresses.find((a) => a.isDefault) || addresses[0]
        : activeBackendAddress || (user?.location && user.location !== 'Set Your Location' ? user.location : null);

    setEditingAddress(defaultAddr || null);
    setIsAddressModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!fullName || !fullName.trim()) {
      showToast('Full name is required');
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
    if (!name) return 'MM';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenMap = (booking) => {
    setSelectedBookingForMap(booking);
    setSelectedTech({
      name: booking.technician || 'Assigned Specialist',
      rating: booking.techRating || '4.9',
      jobs: booking.techJobs || '100+',
      phone: '+919830012345',
    });
    setIsMapOpen(true);
  };

  const handleOpenInvoice = (booking) => {
    const rawId = booking.id || booking._id || booking.rawBooking?._id;
    const inv = booking.invoice || getInvoiceForBooking(rawId, booking);
    const normalized = normalizeInvoiceForUI(inv, booking);
    setSelectedBookingForInvoice({
      ...booking,
      invoice: normalized,
      rawBooking: {
        ...(booking.rawBooking || booking),
        invoice: normalized,
      },
    });
    setIsInvoiceOpen(true);
  };

  const handleSaveAddress = async (addressObj) => {
    const makeDefault =
      addressObj.isDefault !== undefined
        ? !!addressObj.isDefault
        : addresses.length === 0 && !editingAddress;

    const cleanFlat = (addressObj.flat || addressObj.house || '').trim();
    const isRealFlat = cleanFlat && !cleanFlat.includes(',') && cleanFlat.length <= 25;

    const payload = {
      addressType: addressObj.type || addressObj.addressType || 'Home',
      house: isRealFlat ? cleanFlat : '',
      addressLine1: addressObj.street || cleanFlat || 'Home',
      street: addressObj.street || 'Area',
      landmark: addressObj.landmark || '',
      city: addressObj.city || '',
      state: addressObj.state || '',
      pincode: addressObj.pincode === '000000' ? '' : addressObj.pincode || '',
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

    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('mm_token') || localStorage.getItem('token')
        : null);

    if (authToken) {
      try {
        let result;
        if (editingAddress && (editingAddress.id || editingAddress._id)) {
          result = await updateAddressApi(
            editingAddress.id || editingAddress._id,
            payload,
            authToken
          );
        } else {
          result = await createAddressApi(payload, authToken);
        }

        if (!result?.success) {
          showToast(result?.message || 'Failed to save address. Please try again.');
          return;
        }

        showToast(editingAddress ? 'Address updated!' : 'New address added!');

        const resAddrs = await getAddressesApi(authToken);
        if (resAddrs.success && Array.isArray(resAddrs.addresses)) {
          const mapped = mapAddresses(resAddrs.addresses);
          setAddresses(mapped);
          const def = mapped.find((a) => a.isDefault) || (makeDefault ? mapped[0] : null);
          if (def) {
            const defStr = formatCleanAddress(def);
            updateLocation(
              defStr,
              def.latitude && def.longitude ? { lat: def.latitude, lng: def.longitude } : null
            );
          }
        }
      } catch (err) {
        showToast(err?.response?.data?.message || err?.message || 'Failed to save address.');
      } finally {
        setEditingAddress(null);
      }
    }
  };

  const handleSetDefault = async (addrId) => {
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('mm_token') || localStorage.getItem('token')
        : null);

    if (authToken) {
      await updateAddressApi(addrId, { isDefault: true }, authToken);
      const resAddrs = await getAddressesApi(authToken);
      if (resAddrs.success && Array.isArray(resAddrs.addresses)) {
        const mapped = mapAddresses(resAddrs.addresses);
        setAddresses(mapped);
        const def = mapped.find((a) => a.isDefault);
        if (def) {
          const defStr = formatCleanAddress(def);
          updateLocation(
            defStr,
            def.latitude && def.longitude ? { lat: def.latitude, lng: def.longitude } : null
          );
        }
      }
      showToast('Default address updated!');
    }
  };

  const handleDeleteAddress = async (id) => {
    const targetId = id || '';
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('mm_token') || localStorage.getItem('token')
        : null);

    setAddresses((prev) => prev.filter((a) => a.id !== targetId && a._id !== targetId));

    if (authToken && targetId) {
      try {
        const res = await deleteAddressApi(targetId, authToken);
        if (res.success) {
          showToast('Address removed.');
          const resAddrs = await getAddressesApi(authToken);
          if (resAddrs.success && Array.isArray(resAddrs.addresses)) {
            const mapped = mapAddresses(resAddrs.addresses);
            setAddresses(mapped);
            if (mapped.length > 0) {
              const newDef = mapped.find((a) => a.isDefault) || mapped[0];
              updateLocation(formatCleanAddress(newDef));
            } else {
              updateLocation('');
            }
          }
        }
      } catch {
        showToast('Address deleted.');
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!token || !bookingId) return;
    try {
      const res = await cancelBookingApi(bookingId, token);
      if (res?.success) {
        setBookingsList((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
        );
        showToast('Booking cancelled.');
      } else {
        showToast(res?.message || 'Could not cancel booking.');
      }
    } catch {
      showToast('Error cancelling booking.');
    }
  };

  const handleSubmitRating = ({ bookingId, rating, review }) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ratingSubmitted: rating, review } : b))
    );
  };

  // Nav items definition
  const NAV_TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: Wrench,
      badge: bookingsList.filter(
        (b) => b.status === 'In Progress' || b.status === 'Accepted' || b.status === 'Pending'
      ).length,
    },
    { id: 'history', label: 'Service History', icon: Clock },
    { id: 'payments', label: 'Billing & Invoices', icon: Receipt },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: addresses.length },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
    { id: 'settings', label: 'Account Profile', icon: User },
  ];

  // Active Ongoing Booking for Hero Tracker
  const activeOngoingBooking = useMemo(() => {
    return bookingsList.find(
      (b) =>
        b.status === 'In Progress' ||
        b.status === 'Accepted' ||
        b.status === 'Pending' ||
        b.status === 'On The Way'
    );
  }, [bookingsList]);

  // Total Completed Repairs count
  const completedCount = useMemo(() => {
    return bookingsList.filter((b) => b.status === 'Completed').length;
  }, [bookingsList]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        
        {/* ── TOP HERO HEADER BANNER ── */}
        <section className="mb-6 lg:mb-8" aria-label="Customer Overview">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#0B1E40] via-[#0E244D] to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-slate-700/60">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left: User Welcome */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20 shrink-0">
                  {getInitials()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                      Welcome, {user?.fullName || 'Customer'}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
                    <span>{user?.email || 'customer@magicmistry.com'}</span>
                    <span className="text-slate-500">•</span>
                    <span>Customer ID: MM-{String(user?._id || '101').slice(-4).toUpperCase()}</span>
                  </p>
                </div>
              </div>

              {/* Right: Quick Location & Primary CTA */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenEditDefaultAddress}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer backdrop-blur-sm"
                  title="Click to set or change your service address"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="max-w-[170px] sm:max-w-[220px] truncate">
                    {activeBackendAddress || 'Set Service Address'}
                  </span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold uppercase text-white">
                    {activeBackendAddress ? 'Edit' : 'Add'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Service</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── MOBILE / TABLET HORIZONTAL TAB RAIL (< lg) ── */}
        <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max pb-1">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DESKTOP TWO-COLUMN WORKSPACE (>= lg) ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ── DESKTOP SIDEBAR NAVIGATION (lg:w-64) ── */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-1">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Customer Portal
              </p>

              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer group ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{tab.label}</span>
                    </div>

                    {tab.badge > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                        {tab.badge}
                      </span>
                    ) : tab.count !== undefined ? (
                      <span
                        className={`text-[10px] font-semibold ${
                          isActive ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Helpline Box */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-4 text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-bold mb-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Express Helpdesk</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Need urgent breakdown assistance? Speak with our live dispatch supervisor.
              </p>
              <a
                href="tel:+919830012345"
                className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
              >
                <span>+91 98300 12345</span>
              </a>
            </div>
          </aside>

          {/* ── MAIN TAB WORKSPACE AREA ── */}
          <div className="flex-1 min-w-0 w-full">
            {isLoadingData ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Syncing your repairs & dashboard...</p>
              </div>
            ) : (
            <AnimatePresence mode="wait">
              
              {/* ───────────────────────────────────────────────────────────── */}
              {/* TAB 1: OVERVIEW                                               */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* KPI Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Total Orders
                        </p>
                        <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                          {bookingsList.length}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Active Repairs
                        </p>
                        <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                          {
                            bookingsList.filter(
                              (b) =>
                                b.status === 'In Progress' ||
                                b.status === 'Accepted' ||
                                b.status === 'Pending'
                            ).length
                          }
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Completed
                        </p>
                        <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                          {completedCount}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Rework Warranty
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-600">
                          30-Day Covered
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE LIVE SERVICE TRACKER (Hero Card) */}
                  {activeOngoingBooking ? (
                    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                          </span>
                          <h2 className="text-base font-extrabold text-slate-900">
                            Active Service Tracker
                          </h2>
                          <StatusBadge status={activeOngoingBooking.status} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          Order ID: #{activeOngoingBooking.id}
                        </span>
                      </div>

                      {/* Appliance & Assigned Tech */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="flex items-start gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shrink-0">
                            <ApplianceIcon
                              name={activeOngoingBooking.service}
                              className="w-10 h-10"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-extrabold text-slate-900">
                              {activeOngoingBooking.service}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              📅 {activeOngoingBooking.date} • ⏰ {activeOngoingBooking.time}
                            </p>
                            <p className="text-xs text-slate-600 font-bold mt-1">
                              Estimated Total: {activeOngoingBooking.price}
                            </p>
                          </div>
                        </div>

                        {/* Tech profile and action buttons */}
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                            <p className="text-[10px] uppercase font-bold text-slate-400">
                              Assigned Expert
                            </p>
                            <p className="font-bold text-slate-900">
                              {activeOngoingBooking.technician}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenMap(activeOngoingBooking)}
                            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Navigation className="w-3.5 h-3.5 text-amber-400" />
                            <span>Track Map</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingForChat(activeOngoingBooking);
                              setIsChatOpen(true);
                            }}
                            className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span>Chat</span>
                          </button>

                          {activeOngoingBooking.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this booking?')) {
                                  handleCancelBooking(activeOngoingBooking.id);
                                }
                              }}
                              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 4-Step Visual Progress Stepper */}
                      <div className="pt-2">
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          {[
                            { label: 'Booking Placed', done: true },
                            {
                              label: 'Tech Assigned',
                              done: ['Accepted', 'In Progress', 'Completed'].includes(
                                activeOngoingBooking.status
                              ),
                            },
                            {
                              label: 'In Diagnosis',
                              done: ['In Progress', 'Completed'].includes(
                                activeOngoingBooking.status
                              ),
                            },
                            {
                              label: 'Repaired & Verified',
                              done: activeOngoingBooking.status === 'Completed',
                            },
                          ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 ${
                                  step.done
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {step.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[11px] leading-tight ${
                                  step.done ? 'font-bold text-slate-900' : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* All Systems Operational state */
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                            All Home Appliances Operating Normally
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                            No ongoing repair orders. Book certified doorstep care with zero advance
                            charge whenever you need maintenance.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/booking')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Schedule Service</span>
                      </button>
                    </div>
                  )}

                  {/* RECENT REPAIRS TABLE */}
                  <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Recent Service Activity</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Your latest booked repairs and maintenance logs</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('bookings')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View all bookings</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                            <th className="py-3 px-3 rounded-l-xl">Service</th>
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3">Total</th>
                            <th className="py-3 px-3 text-right rounded-r-xl">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {bookingsList.length > 0 ? (
                            bookingsList.slice(0, 4).map((booking) => (
                              <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                                      <ApplianceIcon name={booking.service} className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 truncate">
                                        {booking.service}
                                      </p>
                                      <p className="text-[10px] text-slate-400">#{booking.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-3 text-slate-600">{booking.date}</td>
                                <td className="py-3.5 px-3">
                                  <StatusBadge status={booking.status} />
                                </td>
                                <td className="py-3.5 px-3 font-bold text-slate-900">{booking.price}</td>
                                <td className="py-3.5 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {booking.status === 'Completed' && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenInvoice(booking)}
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                        title="Download Tax Invoice"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {['Pending', 'Accepted', 'In Progress'].includes(booking.status) && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenMap(booking)}
                                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition-colors"
                                      >
                                        Track
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                                No service bookings yet. Click "Book Service" to get started.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* TAB 2: MY BOOKINGS                                            */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        My Bookings
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Track live status, communicate with technicians, and manage your visits.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/booking')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Booking</span>
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'].map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setBookingsFilter(status)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            bookingsFilter === status
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>

                  {/* Bookings Card List */}
                  <div className="space-y-4">
                    {bookingsList
                      .filter((b) => bookingsFilter === 'All' || b.status === bookingsFilter)
                      .length === 0 ? (
                      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
                        <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <h3 className="font-extrabold text-slate-800 text-sm">No bookings found</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          No repair bookings match the "{bookingsFilter}" filter.
                        </p>
                      </div>
                    ) : (
                      bookingsList
                        .filter((b) => bookingsFilter === 'All' || b.status === bookingsFilter)
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shrink-0">
                                  <ApplianceIcon name={booking.service} className="w-8 h-8" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-extrabold text-slate-900 text-base">
                                      {booking.service}
                                    </h3>
                                    <StatusBadge status={booking.status} />
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                    ID: #{booking.id}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      {booking.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      {booking.time}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <User className="w-3.5 h-3.5 text-slate-400" />
                                      {booking.technician}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                <span className="text-lg font-extrabold text-slate-900">
                                  {booking.price}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {['Pending', 'Accepted', 'In Progress', 'On The Way'].includes(
                                    booking.status
                                  ) && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenMap(booking)}
                                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        Track
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedBookingForChat(booking);
                                          setIsChatOpen(true);
                                        }}
                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        Chat
                                      </button>
                                      {booking.status === 'Pending' && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (window.confirm('Are you sure you want to cancel this booking?')) {
                                              handleCancelBooking(booking.id);
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                    </>
                                  )}

                                  {booking.status === 'Completed' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenInvoice(booking)}
                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        Invoice
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedBookingForRating(booking);
                                          setIsRatingModalOpen(true);
                                        }}
                                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                                        title="Rate this Service"
                                      >
                                        <Star className="w-4 h-4 fill-amber-400" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* TAB 3: SERVICE HISTORY                                        */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Service & Repair History
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Full permanent archive of your past doorstep visits, invoices, and completed jobs.
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                            <th className="py-3 px-4 rounded-l-xl">Order ID</th>
                            <th className="py-3 px-4">Service</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Technician</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4 text-center rounded-r-xl">Invoice / Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {bookingsList.map((booking) => (
                            <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-4 px-4 font-bold text-slate-800">#{booking.id}</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <ApplianceIcon name={booking.service} className="w-5 h-5 shrink-0" />
                                  <span className="font-bold text-slate-900">{booking.service}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-500">{booking.date}</td>
                              <td className="py-4 px-4 text-slate-600">{booking.technician}</td>
                              <td className="py-4 px-4 font-bold text-slate-900">{booking.price}</td>
                              <td className="py-4 px-4 text-center">
                                {booking.status === 'Completed' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInvoice(booking)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Receipt</span>
                                  </button>
                                ) : (
                                  <StatusBadge status={booking.status} />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* TAB 4: BILLING & INVOICES                                     */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Billing & Invoices
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Transparent doorstep payment methods and downloadable GST tax invoices.
                    </p>
                  </div>

                  {/* Accepted Payment Protocols */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm">UPI QR Payment</h3>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 rounded">
                            Instant
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Pay directly to the technician on service completion via GPay, PhonePe,
                          Paytm, or BHIM. Zero surcharge.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            Cash / Cards on Delivery
                          </h3>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 rounded">
                            Post-Service
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Zero advance payment required. Settle cash or cards with your technician
                          after you test and verify the repaired appliance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Invoices List */}
                  <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900">Tax Invoices</h3>
                      <span className="text-xs font-semibold text-slate-400">
                        {bookingsList.filter((b) => b.status === 'Completed').length} Invoices Available
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                            <th className="py-3 px-4 rounded-l-xl">Invoice Ref</th>
                            <th className="py-3 px-4">Service</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Total Amount</th>
                            <th className="py-3 px-4 text-right rounded-r-xl">Download</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {bookingsList.filter((b) => b.status === 'Completed').length > 0 ? (
                            bookingsList
                              .filter((b) => b.status === 'Completed')
                              .map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-4 px-4 font-bold text-slate-900">
                                    INV-{String(b.id).slice(-6).toUpperCase()}
                                  </td>
                                  <td className="py-4 px-4">{b.service}</td>
                                  <td className="py-4 px-4 text-slate-500">{b.date}</td>
                                  <td className="py-4 px-4 font-extrabold text-slate-900">{b.price}</td>
                                  <td className="py-4 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenInvoice(b)}
                                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Tax Invoice</span>
                                    </button>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                                Completed service invoices will automatically appear here for 1-click download.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* TAB 5: SAVED ADDRESSES                                        */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Saved Service Locations
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage home, office, and family doorstep service addresses.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(null);
                        setIsAddressModalOpen(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Address</span>
                    </button>
                  </div>

                  {/* Primary Location Card */}
                  <div className="bg-[#0B1E40] text-white rounded-3xl p-6 shadow-sm border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            Primary Dispatch Location
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-base font-extrabold text-white mt-0.5">
                          {activeBackendAddress || 'No default address configured'}
                        </p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Technicians are dispatched automatically to this location.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenEditDefaultAddress}
                      className="px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      {activeBackendAddress ? 'Edit Primary' : 'Set Location'}
                    </button>
                  </div>

                  {/* Addresses Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.length === 0 ? (
                      <div className="col-span-2 bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
                        <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <h3 className="font-extrabold text-slate-800 text-sm">No saved addresses</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Add your home or office address to enable instant 1-tap bookings.
                        </p>
                      </div>
                    ) : (
                      addresses.map((addr) => {
                        const addrId = addr.id || addr._id;
                        return (
                          <div
                            key={addrId}
                            className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                              addr.isDefault
                                ? 'border-blue-500 ring-1 ring-blue-500/20'
                                : 'border-slate-200/80'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md flex items-center gap-1 uppercase">
                                    {addr.type === 'Home' ? (
                                      <Home className="w-3 h-3 text-blue-600" />
                                    ) : addr.type === 'Office' ? (
                                      <Briefcase className="w-3 h-3 text-amber-600" />
                                    ) : (
                                      <Tag className="w-3 h-3" />
                                    )}
                                    {addr.type}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAddress(addr);
                                      setIsAddressModalOpen(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                                    title="Edit"
                                  >
                                    <User className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAddress(addrId)}
                                    className="p-1 text-rose-400 hover:text-rose-600 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {addr.flat && (
                                <p className="font-extrabold text-slate-900 text-sm">{addr.flat}</p>
                              )}
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {addr.street}
                              </p>
                              {addr.landmark && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Near: {addr.landmark}
                                </p>
                              )}
                              <p className="text-xs font-semibold text-slate-700 mt-1">
                                {[addr.city, addr.state].filter(Boolean).join(', ')}{' '}
                                {addr.pincode && `• ${addr.pincode}`}
                              </p>
                            </div>

                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addrId)}
                                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* TAB 6: HELP & SUPPORT                                         */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeTab === 'support' && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Customer Help &amp; Support
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dedicated assistance for bookings, warranties, and technician feedback.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <a
                      href="tel:+919830012345"
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                          Helpline
                        </p>
                        <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                          +91 98300 12345
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">Mon - Sun: 8 AM - 9:30 PM</p>
                      </div>
                    </a>

                    <a
                      href="https://wa.me/919830012345"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <TbBrandWhatsapp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                          WhatsApp Desk
                        </p>
                        <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                          Chat with Support
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">Send photos &amp; error notes</p>
                      </div>
                    </a>

                    <a
                      href="mailto:magicmistry187@gmail.com"
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                          Email Support
                        </p>
                        <p className="font-extrabold text-slate-900 text-sm mt-0.5 truncate">
                          magicmistry187@gmail.com
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">Inquiries &amp; billing receipts</p>
                      </div>
                    </a>
                  </div>

                  {/* FAQ Reassurance */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base">Frequently Asked Questions</h3>
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="font-bold text-slate-900 mb-1">
                          How does the 30-Day Free Rework Warranty work?
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          If the exact same issue returns within 30 days of service completion,
                          we dispatch a technician with zero inspection and visit charge.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="font-bold text-slate-900 mb-1">
                          Do I need to pay any advance amount before the technician arrives?
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          No. Zero advance is required. Pay only after your appliance is diagnosed,
                          repaired, and tested in front of you.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* TAB 7: ACCOUNT PROFILE & SETTINGS                             */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Account Profile &amp; Settings
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage personal credentials, phone number, and service locations.
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                          {getInitials()}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">{fullName}</h3>
                          <p className="text-xs text-slate-400">{email}</p>
                        </div>
                      </div>

                      {!isEditingProfile ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {!isEditingProfile ? (
                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Full Name
                          </p>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">{fullName || '—'}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Registered Phone
                          </p>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">{phone || '—'}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Email Address
                          </p>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">{email || '—'}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Primary Address
                          </p>
                          <p className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                            {activeBackendAddress || 'Not configured'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveProfile();
                        }}
                        className="space-y-4"
                      >
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            disabled={isSavingProfile}
                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* ── MODALS (Fully Preserved) ── */}
      <UserTechnicianMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        technician={selectedTech}
        booking={selectedBookingForMap}
      />

      <UserInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        booking={selectedBookingForInvoice}
      />

      <UserAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />

      <UserRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        booking={selectedBookingForRating}
        onSubmitRating={handleSubmitRating}
      />

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setSelectedBookingForChat(null);
        }}
        bookingId={
          selectedBookingForChat?.id ||
          selectedBookingForChat?._id ||
          selectedBookingForChat?.rawBooking?._id
        }
        bookingTitle={selectedBookingForChat?.service || 'Service Booking'}
        otherPartyName={selectedBookingForChat?.technician || 'Technician'}
        otherPartyRole="Assigned Expert"
        recipientId={
          selectedBookingForChat?.rawBooking?.vendor?._id ||
          selectedBookingForChat?.rawBooking?.vendor
        }
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700"
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
