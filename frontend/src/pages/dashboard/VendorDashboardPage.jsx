import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wrench, ShieldCheck, Star, Clock, MapPin, Phone, Navigation,
  CheckCircle2, XCircle, AlertCircle, IndianRupee, TrendingUp,
  User, CreditCard, Award, Calendar, ChevronRight, Power,
  FileText, Check, Plus, Search, Filter, RefreshCw, Bell,
  Tv, Zap, Thermometer, ArrowUpRight, ChevronDown, Building,
  Sliders, Shield, MessageSquare, ExternalLink, AlertTriangle,
  Play, Pause, Square, Camera, Trash2, Send, Eye, Lock,
  PlusCircle, CheckSquare, Square as SquareOutline, QrCode, Smartphone,
  Printer, X, Download
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import PageLoader from '../../components/common/PageLoader';
import VendorPayoutModal from '../../components/dashboard/vendor/VendorPayoutModal';
import VendorTaxInvoiceModal from '../../components/dashboard/vendor/VendorTaxInvoiceModal';
import VendorAddressModal from '../../components/dashboard/vendor/VendorAddressModal';
import { useAuth } from '../../context/AuthContext';
import { getVendorBookingsApi } from '../../services/operations/bookingAPI';
import { saveVendorAddressApi } from '../../services/operations/addressAPI';
import { updateVendorProfileApi, getVendorProfileApi } from '../../services/operations/vendorAPI';


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

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const { token, user, loading, location, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'service', 'invoice', 'history', 'earnings', 'profile'
  const [isOnline, setIsOnline] = useState(true);

  // Role guard — ensure user has vendor access
  useEffect(() => {
    if (loading) return; // wait for auth to rehydrate
    if (!user) {
      navigate('/login', { state: { from: '/vendor-dashboard', isVendorLogin: true }, replace: true });
      return;
    }
    const role = (user.role || '').toLowerCase();
    const hasVendorAccess = role === 'vendor' || role === 'admin' || !!user.vendorId;
    if (!hasVendorAccess) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <PageLoader />;

  // Scroll to top whenever tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  
  // Real live backend state
  const [jobs, setJobs] = useState([]);
  const [history, setHistory] = useState([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [rating, setRating] = useState(5.0);
  const [totalJobsDone, setTotalJobsDone] = useState(0);

  // Fetch Vendor Bookings from backend
  useEffect(() => {
    const fetchBookings = async () => {
      if (token) {
        try {
          const res = await getVendorBookingsApi(token);
          if (res.success && res.bookings) {
            const formatted = res.bookings.map(b => ({
              id: b.bookingId || b._id,
              appliance: b.appliance || 'General',
              applianceIcon: '🔧',
              serviceTitle: b.serviceCategory || b.appliance || 'Service Request',
              status: b.bookingStatus || 'New Request',
              timeSlot: b.timeSlot || '—',
              appointmentDate: b.serviceDate ? new Date(b.serviceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—',
              customerName: b.customer?.fullName || 'Customer',
              customerPhone: b.customer?.phoneNumber || '—',
              serviceAddress: b.address || '—',
              location: b.address || '—',
              distance: 'Nearby',
              issue: b.issue || b.description || 'Service required',
              estimatedPay: b.serviceCharge || b.estimatedPay || 0,
              amount: b.serviceCharge || 0,
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
                { id: 1, description: 'Diagnostic & Service Charge', qty: 1, price: b.serviceCharge || 450, locked: true },
              ],
            }));

            const activeList = formatted.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled' && b.status !== 'Closed');
            const historyList = formatted.filter(b => b.status === 'Completed' || b.status === 'Cancelled' || b.status === 'Closed');

            setJobs(activeList);
            setHistory(historyList);

            // Compute total earnings and completed jobs
            const completedSum = historyList
              .filter(b => b.status === 'Completed')
              .reduce((sum, b) => sum + (Number(b.amount) || Number(b.estimatedPay) || 0), 0);
            setTodayEarnings(completedSum);
            setTotalJobsDone(historyList.filter(b => b.status === 'Completed').length);
          }
        } catch (err) {
          console.error('[Vendor Dashboard] Error fetching bookings:', err);
        }
      }
    };
    fetchBookings();
  }, [token]);

  // Compute weekly earnings chart from real history data
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
          days[dayIdx].amount += (Number(item.amount) || Number(item.estimatedPay) || 0);
        }
      }
    });

    const maxAmount = Math.max(...days.map(d => d.amount), 1000);
    days.forEach(d => {
      const pct = Math.max(10, Math.round((d.amount / maxAmount) * 100));
      d.height = `${pct}%`;
    });

    return days;
  }, [history]);

  // Compute lifetime earnings from real completed history
  const lifetimeEarnings = useMemo(() => {
    return history
      .filter(h => h.status === 'Completed')
      .reduce((sum, h) => sum + (Number(h.amount) || Number(h.estimatedPay) || 0), 0);
  }, [history]);

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

  // Profile
  const [vendorProfile, setVendorProfile] = useState({
    name: user?.fullName || '',
    vendorId: user?.vendorId || '',
    title: 'Service Technician',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    upiId: '',
    address: user?.location && user?.location !== 'Set Your Location' ? user.location : '',
    serviceRadius: 10,
    nablId: 'NABL-VERIFIED',
    bankName: '',
    bankAccount: '',
    ifsc: '',
    appliancesServed: [],
    profileImage: user?.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState(vendorProfile);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Fetch Vendor Profile from backend
  useEffect(() => {
    const fetchVendorProfileData = async () => {
      if (!token) return;
      try {
        const res = await getVendorProfileApi(token);
        if (res.success && res.vendorProfile) {
          const vp = res.vendorProfile;
          const u = vp.user || {};
          const loadedProfile = {
            name: u.fullName || vp.name || (user?.fullName || ''),
            vendorId: vp.vendorId || u.vendorId || (user?.vendorId || ''),
            title: vp.professionalTitle || 'Service Technician',
            phone: u.phoneNumber || (user?.phoneNumber || ''),
            email: u.email || (user?.email || ''),
            upiId: vp.vendorUpiId || '',
            address: vp.serviceAddress || u.location || (location !== 'Set Your Location' ? location : ''),
            serviceRadius: vp.serviceRadius ?? 10,
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
      } catch (err) {
        console.error('[Vendor Dashboard] Failed to load vendor profile:', err);
      }
    };
  }, [token]);

  // Sync profile with user context / location changes if vendorProfile is still empty
  useEffect(() => {
    if (user) {
      const u = user.user || user;
      const actualLocation = location && location !== 'Set Your Location' ? location : (u.location || user.serviceAddress || vendorProfile.address);
      
      setVendorProfile((prev) => ({
        ...prev,
        name: u.fullName || prev.name,
        email: u.email || prev.email,
        phone: u.phoneNumber || prev.phone,
        address: actualLocation || prev.address,
        title: user.professionalTitle || prev.title,
        upiId: user.vendorUpiId || prev.upiId,
        appliancesServed: user.appliancesServed?.length ? user.appliancesServed : prev.appliancesServed,
        bankName: user.bankDetails?.bankName || prev.bankName,
        bankAccount: user.bankDetails?.accountNumber || prev.bankAccount,
        ifsc: user.bankDetails?.ifsc || prev.ifsc,
        profileImage: user.profileImage?.url || (typeof user.profileImage === 'string' ? user.profileImage : null) || prev.profileImage,
        nablId: user.certification?.certificationId || prev.nablId,
        serviceRadius: user.serviceRadius ?? prev.serviceRadius,
      }));
    }
  }, [user, location]);

  const handleSaveVendorAddress = async (addressData) => {
    const displayAddress = addressData.formattedAddress || addressData;
    setVendorProfile((prev) => ({ ...prev, address: displayAddress }));
    setEditProfileForm((prev) => ({ ...prev, address: displayAddress }));

    try {
      const payload = {
        addressType: addressData.addressType || 'Other',
        house:       addressData.flat    || '',
        flat:        addressData.flat    || '',
        street:      addressData.street  || '',
        landmark:    addressData.landmark || '',
        city:        addressData.city    || '',
        state:       addressData.state   || '',
        country:     'India',
        pincode:     addressData.pincode || '000000',
        isDefault:   true,
      };

      console.log('[Vendor Dashboard] 📍 Saving vendor location to User Location Save module...', payload);

      const result = await saveVendorAddressApi(payload, token);

      // Also persist serviceAddress on VendorProfile in backend
      const formData = new FormData();
      formData.append('serviceAddress', displayAddress);
      await updateVendorProfileApi(formData, token);

      if (result.success) {
        console.log(
          '%c[Magic Mistry] ✅ Vendor location saved into the User Location Save module',
          'color: #22c55e; font-weight: bold; font-size: 13px;'
        );
        showToast('Service address saved successfully!', 'success');
      } else {
        showToast('Service address updated successfully!', 'success');
      }
    } catch (err) {
      console.error('[Vendor Dashboard] ❌ Failed to save vendor address to backend:', err);
      showToast('Service address updated locally.', 'info');
    }
  };

  const handleSaveVendorProfile = async () => {
    try {
      console.log('[Vendor Dashboard] 🚀 handleSaveVendorProfile triggered');
      showToast('Saving vendor profile...', 'info');
      
      const formData = new FormData();
      
      // User Fields
      if (editProfileForm.name) formData.append('fullName', editProfileForm.name);
      if (editProfileForm.phone) formData.append('phoneNumber', editProfileForm.phone);
      
      // Vendor Fields
      if (editProfileForm.upiId) formData.append('vendorUpiId', editProfileForm.upiId);
      if (editProfileForm.title) formData.append('professionalTitle', editProfileForm.title);
      if (editProfileForm.address) formData.append('serviceAddress', editProfileForm.address);
      if (editProfileForm.serviceRadius !== undefined) formData.append('serviceRadius', editProfileForm.serviceRadius);
      
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
      
      // Profile Image
      if (editProfileForm.profileImageFile) {
        formData.append('profileImage', editProfileForm.profileImageFile);
      }
      
      console.log('[Vendor Dashboard] 📤 Sending FormData payload to backend...');
      const result = await updateVendorProfileApi(formData, token);
      console.log('[Vendor Dashboard] 📥 Backend response:', result);
      
      if (result.success) {
        const rawProfileImage = result.data?.vendorProfile?.profileImage;
        const finalProfileImage = (typeof rawProfileImage === 'object' ? rawProfileImage?.url : rawProfileImage) || editProfileForm.profileImage;
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
          serviceRadius: updatedVp.serviceRadius ?? editProfileForm.serviceRadius,
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

  // Accept / Reject
  const handleAcceptJob = (jobId) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, status: 'Accepted' } : job
      )
    );
    showToast(`Work Order ${jobId} accepted! Navigation route ready.`, 'success');
  };

  const handleStartService = (job) => {
    setJobs(prevJobs =>
      prevJobs.map(j =>
        j.id === job.id ? { ...j, status: 'In Progress' } : j
      )
    );
    openServiceExecution({ ...job, status: 'In Progress' });
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
    setInvoiceParts(selectedJob.parts || []);
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
      status: 'PAID IN FULL'
    };
    setModalReturnTab('invoice');
    setGeneratedInvoiceData(data);
    setShowTaxInvoiceModal(true);
  };

  // Finalize & Send Invoice -> Complete Service & Move to History!
  const handleGenerateAndSendInvoice = () => {
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
      status: 'PAID IN FULL'
    };

    // Calculate 50% Vendor Share
    const vendorShare = grandTotal * 0.5;

    // Move job to History state
    const completedHistoryItem = {
      id: selectedJob.id,
      appliance: selectedJob.appliance,
      serviceTitle: selectedJob.serviceTitle,
      customerName: selectedJob.customerName,
      date: 'Just now',
      location: selectedJob.location,
      amount: grandTotal,
      rating: 5,
      status: 'Completed',
      review: `Service completed. ${paymentLabel} of ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} received. Vendor Share (50%): ₹${vendorShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })} added to wallet.`,
      invoiceData: invoiceDataObj
    };

    setTodayEarnings(prev => prev + vendorShare);
    setTotalJobsDone(prev => prev + 1);
    setHistory(prev => [completedHistoryItem, ...prev]);
    setJobs(prev => prev.filter(j => j.id !== selectedJob.id));

    setModalReturnTab('active');
    setGeneratedInvoiceData(invoiceDataObj);
    setShowTaxInvoiceModal(true);
    showToast(`Service Completed! Invoice ${invoiceDataObj.invoiceId} generated & moved to History.`, 'success');
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
                    { id: 'earnings', label: 'Earnings', badge: `₹${(todayEarnings/1000).toFixed(1)}k` },
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
                      <option value="AC Repair">AC Repair</option>
                      <option value="Washing Machine">Washing Machine</option>
                      <option value="Refrigerator">Refrigerator</option>
                    </select>
                  </div>
                </div>

                {/* Job Cards */}
                <div className="space-y-4">
                  {jobs.filter(j => filterCategory === 'All' || j.appliance.includes(filterCategory)).length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-60" />
                      <h3 className="text-base font-bold text-slate-800">All work orders clear!</h3>
                      <p className="text-xs text-slate-500 mt-1">Stay online to receive incoming customer service calls.</p>
                    </div>
                  ) : (
                    jobs
                      .filter(j => filterCategory === 'All' || j.appliance.includes(filterCategory))
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
                                      {job.id}
                                    </span>
                                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                      isNew ? 'bg-orange-100 text-orange-700' : 
                                      job.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                                      'bg-[#061e38] text-white'
                                    }`}>
                                      {job.status}
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
                                        rel="noreferrer"
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
                      onClick={() => setIsTimerRunning(prev => !prev)}
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
                    rel="noreferrer"
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

                    <button
                      onClick={handleAddPartRow}
                      className="text-xs font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-blue-200"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-700" />
                      Add Component Row
                    </button>
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
                history.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col gap-3 bg-white hover:border-blue-300 transition-all">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{item.id}</span>
                        <span className="text-xs text-slate-400">{item.date}</span>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{item.status}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">{item.serviceTitle}</h3>
                      <p className="text-xs text-slate-600">Customer: <strong>{item.customerName}</strong> • {item.location}</p>
                      {item.review && <p className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded-xl mt-1">"{item.review}"</p>}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold">Total Invoice</span>
                        <span className="text-lg font-extrabold text-slate-900">₹{typeof item.amount === 'number' ? item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : item.amount}</span>
                        <div className="text-amber-500 text-xs font-bold">{'★'.repeat(item.rating || 5)}</div>
                      </div>

                      <button
                        onClick={() => handleViewHistoryInvoice(item)}
                        className="px-4 py-2 bg-[#061e38] hover:bg-[#0a2f57] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-orange-400" />
                        <span className="hidden sm:inline">View &amp; Download Invoice &rarr;</span>
                        <span className="sm:hidden">View Invoice</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}


        {/* ── TAB 3: EARNINGS ── */}
        {activeTab === 'earnings' && (
          <div className="space-y-4 sm:space-y-6 no-print-bg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Earnings & Payouts</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your earnings, view history, and request payouts to your bank account.</p>
              </div>
              <button
                onClick={handleRequestPayout}
                disabled={payoutRequested || todayEarnings <= 0}
                className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md ${
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Lifetime Earnings</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">₹{lifetimeEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm relative overflow-hidden">
                {payoutRequested && (
                  <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    PROCESSING
                  </div>
                )}
                <p className="text-xs font-bold text-slate-400 uppercase">Available Payout</p>
                <p className={`text-2xl sm:text-3xl font-extrabold mt-1 ${payoutRequested ? 'text-emerald-600' : 'text-orange-600'}`}>
                  ₹{todayEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Bank Account</p>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 break-all">{vendorProfile.bankAccount || 'Not Provided'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{vendorProfile.ifsc || 'IFSC: —'}</p>
              </div>
            </div>

            {/* Payout History / Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">Recent Payouts</h3>
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
                      <p className="text-xs text-amber-600 font-bold">Pending</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <IndianRupee className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-slate-700">No past payouts yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">When you complete jobs and request payouts, your payout history will appear here.</p>
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
                      <span>{vendorProfile.address}</span>
                      <span className="text-[10px] text-orange-600 font-extrabold bg-orange-100 px-1.5 py-0.5 rounded ml-0.5">Change</span>
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
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-3 text-center">
                    <p className="text-sm sm:text-xl font-extrabold text-slate-900">{vendorProfile.serviceRadius}km</p>
                    <p className="text-[9px] sm:text-xs text-slate-500 font-semibold mt-0.5">Radius</p>
                  </div>
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
                      vendorProfile.appliancesServed.map((appliance, i) => (
                        <span key={i} className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {appliance}
                        </span>
                      ))
                    ) : (
                      ALL_APPLIANCES.map((appliance) => {
                        const isSelected = editProfileForm.appliancesServed.includes(appliance);
                        return (
                          <button
                            key={appliance}
                            onClick={() => {
                              const newAppliances = isSelected
                                ? editProfileForm.appliancesServed.filter(a => a !== appliance)
                                : [...editProfileForm.appliancesServed, appliance];
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
                        {vendorProfile.address}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Update Address</span>
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
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                        {label} <span className="text-red-500">*</span>
                      </label>
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
                          value={editProfileForm[field]}
                          onChange={e => setEditProfileForm({...editProfileForm, [field]: e.target.value})}
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
          payoutDays={payoutDays}
          setPayoutDays={setPayoutDays}
          payoutNotes={payoutNotes}
          setPayoutNotes={setPayoutNotes}
          handleConfirmPayout={handleConfirmPayout}
        />

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
          initialAddress={editProfileForm.address || vendorProfile.address}
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
