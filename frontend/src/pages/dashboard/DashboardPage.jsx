import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Wrench, Heart, Settings, LogOut, Bell,
  Star, CheckCircle2, Clock, AlertCircle, ChevronRight,
  Phone, Mail, MapPin, Calendar, Award, TrendingUp,
  Zap, Shield, User, Edit3, ToggleLeft, ToggleRight,
  Package, ArrowRight
} from 'lucide-react';

// ─── Dummy Data ───────────────────────────────────────────────
const dummyBookings = [
  {
    id: 'BK-2024-001',
    service: 'AC Service & Deep Clean',
    technician: 'Ramesh Kumar',
    date: 'July 20, 2026',
    time: '10:00 AM',
    status: 'completed',
    price: '₹799',
    rating: 5,
  },
  {
    id: 'BK-2024-002',
    service: 'Washing Machine Repair',
    technician: 'Suresh Patel',
    date: 'July 26, 2026',
    time: '2:30 PM',
    status: 'upcoming',
    price: '₹499',
    rating: null,
  },
  {
    id: 'BK-2024-003',
    service: 'Refrigerator Gas Refill',
    technician: 'Ajay Singh',
    date: 'July 15, 2026',
    time: '11:00 AM',
    status: 'cancelled',
    price: '₹650',
    rating: null,
  },
];

const savedServices = [
  { id: 1, name: 'AC Installation', icon: '❄️', price: 'From ₹1,299', rating: 4.8, reviews: 2341 },
  { id: 2, name: 'Fridge Repair', icon: '🧊', price: 'From ₹399', rating: 4.7, reviews: 1892 },
  { id: 3, name: 'Microwave Fix', icon: '📡', price: 'From ₹299', rating: 4.9, reviews: 987 },
];

const stats = [
  { label: 'Bookings', value: '3', icon: Package, color: 'from-blue-500 to-blue-600' },
  { label: 'Loyalty Points', value: '240', icon: Award, color: 'from-amber-500 to-orange-500' },
  { label: 'Services Used', value: '5', icon: Wrench, color: 'from-violet-500 to-purple-600' },
  { label: 'Saved Services', value: '3', icon: Heart, color: 'from-rose-500 to-pink-500' },
];

// ─── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    upcoming:  { label: 'Upcoming',  icon: Clock,         className: 'bg-blue-50 text-blue-700 border-blue-200' },
    cancelled: { label: 'Cancelled', icon: AlertCircle,   className: 'bg-red-50 text-red-600 border-red-200' },
  };
  const { label, icon: Icon, className } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
};

// ─── Animation Variants ────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const sidebarItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

// ─── Sidebar Nav ───────────────────────────────────────────────
const navItems = [
  { id: 'overview',  label: 'Overview',        icon: LayoutDashboard },
  { id: 'bookings',  label: 'My Bookings',     icon: Package },
  { id: 'saved',     label: 'Saved Services',  icon: Heart },
  { id: 'settings',  label: 'Settings',        icon: Settings },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const getInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">

      {/* ── Hero Welcome Banner ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#0a192f] via-[#0d2240] to-[#1a3a5c] text-white px-4 sm:px-8 py-8"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-4 ring-white/10"
            >
              {getInitials()}
            </motion.div>
            <div>
              <p className="text-blue-300 text-sm font-medium">Welcome back 👋</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.fullName || 'User'}
              </h1>
              <p className="text-blue-200/70 text-xs mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" /> {user?.email || ''}
              </p>
            </div>
          </div>
          {/* Quick stats strip */}
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-xs text-blue-300">Bookings</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">240</p>
              <p className="text-xs text-blue-300">Points</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">4.9</p>
              <p className="text-xs text-blue-300">Rating</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ──────────────────────────────────────── */}
          <motion.aside
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="lg:w-64 shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Profile mini */}
              <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold shadow">
                    {getInitials()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav Items */}
              <nav className="p-3 space-y-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    custom={i}
                    variants={sidebarItemVariants}
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ x: 3 }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {activeTab === item.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Logout */}
              <div className="p-3 border-t border-gray-100">
                <motion.button
                  whileHover={{ x: 3 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </div>
            </div>

            {/* Loyalty Card */}
            <motion.div
              variants={cardVariants}
              className="mt-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5" />
                <span className="font-bold text-sm">Loyalty Points</span>
              </div>
              <p className="text-4xl font-extrabold">240</p>
              <p className="text-amber-100 text-xs mt-1">60 pts away from Gold tier</p>
              <div className="mt-3 bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '80%' }} />
              </div>
            </motion.div>
          </motion.aside>

          {/* ── Main Content ──────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* ─ Overview Tab ─ */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Stats Grid */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
                  >
                    {stats.map((stat) => (
                      <motion.div
                        key={stat.label}
                        variants={cardVariants}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-default"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-extrabold text-gray-800">{stat.value}</p>
                        <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Recent Bookings Preview */}
                  <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" /> Recent Bookings
                      </h2>
                      <button onClick={() => setActiveTab('bookings')} className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {dummyBookings.slice(0, 2).map((b, i) => (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🔧</div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{b.service}</p>
                              <p className="text-xs text-gray-400">{b.date} · {b.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-700 text-sm">{b.price}</span>
                            <StatusBadge status={b.status} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Notification Banner */}
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">New AC Service Offer!</p>
                        <p className="text-blue-100 text-xs">Get 20% off on your next AC service booking</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/booking')}
                      className="shrink-0 px-4 py-2 bg-white text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      Book Now
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* ─ Bookings Tab ─ */}
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" /> My Bookings
                  </h2>
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {dummyBookings.map((b, i) => (
                      <motion.div
                        key={b.id}
                        variants={cardVariants}
                        custom={i}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">🔧</div>
                            <div>
                              <p className="font-bold text-gray-800">{b.service}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Technician: {b.technician}</p>
                            </div>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-2 text-sm">
                          <div className="flex items-center gap-4 text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{b.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.time}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-gray-800">{b.price}</span>
                            {b.status === 'completed' && b.rating && (
                              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />{b.rating}.0
                              </span>
                            )}
                            {b.status === 'upcoming' && (
                              <button className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg hover:bg-blue-100 transition-colors">
                                Reschedule
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Booking ID: {b.id}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* ─ Saved Services Tab ─ */}
              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" /> Saved Services
                  </h2>
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid sm:grid-cols-2 gap-4">
                    {savedServices.map((svc, i) => (
                      <motion.div
                        key={svc.id}
                        variants={cardVariants}
                        custom={i}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">
                            {svc.icon}
                          </div>
                          <button className="text-rose-400 hover:text-rose-600 transition-colors">
                            <Heart className="w-5 h-5 fill-rose-400" />
                          </button>
                        </div>
                        <h3 className="font-bold text-gray-800 mt-3">{svc.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-semibold text-gray-600">{svc.rating}</span>
                          <span className="text-xs text-gray-400">({svc.reviews.toLocaleString()} reviews)</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-blue-700">{svc.price}</span>
                          <button
                            onClick={() => navigate('/booking')}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            Book Now
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* ─ Settings Tab ─ */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" /> Settings
                  </h2>

                  {/* Profile Info Card */}
                  <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2"><User className="w-4 h-4 text-blue-500" />Profile Information</h3>
                      <button className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="p-6 grid sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name', value: user?.fullName || '—', icon: User },
                        { label: 'Email Address', value: user?.email || '—', icon: Mail },
                        { label: 'Phone Number', value: user?.phoneNumber || '+91 98765 43210', icon: Phone },
                        { label: 'Location', value: 'Bangalore, India', icon: MapPin },
                      ].map((field) => (
                        <div key={field.label} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mt-0.5">
                            <field.icon className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium">{field.label}</p>
                            <p className="text-sm font-semibold text-gray-800">{field.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Notification Toggles */}
                  <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" />Notification Preferences</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {[
                        { label: 'Push Notifications', desc: 'Get booking updates and reminders', value: notifications, setter: setNotifications },
                        { label: 'Location Access', desc: 'Allow location for nearby services', value: locationAccess, setter: setLocationAccess },
                        { label: 'Email Updates', desc: 'Receive offers and news via email', value: emailUpdates, setter: setEmailUpdates },
                      ].map((toggle) => (
                        <div key={toggle.label} className="flex items-center justify-between px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">{toggle.label}</p>
                            <p className="text-xs text-gray-400">{toggle.desc}</p>
                          </div>
                          <button
                            onClick={() => toggle.setter(v => !v)}
                            className={`transition-colors duration-200 ${toggle.value ? 'text-blue-600' : 'text-gray-300'}`}
                          >
                            {toggle.value
                              ? <ToggleRight className="w-9 h-9" />
                              : <ToggleLeft className="w-9 h-9" />
                            }
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Security */}
                  <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" />Security</h3>
                    </div>
                    <div className="p-6 flex flex-col sm:flex-row gap-3">
                      <button className="flex-1 py-2.5 px-4 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                        Change Password
                      </button>
                      <button className="flex-1 py-2.5 px-4 border border-red-200 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
