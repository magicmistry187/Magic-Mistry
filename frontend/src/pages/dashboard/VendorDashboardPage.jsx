import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Wrench, ShieldCheck, Star, Clock, MapPin, Phone, Navigation,
  CheckCircle2, XCircle, AlertCircle, IndianRupee, TrendingUp,
  User, CreditCard, Award, Calendar, ChevronRight, Power,
  FileText, Check, Plus, Search, Filter, RefreshCw, Bell,
  Tv, Zap, Thermometer, ArrowUpRight, ChevronDown, Building,
  Sliders, Shield, MessageSquare, ExternalLink, AlertTriangle,
  Play, Square, Camera, Trash2, Send, Eye, Lock,
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
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import {
  getVendorBookingsApi,
  acceptBookingApi,
  updateBookingStatusApi,
  completeServiceApi,
  routeVerificationApi,
  submitServiceDetailsApi,
} from '../../services/operations/bookingAPI';
import { saveVendorAddressApi, getAddressesApi, updateAddressApi, createAddressApi } from '../../services/operations/addressAPI';
import { updateVendorProfileApi, getVendorProfileApi, updateVendorProfileImageApi } from '../../services/operations/vendorAPI';
import { useLivePricing, getLiveFuelRate, getLiveBasePriceForAppliance } from '../../services/pricingService';
import { getAllInventoryApi } from '../../services/operations/inventoryAPI';
import { getInvoiceForBooking, saveInvoiceForBooking, normalizeInvoiceForUI } from '../../services/invoiceService';


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

// Haversine formula to compute great-circle distance between two GPS coordinates in meters
export const haversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

/**
 * Safely extracts { lat, lng } numbers from any coordinate, address, or GeoJSON structure
 */
export const extractCoordinates = (source) => {
  if (!source) return null;

  // Direct lat / lng properties
  if (source.lat !== undefined && source.lng !== undefined && source.lat !== null && source.lng !== null) {
    const lat = Number(source.lat);
    const lng = Number(source.lng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Direct latitude / longitude properties
  if (source.latitude !== undefined && source.longitude !== undefined && source.latitude !== null && source.longitude !== null) {
    const lat = Number(source.latitude);
    const lng = Number(source.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // GeoJSON Point: { type: 'Point', coordinates: [lng, lat] }
  if (Array.isArray(source.location?.coordinates) && source.location.coordinates.length >= 2) {
    const lng = Number(source.location.coordinates[0]);
    const lat = Number(source.location.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // GeoJSON Point directly on coordinates array
  if (Array.isArray(source.coordinates) && source.coordinates.length >= 2) {
    const lng = Number(source.coordinates[0]);
    const lat = Number(source.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Nested address object
  if (source.address && typeof source.address === 'object') {
    const nested = extractCoordinates(source.address);
    if (nested) return nested;
  }

  // Nested customerLocation object
  if (source.customerLocation && typeof source.customerLocation === 'object') {
    const nested = extractCoordinates(source.customerLocation);
    if (nested) return nested;
  }

  // Nested customerCoordinates object
  if (source.customerCoordinates && typeof source.customerCoordinates === 'object') {
    const nested = extractCoordinates(source.customerCoordinates);
    if (nested) return nested;
  }

  return null;
};

/**
 * Builds the official Google Maps Universal Directions URL according to specifications
 */
export const buildGoogleMapsNavigationUrl = ({ customer, vendor, destinationAddress }) => {
  const customerCoords = extractCoordinates(customer);
  const vendorCoords = extractCoordinates(vendor);

  // Scenario 1: Both vendor and customer coordinates are present
  if (customerCoords && vendorCoords) {
    return `https://www.google.com/maps/dir/?api=1&origin=${vendorCoords.lat},${vendorCoords.lng}&destination=${customerCoords.lat},${customerCoords.lng}&travelmode=driving&dir_action=navigate`;
  }

  // Scenario 2: Only customer coordinates are present (vendor GPS missing -> defaults to device live GPS)
  if (customerCoords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${customerCoords.lat},${customerCoords.lng}&travelmode=driving&dir_action=navigate`;
  }

  // Scenario 3: Fallback using formatted address string
  if (destinationAddress) {
    if (vendorCoords) {
      return `https://www.google.com/maps/dir/?api=1&origin=${vendorCoords.lat},${vendorCoords.lng}&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving&dir_action=navigate`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving&dir_action=navigate`;
  }

  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate`;
};

export const safeString = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val.trim() || fallback;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val.formattedAddress && typeof val.formattedAddress === 'string') return val.formattedAddress.trim();
    if (val.fullAddress && typeof val.fullAddress === 'string') return val.fullAddress.trim();
    if (val.address && typeof val.address === 'string') return val.address.trim();
    if (val.fullName && typeof val.fullName === 'string') return val.fullName.trim();
    if (val.name && typeof val.name === 'string') return val.name.trim();
    const parts = [val.house || val.flat, val.street, val.landmark, val.city, val.state, val.pincode].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
    return fallback;
  }
  return String(val) || fallback;
};

export const safeImageUrl = (val) => {
  if (!val) return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof val === 'object') {
    if (typeof val.url === 'string' && val.url.trim()) return val.url.trim();
    if (typeof val.secure_url === 'string' && val.secure_url.trim()) return val.secure_url.trim();
  }
  return null;
};

export const normalizeChecklist = (raw) => {
  const defaultList = [
    { id: 1, title: 'Initial Inspection', desc: 'Inspect device and confirm reported issue with customer.', completed: false },
    { id: 2, title: 'Diagnosis & Parts Verification', desc: 'Test electrical components and verify required replacement parts.', completed: false },
    { id: 3, title: 'Perform Service/Repair', desc: 'Carry out required servicing or parts replacement safely.', completed: false },
    { id: 4, title: 'Final Testing & Cleanup', desc: 'Run complete test cycle and clean work area.', completed: false },
  ];

  if (!raw) return defaultList;

  let val = raw;
  if (typeof val === 'string') {
    try {
      val = JSON.parse(val);
    } catch (_) {
      return defaultList;
    }
  }

  if (Array.isArray(val) && val.length > 0) {
    return defaultList.map((item, idx) => {
      const match = val.find(c => c && (c.id === item.id || c.title === item.title)) || val[idx];
      return {
        ...item,
        completed: Boolean(match?.completed ?? match?.done ?? false)
      };
    });
  }

  if (typeof val === 'object' && val !== null) {
    return [
      { id: 1, title: 'Initial Inspection', desc: 'Inspect device and confirm reported issue with customer.', completed: Boolean(val.inspection ?? val.initialInspection ?? false) },
      { id: 2, title: 'Diagnosis & Parts Verification', desc: 'Test electrical components and verify required replacement parts.', completed: Boolean(val.diagnosis ?? val.partsVerification ?? false) },
      { id: 3, title: 'Perform Service/Repair', desc: 'Carry out required servicing or parts replacement safely.', completed: Boolean(val.service ?? val.performService ?? false) },
      { id: 4, title: 'Final Testing & Cleanup', desc: 'Run complete test cycle and clean work area.', completed: Boolean(val.testingCleanup ?? val.cleanup ?? false) },
    ];
  }

  return defaultList;
};

// Reusable formatter for vendor bookings (both initial fetch and real-time socket events)
export const formatVendorBooking = (b) => {
  const displayAddr = formatBookingAddress(b.address || b.serviceAddress || b.location);
  const customerCoords = extractCoordinates(b);
  const fallbackPay = getLiveBasePriceForAppliance(b.serviceCategory || b.appliance, 450);
  const pay = Number(b.serviceCategoryCharge) || Number(b.serviceCharge) || Number(b.estimatedPay) || fallbackPay;
  const formattedDist =
    typeof b.distance === 'number'
      ? (b.distance < 1000 ? `${Math.round(b.distance)} m away` : `${(b.distance / 1000).toFixed(1)} km away`)
      : 'Nearby';

  const mongoId = b._id ? String(b._id) : (b.id && /^[0-9a-fA-F]{24}$/.test(b.id) ? String(b.id) : '');
  const realInvoice = getInvoiceForBooking(mongoId || b.id || b.bookingId, b);
  const normalizedInv = realInvoice ? normalizeInvoiceForUI(realInvoice, b) : null;
  const realAmount = normalizedInv?.total ?? (Number(b.serviceCharge) > 0 ? Number(b.serviceCharge) : pay);

  // Extract travel route information from backend
  const routeData = b.route || b.execution?.route || b.serviceExecution?.route || {};
  const extractedDistance = Number(b.travelDistanceKm || routeData.distanceKm) || 0;
  const extractedRate = Number(b.travelRatePerKm || routeData.ratePerKm) || 0;
  const extractedCharges = Number(b.travelCharges || routeData.travelCharge) || (extractedDistance > 0 && extractedRate > 0 ? extractedDistance * extractedRate : 0);
  const extractedMapScreenshot = safeImageUrl(b.mapScreenshot || routeData.screenshot || b.execution?.route?.screenshot || b.serviceExecution?.route?.screenshot);
  const extractedTravelVerified = Boolean(b.travelVerified || routeData.verified || (extractedDistance > 0 && extractedMapScreenshot));

  const custName = typeof b.customer?.fullName === 'string'
    ? b.customer.fullName
    : (typeof b.customerName === 'string' ? b.customerName : 'Customer');

  const custPhone = typeof b.customer?.phoneNumber === 'string'
    ? b.customer.phoneNumber
    : (typeof b.customerPhone === 'string' ? b.customerPhone : '—');

  return {
    _id: mongoId || undefined,
    id: b.bookingId || mongoId || String(b._id || b.id || ''),
    displayId: b.displayId || (mongoId ? `WO-${mongoId.slice(-6).toUpperCase()}` : (b.bookingId || 'WO-JOB')),
    backendJobId: mongoId || b.bookingId || String(b._id || b.id || ''),
    appliance: b.appliance || 'General',
    applianceIcon: getApplianceIcon(b.appliance),
    serviceTitle: b.serviceCategory || b.appliance || 'Service Request',
    status: b.bookingStatus === 'Pending' ? 'New Request' : (b.bookingStatus || 'New Request'),
    timeSlot: b.timeSlot || '—',
    appointmentDate: b.serviceDate ? new Date(b.serviceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—',
    customerName: custName,
    customerPhone: custPhone,
    serviceAddress: displayAddr,
    location: displayAddr,
    customerLocation: customerCoords,
    customerCoordinates: customerCoords,
    distance: formattedDist,
    issue: b.issue || b.description || 'Service required',
    estimatedPay: pay,
    amount: realAmount,
    date: b.serviceDate ? new Date(b.serviceDate).toLocaleDateString('en-IN') + (b.timeSlot ? ' ' + b.timeSlot : '') : '—',
    rawDate: b.serviceDate ? new Date(b.serviceDate) : new Date(b.createdAt || Date.now()),
    review: b.review || '',
    travelDistanceKm: extractedDistance,
    travelRatePerKm: extractedRate,
    travelCharges: extractedCharges,
    mapScreenshot: extractedMapScreenshot,
    travelVerified: extractedTravelVerified,
    checklist: normalizeChecklist(b.checklist || b.execution?.checklist || b.serviceExecution?.checklist),
    photos: Array.isArray(b.photos) ? b.photos : [],
    notes: b.notes || '',
    parts: normalizedInv?.items && normalizedInv.items.length > 0 ? normalizedInv.items : (b.parts || [
      { id: 1, description: b.serviceCategory || b.appliance || 'Diagnostic & Service Charge', qty: 1, price: pay, locked: true },
    ]),
    invoiceData: normalizedInv || undefined,
    invoiceNumber: normalizedInv?.invoiceId,
    rawBooking: b,
  };
};

// ── Financial Calculation Helper: 50% Service Payout, 0% Components, 100% Fuel Payout ──
export const calculateJobFinancials = (job) => {
  const parts = job?.invoiceData?.parts || job?.parts || [];

  let serviceCharges = 0;
  let componentCharges = 0;
  let travelCharges = 0;

  let distanceKm = Number(job?.travelDistanceKm) || Number(job?.invoiceData?.travelDistanceKm) || 0;
  const adminFuelRate = getLiveFuelRate();
  let ratePerKm = Number(job?.travelRatePerKm) || Number(job?.invoiceData?.travelRatePerKm) || adminFuelRate;

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

// ── Initial State Containers (Real data fetched from backend) ─────────────────
const DEFAULT_SAMPLE_JOBS = [];
const DEFAULT_SAMPLE_HISTORY = [];
const INITIAL_FUEL_CLAIMS = [];

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { token, user, loading, location, updateProfile } = useAuth();
  const { playNotificationSound } = useSocket();
  
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
      const isAdmin = (storedUser?.email && storedUser.email.toLowerCase().trim() === 'magicmistry187@gmail.com') ||
                      (user?.email && user.email.toLowerCase().trim() === 'magicmistry187@gmail.com');
      const hasVendorAccess = role === 'vendor' || role === 'admin' || isAdmin || !!storedUser.vendorId || !!storedUser.user?.vendorId;
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

  // Master reactive dynamic pricing and fuel reimbursement rate hook
  const { fuelRate, services } = useLivePricing();

  // Persist jobs and history locally so uploaded map screenshots and completed orders are saved
  useEffect(() => {
    try {
      const sanitized = (jobs || []).map(j => {
        const { mapFile, beforePhotoFile, afterPhotoFile, ...rest } = j;
        return rest;
      });
      localStorage.setItem('mm_vendor_active_jobs', JSON.stringify(sanitized));
    } catch (e) {
      console.warn('[VendorDashboard] LocalStorage persistence warning for jobs:', e);
    }
  }, [jobs]);

  useEffect(() => {
    try {
      const sanitized = (history || []).map(h => {
        const { mapFile, beforePhotoFile, afterPhotoFile, ...rest } = h;
        return rest;
      });
      localStorage.setItem('mm_vendor_history', JSON.stringify(sanitized));
    } catch (e) {
      console.warn('[VendorDashboard] LocalStorage persistence warning for history:', e);
    }
  }, [history]);

  // Reactively synchronize active jobs when fuelRate is updated by admin
  useEffect(() => {
    setJobs(prevJobs => prevJobs.map(job => {
      const dist = Number(job.travelDistanceKm) || 0;
      const updatedParts = (job.parts || []).map(p => {
        const desc = String(p.description || '').toLowerCase();
        const isTravel = p.isTravel || desc.includes('travel') || desc.includes('distance') || desc.includes('km ') || desc.endsWith('km');
        if (isTravel) {
          return {
            ...p,
            price: fuelRate,
            description: `Travel & Distance Charge (${dist} km @ ₹${fuelRate}/km)`
          };
        }
        return p;
      });

      return {
        ...job,
        travelRatePerKm: fuelRate,
        travelCharges: dist * fuelRate,
        parts: updatedParts
      };
    }));
  }, [fuelRate]);

  // Reactively synchronize active jobs when service catalog/pricing is updated by admin
  useEffect(() => {
    setJobs(prevJobs => prevJobs.map(job => {
      const match = services.find(s =>
        s.name.toLowerCase() === (job.appliance || '').toLowerCase() ||
        (job.serviceTitle || '').toLowerCase().includes(s.name.toLowerCase())
      );
      if (!match) return job;
      const newBase = Number(match.basePrice) || job.amount;
      const updatedParts = (job.parts || []).map(p => {
        if (p.locked || p.isService) {
          return { ...p, price: newBase };
        }
        return p;
      });

      return {
        ...job,
        estimatedPay: newBase,
        amount: newBase,
        parts: updatedParts
      };
    }));
  }, [services]);

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
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') || localStorage.getItem('vendorToken') : null);
      if (authToken) {
        try {
          const res = await getVendorBookingsApi(authToken);
          if (res.success && Array.isArray(res.bookings)) {
            const formatted = res.bookings.map(formatVendorBooking);

            const activeList = formatted.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled' && b.status !== 'Closed');
            const historyList = formatted.filter(b => b.status === 'Completed' || b.status === 'Cancelled' || b.status === 'Closed');

            setJobs(prevJobs => {
              return activeList.map(serverJob => {
                const existing = (prevJobs || []).find(pj => pj.id === serverJob.id);
                if (existing) {
                  return {
                    ...serverJob,
                    travelDistanceKm: serverJob.travelDistanceKm || existing.travelDistanceKm || 0,
                    travelRatePerKm: serverJob.travelRatePerKm || existing.travelRatePerKm || 10,
                    travelCharges: serverJob.travelCharges || existing.travelCharges || 0,
                    mapScreenshot: serverJob.mapScreenshot || existing.mapScreenshot || null,
                    travelVerified: serverJob.travelVerified || existing.travelVerified || false,
                    checklist: (Array.isArray(existing.checklist) && existing.checklist.some(c => c.completed)) ? existing.checklist : serverJob.checklist,
                    parts: (Array.isArray(existing.parts) && existing.parts.length > 0) ? existing.parts : serverJob.parts,
                  };
                }
                return serverJob;
              });
            });
            setHistory(historyList);
          }
        } catch (err) {
          console.error('[Vendor Dashboard] Error fetching bookings:', err);
        }
      }
    };
    fetchBookings();
    // Real-time socket events now handle updates without HTTP polling
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
  const [selectedJob, setSelectedJob] = useState(() => {
    try {
      const savedId = localStorage.getItem('mm_vendor_selected_job_id');
      const savedJobs = localStorage.getItem('mm_vendor_active_jobs');
      if (savedId && savedJobs) {
        const parsed = JSON.parse(savedJobs);
        const match = (parsed || []).find(j => String(j.id) === String(savedId) || String(j._id) === String(savedId));
        if (match) return match;
      }
    } catch (_) {}
    return null;
  });

  // Photo documentation states & file input refs for service execution
  const [beforePhotoPreview, setBeforePhotoPreview] = useState(null);
  const [beforePhotoFile, setBeforePhotoFile] = useState(null);
  const [afterPhotoPreview, setAfterPhotoPreview] = useState(null);
  const [afterPhotoFile, setAfterPhotoFile] = useState(null);
  const beforeFileInputRef = useRef(null);
  const afterFileInputRef = useRef(null);

  // Persist selectedJob id for fast recovery on page refresh or tab switch
  useEffect(() => {
    try {
      if (selectedJob?.id) {
        localStorage.setItem('mm_vendor_selected_job_id', String(selectedJob.id));
      }
    } catch (_) {}
  }, [selectedJob]);

  // Keep selectedJob synced with updated active jobs
  useEffect(() => {
    if (selectedJob) {
      const refreshed = jobs.find(j => String(j.id) === String(selectedJob.id) || (j._id && String(j._id) === String(selectedJob.id)));
      if (refreshed) {
        setSelectedJob(prev => {
          if (!prev) return refreshed;
          return {
            ...refreshed,
            travelDistanceKm: refreshed.travelDistanceKm || prev.travelDistanceKm || 0,
            travelRatePerKm: refreshed.travelRatePerKm || prev.travelRatePerKm || 10,
            travelCharges: refreshed.travelCharges || prev.travelCharges || 0,
            mapScreenshot: refreshed.mapScreenshot || prev.mapScreenshot || null,
            travelVerified: refreshed.travelVerified || prev.travelVerified || false,
            checklist: (Array.isArray(prev.checklist) && prev.checklist.some(c => c.completed))
              ? prev.checklist
              : (Array.isArray(refreshed.checklist) ? refreshed.checklist : normalizeChecklist(refreshed.checklist)),
          };
        });
      }
    }
  }, [jobs]);
  
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
  const [acceptingJobId, setAcceptingJobId] = useState(null);
  const [isCompletingService, setIsCompletingService] = useState(false);
  
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

  // Real Database Inventory & Repair Components Catalog
  const [dbInventory, setDbInventory] = useState(() => {
    try {
      const cached = typeof window !== 'undefined'
        ? localStorage.getItem('mm_cached_inventory') || localStorage.getItem('mm_inventory_catalog')
        : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [
      { inventoryId: 'INV-6024', itemName: 'AC Capacitor', unitPrice: 650, stockQuantity: 16, category: 'Air Conditioner', isActive: true },
      { inventoryId: 'INV-6277', itemName: 'Refrigerator Door Seal', unitPrice: 850, stockQuantity: 6, category: 'Refrigerator', isActive: true },
      { inventoryId: 'INV-1900', itemName: 'Washing Machine Drain Pump', unitPrice: 1200, stockQuantity: 3, category: 'Washing Machine', isActive: true },
      { inventoryId: 'INV-1465', itemName: 'iteman', unitPrice: 350, stockQuantity: 60, category: 'Electrical', isActive: true },
    ];
  });
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  // Real-time Database Inventory Fetcher (guarantees vendor sees only live components & stock)
  const fetchLiveInventory = useCallback(async () => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') || localStorage.getItem('vendorToken') : null);
    setIsInventoryLoading(true);
    try {
      const res = await getAllInventoryApi({ isActive: true }, authToken);
      if (res.success && Array.isArray(res.inventory) && res.inventory.length > 0) {
        setDbInventory(res.inventory);
        try {
          localStorage.setItem('mm_cached_inventory', JSON.stringify(res.inventory));
          localStorage.setItem('mm_inventory_catalog', JSON.stringify(res.inventory));
        } catch (_) {}
      }
    } catch (err) {
      console.warn('[VendorDashboard] Failed to fetch live inventory:', err);
    } finally {
      setIsInventoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLiveInventory();
  }, [fetchLiveInventory]);

  // Re-fetch live inventory whenever vendor enters the invoice generation tab
  useEffect(() => {
    if (activeTab === 'invoice') {
      fetchLiveInventory();
    }
  }, [activeTab, fetchLiveInventory]);

  // Dropdown options: ONLY show components present in the inventory with positive stock
  const availableComponentOptions = useMemo(() => {
    if (!Array.isArray(dbInventory) || dbInventory.length === 0) {
      return [];
    }

    return dbInventory
      .filter(item => item && item.isActive !== false && Number(item.stockQuantity) > 0)
      .map(item => ({
        inventoryId: String(item.inventoryId || item._id).trim(),
        name: item.itemName,
        category: item.category || 'General',
        defaultPrice: Number(item.unitPrice) || 0,
        stock: Number(item.stockQuantity) || 0,
        skuCode: item.skuCode || '',
        isDbItem: true,
      }));
  }, [dbInventory]);

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
    const displayAddress = formatBookingAddress(addressData);
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
              const formatted = bRes.bookings.map(formatVendorBooking);
              setJobs((prevJobs) => {
                const ongoing = prevJobs.filter(j => j.status !== 'New Request');
                const newRequests = formatted.filter(b => b.status === 'New Request');
                return [...newRequests, ...ongoing];
              });
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




  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ── Real-Time Socket Listeners for Vendor ─────────────────────────────────
  // 1. New booking request available nearby (enforces service radius filtering)
  useSocketEvent('booking:new', (newBooking) => {
    if (!newBooking) return;
    const bId = String(newBooking._id || newBooking.id);

    // Verify distance / radius against vendorProfile.serviceRadius
    const maxRadiusKm = Number(vendorProfile.serviceRadius) > 0 ? Number(vendorProfile.serviceRadius) : 15;
    const maxRadiusMeters = maxRadiusKm * 1000;

    let dist = typeof newBooking.distance === 'number' ? newBooking.distance : null;

    if (dist === null) {
      const vLat = Number(vendorAddressObj?.latitude ?? vendorAddressObj?.location?.coordinates?.[1]);
      const vLng = Number(vendorAddressObj?.longitude ?? vendorAddressObj?.location?.coordinates?.[0]);
      const bCoords = newBooking.location?.coordinates;
      const bLng = Array.isArray(bCoords) && bCoords.length >= 2 ? Number(bCoords[0]) : Number(newBooking.longitude);
      const bLat = Array.isArray(bCoords) && bCoords.length >= 2 ? Number(bCoords[1]) : Number(newBooking.latitude);

      if (!isNaN(vLat) && !isNaN(vLng) && !isNaN(bLat) && !isNaN(bLng) && (vLat !== 0 || vLng !== 0)) {
        dist = haversineDistanceMeters(vLat, vLng, bLat, bLng);
        newBooking.distance = dist;
      }
    }

    if (dist !== null) {
      if (dist > maxRadiusMeters) {
        // Outside the vendor's service radius - discard silently
        return;
      }
    } else {
      // If coordinates are missing, verify city matching if available
      const vendorCity = (vendorAddressObj?.city || vendorProfile.address || '').toLowerCase().trim();
      const bookingCity = (newBooking.address?.city || '').toLowerCase().trim();
      if (vendorCity && bookingCity && !vendorCity.includes(bookingCity) && !bookingCity.includes(vendorCity)) {
        return; // Different city, discard
      }
    }

    setJobs((prevJobs) => {
      const alreadyExists = prevJobs.some((j) => String(j.id) === bId);
      if (alreadyExists) return prevJobs;
      const formatted = formatVendorBooking(newBooking);
      return [formatted, ...prevJobs];
    });

    if (playNotificationSound) playNotificationSound();
    showToast('🔔 New service booking request received!', 'success');
  });

  // 2. Booking accepted by another vendor or withdrawn
  useSocketEvent('booking:taken', (data) => {
    if (!data?.bookingId) return;
    const targetId = String(data.bookingId);
    if (data.assignedVendorId && String(data.assignedVendorId) === String(user?._id || user?.id)) {
      return;
    }
    setJobs((prevJobs) => prevJobs.filter((j) => (String(j.id) !== targetId && String(j._id) !== targetId) || j.status !== 'New Request'));
  });

  // 3. Status changed on an assigned booking (e.g. Completed, In Progress)
  useSocketEvent('booking:status_changed', (updatedBooking) => {
    if (!updatedBooking) return;
    const bId = String(updatedBooking._id || updatedBooking.id);
    const formatted = formatVendorBooking(updatedBooking);

    if (updatedBooking.bookingStatus === 'Completed' || updatedBooking.bookingStatus === 'Cancelled') {
      setJobs((prev) => prev.filter((j) => String(j.id) !== bId));
      setHistory((prev) => {
        const exists = prev.some((h) => String(h.id) === bId);
        return exists ? prev.map((h) => String(h.id) === bId ? formatted : h) : [formatted, ...prev];
      });
    } else {
      setJobs((prev) => {
        const exists = prev.some((j) => String(j.id) === bId);
        return exists ? prev.map((j) => String(j.id) === bId ? formatted : j) : [formatted, ...prev];
      });
    }
  });

  // 4. Booking cancelled by customer
  useSocketEvent('booking:cancelled', (cancelledBooking) => {
    if (!cancelledBooking) return;
    const bId = String(cancelledBooking._id || cancelledBooking.id);
    setJobs((prev) => prev.filter((j) => String(j.id) !== bId));
    showToast('A booking was cancelled by the customer.', 'warning');
  });

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
    const targetJob = jobs.find(j => String(j.id) === String(jobId) || String(j._id) === String(jobId));
    const backendBookingId = targetJob?._id || (targetJob?.id && /^[0-9a-fA-F]{24}$/.test(String(targetJob.id)) ? String(targetJob.id) : null) || (/^[0-9a-fA-F]{24}$/.test(String(jobId)) ? String(jobId) : null);

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') : null);

    if (backendBookingId) {
      if (!authToken) {
        showToast('Please log in as a vendor to accept bookings.', 'error');
        return;
      }
      setAcceptingJobId(jobId);
      try {
        const res = await acceptBookingApi(backendBookingId, authToken);
        if (res.success && res.booking) {
          const formatted = formatVendorBooking(res.booking);
          setJobs(prevJobs =>
            prevJobs.map(job =>
              (String(job.id) === String(jobId) || String(job._id) === String(backendBookingId) || String(job.id) === String(backendBookingId))
                ? { ...job, ...formatted, status: 'Accepted' }
                : job
            )
          );
          showToast(`Work Order ${targetJob?.displayId || formatted.displayId || jobId} accepted! Navigation route ready.`, 'success');
        } else {
          showToast(res.message || 'Booking is no longer available.', 'error');
          if (res.message && res.message.toLowerCase().includes('no longer available')) {
            setJobs(prevJobs => prevJobs.filter(job => String(job.id) !== String(jobId) && String(job._id) !== String(backendBookingId)));
          }
        }
      } catch (err) {
        console.error('[Vendor Dashboard] Accept booking error:', err);
        showToast(err.message || 'Failed to accept booking.', 'error');
      } finally {
        setAcceptingJobId(null);
      }
    } else {
      // Local mock job acceptance for sample preview data
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId ? { ...job, status: 'Accepted' } : job
        )
      );
      showToast(`Work Order ${targetJob?.displayId || jobId} accepted! Navigation route ready.`, 'success');
    }
  };

  // Start Service Prompt - Opens Map Screenshot & Route Distance Verification Modal
  const handlePromptStartService = (job) => {
    setPendingStartServiceJob(job);
    setShowStartServiceModal(true);
  };

  // Start Service execution view (Declared before handleConfirmStartService)
  const openServiceExecution = (job) => {
    if (!job) return;
    try {
      const sanitizedJob = {
        ...job,
        checklist: Array.isArray(job.checklist) ? job.checklist : normalizeChecklist(job.checklist),
        travelDistanceKm: Number(job.travelDistanceKm) || 0,
        mapScreenshot: safeImageUrl(job.mapScreenshot),
        customerName: safeString(job.customerName, 'Customer'),
        serviceAddress: safeString(job.serviceAddress, 'Customer Address'),
      };
      setSelectedJob(sanitizedJob);
      setActiveTab('service');
      if (job?.beforePhoto) {
        setBeforePhotoPreview(safeImageUrl(job.beforePhoto));
      } else {
        setBeforePhotoPreview(null);
        setBeforePhotoFile(null);
      }
      if (job?.afterPhoto) {
        setAfterPhotoPreview(safeImageUrl(job.afterPhoto));
      } else {
        setAfterPhotoPreview(null);
        setAfterPhotoFile(null);
      }
      setCustomerNotes(
        typeof job.notes === 'string' && job.notes.trim()
          ? job.notes
          : 'Recommended regular maintenance every 6 months to ensure optimal performance. All debris cleared from unit.'
      );
      try {
        if (job.id) {
          localStorage.setItem('mm_vendor_selected_job_id', String(job.id));
        }
      } catch (_) {}
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      console.error('[Vendor Dashboard] Error opening service execution:', err);
      setActiveTab('service');
    }
  };

  // Auto-restore selectedJob if vendor is on the service execution tab but selectedJob is unset
  useEffect(() => {
    if (activeTab === 'service' && !selectedJob && Array.isArray(jobs) && jobs.length > 0) {
      const candidate = jobs.find(j => j.status === 'In Progress') || jobs.find(j => j.status === 'Accepted') || jobs[0];
      if (candidate) {
        openServiceExecution(candidate);
      }
    }
  }, [activeTab, selectedJob, jobs]);

  const handleConfirmStartService = async ({ jobId, travelDistanceKm, travelRatePerKm, travelCharges, mapScreenshot, mapFile, addToInvoice }) => {
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

    const cleanMapScreenshot = safeImageUrl(mapScreenshot);
    const updatedJob = {
      ...targetJob,
      status: 'In Progress',
      travelDistanceKm: Number(travelDistanceKm),
      travelRatePerKm: Number(travelRatePerKm),
      travelCharges: Number(travelCharges),
      mapScreenshot: cleanMapScreenshot,
      travelVerified: true,
      checklist: Array.isArray(targetJob.checklist) ? targetJob.checklist : normalizeChecklist(targetJob.checklist),
      parts: updatedParts
    };

    setJobs(prevJobs => prevJobs.map(j => j.id === updatedJob.id ? updatedJob : j));
    setSelectedJob(updatedJob);
    setInvoiceParts(updatedParts);
    setShowStartServiceModal(false);
    setPendingStartServiceJob(null);
    openServiceExecution(updatedJob);

    showToast(`Work order started! Route verified (${travelDistanceKm} KM) & logged to invoice.`, 'success');

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') || localStorage.getItem('vendorToken') : null);
    const backendJobId = targetJob.backendJobId || targetJob._id || (targetJob.id && /^[0-9a-fA-F]{24}$/.test(String(targetJob.id)) ? String(targetJob.id) : null);
    if (authToken && backendJobId) {
      try {
        // Step 1: Ensure Booking is Accepted by this Vendor
        const isPending = targetJob.status === 'New Request' || targetJob.bookingStatus === 'Pending' || !targetJob.acceptedAt;
        if (isPending) {
          try {
            await acceptBookingApi(backendJobId, authToken);
          } catch (accErr) {
            console.warn('[Vendor Dashboard] Auto-accept notice:', accErr);
          }
        }

        // Step 2: Route Verification
        const formData = new FormData();
        formData.append('distanceKm', String(travelDistanceKm || 0));
        formData.append('ratePerKm', String(travelRatePerKm || 10));
        
        let fileToSend = mapFile;
        if (!fileToSend && mapScreenshot && typeof mapScreenshot === 'string') {
          if (mapScreenshot.startsWith('data:')) {
            const arr = mapScreenshot.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            fileToSend = new File([u8arr], `route_map_${backendJobId}.png`, { type: mime });
          } else if (mapScreenshot.startsWith('<svg')) {
            const blob = new Blob([mapScreenshot], { type: 'image/svg+xml' });
            fileToSend = new File([blob], `route_map_${backendJobId}.svg`, { type: 'image/svg+xml' });
          }
        }

        if (!fileToSend) {
          const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
          const bstr = atob(pngBase64);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          fileToSend = new File([u8arr], `route_map_${backendJobId}.png`, { type: 'image/png' });
        }

        formData.append('image', fileToSend);

        const routeRes = await routeVerificationApi(backendJobId, formData, authToken);
        if (!routeRes.success) {
          console.warn('[Vendor Dashboard] Route verification warning:', routeRes.message);
          await updateBookingStatusApi(backendJobId, { status: 'In Progress' }, authToken);
        }
      } catch (err) {
        console.error('[Vendor Dashboard] Start service error:', err);
        try {
          await updateBookingStatusApi(backendJobId, { status: 'In Progress' }, authToken);
        } catch (_) {}
      }
    }
  };

  const handleTrackJobNavigation = (job) => {
    if (!job) return;

    const customerCoords = extractCoordinates(job.customerLocation || job.customerCoordinates || job);
    const vendorCoords = extractCoordinates(vendorAddressObj || vendorProfile || user);
    const destinationAddress = job.serviceAddress || job.location;

    const navigationUrl = buildGoogleMapsNavigationUrl({
      customer: customerCoords,
      vendor: vendorCoords,
      destinationAddress,
    });

    window.open(navigationUrl, "_blank", "noopener,noreferrer");
  };

  const handleStartService = (job) => {
    handlePromptStartService(job);
  };

  const handleRejectJob = (jobId) => {
    setJobs(prevJobs => prevJobs.filter(j => j.id !== jobId));
    showToast(`Work Order ${jobId} declined.`, 'info');
  };

  // Toggle checklist item with jobs state sync
  const toggleChecklistItem = (itemId) => {
    if (!selectedJob) return;
    const currentList = Array.isArray(selectedJob.checklist) ? selectedJob.checklist : normalizeChecklist(selectedJob.checklist);
    const updatedChecklist = currentList.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedJob = { ...selectedJob, checklist: updatedChecklist };
    setSelectedJob(updatedJob);
    setJobs(prevJobs => prevJobs.map(j => j.id === selectedJob.id ? updatedJob : j));
  };

  // Real Photo Upload Handlers for Service Documentation
  const handleBeforePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBeforePhotoFile(file);
      setBeforePhotoPreview(URL.createObjectURL(file));
      showToast('Before service photo attached successfully!', 'success');
    }
  };

  const handleAfterPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAfterPhotoFile(file);
      setAfterPhotoPreview(URL.createObjectURL(file));
      showToast('After service photo attached successfully!', 'success');
    }
  };

  const handleRemoveBeforePhoto = () => {
    setBeforePhotoFile(null);
    setBeforePhotoPreview(null);
    if (beforeFileInputRef.current) beforeFileInputRef.current.value = '';
  };

  const handleRemoveAfterPhoto = () => {
    setAfterPhotoFile(null);
    setAfterPhotoPreview(null);
    if (afterFileInputRef.current) afterFileInputRef.current.value = '';
  };

  // Open Invoice Generation screen & submit Service Details & Checklist to backend
  const openGenerateInvoiceScreen = async () => {
    if (!selectedJob) return;
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

    // Submit service details & checklist to backend to transition ServiceExecution from 'Route Verified' to 'In Progress'
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') || localStorage.getItem('vendorToken') : null);
    const backendJobId = selectedJob.backendJobId || selectedJob._id || (selectedJob.id && /^[0-9a-fA-F]{24}$/.test(String(selectedJob.id)) ? String(selectedJob.id) : null);
    if (authToken && backendJobId) {
      try {
        // Step 1: Ensure Booking is Accepted
        const isPending = selectedJob.status === 'New Request' || selectedJob.bookingStatus === 'Pending' || !selectedJob.acceptedAt;
        if (isPending) {
          try {
            await acceptBookingApi(backendJobId, authToken);
          } catch (_) {}
        }

        // Step 2: Ensure Route Verification is Submitted if not already verified
        const dist = Number(selectedJob.travelDistanceKm) || 0;
        const rate = Number(selectedJob.travelRatePerKm) || 10;
        const rFormData = new FormData();
        rFormData.append('distanceKm', String(dist));
        rFormData.append('ratePerKm', String(rate));
        let fileToSend = selectedJob.mapFile || null;
        if (!fileToSend && selectedJob.mapScreenshot && typeof selectedJob.mapScreenshot === 'string') {
          if (selectedJob.mapScreenshot.startsWith('data:')) {
            const arr = selectedJob.mapScreenshot.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            fileToSend = new File([u8arr], `route_map_${backendJobId}.png`, { type: mime });
          }
        }
        if (!fileToSend) {
          const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
          const bstr = atob(pngBase64);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          fileToSend = new File([u8arr], `route_map_${backendJobId}.png`, { type: 'image/png' });
        }
        rFormData.append('image', fileToSend);
        try {
          await routeVerificationApi(backendJobId, rFormData, authToken);
        } catch (_) {}

        // Step 3: Submit service details & checklist
        const formData = new FormData();
        const currentChecklist = Array.isArray(selectedJob.checklist) ? selectedJob.checklist : normalizeChecklist(selectedJob.checklist);
        const checklistObj = {
          inspection: Boolean(currentChecklist.find(c => c.id === 1)?.completed ?? true),
          diagnosis: Boolean(currentChecklist.find(c => c.id === 2)?.completed ?? true),
          service: Boolean(currentChecklist.find(c => c.id === 3)?.completed ?? true),
          testingCleanup: Boolean(currentChecklist.find(c => c.id === 4)?.completed ?? true),
        };
        formData.append('checklist', JSON.stringify(checklistObj));
        formData.append('customerNote', customerNotes || 'Service completed successfully.');
        if (beforePhotoFile) {
          formData.append('beforeImage', beforePhotoFile);
        }
        if (afterPhotoFile) {
          formData.append('afterImage', afterPhotoFile);
        }
        await submitServiceDetailsApi(backendJobId, formData, authToken);
      } catch (err) {
        console.error('[Vendor Dashboard] Submit service details error:', err);
      }
    }
  };

  // Component Selection via Dropdown (immutably update state with inventory details & stock limits)
  const handleSelectComponentDropdown = (idx, selectedKey) => {
    const found = availableComponentOptions.find(c => c.inventoryId === selectedKey || c.name === selectedKey);
    setInvoiceParts(prev => {
      const updated = [...prev];
      const maxStock = found?.stock || 1;
      const currentQty = Number(updated[idx].qty) || 1;
      updated[idx] = {
        ...updated[idx],
        description: found ? found.name : selectedKey,
        price: found ? found.defaultPrice : (updated[idx].price || 0),
        inventoryId: found?.inventoryId || null,
        stock: found?.stock || 0,
        qty: Math.min(currentQty, maxStock),
      };
      return updated;
    });
  };

  // Quantity or Price change (enforces real inventory stock limits)
  const handlePartChange = (idx, field, value) => {
    setInvoiceParts(prev => {
      const updated = [...prev];
      let finalVal = value;
      if (field === 'qty') {
        const rawNum = Math.round(Number(value) || 1);
        const maxStock = updated[idx].stock;
        if (maxStock !== undefined && maxStock > 0 && rawNum > maxStock) {
          finalVal = maxStock;
          showToast(`Only ${maxStock} units of ${updated[idx].description} present in inventory`, 'warning');
        } else {
          finalVal = Math.max(1, rawNum);
        }
      }
      updated[idx] = {
        ...updated[idx],
        [field]: finalVal
      };
      return updated;
    });
  };

  // Add Row button adding a real component from live inventory catalog
  const handleAddPartRow = () => {
    if (!availableComponentOptions || availableComponentOptions.length === 0) {
      showToast('No components currently present in inventory', 'warning');
      return;
    }

    // Pick first component not yet added, or fallback to first
    const alreadyAddedIds = new Set(invoiceParts.map(p => p.inventoryId).filter(Boolean));
    const nextComp = availableComponentOptions.find(c => !alreadyAddedIds.has(c.inventoryId)) || availableComponentOptions[0];

    const newPart = {
      id: Date.now(),
      description: nextComp.name,
      qty: 1,
      price: nextComp.defaultPrice,
      inventoryId: nextComp.inventoryId,
      stock: nextComp.stock,
      locked: false,
    };
    setInvoiceParts(prev => [...prev, newPart]);
    showToast(`Added ${nextComp.name} (${nextComp.stock} in stock) to invoice`, 'info');
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
      invoiceId: selectedJob.backendJobId ? `MM-INV-2026-${selectedJob.backendJobId.slice(-6).toUpperCase()}` : `MM-INV-2026-${String(selectedJob.id).replace('WO-', '')}`,
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

    if (isCompletingService) return;
    setIsCompletingService(true);

    try {
      const paymentLabel = paymentMethod === 'upi' ? `Direct UPI Transfer (${vendorProfile.upiId})` : 'Direct Cash Transfer';

      const jobFinancials = calculateJobFinancials({
        invoiceData: { parts: invoiceParts },
        travelDistanceKm: selectedJob.travelDistanceKm || 0,
        travelRatePerKm: selectedJob.travelRatePerKm || 10,
        travelCharges: selectedJob.travelCharges || 0,
        mapScreenshot: selectedJob.mapScreenshot || null,
        amount: grandTotal
      });

      const vendorPayoutAmount = jobFinancials.totalVendorPayout;

      let finalInvoiceDataObj = {
        invoiceId: selectedJob.backendJobId ? `MM-INV-2026-${selectedJob.backendJobId.slice(-6).toUpperCase()}` : `MM-INV-2026-${String(selectedJob.id).replace('WO-', '')}`,
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

      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') || localStorage.getItem('vendorToken') : null);
      const backendJobId = selectedJob.backendJobId || selectedJob._id || (selectedJob.id && /^[0-9a-fA-F]{24}$/.test(String(selectedJob.id)) ? String(selectedJob.id) : null);

      if (authToken && backendJobId) {
        // Step 1: Ensure Booking is Accepted by this Vendor in MongoDB
        try {
          const isPending = selectedJob.status === 'New Request' || selectedJob.bookingStatus === 'Pending' || !selectedJob.acceptedAt;
          if (isPending) {
            console.log('[Vendor Dashboard] Auto-accepting booking before completion:', backendJobId);
            await acceptBookingApi(backendJobId, authToken);
          }
        } catch (accErr) {
          console.warn('[Vendor Dashboard] Auto-accept notice:', accErr);
        }

        // Step 2: Ensure Route Verification is Submitted (transitions Route Pending -> Route Verified)
        try {
          const dist = Number(selectedJob.travelDistanceKm) || 0;
          const rate = Number(selectedJob.travelRatePerKm) || 10;
          const rFormData = new FormData();
          rFormData.append('distanceKm', String(dist));
          rFormData.append('ratePerKm', String(rate));
          let fileToSend = selectedJob.mapFile || null;
          if (!fileToSend && selectedJob.mapScreenshot && typeof selectedJob.mapScreenshot === 'string') {
            if (selectedJob.mapScreenshot.startsWith('data:')) {
              const arr = selectedJob.mapScreenshot.split(',');
              const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) u8arr[n] = bstr.charCodeAt(n);
              fileToSend = new File([u8arr], `route_map_${backendJobId}.png`, { type: mime });
            }
          }
          if (!fileToSend) {
            const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            const bstr = atob(pngBase64);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            fileToSend = new File([u8arr], `route_map_${backendJobId}.png`, { type: 'image/png' });
          }
          rFormData.append('image', fileToSend);
          await routeVerificationApi(backendJobId, rFormData, authToken);
        } catch (rErr) {
          console.warn('[Vendor Dashboard] Route verification notice:', rErr);
        }

        // Step 3: Ensure Service Details & Checklist are Submitted (transitions Route Verified -> In Progress)
        try {
          const dFormData = new FormData();
          const checklistObj = {
            inspection: Boolean(selectedJob.checklist?.find(c => c.id === 1)?.completed ?? true),
            diagnosis: Boolean(selectedJob.checklist?.find(c => c.id === 2)?.completed ?? true),
            service: Boolean(selectedJob.checklist?.find(c => c.id === 3)?.completed ?? true),
            testingCleanup: Boolean(selectedJob.checklist?.find(c => c.id === 4)?.completed ?? true),
          };
          dFormData.append('checklist', JSON.stringify(checklistObj));
          dFormData.append('customerNote', customerNotes || 'Service completed successfully.');
          if (beforePhotoFile) dFormData.append('beforeImage', beforePhotoFile);
          if (afterPhotoFile) dFormData.append('afterImage', afterPhotoFile);
          await submitServiceDetailsApi(backendJobId, dFormData, authToken);
        } catch (dErr) {
          console.warn('[Vendor Dashboard] Service details notice:', dErr);
        }

        // Step 4: Build Valid components payload
        // Only include active components from live MongoDB inventory
        const validDbInventoryIds = new Set(
          (dbInventory || []).filter(i => i && i.inventoryId && i.isActive !== false).map(i => String(i.inventoryId).trim())
        );

        const componentsPayload = invoiceParts
          .filter(p => p.inventoryId && validDbInventoryIds.has(String(p.inventoryId).trim()) && !p.isTravel && !p.locked)
          .map(p => ({
            inventoryId: String(p.inventoryId).trim(),
            quantity: Math.max(1, Math.round(Number(p.qty) || 1))
          }));

        const completionPayload = {
          discount: Number(numDiscount) || 0,
          paymentMethod: paymentMethod === 'upi' ? 'UPI' : 'Cash',
          components: componentsPayload,
        };

        // Step 5: Complete Service in backend and generate real MongoDB invoice
        const completeRes = await completeServiceApi(backendJobId, completionPayload, authToken);
        console.log('[Vendor Dashboard] Complete service response:', completeRes);

        if ((completeRes.success || completeRes.alreadyGenerated) && completeRes.invoice) {
          const inv = completeRes.invoice;
          finalInvoiceDataObj = {
            invoiceId: inv.invoiceNumber || finalInvoiceDataObj.invoiceId,
            date: new Date(inv.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            customerName: inv.customerSnapshot?.name || selectedJob.customerName,
            customerPhone: inv.customerSnapshot?.phone || selectedJob.customerPhone,
            address: inv.customerSnapshot?.address || selectedJob.serviceAddress,
            serviceTitle: inv.serviceSnapshot?.serviceCategory || inv.serviceSnapshot?.appliance || selectedJob.serviceTitle,
            technician: vendorProfile.name,
            parts: (inv.items && inv.items.length > 0)
              ? inv.items.map(it => ({
                  description: it.name,
                  qty: it.quantity,
                  price: it.unitPrice,
                  isTravel: it.type === 'Travel',
                  isService: it.type === 'Service',
                  isComponent: it.type === 'Component',
                }))
              : invoiceParts,
            subtotal: inv.subtotal !== undefined ? inv.subtotal : subtotal,
            discount: inv.discount !== undefined ? inv.discount : numDiscount,
            tax: inv.tax !== undefined ? inv.tax : taxAmount,
            total: inv.totalAmount !== undefined ? inv.totalAmount : grandTotal,
            paymentMethod: inv.paymentMethod === 'UPI' ? `Direct UPI (${vendorProfile.upiId})` : 'Direct Cash Transfer',
            notes: inv.customerNote || customerNotes,
            status: 'PAID IN FULL',
            travelDistanceKm: selectedJob.travelDistanceKm || 0,
            travelRatePerKm: selectedJob.travelRatePerKm || 10,
            travelCharges: selectedJob.travelCharges || 0,
            mapScreenshot: selectedJob.mapScreenshot || null,
          };

          // Save invoice to local persistence so it's always accessible
          saveInvoiceForBooking(backendJobId, inv);

          // Synchronize booking serviceCharge in MongoDB so customer and vendor UI always fetch the exact invoiced price
          try {
            await updateBookingStatusApi(
              backendJobId,
              {
                status: 'Completed',
                serviceCharge: finalInvoiceDataObj.total || grandTotal,
                paymentMethod: paymentLabel,
                paymentStatus: 'Paid',
              },
              authToken
            );
          } catch (statusErr) {
            console.warn('[Vendor Dashboard] Failed to sync booking status serviceCharge:', statusErr);
          }
        } else {
          await updateBookingStatusApi(
            backendJobId,
            {
              status: 'Completed',
              serviceCharge: grandTotal,
              paymentMethod: paymentLabel,
              paymentStatus: 'Paid',
            },
            authToken
          );
          saveInvoiceForBooking(backendJobId, finalInvoiceDataObj);
        }
      }

      // Move job to History state with complete itemized financials
      const completedHistoryItem = {
        id: selectedJob.id,
        backendJobId: selectedJob.backendJobId || selectedJob._id || selectedJob.id,
        displayId: selectedJob.displayId || selectedJob.id,
        appliance: selectedJob.appliance,
        serviceTitle: selectedJob.serviceTitle,
        customerName: selectedJob.customerName,
        customerPhone: selectedJob.customerPhone,
        date: 'Just now',
        rawDate: new Date(),
        location: selectedJob.location,
        serviceAddress: selectedJob.serviceAddress,
        amount: finalInvoiceDataObj.total || grandTotal,
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
        review: `Service completed. ${paymentLabel} of ₹${(finalInvoiceDataObj.total || grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} received. Vendor Share (50% Service: ₹${jobFinancials.servicePayout.toFixed(2)} + Fuel: ₹${jobFinancials.fuelPayout.toFixed(2)}): ₹${vendorPayoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} added to wallet. Components (₹${jobFinancials.componentCharges.toFixed(2)}) excluded.`,
        mapScreenshot: selectedJob.mapScreenshot || null,
        travelVerified: Boolean(selectedJob.travelVerified || selectedJob.mapScreenshot),
        invoiceData: finalInvoiceDataObj
      };

      setHistory(prev => [completedHistoryItem, ...prev.filter(h => h.id !== selectedJob.id && (!backendJobId || h.backendJobId !== backendJobId))]);
      setJobs(prev => prev.filter(j => j.id !== selectedJob.id && (!backendJobId || (j.backendJobId !== backendJobId && j._id !== backendJobId))));

      setModalReturnTab('active');
      setGeneratedInvoiceData(finalInvoiceDataObj);
      setShowTaxInvoiceModal(true);
      showToast(`Service Completed! Invoice ${finalInvoiceDataObj.invoiceId} generated. ₹${vendorPayoutAmount.toFixed(2)} added to your payout balance.`, 'success');
    } catch (err) {
      console.error('[Vendor Dashboard] Error completing service:', err);
      showToast(err.message || 'Error completing service.', 'error');
    } finally {
      setIsCompletingService(false);
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
    const rawId = item.backendJobId || item.id || item._id;
    const inv = item.invoiceData || getInvoiceForBooking(rawId, item);
    const normalized = normalizeInvoiceForUI(inv, item);
    const invData = normalized || {
      invoiceId: item.invoiceNumber || (item.backendJobId ? `MM-INV-2026-${item.backendJobId.slice(-6).toUpperCase()}` : `MM-INV-2026-${String(item.id || '').replace('WO-', '')}`),
      date: item.date,
      customerName: item.customerName,
      customerPhone: item.customerPhone || '—',
      address: item.serviceAddress || item.location,
      serviceTitle: item.serviceTitle,
      technician: vendorProfile.name,
      parts: (item.rawBooking?.invoice?.items || []).length > 0 
        ? item.rawBooking.invoice.items.map(it => ({ description: it.name, qty: it.quantity, price: it.unitPrice }))
        : [{ description: item.serviceTitle, qty: 1, price: item.amount }],
      subtotal: parseFloat(item.amount) || 0,
      discount: 0,
      tax: 0,
      total: parseFloat(item.amount) || 0,
      paymentMethod: 'Direct Payment',
      notes: item.review || 'Service successfully completed.',
      status: 'PAID IN FULL',
      travelDistanceKm: item.travelDistanceKm || 0,
      travelRatePerKm: item.travelRatePerKm || 10,
      travelCharges: item.travelCharges || 0,
      mapScreenshot: item.mapScreenshot || null,
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
                    ...(selectedJob || jobs.some(j => j.status === 'In Progress')
                      ? [{ id: 'service', label: 'Service Execution', badge: 'Active' }]
                      : []),
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
                                        disabled={acceptingJobId === job.id}
                                        className={`flex-1 sm:flex-none px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl shadow-sm cursor-pointer transition-all ${acceptingJobId === job.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                      >
                                        {acceptingJobId === job.id ? (
                                          <span className="flex items-center gap-1.5">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            Accepting...
                                          </span>
                                        ) : (
                                          'Accept'
                                        )}
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
                                      <button
                                        type="button"
                                        onClick={() => handleTrackJobNavigation(job)}
                                        className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                                        title="Open live navigation in Google Maps"
                                      >
                                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                                        Track
                                      </button>
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
                  {safeString(selectedJob.serviceTitle, 'Service Execution')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Client: <strong>{safeString(selectedJob.customerName, 'Customer')}</strong> • {safeString(selectedJob.serviceAddress, 'Customer Address')}
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

              {/* Left Column (8 Cols): Status & Actions, Checklist, Customer Notes */}
              <div className="lg:col-span-8 space-y-6">

                {/* 1. SERVICE STATUS & ACTION CARD */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                      SERVICE STATUS
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2 mt-1">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                      Service In Progress
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {!selectedJob?.travelVerified && (
                      <button
                        type="button"
                        onClick={() => handlePromptStartService(selectedJob)}
                        className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Navigation className="w-4 h-4" />
                        Log Travel / KM
                      </button>
                    )}

                    <button
                      onClick={openGenerateInvoiceScreen}
                      className="w-full sm:w-auto px-6 py-3.5 bg-[#061e38] hover:bg-[#0a2f57] text-white rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                          Origin: <strong>{safeString(vendorProfile?.address, 'Vendor Workshop')}</strong> ➔ Destination: <strong>{safeString(selectedJob.serviceAddress, 'Customer Location')}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {selectedJob.mapScreenshot && (
                        <button
                          type="button"
                          onClick={() => setProofPreviewItem({
                            imageUrl: safeImageUrl(selectedJob.mapScreenshot),
                            title: `Route Map: ${safeString(selectedJob.displayId || selectedJob.id)}`,
                            subtitle: `${selectedJob.travelDistanceKm || 0} KM Traveled to ${safeString(selectedJob.customerName, 'Customer')}`
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
                {(() => {
                  const currentChecklist = Array.isArray(selectedJob.checklist) ? selectedJob.checklist : normalizeChecklist(selectedJob.checklist);
                  const completedCount = currentChecklist.filter(c => c.completed).length;
                  const totalCount = currentChecklist.length;

                  return (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Service Checklist</h3>
                        <span className="text-xs font-extrabold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                          {completedCount} / {totalCount} Completed
                        </span>
                      </div>

                      <div className="space-y-3">
                        {currentChecklist.map((item) => (
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
                  );
                })()}

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
                    <span className="text-[11px] font-bold text-slate-400">
                      {(beforePhotoPreview ? 1 : 0) + (afterPhotoPreview ? 1 : 0)} Attached
                    </span>
                  </div>

                  {/* Hidden Real File Inputs */}
                  <input
                    type="file"
                    ref={beforeFileInputRef}
                    accept="image/*"
                    onChange={handleBeforePhotoChange}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={afterFileInputRef}
                    accept="image/*"
                    onChange={handleAfterPhotoChange}
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    {/* Before Service Photo */}
                    {beforePhotoPreview ? (
                      <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900">
                        <img
                          src={beforePhotoPreview}
                          alt="Before Service"
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          BEFORE
                        </span>
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setProofPreviewItem({
                              imageUrl: safeImageUrl(beforePhotoPreview),
                              title: 'Before Service Photo',
                              subtitle: safeString(selectedJob.serviceTitle, 'Service Photo')
                            })}
                            className="bg-white/90 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                            title="Preview Image"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveBeforePhoto}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => beforeFileInputRef.current?.click()}
                        className="h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50 hover:bg-orange-50/30 flex flex-col items-center justify-center text-slate-400 hover:text-orange-600 cursor-pointer transition-all p-3 text-center"
                      >
                        <Camera className="w-6 h-6 mb-1 text-slate-400" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">BEFORE PHOTO</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Click to upload</span>
                      </div>
                    )}

                    {/* After Service Photo */}
                    {afterPhotoPreview ? (
                      <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900">
                        <img
                          src={afterPhotoPreview}
                          alt="After Service"
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                        <span className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-500/30">
                          AFTER
                        </span>
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setProofPreviewItem({
                              imageUrl: safeImageUrl(afterPhotoPreview),
                              title: 'After Service Photo',
                              subtitle: safeString(selectedJob.serviceTitle, 'Service Photo')
                            })}
                            className="bg-white/90 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                            title="Preview Image"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveAfterPhoto}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => afterFileInputRef.current?.click()}
                        className="h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/30 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 cursor-pointer transition-all p-3 text-center"
                      >
                        <Camera className="w-6 h-6 mb-1 text-slate-400" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">AFTER PHOTO</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Click to upload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* APPOINTMENT DETAILS CARD */}
                <div className="bg-[#061e38] text-white rounded-2xl p-5 shadow-md space-y-4">
                  <h3 className="text-base font-extrabold text-white border-b border-slate-700/60 pb-2.5">
                    Appointment Details
                  </h3>

                  <div className="space-y-3 text-xs text-slate-200 font-medium">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{safeString(selectedJob.appointmentDate, '—')}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{safeString(selectedJob.timeSlot, '—')}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{safeString(selectedJob.customerName, 'Customer')} (Residential)</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                      <Link to={`tel:${safeString(selectedJob.customerPhone, '')}`} className="hover:underline text-white font-bold">
                        {safeString(selectedJob.customerPhone, '—')}
                      </Link>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTrackJobNavigation(selectedJob)}
                    className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 block text-center cursor-pointer"
                    title="Open live navigation in Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    Track on Map
                  </button>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* ── SERVICE EXECUTION EMPTY FALLBACK STATE ── */}
        {activeTab === 'service' && !selectedJob && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center max-w-xl mx-auto my-12 space-y-4 no-print-bg">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-bold">
              <Wrench className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">No Active Service Order</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              Select an accepted work order from your active jobs queue and click &quot;Start Service&quot; or &quot;Resume Execution&quot; to begin service execution.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className="px-6 py-3 bg-[#061e38] hover:bg-[#0a2f57] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              &larr; View Active Jobs
            </button>
          </div>
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
                        value={safeString(selectedJob.customerName, 'Customer')}
                        className="w-full text-xs font-bold bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Address</label>
                      <input
                        type="text"
                        readOnly
                        value={safeString(selectedJob.serviceAddress, '—')}
                        className="w-full text-xs font-bold bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Appliance Type</label>
                      <input
                        type="text"
                        readOnly
                        value={`${selectedJob.applianceIcon || '🔧'} ${safeString(selectedJob.serviceTitle, 'Service')}`}
                        className="w-full text-xs font-bold bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Date</label>
                      <input
                        type="text"
                        readOnly
                        value={safeString(selectedJob.appointmentDate, '—')}
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
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Select repair components from live inventory catalog ({availableComponentOptions.length} items present in stock)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchLiveInventory}
                        disabled={isInventoryLoading}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-slate-200"
                        title="Fetch latest stock quantity from database inventory"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isInventoryLoading ? 'animate-spin text-orange-500' : 'text-slate-500'}`} />
                        <span>{isInventoryLoading ? 'Syncing...' : 'Refresh Stock'}</span>
                      </button>

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
                        disabled={availableComponentOptions.length === 0}
                        className="text-xs font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-blue-200"
                      >
                        <PlusCircle className="w-4 h-4 text-blue-700" />
                        Add Component ({availableComponentOptions.length} in stock)
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
                                  <div>
                                    <select
                                      value={part.inventoryId || part.description}
                                      onChange={(e) => handleSelectComponentDropdown(idx, e.target.value)}
                                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    >
                                      {availableComponentOptions.length === 0 ? (
                                        <option value="" disabled>No components present in inventory</option>
                                      ) : (
                                        availableComponentOptions.map((comp) => (
                                          <option key={comp.inventoryId} value={comp.inventoryId}>
                                            {comp.name} (₹{comp.defaultPrice}) — Stock: {comp.stock} available
                                          </option>
                                        ))
                                      )}
                                    </select>
                                    {part.inventoryId && (
                                      <div className="flex items-center gap-2 mt-1 px-1 text-[11px]">
                                        <span className="text-slate-500 font-medium">SKU: <strong className="text-slate-700">{part.inventoryId}</strong></span>
                                        <span className="text-slate-300">•</span>
                                        <span className={`font-bold ${part.stock <= 3 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                          {part.stock} in inventory
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="p-3 text-center">
                                {part.locked ? (
                                  <span className="font-extrabold text-slate-800">{part.qty}</span>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <input
                                      type="number"
                                      min="1"
                                      max={part.stock || 999}
                                      step="1"
                                      value={part.qty}
                                      onChange={(e) => handlePartChange(idx, 'qty', e.target.value)}
                                      className="w-16 text-center text-xs font-extrabold bg-white border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-orange-500"
                                    />
                                    {part.stock !== undefined && (
                                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                        Max: {part.stock}
                                      </span>
                                    )}
                                  </div>
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
                    disabled={isCompletingService}
                    className={`w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      isCompletingService ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isCompletingService ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Generating Invoice &amp; Completing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 fill-white" />
                        <span>➤ Generate &amp; Complete Service</span>
                      </>
                    )}
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
                  src={safeImageUrl(proofPreviewItem.imageUrl) || proofPreviewItem.imageUrl}
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
