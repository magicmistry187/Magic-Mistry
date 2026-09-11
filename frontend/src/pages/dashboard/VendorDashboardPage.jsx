import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Wrench, ShieldCheck, Star, Clock, MapPin, Phone, Navigation,
  CheckCircle2, XCircle, AlertCircle, IndianRupee, TrendingUp,
  User, CreditCard, Award, Calendar, ChevronRight, Power,
  FileText, Check, Plus, Search, Filter, RefreshCw, Bell,
  Tv, Zap, Thermometer, ArrowUpRight, ChevronDown, Building,
  Sliders, Shield, MessageSquare, ExternalLink, AlertTriangle,
  Play, Pause, Square, Camera, Trash2, Send, Eye, Lock,
  PlusCircle, CheckSquare, Square as SquareOutline, QrCode, Smartphone,
  Printer, X, Download, Fuel, Compass
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import PageLoader from '../../components/common/PageLoader';
import VendorPayoutModal from '../../components/dashboard/vendor/VendorPayoutModal';
import VendorTaxInvoiceModal from '../../components/dashboard/vendor/VendorTaxInvoiceModal';
import VendorAddressModal from '../../components/dashboard/vendor/VendorAddressModal';
import VendorRadiusModal from '../../components/dashboard/vendor/VendorRadiusModal';
import VendorStartServiceModal from '../../components/dashboard/vendor/VendorStartServiceModal';
import VendorFuelClaimModal from '../../components/dashboard/vendor/VendorFuelClaimModal';
import { useAuth } from '../../context/AuthContext';
import { getVendorBookingsApi, acceptBookingApi, updateBookingStatusApi } from '../../services/operations/bookingAPI';
import { saveVendorAddressApi, getAddressesApi, updateAddressApi, createAddressApi } from '../../services/operations/addressAPI';
import { updateVendorProfileApi, getVendorProfileApi, updateVendorProfileImageApi } from '../../services/operations/vendorAPI';


// Predefined Indian Banks for Profile
const INDIAN_BANKS = [
  'Axis Bank Ltd.', 'Bandhan Bank Ltd.', 'Bank of Baroda', 'Bank of India',
  'Bank of Maharashtra', 'Canara Bank', 'Central Bank of India', 'City Union Bank Ltd.',
  'CSB Bank Ltd.', 'DCB Bank Ltd.', 'Dhanlaxmi Bank Ltd.', 'Federal Bank Ltd.',
  'HDFC Bank Ltd.', 'ICICI Bank Ltd.', 'IDBI Bank Ltd.', 'IDFC First Bank Ltd.',
  'Indian Bank', 'Indian Overseas Bank', 'IndusInd Bank Ltd.', 'Jammu & Kashmir Bank Ltd.',
  'Karnataka Bank Ltd.', 'Karur Vysya Bank Ltd.', 'Kotak Mahindra Bank Ltd.', 'Nainital Bank Ltd.',
  'Punjab & Sind Bank', 'Punjab National Bank', 'RBL Bank Ltd.', 'South Indian Bank Ltd.',
  'State Bank of India', 'Tamilnad Mercantile Bank Ltd.', 'UCO Bank', 'Union Bank of India',
  'YES Bank Ltd.'
];

const ALL_APPLIANCES = [
  'AC Repair', 'Washing Machine', 'Refrigerator', 'Microwave', 
  'Geyser', 'TV', 'Water Purifier', 'Dishwasher', 'Chimney'
];

// Predefined Repair Components Catalog for Dropdown Menu Selection (Values in Rupees ₹)
const AVAILABLE_COMPONENTS = [
  { name: 'Diagnostic & Service Inspection Fee', defaultPrice: 450 },
  { name: 'Standard Start Capacitor (45uF)', defaultPrice: 650 },
  { name: 'Heavy-duty Compressor Capacitor (55uF)', defaultPrice: 850 },
  { name: 'Copper Pipe Flare Nut & Brazing Fitting', defaultPrice: 550 },
  { name: 'R32 Refrigerant Gas Top-Up (1kg)', defaultPrice: 1800 },
  { name: 'R410A Eco-Refrigerant Gas Recharge (1.5kg)', defaultPrice: 2400 },
  { name: 'AC Circuit Motherboard (PCB) Component Repair', defaultPrice: 1650 },
  { name: 'Water Drain Pipe & Anti-Leak Seal Clamp', defaultPrice: 350 },
  { name: 'Blower Fan Motor & Bearings Lubrication', defaultPrice: 950 },
  { name: 'Thermostat Sensor & Overload Relay Switch', defaultPrice: 650 },
  { name: 'Washing Machine Inlet Water Valve (Dual Port)', defaultPrice: 750 },
  { name: 'Washing Machine Drum Door Seal Rubber Gasket', defaultPrice: 950 },
  { name: 'Washing Machine Heavy-Duty Drain Pump Motor', defaultPrice: 1250 },
  { name: 'Washing Machine Pulsator Agitator Assembly', defaultPrice: 1100 },
  { name: 'Refrigerator Defrost Bi-Metal Thermal Fuse', defaultPrice: 550 },
  { name: 'Refrigerator Inverter Compressor Starter Relay', defaultPrice: 950 },
  { name: 'Refrigerator Evaporator DC Fan Motor (12V)', defaultPrice: 1450 },
  { name: 'Refrigerator Magnetic Door Gasket Seal Strip', defaultPrice: 850 },
  { name: 'Geyser Heavy Copper Heating Element (2kW / 3kW)', defaultPrice: 1250 },
  { name: 'Geyser Thermal Cut-Off Safety Switch (90°C)', defaultPrice: 450 },
  { name: 'Geyser Pressure Release Valve (PRV Brass 6 Bar)', defaultPrice: 650 },
  { name: 'Microwave Magnetron Tube Replacement (800W)', defaultPrice: 1850 },
  { name: 'Microwave High Voltage Diode & Capacitor', defaultPrice: 650 },
  { name: 'Custom Component / Special Service', defaultPrice: 400 },
];

const getApplianceIcon = (applianceName) => {
  const name = String(applianceName || '').toLowerCase();
  if (name.includes('ac')) return '❄️';
  if (name.includes('refrigerator') || name.includes('fridge')) return '🧊';
  if (name.includes('washing')) return '🫧';
  if (name.includes('tv') || name.includes('television')) return '📺';
  if (name.includes('microwave') || name.includes('oven')) return '♨️';
  if (name.includes('geyser') || name.includes('water heater')) return '🚿';
  if (name.includes('purifier') || name.includes('ro')) return '💧';
  if (name.includes('chimney')) return '🍳';
  if (name.includes('stabilizer')) return '⚡';
  return '🔧';
};

const formatBookingAddress = (addr) => {
  if (!addr) return '—';
  if (typeof addr === 'string') return addr.trim();
  if (typeof addr === 'object') {
    if (addr[''] && typeof addr[''] === 'string' && addr[''].trim()) {
      return addr[''].trim();
    }
    if (addr.formattedAddress && typeof addr.formattedAddress === 'string' && addr.formattedAddress.trim()) {
      return addr.formattedAddress.trim();
    }
    if (addr.fullAddress && typeof addr.fullAddress === 'string' && addr.fullAddress.trim()) {
      return addr.fullAddress.trim();
    }
    const parts = [
      addr.house || addr.flat || addr.addressLine1,
      addr.street,
      addr.landmark,
      addr.city,
      addr.state,
      addr.pincode,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  return '—';
};

// ── Financial Calculation Helper: 50% Service Payout, 0% Components, 100% Fuel Payout ──
export const calculateJobFinancials = (job) => {
  const parts = job?.invoiceData?.parts || job?.parts || [];

  let serviceCharges = 0;
  let componentCharges = 0;
  let travelCharges = 0;

  let distanceKm = Number(job?.travelDistanceKm) || Number(job?.invoiceData?.travelDistanceKm) || 0;
  let ratePerKm = Number(job?.travelRatePerKm) || Number(job?.invoiceData?.travelRatePerKm) || 10;

  if (parts.length > 0) {
    parts.forEach(part => {
      const q = parseFloat(part.qty) || 1;
      const p = parseFloat(part.price) || 0;
      const rowTotal = q * p;
      const desc = String(part.description || '').toLowerCase();

      const isTravel = part.isTravel || desc.includes('travel') || desc.includes('distance') || desc.includes('km ') || desc.endsWith('km');
      const isService = !isTravel && (
        part.locked || 
        part.isService || 
        desc.includes('diagnostic') || 
        desc.includes('inspection') || 
        desc.includes('service') || 
        desc.includes('labor') || 
        desc.includes('cleaning') || 
        desc.includes('jet clean') || 
        desc.includes('installation') || 
        desc.includes('visit') || 
        desc.includes('repair fee')
      );

      if (isTravel) {
        travelCharges += rowTotal;
        if (!distanceKm && q > 0) distanceKm = q;
      } else if (isService) {
        serviceCharges += rowTotal;
      } else {
        // Component / Spare part
        componentCharges += rowTotal;
      }
    });
  } else {
    // If no parts array, fallback to job amount/pay as service charge
    serviceCharges = Number(job?.amount) || Number(job?.estimatedPay) || 0;
  }

  // If travel distance is logged but not itemized in parts, compute travel charges
  if (travelCharges === 0 && distanceKm > 0) {
    travelCharges = distanceKm * ratePerKm;
  }

  // Vendor Payout Calculation Rules:
  // 1. Service Charges: strictly 50% vendor payout
  const servicePayout = serviceCharges * 0.5;
  // 2. Component Charges: strictly 0% vendor payout (excluded)
  const componentPayout = 0;
  // 3. Fuel Charges Payout: automatically calculated from total distance (KM)
  const fuelPayout = travelCharges;
  // Total Vendor Payout = (50% of Service Charges) + (Fuel Charges Payout)
  const totalVendorPayout = servicePayout + fuelPayout;
  const totalBilled = serviceCharges + componentCharges + travelCharges;

  return {
    serviceCharges,
    servicePayout,
    componentCharges,
    componentPayout,
    distanceKm,
    ratePerKm,
    travelCharges,
    fuelPayout,
    totalVendorPayout,
    totalBilled,
    mapScreenshot: job?.mapScreenshot || job?.invoiceData?.mapScreenshot || null,
    travelVerified: Boolean(job?.travelVerified || job?.mapScreenshot || job?.invoiceData?.mapScreenshot)
  };
};

// ── Default Mock Work Orders with verified route & distance support ───────────
const DEFAULT_SAMPLE_JOBS = [
  {
    id: 'WO-8821',
    displayId: 'WO-8821',
    appliance: 'AC Repair',
    applianceIcon: '❄️',
    serviceTitle: 'Split AC Cooling & Deep Jet Cleaning',
    status: 'Accepted',
    timeSlot: '10:00 AM - 12:00 PM',
    appointmentDate: 'Oct 26, 2026',
    customerName: 'Ananya Roy',
    customerPhone: '+91 98301 23456',
    serviceAddress: 'Tower 4, Flat 702, Uniworld City, New Town, Kolkata - 700160',
    location: 'New Town, Kolkata',
    distance: '4.5 km away',
    issue: 'AC not cooling properly, low airflow and whistling noise',
    estimatedPay: 1200,
    amount: 1200,
    date: 'Oct 26, 2026 10:00 AM',
    rawDate: new Date(),
    checklist: [
      { id: 1, title: 'Initial Inspection', desc: 'Inspect device and confirm cooling performance with customer.', completed: false },
      { id: 2, title: 'Diagnosis & Parts Verification', desc: 'Check refrigerant pressure and compressor capacitor current.', completed: false },
      { id: 3, title: 'Perform Service/Repair', desc: 'Deep jet clean indoor/outdoor coils and top up refrigerant.', completed: false },
      { id: 4, title: 'Final Testing & Cleanup', desc: 'Run complete 15-min cooling cycle and sanitize workspace.', completed: false },
    ],
    photos: [],
    notes: '',
    parts: [
      { id: 1, description: 'Split AC Diagnostic & Deep Jet Cleaning', qty: 1, price: 650, locked: true },
    ],
    travelDistanceKm: 4.5,
    travelRatePerKm: 10,
    travelCharges: 45,
    mapScreenshot: null,
    travelVerified: false
  },
  {
    id: 'WO-8822',
    displayId: 'WO-8822',
    appliance: 'Washing Machine',
    applianceIcon: '🫧',
    serviceTitle: 'Front Load Spin Cycle & Drain Pump Repair',
    status: 'New Request',
    timeSlot: '02:00 PM - 04:00 PM',
    appointmentDate: 'Oct 26, 2026',
    customerName: 'Rajesh Verma',
    customerPhone: '+91 98312 98765',
    serviceAddress: 'Block C, Salt Lake Sector 1, Kolkata - 700064',
    location: 'Salt Lake Sector 1, Kolkata',
    distance: '2.8 km away',
    issue: 'Water not draining at end of rinse cycle, drum vibrating',
    estimatedPay: 850,
    amount: 850,
    date: 'Oct 26, 2026 02:00 PM',
    rawDate: new Date(),
    checklist: [
      { id: 1, title: 'Initial Inspection', desc: 'Inspect drain hose and check pump filter for blockages.', completed: false },
      { id: 2, title: 'Diagnosis & Parts Verification', desc: 'Test drain pump motor resistance.', completed: false },
      { id: 3, title: 'Perform Service/Repair', desc: 'Clear pump debris or install replacement impeller pump.', completed: false },
      { id: 4, title: 'Final Testing & Cleanup', desc: 'Run quick spin test and verify zero water leakage.', completed: false },
    ],
    photos: [],
    notes: '',
    parts: [
      { id: 1, description: 'Washing Machine Inspection & Service', qty: 1, price: 450, locked: true },
    ],
    travelDistanceKm: 2.8,
    travelRatePerKm: 10,
    travelCharges: 28,
    mapScreenshot: null,
    travelVerified: false
  }
];

const DEFAULT_SAMPLE_HISTORY = [
  {
    id: 'WO-8815',
    displayId: 'WO-8815',
    appliance: 'Refrigerator',
    applianceIcon: '🧊',
    serviceTitle: 'Double Door Refrigerator Gas Top-up & Relay Repair',
    customerName: 'Debasish Paul',
    customerPhone: '+91 98305 11223',
    date: 'Oct 24, 2026',
    rawDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    location: 'Kankurgachi, Kolkata',
    serviceAddress: '14 Maniktala Main Road, Kankurgachi, Kolkata - 700054',
    amount: 2060.1,
    rating: 5,
    status: 'Completed',
    review: 'Fast technician arrival. Direct UPI transfer completed. Refrigerator cooling perfectly now.',
    travelDistanceKm: 6.2,
    travelRatePerKm: 10,
    travelCharges: 62,
    mapScreenshot: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
    invoiceData: {
      invoiceId: 'MM-INV-2026-8815',
      date: 'Oct 24, 2026',
      customerName: 'Debasish Paul',
      customerPhone: '+91 98305 11223',
      address: '14 Maniktala Main Road, Kankurgachi, Kolkata - 700054',
      serviceTitle: 'Double Door Refrigerator Gas Top-up & Relay Repair',
      technician: 'Marcus Reed',
      parts: [
        { id: 1, description: 'Refrigerator Inspection & Diagnostic Fee', qty: 1, price: 450, locked: true, isService: true },
        { id: 2, description: 'R134a Inverter Refrigerant Recharge', qty: 1, price: 1450, locked: false, isService: false },
        { id: 3, description: 'Travel & Distance Charge (6.2 km @ ₹10/km)', qty: 6.2, price: 10, locked: false, isTravel: true }
      ],
      subtotal: 1962,
      discount: 0,
      tax: 98.1,
      total: 2060.1,
      paymentMethod: 'Direct UPI Transfer',
      status: 'PAID IN FULL',
      travelDistanceKm: 6.2,
      travelRatePerKm: 10,
      travelCharges: 62,
      mapScreenshot: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'WO-8812',
    displayId: 'WO-8812',
    appliance: 'AC Repair',
    applianceIcon: '❄️',
    serviceTitle: 'Split AC Deep Foam & Jet Cleaning Service',
    customerName: 'Priyadarshini Sen',
    customerPhone: '+91 98311 44556',
    date: 'Oct 22, 2026',
    rawDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    location: 'Salt Lake Sector 2, Kolkata',
    serviceAddress: 'CJ Block, Sector 2, Salt Lake, Kolkata - 700091',
    amount: 888.0,
    rating: 5,
    status: 'Completed',
    review: 'Clean and tidy work. Arrived on time with verified route and navigation map.',
    travelDistanceKm: 4.8,
    travelRatePerKm: 10,
    travelCharges: 48,
    mapScreenshot: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
    invoiceData: {
      invoiceId: 'MM-INV-2026-8812',
      date: 'Oct 22, 2026',
      customerName: 'Priyadarshini Sen',
      customerPhone: '+91 98311 44556',
      address: 'CJ Block, Sector 2, Salt Lake, Kolkata - 700091',
      serviceTitle: 'Split AC Deep Foam & Jet Cleaning Service',
      technician: 'Marcus Reed',
      parts: [
        { id: 1, description: 'Split AC Inspection & Deep Jet Cleaning', qty: 1, price: 550, locked: true, isService: true },
        { id: 2, description: 'Anti-bacterial Coil Sanitizer Chemical', qty: 1, price: 250, locked: false, isService: false },
        { id: 3, description: 'Travel & Distance Charge (4.8 km @ ₹10/km)', qty: 4.8, price: 10, locked: false, isTravel: true }
      ],
      subtotal: 848,
      discount: 0,
      tax: 40.0,
      total: 888.0,
      paymentMethod: 'Direct Cash Transfer',
      status: 'PAID IN FULL',
      travelDistanceKm: 4.8,
      travelRatePerKm: 10,
      travelCharges: 48,
      mapScreenshot: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80'
    }
  }
];

const INITIAL_FUEL_CLAIMS = [
  {
    id: 'FUEL-1021',
    date: 'Oct 24, 2026',
    jobId: 'WO-8815',
    jobDisplay: 'WO-8815',
    customerName: 'Debasish Paul',
    distanceKm: 6.2,
    vehicleType: '2-Wheeler (Motorcycle / Scooter)',
    ratePerKm: 3.5,
    claimedAmount: 21.7,
    receiptImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80',
    notes: 'Direct transit to Kankurgachi for refrigerator compressor relay check.',
    status: 'Approved & Disbursed',
    settlementAccount: 'UPI: marcus@upi'
  }
];

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { token, user, loading, location, updateProfile } = useAuth();
  
  // Navigation tabs: 'active', 'service', 'invoice', 'history', 'earnings', 'profile'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'active';
  });

  // Sync activeTab if location state or search params change (e.g. from Navbar)
  useEffect(() => {
    const targetTab = routerLocation.state?.tab || new URLSearchParams(routerLocation.search).get('tab');
    if (targetTab) {
      setActiveTab(targetTab);
    }
  }, [routerLocation]);

  const [isOnline, setIsOnline] = useState(true);

  // Role guard — ensure user has vendor access
  useEffect(() => {
    if (loading) return; // wait for auth to rehydrate
    const storedToken = token || localStorage.getItem('mm_token');
    const storedUser = user || (() => {
      try {
        const s = localStorage.getItem('mm_user');
        return s ? JSON.parse(s) : null;
      } catch {
        return null;
      }
    })();

    if (!storedToken && !storedUser) {
      navigate('/login', { state: { from: '/vendor-dashboard', isVendorLogin: true }, replace: true });
      return;
    }

    if (storedUser) {
      const role = (storedUser.role || storedUser.user?.role || '').toLowerCase();
      const hasVendorAccess = role === 'vendor' || role === 'admin' || !!storedUser.vendorId || !!storedUser.user?.vendorId;
      if (!hasVendorAccess) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, token, loading, navigate]);

  // Scroll to top whenever tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  
  // Real live backend state with local persistence & sample fallback
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('mm_vendor_active_jobs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SAMPLE_JOBS;
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('mm_vendor_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SAMPLE_HISTORY;
  });

  // Persist jobs and history locally so uploaded map screenshots and completed orders are saved
  useEffect(() => {
    try {
      localStorage.setItem('mm_vendor_active_jobs', JSON.stringify(jobs));
    } catch {}
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem('mm_vendor_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Detailed earnings and payout calculation according to exact user rules:
  // 1. Service charges: strictly 50% vendor payout
  // 2. Component charges: 0% vendor payout (strictly excluded)
  // 3. Fuel charges payout: automatically calculated for all travel KM across completed services
  const earningsBreakdown = useMemo(() => {
    const completed = history.filter(h => h.status === 'Completed');

    let totalServiceCharges = 0;
    let totalServicePayout = 0;
    let totalComponentCharges = 0;
    let totalDistanceKm = 0;
    let totalFuelPayout = 0;
    let totalGrossBilled = 0;

    const itemizedJobs = completed.map(job => {
      const fin = calculateJobFinancials(job);
      totalServiceCharges += fin.serviceCharges;
      totalServicePayout += fin.servicePayout;
      totalComponentCharges += fin.componentCharges;
      totalDistanceKm += fin.distanceKm;
      totalFuelPayout += fin.fuelPayout;
      totalGrossBilled += (Number(job.amount) || fin.totalBilled);
      return {
        ...job,
        financials: fin
      };
    });

    const totalAvailablePayout = totalServicePayout + totalFuelPayout;

    return {
      completedJobs: itemizedJobs,
      totalServiceCharges,
      totalServicePayout,
      totalComponentCharges,
      totalDistanceKm,
      totalFuelPayout,
      totalGrossBilled,
      totalAvailablePayout
    };
  }, [history]);

  const [todayEarnings, setTodayEarnings] = useState(() => earningsBreakdown.totalAvailablePayout);
  const [rating, setRating] = useState(5.0);
  const [totalJobsDone, setTotalJobsDone] = useState(() => history.filter(b => b.status === 'Completed').length);

  // Keep todayEarnings and totalJobsDone synchronized with real earnings breakdown
  useEffect(() => {
    setTodayEarnings(earningsBreakdown.totalAvailablePayout);
    setTotalJobsDone(earningsBreakdown.completedJobs.length);
  }, [earningsBreakdown]);

  // Fetch Vendor Bookings from backend
  useEffect(() => {
    const fetchBookings = async () => {
      if (token) {
        try {
          const res = await getVendorBookingsApi(token);
          if (res.success && res.bookings && res.bookings.length > 0) {
            const formatted = res.bookings.map(b => {
              const displayAddr = formatBookingAddress(b.address);
              const pay = Number(b.serviceCategoryCharge) || Number(b.serviceCharge) || Number(b.estimatedPay) || 0;
              const formattedDist =
                typeof b.distance === 'number'
                  ? (b.distance < 1000 ? `${Math.round(b.distance)} m away` : `${(b.distance / 1000).toFixed(1)} km away`)
                  : 'Nearby';

              return {
                id: b.bookingId || String(b._id),
                displayId: b.bookingId || `WO-${String(b._id).slice(-6).toUpperCase()}`,
                appliance: b.appliance || 'General',
                applianceIcon: getApplianceIcon(b.appliance),
                serviceTitle: b.serviceCategory || b.appliance || 'Service Request',
                status: b.bookingStatus === 'Pending' ? 'New Request' : (b.bookingStatus || 'New Request'),
                timeSlot: b.timeSlot || '—',
                appointmentDate: b.serviceDate ? new Date(b.serviceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—',
                customerName: b.customer?.fullName || 'Customer',
                customerPhone: b.customer?.phoneNumber || '—',
                serviceAddress: displayAddr,
                location: displayAddr,
                distance: formattedDist,
                issue: b.issue || b.description || 'Service required',
                estimatedPay: pay,
                amount: b.serviceCharge || pay,
                date: b.serviceDate ? new Date(b.serviceDate).toLocaleDateString('en-IN') + (b.timeSlot ? ' ' + b.timeSlot : '') : '—',
                rawDate: b.serviceDate ? new Date(b.serviceDate) : new Date(b.createdAt || Date.now()),
                review: b.review || '',
                checklist: b.checklist || [
                  { id: 1, title: 'Initial Inspection', desc: 'Inspect device and confirm reported issue with customer.', completed: false },
                  { id: 2, title: 'Diagnosis & Parts Verification', desc: 'Test electrical components and verify required replacement parts.', completed: false },
                  { id: 3, title: 'Perform Service/Repair', desc: 'Carry out required servicing or parts replacement safely.', completed: false },
                  { id: 4, title: 'Final Testing & Cleanup', desc: 'Run complete test cycle and clean work area.', completed: false },
                ],
                photos: b.photos || [],
                notes: b.notes || '',
                parts: b.parts || [
                  { id: 1, description: b.serviceCategory || b.appliance || 'Diagnostic & Service Charge', qty: 1, price: pay || 450, locked: true },
                ],
              };
            });

            const activeList = formatted.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled' && b.status !== 'Closed');
            const historyList = formatted.filter(b => b.status === 'Completed' || b.status === 'Cancelled' || b.status === 'Closed');

            if (activeList.length > 0) setJobs(activeList);
            if (historyList.length > 0) setHistory(historyList);
          }
        } catch (err) {
          console.error('[Vendor Dashboard] Error fetching bookings:', err);
        }
      }
    };
    fetchBookings();
    const interval = setInterval(fetchBookings, 15000);
    return () => clearInterval(interval);
  }, [token, activeTab]);

  // Compute weekly earnings chart from real history data (using vendor payout)
  const weeklyEarningsData = useMemo(() => {
    const days = [
      { day: 'Mon', amount: 0, height: '10%' },
      { day: 'Tue', amount: 0, height: '10%' },
      { day: 'Wed', amount: 0, height: '10%' },
      { day: 'Thu', amount: 0, height: '10%' },
      { day: 'Fri', amount: 0, height: '10%' },
      { day: 'Sat', amount: 0, height: '10%' },
      { day: 'Sun', amount: 0, height: '10%' },
    ];

    const now = new Date();
    const currentDayIdx = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
    if (days[currentDayIdx]) days[currentDayIdx].active = true;

    history.forEach(item => {
      if (item.status === 'Completed' && item.rawDate) {
        const itemDate = new Date(item.rawDate);
        const dayIdx = (itemDate.getDay() + 6) % 7;
        if (dayIdx >= 0 && dayIdx < 7) {
          const fin = calculateJobFinancials(item);
          days[dayIdx].amount += fin.totalVendorPayout;
        }
      }
    });

    const maxAmount = Math.max(...days.map(d => d.amount), 500);
    days.forEach(d => {
      const pct = Math.max(10, Math.round((d.amount / maxAmount) * 100));
      d.height = `${pct}%`;
    });

    return days;
  }, [history]);

  // Compute lifetime gross customer billing from real completed history
  const lifetimeGrossBilled = useMemo(() => {
    return history
      .filter(h => h.status === 'Completed')
      .reduce((sum, h) => sum + (Number(h.amount) || Number(h.estimatedPay) || 0), 0);
  }, [history]);

  // Compute lifetime vendor payout from real completed history
  const lifetimeEarnings = useMemo(() => {
    return earningsBreakdown.totalAvailablePayout;
  }, [earningsBreakdown]);

  const [filterCategory, setFilterCategory] = useState('All');
  
  // Active Work Order execution state
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Timer state for service execution
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Invoice state
  const [invoiceParts, setInvoiceParts] = useState([]);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  // Payment methods: 'upi' (Direct UPI Transfer), 'cash' (Direct Cash Transfer), or 'online_gateway' (In Progress)
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [customerNotes, setCustomerNotes] = useState('');

  // Printable Tax Invoice Modal
  const [showTaxInvoiceModal, setShowTaxInvoiceModal] = useState(false);
  const [generatedInvoiceData, setGeneratedInvoiceData] = useState(null);
  const [modalReturnTab, setModalReturnTab] = useState('active');

  // Toast / Notifications
  const [toastMessage, setToastMessage] = useState(null);
  
  // Payout Request State
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutDays, setPayoutDays] = useState(5);
  const [payoutNotes, setPayoutNotes] = useState('');

  // Start Service Route & KM Verification Modal State
  const [showStartServiceModal, setShowStartServiceModal] = useState(false);
  const [pendingStartServiceJob, setPendingStartServiceJob] = useState(null);

  // Fuel Allowance Claim State (persisted in localStorage)
  const [showFuelClaimModal, setShowFuelClaimModal] = useState(false);
  const [fuelClaims, setFuelClaims] = useState(() => {
    try {
      const saved = localStorage.getItem('mm_vendor_fuel_claims');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FUEL_CLAIMS;
  });

  // Proof Lightbox Preview Modal (for map route screenshots & fuel bill slips)
  const [proofPreviewItem, setProofPreviewItem] = useState(null);

  // Profile
  const getInitialVendorProfile = () => {
    let u = user?.user || user;
    if (!u) {
      try {
        const stored = localStorage.getItem('mm_user');
        if (stored) u = JSON.parse(stored);
      } catch {}
    }
    u = u?.user || u || {};
    return {
      name: u.fullName || '',
      vendorId: u.vendorId || '',
      title: u.professionalTitle || 'Service Technician',
      phone: u.phoneNumber || '',
      email: u.email || '',
      upiId: u.vendorUpiId || '',
      address: (u.location && u.location !== 'Set Your Location' ? u.location : '') ||
               (u.serviceAddress && u.serviceAddress !== 'Set Your Location' ? u.serviceAddress : ''),
      serviceRadius: (u.serviceRadius !== undefined && u.serviceRadius !== null && Number(u.serviceRadius) > 0)
        ? Number(u.serviceRadius)
        : 15,
      nablId: u.certification?.certificationId || 'NABL-VERIFIED',
      bankName: u.bankDetails?.bankName || '',
      bankAccount: u.bankDetails?.accountNumber || '',
      ifsc: u.bankDetails?.ifsc || '',
      appliancesServed: Array.isArray(u.appliancesServed) ? u.appliancesServed : [],
      profileImage: u.profileImage?.url || (typeof u.profileImage === 'string' ? u.profileImage : '') || u.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
    };
  };

  const [vendorProfile, setVendorProfile] = useState(getInitialVendorProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState(getInitialVendorProfile);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isRadiusModalOpen, setIsRadiusModalOpen] = useState(false);
  const [vendorAddressObj, setVendorAddressObj] = useState(null);
  
  // Fetch Vendor Profile from backend
  useEffect(() => {
    const fetchVendorProfileData = async () => {
      if (!token) return;
      try {
        const res = await getVendorProfileApi(token);
        if (res.success && res.vendorProfile) {
          const vp = res.vendorProfile;
          const u = vp.user || {};
          const serviceLoc =
            (vp.serviceAddress && vp.serviceAddress !== 'Set Your Location' ? vp.serviceAddress : '') ||
            (u.location && u.location !== 'Set Your Location' ? u.location : '');

          const rawRadius = (vp.serviceRadius !== undefined && vp.serviceRadius !== null && Number(vp.serviceRadius) > 0)
            ? Number(vp.serviceRadius)
            : ((u.serviceRadius !== undefined && u.serviceRadius !== null && Number(u.serviceRadius) > 0) ? Number(u.serviceRadius) : 15);

          const loadedProfile = {
            name: u.fullName || vp.name || (user?.fullName || ''),
            vendorId: vp.vendorId || u.vendorId || (user?.vendorId || ''),
            title: vp.professionalTitle || 'Service Technician',
            phone: u.phoneNumber || (user?.phoneNumber || ''),
            email: u.email || (user?.email || ''),
            upiId: vp.vendorUpiId || '',
            address: serviceLoc,
            serviceRadius: rawRadius,
            nablId: vp.certification?.certificationId || 'NABL-VERIFIED',
            bankName: vp.bankDetails?.bankName || '',
            bankAccount: vp.bankDetails?.accountNumber || '',
            ifsc: vp.bankDetails?.ifsc || '',
            appliancesServed: Array.isArray(vp.appliancesServed) ? vp.appliancesServed : [],
            profileImage: vp.profileImage?.url || (typeof vp.profileImage === 'string' ? vp.profileImage : '') || user?.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
          };
          setVendorProfile(loadedProfile);
          setEditProfileForm(loadedProfile);
          if (vp.rating) setRating(vp.rating);
          if (vp.jobsCompleted !== undefined) setTotalJobsDone(vp.jobsCompleted);
        }

        // Also fetch structured address object
        try {
          const addrRes = await getAddressesApi(token);
          if (addrRes.success && Array.isArray(addrRes.addresses) && addrRes.addresses.length > 0) {
            const def = addrRes.addresses.find((a) => a.isDefault) || addrRes.addresses[0];
            setVendorAddressObj({
              flat: def.house || def.flat || def.addressLine1 || '',
              house: def.house || def.flat || def.addressLine1 || '',
              street: def.street || '',
              landmark: def.landmark || '',
              city: def.city || '',
              state: def.state || '',
              pincode: def.pincode || '',
              type: def.addressType || def.type || 'Home',
              addressType: def.addressType || def.type || 'Home',
              location: def.location,
              latitude: def.latitude || def.location?.coordinates?.[1],
              longitude: def.longitude || def.location?.coordinates?.[0],
            });
          }
        } catch (addrErr) {
          console.warn('Vendor address fetch error:', addrErr);
        }
      } catch (err) {
        console.error('[Vendor Dashboard] Failed to load vendor profile:', err);
      }
    };
    fetchVendorProfileData();
  }, [token]);

  // Sync profile with user context / location changes if vendorProfile is still empty
  useEffect(() => {
    if (user) {
      const u = user.user || user;
      const actualLocation =
        (u.location && u.location !== 'Set Your Location' ? u.location : '') ||
        (user.serviceAddress && user.serviceAddress !== 'Set Your Location' ? user.serviceAddress : '');
      
      setVendorProfile((prev) => ({
        ...prev,
        name: u.fullName || prev.name,
        email: u.email || prev.email,
        phone: u.phoneNumber || prev.phone,
        address: actualLocation,
        title: user.professionalTitle || prev.title,
        upiId: user.vendorUpiId || prev.upiId,
        appliancesServed: user.appliancesServed?.length ? user.appliancesServed : prev.appliancesServed,
        bankName: user.bankDetails?.bankName || prev.bankName,
        bankAccount: user.bankDetails?.accountNumber || prev.bankAccount,
        ifsc: user.bankDetails?.ifsc || prev.ifsc,
        profileImage: user.profileImage?.url || (typeof user.profileImage === 'string' ? user.profileImage : null) || prev.profileImage,
        nablId: user.certification?.certificationId || prev.nablId,
        serviceRadius: (user.serviceRadius !== undefined && user.serviceRadius !== null && Number(user.serviceRadius) > 0)
          ? Number(user.serviceRadius)
          : (prev.serviceRadius || 15),
      }));
    }
  }, [user]);

  const handleSaveVendorAddress = async (addressData) => {
    const displayAddress = addressData.formattedAddress || addressData;
    const existingId = addressData._id || addressData.id || vendorAddressObj?._id || vendorAddressObj?.id;

    setVendorAddressObj((prev) => ({
      ...prev,
      ...addressData,
      _id: existingId || prev?._id,
      id: existingId || prev?.id,
    }));
    setVendorProfile((prev) => ({ ...prev, address: displayAddress }));
    setEditProfileForm((prev) => ({ ...prev, address: displayAddress }));

    try {
      const payload = {
        _id: existingId,
        id: existingId,
        addressType: addressData.addressType || addressData.type || 'Other',
        house: addressData.flat || addressData.street || 'Shop',
        addressLine1: addressData.flat || addressData.street || '',
        flat: addressData.flat || '',
        street: addressData.street || '',
        landmark: addressData.landmark || '',
        city: addressData.city || '',
        state: addressData.state || '',
        country: 'India',
        pincode: addressData.pincode || '000000',
        isDefault: true,
      };

      if (addressData.latitude && addressData.longitude) {
        payload.latitude = addressData.latitude;
        payload.longitude = addressData.longitude;
        payload.location = {
          type: 'Point',
          coordinates: [Number(addressData.longitude), Number(addressData.latitude)],
        };
      }

      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') || localStorage.getItem('vendorToken') : null);

      let result;
      if (existingId) {
        result = await updateAddressApi(existingId, payload, authToken);
      } else {
        result = await createAddressApi(payload, authToken);
      }

      if (result.success && result.address) {
        const savedAddr = result.address;
        setVendorAddressObj({
          _id: savedAddr._id || savedAddr.id || existingId,
          id: savedAddr._id || savedAddr.id || existingId,
          flat: savedAddr.house || savedAddr.flat || savedAddr.addressLine1 || '',
          house: savedAddr.house || savedAddr.flat || savedAddr.addressLine1 || '',
          street: savedAddr.street || '',
          landmark: savedAddr.landmark || '',
          city: savedAddr.city || '',
          state: savedAddr.state || '',
          pincode: savedAddr.pincode || '',
          type: savedAddr.addressType || savedAddr.type || 'Home',
          addressType: savedAddr.addressType || savedAddr.type || 'Home',
          location: savedAddr.location,
          latitude: savedAddr.latitude || savedAddr.location?.coordinates?.[1],
          longitude: savedAddr.longitude || savedAddr.location?.coordinates?.[0],
        });
      }

      // Also persist serviceAddress and location on VendorProfile / User in backend
      const formData = new FormData();
      formData.append('serviceAddress', displayAddress);
      formData.append('location', displayAddress);
      await updateVendorProfileApi(formData, authToken);

      // ── Sync Navbar location pill immediately ────────────────────────────
      if (updateProfile) {
        updateProfile({
          serviceAddress: displayAddress,
          location: displayAddress,
          ...(addressData.latitude && addressData.longitude
            ? { latitude: addressData.latitude, longitude: addressData.longitude }
            : {}),
        });
      }
      // ─────────────────────────────────────────────────────────────────────

      showToast('Service address updated successfully!', 'success');
    } catch (err) {
      console.error('[Vendor Dashboard] ❌ Failed to save vendor address to backend:', err);
      showToast('Service address updated locally.', 'info');
    }
  };

  const handleSaveVendorProfile = async () => {
    try {
      console.log('[Vendor Dashboard] 🚀 handleSaveVendorProfile triggered');
      showToast('Saving vendor profile...', 'info');

      let finalProfileImage = editProfileForm.profileImage;

      // Step 1: If a new image file was selected, upload it via the dedicated endpoint
      if (editProfileForm.profileImageFile) {
        console.log('[Vendor Dashboard] 🖼️ Uploading profile image via dedicated endpoint...');
        const imgResult = await updateVendorProfileImageApi(editProfileForm.profileImageFile, token);
        if (imgResult.success) {
          finalProfileImage = imgResult.profileImage?.url || finalProfileImage;
          console.log('[Vendor Dashboard] ✅ Profile image uploaded:', finalProfileImage);
        } else {
          showToast(imgResult.message || 'Failed to upload profile image', 'error');
          return;
        }
      }

      // Step 2: Build FormData for the rest of the profile fields
      const formData = new FormData();
      
      // User Fields
      if (editProfileForm.name) formData.append('fullName', editProfileForm.name);
      if (editProfileForm.phone) formData.append('phoneNumber', editProfileForm.phone);
      
      // Vendor Fields
      if (editProfileForm.upiId) formData.append('vendorUpiId', editProfileForm.upiId);
      if (editProfileForm.title) formData.append('professionalTitle', editProfileForm.title);
      if (editProfileForm.address) formData.append('serviceAddress', editProfileForm.address);
      const finalRadius = (editProfileForm.serviceRadius !== undefined && editProfileForm.serviceRadius !== '' && Number(editProfileForm.serviceRadius) > 0)
        ? Number(editProfileForm.serviceRadius)
        : 15;
      formData.append('serviceRadius', finalRadius);
      
      // Bank Details
      const bankDetails = {
        bankName: editProfileForm.bankName || '',
        accountNumber: editProfileForm.bankAccount || '',
        ifsc: editProfileForm.ifsc || '',
      };
      formData.append('bankDetails', JSON.stringify(bankDetails));
      
      // Appliances Served
      if (editProfileForm.appliancesServed) {
        formData.append('appliancesServed', JSON.stringify(editProfileForm.appliancesServed));
      }
      
      console.log('[Vendor Dashboard] 📤 Sending profile FormData to backend...');
      const result = await updateVendorProfileApi(formData, token);
      console.log('[Vendor Dashboard] 📥 Backend response:', result);
      
      if (result.success) {
        const updatedVp = result.data?.vendorProfile || {};
        const updatedU = result.data?.user || updatedVp.user || {};

        const updatedProfile = {
          name: updatedU.fullName || editProfileForm.name,
          vendorId: updatedVp.vendorId || editProfileForm.vendorId,
          title: updatedVp.professionalTitle || editProfileForm.title,
          phone: updatedU.phoneNumber || editProfileForm.phone,
          email: updatedU.email || editProfileForm.email,
          upiId: updatedVp.vendorUpiId || editProfileForm.upiId,
          address: updatedVp.serviceAddress || updatedU.location || editProfileForm.address,
          serviceRadius: (updatedVp.serviceRadius !== undefined && updatedVp.serviceRadius !== null && Number(updatedVp.serviceRadius) > 0)
            ? Number(updatedVp.serviceRadius)
            : finalRadius,
          nablId: updatedVp.certification?.certificationId || editProfileForm.nablId,
          bankName: updatedVp.bankDetails?.bankName || editProfileForm.bankName,
          bankAccount: updatedVp.bankDetails?.accountNumber || editProfileForm.bankAccount,
          ifsc: updatedVp.bankDetails?.ifsc || editProfileForm.ifsc,
          appliancesServed: updatedVp.appliancesServed || editProfileForm.appliancesServed,
          profileImage: finalProfileImage,
        };

        // Update local state on success
        setVendorProfile(updatedProfile);
        setEditProfileForm(updatedProfile);
        
        // Sync context
        if (updateProfile) {
          updateProfile({
            ...updatedU,
            ...updatedVp,
            profileImage: finalProfileImage,
          });
        }
        
        setIsEditingProfile(false);
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(result.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error('[Vendor Dashboard] ❌ Failed to update vendor profile:', err);
      showToast('An error occurred while saving profile.', 'error');
    }
  };

  const handleUpdateRadius = async (newRadius) => {
    const val = Number(newRadius) > 0 ? Number(newRadius) : 15;
    try {
      showToast('Updating service radius...', 'info');
      const formData = new FormData();
      formData.append('serviceRadius', val);

      console.log('[Vendor Dashboard] 📤 Updating service radius to:', val);
      const result = await updateVendorProfileApi(formData, token);
      console.log('[Vendor Dashboard] 📥 Radius update response:', result);

      if (result.success) {
        setVendorProfile((prev) => ({ ...prev, serviceRadius: val }));
        setEditProfileForm((prev) => ({ ...prev, serviceRadius: val }));

        // Sync context
        if (updateProfile) {
          updateProfile({ serviceRadius: val });
        }

        // Sync localStorage
        try {
          const stored = localStorage.getItem('mm_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem('mm_user', JSON.stringify({ ...parsed, serviceRadius: val }));
          }
        } catch (e) {
          console.warn('Failed to update localStorage with radius:', e);
        }

        showToast(`Service radius updated to ${val} km successfully!`, 'success');

        // Refresh vendor bookings matching the updated radius
        if (token) {
          try {
            const bRes = await getVendorBookingsApi(token, val);
            if (bRes.success && Array.isArray(bRes.bookings)) {
              const formatted = bRes.bookings.map(b => {
                const displayAddr = formatBookingAddress(b.address);
                const pay = Number(b.serviceCategoryCharge) || Number(b.serviceCharge) || Number(b.estimatedPay) || 0;
                const formattedDist =
                  typeof b.distance === 'number'
                    ? (b.distance < 1000 ? `${Math.round(b.distance)} m away` : `${(b.distance / 1000).toFixed(1)} km away`)
                    : 'Nearby';

                return {
                  id: b.bookingId || String(b._id),
                  displayId: b.bookingId || `WO-${String(b._id).slice(-6).toUpperCase()}`,
                  appliance: b.appliance || 'General',
                  applianceIcon: getApplianceIcon(b.appliance),
                  serviceTitle: b.serviceCategory || b.appliance || 'Service Request',
                  status: b.bookingStatus === 'Pending' ? 'New Request' : (b.bookingStatus || 'New Request'),
                  timeSlot: b.timeSlot || '—',
                  scheduledDate: b.serviceDate ? new Date(b.serviceDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
                  location: displayAddr || 'Service Address',
                  city: b.address?.city || 'Local Area',
                  distance: formattedDist,
                  pay: pay > 0 ? pay : 450,
                  estDuration: '1.5 hrs',
                  customerNotes: b.issue || 'Standard service request',
                  customerName: b.customer?.fullName || 'Customer',
                  customerPhone: b.customer?.phoneNumber || 'Contact via FixIt',
                  problemDescription: b.issue || 'Customer reported appliance issue requiring inspection.',
                  diagnosticFee: 450,
                  rawBooking: b,
                };
              });
              setAvailableJobs(formatted.filter(b => b.status === 'New Request'));
            }
          } catch (bErr) {
            console.warn('Booking refresh error after radius update:', bErr);
          }
        }
        return true;
      } else {
        showToast(result.message || 'Failed to update service radius', 'error');
        throw new Error(result.message || 'Failed to update service radius');
      }
    } catch (err) {
      console.error('[Vendor Dashboard] ❌ Failed to update service radius:', err);
      showToast(err?.message || 'An error occurred while updating radius.', 'error');
      throw err;
    }
  };


  // Timer Effect - interval created once when running, not recreated every second
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle Online/Offline
  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      showToast('You are now ONLINE. Ready for new repair requests.', 'success');
    } else {
      showToast('You are now OFFLINE. Requests paused.', 'warning');
    }
  };

  const handleRequestPayout = () => {
    if (todayEarnings <= 0) {
      showToast('No available balance to payout.', 'warning');
      return;
    }
    setShowPayoutModal(true);
  };

  const handleConfirmPayout = () => {
    setPayoutRequested(true);
    setShowPayoutModal(false);
    showToast('Payout request submitted successfully! Processing time: 1-2 business days.', 'success');
  };

  // Fuel Claim Handlers (Earnings & Payouts page)
  const handleSubmitFuelClaim = (claimData) => {
    setFuelClaims(prev => {
      const updated = [claimData, ...prev];
      try {
        localStorage.setItem('mm_vendor_fuel_claims', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setShowFuelClaimModal(false);
    showToast(`Fuel allowance claim ${claimData.id} submitted for ₹${claimData.claimedAmount.toFixed(2)}!`, 'success');
  };

  const handleDeleteFuelClaim = (claimId) => {
    setFuelClaims(prev => {
      const updated = prev.filter(c => c.id !== claimId);
      try {
        localStorage.setItem('mm_vendor_fuel_claims', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Fuel claim ${claimId} removed.`, 'info');
  };

  // Accept / Reject
  const handleAcceptJob = async (jobId) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, status: 'Accepted' } : job
      )
    );
    showToast(`Work Order ${jobId} accepted! Navigation route ready.`, 'success');

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') : null);
    if (authToken && jobId) {
      try {
        await acceptBookingApi(jobId, authToken);
      } catch (err) {
        console.error('[Vendor Dashboard] Accept booking error:', err);
      }
    }
  };

  // Start Service Prompt - Opens Map Screenshot & Route Distance Verification Modal
  const handlePromptStartService = (job) => {
    setPendingStartServiceJob(job);
    setShowStartServiceModal(true);
  };

  const handleConfirmStartService = async ({ jobId, travelDistanceKm, travelRatePerKm, travelCharges, mapScreenshot, addToInvoice }) => {
    const targetJob = pendingStartServiceJob || jobs.find(j => j.id === jobId) || selectedJob;
    if (!targetJob) return;

    let updatedParts = [...(targetJob.parts || [])];

    if (addToInvoice) {
      // Remove any prior travel line item to avoid duplicate additions
      updatedParts = updatedParts.filter(p => !p.isTravel && !String(p.description || '').toLowerCase().includes('travel'));
      const travelPart = {
        id: `travel-${Date.now()}`,
        description: `Travel & Distance Charge (${travelDistanceKm} km @ ₹${travelRatePerKm}/km)`,
        qty: travelDistanceKm,
        price: travelRatePerKm,
        locked: false,
        isTravel: true
      };
      updatedParts.push(travelPart);
    }

    const updatedJob = {
      ...targetJob,
      status: 'In Progress',
      travelDistanceKm: Number(travelDistanceKm),
      travelRatePerKm: Number(travelRatePerKm),
      travelCharges: Number(travelCharges),
      mapScreenshot: mapScreenshot,
      travelVerified: true,
      parts: updatedParts
    };

    setJobs(prevJobs => prevJobs.map(j => j.id === updatedJob.id ? updatedJob : j));
    setSelectedJob(updatedJob);
    setInvoiceParts(updatedParts);
    setShowStartServiceModal(false);
    setPendingStartServiceJob(null);
    openServiceExecution(updatedJob);

    showToast(`Work order started! Route verified (${travelDistanceKm} KM) & logged to invoice.`, 'success');

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') : null);
    if (authToken && updatedJob?.id) {
      try {
        await updateBookingStatusApi(updatedJob.id, { status: 'In Progress' }, authToken);
      } catch (err) {
        console.error('[Vendor Dashboard] Start service error:', err);
      }
    }
  };

  const handleStartService = (job) => {
    handlePromptStartService(job);
  };

  const handleRejectJob = (jobId) => {
    setJobs(prevJobs => prevJobs.filter(j => j.id !== jobId));
    showToast(`Work Order ${jobId} declined.`, 'info');
  };

  // Start Service execution view
  const openServiceExecution = (job) => {
    setSelectedJob(job);
    setActiveTab('service');
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setCustomerNotes(
      job.notes || 'Recommended regular maintenance every 6 months to ensure optimal performance. All debris cleared from unit.'
    );
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Toggle checklist item with jobs state sync
  const toggleChecklistItem = (itemId) => {
    if (!selectedJob) return;
    const updatedChecklist = selectedJob.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedJob = { ...selectedJob, checklist: updatedChecklist };
    setSelectedJob(updatedJob);
    setJobs(prevJobs => prevJobs.map(j => j.id === selectedJob.id ? updatedJob : j));
  };

  // Upload Photo simulation with jobs state sync
  const handleAddPhoto = () => {
    if (!selectedJob) return;
    const samplePhotos = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80'
    ];
    const newPic = samplePhotos[selectedJob.photos.length % samplePhotos.length];
    const updatedJob = { ...selectedJob, photos: [...selectedJob.photos, newPic] };
    setSelectedJob(updatedJob);
    setJobs(prevJobs => prevJobs.map(j => j.id === selectedJob.id ? updatedJob : j));
    showToast('Photo documentation uploaded successfully!', 'success');
  };

  const handleRemovePhoto = (idx) => {
    if (!selectedJob) return;
    const updated = selectedJob.photos.filter((_, i) => i !== idx);
    const updatedJob = { ...selectedJob, photos: updated };
    setSelectedJob(updatedJob);
    setJobs(prevJobs => prevJobs.map(j => j.id === selectedJob.id ? updatedJob : j));
  };

  // Open Invoice Generation screen
  const openGenerateInvoiceScreen = () => {
    if (!selectedJob) return;
    setIsTimerRunning(false);
    // Sync current customer notes into selectedJob and jobs
    const updatedJob = { ...selectedJob, notes: customerNotes };
    setSelectedJob(updatedJob);
    setJobs(prevJobs => prevJobs.map(j => j.id === selectedJob.id ? updatedJob : j));

    let partsToSet = selectedJob.parts || [];
    // Ensure verified travel line item is present if travel distance was logged
    if (selectedJob.travelDistanceKm && !partsToSet.some(p => p.isTravel || String(p.description || '').toLowerCase().includes('travel'))) {
      const travelRate = selectedJob.travelRatePerKm || 10;
      const travelPart = {
        id: `travel-${Date.now()}`,
        description: `Travel & Distance Charge (${selectedJob.travelDistanceKm} km @ ₹${travelRate}/km)`,
        qty: selectedJob.travelDistanceKm,
        price: travelRate,
        locked: false,
        isTravel: true
      };
      partsToSet = [...partsToSet, travelPart];
    }

    setInvoiceParts(partsToSet);
    setActiveTab('invoice');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Component Selection via Dropdown (immutably update state)
  const handleSelectComponentDropdown = (idx, selectedName) => {
    const foundComponent = AVAILABLE_COMPONENTS.find(c => c.name === selectedName);
    setInvoiceParts(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        description: selectedName,
        price: foundComponent ? foundComponent.defaultPrice : updated[idx].price
      };
      return updated;
    });
  };

  // Quantity or Price change (immutably update state)
  const handlePartChange = (idx, field, value) => {
    setInvoiceParts(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        [field]: value
      };
      return updated;
    });
  };

  // Add Row button adding a default component from dropdown catalog
  const handleAddPartRow = () => {
    const defaultComp = AVAILABLE_COMPONENTS[1] || AVAILABLE_COMPONENTS[0];
    const newPart = {
      id: Date.now(),
      description: defaultComp.name,
      qty: 1,
      price: defaultComp.defaultPrice,
      locked: false,
    };
    setInvoiceParts(prev => [...prev, newPart]);
    showToast('New component line item added to invoice', 'info');
  };

  const handleRemovePartRow = (idx) => {
    setInvoiceParts(prev => prev.filter((_, i) => i !== idx));
  };

  // Invoice Totals Calculation in Rupees ₹ (safely handle clamp & tax)
  const subtotal = invoiceParts.reduce((acc, part) => {
    const q = parseFloat(part.qty) || 0;
    const p = parseFloat(part.price) || 0;
    return acc + q * p;
  }, 0);

  const numDiscount = Math.min(subtotal, Math.max(0, parseFloat(invoiceDiscount) || 0));
  const taxableAmount = Math.max(0, subtotal - numDiscount);
  const taxAmount = taxableAmount * 0.05; // 5% GST
  const grandTotal = taxableAmount + taxAmount;

  // Open Preview Modal
  const handleOpenPreviewModal = () => {
    if (!selectedJob) return;
    const data = {
      invoiceId: `MM-INV-2026-${selectedJob.id.replace('WO-', '')}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customerName: selectedJob.customerName,
      customerPhone: selectedJob.customerPhone,
      address: selectedJob.serviceAddress,
      serviceTitle: selectedJob.serviceTitle,
      technician: vendorProfile.name,
      parts: invoiceParts,
      subtotal: subtotal,
      discount: numDiscount,
      tax: taxAmount,
      total: grandTotal,
      paymentMethod: paymentMethod === 'upi' ? `Direct UPI (${vendorProfile.upiId})` : paymentMethod === 'cash' ? 'Direct Cash Transfer' : 'Online Gateway',
      notes: customerNotes,
      status: 'PAID IN FULL',
      travelDistanceKm: selectedJob.travelDistanceKm || 0,
      travelRatePerKm: selectedJob.travelRatePerKm || 10,
      travelCharges: selectedJob.travelCharges || 0,
      mapScreenshot: selectedJob.mapScreenshot || null,
    };
    setModalReturnTab('invoice');
    setGeneratedInvoiceData(data);
    setShowTaxInvoiceModal(true);
  };

  // Finalize & Send Invoice -> Complete Service & Move to History!
  const handleGenerateAndSendInvoice = async () => {
    if (!selectedJob) return;

    if (paymentMethod === 'online_gateway') {
      showToast('Online Payment Gateway is in progress & under development. Please choose UPI or Cash.', 'warning');
      return;
    }

    const paymentLabel = paymentMethod === 'upi' ? `Direct UPI Transfer (${vendorProfile.upiId})` : 'Direct Cash Transfer';

    const invoiceDataObj = {
      invoiceId: `MM-INV-2026-${selectedJob.id.replace('WO-', '')}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customerName: selectedJob.customerName,
      customerPhone: selectedJob.customerPhone,
      address: selectedJob.serviceAddress,
      serviceTitle: selectedJob.serviceTitle,
      technician: vendorProfile.name,
      parts: invoiceParts,
      subtotal: subtotal,
      discount: numDiscount,
      tax: taxAmount,
      total: grandTotal,
      paymentMethod: paymentLabel,
      notes: customerNotes,
      status: 'PAID IN FULL',
      travelDistanceKm: selectedJob.travelDistanceKm || 0,
      travelRatePerKm: selectedJob.travelRatePerKm || 10,
      travelCharges: selectedJob.travelCharges || 0,
      mapScreenshot: selectedJob.mapScreenshot || null,
    };

    // Calculate Financials according to exact business rules:
    // 1. Service Charges: vendor receives 50% payout
    // 2. Component Charges: excluded from vendor payout (0% vendor share)
    // 3. Fuel Charges Payout: automatically calculated for all travel KM and added to vendor payout
    const jobFinancials = calculateJobFinancials({
      invoiceData: { parts: invoiceParts },
      travelDistanceKm: selectedJob.travelDistanceKm || 0,
      travelRatePerKm: selectedJob.travelRatePerKm || 10,
      travelCharges: selectedJob.travelCharges || 0,
      mapScreenshot: selectedJob.mapScreenshot || null,
      amount: grandTotal
    });

    const vendorPayoutAmount = jobFinancials.totalVendorPayout;

    // Move job to History state with complete itemized financials
    const completedHistoryItem = {
      id: selectedJob.id,
      displayId: selectedJob.displayId || selectedJob.id,
      appliance: selectedJob.appliance,
      serviceTitle: selectedJob.serviceTitle,
      customerName: selectedJob.customerName,
      customerPhone: selectedJob.customerPhone,
      date: 'Just now',
      rawDate: new Date(),
      location: selectedJob.location,
      serviceAddress: selectedJob.serviceAddress,
      amount: grandTotal,
      rating: 5,
      status: 'Completed',
      serviceCharges: jobFinancials.serviceCharges,
      servicePayout: jobFinancials.servicePayout,
      componentCharges: jobFinancials.componentCharges,
      travelDistanceKm: jobFinancials.distanceKm,
      travelRatePerKm: jobFinancials.ratePerKm,
      travelCharges: jobFinancials.fuelPayout,
      fuelPayout: jobFinancials.fuelPayout,
      totalVendorPayout: jobFinancials.totalVendorPayout,
      review: `Service completed. ${paymentLabel} of ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} received. Vendor Share (50% Service: ₹${jobFinancials.servicePayout.toFixed(2)} + Fuel: ₹${jobFinancials.fuelPayout.toFixed(2)}): ₹${vendorPayoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} added to wallet. Components (₹${jobFinancials.componentCharges.toFixed(2)}) excluded.`,
      mapScreenshot: selectedJob.mapScreenshot || null,
      travelVerified: Boolean(selectedJob.travelVerified || selectedJob.mapScreenshot),
      invoiceData: invoiceDataObj
    };

    setHistory(prev => [completedHistoryItem, ...prev]);
    setJobs(prev => prev.filter(j => j.id !== selectedJob.id));

    setModalReturnTab('active');
    setGeneratedInvoiceData(invoiceDataObj);
    setShowTaxInvoiceModal(true);
    showToast(`Service Completed! Invoice ${invoiceDataObj.invoiceId} generated. ₹${vendorPayoutAmount.toFixed(2)} added to your payout balance.`, 'success');

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') : null);
    if (authToken && selectedJob?.id) {
      try {
        await updateBookingStatusApi(
          selectedJob.id,
          {
            status: 'Completed',
            serviceCharge: grandTotal,
            paymentMethod: paymentLabel,
            paymentStatus: 'Paid',
          },
          authToken
        );
      } catch (err) {
        console.error('[Vendor Dashboard] Error completing job in backend:', err);
      }
    }
  };

  // Close modal & return to modalReturnTab (active, history, etc.)
  const handleCloseInvoiceModal = () => {
    setShowTaxInvoiceModal(false);
    if (modalReturnTab !== 'history') {
      setSelectedJob(null);
    }
    setActiveTab(modalReturnTab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // View past invoice from history list
  const handleViewHistoryInvoice = (item) => {
    const invData = item.invoiceData || {
      invoiceId: `MM-INV-2026-${item.id.replace('WO-', '')}`,
      date: item.date,
      customerName: item.customerName,
      customerPhone: '+91 98765 43210',
      address: item.location,
      serviceTitle: item.serviceTitle,
      technician: vendorProfile.name,
      parts: [{ description: item.serviceTitle, qty: 1, price: item.amount }],
      subtotal: parseFloat(item.amount) || 0,
      discount: 0,
      tax: 0,
      total: parseFloat(item.amount) || 0,
      paymentMethod: 'Direct UPI / Cash',
      status: 'PAID IN FULL'
    };
    setModalReturnTab('history');
    setGeneratedInvoiceData(invData);
    setShowTaxInvoiceModal(true);
  };

  // SAME TAB PRINT & SAVE PDF (NO NEW CHROME WINDOWS / NO NEW TABS)
  const handleSameTabPrintOrSavePDF = () => {
    if (!generatedInvoiceData) return;
    const originalTitle = document.title;
    document.title = `${generatedInvoiceData.invoiceId}.pdf`;
    
    // Trigger same-tab native print/save-as-pdf
    window.print();
    
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const pendingJobsCount = jobs.filter(j => j.status === 'New Request').length;

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Print Stylesheet for SAME TAB printing without blank pages */}
      <style>{`
        @media print {
          /* Hide all non-invoice web elements */
          nav, footer, header, .no-print-bg, .no-print {
            display: none !important;
          }

          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }

          /* Transform modal backdrop into static full page document */
          .tax-invoice-modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }

          #invoice-vendor-print-card {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          #invoice-document-body {
            padding: 10px !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      <div className="no-print-bg" style={{ position: 'relative', zIndex: 9999 }}>
        <Navbar />
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pb-16" style={{ marginTop: '120px' }}>

        {/* ── TOP BANNER / HEADER BAR (Only visible on main tabs) ── */}
        {activeTab !== 'service' && activeTab !== 'invoice' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 sm:p-6 mb-6 transition-all duration-300 no-print-bg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              
              {/* Left: Title & Tabs */}
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-lg sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
                    Vendor Dashboard
                  </h1>
                  
                  {/* Live Pulse Badge */}
                  <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold shrink-0 ${
                    isOnline 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      {isOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </span>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </div>
                </div>

                {/* Navigation Tabs - scrollable on mobile */}
                <div
                  className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto pb-0.5"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                  {[
                    { id: 'active', label: 'Jobs', badge: jobs.length },
                    { id: 'history', label: 'History', badge: history.length },
                    { id: 'earnings', label: 'Earnings', badge: `₹${((Number(todayEarnings) || 0) / 1000).toFixed(1)}k` },
                    { id: 'profile', label: 'Profile', badge: '★' },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`relative flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-0.5 sm:gap-1.5 ${
                          isActive
                            ? 'bg-[#061e38] text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full leading-none ${
                            isActive
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Duty Switcher */}
              <div className="flex items-center gap-2 sm:gap-3 self-start md:self-center shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-500">
                  <Power className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Duty Status</span>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-full border border-slate-200 shadow-inner">
                  <button
                    onClick={handleToggleOnline}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                      isOnline
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse"></span>
                    Online
                  </button>
                  <button
                    onClick={handleToggleOnline}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                      !isOnline
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Go Offline
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── NABL VERIFIED BANNER ── */}
        {activeTab !== 'service' && activeTab !== 'invoice' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#dbeafe] via-[#eff6ff] to-[#e0e7ff] border border-blue-200/90 rounded-2xl p-3.5 sm:p-5 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 no-print-bg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#092543] text-blue-300 flex items-center justify-center shadow-md shrink-0 ring-2 sm:ring-4 ring-blue-100">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="text-sm sm:text-lg font-extrabold text-[#08223e]">
                    NABL Verified Professional
                  </h3>
                  <span className="bg-[#092543] text-orange-400 text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    ISO Certified
                  </span>
                </div>
                <p className="text-[11px] sm:text-sm text-slate-600 font-medium mt-0.5 leading-snug">
                  Your certification is active and visible to all customers on Magic Mistry.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-center w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-white/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-blue-200/60 shadow-xs truncate max-w-[130px] sm:max-w-none">
                ID: {vendorProfile.nablId}
              </span>
              <button 
                onClick={() => handleTabChange('profile')}
                className="text-[10px] sm:text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-blue-300 shadow-xs hover:shadow transition-all shrink-0"
              >
                View Badge &rarr;
              </button>
            </div>
          </motion.div>
        )}


        {/* ── TAB 1: ACTIVE JOBS (MAIN QUEUE) ── */}
        {activeTab === 'active' && (
          <div className="space-y-6 no-print-bg">

            {/* TOP STATS & VENDOR MINI PROFILE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">

              {/* 3 METRIC CARDS */}
              <div className="lg:col-span-8 grid grid-cols-3 gap-2 sm:gap-6">
                
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-2.5 sm:p-5 shadow-sm flex flex-col justify-between min-w-0"
                >
                  <div className="flex items-start justify-between mb-1 sm:mb-2 gap-0.5">
                    <span className="text-[8px] sm:text-xs font-extrabold text-slate-400 tracking-wider uppercase leading-tight">EARN.</span>
                    <span className="hidden sm:inline text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      ↗ 12%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-0.5 sm:mt-1">
                    <span className="text-sm sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">₹{(todayEarnings/1000).toFixed(1)}k</span>
                  </div>
                  <p className="hidden sm:block text-[11px] text-slate-500 font-medium mt-2">Active service payout count</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-2.5 sm:p-5 shadow-sm flex flex-col justify-between min-w-0"
                >
                  <div className="flex items-start justify-between mb-1 sm:mb-2 gap-0.5">
                    <span className="text-[8px] sm:text-xs font-extrabold text-slate-400 tracking-wider uppercase leading-tight">PENDING</span>
                    {pendingJobsCount > 0 && (
                      <span className="hidden sm:inline text-[11px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 shrink-0">Action!</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                    <span className="text-sm sm:text-3xl font-extrabold text-orange-600 tracking-tight">{pendingJobsCount}</span>
                    <span className="hidden sm:inline text-xs font-bold text-slate-500">Jobs</span>
                  </div>
                  <p className="hidden sm:block text-[11px] text-slate-500 font-medium mt-2">Respond within 15 mins</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-[#061e38] text-white rounded-xl sm:rounded-2xl border border-slate-800 p-2.5 sm:p-5 shadow-sm flex flex-col justify-between min-w-0"
                >
                  <div className="flex items-start justify-between mb-1 sm:mb-2 gap-0.5">
                    <span className="text-[8px] sm:text-xs font-extrabold text-slate-300 tracking-wider uppercase leading-tight">RATING</span>
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 shrink-0" />
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-0.5 sm:mt-1">
                    <span className="text-sm sm:text-3xl font-extrabold text-white tracking-tight">{rating}</span>
                    <span className="text-amber-400 text-xs sm:text-lg">★</span>
                  </div>
                  <p className="hidden sm:block text-[11px] text-slate-300 font-medium mt-2">Based on {totalJobsDone} reviews</p>
                </motion.div>

              </div>

              {/* VENDOR MINI PROFILE */}
              <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
                <img
                  src={vendorProfile.profileImage}
                  alt={vendorProfile.name}
                  className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover ring-2 ring-blue-100 shadow-md shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">{vendorProfile.name}</h3>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">ID: {vendorProfile.vendorId}</p>
                  <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 flex-wrap">
                    <span className="text-amber-500 text-[11px] sm:text-xs font-extrabold flex items-center">★ {rating}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600">({totalJobsDone} jobs)</span>
                  </div>
                </div>
              </div>

            </div>


            {/* MAIN CONTENT ROW (LEFT: ACTIVE QUEUE, RIGHT: WEEKLY EARNINGS CHART) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

              {/* LEFT COLUMN: ACTIVE JOB QUEUE */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Job Queue</h2>
                    <p className="text-xs text-slate-500 font-medium">Real-time customer work orders assigned to your area</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      {ALL_APPLIANCES.map((app) => (
                        <option key={app} value={app}>
                          {app}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Job Cards */}
                <div className="space-y-4">
                  {jobs.filter(j => filterCategory === 'All' || (j.appliance && String(j.appliance).includes(filterCategory))).length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-60" />
                      <h3 className="text-base font-bold text-slate-800">All work orders clear!</h3>
                      <p className="text-xs text-slate-500 mt-1">Stay online to receive incoming customer service calls.</p>
                    </div>
                  ) : (
                    jobs
                      .filter(j => filterCategory === 'All' || (j.appliance && String(j.appliance).includes(filterCategory)))
                      .map((job) => {
                        const isNew = job.status === 'New Request';
                        const isInProgress = job.status === 'In Progress';

                        return (
                          <motion.div
                            key={job.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 relative overflow-hidden ${
                              isNew
                                ? 'border-l-4 border-l-orange-500 border-slate-200 bg-white hover:shadow-md'
                                : isInProgress
                                ? 'border-l-4 border-l-[#061e38] border-blue-200 bg-blue-50/20 shadow-xs'
                                : job.status === 'Accepted'
                                ? 'border-l-4 border-l-emerald-500 border-emerald-200 bg-emerald-50/20 shadow-xs'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              
                              <div className="flex items-start gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                                  {job.applianceIcon}
                                </div>

                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                      {job.displayId || job.id}
                                    </span>
                                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                      isNew ? 'bg-orange-100 text-orange-700' : 
                                      job.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                                      'bg-[#061e38] text-white'
                                    }`}>
                                      {job.status}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      {job.appointmentDate || '—'}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      {job.timeSlot}
                                    </span>
                                  </div>

                                  <h3 className="text-lg font-extrabold text-slate-900">{job.serviceTitle}</h3>
                                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                                    <strong>Issue:</strong> {job.issue}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-700">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3.5 h-3.5 text-blue-500" />
                                      {job.customerName}
                                    </span>
                                    {job.customerPhone && job.customerPhone !== '—' && (
                                      <a
                                        href={`tel:${job.customerPhone}`}
                                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 underline"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                        {job.customerPhone}
                                      </a>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                      {job.location}
                                    </span>
                                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      🚘 {job.distance}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:items-end shrink-0 w-full sm:w-auto">
                                <div className="flex sm:flex-col items-center sm:items-end justify-between">
                                  <div>
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Est. Payout</span>
                                    <span className="text-lg font-extrabold text-slate-900">₹{(job.estimatedPay ?? 0).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  {isNew ? (
                                    <>
                                      <button
                                        onClick={() => handleAcceptJob(job.id)}
                                        className="flex-1 sm:flex-none px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl shadow-sm cursor-pointer"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleRejectJob(job.id)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-extrabold rounded-xl cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : job.status === 'Accepted' ? (
                                    <>
                                      <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(job.serviceAddress)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                                      >
                                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                                        Navigate
                                      </a>
                                      <button
                                        onClick={() => handleStartService(job)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-white" />
                                        Start Service
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => openServiceExecution(job)}
                                      className="w-full sm:w-auto px-5 py-2.5 bg-[#061e38] hover:bg-[#0a2f57] text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      Resume Execution &rarr;
                                    </button>
                                  )}
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        );
                      })
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: WEEKLY EARNINGS */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-extrabold text-slate-900">Weekly Earnings</h3>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">This Week</span>
                    </div>

                    <div className="relative pt-6 pb-2">
                      <div className="absolute left-[54%] top-0 -translate-x-1/2 bg-[#061e38] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md">
                        ₹{(todayEarnings / 1000).toFixed(1)}k
                      </div>

                      <div className="h-36 flex items-end justify-between gap-2 px-2 border-b border-slate-100 pb-2">
                        {weeklyEarningsData.map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <div className="w-full bg-slate-100 rounded-t-lg h-28 relative flex items-end overflow-hidden">
                              <div
                                style={{ height: item.height }}
                                className={`w-full rounded-t-lg transition-all duration-300 ${
                                  item.active ? 'bg-[#061e38]' : 'bg-slate-300 group-hover:bg-orange-500'
                                }`}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-400">{item.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-xs font-bold text-slate-500 uppercase">Total Estimation</span>
                      <span className="text-xl font-extrabold text-[#061e38]">₹{todayEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('earnings')}
                    className="w-full mt-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    View Earnings Report &rarr;
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}


        {/* ── SERVICE EXECUTION PAGE ── */}
        {activeTab === 'service' && selectedJob && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 no-print-bg"
          >
            {/* Top Breadcrumb & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <button onClick={() => setActiveTab('active')} className="hover:text-slate-800 transition-colors">Work Orders</button>
                  <span>›</span>
                  <span className="text-slate-700">#{selectedJob.id}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {selectedJob.serviceTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Client: <strong>{selectedJob.customerName}</strong> • {selectedJob.serviceAddress}
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  ARRIVED AT LOCATION
                </span>
                <button
                  onClick={() => setActiveTab('active')}
                  className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl"
                >
                  Back to Queue
                </button>
              </div>
            </div>

            {/* Service Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

              {/* Left Column (8 Cols): Timer, Checklist, Customer Notes */}
              <div className="lg:col-span-8 space-y-6">

                {/* 1. SERVICE DURATION TIMER CARD */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                      SERVICE DURATION
                    </span>
                    <span className="text-4xl sm:text-5xl font-mono font-extrabold text-slate-900 tracking-wider">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        if (!selectedJob?.travelVerified && !isTimerRunning) {
                          handlePromptStartService(selectedJob);
                        } else {
                          setIsTimerRunning(prev => !prev);
                        }
                      }}
                      className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isTimerRunning
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      {isTimerRunning ? 'Pause Diagnostic Timer' : 'Start Service'}
                    </button>

                    <button
                      onClick={openGenerateInvoiceScreen}
                      className="w-full sm:w-auto px-6 py-3 bg-[#061e38] hover:bg-[#0a2f57] text-white rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-orange-400" />
                      Finish & Generate Invoice &rarr;
                    </button>
                  </div>
                </div>

                {/* VERIFIED TRAVEL ROUTE CARD IN SERVICE VIEW */}
                {(selectedJob.travelDistanceKm > 0 || selectedJob.mapScreenshot) && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                        <Navigation className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Verified Travel Distance: {selectedJob.travelDistanceKm || 0} KM
                          </h4>
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            Map Logged ✓
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Origin: <strong>{vendorProfile.address || 'Vendor Workshop'}</strong> ➔ Destination: <strong>{selectedJob.serviceAddress}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {selectedJob.mapScreenshot && (
                        <button
                          type="button"
                          onClick={() => setProofPreviewItem({
                            imageUrl: selectedJob.mapScreenshot,
                            title: `Route Map: ${selectedJob.displayId || selectedJob.id}`,
                            subtitle: `${selectedJob.travelDistanceKm || 0} KM Traveled to ${selectedJob.customerName}`
                          })}
                          className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Map Proof
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePromptStartService(selectedJob)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        Edit KM
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. SERVICE CHECKLIST CARD */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Service Checklist</h3>
                    <span className="text-xs font-extrabold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      {selectedJob.checklist.filter(c => c.completed).length} / {selectedJob.checklist.length} Completed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedJob.checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                          item.completed
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold ${
                          item.completed ? 'bg-emerald-600' : 'border-2 border-slate-300 bg-white'
                        }`}>
                          {item.completed && '✓'}
                        </div>
                        <div>
                          <h4 className={`text-sm font-extrabold ${item.completed ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. CUSTOMER NOTES */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <h3 className="text-base font-extrabold text-slate-900">Customer Notes</h3>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Enter specific repair details, customer concerns, or future recommendations..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl p-3.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

              </div>

              {/* Right Column (4 Cols): Photo Documentation & Appointment Details */}
              <div className="lg:col-span-4 space-y-6">

                {/* DOCUMENTATION */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-slate-700" />
                      <h3 className="text-base font-extrabold text-slate-900">Documentation</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{selectedJob.photos.length} Attached</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={handleAddPhoto}
                      className="h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-colors"
                    >
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">BEFORE</span>
                    </div>

                    <div 
                      onClick={handleAddPhoto}
                      className="h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-colors"
                    >
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">AFTER</span>
                    </div>
                  </div>

                  {selectedJob.photos.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-2">
                      {selectedJob.photos.map((pic, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          <img src={pic} alt="Documentation" className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[9px]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddPhoto}
                        className="w-16 h-16 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xl font-bold shrink-0"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* APPOINTMENT DETAILS CARD */}
                <div className="bg-[#061e38] text-white rounded-2xl p-5 shadow-md space-y-4">
                  <h3 className="text-base font-extrabold text-white border-b border-slate-700/60 pb-2.5">
                    Appointment Details
                  </h3>

                  <div className="space-y-3 text-xs text-slate-200 font-medium">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{selectedJob.appointmentDate}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{selectedJob.timeSlot}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{selectedJob.customerName} (Residential)</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                      <Link to={`tel:${selectedJob.customerPhone}`} className="hover:underline text-white font-bold">
                        {selectedJob.customerPhone}
                      </Link>
                    </div>
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedJob.serviceAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 block text-center"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    View on Map
                  </a>
                </div>

              </div>

            </div>
          </motion.div>
        )}


        {/* ── GENERATE INVOICE PAGE ── */}
        {activeTab === 'invoice' && selectedJob && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 no-print-bg"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Generate Invoice
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Creating official invoice for Work Order #{selectedJob.id}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('service')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  ← Back to Checklist
                </button>
                <button
                  onClick={handleOpenPreviewModal}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-400" />
                  Preview Tax Invoice Modal
                </button>
              </div>
            </div>

            {/* Main Invoice Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

              {/* Left Column (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">

                {/* 1. SERVICE SUMMARY CARD */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileText className="w-4 h-4 text-slate-700" />
                    <h3 className="text-base font-extrabold text-slate-900">Service Summary</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Customer Name</label>
                      <input
                        type="text"
                        readOnly
                        value={selectedJob.customerName}
                        className="w-full text-xs font-bold bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Address</label>
                      <input
                        type="text"
                        readOnly
                        value={selectedJob.serviceAddress}
                        className="w-full text-xs font-bold bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Appliance Type</label>
                      <input
                        type="text"
                        readOnly
                        value={`${selectedJob.applianceIcon} ${selectedJob.serviceTitle}`}
                        className="w-full text-xs font-bold bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Date</label>
                      <input
                        type="text"
                        readOnly
                        value={selectedJob.appointmentDate}
                        className="w-full text-xs font-bold bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PARTS & LABOR SECTION WITH COMPONENT SELECTION DROPDOWN */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-slate-700" />
                        <h3 className="text-base font-extrabold text-slate-900">Parts & Labor Components</h3>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Select repair components from dropdown menu & adjust quantity/amount</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedJob.travelDistanceKm && !invoiceParts.some(p => p.isTravel || String(p.description || '').toLowerCase().includes('travel')) && (
                        <button
                          type="button"
                          onClick={() => {
                            const travelRate = selectedJob.travelRatePerKm || 10;
                            const travelPart = {
                              id: `travel-${Date.now()}`,
                              description: `Travel & Distance Charge (${selectedJob.travelDistanceKm} km @ ₹${travelRate}/km)`,
                              qty: selectedJob.travelDistanceKm,
                              price: travelRate,
                              locked: false,
                              isTravel: true
                            };
                            setInvoiceParts(prev => [...prev, travelPart]);
                            showToast(`Added ${selectedJob.travelDistanceKm} KM travel charge to invoice`, 'success');
                          }}
                          className="text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-emerald-200"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                          + Add Travel ({selectedJob.travelDistanceKm} KM)
                        </button>
                      )}

                      <button
                        onClick={handleAddPartRow}
                        className="text-xs font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-blue-200"
                      >
                        <PlusCircle className="w-4 h-4 text-blue-700" />
                        Add Component Row
                      </button>
                    </div>
                  </div>

                  {/* Parts Table */}
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-left text-xs" style={{minWidth:'540px'}}>
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-600 font-extrabold uppercase tracking-wider">
                          <th className="p-3 rounded-l-xl">Select Component</th>
                          <th className="p-3 text-center w-24">Qty</th>
                          <th className="p-3 text-right w-28">Unit Price (₹)</th>
                          <th className="p-3 text-right w-32">Total Amount</th>
                          <th className="p-3 text-center w-12 rounded-r-xl"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {invoiceParts.map((part, idx) => {
                          const lineTotal = (parseFloat(part.qty) || 0) * (parseFloat(part.price) || 0);
                          return (
                            <tr key={part.id || idx} className="hover:bg-slate-50/50">
                              <td className="p-3">
                                {part.locked ? (
                                  <span className="font-extrabold text-slate-800 block py-1.5">{part.description}</span>
                                ) : (
                                  <select
                                    value={part.description}
                                    onChange={(e) => handleSelectComponentDropdown(idx, e.target.value)}
                                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                  >
                                    {AVAILABLE_COMPONENTS.map((comp, cIdx) => (
                                      <option key={cIdx} value={comp.name}>
                                        {comp.name} (₹{comp.defaultPrice})
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>

                              <td className="p-3 text-center">
                                {part.locked ? (
                                  <span className="font-extrabold text-slate-800">{part.qty}</span>
                                ) : (
                                  <input
                                    type="number"
                                    min="1"
                                    step="0.5"
                                    value={part.qty}
                                    onChange={(e) => handlePartChange(idx, 'qty', e.target.value)}
                                    className="w-16 text-center text-xs font-bold bg-white border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-orange-500"
                                  />
                                )}
                              </td>

                              <td className="p-3 text-right">
                                {part.locked ? (
                                  <span className="font-bold text-slate-800">₹{parseFloat(part.price).toFixed(2)}</span>
                                ) : (
                                  <input
                                    type="number"
                                    value={part.price}
                                    onChange={(e) => handlePartChange(idx, 'price', e.target.value)}
                                    className="w-20 text-right text-xs font-bold bg-white border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-orange-500"
                                  />
                                )}
                              </td>

                              <td className="p-3 text-right font-extrabold text-slate-900 text-sm">
                                ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>

                              <td className="p-3 text-center">
                                {part.locked ? (
                                  <Lock className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                                ) : (
                                  <button
                                    onClick={() => handleRemovePartRow(idx)}
                                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                    title="Remove component"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. PAYMENT METHOD (UPI, CASH & ONLINE GATEWAY IN-PROGRESS STATUS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                  {/* Payment Method Selector */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                      PAYMENT METHOD TO VENDOR
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Option 1: Direct UPI Transfer */}
                      <div
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          paymentMethod === 'upi'
                            ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-200 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === 'upi' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}>
                          {paymentMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-blue-700" />
                            <p className="text-xs font-extrabold text-slate-900">Direct UPI Transfer to Vendor</p>
                          </div>
                          <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm or BHIM scan & pay</p>
                          {paymentMethod === 'upi' && (
                            <div className="mt-2 p-2.5 bg-white rounded-xl border border-blue-200 text-[11px] text-blue-900 font-bold space-y-1">
                              <p className="flex items-center gap-1">
                                <QrCode className="w-3.5 h-3.5 text-blue-700" />
                                Vendor UPI ID: <span className="font-extrabold text-slate-900 bg-blue-50 px-1.5 py-0.5 rounded">{vendorProfile.upiId}</span>
                              </p>
                              <p className="text-[10px] text-slate-500 font-normal">Customer scans QR or transfers directly to technician</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Option 2: Cash Transfer on site */}
                      <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          paymentMethod === 'cash'
                            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === 'cash' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                        }`}>
                          {paymentMethod === 'cash' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <IndianRupee className="w-4 h-4 text-emerald-700" />
                            <p className="text-xs font-extrabold text-slate-900">Direct Cash / Hand Transfer</p>
                          </div>
                          <p className="text-[11px] text-slate-500">Cash collected in-hand directly from customer on-site</p>
                        </div>
                      </div>

                      {/* Option 3: Online Payment Gateway (In Progress) */}
                      <div
                        onClick={() => setPaymentMethod('online_gateway')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          paymentMethod === 'online_gateway'
                            ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-200 shadow-sm'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === 'online_gateway' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                        }`}>
                          {paymentMethod === 'online_gateway' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div className="space-y-1 w-full">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-amber-700" />
                              <p className="text-xs font-extrabold text-slate-900">Online Payment Gateway</p>
                            </div>
                            <span className="text-[10px] font-extrabold bg-[#061e38] text-amber-400 px-2 py-0.5 rounded-full border border-amber-300">
                              In Progress
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">Integrated Credit/Debit Card & Netbanking Gateway</p>
                          
                          {paymentMethod === 'online_gateway' && (
                            <div className="mt-2 p-2.5 bg-amber-100/70 rounded-xl border border-amber-300 text-[11px] text-amber-900 font-bold space-y-1">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                                <span>Gateway Integration In Progress</span>
                              </div>
                              <p className="text-[10px] font-medium text-amber-800 leading-relaxed">
                                Online Payment Gateway is currently under development & in progress. Please accept payment via <strong>Direct UPI Transfer</strong> or <strong>Cash on-site</strong>.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Notes for Customer */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">NOTES FOR CUSTOMER</h4>
                    <textarea
                      rows={5}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    />
                  </div>

                </div>

              </div>

              {/* Right Column (4 Cols): Invoice Totals Panel */}
              <div className="lg:col-span-4 space-y-6">

                {/* INVOICE TOTALS CARD */}
                <div className="bg-[#061e38] text-white rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="text-xl font-extrabold text-white tracking-tight border-b border-slate-700/60 pb-3">
                    Invoice Totals
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span className="font-bold text-white">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 gap-2">
                      <span>Discount</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={invoiceDiscount}
                          onChange={(e) => setInvoiceDiscount(e.target.value)}
                          className="w-20 text-right bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs font-bold text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Tax (GST 5%)</span>
                      <span className="font-bold text-white">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="pt-4 border-t border-slate-700 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">TOTAL AMOUNT</span>
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                          ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAndSendInvoice}
                    className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4 fill-white" />
                    ➤ Generate &amp; Complete Service
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    Payment Mode: <strong>{paymentMethod === 'upi' ? 'Direct UPI Transfer' : paymentMethod === 'cash' ? 'Direct Cash' : 'Online Gateway (In Progress)'}</strong>
                  </p>
                </div>

                {/* VERIFIED TRAVEL ROUTE CARD */}
                {(selectedJob.travelDistanceKm > 0 || selectedJob.mapScreenshot) && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">
                          Verified Travel Route
                        </h4>
                      </div>
                      <span className="text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                        {selectedJob.travelDistanceKm || 0} KM
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                      <p className="truncate"><strong>Origin:</strong> {vendorProfile.address || 'Vendor Hub'}</p>
                      <p className="truncate"><strong>Customer:</strong> {selectedJob.serviceAddress}</p>
                      <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 font-semibold text-[11px] flex items-center justify-between">
                        <span>Travel Charge ({selectedJob.travelDistanceKm || 0} km @ ₹{selectedJob.travelRatePerKm || 10}/km):</span>
                        <strong className="text-xs text-blue-950">
                          ₹{((selectedJob.travelDistanceKm || 0) * (selectedJob.travelRatePerKm || 10)).toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    {selectedJob.mapScreenshot && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-900">
                        <img
                          src={selectedJob.mapScreenshot}
                          alt="Route Screenshot"
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setProofPreviewItem({
                            imageUrl: selectedJob.mapScreenshot,
                            title: `Route Screenshot: ${selectedJob.displayId || selectedJob.id}`,
                            subtitle: `${selectedJob.travelDistanceKm || 0} KM Traveled to ${selectedJob.customerName}`
                          })}
                          className="absolute inset-0 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center gap-1.5 text-xs font-extrabold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Map Screenshot
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Vendor Settlement Info Box */}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Direct Vendor Settlement</h4>
                    <p className="text-[10px] text-slate-500">Payment goes directly to vendor via UPI or Cash without online gateway fees.</p>
                  </div>
                </div>

                {/* Technician Footer Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                  <img
                    src={vendorProfile.profileImage}
                    alt={vendorProfile.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{vendorProfile.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">★ 4.9 • {vendorProfile.title}</p>
                    <p className="text-[10px] text-blue-700 font-extrabold">{vendorProfile.upiId}</p>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}


        {/* ── TAB 2: HISTORY ── */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6 no-print-bg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Job History & Ratings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Completed repair assignments, invoices, and customer feedback</p>
              </div>
            </div>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-60" />
                  <h3 className="text-base font-bold text-slate-800">No completed jobs yet</h3>
                  <p className="text-xs text-slate-500 mt-1">Completed repair assignments, invoices, and customer feedback will appear here.</p>
                </div>
              ) : (
                history.map((item) => {
                  const itemFin = calculateJobFinancials(item);
                  return (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col gap-3 bg-white hover:border-blue-300 transition-all shadow-xs">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{item.displayId || item.id}</span>
                          <span className="text-xs text-slate-400">{item.date}</span>
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{item.status}</span>
                          {itemFin.distanceKm > 0 && (
                            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Navigation className="w-3 h-3 text-blue-600" />
                              {itemFin.distanceKm} KM Traveled
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900">{item.serviceTitle}</h3>
                        <p className="text-xs text-slate-600">Customer: <strong>{item.customerName}</strong> • {item.location || item.serviceAddress}</p>
                        
                        {/* Financial Payout Transparency Chips */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-extrabold">
                            Vendor Payout: ₹{itemFin.totalVendorPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-semibold text-[11px]">
                            50% Service: ₹{itemFin.servicePayout.toFixed(2)}
                          </span>
                          {itemFin.fuelPayout > 0 && (
                            <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded-lg font-semibold text-[11px] flex items-center gap-1">
                              <Fuel className="w-3 h-3 text-orange-600" />
                              Fuel: ₹{itemFin.fuelPayout.toFixed(2)} ({itemFin.distanceKm} KM)
                            </span>
                          )}
                          {itemFin.componentCharges > 0 && (
                            <span className="bg-slate-50 text-slate-400 px-2 py-1 rounded-lg font-medium text-[11px] line-through">
                              Components: ₹{itemFin.componentCharges.toFixed(2)} (0% Excluded)
                            </span>
                          )}
                        </div>

                        {item.review && <p className="text-xs italic text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-1.5 border border-slate-100">"{item.review}"</p>}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Invoiced</span>
                          <span className="text-base sm:text-lg font-extrabold text-slate-900">
                            ₹{typeof item.amount === 'number' ? item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : item.amount}
                          </span>
                          <div className="text-amber-500 text-xs font-bold mt-0.5">{'★'.repeat(item.rating || 5)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {itemFin.mapScreenshot && (
                            <button
                              type="button"
                              onClick={() => setProofPreviewItem({
                                imageUrl: itemFin.mapScreenshot,
                                title: `GPS Navigation Proof: ${item.displayId || item.id}`,
                                subtitle: `${itemFin.distanceKm} KM Traveled to ${item.customerName}`
                              })}
                              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Navigation className="w-3.5 h-3.5 text-blue-600" />
                              <span className="hidden sm:inline">View Map Proof</span>
                              <span className="sm:hidden">Map</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleViewHistoryInvoice(item)}
                            className="px-4 py-2 bg-[#061e38] hover:bg-[#0a2f57] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5 text-orange-400" />
                            <span className="hidden sm:inline">View &amp; Download Invoice &rarr;</span>
                            <span className="sm:hidden">Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}


        {/* ── TAB 3: EARNINGS & PAYOUTS ── */}
        {activeTab === 'earnings' && (
          <div className="space-y-4 sm:space-y-6 no-print-bg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  Earnings &amp; Payouts
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vendor payout formula: <strong>50% Service Charges</strong> + <strong>100% Automated Fuel Charges</strong> for all travel KM. Hardware component charges are excluded.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                {/* Apply for Fuel Charges Button (Always Active) */}
                <button
                  onClick={() => setShowFuelClaimModal(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md bg-orange-600 hover:bg-orange-700 text-white cursor-pointer active:scale-95"
                  title="Claim additional fuel charges or manual receipts"
                >
                  <Fuel className="w-4 h-4" />
                  Apply for Fuel Charges
                </button>

                {/* Request Payout Button */}
                <button
                  onClick={handleRequestPayout}
                  disabled={payoutRequested || todayEarnings <= 0}
                  className={`px-5 sm:px-6 py-2.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md ${
                    payoutRequested 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : todayEarnings > 0 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  {payoutRequested ? 'Payout Processing...' : 'Request Payout'}
                </button>
              </div>
            </div>

            {/* 4 Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {/* Card 1: Gross Invoiced */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Gross Customer Invoiced</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  ₹{earningsBreakdown.totalGrossBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Across {earningsBreakdown.completedJobs.length} completed services
                </p>
              </div>

              {/* Card 2: Net Available Payout */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm relative overflow-hidden">
                {payoutRequested && (
                  <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    PROCESSING
                  </div>
                )}
                <p className="text-xs font-bold text-slate-400 uppercase">Net Available Payout</p>
                <p className={`text-2xl sm:text-3xl font-extrabold mt-1 ${payoutRequested ? 'text-emerald-600' : 'text-emerald-600'}`}>
                  ₹{todayEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  ₹{earningsBreakdown.totalServicePayout.toFixed(2)} (50% Service) + ₹{earningsBreakdown.totalFuelPayout.toFixed(2)} (Fuel)
                </p>
              </div>

              {/* Card 3: Automated Fuel Payout */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase">Automated Fuel Payout</p>
                  <span className="text-[10px] font-extrabold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    {earningsBreakdown.totalDistanceKm.toFixed(1)} KM
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-orange-600 mt-1">
                  ₹{earningsBreakdown.totalFuelPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Auto-aggregated from all completed service routes
                </p>
              </div>

              {/* Card 4: Components Excluded */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase">Component Charges</p>
                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    0% Payout
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-400 mt-1 line-through">
                  ₹{earningsBreakdown.totalComponentCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Spare parts &amp; materials cost (Excluded)
                </p>
              </div>
            </div>

            {/* ── TRANSPARENT VENDOR PAYOUT FORMULA & POLICY CARD ── */}
            <div className="bg-gradient-to-r from-slate-900 via-[#0a2f57] to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Vendor Payout Calculation Formula</h3>
                    <p className="text-xs text-slate-300 mt-0.5">Strict transparent split policy applied automatically to every job</p>
                  </div>
                </div>
                <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black px-3 py-1 rounded-xl">
                  Total Wallet: ₹{todayEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Pillar 1: Service Charges (50%) */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-blue-300">
                      <Wrench className="w-4 h-4" />
                      <span className="font-extrabold uppercase text-[11px] tracking-wider">1. Service Charges (50% Share)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      You receive strictly <strong>50%</strong> of all diagnostic, labor, inspection, and maintenance fees billed to the customer.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
                    <span className="text-slate-400 text-[10px]">Billed: ₹{earningsBreakdown.totalServiceCharges.toFixed(2)}</span>
                    <span className="text-base font-black text-emerald-400">
                      Payout: ₹{earningsBreakdown.totalServicePayout.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Pillar 2: Component Charges (0% Excluded) */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-300">
                      <FileText className="w-4 h-4" />
                      <span className="font-extrabold uppercase text-[11px] tracking-wider">2. Component Charges (0% Share)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Hardware replacement parts, capacitors, gas refilling, and valves are <strong>NOT added</strong> to vendor payout (100% parts inventory cost).
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
                    <span className="text-slate-400 text-[10px]">Billed: ₹{earningsBreakdown.totalComponentCharges.toFixed(2)}</span>
                    <span className="text-base font-bold text-slate-400 line-through">
                      Excluded (₹0.00)
                    </span>
                  </div>
                </div>

                {/* Pillar 3: Fuel Charges Payout (100% Allowance) */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-orange-300">
                      <Fuel className="w-4 h-4" />
                      <span className="font-extrabold uppercase text-[11px] tracking-wider">3. Automated Fuel Payout</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      All travel distance (<strong>{earningsBreakdown.totalDistanceKm.toFixed(1)} KM</strong> across all completed services) is automatically aggregated and reimbursed.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
                    <span className="text-slate-400 text-[10px]">{earningsBreakdown.totalDistanceKm.toFixed(1)} Total KM</span>
                    <span className="text-base font-black text-orange-400">
                      +₹{earningsBreakdown.totalFuelPayout.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payout History / Pending Settlement */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900">Recent Regular Payouts</h3>
                <span className="text-xs font-bold text-slate-400">Direct Bank &amp; UPI Settlements</span>
              </div>
              <div className="space-y-4">
                {payoutRequested ? (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Payout Requested</p>
                        <p className="text-xs text-slate-500">Processing - Expected within 1-2 business days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900">₹{todayEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-amber-600 font-bold">Pending Approval</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <IndianRupee className="w-7 h-7 text-slate-400 mx-auto mb-1.5 opacity-60" />
                    <p className="text-sm font-bold text-slate-700">No pending payout requests</p>
                    <p className="text-xs text-slate-500 mt-0.5">When you complete jobs and click 'Request Payout', your payout status will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── AUTOMATED FUEL CHARGES & TRIP DISTANCE LOG (ALL SERVICES COMPLETED) ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Automated Fuel Charges &amp; Trip Distance Log
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All travel distance (KM) from all completed services is automatically summed up below and added into your fuel payout balance.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                    Total: {earningsBreakdown.totalDistanceKm.toFixed(1)} KM
                  </span>
                  <span className="text-xs font-black text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
                    Fuel Payout: ₹{earningsBreakdown.totalFuelPayout.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Automated Distance Jobs Table */}
              <div className="space-y-3 pt-1">
                {earningsBreakdown.completedJobs.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Navigation className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-slate-700">No completed service trips yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      When you click <strong>"Start Service"</strong> and upload your navigation map screenshot, the distance in KM is automatically verified and added here once completed.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs" style={{ minWidth: '720px' }}>
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-600 font-extrabold uppercase tracking-wider">
                          <th className="p-3 rounded-l-xl">Work Order &amp; Date</th>
                          <th className="p-3">Customer &amp; Location</th>
                          <th className="p-3">Verified Travel KM</th>
                          <th className="p-3">50% Service Share</th>
                          <th className="p-3">Components</th>
                          <th className="p-3">Fuel Payout</th>
                          <th className="p-3 text-right">Job Net Payout</th>
                          <th className="p-3 text-center rounded-r-xl">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {earningsBreakdown.completedJobs.map((job) => {
                          const fin = job.financials || calculateJobFinancials(job);
                          return (
                            <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-3">
                                <span className="font-extrabold text-slate-900 block">{job.displayId || job.id}</span>
                                <span className="text-[11px] text-slate-400 font-semibold">{job.date}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-extrabold text-slate-800 block">{job.customerName || 'Customer'}</span>
                                <span className="text-[11px] text-slate-500 truncate block max-w-[200px]" title={job.location || job.serviceAddress}>
                                  {job.location || job.serviceAddress}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                                    {fin.distanceKm > 0 ? `${fin.distanceKm} KM` : 'Direct'}
                                  </span>
                                  {fin.mapScreenshot && (
                                    <button
                                      type="button"
                                      onClick={() => setProofPreviewItem({
                                        imageUrl: fin.mapScreenshot,
                                        title: `GPS Navigation Proof: ${job.displayId || job.id}`,
                                        subtitle: `${fin.distanceKm} KM verified travel to ${job.customerName}`
                                      })}
                                      className="p-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 cursor-pointer"
                                      title="View Navigation Map Screenshot"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="font-extrabold text-slate-900 block">₹{fin.servicePayout.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400">from ₹{fin.serviceCharges.toFixed(2)}</span>
                              </td>
                              <td className="p-3">
                                {fin.componentCharges > 0 ? (
                                  <div>
                                    <span className="font-bold text-slate-400 line-through text-[11px] block">
                                      ₹{fin.componentCharges.toFixed(2)}
                                    </span>
                                    <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                      Excluded
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">₹0.00</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="font-black text-orange-600 block">
                                  +₹{fin.fuelPayout.toFixed(2)}
                                </span>
                                <span className="text-[10px] text-slate-400">@{fin.ratePerKm || 10}/km</span>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-black text-emerald-600 text-sm">
                                  ₹{fin.totalVendorPayout.toFixed(2)}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  Auto-Added
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ── ADDITIONAL FUEL ALLOWANCE CLAIMS SECTION ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Additional Fuel Allowance Claims
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submit extra fuel expense reimbursement for non-standard trips, detours, or manual petrol receipts.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFuelClaimModal(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Apply for Fuel Charges
                </button>
              </div>

              {/* Notice Banner */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 sm:p-4 text-xs text-blue-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-extrabold">How Manual Fuel Claims Complement Auto-Calculated Distance</p>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    Your accepted job navigation route screenshot automatically credits standard travel fuel charges above. Use this section if you had additional vehicle expenses, emergency parts pickups, or custom petrol receipts that need manual review.
                  </p>
                </div>
              </div>

              {/* Fuel Claims List */}
              <div className="space-y-3 pt-2">
                {fuelClaims.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Fuel className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-slate-700">No additional fuel claims submitted</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Standard trip distance is automatically credited in the section above. Click <strong>"Apply for Fuel Charges"</strong> if you need to submit additional receipts.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs" style={{ minWidth: '600px' }}>
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-600 font-extrabold uppercase tracking-wider">
                          <th className="p-3 rounded-l-xl">Claim ID &amp; Date</th>
                          <th className="p-3">Work Order / Customer</th>
                          <th className="p-3">Vehicle &amp; Distance</th>
                          <th className="p-3 text-right">Claim Amount</th>
                          <th className="p-3 text-center">Map/Bill Proof</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-center rounded-r-xl">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {fuelClaims.map((claim) => {
                          const isPending = claim.status === 'Pending Approval';
                          return (
                            <tr key={claim.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-3">
                                <span className="font-extrabold text-slate-900 block">{claim.id}</span>
                                <span className="text-[11px] text-slate-400 font-semibold">{claim.date}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-extrabold text-slate-800 block">{claim.jobDisplay || claim.jobId}</span>
                                <span className="text-[11px] text-slate-500">{claim.customerName || 'Service Trip'}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-slate-800 block">{claim.distanceKm} KM</span>
                                <span className="text-[11px] text-slate-400">{claim.vehicleType} (@ ₹{claim.ratePerKm}/km)</span>
                              </td>
                              <td className="p-3 text-right font-black text-slate-900 text-sm">
                                ₹{Number(claim.claimedAmount).toFixed(2)}
                              </td>
                              <td className="p-3 text-center">
                                {claim.receiptImage ? (
                                  <button
                                    type="button"
                                    onClick={() => setProofPreviewItem({
                                      imageUrl: claim.receiptImage,
                                      title: `Fuel Claim Proof: ${claim.id}`,
                                      subtitle: `${claim.distanceKm} KM (${claim.vehicleType}) - ₹${Number(claim.claimedAmount).toFixed(2)}`
                                    })}
                                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3 text-blue-600" />
                                    View Proof
                                  </button>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">—</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                  claim.status === 'Approved & Disbursed'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : isPending
                                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                                      : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}>
                                  {claim.status}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {isPending && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFuelClaim(claim.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                    title="Cancel fuel claim"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}


        {/* ── TAB 4: PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="space-y-4 sm:space-y-5 no-print-bg">

            {/* Vendor Hero Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Cover Banner */}
              <div className="h-20 sm:h-28 bg-gradient-to-r from-[#061e38] via-[#0a2f57] to-[#061e38] relative">
                <div className="absolute bottom-0 right-0 opacity-10">
                  <Wrench className="w-32 h-32 text-white rotate-12 translate-x-4 translate-y-4" />
                </div>
              </div>

              <div className="px-4 sm:px-6 pb-5">
                {/* Avatar + Edit Button Row */}
                <div className="flex items-end justify-between -mt-8 mb-4 relative z-10">
                  <div className="flex items-end gap-3">
                    <img
                      src={isEditingProfile ? editProfileForm.profileImage : vendorProfile.profileImage}
                      alt={vendorProfile.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                    />
                    {isEditingProfile && (
                      <label className="cursor-pointer px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors border border-slate-200 flex items-center gap-1.5 shadow-sm">
                        <Camera className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Change Profile Picture</span>
                        <span className="sm:hidden">Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setEditProfileForm((prev) => ({
                                  ...prev, 
                                  profileImage: event.target.result,
                                  profileImageFile: file,
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => { setEditProfileForm(vendorProfile); setIsEditingProfile(true); }}
                      className="px-3 sm:px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
                    >
                      <span>✎</span> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-colors border border-slate-200"
                      >Cancel</button>
                      <button
                        onClick={handleSaveVendorProfile}
                        className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div className="mb-4">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">{vendorProfile.name}</h2>
                  <p className="text-sm text-slate-500 font-medium">{vendorProfile.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      title="Click to update address via popup"
                    >
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span>{vendorProfile.address && vendorProfile.address !== 'Set Your Location' ? vendorProfile.address : 'Set Service Location'}</span>
                      <span className="text-[10px] text-orange-600 font-extrabold bg-orange-100 px-1.5 py-0.5 rounded ml-0.5">
                        {vendorProfile.address && vendorProfile.address !== 'Set Your Location' ? 'Change' : 'Set Location'}
                      </span>
                    </button>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-600">ID: {vendorProfile.vendorId}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-4 mb-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-3 text-center">
                    <p className="text-sm sm:text-xl font-extrabold text-slate-900">{rating}</p>
                    <p className="text-[9px] sm:text-xs text-slate-500 font-semibold mt-0.5">Rating</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-3 text-center">
                    <p className="text-sm sm:text-xl font-extrabold text-slate-900">{totalJobsDone}</p>
                    <p className="text-[9px] sm:text-xs text-slate-500 font-semibold mt-0.5">Jobs Done</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRadiusModalOpen(true)}
                    className="bg-slate-50 hover:bg-orange-50/70 border border-slate-100 hover:border-orange-200 rounded-xl p-2 sm:p-3 text-center transition-all cursor-pointer group"
                    title="Click to update service radius (Default: 15 km)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-sm sm:text-xl font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {vendorProfile.serviceRadius || 15}km
                      </p>
                      <span className="text-[10px] text-orange-500 opacity-60 group-hover:opacity-100 transition-opacity">✎</span>
                    </div>
                    <p className="text-[9px] sm:text-xs text-slate-500 font-semibold mt-0.5 flex items-center justify-center gap-1">
                      <span>Radius</span>
                      <span className="text-[9px] text-orange-600 font-extrabold hidden sm:inline">(Update)</span>
                    </p>
                  </button>
                </div>

                {/* NABL Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 bg-[#061e38] text-white px-3 py-1.5 rounded-xl">
                    <Award className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="text-xs font-extrabold">NABL Verified</span>
                    <span className="text-orange-400 text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded-md">ISO</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                    {vendorProfile.nablId}
                  </span>
                </div>

                {/* Appliances Served */}
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Appliances Served <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {!isEditingProfile ? (
                      (Array.isArray(vendorProfile.appliancesServed) ? vendorProfile.appliancesServed : []).map((appliance, i) => (
                        <span key={i} className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {appliance}
                        </span>
                      ))
                    ) : (
                      ALL_APPLIANCES.map((appliance) => {
                        const currentList = Array.isArray(editProfileForm.appliancesServed) ? editProfileForm.appliancesServed : [];
                        const isSelected = currentList.includes(appliance);
                        return (
                          <button
                            key={appliance}
                            onClick={() => {
                              const newAppliances = isSelected
                                ? currentList.filter(a => a !== appliance)
                                : [...currentList, appliance];
                              setEditProfileForm({...editProfileForm, appliancesServed: newAppliances});
                            }}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                              isSelected 
                                ? 'bg-orange-100 border-orange-300 text-orange-800'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {appliance}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {isEditingProfile && (
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">Select the services you served</p>
                  )}
                </div>
              </div>
            </div>

            {/* Credentials & Banking Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-600" />
                Credentials &amp; Banking
              </h3>

              {!isEditingProfile ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
                  {[
                    { label: 'Full Name', value: vendorProfile.name },
                    { label: 'Phone', value: vendorProfile.phone },
                    { label: 'Email', value: vendorProfile.email },
                    { label: 'Vendor UPI ID', value: vendorProfile.upiId },
                    { label: 'Bank Name', value: vendorProfile.bankName },
                    { label: 'Bank Account Number', value: vendorProfile.bankAccount },
                    { label: 'Bank IFSC', value: vendorProfile.ifsc },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 sm:p-3">
                      <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{label}</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 break-words">{value}</p>
                    </div>
                  ))}

                  {/* Service Address Card with direct Popup trigger in View Mode */}
                  <div className="sm:col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                        Service Address
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5 break-words">
                        <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                        {vendorProfile.address && vendorProfile.address !== 'Set Your Location' ? vendorProfile.address : 'No address set. Set your location.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{vendorProfile.address && vendorProfile.address !== 'Set Your Location' ? 'Update Address' : 'Set Service Location'}</span>
                    </button>
                  </div>

                  {/* Service Radius Card with direct Update trigger in View Mode */}
                  <div className="sm:col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 mt-0.5 sm:mt-0">
                        <Compass className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Service Radius
                          </p>
                          <span className="text-[9px] bg-orange-100 text-orange-700 font-extrabold px-1.5 py-0.5 rounded-md">
                            Default: 15 km
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                          <span className="font-extrabold text-slate-900">{vendorProfile.serviceRadius || 15} km</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">Dispatch radius around your location</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRadiusModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-orange-400" />
                      <span>Update Radius</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: 'Full Name', field: 'name', type: 'text' },
                    { label: 'Phone', field: 'phone', type: 'tel' },
                    { label: 'Professional Title', field: 'title', type: 'text' },
                    { label: 'Service Radius (km)', field: 'serviceRadius', type: 'number' },
                    { label: 'Vendor UPI ID', field: 'upiId', type: 'text' },
                    { label: 'Bank Name', field: 'bankName', type: 'text' },
                    { label: 'Bank Account Number', field: 'bankAccount', type: 'text' },
                    { label: 'Bank IFSC', field: 'ifsc', type: 'text' },
                  ].map(({ label, field, type }) => (
                    <div key={field}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          {label} <span className="text-red-500">*</span>
                        </label>
                        {field === 'serviceRadius' && (
                          <button
                            type="button"
                            onClick={() => setEditProfileForm({ ...editProfileForm, serviceRadius: 15 })}
                            className="text-[10px] text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
                          >
                            Reset to 15 km (Default)
                          </button>
                        )}
                      </div>
                      {field === 'bankName' ? (
                        <select
                          value={editProfileForm[field]}
                          onChange={e => setEditProfileForm({...editProfileForm, [field]: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select Bank</option>
                          {INDIAN_BANKS.map(bank => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          min={field === 'serviceRadius' ? 1 : undefined}
                          max={field === 'serviceRadius' ? 100 : undefined}
                          placeholder={field === 'serviceRadius' ? '15' : ''}
                          value={editProfileForm[field]}
                          onChange={e => setEditProfileForm({...editProfileForm, [field]: field === 'serviceRadius' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      )}
                    </div>
                  ))}

                  {/* ── EXACT SERVICE ADDRESS INPUT FIELD WITH POPUP TRIGGER ── */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Service Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={editProfileForm.address}
                        onChange={e => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                        placeholder="e.g. Flat 402, Green Valley Apartments, 10th Main Road, Indiranagar, 560038"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-36 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span>Address Popup</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                      Click <strong>"Address Popup"</strong> to enter Flat/Building, Street, Landmark, and Pincode via popup modal.
                    </p>
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-colors border border-slate-200 cursor-pointer"
                    >Cancel</button>
                    <button
                      onClick={handleSaveVendorProfile}
                      className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}


        {/* ── PAYOUT REQUEST MODAL ── */}
        <VendorPayoutModal
          showPayoutModal={showPayoutModal}
          setShowPayoutModal={setShowPayoutModal}
          todayEarnings={todayEarnings}
          servicePayout={earningsBreakdown.totalServicePayout}
          fuelPayout={earningsBreakdown.totalFuelPayout}
          totalDistanceKm={earningsBreakdown.totalDistanceKm}
          componentCharges={earningsBreakdown.totalComponentCharges}
          payoutDays={payoutDays}
          setPayoutDays={setPayoutDays}
          payoutNotes={payoutNotes}
          setPayoutNotes={setPayoutNotes}
          handleConfirmPayout={handleConfirmPayout}
        />

        {/* ── VENDOR START SERVICE MAP & KM MODAL ── */}
        <VendorStartServiceModal
          isOpen={showStartServiceModal}
          onClose={() => {
            setShowStartServiceModal(false);
            setPendingStartServiceJob(null);
          }}
          job={pendingStartServiceJob || selectedJob}
          vendorProfile={vendorProfile}
          onConfirmStartService={handleConfirmStartService}
        />

        {/* ── VENDOR FUEL ALLOWANCE CLAIM MODAL ── */}
        <VendorFuelClaimModal
          isOpen={showFuelClaimModal}
          onClose={() => setShowFuelClaimModal(false)}
          completedJobs={history.filter(h => h.status === 'Completed')}
          vendorProfile={vendorProfile}
          onSubmitClaim={handleSubmitFuelClaim}
        />

        {/* ── PROOF LIGHTBOX PREVIEW MODAL ── */}
        {proofPreviewItem && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{proofPreviewItem.title || 'Travel & Proof Document'}</h4>
                  {proofPreviewItem.subtitle && (
                    <p className="text-xs text-slate-500 font-medium">{proofPreviewItem.subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setProofPreviewItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-[60vh] flex items-center justify-center bg-slate-950">
                <img
                  src={proofPreviewItem.imageUrl}
                  alt="Proof Document"
                  className="w-full h-auto object-contain max-h-[55vh]"
                />
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setProofPreviewItem(null)}
                  className="px-5 py-2 bg-[#061e38] text-white rounded-xl font-extrabold text-xs cursor-pointer hover:bg-[#0a2f57]"
                >
                  Close Proof
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── OFFICIAL MAGIC MISTRY TAX INVOICE MODAL (SAME-TAB PRINT/PDF ENABLED) ── */}
        <VendorTaxInvoiceModal
          showTaxInvoiceModal={showTaxInvoiceModal}
          generatedInvoiceData={generatedInvoiceData}
          handleSameTabPrintOrSavePDF={handleSameTabPrintOrSavePDF}
          handleCloseInvoiceModal={handleCloseInvoiceModal}
        />

        {/* ── VENDOR SERVICE ADDRESS MODAL (Exact match to screenshot) ── */}
        <VendorAddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSave={handleSaveVendorAddress}
          initialAddress={vendorAddressObj || editProfileForm.address || vendorProfile.address}
        />

        {/* ── VENDOR SERVICE RADIUS MODAL ── */}
        <VendorRadiusModal
          isOpen={isRadiusModalOpen}
          onClose={() => setIsRadiusModalOpen(false)}
          currentRadius={vendorProfile.serviceRadius || 15}
          serviceAddress={vendorProfile.address}
          onSave={handleUpdateRadius}
        />

        {/* ── FLOATING TOAST NOTIFICATION ── */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold bg-slate-900 text-white border border-emerald-500/50 flex items-center gap-3 no-print-bg"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{toastMessage.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <div className="no-print-bg">
        <Footer />
      </div>
    </div>
  );
}
