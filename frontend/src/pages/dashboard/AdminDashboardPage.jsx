import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  LayoutDashboard, Users, FileText, UserPlus, TrendingUp, Settings,
  Package, AlertTriangle, Truck, DollarSign, Search, ChevronDown,
  Edit3, Plus, Check, X, Shield, Lock, Clock, ShieldCheck, Mail,
  Copy, Download, Filter, RefreshCw, LogOut, ChevronRight, Eye,
  CheckCircle2, AlertCircle, Wrench, IndianRupee, ArrowUpRight,
  FileCheck, UserCheck, UserX, ExternalLink, Briefcase, MapPin, Phone, User,
  Snowflake, Droplets, Store, Star, BadgeCheck, BadgeIcon, Contact
} from 'lucide-react';

// ─── Initial Inventory Data (Exact match to Reference Screenshots) ───────────
const INITIAL_INVENTORY = [
  {
    id: '#INV-0842',
    name: 'AC Compressor (2 Ton)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 45,
    unitPrice: 185.00,
    lastUpdated: 'Today, 10:23 AM',
    sku: 'ACC-2T-X9',
    reorderPoint: 20,
    supplier: 'Select Supplier...'
  },
  {
    id: '#INV-0915',
    name: 'Refrigerator Thermostat',
    category: 'Appliance',
    stockLevel: 'Low Stock',
    stockCount: 4,
    unitPrice: 24.50,
    lastUpdated: 'Yesterday, 14:05',
    sku: 'REF-TH-04',
    reorderPoint: 10,
    supplier: 'LG Electronics'
  },
  {
    id: '#INV-1022',
    name: '15A Single Pole Switch',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 120,
    unitPrice: 3.20,
    lastUpdated: 'Oct 24, 2023',
    sku: 'ELE-SW-15A',
    reorderPoint: 30,
    supplier: 'Havells India'
  },
  {
    id: '#INV-1105',
    name: 'Copper Pipe (3/4" x 10\')',
    category: 'Plumbing',
    stockLevel: 'Out of Stock',
    stockCount: 0,
    unitPrice: 28.00,
    lastUpdated: 'Oct 20, 2023',
    sku: 'PLM-CP-34',
    reorderPoint: 15,
    supplier: 'Godrej Climate'
  },
  {
    id: '#INV-1156',
    name: 'Washing Machine Pump',
    category: 'Appliance',
    stockLevel: 'Low Stock',
    stockCount: 2,
    unitPrice: 45.00,
    lastUpdated: 'Oct 18, 2023',
    sku: 'WM-PUMP-88',
    reorderPoint: 5,
    supplier: 'Whirlpool Spares'
  },
];

// ─── Initial Vendor Applications Data ───────────────────────────────────────
const INITIAL_APPLICATIONS = [
  {
    id: 'APP-901',
    name: 'Robert Smith',
    service: 'HVAC Specialist',
    email: 'robert.s@hvac-pros.com',
    phone: '+1 (555) 019-2834',
    city: 'Austin, TX',
    status: 'Pending',
    date: 'Oct 24, 2026',
    experience: '6 Years',
    docs: ['Photo Upload', 'Aadhar Upload', 'Resume Upload'],
    notes: 'Applied for commercial and residential AC repair dispatches in Austin metro area.'
  },
  {
    id: 'APP-902',
    name: 'Vikramaditya Singh',
    service: 'AC & Refrigeration',
    email: 'vikram.s@magicmistry.com',
    phone: '+91 98765 12345',
    city: 'Bengaluru, KA',
    status: 'Pending',
    date: 'Oct 23, 2026',
    experience: '8 Years',
    docs: ['Photo Upload', 'Aadhar Upload', 'Resume Upload'],
    notes: 'Specializes in split AC, cassette AC, and double-door inverter refrigerators.'
  },
  {
    id: 'APP-903',
    name: 'Anita Desai',
    service: 'Washing Machine Expert',
    email: 'anita.d@repairs.in',
    phone: '+91 98450 67890',
    city: 'Bengaluru, KA',
    status: 'Approved',
    date: 'Oct 20, 2026',
    experience: '5 Years',
    docs: ['Photo Upload', 'Aadhar Upload', 'Resume Upload'],
    notes: 'Expert in front load washing machine drum seals and drain pumps.'
  },
  {
    id: 'APP-904',
    name: 'Karan Mehra',
    service: 'Electrical & Plumbing',
    email: 'karan.m@techpros.com',
    phone: '+91 97441 55443',
    city: 'Mumbai, MH',
    status: 'Reviewing',
    date: 'Oct 19, 2026',
    experience: '4 Years',
    docs: ['Photo Upload', 'Aadhar Upload', 'Resume Upload'],
    notes: 'Residential wiring, switchboard installation, and leak repairs.'
  },
];

// ─── Initial Users Data ──────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id: 'USR-101', name: 'Rahul Sharma', email: 'rahul.s@gmail.com', role: 'Customer', status: 'Active', bookings: 8, joined: 'Jan 2024' },
  { id: 'USR-102', name: 'Priya Patel', email: 'priya.p@outlook.com', role: 'Customer', status: 'Active', bookings: 14, joined: 'Mar 2024' },
  { id: 'USR-103', name: 'Suresh Kumar', email: 'suresh.k@vendor.magicmistry.com', role: 'Technician', status: 'Verified', bookings: 142, joined: 'Nov 2023' },
  { id: 'USR-104', name: 'Ankit Sharma', email: 'ankit.s@vendor.magicmistry.com', role: 'Technician', status: 'Verified', bookings: 98, joined: 'Feb 2024' },
];

// ─── Initial Dispatch Queue Data ─────────────────────────────────────────────
const INITIAL_DISPATCH_QUEUE = [
  { id: '#FX-8092', appliance: 'LG Split AC', applianceIcon: Snowflake, customer: 'Sarah Jenkins', technician: 'Mike R.', technicianAvatar: 'MR', status: 'Assigned' },
  { id: '#FX-8091', appliance: 'Samsung Fridge', applianceIcon: Package, customer: 'David Chen', technician: 'Unassigned', technicianAvatar: '', status: 'Awaiting Tech' },
  { id: '#FX-8088', appliance: 'Bosch Washer', applianceIcon: Droplets, customer: 'Elena Rodriguez', technician: 'John D.', technicianAvatar: 'JD', status: 'Under Diagnosis' },
  { id: '#FX-8087', appliance: 'Samsung AC', applianceIcon: Snowflake, customer: 'Amanda Smith', technician: 'Mike R.', technicianAvatar: 'MR', status: 'Assigned' },
  { id: '#FX-8086', appliance: 'LG Microwave', applianceIcon: Package, customer: 'Raj Patel', technician: 'Unassigned', technicianAvatar: '', status: 'Awaiting Tech' },
  { id: '#FX-8085', appliance: 'Whirlpool Fridge', applianceIcon: Package, customer: 'Maria Garcia', technician: 'Sara T.', technicianAvatar: 'ST', status: 'Assigned' },
  { id: '#FX-8084', appliance: 'Dyson Vacuum', applianceIcon: Package, customer: 'John Doe', technician: 'Unassigned', technicianAvatar: '', status: 'Awaiting Tech' },
  { id: '#FX-8083', appliance: 'Sony TV', applianceIcon: Package, customer: 'Jane Doe', technician: 'Alex B.', technicianAvatar: 'AB', status: 'Assigned' },
  { id: '#FX-8082', appliance: 'LG AC', applianceIcon: Snowflake, customer: 'Emily Clark', technician: 'Mike R.', technicianAvatar: 'MR', status: 'Under Diagnosis' },
  { id: '#FX-8081', appliance: 'Bosch Dishwasher', applianceIcon: Droplets, customer: 'Robert Brown', technician: 'Unassigned', technicianAvatar: '', status: 'Awaiting Tech' },
  { id: '#FX-8080', appliance: 'Samsung TV', applianceIcon: Package, customer: 'Michael Lee', technician: 'Sara T.', technicianAvatar: 'ST', status: 'Assigned' },
  { id: '#FX-8079', appliance: 'Whirlpool AC', applianceIcon: Snowflake, customer: 'William Davis', technician: 'Mike R.', technicianAvatar: 'MR', status: 'Assigned' },
];

// ─── Initial Vendor Approvals Summary ────────────────────────────────────────
const INITIAL_VENDOR_APPROVALS = [
  { id: 'V-1', name: 'Cooling Experts Co.', applied: 'Applied 2 hours ago', tags: ['AC Repair', 'Refrigeration'], icon: Store },
  { id: 'V-2', name: 'TechFix by Sarah', applied: 'Applied 5 hours ago', tags: ['Microwaves', 'Small Appliances'], icon: User },
];

// ─── Stock Level Pill Badge (Exact match to Screenshot 1 & 3) ───────────────
const StockLevelBadge = ({ level, count }) => {
  if (level === 'In Stock' || level === 'Approved' || level === 'Active' || level === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        {level} {count !== undefined ? `(${count})` : ''}
      </span>
    );
  }
  if (level === 'Low Stock' || level === 'Pending' || level === 'Reviewing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/90 text-amber-800 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        {level} {count !== undefined ? `(${count})` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100/90 text-rose-800 border border-rose-200">
      <span className="w-2 h-2 rounded-full bg-rose-500" />
      {level} {count !== undefined ? `(${count})` : ''}
    </span>
  );
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  // Navigation tab state: 'overview', 'users', 'applications', 'id-creation', 'analytics', 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [inventoryList, setInventoryList] = useState(INITIAL_INVENTORY);
  const [applicationsList, setApplicationsList] = useState(INITIAL_APPLICATIONS);
  const [dispatchQueue, setDispatchQueue] = useState(INITIAL_DISPATCH_QUEUE);
  const [vendorApprovals, setVendorApprovals] = useState(INITIAL_VENDOR_APPROVALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const pendingApplicationsCount = applicationsList.filter(app => app.status === 'Pending').length;
  
  // Dispatch Queue Pagination
  const [dispatchPage, setDispatchPage] = useState(1);
  const dispatchItemsPerPage = 4;
  const dispatchTotalPages = Math.ceil(dispatchQueue.length / dispatchItemsPerPage);
  const paginatedDispatch = dispatchQueue.slice((dispatchPage - 1) * dispatchItemsPerPage, dispatchPage * dispatchItemsPerPage);

  // Restock modal state (Screenshot 2)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [restockDate, setRestockDate] = useState('2026-07-20');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [restockNotes, setRestockNotes] = useState('');

  // Vendor Account Creation Form state (Screenshot 5)
  const [vendorForm, setVendorForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    serviceArea: ''
  });

  // Credentials Success Modal state (Screenshot 4)
  const [isCredentialSuccessOpen, setIsCredentialSuccessOpen] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState({
    name: 'Robert Smith - HVAC Specialist',
    id: 'FX-V-9921',
    tempPassword: 'FixIt_2024_!v'
  });

  // Vendor Application View Details Modal State
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Restock Modal (Screenshot 2)
  const handleOpenRestock = (item) => {
    setSelectedItem(item);
    setPurchasePrice(item.unitPrice ? item.unitPrice.toString() : '0.00');
    setRestockQty('');
    setIsRestockModalOpen(true);
  };

  // Confirm Restock
  const handleConfirmRestock = () => {
    if (!selectedItem) return;
    const addedCount = Number(restockQty || 0);
    setInventoryList(prev => prev.map(inv => {
      if (inv.id === selectedItem.id) {
        const newCount = inv.stockCount + addedCount;
        return {
          ...inv,
          stockCount: newCount,
          stockLevel: newCount > 10 ? 'In Stock' : newCount > 0 ? 'Low Stock' : 'Out of Stock',
          lastUpdated: 'Today, Just now'
        };
      }
      return inv;
    }));
    setIsRestockModalOpen(false);
    showToast(`Inventory restocked for ${selectedItem.name}! (+${addedCount} units)`);
  };

  // View Vendor Application Details Modal
  const handleViewApplication = (app) => {
    setSelectedApplication(app);
    setIsApplicationModalOpen(true);
  };

  // Update Application Status (Approve / Reject)
  const handleUpdateAppStatus = (appId, newStatus) => {
    setApplicationsList(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    setIsApplicationModalOpen(false);
    showToast(`Application ${appId} marked as ${newStatus}!`);
  };

  // Generate Credentials Submit (Screenshot 5 -> 4)
  const handleGenerateCredentials = (e) => {
    e.preventDefault();
    if (!vendorForm.fullName || !vendorForm.email) {
      showToast('Please provide full name and email address.');
      return;
    }
    const newId = 'FX-V-' + Math.floor(1000 + Math.random() * 9000);
    const newPass = 'FixIt_' + new Date().getFullYear() + '_!' + Math.random().toString(36).substring(2, 4);

    setGeneratedCreds({
      name: `${vendorForm.fullName} - ${vendorForm.specialization || 'Service Technician'}`,
      id: newId,
      tempPassword: newPass
    });
    setIsCredentialSuccessOpen(true);
  };

  // Filtered inventory list
  const filteredInventory = inventoryList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All Status' || item.stockLevel === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sidebar navigation menu items (Exact match to reference screenshots)
  const sidebarNavItems = [
    { id: 'overview',     label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'inventory',    label: 'Inventory Management',icon: Package },
    { id: 'users',        label: 'User Management',    icon: Users },
    { id: 'applications', label: 'Vendor Applications', icon: FileText, badge: pendingApplicationsCount > 0 ? pendingApplicationsCount.toString() : null },
    { id: 'id-creation', label: 'Vandor id creation',  icon: UserPlus, isOrange: true },
    { id: 'analytics',    label: 'Financial Analytics',icon: TrendingUp },
    { id: 'settings',     label: 'Platform Settings',  icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans antialiased text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 print:hidden">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── SIDEBAR NAVIGATION (Exact match to Reference Screenshots) ──────── */}
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-6">

                {/* Sidebar Navigation Buttons */}
                <nav className="space-y-1.5">
                  {sidebarNavItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/25'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`px-2 py-0.5 text-[11px] font-black rounded-full ${
                            isActive ? 'bg-white text-[#FF6B00]' : 'bg-rose-500 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </nav>

                {/* Divider */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-slate-400" />
                    <span>Back to Portal</span>
                  </button>
                </div>

              </div>
            </aside>

            {/* ── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">

                {/* ───────────────────────────────────────────────────────────────── */}
                {/* NEW DASHBOARD OVERVIEW TAB                                        */}
                {/* ───────────────────────────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview-main"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Header */}
                    <div>
                      <h1 className="text-3xl font-extrabold text-[#02182e]">Dashboard Overview</h1>
                      <p className="text-slate-500 text-sm mt-1">Platform performance and daily metrics.</p>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Revenue */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <DollarSign className="w-16 h-16 text-slate-100 absolute top-4 right-4 pointer-events-none" />
                        <div>
                          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">Total Revenue (MTD)</span>
                          <span className="text-3xl font-black text-[#02182e] tracking-tight">$45,289.00</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-3">
                          <TrendingUp className="w-3.5 h-3.5" /> +12.5% <span className="text-slate-500 font-medium ml-1">vs last month</span>
                        </p>
                      </div>

                      {/* Active Requests */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <Wrench className="w-16 h-16 text-slate-50 absolute top-4 right-4 pointer-events-none" />
                        <div>
                          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">Active Service Requests</span>
                          <span className="text-3xl font-black text-[#02182e] tracking-tight">142</span>
                        </div>
                        <p className="text-xs font-bold text-orange-500 flex items-center gap-1 mt-3">
                          <AlertCircle className="w-3.5 h-3.5" /> 48 awaiting assignment
                        </p>
                      </div>

                      {/* Pending Vendors */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <Contact className="w-16 h-16 text-slate-50 absolute top-4 right-4 pointer-events-none" />
                        <div>
                          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">Pending Vendors</span>
                          <span className="text-3xl font-black text-[#02182e] tracking-tight">{pendingApplicationsCount}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-3">
                          <UserPlus className="w-3.5 h-3.5" /> Requires manual review
                        </p>
                      </div>

                      {/* Avg Satisfaction */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <Star className="w-16 h-16 text-orange-50 absolute top-4 right-4 pointer-events-none" />
                        <div>
                          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">Avg. Satisfaction</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[#02182e] tracking-tight">4.8</span>
                            <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-3">
                          <Star className="w-3.5 h-3.5 text-orange-500" fill="currentColor" /> Based on 1.2k reviews
                        </p>
                      </div>
                    </div>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      
                      {/* Left Column: Dispatch Queue */}
                      <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full">
                          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-extrabold text-[#02182e]">Centralized Dispatch Queue</h2>
                            <div className="relative">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Search ID, Customer..."
                                className="w-full sm:w-64 pl-9 pr-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                              />
                            </div>
                          </div>
                          
                          <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                              <thead>
                                <tr className="bg-slate-50/80 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-100">
                                  <th className="py-3 px-5">REQ ID</th>
                                  <th className="py-3 px-4">APPLIANCE</th>
                                  <th className="py-3 px-4">CUSTOMER</th>
                                  <th className="py-3 px-4">TECHNICIAN</th>
                                  <th className="py-3 px-4">STATUS</th>
                                  <th className="py-3 px-5 text-right">ACTION</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {paginatedDispatch.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 px-5 font-bold text-slate-600">{item.id}</td>
                                    <td className="py-4 px-4">
                                      <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                                          <item.applianceIcon className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-slate-800">{item.appliance}</span>
                                      </div>
                                    </td>
                                    <td className="py-4 px-4 font-semibold text-slate-700">{item.customer}</td>
                                    <td className="py-4 px-4">
                                      {item.technicianAvatar ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                                            {item.technicianAvatar}
                                          </div>
                                          <span className="font-semibold text-slate-700">{item.technician}</span>
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 font-medium">{item.technician}</span>
                                      )}
                                    </td>
                                    <td className="py-4 px-4">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                        item.status === 'Assigned' || item.status === 'Under Diagnosis' ? 'bg-blue-100/80 text-blue-800' : 'bg-orange-100 text-orange-800'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          item.status === 'Assigned' || item.status === 'Under Diagnosis' ? 'bg-blue-500' : 'bg-orange-500 animate-pulse'
                                        }`} />
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className="py-4 px-5 text-right">
                                      <button className={`text-xs font-bold ${
                                        item.status === 'Awaiting Tech' ? 'text-slate-700 hover:text-slate-900' : 'text-[#02182e] hover:text-[#082848]'
                                      }`}>
                                        {item.status === 'Awaiting Tech' ? 'Assign' : 'View'}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 mt-auto">
                            <span>Showing {((dispatchPage - 1) * dispatchItemsPerPage) + 1} to {Math.min(dispatchPage * dispatchItemsPerPage, dispatchQueue.length)} of {dispatchQueue.length} results</span>
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => setDispatchPage(p => Math.max(1, p - 1))}
                                disabled={dispatchPage === 1}
                                className={`px-3 py-1.5 rounded-lg border border-slate-200 transition-colors ${dispatchPage === 1 ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700 cursor-pointer'}`}
                              >
                                Previous
                              </button>
                              
                              {[...Array(dispatchTotalPages)].map((_, i) => (
                                <button
                                  key={i + 1}
                                  onClick={() => setDispatchPage(i + 1)}
                                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                                    dispatchPage === i + 1 
                                      ? 'bg-[#02182e] text-white font-bold border border-[#02182e]' 
                                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              ))}

                              <button 
                                onClick={() => setDispatchPage(p => Math.min(dispatchTotalPages, p + 1))}
                                disabled={dispatchPage === dispatchTotalPages}
                                className={`px-3 py-1.5 rounded-lg border border-slate-200 transition-colors ${dispatchPage === dispatchTotalPages ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700 cursor-pointer'}`}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6 flex flex-col">
                        
                        {/* Vendor Approvals */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col flex-1">
                          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-base font-extrabold text-[#02182e]">Vendor Approvals</h2>
                            <span className="px-2.5 py-1 bg-[#FF6B00] text-white text-[10px] font-black rounded-full shadow-sm">
                              {pendingApplicationsCount} Pending
                            </span>
                          </div>
                          <div className="p-5 space-y-4 flex-1">
                            {vendorApprovals.map((vendor, idx) => (
                              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                                    <vendor.icon className="w-5 h-5 text-slate-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-sm text-slate-900">{vendor.name}</h3>
                                    <p className="text-[11px] text-slate-500 font-medium mb-2">{vendor.applied}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                      {vendor.tags.map((tag, tIdx) => (
                                        <span key={tIdx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                    <button className="w-full py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors">
                                      Review Docs
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-4 border-t border-slate-100 flex justify-center mt-auto">
                            <button className="text-xs font-extrabold text-slate-600 hover:text-slate-900 transition-colors">
                              See Full Queue
                            </button>
                          </div>
                        </div>

                        {/* Emergency Override */}
                        <div className="bg-[#02182e] rounded-2xl p-6 shadow-md relative overflow-hidden">
                          <Star className="w-32 h-32 text-white/5 absolute -bottom-6 -right-6 pointer-events-none" />
                          <h2 className="text-white text-lg font-extrabold mb-2 relative z-10">Emergency Override</h2>
                          <p className="text-slate-300 text-xs mb-5 font-medium relative z-10 leading-relaxed">
                            Manually assign priority technicians to critical service failures.
                          </p>
                          <button className="w-full py-3 bg-[#FF6B00] hover:bg-[#e66000] text-white text-sm font-extrabold rounded-xl shadow-lg shadow-orange-500/25 transition-all active:scale-95 relative z-10">
                            Initiate Override
                          </button>
                        </div>
                      </div>
                      
                    </div>
                  </motion.div>
                )}


                {/* ───────────────────────────────────────────────────────────────── */}
                {/* 1A. INVENTORY MANAGEMENT TAB (Moved from overview)                 */}
                {/* ───────────────────────────────────────────────────────────────── */}
                {activeTab === 'inventory' && (
                  <motion.div
                    key="inventory"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Top Header Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                          Inventory Management
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                          Manage spare parts, equipment, and stock levels.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => showToast('Report exported successfully!')}
                          className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-slate-500" /> Export Report
                        </button>
                        <button
                          onClick={() => handleOpenRestock(inventoryList[0])}
                          className="px-4 py-2.5 bg-[#02182e] hover:bg-[#082848] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-orange-400" /> Add New Item
                        </button>
                      </div>
                    </div>

                    {/* ─ HERO STATS METRIC CARDS (Exact match to Screenshots 1 & 3) ─ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                      {/* Card 1: TOTAL ITEMS */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                            TOTAL ITEMS
                          </span>
                          <Package className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">1,248</span>
                          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3.5 h-3.5" /> +5% from last month
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 2: LOW STOCK ALERTS */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                            LOW STOCK ALERTS
                          </span>
                          <AlertTriangle className="w-5 h-5 text-rose-500" />
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">24</span>
                          <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1">
                            ↑ +2 require attention
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 3: RECENT RESTOCKS */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                            RECENT RESTOCKS
                          </span>
                          <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">12</span>
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            In the last 7 days
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 4: TOTAL VALUE */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                            TOTAL VALUE
                          </span>
                          <DollarSign className="w-5 h-5 text-slate-700" />
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">$45.8k</span>
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            Estimated inventory value
                          </p>
                        </div>
                      </motion.div>

                    </div>

                    {/* ─ CONTROL BAR & DATA TABLE CONTAINER (Exact match to Screenshots 1 & 3) ─ */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">

                      {/* Search Bar & Dropdowns */}
                      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search items by name or ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                          />
                        </div>

                        {/* Dropdown Filters */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">

                          {/* All Categories */}
                          <div className="relative w-1/2 sm:w-44">
                            <select
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="All Categories">All Categories</option>
                              <option value="Appliance">Appliance</option>
                              <option value="Electrical">Electrical</option>
                              <option value="Plumbing">Plumbing</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>

                          {/* All Status */}
                          <div className="relative w-1/2 sm:w-40">
                            <select
                              value={selectedStatus}
                              onChange={(e) => setSelectedStatus(e.target.value)}
                              className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="All Status">All Status</option>
                              <option value="In Stock">In Stock</option>
                              <option value="Low Stock">Low Stock</option>
                              <option value="Out of Stock">Out of Stock</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>

                        </div>
                      </div>

                      {/* Inventory Data Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-500 uppercase font-extrabold tracking-wider border-y border-slate-100">
                              <th className="py-3.5 px-6">ITEM ID</th>
                              <th className="py-3.5 px-4">NAME</th>
                              <th className="py-3.5 px-4">CATEGORY</th>
                              <th className="py-3.5 px-4">STOCK LEVEL</th>
                              <th className="py-3.5 px-4">UNIT PRICE</th>
                              <th className="py-3.5 px-4">LAST UPDATED</th>
                              <th className="py-3.5 px-6 text-right">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredInventory.map((row) => (
                              <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-4 px-6 font-bold text-slate-900">{row.id}</td>
                                <td className="py-4 px-4 font-bold text-slate-800">{row.name}</td>
                                <td className="py-4 px-4 font-semibold text-slate-500">{row.category}</td>
                                <td className="py-4 px-4">
                                  <StockLevelBadge level={row.stockLevel} count={row.stockCount} />
                                </td>
                                <td className="py-4 px-4 font-extrabold text-slate-900">${row.unitPrice.toFixed(2)}</td>
                                <td className="py-4 px-4 font-medium text-slate-500">{row.lastUpdated}</td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleOpenRestock(row)}
                                      className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                      title="Edit Item"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleOpenRestock(row)}
                                      className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                      title="Restock Inventory"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Bar (Matching Screenshot 1) */}
                      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
                        <span>Showing 1 to 5 of 1,248 results</span>
                        <div className="flex items-center gap-1.5">
                          <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 cursor-not-allowed">Previous</button>
                          <button className="px-3 py-1.5 rounded-lg bg-[#02182e] text-white font-bold">1</button>
                          <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">2</button>
                          <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">3</button>
                          <span>...</span>
                          <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">250</button>
                          <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">Next</button>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                )}


                {/* ───────────────────────────────────────────────────────────────── */}
                {/* 2. VENDOR APPLICATIONS TAB                                        */}
                {/* ───────────────────────────────────────────────────────────────── */}
                {activeTab === 'applications' && (
                  <motion.div
                    key="applications"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-extrabold text-[#02182e]">Vendor Applications</h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1">Review, inspect documents, and verify new technician partner registrations.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black rounded-full border border-rose-200">
                          {pendingApplicationsCount} Pending Review
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-100">
                              <th className="py-4 px-6">APP ID</th>
                              <th className="py-4 px-4">APPLICANT</th>
                              <th className="py-4 px-4">SPECIALIZATION</th>
                              <th className="py-4 px-4">CITY</th>
                              <th className="py-4 px-4">STATUS</th>
                              <th className="py-4 px-6 text-right">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {applicationsList.map((app) => (
                              <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-4 px-6 font-bold text-slate-900">{app.id}</td>
                                <td className="py-4 px-4">
                                  <div className="font-extrabold text-slate-900 text-sm">{app.name}</div>
                                  <div className="text-[11px] text-slate-400 font-medium">{app.email}</div>
                                </td>
                                <td className="py-4 px-4 font-bold text-slate-700">{app.service}</td>
                                <td className="py-4 px-4 text-slate-500 font-medium">{app.city}</td>
                                <td className="py-4 px-4">
                                  <StockLevelBadge level={app.status} />
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    
                                    {/* View Application Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleViewApplication(app);
                                      }}
                                      className="px-3.5 py-2 bg-[#02182e] hover:bg-[#082848] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-orange-400" /> View Application
                                    </button>

                                    {/* Quick Approve / Reject Buttons */}
                                    {app.status === 'Pending' && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleUpdateAppStatus(app.id, 'Approved');
                                          }}
                                          className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                                          title="Quick Approve"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleUpdateAppStatus(app.id, 'Rejected');
                                          }}
                                          className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                                          title="Quick Reject"
                                        >
                                          <X className="w-4 h-4" />
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
                {/* 3. VANDOR ID CREATION TAB (Exact match to Screenshots 3, 4, 5)   */}
                {/* ───────────────────────────────────────────────────────────────── */}
                {activeTab === 'id-creation' && (
                  <motion.div
                    key="id-creation"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="text-3xl font-extrabold text-[#02182e]">Create Vendor Account</h1>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Provision a new service partner ID and temporary login credentials for the technician portal.
                      </p>
                    </div>

                    {/* Vendor Information Form (Exact match to Screenshot 5) */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                      <div className="flex items-center gap-2 text-[#02182e] font-black text-lg pb-4 border-b border-slate-100">
                        <Wrench className="w-5 h-5 text-amber-600" />
                        <span>Vendor Information</span>
                      </div>

                      <form onSubmit={handleGenerateCredentials} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={vendorForm.fullName}
                              onChange={(e) => setVendorForm({ ...vendorForm, fullName: e.target.value })}
                              placeholder="e.g. Robert Smith"
                              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                            <input
                              type="email"
                              required
                              value={vendorForm.email}
                              onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                              placeholder="robert.s@hvac-pros.com"
                              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                            <input
                              type="text"
                              value={vendorForm.phone}
                              onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                              placeholder="+1 (555) 000-0000"
                              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Specialization</label>
                            <div className="relative">
                              <select
                                value={vendorForm.specialization}
                                onChange={(e) => setVendorForm({ ...vendorForm, specialization: e.target.value })}
                                className="w-full appearance-none px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                              >
                                <option value="">Select Category</option>
                                <option value="HVAC Specialist">HVAC Specialist</option>
                                <option value="Appliance Expert">Appliance Expert</option>
                                <option value="Electrical Repair">Electrical Repair</option>
                                <option value="Plumbing Engineer">Plumbing Engineer</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Service Area (Zip Codes or City)</label>
                          <input
                            type="text"
                            value={vendorForm.serviceArea}
                            onChange={(e) => setVendorForm({ ...vendorForm, serviceArea: e.target.value })}
                            placeholder="e.g. Austin, TX (78701, 78702, 78704)"
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-lg hover:from-amber-800 hover:to-orange-800 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Lock className="w-4 h-4" /> Generate Credentials
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* 3 Security Benefit Cards (Exact match to Screenshot 5 bottom) */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                        <ShieldCheck className="w-5 h-5 text-slate-700" />
                        <h4 className="font-extrabold text-slate-900 text-sm">Auto-Verification</h4>
                        <p className="text-xs text-slate-500">System automatically checks for pre-existing license database matches.</p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                        <Lock className="w-5 h-5 text-slate-700" />
                        <h4 className="font-extrabold text-slate-900 text-sm">Secure Hashing</h4>
                        <p className="text-xs text-slate-500">Passwords are encrypted instantly. Admins cannot view them once closed.</p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                        <Clock className="w-5 h-5 text-slate-700" />
                        <h4 className="font-extrabold text-slate-900 text-sm">Creation Logs</h4>
                        <p className="text-xs text-slate-500">All ID generation events are recorded for security audit trails.</p>
                      </div>
                    </div>

                  </motion.div>
                )}


                {/* ───────────────────────────────────────────────────────────────── */}
                {/* 4. USER MANAGEMENT TAB                                            */}
                {/* ───────────────────────────────────────────────────────────────── */}
                {activeTab === 'users' && (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-900">User & Partner Management</h1>
                      <p className="text-slate-500 text-sm mt-1">Manage active customers and verified technician profiles.</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 uppercase font-extrabold border-b border-slate-100">
                              <th className="py-4 px-6">USER ID</th>
                              <th className="py-4 px-4">NAME</th>
                              <th className="py-4 px-4">ROLE</th>
                              <th className="py-4 px-4">TOTAL BOOKINGS</th>
                              <th className="py-4 px-4">STATUS</th>
                              <th className="py-4 px-6 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {INITIAL_USERS.map((usr) => (
                              <tr key={usr.id} className="hover:bg-slate-50">
                                <td className="py-4 px-6 font-bold text-slate-900">{usr.id}</td>
                                <td className="py-4 px-4 font-bold text-slate-800">
                                  <div>{usr.name}</div>
                                  <div className="text-[11px] text-slate-400 font-normal">{usr.email}</div>
                                </td>
                                <td className="py-4 px-4 font-semibold text-slate-600">{usr.role}</td>
                                <td className="py-4 px-4 font-black text-slate-900">{usr.bookings}</td>
                                <td className="py-4 px-4">
                                  <StockLevelBadge level={usr.status} />
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button onClick={() => showToast(`Managing ${usr.name}`)} className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer">
                                    Edit Profile
                                  </button>
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
                {/* 5. FINANCIAL ANALYTICS TAB                                        */}
                {/* ───────────────────────────────────────────────────────────────── */}
                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-900">Financial Analytics</h1>
                      <p className="text-slate-500 text-sm mt-1">Platform revenue metrics, service charges, and payouts.</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
                        <div className="text-3xl font-black text-slate-900 mt-2">₹2,48,500</div>
                        <p className="text-xs font-bold text-emerald-600 mt-1">↗ +18.4% this month</p>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Vendor Payouts</span>
                        <div className="text-3xl font-black text-slate-900 mt-2">₹1,64,300</div>
                        <p className="text-xs font-medium text-slate-500 mt-1">Direct bank transfers</p>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Platform Margin</span>
                        <div className="text-3xl font-black text-slate-900 mt-2">₹84,200</div>
                        <p className="text-xs font-bold text-emerald-600 mt-1">33.8% net margin</p>
                      </div>
                    </div>
                  </motion.div>
                )}


                {/* ───────────────────────────────────────────────────────────────── */}
                {/* 6. PLATFORM SETTINGS TAB                                         */}
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
                      <h1 className="text-3xl font-extrabold text-slate-900">Platform Settings</h1>
                      <p className="text-slate-500 text-sm mt-1">System parameters, commission rates, and gateway keys.</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Standard Platform Commission (%)</label>
                        <input type="number" defaultValue={15} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Service Radius Limit (km)</label>
                        <input type="number" defaultValue={25} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                      </div>
                      <button onClick={() => showToast('Platform settings updated!')} className="px-6 py-2.5 bg-[#02182e] text-white font-extrabold text-xs rounded-xl shadow cursor-pointer">
                        Save System Settings
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>

      {/* ── MODALS (High Z-Index overlays z-[9999]) ─────────────────────────── */}

      {/* 1. Restock Inventory Modal (Exact Match to Screenshot 2) */}
      <AnimatePresence>
        {isRestockModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#02182e] font-black text-xl">
                    <Truck className="w-5 h-5 text-amber-600" />
                    <span>Restock Inventory</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    {selectedItem ? `${selectedItem.name} - SKU: ${selectedItem.sku}` : 'AC Compressor (2 Ton) - SKU: ACC-2T-X9'}
                  </p>
                </div>
                <button
                  onClick={() => setIsRestockModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">

                {/* Current Stock Banner */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#02182e] text-white flex items-center justify-center">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">CURRENT STOCK</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          {selectedItem ? selectedItem.stockCount : 45}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">units</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-slate-400">Reorder Point: 20</p>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-900 text-white">
                      <Check className="w-3 h-3 text-emerald-400" /> Stock Level Healthy
                    </span>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity to Add *</label>
                    <div className="relative">
                      <Plus className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={restockQty}
                        onChange={(e) => setRestockQty(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Price per Unit *</label>
                    <div className="relative">
                      <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <input
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Restock Date *</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={restockDate}
                        onChange={(e) => setRestockDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Supplier</label>
                    <div className="relative">
                      <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select Supplier...</option>
                        <option value="BlueStar Components">BlueStar Components</option>
                        <option value="LG Electronics">LG Electronics</option>
                        <option value="Havells India">Havells India</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    placeholder="Add any details about this restock order..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Projected Total Banner */}
                <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-slate-400" /> Projected Total Stock:</span>
                  <span className="text-lg font-black text-slate-900">
                    {(selectedItem ? selectedItem.stockCount : 45) + Number(restockQty || 0)}
                  </span>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRestock}
                  className="px-5 py-2.5 bg-[#02182e] hover:bg-[#082848] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" /> Confirm Restock
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* 2. Vendor Credentials Created Success Modal (Exact Match to Screenshot 4) */}
      <AnimatePresence>
        {isCredentialSuccessOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-center my-8"
            >
              {/* Checkmark Icon Header */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-[#02182e]">Vendor Credentials Created Successfully</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  The profile for <span className="font-bold text-slate-800">{generatedCreds.name}</span> is now active and ready for dispatch.
                </p>
              </div>

              {/* Copyable Fields */}
              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Vendor ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={generatedCreds.id}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCreds.id);
                        showToast('Vendor ID copied to clipboard!');
                      }}
                      className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Temporary Password</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={generatedCreds.tempPassword}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCreds.tempPassword);
                        showToast('Temporary password copied!');
                      }}
                      className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Alert Box */}
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-left flex items-start gap-3">
                <Shield className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                  For security: This password will only be visible once. Please share it with the vendor immediately. It will expire in 24 hours.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    showToast('Share email link generated!');
                    setIsCredentialSuccessOpen(false);
                  }}
                  className="py-3 bg-[#02182e] hover:bg-[#082848] text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" /> Share via Email
                </button>
                <button
                  onClick={() => setIsCredentialSuccessOpen(false)}
                  className="py-3 border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Go to Vendor List
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* 3. Vendor Application Form Details Modal (High Z-index z-[9999]) */}
      <AnimatePresence>
        {isApplicationModalOpen && selectedApplication && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-[#02182e] to-[#09223e] text-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl font-bold shrink-0">
                    <FileCheck className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold tracking-tight">Vendor Application Form Details</h3>
                      <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[11px] font-black rounded-full uppercase tracking-wider">
                        {selectedApplication.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      Submitted by <span className="font-bold text-white">{selectedApplication.name}</span> on {selectedApplication.date || 'Oct 24, 2026'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplicationModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Scrollable Form Structure */}
              <div className="p-6 space-y-6 overflow-y-auto bg-slate-50/50 flex-1">

                {/* Status Bar */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Application Status:</span>
                    <StockLevelBadge level={selectedApplication.status} />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-500" /> Registered Service Partner Request
                  </div>
                </div>

                {/* Section 1: Personal Information */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-[#02182e] font-extrabold text-sm pb-2 border-b border-slate-100">
                    <User className="w-4 h-4 text-orange-500" />
                    <span>Section 1: Personal Information</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name</span>
                      <p className="font-bold text-slate-900 text-sm">{selectedApplication.name}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</span>
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedApplication.email}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Number</span>
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedApplication.phone}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">City / Operating Location</span>
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedApplication.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Work & Service Details */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-[#02182e] font-extrabold text-sm pb-2 border-b border-slate-100">
                    <Briefcase className="w-4 h-4 text-orange-500" />
                    <span>Section 2: Work & Service Expertise</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Primary Specialization</span>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 font-extrabold rounded-xl border border-orange-200 mt-1">
                        <Wrench className="w-3.5 h-3.5" /> {selectedApplication.service}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Years of Experience</span>
                      <p className="font-extrabold text-slate-900 text-sm mt-1">{selectedApplication.experience || '5+ Years'}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Vendor Bio & Background</span>
                    <div className="mt-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 leading-relaxed">
                      "{selectedApplication.notes || 'Experienced technician applying for Magic Mistry dispatch service.'}"
                    </div>
                  </div>
                </div>

                {/* Section 3: Submitted Verification Documents */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-[#02182e] font-extrabold text-sm pb-2 border-b border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Section 3: Identity & Verification Proofs</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {(selectedApplication.docs || ['Govt Photo ID', 'Trade License Cert', 'Background Verification']).map((doc, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-extrabold text-slate-800">{doc}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`Opening ${doc}...`);
                            // In a real app, this would be the actual file URL
                            window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
                          }}
                          className="text-[11px] font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Applicant agreed to Magic Mistry Code of Conduct & Background Checks.</span>
                  </div>
                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsApplicationModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateAppStatus(selectedApplication.id, 'Rejected')}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserX className="w-4 h-4" /> Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateAppStatus(selectedApplication.id, 'Approved');
                      setVendorForm({
                        fullName: selectedApplication.name,
                        email: selectedApplication.email,
                        phone: selectedApplication.phone,
                        specialization: selectedApplication.service,
                        serviceArea: selectedApplication.city
                      });
                      setActiveTab('id-creation');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" /> Approve & Create Vendor ID
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 z-[10000] px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold bg-[#02182e] text-white border border-emerald-500/50 flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Included at Bottom */}
      <Footer />
    </div>
  );
}
