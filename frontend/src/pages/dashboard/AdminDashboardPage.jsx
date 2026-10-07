import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import AdminRestockModal from '../../components/dashboard/admin/AdminRestockModal';
import AdminAddInventoryModal from '../../components/dashboard/admin/AdminAddInventoryModal';
import AdminCredsSuccessModal from '../../components/dashboard/admin/AdminCredsSuccessModal';
import AdminViewCredsModal from '../../components/dashboard/admin/AdminViewCredsModal';
import AdminApplicationModal from '../../components/dashboard/admin/AdminApplicationModal';
import AdminDispatchModal from '../../components/dashboard/admin/AdminDispatchModal';
import AdminWorkReportModal from '../../components/dashboard/admin/AdminWorkReportModal';
import AdminExportModal from '../../components/dashboard/admin/AdminExportModal';
import AdminEditUserModal from '../../components/dashboard/admin/AdminEditUserModal';
import AdminServicePricingTab from '../../components/dashboard/admin/AdminServicePricingTab';
import {
  LayoutDashboard, Users, FileText, UserPlus, TrendingUp,
  Package, AlertTriangle, Truck, DollarSign, Search, ChevronDown,
  Edit3, Plus, Trash2, Check, X, Shield, Lock, Clock, ShieldCheck, Mail,
  Copy, Download, Filter, RefreshCw, LogOut, ChevronRight, ChevronLeft, Eye,
  CheckCircle2, AlertCircle, Wrench, IndianRupee, ArrowUpRight,
  FileCheck, UserCheck, UserX, ExternalLink, Briefcase, MapPin, Phone, User,
  Snowflake, Droplets, Store, Star, BadgeCheck, BadgeIcon, Contact, Ban, UserMinus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import {
  approveVendorApplication,
  getAllVendorApplications,
  rejectVendorApplication,
  createVendorByAdminApi,
  getVendorCredentialsApi,
  updateUserStatusApi,
  getAllUsersApi,
  getAllInventoryApi,
  createInventoryApi,
  deleteInventoryApi,
  restockInventoryApi,
} from '../../services/api';
import { getAdminBookingsApi } from '../../services/operations/bookingAPI';
import { getLiveServicePricing } from '../../services/pricingService';

// ─── Service Specializations (Exact match to Vendor Application Categories) ──
export const SERVICE_SPECIALIZATIONS = [
  'AC Repair',
  'Refrigerator Repair',
  'Washing Machine Repair',
  'Microwave Repair',
  'Mixer Grinder Repair',
  'Pump Motor Repair',
  'Air Cooler Repair',
  'Induction Cooktop Repair',
  'Stabilizer Repair',
  'Press Iron Repair',
  'TV Repair',
  'Ceiling Fan Repair',
  'Geyser Repair',
  'Wiring / Switch Board',
  'Other Appliances',
  'HVAC Specialist',
  'Appliance Expert',
  'Electrical Repair',
  'Plumbing Engineer',
];
// ─── Master Real Inventory Catalog (Real Genuine Spare Parts & Stock) ────────
export const MASTER_REAL_INVENTORY = [
  // ─── Cooling & Air Conditioning ───
  {
    id: '#INV-1001',
    name: 'AC Dual Run Capacitor (45+5 µF / 440V)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 35,
    unitPrice: 249.00,
    lastUpdated: 'Today, 11:15 AM',
    sku: 'ACC-CAP-45UF',
    reorderPoint: 10,
    supplier: 'EPCOS / TDK Electronics'
  },
  {
    id: '#INV-1002',
    name: 'Refrigerant R32 Eco Gas Canister (800g)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 18,
    unitPrice: 1450.00,
    lastUpdated: 'Today, 09:30 AM',
    sku: 'ACC-GAS-R32',
    reorderPoint: 8,
    supplier: 'Fluoron / SRF Ltd'
  },
  {
    id: '#INV-1003',
    name: 'AC Rotary Compressor (1.5 Ton Inverter)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 6,
    unitPrice: 4850.00,
    lastUpdated: 'Yesterday, 17:20',
    sku: 'ACC-COMP-15T',
    reorderPoint: 3,
    supplier: 'Highly / GMCC Tech'
  },
  {
    id: '#INV-1004',
    name: 'Insulated Copper Pipe Pair (1/4" + 1/2" x 10ft)',
    category: 'Plumbing',
    stockLevel: 'In Stock',
    stockCount: 24,
    unitPrice: 850.00,
    lastUpdated: 'Yesterday, 14:10',
    sku: 'ACC-CU-PIPE10',
    reorderPoint: 10,
    supplier: 'Mandev Tubes India'
  },
  {
    id: '#INV-1005',
    name: 'AC Contactor Relay (2-Pole 30A Heavy Duty)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 14,
    unitPrice: 380.00,
    lastUpdated: 'Yesterday, 10:45',
    sku: 'ACC-REL-30A',
    reorderPoint: 5,
    supplier: 'L&T Electrical'
  },
  {
    id: '#INV-1006',
    name: 'Universal AC Indoor Cross-Flow Blower Fan',
    category: 'Appliance',
    stockLevel: 'Low Stock',
    stockCount: 3,
    unitPrice: 620.00,
    lastUpdated: 'Today, 08:40 AM',
    sku: 'ACC-BLW-FAN',
    reorderPoint: 5,
    supplier: 'Voltas Spares'
  },

  // ─── Refrigeration ───
  {
    id: '#INV-1007',
    name: 'Universal Refrigerator Inverter PCB Driver Board',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 8,
    unitPrice: 2150.00,
    lastUpdated: 'Today, 10:45 AM',
    sku: 'REF-PCB-INV',
    reorderPoint: 4,
    supplier: 'Samsung OEM Spares'
  },
  {
    id: '#INV-1008',
    name: 'Double Door Defrost Sensor & Bi-Metal Kit',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 22,
    unitPrice: 449.00,
    lastUpdated: 'Yesterday, 16:00',
    sku: 'REF-SEN-DEF',
    reorderPoint: 8,
    supplier: 'LG Electronics'
  },
  {
    id: '#INV-1009',
    name: 'Refrigerator Mechanical Thermostat (VT9)',
    category: 'Appliance',
    stockLevel: 'Low Stock',
    stockCount: 4,
    unitPrice: 350.00,
    lastUpdated: 'Yesterday, 14:05',
    sku: 'REF-TH-VT9',
    reorderPoint: 8,
    supplier: 'Ranco Controls'
  },
  {
    id: '#INV-1010',
    name: 'Magnetic Door Gasket Seal Strip (1.2m)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 12,
    unitPrice: 620.00,
    lastUpdated: 'Yesterday, 12:30',
    sku: 'REF-GST-MAG',
    reorderPoint: 5,
    supplier: 'Godrej Appliances'
  },
  {
    id: '#INV-1011',
    name: 'PTC Starter Relay & Overload Protector (1/6 HP)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 30,
    unitPrice: 180.00,
    lastUpdated: 'Yesterday, 11:10',
    sku: 'REF-PTC-REL',
    reorderPoint: 10,
    supplier: 'Danfoss India'
  },

  // ─── Washing Machine ───
  {
    id: '#INV-1012',
    name: 'Universal Washing Machine Drain Pump Motor (30W)',
    category: 'Appliance',
    stockLevel: 'Low Stock',
    stockCount: 3,
    unitPrice: 750.00,
    lastUpdated: 'Today, 08:50 AM',
    sku: 'WM-PUMP-UNI',
    reorderPoint: 6,
    supplier: 'Whirlpool Spares'
  },
  {
    id: '#INV-1013',
    name: 'Drum Bearings & Oil Seal Kit (SKF 6205/6206)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 11,
    unitPrice: 580.00,
    lastUpdated: 'Yesterday, 11:30',
    sku: 'WM-BRG-KIT',
    reorderPoint: 5,
    supplier: 'SKF India'
  },
  {
    id: '#INV-1014',
    name: 'Dual Solenoid Water Inlet Valve (220V AC)',
    category: 'Plumbing',
    stockLevel: 'In Stock',
    stockCount: 16,
    unitPrice: 420.00,
    lastUpdated: 'Yesterday, 09:40',
    sku: 'WM-VLV-DUAL',
    reorderPoint: 5,
    supplier: 'IFB Industries'
  },
  {
    id: '#INV-1015',
    name: 'Washing Machine Drive Belt (V-Belt M-21.5)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 25,
    unitPrice: 220.00,
    lastUpdated: 'Today, 07:15 AM',
    sku: 'WM-BLT-M21',
    reorderPoint: 8,
    supplier: 'Fenner Belts'
  },
  {
    id: '#INV-1016',
    name: 'Universal Pulsator Assembly with Bush (375mm)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 7,
    unitPrice: 890.00,
    lastUpdated: 'Yesterday, 15:20',
    sku: 'WM-PLS-375',
    reorderPoint: 3,
    supplier: 'LG Components'
  },

  // ─── Microwave Oven ───
  {
    id: '#INV-1017',
    name: 'Microwave Magnetron 900W (Universal 2M214)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 6,
    unitPrice: 980.00,
    lastUpdated: 'Yesterday, 16:45',
    sku: 'MW-MAG-900W',
    reorderPoint: 4,
    supplier: 'Panasonic OEM'
  },
  {
    id: '#INV-1018',
    name: 'High Voltage Capacitor 0.95µF 2100V with Diode',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 15,
    unitPrice: 320.00,
    lastUpdated: 'Yesterday, 13:20',
    sku: 'MW-CAP-HVOLT',
    reorderPoint: 5,
    supplier: 'Midea Electronics'
  },
  {
    id: '#INV-1019',
    name: 'Turntable Glass Synchronous Motor (4W 5/6 RPM)',
    category: 'Appliance',
    stockLevel: 'Low Stock',
    stockCount: 2,
    unitPrice: 280.00,
    lastUpdated: 'Today, 10:05 AM',
    sku: 'MW-MOT-TRN',
    reorderPoint: 5,
    supplier: 'Samsung Spares'
  },

  // ─── Mixer Grinder ───
  {
    id: '#INV-1020',
    name: 'Heavy Duty Teeth Drive Coupler (Pack of 5)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 40,
    unitPrice: 149.00,
    lastUpdated: 'Today, 12:10 PM',
    sku: 'MIX-CPL-5PK',
    reorderPoint: 15,
    supplier: 'Preethi Kitchen Spares'
  },
  {
    id: '#INV-1021',
    name: 'Push-to-Reset Overload Protector Switch (2.7A)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 28,
    unitPrice: 95.00,
    lastUpdated: 'Yesterday, 15:40',
    sku: 'MIX-SW-OVL',
    reorderPoint: 10,
    supplier: 'Bajaj Electricals'
  },
  {
    id: '#INV-1022',
    name: 'High-Grade Copper Carbon Brushes with Brass Cap',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 50,
    unitPrice: 65.00,
    lastUpdated: 'Today, 09:50 AM',
    sku: 'MIX-BRS-COP',
    reorderPoint: 20,
    supplier: 'Sujata Spares'
  },

  // ─── Pump Motor & Air Cooler ───
  {
    id: '#INV-1023',
    name: 'Mechanical Water Shaft Seal (12mm Silicon Carbide)',
    category: 'Plumbing',
    stockLevel: 'In Stock',
    stockCount: 19,
    unitPrice: 260.00,
    lastUpdated: 'Yesterday, 14:15',
    sku: 'PMP-SEAL-12MM',
    reorderPoint: 6,
    supplier: 'Kirloskar Brothers'
  },
  {
    id: '#INV-1024',
    name: 'Motor Run Capacitor 36µF 440V Heavy Duty',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 22,
    unitPrice: 190.00,
    lastUpdated: 'Yesterday, 11:50',
    sku: 'PMP-CAP-36UF',
    reorderPoint: 8,
    supplier: 'Crompton Greaves'
  },
  {
    id: '#INV-1025',
    name: 'Brass Monoblock Impeller (0.5 HP / 1.0 HP)',
    category: 'Plumbing',
    stockLevel: 'Out of Stock',
    stockCount: 0,
    unitPrice: 450.00,
    lastUpdated: 'Yesterday, 09:10',
    sku: 'PMP-IMP-BRASS',
    reorderPoint: 4,
    supplier: 'CRI Pumps'
  },
  {
    id: '#INV-1026',
    name: 'Submersible Cooler Water Pump (18W High Lift 1.8m)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 14,
    unitPrice: 280.00,
    lastUpdated: 'Yesterday, 12:20',
    sku: 'CLR-PMP-18W',
    reorderPoint: 6,
    supplier: 'Symphony Comfort'
  },

  // ─── Induction Cooktop ───
  {
    id: '#INV-1027',
    name: 'IGBT High-Power Transistor 25N120 (1200V 25A)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 20,
    unitPrice: 240.00,
    lastUpdated: 'Yesterday, 16:30',
    sku: 'IND-IGBT-25N',
    reorderPoint: 8,
    supplier: 'Infineon Technologies'
  },
  {
    id: '#INV-1028',
    name: 'Induction Cooktop Toughened Ceramic Glass Top',
    category: 'Appliance',
    stockLevel: 'Low Stock',
    stockCount: 4,
    unitPrice: 680.00,
    lastUpdated: 'Today, 08:30 AM',
    sku: 'IND-GLS-TOP',
    reorderPoint: 5,
    supplier: 'Prestige Spares'
  },

  // ─── Geyser (Water Heater) ───
  {
    id: '#INV-1029',
    name: 'Copper Immersion Heating Element (2000W Heavy Flange)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 16,
    unitPrice: 499.00,
    lastUpdated: 'Today, 10:15 AM',
    sku: 'GEY-ELE-2KW',
    reorderPoint: 6,
    supplier: 'Racold / Ariston'
  },
  {
    id: '#INV-1030',
    name: 'Stem-Type Immersion Geyser Thermostat (30-75°C)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 18,
    unitPrice: 340.00,
    lastUpdated: 'Yesterday, 14:50',
    sku: 'GEY-TH-STEM',
    reorderPoint: 6,
    supplier: 'AO Smith Spares'
  },
  {
    id: '#INV-1031',
    name: 'Multi-Functional Pressure Relief Valve (1/2" Brass)',
    category: 'Plumbing',
    stockLevel: 'In Stock',
    stockCount: 12,
    unitPrice: 290.00,
    lastUpdated: 'Yesterday, 11:20',
    sku: 'GEY-VLV-PRV',
    reorderPoint: 4,
    supplier: 'Bajaj Geysers'
  },

  // ─── Fans (Ceiling & Stand) ───
  {
    id: '#INV-1032',
    name: 'Ceiling Fan Run Capacitor (2.5µF 440V EPCOS)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 65,
    unitPrice: 85.00,
    lastUpdated: 'Today, 11:45 AM',
    sku: 'FAN-CAP-25UF',
    reorderPoint: 25,
    supplier: 'Havells India'
  },
  {
    id: '#INV-1033',
    name: 'SKF Deep Groove Ball Bearings (6201 & 6202 Pair)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 38,
    unitPrice: 160.00,
    lastUpdated: 'Yesterday, 13:10',
    sku: 'FAN-BRG-SKF',
    reorderPoint: 15,
    supplier: 'SKF Bearings'
  },

  // ─── TV / Display ───
  {
    id: '#INV-1034',
    name: 'Universal LED Backlight Strips 32" (3V 6-LED Set of 3)',
    category: 'Appliance',
    stockLevel: 'In Stock',
    stockCount: 7,
    unitPrice: 650.00,
    lastUpdated: 'Yesterday, 16:15',
    sku: 'TV-LED-32SET',
    reorderPoint: 4,
    supplier: 'Samsung Electronics'
  },

  // ─── Electrical & Wiring Supplies ───
  {
    id: '#INV-1035',
    name: 'Single Pole C-Curve MCB (16A / 10kA)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 45,
    unitPrice: 145.00,
    lastUpdated: 'Today, 09:10 AM',
    sku: 'ELE-MCB-16A',
    reorderPoint: 15,
    supplier: 'Schneider Electric'
  },
  {
    id: '#INV-1036',
    name: 'Modular 15A Switch with Indicator (Fire Retardant)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 80,
    unitPrice: 110.00,
    lastUpdated: 'Yesterday, 10:00',
    sku: 'ELE-SW-15A',
    reorderPoint: 25,
    supplier: 'Havells India'
  },
  {
    id: '#INV-1037',
    name: 'FR Multistrand Copper Wire 1.5 sq mm (90m Roll)',
    category: 'Electrical',
    stockLevel: 'In Stock',
    stockCount: 10,
    unitPrice: 1650.00,
    lastUpdated: 'Yesterday, 15:00',
    sku: 'ELE-WIR-15SQ',
    reorderPoint: 5,
    supplier: 'Polycab India'
  },

  // ─── Plumbing Fittings & Consumables ───
  {
    id: '#INV-1038',
    name: 'CPVC Brass Concealed Stop Cock / Ball Valve (3/4")',
    category: 'Plumbing',
    stockLevel: 'In Stock',
    stockCount: 18,
    unitPrice: 380.00,
    lastUpdated: 'Yesterday, 13:40',
    sku: 'PLM-VLV-34CPVC',
    reorderPoint: 6,
    supplier: 'Astral Pipes'
  },
  {
    id: '#INV-1039',
    name: 'PTFE Teflon Thread Sealant Tape (Pack of 10 Rolls)',
    category: 'Plumbing',
    stockLevel: 'In Stock',
    stockCount: 55,
    unitPrice: 120.00,
    lastUpdated: 'Today, 11:30 AM',
    sku: 'PLM-TEF-10PK',
    reorderPoint: 20,
    supplier: 'Supreme Industries'
  },
  {
    id: '#INV-1040',
    name: 'Stainless Steel Braided Connection Pipe (24" FxF)',
    category: 'Plumbing',
    stockLevel: 'In Stock',
    stockCount: 22,
    unitPrice: 175.00,
    lastUpdated: 'Yesterday, 15:15',
    sku: 'PLM-CON-24SS',
    reorderPoint: 8,
    supplier: 'Jaquar & Co'
  },
  {
    id: '#INV-1041',
    name: 'PVC Waste Pipe with Rubber Adapter (1.25" Expandable)',
    category: 'Plumbing',
    stockLevel: 'Out of Stock',
    stockCount: 0,
    unitPrice: 95.00,
    lastUpdated: 'Yesterday, 08:30',
    sku: 'PLM-WST-PIPE',
    reorderPoint: 10,
    supplier: 'Finolex Pipes'
  }
];

const INITIAL_INVENTORY = MASTER_REAL_INVENTORY;

// ─── Initial Vendor Applications Data ───────────────────────────────────────
const INITIAL_APPLICATIONS = [];

// ─── Initial Users Data (Populated dynamically from backend and platform database) ───
const ALL_DATABASE_USERS = [
  {
    rawUserId: '6ab10d406fae74eeafe5559c',
    id: 'ADM-559C',
    name: 'Magic Mistry',
    email: 'magicmistry187@gmail.com',
    phone: '+91 9876543200',
    role: 'Admin',
    status: 'Active',
    joined: 'Jan 2024',
    serviceType: 'System Administration',
  },
  {
    rawUserId: '6a8459b13ecd01bb35bfe0d6',
    id: 'FX-V-7921',
    vendorId: 'FX-V-7921',
    name: 'Master Technician Pro',
    email: 'ashique000hussain@gmail.com',
    phone: '+91 9876543210',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'HVAC Specialist',
  },
  {
    rawUserId: '6a845cd73ecd01bb35bfe179',
    id: 'FX-V-1835',
    vendorId: 'FX-V-1835',
    name: 'Ashique Hussain Ansari',
    email: 'ashique00hussain@gmail.com',
    phone: '+91 9876543211',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'Appliance Expert',
  },
  {
    rawUserId: '6a86f030d1047ebb150e79b9',
    id: 'FX-V-6298',
    vendorId: 'FX-V-6298',
    name: 'try vendor',
    email: 'vendor@gmail.com',
    phone: '+91 9876543212',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'Plumbing Engineer',
  },
  {
    rawUserId: '6a897c738618e6a2fd17f148',
    id: 'FX-V-2780',
    vendorId: 'FX-V-2780',
    name: 'exampleVendor',
    email: 'example@gmail.com',
    phone: '+91 9876543213',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'Electrical Repair',
  },
  {
    rawUserId: '6a8d7d86d917363efa66881e',
    id: 'FX-V-2757',
    vendorId: 'FX-V-2757',
    name: 'Jenny Han',
    email: 'jenny@gmail.com',
    phone: '+91 9876543214',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'Washing Machine Repair',
  },
  {
    rawUserId: '6a92c9fa825361018e28157d',
    id: 'FX-V-2850',
    vendorId: 'FX-V-2850',
    name: 'john doe',
    email: 'john@gmail.com',
    phone: '+91 9876543215',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'Appliance Expert',
  },
  {
    rawUserId: '6a92cc0e087dc4fe4d009082',
    id: 'FX-V-3931',
    vendorId: 'FX-V-3931',
    name: 'joshua',
    email: 'joshua@gmail.com',
    phone: '+91 9876543216',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'Press Iron Repair',
  },
  {
    rawUserId: '6a9849608b6b6af83707a6e1',
    id: 'FX-V-1217',
    vendorId: 'FX-V-1217',
    name: 'Zoey',
    email: 'kmushafiya003@gmail.com',
    phone: '+91 9876543217',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'AC Repair',
  },
  {
    rawUserId: '6aa94bc4cd50828194922dcb',
    id: 'FX-V-6003',
    vendorId: 'FX-V-6003',
    name: 'Ashique Hussian Ansari',
    email: 'ansariazad7864@gmail.com',
    phone: '+91 9876543218',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'Microwave Repair',
  },
  {
    rawUserId: '6aaa850ac08a2b1243efb49a',
    id: 'FX-V-5854',
    vendorId: 'FX-V-5854',
    name: 'Shafiya',
    email: 'khanshafiya1219@gmail.com',
    phone: '+91 9876543219',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'AC Repair',
  },
  {
    rawUserId: '6ab39174c8f2a4190fe3a918',
    id: 'FX-V-3222',
    vendorId: 'FX-V-3222',
    name: 'Hana',
    email: 'hana@gmail.com',
    phone: '+91 9876543220',
    role: 'Technician',
    status: 'Active',
    joined: 'Feb 2024',
    serviceType: 'AC Repair',
  },
  {
    rawUserId: '6ab25e8215c02a9b99314794',
    id: 'USR-4794',
    name: 'mushhh',
    email: 'khanmushafiya035@gmail.com',
    phone: '+91 9876543221',
    role: 'Customer',
    status: 'Active',
    joined: 'Mar 2024',
  },
  {
    rawUserId: '6ab37e639d4b4fc070ff01c8',
    id: 'USR-01C8',
    name: 'Anwar Huy',
    email: 'anwarhuy@gmail.com',
    phone: '+91 9876543222',
    role: 'Customer',
    status: 'Active',
    joined: 'Mar 2024',
  },
  {
    rawUserId: '6ab393aacfbdfe1fcd2c55df',
    id: 'USR-55DF',
    name: 'NARUTO UZUMAKI',
    email: 'ashiquehussain18040@gmail.com',
    phone: '+91 9876543223',
    role: 'Customer',
    status: 'Active',
    joined: 'Mar 2024',
  },
  {
    rawUserId: '6ab3ebb76eaf35ba00672e63',
    id: 'USR-2E63',
    name: 'Mr maddy',
    email: 'm37160894@gmail.com',
    phone: '+91 9876543224',
    role: 'Customer',
    status: 'Active',
    joined: 'Mar 2024',
  },
  {
    rawUserId: '6ab4a245bedf304dcbb30178',
    id: 'USR-0178',
    name: 'Md Aftab Alam',
    email: 'rajanalam251@gmail.com',
    phone: '+91 9876543225',
    role: 'Customer',
    status: 'Active',
    joined: 'Mar 2024',
  },
  {
    rawUserId: '6ab4cd9de00fc88e93023b5c',
    id: 'USR-3B5C',
    name: 'Abdul Arman',
    email: 'armanabdul973@gmail.com',
    phone: '+91 9876543226',
    role: 'Customer',
    status: 'Active',
    joined: 'Mar 2024',
  },
];

const INITIAL_USERS = ALL_DATABASE_USERS;

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

// ─── Initial Work History Data ───────────────────────────────────────────────
const INITIAL_WORK_HISTORY = [
  { id: '#FX-8002', appliance: 'LG Split AC', customer: 'Amit Kumar', technician: 'Raju M.', dateCompleted: '2026-08-12', status: 'Completed' },
  { id: '#FX-8001', appliance: 'Samsung TV', customer: 'Priya Das', technician: 'Mohan S.', dateCompleted: '2026-08-10', status: 'Completed' },
  { id: '#FX-8000', appliance: 'Whirlpool Fridge', customer: 'Rohan Sharma', technician: 'Vijay T.', dateCompleted: '2026-08-09', status: 'Completed' },
  { id: '#FX-7999', appliance: 'Bosch Washer', customer: 'Sneha Gupta', technician: 'Amit R.', dateCompleted: '2026-08-08', status: 'Completed' },
  { id: '#FX-7998', appliance: 'Dyson Vacuum', customer: 'Karan Patel', technician: 'Rahul K.', dateCompleted: '2026-08-08', status: 'Cancelled' },
  { id: '#FX-7997', appliance: 'Sony TV', customer: 'Neha Singh', technician: 'Raju M.', dateCompleted: '2026-08-07', status: 'Completed' },
  { id: '#FX-7996', appliance: 'LG AC', customer: 'Vikas Jain', technician: 'Mohan S.', dateCompleted: '2026-08-07', status: 'Completed' },
  { id: '#FX-7995', appliance: 'Samsung Microwave', customer: 'Anjali Desai', technician: 'Vijay T.', dateCompleted: '2026-08-06', status: 'Completed' },
];

// ─── Initial Vendor Approvals Summary ────────────────────────────────────────
const INITIAL_VENDOR_APPROVALS = [
  { id: 'V-1', name: 'Cooling Experts Co.', applied: 'Applied 2 hours ago', tags: ['AC Repair', 'Refrigeration'], icon: Store },
  { id: 'V-2', name: 'TechFix by Sarah', applied: 'Applied 5 hours ago', tags: ['Microwaves', 'Small Appliances'], icon: User },
];

// ─── Initial Payment Requests Data ───────────────────────────────────────────
const INITIAL_PAYMENT_REQUESTS = [
  { id: 'PAY-1042', vendorName: 'Marcus Reed', vendorId: 'FX-8892-A', upiId: 'marcus@upi', bankAccount: '3123456789 (HDFC)', daysOfWork: 5, amount: 14500, status: 'Pending', date: 'Oct 25, 2026', notes: 'Weekly payout request' },
  { id: 'PAY-1041', vendorName: 'Sarah Jenkins', vendorId: 'FX-8891-B', upiId: 'sarahj@ybl', bankAccount: '5566778899 (SBI)', daysOfWork: 3, amount: 8400, status: 'Approved', date: 'Oct 24, 2026', notes: 'Completed 8 jobs' },
  { id: 'PAY-1040', vendorName: 'Vikram Singh', vendorId: 'FX-8890-C', upiId: 'vikram.s@okicici', bankAccount: '9988776655 (ICICI)', daysOfWork: 7, amount: 22100, status: 'Paid', date: 'Oct 22, 2026', notes: 'Full week payout' },
];

// ─── Initial Financial Analytics Data ─────────────────────────────────────────
const MONTHLY_REVENUE_DATA = [
  { name: 'Jan', revenue: 145000, profit: 45000 },
  { name: 'Feb', revenue: 152000, profit: 48000 },
  { name: 'Mar', revenue: 148000, profit: 46000 },
  { name: 'Apr', revenue: 161000, profit: 51000 },
  { name: 'May', revenue: 159000, profit: 49500 },
  { name: 'Jun', revenue: 175000, profit: 56000 },
  { name: 'Jul', revenue: 182000, profit: 59000 },
  { name: 'Aug', revenue: 195000, profit: 64000 },
  { name: 'Sep', revenue: 215000, profit: 71000 },
  { name: 'Oct', revenue: 248500, profit: 84200 },
];

const CATEGORY_REVENUE_DATA = [
  { name: 'AC Repair', value: 45 },
  { name: 'Refrigerator', value: 30 },
  { name: 'Washing Machine', value: 15 },
  { name: 'Plumbing', value: 10 },
];
const COLORS = ['#FF6B00', '#02182e', '#10b981', '#f59e0b', '#3b82f6'];

const RECENT_TRANSACTIONS = [
  { id: 'TRX-1092', date: 'Oct 26, 2026', type: 'Service Fee', amount: 1500, status: 'Completed', customer: 'Rahul Sharma', vendor: 'Vikram Singh' },
  { id: 'TRX-1091', date: 'Oct 26, 2026', type: 'Vendor Payout', amount: -12500, status: 'Processing', customer: '-', vendor: 'Anita Desai' },
  { id: 'TRX-1090', date: 'Oct 25, 2026', type: 'Service Fee', amount: 850, status: 'Completed', customer: 'Priya Patel', vendor: 'Karan Mehra' },
  { id: 'TRX-1089', date: 'Oct 25, 2026', type: 'Parts Purchase', amount: -4500, status: 'Completed', customer: '-', vendor: 'LG Electronics' },
  { id: 'TRX-1088', date: 'Oct 24, 2026', type: 'Service Fee', amount: 2200, status: 'Completed', customer: 'Suresh Kumar', vendor: 'Robert Smith' },
];

// ─── Stock Level Pill Badge (Exact match to Screenshot 1 & 3) ───────────────
export const StockLevelBadge = ({ level, count }) => {
  if (level === 'In Stock' || level === 'Approved' || level === 'Active' || level === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        {level} {count !== undefined ? `(${count})` : ''}
      </span>
    );
  }
  if (level === 'Low Stock' || level === 'Pending' || level === 'Reviewing' || level === 'Suspended') {
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
      {level || 'Blocked'} {count !== undefined ? `(${count})` : ''}
    </span>
  );
};

const formatBookingAddress = (addr) => {
  if (!addr) return 'Address not provided';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') {
    const directStr = addr[''] || addr.fullAddress || addr.formattedAddress;
    if (directStr && typeof directStr === 'string' && directStr.trim()) return directStr.trim();
    const parts = [
      addr.house || addr.flat,
      addr.addressLine1 || addr.street,
      addr.landmark,
      addr.city,
      addr.state,
      addr.pincode,
    ].filter(Boolean);
    return parts.join(', ') || 'Address not provided';
  }
  return 'Address not provided';
};

const getApplianceIcon = (applianceName) => {
  const name = String(applianceName || '').toLowerCase();
  if (name.includes('ac') || name.includes('cooler')) return Snowflake;
  if (name.includes('fridge') || name.includes('refrigerat')) return Snowflake;
  if (name.includes('wash') || name.includes('pump') || name.includes('geyser')) return Droplets;
  if (name.includes('tv') || name.includes('microwave') || name.includes('induction') || name.includes('fan') || name.includes('mixer')) return Package;
  return Wrench;
};

const renderBookingStatusBadge = (status) => {
  const s = String(status || '').trim();
  if (s === 'Completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }
  if (s === 'Cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100/80 text-red-800 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Cancelled
      </span>
    );
  }
  if (s === 'In Progress' || s === 'Under Diagnosis') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100/80 text-purple-800 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
        In Progress
      </span>
    );
  }
  if (s === 'On The Way') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100/80 text-indigo-800 border border-indigo-200">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        On The Way
      </span>
    );
  }
  if (s === 'Accepted' || s === 'Assigned') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100/80 text-blue-800 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Assigned
      </span>
    );
  }
  // Pending / Awaiting Tech default
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100/80 text-amber-800 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      Pending Dispatch
    </span>
  );
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { socket, playNotificationSound } = useSocket();

  // Navigation tab state: 'overview', 'users', 'applications', 'id-creation', 'analytics'
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [inventoryList, setInventoryList] = useState(() => {
    try {
      // First check version 2 data
      const savedV2 = localStorage.getItem('mm_inventory_data_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 5) return parsed;
      }

      // Check legacy data and auto-migrate if it's the old 5-item mock
      const saved = localStorage.getItem('mm_inventory_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        const isLegacyMock = Array.isArray(parsed) && (
          parsed.length <= 5 ||
          parsed.some(item => item.id === '#INV-0842' && item.sku === 'ACC-2T-X9')
        );
        if (!isLegacyMock && Array.isArray(parsed) && parsed.length > 5) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading inventory from localStorage:', e);
    }
    return MASTER_REAL_INVENTORY;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mm_inventory_data', JSON.stringify(inventoryList));
      localStorage.setItem('mm_inventory_data_v2', JSON.stringify(inventoryList));
    } catch (e) {
      console.error('Error saving inventory to localStorage:', e);
    }
  }, [inventoryList]);

  const [applicationsList, setApplicationsList] = useState(INITIAL_APPLICATIONS);
  const [dispatchQueue, setDispatchQueue] = useState(() => {
    try {
      const cached = localStorage.getItem('mm_cached_dispatch_queue');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [workHistory, setWorkHistory] = useState(() => {
    try {
      const cached = localStorage.getItem('mm_cached_work_history');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [allBookings, setAllBookings] = useState(() => {
    try {
      const cached = localStorage.getItem('mm_cached_all_bookings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [bookingsFetchError, setBookingsFetchError] = useState(null);
  const [isRefreshingBookings, setIsRefreshingBookings] = useState(false);
  const [currentWorkFilter, setCurrentWorkFilter] = useState('All');
  const [workHistoryFilter, setWorkHistoryFilter] = useState('All Records');

  const fetchApplications = useCallback(async () => {
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('mm_token') ||
          localStorage.getItem('token') ||
          localStorage.getItem('adminToken')
        : null);
    if (!activeToken) return;
    try {
      const resApps = await getAllVendorApplications(activeToken);
      if (resApps.success && resApps.applications) {
        setApplicationsList(resApps.applications.map(app => ({
          ...app,
          id: app.applicationId || app._id,
          date: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          name: app.fullName,
          service: app.serviceType,
          phone: app.phoneNumber,
          vendorId: app.vendorId || app.vendor?.vendorId || null,
        })));
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
    }
  }, [token]);

  const fetchBookings = useCallback(async () => {
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('mm_token') ||
          localStorage.getItem('token') ||
          localStorage.getItem('adminToken') ||
          localStorage.getItem('vendorToken')
        : null);

    if (!activeToken) {
      setIsBookingsLoading(false);
      setBookingsFetchError('Admin authentication token is missing. Please sign in with the admin account (magicmistry187@gmail.com).');
      return;
    }

    try {
      setIsBookingsLoading(true);
      setBookingsFetchError(null);
      const resBookings = await getAdminBookingsApi(activeToken);
      if (resBookings.success && Array.isArray(resBookings.bookings)) {
        const formatted = resBookings.bookings.map(b => {
          const displayId = b.displayId || `#WO-${String(b._id).slice(-4).toUpperCase()}`;
          const formattedAddr = formatBookingAddress(b.address);
          const ApplianceIcon = getApplianceIcon(b.appliance);
          const pay = b.serviceCharge || b.serviceCategoryCharge || 0;

          return {
            id: displayId,
            rawId: b._id,
            displayId: displayId,
            appliance: b.appliance || 'Service Request',
            applianceIcon: ApplianceIcon,
            customer: b.customer?.fullName || b.customer?.name || (typeof b.customer === 'string' ? 'Customer' : 'Guest Customer'),
            customerPhone: b.customer?.phoneNumber || b.customer?.phone || '—',
            customerEmail: b.customer?.email || '—',
            customerAddress: formattedAddr,
            technician: b.vendor?.fullName || b.vendor?.name || (typeof b.vendor === 'string' ? 'Assigned Vendor' : 'Unassigned'),
            technicianPhone: b.vendor?.phoneNumber || b.vendor?.phone || '—',
            technicianAvatar: (b.vendor?.fullName || b.vendor?.name) ? (b.vendor.fullName || b.vendor.name).substring(0, 2).toUpperCase() : '',
            status: b.bookingStatus || 'Pending',
            dateCompleted: b.completedAt
              ? new Date(b.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : (String(b.bookingStatus || '').toLowerCase() === 'completed' || String(b.bookingStatus || '').toLowerCase() === 'closed')
              ? new Date(b.updatedAt || b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—',
            serviceDate: b.serviceDate
              ? new Date(b.serviceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—',
            timeSlot: b.timeSlot || 'Anytime',
            amount: pay,
            paymentStatus: b.paymentStatus || 'Pending',
            paymentMethod: b.paymentMethod || 'Cash After Service',
            issue: b.issue || b.serviceCategory || 'Standard Service Required',
            rawBooking: b,
          };
        });

        const isClosedStatus = (st) => {
          const s = String(st || '').trim().toUpperCase();
          return s === 'COMPLETED' || s === 'CANCELLED' || s === 'CLOSED';
        };

        const activeQueue = formatted.filter(b => !isClosedStatus(b.status));
        const historyList = formatted.filter(b => isClosedStatus(b.status));

        setAllBookings(formatted);
        setDispatchQueue(activeQueue);
        setWorkHistory(historyList);

        try {
          localStorage.setItem('mm_cached_all_bookings', JSON.stringify(formatted));
          localStorage.setItem('mm_cached_dispatch_queue', JSON.stringify(activeQueue));
          localStorage.setItem('mm_cached_work_history', JSON.stringify(historyList));
        } catch (_) {}
      } else {
        setBookingsFetchError(resBookings.message || 'Failed to fetch bookings');
      }
    } catch (e) {
      console.error('Error fetching bookings:', e);
      setBookingsFetchError(e.message || 'Error connecting to bookings API');
    } finally {
      setIsBookingsLoading(false);
    }
  }, [token]);

  const fetchInventory = useCallback(async () => {
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('mm_token') ||
          localStorage.getItem('token') ||
          localStorage.getItem('adminToken')
        : null);
    if (!activeToken) return;
    try {
      const res = await getAllInventoryApi(null, activeToken);
      if (res.success && Array.isArray(res.inventory) && res.inventory.length > 0) {
        try {
          localStorage.setItem('mm_cached_inventory', JSON.stringify(res.inventory));
          localStorage.setItem('mm_inventory_catalog', JSON.stringify(res.inventory));
        } catch (_) {}
        const formatted = res.inventory.map((item) => {
          const qty = Number(item.stockQuantity) || 0;
          const threshold = Number(item.reorderThreshold) || 10;
          let stockLevel = 'In Stock';
          if (qty === 0) stockLevel = 'Out of Stock';
          else if (qty <= threshold) stockLevel = 'Low Stock';

          const formattedDate = item.lastRestockedAt
            ? new Date(item.lastRestockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Today, Just now';

          return {
            id: item.inventoryId || `#INV-${String(item._id).slice(-4).toUpperCase()}`,
            rawId: item._id,
            inventoryId: item.inventoryId,
            name: item.itemName,
            category: item.category,
            stockLevel: stockLevel,
            stockCount: qty,
            unitPrice: Number(item.unitPrice) || 0,
            lastUpdated: formattedDate,
            sku: item.skuCode,
            reorderPoint: threshold,
            supplier: item.supplierName || 'Primary Supplier',
            isActive: item.isActive !== false,
          };
        });
        setInventoryList(formatted);
      }
    } catch (e) {
      console.error('Error fetching inventory from backend:', e);
    }
  }, [token]);

  // Initial fetch on mount (real-time socket events keep data up-to-date)
  useEffect(() => {
    fetchApplications();
    fetchBookings();
    fetchInventory();
  }, [fetchApplications, fetchBookings, fetchInventory]);

  // Keep tables synchronized whenever switching tabs
  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'work-history' || activeTab === 'overview') {
      fetchBookings();
    } else if (activeTab === 'inventory') {
      fetchInventory();
    }
  }, [activeTab, fetchApplications, fetchBookings, fetchInventory]);

  const [vendorApprovals, setVendorApprovals] = useState(INITIAL_VENDOR_APPROVALS);
  const [paymentRequests, setPaymentRequests] = useState(INITIAL_PAYMENT_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [invCurrentPage, setInvCurrentPage] = useState(1);
  const [invItemsPerPage, setInvItemsPerPage] = useState(10);
  const invTableRef = useRef(null);

  const pendingApplicationsCount = applicationsList.filter(app => app.status === 'Pending').length;

  // Vendor Applications Pagination & Search State
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('All');
  const [appCurrentPage, setAppCurrentPage] = useState(1);
  const [appItemsPerPage, setAppItemsPerPage] = useState(10);
  const appTableRef = useRef(null);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applicationsList.filter((app) => {
      const q = (appSearchTerm || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (app.name && app.name.toLowerCase().includes(q)) ||
        (app.email && app.email.toLowerCase().includes(q)) ||
        (app.id && String(app.id).toLowerCase().includes(q)) ||
        (app.service && String(app.service).toLowerCase().includes(q)) ||
        (app.city && String(app.city).toLowerCase().includes(q)) ||
        (app.phone && String(app.phone).toLowerCase().includes(q));

      const matchesStatus =
        appStatusFilter === 'All' ||
        app.status?.toLowerCase() === appStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [applicationsList, appSearchTerm, appStatusFilter]);

  const totalAppEntries = filteredApplications.length;
  const totalAppPages = Math.max(1, Math.ceil(totalAppEntries / appItemsPerPage));

  // Reset page to 1 when search, status filter, or itemsPerPage change
  useEffect(() => {
    setAppCurrentPage(1);
  }, [appSearchTerm, appStatusFilter, appItemsPerPage]);

  // Paginated applications slice for current page
  const paginatedApplications = useMemo(() => {
    const startIndex = (appCurrentPage - 1) * appItemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + appItemsPerPage);
  }, [filteredApplications, appCurrentPage, appItemsPerPage]);

  const handleAppPageChange = (page) => {
    if (page >= 1 && page <= totalAppPages) {
      setAppCurrentPage(page);
      if (appTableRef.current) {
        appTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleAppPrevious = () => {
    if (appCurrentPage > 1) {
      handleAppPageChange(appCurrentPage - 1);
    }
  };

  const handleAppNext = () => {
    if (appCurrentPage < totalAppPages) {
      handleAppPageChange(appCurrentPage + 1);
    }
  };

  const getAppPageNumbers = () => {
    const pages = [];
    if (totalAppPages <= 5) {
      for (let i = 1; i <= totalAppPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (appCurrentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, appCurrentPage - 1);
      const end = Math.min(totalAppPages - 1, appCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (appCurrentPage < totalAppPages - 2) {
        pages.push('...');
      }

      pages.push(totalAppPages);
    }
    return pages;
  };

  // Payment Requests Pagination & Search State
  const [paySearchTerm, setPaySearchTerm] = useState('');
  const [payStatusFilter, setPayStatusFilter] = useState('All');
  const [payCurrentPage, setPayCurrentPage] = useState(1);
  const [payItemsPerPage, setPayItemsPerPage] = useState(10);
  const payTableRef = useRef(null);

  // Filtered Payment Requests
  const filteredPaymentRequests = useMemo(() => {
    return paymentRequests.filter((req) => {
      const q = (paySearchTerm || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (req.id && String(req.id).toLowerCase().includes(q)) ||
        (req.vendorName && req.vendorName.toLowerCase().includes(q)) ||
        (req.vendorId && String(req.vendorId).toLowerCase().includes(q)) ||
        (req.upiId && String(req.upiId).toLowerCase().includes(q)) ||
        (req.bankAccount && String(req.bankAccount).toLowerCase().includes(q)) ||
        (req.amount && String(req.amount).includes(q));

      const matchesStatus =
        payStatusFilter === 'All' ||
        req.status?.toLowerCase() === payStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [paymentRequests, paySearchTerm, payStatusFilter]);

  const totalPayEntries = filteredPaymentRequests.length;
  const totalPayPages = Math.max(1, Math.ceil(totalPayEntries / payItemsPerPage));

  // Reset page to 1 when search, status filter, or itemsPerPage change
  useEffect(() => {
    setPayCurrentPage(1);
  }, [paySearchTerm, payStatusFilter, payItemsPerPage]);

  // Paginated payment requests slice for current page
  const paginatedPaymentRequests = useMemo(() => {
    const startIndex = (payCurrentPage - 1) * payItemsPerPage;
    return filteredPaymentRequests.slice(startIndex, startIndex + payItemsPerPage);
  }, [filteredPaymentRequests, payCurrentPage, payItemsPerPage]);

  const handlePayPageChange = (page) => {
    if (page >= 1 && page <= totalPayPages) {
      setPayCurrentPage(page);
      if (payTableRef.current) {
        payTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handlePayPrevious = () => {
    if (payCurrentPage > 1) {
      handlePayPageChange(payCurrentPage - 1);
    }
  };

  const handlePayNext = () => {
    if (payCurrentPage < totalPayPages) {
      handlePayPageChange(payCurrentPage + 1);
    }
  };

  const getPayPageNumbers = () => {
    const pages = [];
    if (totalPayPages <= 5) {
      for (let i = 1; i <= totalPayPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (payCurrentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, payCurrentPage - 1);
      const end = Math.min(totalPayPages - 1, payCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (payCurrentPage < totalPayPages - 2) {
        pages.push('...');
      }

      pages.push(totalPayPages);
    }
    return pages;
  };
  
  // Dispatch Queue Pagination
  const [dispatchPage, setDispatchPage] = useState(1);
  const dispatchItemsPerPage = 4;
  const dispatchTotalPages = Math.ceil(dispatchQueue.length / dispatchItemsPerPage);

  // Filtered Current Work (Active Dispatches)
  const filteredCurrentWork = useMemo(() => {
    if (currentWorkFilter === 'In Progress') {
      return dispatchQueue.filter(item => {
        const s = String(item.status || '').trim().toUpperCase();
        return s === 'IN PROGRESS' || s === 'UNDER DIAGNOSIS';
      });
    }
    if (currentWorkFilter === 'Assigned') {
      return dispatchQueue.filter(item => {
        const s = String(item.status || '').trim().toUpperCase();
        return s === 'ACCEPTED' || s === 'ASSIGNED' || s === 'ON THE WAY';
      });
    }
    if (currentWorkFilter === 'Pending') {
      return dispatchQueue.filter(item => {
        const s = String(item.status || '').trim().toUpperCase();
        return s === 'PENDING' || s === 'AWAITING TECH';
      });
    }
    return dispatchQueue;
  }, [dispatchQueue, currentWorkFilter]);

  const currentWorkCounts = useMemo(() => {
    return {
      all: dispatchQueue.length,
      inProgress: dispatchQueue.filter(item => {
        const s = String(item.status || '').trim().toUpperCase();
        return s === 'IN PROGRESS' || s === 'UNDER DIAGNOSIS';
      }).length,
      assigned: dispatchQueue.filter(item => {
        const s = String(item.status || '').trim().toUpperCase();
        return s === 'ACCEPTED' || s === 'ASSIGNED' || s === 'ON THE WAY';
      }).length,
      pending: dispatchQueue.filter(item => {
        const s = String(item.status || '').trim().toUpperCase();
        return s === 'PENDING' || s === 'AWAITING TECH';
      }).length,
    };
  }, [dispatchQueue]);

  // Work History Pagination, Search & Filters
  const [historyPage, setHistoryPage] = useState(1);
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState(10);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const historyTableRef = useRef(null);

  // Current Work (Active Dispatches) Pagination
  const [currentWorkPage, setCurrentWorkPage] = useState(1);
  const currentWorkItemsPerPage = 5;
  const currentWorkTableRef = useRef(null);

  const historyCounts = useMemo(() => {
    const isCompleted = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'COMPLETED' || u === 'CLOSED';
    };
    const isCancelled = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'CANCELLED';
    };
    const isInProgress = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'IN PROGRESS' || u === 'UNDER DIAGNOSIS';
    };
    const isPending = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'PENDING' || u === 'AWAITING TECH';
    };
    const isAccepted = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'ACCEPTED' || u === 'ASSIGNED' || u === 'ON THE WAY';
    };

    const source = allBookings.length > 0 ? allBookings : dispatchQueue.concat(workHistory);
    return {
      all: source.length,
      inProgress: source.filter(i => isInProgress(i.status)).length,
      pending: source.filter(i => isPending(i.status)).length,
      assigned: source.filter(i => isAccepted(i.status)).length,
      completed: source.filter(i => isCompleted(i.status)).length,
      cancelled: source.filter(i => isCancelled(i.status)).length,
    };
  }, [workHistory, allBookings, dispatchQueue]);

  const filteredHistory = useMemo(() => {
    const fullList = allBookings.length > 0 ? allBookings : dispatchQueue.concat(workHistory);
    let list = fullList;

    const isCompleted = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'COMPLETED' || u === 'CLOSED';
    };
    const isCancelled = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'CANCELLED';
    };
    const isInProgress = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'IN PROGRESS' || u === 'UNDER DIAGNOSIS';
    };
    const isPending = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'PENDING' || u === 'AWAITING TECH';
    };
    const isAccepted = (s) => {
      const u = String(s || '').trim().toUpperCase();
      return u === 'ACCEPTED' || u === 'ASSIGNED' || u === 'ON THE WAY';
    };

    if (workHistoryFilter === 'Completed') {
      list = fullList.filter(item => isCompleted(item.status));
    } else if (workHistoryFilter === 'In Progress') {
      list = fullList.filter(item => isInProgress(item.status));
    } else if (workHistoryFilter === 'Pending') {
      list = fullList.filter(item => isPending(item.status));
    } else if (workHistoryFilter === 'Accepted' || workHistoryFilter === 'Assigned') {
      list = fullList.filter(item => isAccepted(item.status));
    } else if (workHistoryFilter === 'Cancelled') {
      list = fullList.filter(item => isCancelled(item.status));
    } else {
      list = fullList;
    }

    if (historySearchTerm.trim()) {
      const q = historySearchTerm.toLowerCase().trim();
      list = list.filter(item =>
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.appliance && item.appliance.toLowerCase().includes(q)) ||
        (item.customer && item.customer.toLowerCase().includes(q)) ||
        (item.technician && item.technician.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q))
      );
    }
    return list;
  }, [workHistory, allBookings, dispatchQueue, workHistoryFilter, historySearchTerm]);

  useEffect(() => {
    setHistoryPage(1);
  }, [workHistoryFilter, historySearchTerm, historyItemsPerPage]);

  useEffect(() => {
    setCurrentWorkPage(1);
  }, [currentWorkFilter]);

  const totalHistoryEntries = filteredHistory.length;
  const historyTotalPages = Math.ceil(totalHistoryEntries / historyItemsPerPage) || 1;

  const paginatedHistory = useMemo(() => {
    const startIndex = (historyPage - 1) * historyItemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + historyItemsPerPage);
  }, [filteredHistory, historyPage, historyItemsPerPage]);

  const handleHistoryPageChange = (page) => {
    if (page >= 1 && page <= historyTotalPages) {
      setHistoryPage(page);
      if (historyTableRef.current) {
        historyTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleHistoryPrevious = () => {
    if (historyPage > 1) {
      handleHistoryPageChange(historyPage - 1);
    }
  };

  const handleHistoryNext = () => {
    if (historyPage < historyTotalPages) {
      handleHistoryPageChange(historyPage + 1);
    }
  };

  const getHistoryPageNumbers = () => {
    const pages = [];
    if (historyTotalPages <= 5) {
      for (let i = 1; i <= historyTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (historyPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, historyPage - 1);
      const end = Math.min(historyTotalPages - 1, historyPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (historyPage < historyTotalPages - 2) {
        pages.push('...');
      }
      pages.push(historyTotalPages);
    }
    return pages;
  };

  const currentWorkTotalPages = Math.ceil(filteredCurrentWork.length / currentWorkItemsPerPage) || 1;
  const paginatedCurrentWork = useMemo(() => {
    const startIndex = (currentWorkPage - 1) * currentWorkItemsPerPage;
    return filteredCurrentWork.slice(startIndex, startIndex + currentWorkItemsPerPage);
  }, [filteredCurrentWork, currentWorkPage, currentWorkItemsPerPage]);

  const paginatedDispatch = dispatchQueue.slice((dispatchPage - 1) * dispatchItemsPerPage, dispatchPage * dispatchItemsPerPage);

  // Restock & Inventory modal state
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [restockDate, setRestockDate] = useState('2026-07-20');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [restockNotes, setRestockNotes] = useState('');

  // User & Partner Management State
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const userTableRef = useRef(null);

  // Filtered Users for User Management Tab
  const filteredUsers = useMemo(() => {
    return usersList.filter((usr) => {
      const q = (userSearchTerm || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (usr.name && usr.name.toLowerCase().includes(q)) ||
        (usr.email && usr.email.toLowerCase().includes(q)) ||
        (usr.id && String(usr.id).toLowerCase().includes(q)) ||
        (usr.phone && String(usr.phone).toLowerCase().includes(q));

      const matchesRole =
        userRoleFilter === 'All' ||
        usr.role?.toLowerCase() === userRoleFilter.toLowerCase();

      const matchesStatus =
        userStatusFilter === 'All' ||
        usr.status?.toLowerCase() === userStatusFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, userSearchTerm, userRoleFilter, userStatusFilter]);

  const totalUserEntries = filteredUsers.length;
  const totalUserPages = Math.max(1, Math.ceil(totalUserEntries / userItemsPerPage));

  // Reset page to 1 when filters or search or itemsPerPage change
  useEffect(() => {
    setUserCurrentPage(1);
  }, [userSearchTerm, userRoleFilter, userStatusFilter, userItemsPerPage]);

  // Paginated users slice for current page
  const paginatedUsers = useMemo(() => {
    const startIndex = (userCurrentPage - 1) * userItemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + userItemsPerPage);
  }, [filteredUsers, userCurrentPage, userItemsPerPage]);

  const handleUserPageChange = (page) => {
    if (page >= 1 && page <= totalUserPages) {
      setUserCurrentPage(page);
      if (userTableRef.current) {
        userTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleUserPrevious = () => {
    if (userCurrentPage > 1) {
      handleUserPageChange(userCurrentPage - 1);
    }
  };

  const handleUserNext = () => {
    if (userCurrentPage < totalUserPages) {
      handleUserPageChange(userCurrentPage + 1);
    }
  };

  const getUserPageNumbers = () => {
    const pages = [];
    if (totalUserPages <= 5) {
      for (let i = 1; i <= totalUserPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (userCurrentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, userCurrentPage - 1);
      const end = Math.min(totalUserPages - 1, userCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (userCurrentPage < totalUserPages - 2) {
        pages.push('...');
      }

      pages.push(totalUserPages);
    }
    return pages;
  };

  // Sync users and vendors from live backend data (Vendor Applications & Bookings)
  const syncUsersAndVendorsFromBackend = useCallback(() => {
    let savedStatuses = {};
    try {
      savedStatuses = JSON.parse(localStorage.getItem('mm_user_statuses') || '{}');
    } catch {
      savedStatuses = {};
    }

    // 1. Build map of existing users seeded from platform registry and updated from live backend records
    const userMap = new Map();

    ALL_DATABASE_USERS.forEach((u) => {
      const emailKey = u.email.toLowerCase();
      const overrideStatus = (u.rawUserId && savedStatuses[u.rawUserId]) || savedStatuses[u.id] || savedStatuses[emailKey] || u.status || 'Active';
      userMap.set(emailKey, {
        ...u,
        status: overrideStatus,
        bookings: 0,
      });
    });

    // 2. Add all Vendors from applicationsList (Live backend data)
    applicationsList.forEach((app) => {
      const emailKey = (app.email || '').toLowerCase();
      if (!emailKey) return;

      const vendorId = app.vendorId || app.applicationId || app.id || app._id;
      const rawUserId = app.userId || app.user?._id || app.vendor?.user || null;
      const existing = userMap.get(emailKey);
      const effectiveRawUserId = rawUserId || existing?.rawUserId || null;
      const overrideStatus = savedStatuses[vendorId] || (effectiveRawUserId && savedStatuses[effectiveRawUserId]) || savedStatuses[emailKey] || (app.status === 'Approved' ? 'Active' : app.status === 'Rejected' ? 'Blocked' : 'Pending');

      // Count bookings for this vendor
      const techBookingsCount = (dispatchQueue.concat(workHistory)).filter(
        (b) => (b.technician && b.technician.toLowerCase() === (app.fullName || '').toLowerCase()) ||
               (b.technicianAvatar && b.technicianAvatar === (app.fullName || '').substring(0, 2).toUpperCase())
      ).length;

      userMap.set(emailKey, {
        id: vendorId,
        rawUserId: effectiveRawUserId,
        name: app.fullName || existing?.name || 'Technician Partner',
        email: app.email,
        phone: app.phoneNumber || app.phone || existing?.phone || '',
        role: 'Technician',
        status: overrideStatus,
        bookings: Math.max(techBookingsCount, existing?.bookings || 0),
        joined: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : existing?.joined || 'Recently',
        serviceType: app.serviceType || app.specialization || existing?.serviceType || '',
      });
    });

    // 3. Add all Customers & Technicians from live dispatchQueue and workHistory (Backend data)
    dispatchQueue.concat(workHistory).forEach((booking) => {
      // If booking has technician/vendor user info, link their MongoDB User ID
      if (booking.rawBooking?.vendor?._id && booking.rawBooking?.vendor?.email) {
        const vEmailKey = booking.rawBooking.vendor.email.toLowerCase();
        if (userMap.has(vEmailKey)) {
          const vUser = userMap.get(vEmailKey);
          if (!vUser.rawUserId) {
            vUser.rawUserId = String(booking.rawBooking.vendor._id);
          }
          if (booking.rawBooking.vendor.status && !savedStatuses[vUser.rawUserId] && !savedStatuses[vUser.id] && !savedStatuses[vEmailKey]) {
            vUser.status = booking.rawBooking.vendor.status.charAt(0).toUpperCase() + booking.rawBooking.vendor.status.slice(1);
          }
        }
      }

      if (booking.customer && booking.customer !== 'Unknown' && booking.customer !== '-') {
        const customerName = booking.customer;
        const pseudoEmail = (booking.rawBooking?.customer?.email) || (customerName.toLowerCase().replace(/\s+/g, '.') + '@customer.magicmistry.com');
        const emailKey = pseudoEmail.toLowerCase();
        const rawCustId = booking.rawBooking?.customer?._id ? String(booking.rawBooking.customer._id) : null;
        const existing = userMap.get(emailKey);
        const effectiveRawId = rawCustId || existing?.rawUserId || null;

        const custId = effectiveRawId
          ? 'USR-' + effectiveRawId.slice(-4).toUpperCase()
          : (existing?.id || 'USR-' + (100 + userMap.size + 1));

        const backendStatus = booking.rawBooking?.customer?.status
          ? booking.rawBooking.customer.status.charAt(0).toUpperCase() + booking.rawBooking.customer.status.slice(1)
          : (existing?.status || 'Active');

        const overrideStatus = (effectiveRawId && savedStatuses[effectiveRawId]) || savedStatuses[custId] || savedStatuses[emailKey] || backendStatus;

        if (!userMap.has(emailKey)) {
          userMap.set(emailKey, {
            id: custId,
            rawUserId: effectiveRawId,
            name: customerName,
            email: pseudoEmail,
            phone: booking.rawBooking?.customer?.phoneNumber || '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
            role: 'Customer',
            status: overrideStatus,
            bookings: 1,
            joined: 'Recently',
          });
        } else {
          const u = userMap.get(emailKey);
          if (!u.rawUserId && effectiveRawId) {
            u.rawUserId = effectiveRawId;
          }
          if (booking.rawBooking?.customer?.phoneNumber && !u.phone) {
            u.phone = booking.rawBooking.customer.phoneNumber;
          }
          u.bookings = (u.bookings || 0) + 1;
        }
      }
    });

    const combined = Array.from(userMap.values());
    setUsersList(combined);
  }, [applicationsList, dispatchQueue, workHistory]);

  // Directly fetch all users from backend API
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getAllUsersApi(token);
      if (res.success && Array.isArray(res.users) && res.users.length > 0) {
        let savedStatuses = {};
        try {
          savedStatuses = JSON.parse(localStorage.getItem('mm_user_statuses') || '{}');
        } catch {
          savedStatuses = {};
        }

        const formatted = res.users.map((u) => {
          const rawId = u._id ? String(u._id) : null;
          const roleNormalized = u.role === 'vendor' ? 'Technician' : u.role === 'admin' ? 'Admin' : 'Customer';
          const displayId = u.vendorId || (rawId ? (roleNormalized === 'Technician' ? 'VND-' : 'USR-') + rawId.slice(-4).toUpperCase() : 'USR-101');
          const overrideStatus = (rawId && savedStatuses[rawId]) || savedStatuses[displayId] || (u.email && savedStatuses[u.email.toLowerCase()]) || (u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : 'Active');

          const bookingCount = (dispatchQueue.concat(workHistory)).filter((b) => {
            if (roleNormalized === 'Technician') {
              return (b.technician && b.technician.toLowerCase() === (u.fullName || '').toLowerCase()) ||
                     (b.technicianAvatar && b.technicianAvatar === (u.fullName || '').substring(0, 2).toUpperCase());
            } else {
              return (b.customer && b.customer.toLowerCase() === (u.fullName || '').toLowerCase()) ||
                     (b.rawBooking?.customer?.email && b.rawBooking.customer.email.toLowerCase() === (u.email || '').toLowerCase());
            }
          }).length;

          return {
            id: displayId,
            rawUserId: rawId,
            name: u.fullName || 'User',
            email: u.email || '',
            phone: u.phoneNumber || u.phone || '',
            role: roleNormalized,
            status: overrideStatus,
            bookings: bookingCount,
            joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently',
            serviceType: u.specialization || u.serviceType || '',
          };
        });

        setUsersList(formatted);
        return;
      }
    } catch (err) {
      console.warn('Backend users fetch error:', err);
    }

    // Fallback: Compute from seeded platform roster, applications and bookings
    syncUsersAndVendorsFromBackend();
  }, [token, dispatchQueue, workHistory, syncUsersAndVendorsFromBackend]);

  // Sync users whenever applications or bookings update or tab is opened
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, activeTab]);

  const handleEditUserProfile = (userItem) => {
    setEditingUser(userItem);
    setIsEditUserModalOpen(true);
  };

  const handleSaveEditedUser = async (updatedUser) => {
    const target = usersList.find(
      (u) => u.id === updatedUser.id || (u.rawUserId && u.rawUserId === updatedUser.rawUserId) || (u.email && u.email === updatedUser.email)
    );
    let mongoUserId = updatedUser.rawUserId || target?.rawUserId || (/^[0-9a-fA-F]{24}$/.test(updatedUser.id) ? updatedUser.id : null);

    // 1. Update state
    setUsersList((prev) =>
      prev.map((u) => (u.id === updatedUser.id || (u.email && u.email === updatedUser.email) ? { ...u, ...updatedUser, rawUserId: mongoUserId || u.rawUserId } : u))
    );

    // 2. Persist status override to localStorage so it stays permanent
    try {
      const savedStatuses = JSON.parse(localStorage.getItem('mm_user_statuses') || '{}');
      if (updatedUser.id) savedStatuses[updatedUser.id] = updatedUser.status;
      if (mongoUserId) savedStatuses[mongoUserId] = updatedUser.status;
      if (updatedUser.email) savedStatuses[updatedUser.email.toLowerCase()] = updatedUser.status;
      localStorage.setItem('mm_user_statuses', JSON.stringify(savedStatuses));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // 3. Fallback resolve mongoUserId via credentials API if missing
    if (!mongoUserId && updatedUser.email && token) {
      try {
        const credRes = await getVendorCredentialsApi(updatedUser.email, token);
        if (credRes.success && credRes.vendor?.id) {
          mongoUserId = credRes.vendor.id;
        }
      } catch (e) {
        console.warn('Could not resolve mongoId in edit profile:', e);
      }
    }

    // 4. Connect to backend status API if mongoUserId exists
    if (mongoUserId && updatedUser.status) {
      try {
        const res = await updateUserStatusApi(mongoUserId, updatedUser.status.toLowerCase(), token);
        if (res.success) {
          showToast(`Updated status & profile for ${updatedUser.name || updatedUser.fullName}`);
          return;
        } else {
          showToast(res.message || 'Status update failed on server', 'error');
        }
      } catch (err) {
        console.error('Error saving user status to backend:', err);
        showToast(`Server error: ${err.message}`, 'error');
      }
    } else {
      showToast(`Updated profile for ${updatedUser.name || updatedUser.fullName} (Status: ${updatedUser.status})`);
    }
  };

  const handleQuickStatusChange = async (targetUserOrId, newStatus) => {
    const target = typeof targetUserOrId === 'object' && targetUserOrId !== null
      ? targetUserOrId
      : usersList.find((u) => u.id === targetUserOrId || u.rawUserId === targetUserOrId || (u.email && u.email.toLowerCase() === String(targetUserOrId).toLowerCase()));

    const userIdKey = target?.id || (typeof targetUserOrId === 'string' ? targetUserOrId : null);
    let mongoUserId = target?.rawUserId || (/^[0-9a-fA-F]{24}$/.test(userIdKey) ? userIdKey : null);

    // 1. Optimistic UI update
    setUsersList((prev) =>
      prev.map((u) => {
        if (
          (userIdKey && u.id === userIdKey) ||
          (mongoUserId && u.rawUserId === mongoUserId) ||
          (target?.email && u.email && u.email.toLowerCase() === target.email.toLowerCase())
        ) {
          return { ...u, status: newStatus };
        }
        return u;
      })
    );

    // 2. Persist status override to localStorage so it stays permanent
    try {
      const savedStatuses = JSON.parse(localStorage.getItem('mm_user_statuses') || '{}');
      if (userIdKey) savedStatuses[userIdKey] = newStatus;
      if (mongoUserId) savedStatuses[mongoUserId] = newStatus;
      if (target?.email) savedStatuses[target.email.toLowerCase()] = newStatus;
      localStorage.setItem('mm_user_statuses', JSON.stringify(savedStatuses));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // 3. Fallback: If mongoUserId is missing, query credentials endpoint to get MongoDB user ID
    if (!mongoUserId && target?.email && token) {
      try {
        const credRes = await getVendorCredentialsApi(target.email, token);
        if (credRes.success && credRes.vendor?.id) {
          mongoUserId = credRes.vendor.id;
          setUsersList((prev) =>
            prev.map((u) => (u.email?.toLowerCase() === target.email.toLowerCase() ? { ...u, rawUserId: mongoUserId } : u))
          );
        }
      } catch (credErr) {
        console.warn('Could not resolve mongo ID via credentials:', credErr);
      }
    }

    // 4. Connect to backend status API: PATCH /api/admin/:userId/status
    if (mongoUserId) {
      try {
        const res = await updateUserStatusApi(mongoUserId, newStatus.toLowerCase(), token);
        if (res.success) {
          showToast(`${target?.name || 'User'} status updated to ${newStatus}`);
        } else {
          showToast(res.message || 'Server error updating status', 'error');
        }
      } catch (err) {
        console.error('Backend status update error:', err);
        showToast(`Failed to update status on server: ${err.message}`, 'error');
      }
    } else {
      showToast(`${target?.name || 'User'} status updated to ${newStatus}`);
    }
  };

  // Vendor Account Creation Form state (Screenshot 5)
  const [vendorForm, setVendorForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    serviceArea: ''
  });
  const [vendorFormError, setVendorFormError] = useState(null);

  // Credentials Success Modal state (Screenshot 4)
  const [isCredentialSuccessOpen, setIsCredentialSuccessOpen] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);

  // Map: appId -> { id, tempPassword, name } — tracks which vendors have had IDs generated
  const [vendorCredentials, setVendorCredentials] = useState({});

  // Real-time duplicate vendor check (Email and Phone/Mobile Number)
  const existingVendorMatch = useMemo(() => {
    const cleanEmail = (vendorForm.email || '').trim().toLowerCase();
    const cleanPhone = (vendorForm.phone || '').replace(/\D/g, '');

    if (!cleanEmail && (!cleanPhone || cleanPhone.length < 5)) return null;

    // 1. Check in applicationsList
    for (const app of applicationsList) {
      const appId = app.id || app.applicationId || app._id;
      // If approving this exact application, don't flag itself
      if (vendorForm.appId && (appId === vendorForm.appId || app.applicationId === vendorForm.appId)) continue;

      // Pending applications do not count as existing vendors until approved
      if (app.status === 'Pending' || app.status === 'pending') {
        if (!vendorCredentials[appId]) continue;
      }

      // Rejected applications do not count as active/existing vendors
      if (app.status === 'Rejected' || app.status === 'rejected') continue;

      const appEmail = (app.email || '').trim().toLowerCase();
      const appPhone = (app.phoneNumber || app.phone || '').replace(/\D/g, '');

      const emailMatches = Boolean(cleanEmail && appEmail && cleanEmail === appEmail);
      const phoneMatches = Boolean(cleanPhone && appPhone && cleanPhone.length >= 10 && appPhone.slice(-10) === cleanPhone.slice(-10));

      if (emailMatches || phoneMatches) {
        if (app.status === 'Approved' || vendorCredentials[appId]) {
          return {
            field: emailMatches ? 'Email Address' : 'Mobile Number',
            fieldKey: emailMatches ? 'email' : 'phone',
            matchedValue: emailMatches ? vendorForm.email : vendorForm.phone,
            name: app.fullName || app.name || 'Registered Vendor',
            vendorId: vendorCredentials[appId]?.id || app.vendorId || appId,
          };
        }
      }
    }

    // 2. Check in usersList
    for (const u of usersList) {
      if (u.role !== 'Technician' && u.role !== 'Vendor') continue;
      // As long as the vendor remains in 'pending' status, do not consider it an existing vendor
      if (u.status === 'Pending' || u.status === 'pending') continue;
      // If approving this exact application, don't flag itself
      if (vendorForm.appId && (u.id === vendorForm.appId || u.applicationId === vendorForm.appId)) continue;

      const uEmail = (u.email || '').trim().toLowerCase();
      const uPhone = (u.phone || '').replace(/\D/g, '');

      const emailMatches = Boolean(cleanEmail && uEmail && cleanEmail === uEmail);
      const phoneMatches = Boolean(cleanPhone && uPhone && cleanPhone.length >= 10 && uPhone.slice(-10) === cleanPhone.slice(-10));

      if (emailMatches || phoneMatches) {
        return {
          field: emailMatches ? 'Email Address' : 'Mobile Number',
          fieldKey: emailMatches ? 'email' : 'phone',
          matchedValue: emailMatches ? vendorForm.email : vendorForm.phone,
          name: u.name,
          vendorId: u.id,
        };
      }
    }

    return null;
  }, [vendorForm.email, vendorForm.phone, vendorForm.appId, applicationsList, usersList, vendorCredentials]);

  // Vendor Application View Details Modal State
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // "View Vendor ID & Pass" modal
  const [isViewCredsModalOpen, setIsViewCredsModalOpen] = useState(false);
  const [viewingCreds, setViewingCreds] = useState(null);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState(null); // 'history', 'inventory', 'payment'

  // Dispatch Modal state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedDispatchItem, setSelectedDispatchItem] = useState(null);

  // Work Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportItem, setSelectedReportItem] = useState(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // ── Real-Time Socket Listeners for Admin ──────────────────────────────────
  useSocketEvent('admin:new_booking', (newBooking) => {
    fetchBookings();
    if (playNotificationSound) playNotificationSound();
    const customerName = newBooking?.customer?.fullName || 'Customer';
    showToast(`🔔 Real-Time: New booking created by ${customerName}!`);
  });

  useSocketEvent('admin:booking_updated', (updatedBooking) => {
    fetchBookings();
    const status = updatedBooking?.bookingStatus || 'Updated';
    showToast(`🔔 Real-Time: Booking status changed to "${status}"`);
  });

  useSocketEvent('admin:new_application', (newApp) => {
    fetchApplications();
    if (playNotificationSound) playNotificationSound();
    const applicantName = newApp?.fullName || 'A vendor';
    showToast(`🔔 Real-Time: New vendor application from ${applicantName}!`);
  });

  useSocketEvent('admin:application_updated', () => {
    fetchApplications();
  });

  // Real-Time Inventory Stock updates
  useSocketEvent('inventory:stock_updated', (updatedItem) => {
    if (!updatedItem) return;
    const incomingId = updatedItem.inventoryId || updatedItem.id || updatedItem._id;
    const incomingSku = (updatedItem.skuCode || updatedItem.sku || '').toUpperCase();
    const newQty = Number(updatedItem.stockQuantity !== undefined ? updatedItem.stockQuantity : updatedItem.stock);

    setInventoryList((prev) =>
      prev.map((item) => {
        const curId = item.inventoryId || item.id || item._id;
        const curSku = (item.skuCode || item.sku || '').toUpperCase();
        if (curId === incomingId || (incomingSku && curSku === incomingSku)) {
          const threshold = Number(item.reorderThreshold || item.threshold || 10);
          const computedStatus =
            newQty <= 0
              ? 'Out of Stock'
              : newQty <= threshold
              ? 'Low Stock'
              : 'In Stock';
          return {
            ...item,
            stock: newQty,
            stockQuantity: newQty,
            status: computedStatus,
          };
        }
        return item;
      })
    );
  });

  // Real-Time Low Stock Alert
  useSocketEvent('inventory:low_stock_alert', (item) => {
    if (!item) return;
    if (playNotificationSound) playNotificationSound();
    showToast(`⚠️ Low Stock Alert: ${item.itemName} (${item.skuCode}) has only ${item.stockQuantity} units left!`);
  });

  // Real-Time Invoice Generated alert
  useSocketEvent('admin:invoice_generated', (invoice) => {
    if (!invoice) return;
    fetchBookings();
    if (playNotificationSound) playNotificationSound();
    showToast(`🧾 Invoice Generated: ₹${invoice.totalAmount} for ${invoice.serviceSnapshot?.appliance || 'Service'}`);
  });

  // Open Restock Modal (Screenshot 2)
  const handleOpenRestock = (item) => {
    setSelectedItem(item);
    setPurchasePrice(item.unitPrice ? item.unitPrice.toString() : '0.00');
    setRestockQty('');
    setIsRestockModalOpen(true);
  };

  // Confirm Restock
  const handleConfirmRestock = async () => {
    if (!selectedItem) return;
    const addedCount = Number(restockQty || 0);
    const cleanId = String(selectedItem.inventoryId || selectedItem.id).replace(/^#/, '');

    setInventoryList(prev => prev.map(inv => {
      if (inv.id === selectedItem.id || inv.inventoryId === cleanId) {
        const newCount = inv.stockCount + addedCount;
        const threshold = inv.reorderPoint || 10;
        return {
          ...inv,
          stockCount: newCount,
          stockLevel: newCount > threshold ? 'In Stock' : newCount > 0 ? 'Low Stock' : 'Out of Stock',
          unitPrice: purchasePrice && Number(purchasePrice) > 0 ? Number(purchasePrice) : inv.unitPrice,
          supplier: selectedSupplier || inv.supplier,
          lastUpdated: 'Today, Just now'
        };
      }
      return inv;
    }));
    setIsRestockModalOpen(false);
    showToast(`Inventory restocked for ${selectedItem.name}! (+${addedCount} units)`);

    // Connect to backend restock endpoint: PATCH /api/inventory/:inventoryId/restock
    if (token && addedCount > 0) {
      try {
        await restockInventoryApi(cleanId, addedCount, token);
      } catch (err) {
        console.error('Error restocking inventory in backend:', err);
      }
    }
  };

  // Add New Inventory Item handler
  const handleAddNewInventoryItem = async (newItemData) => {
    const threshold = Number(newItemData.reorderPoint) || 10;
    const initialCount = Number(newItemData.stockCount) || 0;
    const skuCode = newItemData.sku ? newItemData.sku.toUpperCase() : `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const newItem = {
      id: `#INV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newItemData.name,
      category: newItemData.category,
      stockLevel: initialCount > threshold ? 'In Stock' : initialCount > 0 ? 'Low Stock' : 'Out of Stock',
      stockCount: initialCount,
      unitPrice: Number(newItemData.unitPrice) || 0,
      lastUpdated: 'Today, Just now',
      sku: skuCode,
      reorderPoint: threshold,
      supplier: newItemData.supplier || 'Primary Supplier',
    };

    setInventoryList(prev => [newItem, ...prev]);
    showToast(`Added "${newItem.name}" to inventory!`);

    // Connect to backend create endpoint: POST /api/inventory
    if (token) {
      try {
        const payload = {
          itemName: newItemData.name,
          category: newItemData.category,
          skuCode: skuCode,
          stockQuantity: initialCount,
          reorderThreshold: threshold,
          unitPrice: Number(newItemData.unitPrice) || 0,
          supplierName: newItemData.supplier || '',
        };
        const res = await createInventoryApi(payload, token);
        if (res.success && res.inventory?.inventoryId) {
          setInventoryList(prev => prev.map(item => item.id === newItem.id ? { ...item, id: item.id, inventoryId: res.inventory.inventoryId } : item));
        }
      } catch (err) {
        console.error('Error creating inventory item in backend:', err);
      }
    }
  };

  // Delete Inventory Item
  const handleDeleteInventoryItem = async (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName || itemId}" from inventory?`)) {
      const cleanId = String(itemId).replace(/^#/, '');
      setInventoryList(prev => prev.filter(item => item.id !== itemId && item.inventoryId !== cleanId));
      showToast(`Deleted "${itemName || itemId}" from inventory`);

      // Connect to backend delete endpoint: DELETE /api/inventory/:inventoryId
      if (token) {
        try {
          await deleteInventoryApi(cleanId, token);
        } catch (err) {
          console.error('Error deleting inventory item from backend:', err);
        }
      }
    }
  };

  // Synchronize inventory with real service catalog and accurate market pricing
  const handleSyncRealCatalog = useCallback(() => {
    setIsSyncingCatalog(true);
    try {
      const livePricing = getLiveServicePricing();
      const updated = MASTER_REAL_INVENTORY.map((item) => {
        let price = item.unitPrice;
        if (livePricing && Array.isArray(livePricing)) {
          for (const cat of livePricing) {
            if (cat.subServices && Array.isArray(cat.subServices)) {
              const matchedSub = cat.subServices.find((s) =>
                s.label.toLowerCase().includes(item.name.toLowerCase()) ||
                item.name.toLowerCase().includes(s.label.toLowerCase())
              );
              if (matchedSub && matchedSub.price) {
                price = Number(matchedSub.price);
                break;
              }
            }
          }
        }
        return {
          ...item,
          unitPrice: price,
          lastUpdated: 'Today, Just now',
        };
      });

      setInventoryList(updated);
      try {
        localStorage.setItem('mm_inventory_data', JSON.stringify(updated));
        localStorage.setItem('mm_inventory_data_v2', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving synced inventory:', e);
      }
      showToast(`Synchronized ${updated.length} genuine spare parts with live service catalog!`);
    } catch (err) {
      console.error('Error syncing real inventory:', err);
      showToast('Error syncing real inventory catalog');
    } finally {
      setTimeout(() => setIsSyncingCatalog(false), 500);
    }
  }, [showToast]);

  // View Vendor Application Details Modal
  const handleViewApplication = (app) => {
    setSelectedApplication(app);
    setIsApplicationModalOpen(true);
  };

  // Reject Application
  const handleRejectApp = async (appId) => {
    try {
      const res = await rejectVendorApplication(appId, token);
      if (res.success) {
        setApplicationsList(prev =>
          prev.map(a =>
            a.id === appId || a.applicationId === appId || a._id === appId
              ? { ...a, status: 'Rejected' }
              : a
          )
        );
        setIsApplicationModalOpen(false);
        showToast(`Application rejected.`);
        fetchApplications();
      } else {
        showToast(res.message || 'Failed to reject application');
      }
    } catch (error) {
      showToast('Error rejecting application');
    }
  };

  // ── Vendor Form Reset & Autofill Helpers ─────────────────────────────────────
  const resetVendorForm = () => {
    setVendorForm({
      fullName: '',
      email: '',
      phone: '',
      specialization: '',
      serviceArea: '',
      appId: null,
    });
    setVendorFormError(null);
  };

  const autofillVendorForm = (app) => {
    if (!app) {
      resetVendorForm();
      return;
    }
    setVendorFormError(null);
    setVendorForm({
      fullName: app.name || app.fullName || '',
      email: app.email || '',
      phone: app.phone || app.phoneNumber || '',
      specialization: app.service || app.serviceType || app.specialOption || '',
      serviceArea: app.city || app.serviceAddress || '',
      appId: app.id || app.applicationId || app._id || null,
    });
    setActiveTab('id-creation');
    showToast(`Autofilled details for ${app.name || app.fullName || 'Vendor'}`);
  };

  // Clicking "Approve" — navigates to ID Creation tab (pre-filled), status stays Pending
  const handleApproveNavigate = (app) => {
    setIsApplicationModalOpen(false);
    autofillVendorForm(app);
  };

  // Open "View Vendor ID" modal
  const handleViewVendorCreds = async (app) => {
    setIsApplicationModalOpen(false);
    const appId = typeof app === 'object' && app !== null ? (app.applicationId || app.id || app._id) : app;
    if (!appId) {
      showToast('Application ID is missing');
      return;
    }

    let creds = vendorCredentials[appId];
    if (creds && creds.id) {
      setViewingCreds(creds);
      setIsViewCredsModalOpen(true);
      return;
    }

    const appObj = typeof app === 'object' && app !== null ? app : applicationsList.find(a => a.id === appId || a.applicationId === appId || a._id === appId);
    if (appObj && appObj.vendorId) {
      const existingCreds = {
        name: `${appObj?.name || appObj?.fullName || 'Vendor'} - ${appObj?.service || appObj?.serviceType || 'Service Technician'}`,
        id: appObj.vendorId,
        email: appObj.email,
        appId: appId,
      };
      setVendorCredentials(prev => ({ ...prev, [appId]: existingCreds }));
      setViewingCreds(existingCreds);
      setIsViewCredsModalOpen(true);
      return;
    }

    try {
      showToast('Fetching vendor ID...');
      const res = await getVendorCredentialsApi(appId, token);
      if (res.success && (res.credentials?.vendorId || res.vendor?.vendorId)) {
        const vendorId = res.credentials?.vendorId || res.vendor?.vendorId;
        const newCreds = {
          name: `${appObj?.name || appObj?.fullName || res.vendor?.fullName || 'Vendor'} - ${appObj?.service || appObj?.serviceType || 'Service Technician'}`,
          id: vendorId,
          email: res.vendor?.email || appObj?.email,
          appId: appId,
        };
        setVendorCredentials(prev => ({ ...prev, [appId]: newCreds }));
        setViewingCreds(newCreds);
        setIsViewCredsModalOpen(true);
      } else {
        showToast(res.message || 'Vendor ID not available');
      }
    } catch (e) {
      console.error('Error fetching credentials:', e);
      showToast('Could not fetch vendor ID');
    }
  };

  const handleExportExcel = (exportFrom, exportTo) => {
    const dataToExport = workHistory.filter(item => {
      const dateVal = item.dateCompleted !== '—' ? item.dateCompleted : (item.serviceDate !== '—' ? item.serviceDate : null);
      const itemDate = dateVal ? new Date(dateVal) : new Date();
      const start = exportFrom ? new Date(exportFrom) : new Date('2000-01-01');
      const end = exportTo ? new Date(exportTo) : new Date('2100-01-01');
      return itemDate >= start && itemDate <= end;
    });

    const htmlString = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
          th { background-color: #02182e; color: #ffffff; font-weight: bold; text-align: left; padding: 12px; border: 1px solid #cbd5e1; font-size: 14px; }
          td { padding: 10px; border: 1px solid #cbd5e1; color: #334155; font-size: 13px; }
          .title { font-size: 20px; font-weight: bold; color: #02182e; padding-bottom: 5px; border: none; }
          .subtitle { font-size: 12px; color: #64748b; padding-bottom: 15px; border: none; }
          .status-completed { color: #059669; font-weight: bold; }
          .status-other { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="6" class="title">Magic Mistry - Work History Report</td>
          </tr>
          <tr>
            <td colspan="6" class="subtitle">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</td>
          </tr>
          <tr>
            <th>REQ ID</th>
            <th>APPLIANCE</th>
            <th>CUSTOMER</th>
            <th>TECHNICIAN</th>
            <th>DATE COMPLETED</th>
            <th>STATUS</th>
          </tr>
          ${dataToExport.map(item => `
            <tr>
              <td style="font-weight: bold;">${item.id}</td>
              <td>${item.appliance}</td>
              <td>${item.customer}</td>
              <td>${item.technician}</td>
              <td>${item.dateCompleted}</td>
              <td class="${item.status === 'Completed' ? 'status-completed' : 'status-other'}">${item.status}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlString], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MagicMistry_WorkHistory_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Work history Excel file downloaded!');
  };

  const handleExportInventoryExcel = (exportFrom, exportTo) => {
    // We can filter inventoryList by lastRestocked
    const dataToExport = inventoryList.filter(item => {
      if (!item.lastRestocked) return true; // if no date, include it or not based on requirements
      const itemDate = new Date(item.lastRestocked);
      const start = exportFrom ? new Date(exportFrom) : new Date('2000-01-01');
      const end = exportTo ? new Date(exportTo) : new Date('2100-01-01');
      return itemDate >= start && itemDate <= end;
    });

    const htmlString = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
          th { background-color: #02182e; color: #ffffff; font-weight: bold; text-align: left; padding: 12px; border: 1px solid #cbd5e1; font-size: 14px; }
          td { padding: 10px; border: 1px solid #cbd5e1; color: #334155; font-size: 13px; }
          .title { font-size: 20px; font-weight: bold; color: #02182e; padding-bottom: 5px; border: none; }
          .subtitle { font-size: 12px; color: #64748b; padding-bottom: 15px; border: none; }
          .status-out { color: #dc2626; font-weight: bold; }
          .status-low { color: #d97706; font-weight: bold; }
          .status-healthy { color: #059669; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="7" class="title">Magic Mistry - Inventory Status Report</td>
          </tr>
          <tr>
            <td colspan="7" class="subtitle">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</td>
          </tr>
          <tr>
            <th>SKU ID</th>
            <th>ITEM NAME</th>
            <th>CATEGORY</th>
            <th>STOCK LEVEL</th>
            <th>CURRENT STOCK</th>
            <th>UNIT PRICE</th>
            <th>LAST RESTOCKED</th>
          </tr>
          ${dataToExport.map(item => {
            let statusClass = 'status-healthy';
            if (item.stockLevel === 'Out of Stock') statusClass = 'status-out';
            else if (item.stockLevel === 'Low Stock') statusClass = 'status-low';
            
            return `
            <tr>
              <td style="font-weight: bold;">${item.id}</td>
              <td>${item.name}</td>
              <td>${item.category}</td>
              <td class="${statusClass}">${item.stockLevel}</td>
              <td>${item.stockCount}</td>
              <td>₹${item.unitPrice.toFixed(2)}</td>
              <td>${item.lastUpdated}</td>
            </tr>
          `}).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlString], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MagicMistry_Inventory_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Inventory Excel file downloaded!');
  };

  // Generate Credentials Submit — saves per-vendor, marks app Approved
  const handleGenerateCredentials = async (e) => {
    e.preventDefault();
    setVendorFormError(null);
    if (!vendorForm.fullName || !vendorForm.email) {
      showToast('Please provide full name and email address.');
      return;
    }

    if (existingVendorMatch && !vendorForm.appId) {
      const errMsg = `Vendor already exists with this ${existingVendorMatch.field} (${existingVendorMatch.matchedValue}) with Vendor ID: ${existingVendorMatch.vendorId}. Cannot generate a duplicate ID.`;
      setVendorFormError(errMsg);
      showToast(errMsg);
      return;
    }

    if (vendorForm.appId) {
      // Connect to the backend to generate real credentials from an application
      try {
        const res = await approveVendorApplication(vendorForm.appId, token);
        if (res.success && res.credentials) {
          const creds = {
            name: `${vendorForm.fullName} - ${vendorForm.specialization || 'Service Technician'}`,
            id: res.credentials.vendorId,
            email: res.vendor?.email || vendorForm.email,
            tempPassword: res.credentials.temporaryPassword || res.credentials.password || '',
            appId: vendorForm.appId,
          };
          setGeneratedCreds(creds);
          setVendorCredentials(prev => ({ ...prev, [vendorForm.appId]: creds }));
          setApplicationsList(prev =>
            prev.map(a =>
              (a.id === vendorForm.appId ||
               a.applicationId === vendorForm.appId ||
               a._id === vendorForm.appId ||
               (a.email && vendorForm.email && a.email.toLowerCase() === vendorForm.email.toLowerCase()))
                ? { ...a, status: 'Approved', vendorId: res.credentials.vendorId }
                : a
            )
          );
          setIsCredentialSuccessOpen(true);
          showToast('Vendor credentials generated successfully!');
          fetchApplications();
          resetVendorForm();
        } else {
          setVendorFormError(res.message || 'Failed to approve application');
          showToast(res.message || 'Failed to approve application');
        }
      } catch (err) {
        setVendorFormError('Error approving application');
        showToast('Error approving application');
      }
    } else {
      // Direct creation via backend API
      try {
        const res = await createVendorByAdminApi(vendorForm, token);
        if (res.success && res.credentials) {
          const creds = {
            name: `${vendorForm.fullName} - ${vendorForm.specialization || 'Service Technician'}`,
            id: res.credentials.vendorId,
            email: res.vendor?.email || vendorForm.email,
            tempPassword: res.credentials.temporaryPassword || res.credentials.password || '',
            appId: null,
          };
          setGeneratedCreds(creds);
          setIsCredentialSuccessOpen(true);
          showToast('Vendor credentials generated successfully!');
          fetchApplications();
          resetVendorForm();
        } else {
          setVendorFormError(res.message || 'Failed to create vendor credentials');
          showToast(res.message || 'Failed to create vendor credentials');
        }
      } catch (err) {
        setVendorFormError('Error creating vendor credentials');
        showToast('Error creating vendor credentials');
      }
    }
  };

  // Filtered inventory list with broader search across name, ID, SKU, and supplier
  const filteredInventory = useMemo(() => {
    return inventoryList.filter(item => {
      const q = (searchTerm || '').toLowerCase().trim();
      const matchesSearch = !q ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.id || '').toLowerCase().includes(q) ||
        (item.sku || '').toLowerCase().includes(q) ||
        (item.supplier || '').toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All Status' || item.stockLevel === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventoryList, searchTerm, selectedCategory, selectedStatus]);

  const totalInvEntries = filteredInventory.length;
  const totalInvPages = Math.max(1, Math.ceil(totalInvEntries / invItemsPerPage));

  // Reset page to 1 when search, category, status filter, or itemsPerPage change
  useEffect(() => {
    setInvCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, invItemsPerPage]);

  // Paginated inventory slice for current page
  const paginatedInventory = useMemo(() => {
    const startIndex = (invCurrentPage - 1) * invItemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + invItemsPerPage);
  }, [filteredInventory, invCurrentPage, invItemsPerPage]);

  const handleInvPageChange = (page) => {
    if (page >= 1 && page <= totalInvPages) {
      setInvCurrentPage(page);
      if (invTableRef.current) {
        invTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleInvPrevious = () => {
    if (invCurrentPage > 1) {
      handleInvPageChange(invCurrentPage - 1);
    }
  };

  const handleInvNext = () => {
    if (invCurrentPage < totalInvPages) {
      handleInvPageChange(invCurrentPage + 1);
    }
  };

  const getInvPageNumbers = () => {
    const pages = [];
    if (totalInvPages <= 5) {
      for (let i = 1; i <= totalInvPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (invCurrentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, invCurrentPage - 1);
      const end = Math.min(totalInvPages - 1, invCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (invCurrentPage < totalInvPages - 2) {
        pages.push('...');
      }
      pages.push(totalInvPages);
    }
    return pages;
  };

  // Dynamic Inventory KPI Metrics
  const totalInventoryCount = inventoryList.length;
  const lowStockInventoryCount = inventoryList.filter(item => (Number(item.stockCount) || 0) <= (Number(item.reorderPoint) || 10)).length;
  const recentRestocksCount = inventoryList.filter(item => item.lastUpdated && (item.lastUpdated.toLowerCase().includes('today') || item.lastUpdated.toLowerCase().includes('just now'))).length;
  const totalInventoryValuation = inventoryList.reduce((acc, item) => acc + (Number(item.stockCount || 0) * Number(item.unitPrice || 0)), 0);

  // Sidebar navigation menu items grouped logically by functional domain
  const sidebarNavGroups = [
    {
      group: 'Main',
      items: [
        { id: 'overview',        label: 'Dashboard Overview',   icon: LayoutDashboard },
      ],
    },
    {
      group: 'Operations',
      items: [
        { id: 'work-history',    label: 'Work History',         icon: Clock },
        { id: 'inventory',       label: 'Inventory Management', icon: Package },
        { id: 'service-pricing', label: 'Services & Fuel Pricing', icon: IndianRupee },
      ],
    },
    {
      group: 'People & Partners',
      items: [
        { id: 'users',           label: 'User Management',      icon: Users },
        { id: 'applications',    label: 'Vendor Applications',  icon: FileText, badge: pendingApplicationsCount > 0 ? pendingApplicationsCount.toString() : null },
        { id: 'id-creation',     label: 'Vendor ID Creation',   icon: UserPlus, isOrange: true },
      ],
    },
    {
      group: 'Finance & Payments',
      items: [
        { id: 'payment-requests', label: 'Payment Requests',    icon: IndianRupee, badge: paymentRequests.filter(p => p.status === 'Pending').length > 0 ? paymentRequests.filter(p => p.status === 'Pending').length.toString() : null },
        { id: 'analytics',       label: 'Financial Analytics',  icon: TrendingUp },
      ],
    },
  ];

  const sidebarNavItems = sidebarNavGroups.flatMap((group) => group.items);

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans antialiased text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 print:hidden">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── SIDEBAR NAVIGATION (Logically Grouped & Formatted) ──────────────── */}
            <aside className="lg:w-64 shrink-0">
              <div
                data-lenis-prevent
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain custom-scrollbar"
              >

                {/* Sidebar Navigation Groups */}
                <nav className="space-y-4">
                  {sidebarNavGroups.map((group) => (
                    <div key={group.group} className="space-y-1.5">
                      <div className="px-3.5 pt-1 text-[10px] font-black tracking-wider text-slate-400 uppercase select-none">
                        {group.group}
                      </div>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const isActive = activeTab === item.id;
                          const Icon = item.icon;

                          return (
                            <motion.button
                              key={item.id}
                              onClick={() => setActiveTab(item.id)}
                              whileHover={{ x: 3 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/25'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                <span className="text-left leading-snug">{item.label}</span>
                              </div>

                              {item.badge && (
                                <span className={`ml-2 px-2 py-0.5 text-[11px] font-black rounded-full shrink-0 ${
                                  isActive ? 'bg-white text-[#FF6B00]' : 'bg-rose-500 text-white'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Divider */}
                <div className="pt-4 border-t border-slate-100 space-y-1">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Back to Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout</span>
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
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                              <button
                                onClick={() => setActiveTab('work-history')}
                                className="w-full sm:w-auto text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg transition-colors cursor-pointer text-center border border-blue-100"
                              >
                                View Full Work History
                              </button>
                              <div className="relative w-full sm:w-auto">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  placeholder="Search ID, Customer..."
                                  className="w-full sm:w-56 pl-9 pr-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                />
                              </div>
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
                                {isBookingsLoading ? (
                                  <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                        <span>Loading live dispatches from server...</span>
                                      </div>
                                    </td>
                                  </tr>
                                ) : paginatedDispatch.length > 0 ? (
                                  paginatedDispatch.map((item) => {
                                    const AppIcon = item.applianceIcon || Wrench;
                                    return (
                                      <tr key={item.rawId || item.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-5 font-bold text-slate-600">{item.id}</td>
                                        <td className="py-4 px-4">
                                          <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                                              <AppIcon className="w-4 h-4" />
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
                                          {renderBookingStatusBadge(item.status)}
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                          <button 
                                            onClick={() => { setSelectedDispatchItem(item); setIsDispatchModalOpen(true); }}
                                            className="text-xs font-bold cursor-pointer text-[#02182e] hover:text-[#082848]"
                                          >
                                            View
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                                      No active dispatches currently in queue.
                                    </td>
                                  </tr>
                                )}
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
                            {applicationsList.filter(app => app.status === 'Pending').slice(0, 3).map((app, idx) => (
                              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                                    <User className="w-5 h-5 text-slate-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-sm text-slate-900">{app.name}</h3>
                                    <p className="text-[11px] text-slate-500 font-medium mb-2">Applied on {app.date}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                        {app.service}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={() => setActiveTab('applications')}
                                      className="w-full py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors">
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
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                          onClick={handleSyncRealCatalog}
                          disabled={isSyncingCatalog}
                          className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-orange-600 font-extrabold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                          title="Fetch and sync genuine parts catalog and accurate pricing data"
                        >
                          <RefreshCw className={`w-4 h-4 ${isSyncingCatalog ? 'animate-spin text-orange-500' : 'text-slate-500'}`} />
                          <span>Sync Real Catalog</span>
                        </button>
                        <button
                          onClick={() => {
                            setExportType('inventory');
                            setIsExportModalOpen(true);
                          }}
                          className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-slate-500" /> Export Report
                        </button>
                        <button
                          onClick={() => setIsAddInventoryModalOpen(true)}
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
                          <span className="text-3xl font-black text-slate-900 tracking-tight">{totalInventoryCount}</span>
                          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3.5 h-3.5" /> Tracked SKUs in catalog
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
                          <span className="text-3xl font-black text-slate-900 tracking-tight">{lowStockInventoryCount}</span>
                          <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1">
                            {lowStockInventoryCount > 0 ? `↑ ${lowStockInventoryCount} require attention` : 'All stocks healthy'}
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
                          <span className="text-3xl font-black text-slate-900 tracking-tight">{recentRestocksCount}</span>
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            Updated recently
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
                          <IndianRupee className="w-5 h-5 text-slate-700" />
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">₹{totalInventoryValuation.toLocaleString('en-IN')}</span>
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            Estimated inventory value
                          </p>
                        </div>
                      </motion.div>

                    </div>

                    {/* ─ CONTROL BAR & DATA TABLE CONTAINER (Exact match to Screenshots 1 & 3) ─ */}
                    <div ref={invTableRef} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">

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
                              {Array.from(new Set(['Appliance', 'Electrical', 'Plumbing', ...inventoryList.map((item) => item.category).filter(Boolean)])).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
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
                        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
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
                            {filteredInventory.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="py-16 text-center text-slate-400">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                                      <Package className="w-6 h-6" />
                                    </div>
                                    <p className="font-extrabold text-sm text-slate-700">No inventory items found</p>
                                    <p className="text-xs text-slate-400 max-w-sm">
                                      {inventoryList.length === 0
                                        ? 'No inventory items tracked yet. Click "Add New Item" to populate your catalog.'
                                        : 'No items match your search or filter criteria. Try adjusting the filters above.'}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedInventory.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-4 px-6 font-bold text-slate-900">{row.id}</td>
                                  <td className="py-4 px-4 font-bold text-slate-800">{row.name}</td>
                                  <td className="py-4 px-4 font-semibold text-slate-500">{row.category}</td>
                                  <td className="py-4 px-4">
                                    <StockLevelBadge level={row.stockLevel} count={row.stockCount} />
                                  </td>
                                  <td className="py-4 px-4 font-extrabold text-slate-900">₹{Number(row.unitPrice || 0).toLocaleString('en-IN')}</td>
                                  <td className="py-4 px-4 font-medium text-slate-500">{row.lastUpdated}</td>
                                  <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleOpenRestock(row)}
                                        className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                        title="Restock Inventory"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteInventoryItem(row.id, row.name)}
                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Item"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Professional Inventory Pagination Controls */}
                      {totalInvEntries > 0 && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                          {/* Showing Entries Counter & Rows Per Page */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                            <div>
                              Showing{' '}
                              <span className="font-extrabold text-slate-900">
                                {(invCurrentPage - 1) * invItemsPerPage + 1}
                              </span>{' '}
                              to{' '}
                              <span className="font-extrabold text-slate-900">
                                {Math.min(invCurrentPage * invItemsPerPage, totalInvEntries)}
                              </span>{' '}
                              of{' '}
                              <span className="font-extrabold text-slate-900">
                                {totalInvEntries}
                              </span>{' '}
                              items
                            </div>

                            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                              <span className="text-[11px] text-slate-400 font-semibold">Rows per page:</span>
                              <select
                                value={invItemsPerPage}
                                onChange={(e) => setInvItemsPerPage(Number(e.target.value))}
                                className="bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                              >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                              </select>
                            </div>
                          </div>

                          {/* Navigation Buttons (Previous, Page Numbers, Next) */}
                          <div className="flex items-center gap-1.5">
                            {/* Previous Button */}
                            <button
                              type="button"
                              onClick={handleInvPrevious}
                              disabled={invCurrentPage === 1}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              aria-label="Previous Page"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Previous</span>
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                              {getInvPageNumbers().map((page, idx) => {
                                if (page === '...') {
                                  return (
                                    <span
                                      key={`inv-ellipsis-${idx}`}
                                      className="px-2 py-1 text-slate-400 text-xs font-bold select-none"
                                    >
                                      ...
                                    </span>
                                  );
                                }

                                const isActive = page === invCurrentPage;
                                return (
                                  <button
                                    key={`inv-page-${page}`}
                                    type="button"
                                    onClick={() => handleInvPageChange(page)}
                                    className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                      isActive
                                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Next Button */}
                            <button
                              type="button"
                              onClick={handleInvNext}
                              disabled={invCurrentPage === totalInvPages}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              aria-label="Next Page"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

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

                    {/* Search & Filter Toolbar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={appSearchTerm}
                          onChange={(e) => setAppSearchTerm(e.target.value)}
                          placeholder="Search by applicant name, email, app ID, service, city, or phone..."
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {/* Status Filter */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setAppStatusFilter(status)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                appStatusFilter === status
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div ref={appTableRef} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
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
                            {filteredApplications.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="py-16 text-center text-slate-400">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                                      <FileText className="w-6 h-6" />
                                    </div>
                                    <p className="font-extrabold text-sm text-slate-700">No vendor applications found</p>
                                    <p className="text-xs text-slate-400 max-w-sm">
                                      {applicationsList.length === 0
                                        ? 'Submitted technician partner applications will appear here for review and verification.'
                                        : 'No applications match your current search or filter criteria. Try adjusting the filters above.'}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedApplications.map((app) => (
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

                                      {/* View Vendor ID — shown when approved or ID has been generated */}
                                      {(app.status === 'Approved' || vendorCredentials[app.id]) && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleViewVendorCreds(app.id);
                                          }}
                                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                          title="View Vendor ID"
                                        >
                                          <ShieldCheck className="w-3.5 h-3.5" /> View Vendor ID
                                        </button>
                                      )}

                                      {/* Quick Approve / Reject — only if Pending AND no ID yet */}
                                      {app.status === 'Pending' && !vendorCredentials[app.id] && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleApproveNavigate(app);
                                            }}
                                            className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                                            title="Approve & Create Vendor ID"
                                          >
                                            <Check className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleRejectApp(app.id);
                                            }}
                                            className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                                            title="Reject Application"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </>
                                      )}

                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalAppEntries > 0 && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                          {/* Showing Entries Counter & Rows Per Page */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                            <div>
                              Showing{' '}
                              <span className="font-extrabold text-slate-900">
                                {(appCurrentPage - 1) * appItemsPerPage + 1}
                              </span>{' '}
                              to{' '}
                              <span className="font-extrabold text-slate-900">
                                {Math.min(appCurrentPage * appItemsPerPage, totalAppEntries)}
                              </span>{' '}
                              of{' '}
                              <span className="font-extrabold text-slate-900">
                                {totalAppEntries}
                              </span>{' '}
                              applications
                            </div>

                            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                              <span className="text-[11px] text-slate-400">Rows per page:</span>
                              <select
                                value={appItemsPerPage}
                                onChange={(e) => setAppItemsPerPage(Number(e.target.value))}
                                className="bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                              >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                              </select>
                            </div>
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex items-center gap-1.5">
                            {/* Previous Button */}
                            <button
                              type="button"
                              onClick={handleAppPrevious}
                              disabled={appCurrentPage === 1}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              aria-label="Previous Page"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Previous</span>
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                              {getAppPageNumbers().map((page, idx) => {
                                if (page === '...') {
                                  return (
                                    <span
                                      key={`app-ellipsis-${idx}`}
                                      className="px-2 py-1 text-slate-400 text-xs font-bold select-none"
                                    >
                                      ...
                                    </span>
                                  );
                                }

                                const isActive = page === appCurrentPage;
                                return (
                                  <button
                                    key={`app-page-${page}`}
                                    type="button"
                                    onClick={() => handleAppPageChange(page)}
                                    className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                      isActive
                                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Next Button */}
                            <button
                              type="button"
                              onClick={handleAppNext}
                              disabled={appCurrentPage === totalAppPages}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              aria-label="Next Page"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}


                {/* ───────────────────────────────────────────────────────────────── */}
                {/* 3. VANDOR ID CREATION TAB (Exact match to Screenshots 3, 4, 5)   */}
                {/* ───────────────────────────────────────────────────────────────── */}
                {/* ───────────────────────────────────────────────────────────────── */}
                {/* NEW PAYMENT REQUESTS TAB                                          */}
                {/* ───────────────────────────────────────────────────────────────── */}
                {activeTab === 'payment-requests' && (
                  <motion.div
                    key="payment-requests"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#02182e] tracking-tight">Vendor Payment Requests</h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">Review and process payout requests from vendors.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setExportType('payment');
                            setIsExportModalOpen(true);
                          }}
                          className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer">
                          <Download className="w-4 h-4 text-slate-500" /> Export Records
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pending Payouts</span>
                          <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-3xl font-black text-[#02182e]">{paymentRequests.filter(p => p.status === 'Pending').length}</span>
                        <p className="text-xs font-medium text-slate-500 mt-2">Awaiting admin review</p>
                      </div>
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Amount Pending</span>
                          <IndianRupee className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-3xl font-black text-[#02182e]">
                          ₹{paymentRequests.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </span>
                        <p className="text-xs font-medium text-slate-500 mt-2">Total requested amount</p>
                      </div>
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Paid This Month</span>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-3xl font-black text-[#02182e]">
                          ₹{paymentRequests.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </span>
                        <p className="text-xs font-medium text-emerald-600 mt-2">Cleared payouts</p>
                      </div>
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={paySearchTerm}
                          onChange={(e) => setPaySearchTerm(e.target.value)}
                          placeholder="Search by request ID, vendor name, vendor ID, or UPI..."
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {/* Status Filter */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          {['All', 'Pending', 'Approved', 'Paid'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setPayStatusFilter(status)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                payStatusFilter === status
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Data Table */}
                    <div ref={payTableRef} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-extrabold text-[#02182e]">Payment Requests</h2>
                        <span className="text-xs font-bold text-slate-500">
                          {totalPayEntries} total {totalPayEntries === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-100">
                              <th className="py-3 px-5">REQ ID</th>
                              <th className="py-3 px-4">VENDOR DETAILS</th>
                              <th className="py-3 px-4">PAYMENT INFO</th>
                              <th className="py-3 px-4">DAYS OF WORK</th>
                              <th className="py-3 px-4">AMOUNT</th>
                              <th className="py-3 px-4">DATE</th>
                              <th className="py-3 px-4">STATUS</th>
                              <th className="py-3 px-5 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredPaymentRequests.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="py-16 text-center text-slate-400">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                                      <IndianRupee className="w-6 h-6" />
                                    </div>
                                    <p className="font-extrabold text-sm text-slate-700">No payment requests found</p>
                                    <p className="text-xs text-slate-400 max-w-sm">
                                      {paymentRequests.length === 0
                                        ? 'Vendor payout requests will appear here once submitted.'
                                        : 'No requests match your current search or filter criteria. Try adjusting the filters above.'}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedPaymentRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-4 px-5 font-bold text-slate-700">{req.id}</td>
                                  <td className="py-4 px-4">
                                    <div className="font-bold text-slate-900">{req.vendorName}</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">{req.vendorId}</div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="text-xs font-semibold text-slate-700">UPI: <span className="text-blue-600">{req.upiId}</span></div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">A/C: {req.bankAccount}</div>
                                  </td>
                                  <td className="py-4 px-4 font-semibold text-slate-600">{req.daysOfWork} Days</td>
                                  <td className="py-4 px-4 font-black text-slate-900">₹{req.amount.toLocaleString()}</td>
                                  <td className="py-4 px-4 text-slate-500 font-medium">{req.date}</td>
                                  <td className="py-4 px-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                      req.status === 'Paid' ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200' :
                                      req.status === 'Approved' ? 'bg-blue-100/90 text-blue-800 border border-blue-200' :
                                      'bg-amber-100/90 text-amber-800 border border-amber-200'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        req.status === 'Paid' ? 'bg-emerald-500' :
                                        req.status === 'Approved' ? 'bg-blue-500' :
                                        'bg-amber-500 animate-pulse'
                                      }`} />
                                      {req.status}
                                    </span>
                                  </td>
                                  <td className="py-4 px-5 text-right">
                                    {req.status === 'Pending' ? (
                                      <div className="flex items-center justify-end gap-2">
                                        <button 
                                          onClick={() => {
                                            setPaymentRequests(prev => prev.map(p => p.id === req.id ? { ...p, status: 'Approved' } : p));
                                            if (socket && req.vendorId) {
                                              socket.emit('admin:update_payout', {
                                                vendorId: req.vendorId,
                                                payoutId: req.id,
                                                status: 'Approved',
                                                amount: req.amount,
                                              });
                                            }
                                            showToast(`Request ${req.id} Approved`);
                                          }}
                                          className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer" title="Approve"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setPaymentRequests(prev => prev.filter(p => p.id !== req.id));
                                            if (socket && req.vendorId) {
                                              socket.emit('admin:update_payout', {
                                                vendorId: req.vendorId,
                                                payoutId: req.id,
                                                status: 'Rejected',
                                                amount: req.amount,
                                              });
                                            }
                                            showToast(`Request ${req.id} Rejected`);
                                          }}
                                          className="p-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer" title="Reject"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : req.status === 'Approved' ? (
                                      <button 
                                        onClick={() => {
                                          setPaymentRequests(prev => prev.map(p => p.id === req.id ? { ...p, status: 'Paid' } : p));
                                          if (socket && req.vendorId) {
                                            socket.emit('admin:update_payout', {
                                              vendorId: req.vendorId,
                                              payoutId: req.id,
                                              status: 'Paid',
                                              amount: req.amount,
                                            });
                                          }
                                          showToast(`Request ${req.id} Marked as Paid`);
                                        }}
                                        className="px-3 py-1.5 bg-[#02182e] hover:bg-[#082848] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                      >
                                        Mark Paid
                                      </button>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-400">COMPLETED</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPayEntries > 0 && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                          {/* Showing Entries Counter & Rows Per Page */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                            <div>
                              Showing{' '}
                              <span className="font-extrabold text-slate-900">
                                {(payCurrentPage - 1) * payItemsPerPage + 1}
                              </span>{' '}
                              to{' '}
                              <span className="font-extrabold text-slate-900">
                                {Math.min(payCurrentPage * payItemsPerPage, totalPayEntries)}
                              </span>{' '}
                              of{' '}
                              <span className="font-extrabold text-slate-900">
                                {totalPayEntries}
                              </span>{' '}
                              requests
                            </div>

                            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                              <span className="text-[11px] text-slate-400">Rows per page:</span>
                              <select
                                value={payItemsPerPage}
                                onChange={(e) => setPayItemsPerPage(Number(e.target.value))}
                                className="bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                              >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                              </select>
                            </div>
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex items-center gap-1.5">
                            {/* Previous Button */}
                            <button
                              type="button"
                              onClick={handlePayPrevious}
                              disabled={payCurrentPage === 1}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              aria-label="Previous Page"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Previous</span>
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                              {getPayPageNumbers().map((page, idx) => {
                                if (page === '...') {
                                  return (
                                    <span
                                      key={`pay-ellipsis-${idx}`}
                                      className="px-2 py-1 text-slate-400 text-xs font-bold select-none"
                                    >
                                      ...
                                    </span>
                                  );
                                }

                                const isActive = page === payCurrentPage;
                                return (
                                  <button
                                    key={`pay-page-${page}`}
                                    type="button"
                                    onClick={() => handlePayPageChange(page)}
                                    className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                      isActive
                                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Next Button */}
                            <button
                              type="button"
                              onClick={handlePayNext}
                              disabled={payCurrentPage === totalPayPages}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              aria-label="Next Page"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

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

                    {/* Auto-fill notice if navigated from an application */}
                    {vendorForm.appId && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
                        <BadgeCheck className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold text-amber-800">Auto-filled from Application</p>
                          <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                            Details pre-loaded for <span className="font-bold">{vendorForm.fullName}</span>. Review and click Generate Credentials.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Vendor Information Form (Exact match to Screenshot 5) */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-[#02182e] font-black text-lg">
                          <Wrench className="w-5 h-5 text-amber-600" />
                          <span>Vendor Information</span>
                        </div>
                        {(vendorForm.fullName || vendorForm.email || vendorForm.appId) && (
                          <button
                            type="button"
                            onClick={resetVendorForm}
                            className="text-xs font-extrabold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            ✕ Clear Fields
                          </button>
                        )}
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
                              onChange={(e) => {
                                setVendorForm({ ...vendorForm, email: e.target.value });
                                if (vendorFormError) setVendorFormError(null);
                              }}
                              placeholder="robert.s@hvac-pros.com"
                              className={`w-full px-4 py-3 bg-slate-50 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 ${
                                existingVendorMatch?.fieldKey === 'email'
                                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40 text-rose-900'
                                  : 'border-slate-200 focus:ring-orange-500'
                              }`}
                            />
                            {existingVendorMatch?.fieldKey === 'email' && (
                              <p className="text-[11px] text-rose-600 font-extrabold mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                Vendor already exists with this email (Vendor ID: {existingVendorMatch.vendorId})
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                            <input
                              type="text"
                              value={vendorForm.phone}
                              onChange={(e) => {
                                setVendorForm({ ...vendorForm, phone: e.target.value });
                                if (vendorFormError) setVendorFormError(null);
                              }}
                              placeholder="+1 (555) 000-0000"
                              className={`w-full px-4 py-3 bg-slate-50 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 ${
                                existingVendorMatch?.fieldKey === 'phone'
                                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40 text-rose-900'
                                  : 'border-slate-200 focus:ring-orange-500'
                              }`}
                            />
                            {existingVendorMatch?.fieldKey === 'phone' && (
                              <p className="text-[11px] text-rose-600 font-extrabold mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                Vendor already exists with this phone number (Vendor ID: {existingVendorMatch.vendorId})
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Specialization</label>
                            <div className="relative">
                              <select
                                value={vendorForm.specialization}
                                onChange={(e) => setVendorForm({ ...vendorForm, specialization: e.target.value })}
                                className="w-full appearance-none px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                              >
                                <option value="">Select Specialization / Service Category</option>
                                {vendorForm.specialization && !SERVICE_SPECIALIZATIONS.includes(vendorForm.specialization) && (
                                  <option value={vendorForm.specialization}>{vendorForm.specialization}</option>
                                )}
                                {SERVICE_SPECIALIZATIONS.map((spec) => (
                                  <option key={spec} value={spec}>
                                    {spec}
                                  </option>
                                ))}
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

                        {existingVendorMatch && (
                          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-bold">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-extrabold text-rose-900">Vendor Already Exists</p>
                              <p className="text-[11px] text-rose-700 mt-0.5">
                                A vendor account ({existingVendorMatch.name}) is already registered with this {existingVendorMatch.field} ({existingVendorMatch.matchedValue}) with <span className="font-extrabold text-rose-900">Vendor ID: {existingVendorMatch.vendorId}</span>. A new ID cannot be generated.
                              </p>
                            </div>
                          </div>
                        )}

                        {vendorFormError && !existingVendorMatch && (
                          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>{vendorFormError}</span>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={Boolean(existingVendorMatch)}
                            className={`px-6 py-3 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                              existingVendorMatch
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300'
                                : 'bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white cursor-pointer'
                            }`}
                          >
                            <Lock className="w-4 h-4" />
                            {existingVendorMatch ? 'Vendor Already Exists (ID Blocked)' : 'Generate Credentials'}
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
                      <p className="text-slate-500 text-sm mt-1">Manage active customers, technician partners, status (Active, Blocked, Suspended), and profile access.</p>
                    </div>

                    {/* KPI Quick Counter Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">{usersList.length}</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
                        <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active Users</div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">
                          {usersList.filter((u) => u.status?.toLowerCase() === 'active' || u.status?.toLowerCase() === 'verified').length}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-sm">
                        <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Suspended</div>
                        <div className="text-2xl font-black text-amber-600 mt-1">
                          {usersList.filter((u) => u.status?.toLowerCase() === 'suspended').length}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-rose-100 bg-rose-50/20 shadow-sm">
                        <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Blocked</div>
                        <div className="text-2xl font-black text-rose-600 mt-1">
                          {usersList.filter((u) => u.status?.toLowerCase() === 'blocked').length}
                        </div>
                      </div>
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          placeholder="Search by name, email, or user ID..."
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {/* Role Filter */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          {['All', 'Customer', 'Technician', 'Admin'].map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setUserRoleFilter(role)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                userRoleFilter === role
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          {['All', 'Active', 'Suspended', 'Blocked'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setUserStatusFilter(st)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                userStatusFilter === st
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Users Table */}
                    <div ref={userTableRef} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 uppercase font-extrabold border-b border-slate-100">
                              <th className="py-4 px-6">USER ID</th>
                              <th className="py-4 px-4">NAME & CONTACT</th>
                              <th className="py-4 px-4">ROLE</th>
                              <th className="py-4 px-4">TOTAL BOOKINGS</th>
                              <th className="py-4 px-4">STATUS</th>
                              <th className="py-4 px-6 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="py-16 text-center text-slate-400">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                                      <Users className="w-6 h-6" />
                                    </div>
                                    <p className="font-extrabold text-sm text-slate-700">No original users or partners found</p>
                                    <p className="text-xs text-slate-400 max-w-sm">
                                      {usersList.length === 0
                                        ? 'Newly registered customers, applied technicians, and approved vendors from the database will appear here automatically.'
                                        : 'No users match your current search or filter criteria. Try adjusting the filters above.'}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedUsers.map((usr) => {
                                const st = usr.status?.toLowerCase();
                                const isBlocked = st === 'blocked';
                                const isSuspended = st === 'suspended';
                                const isActive = st === 'active' || st === 'verified';

                                return (
                                  <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 font-bold text-slate-900 font-mono">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                                          {usr.name ? usr.name.substring(0, 2).toUpperCase() : 'US'}
                                        </div>
                                        <div>
                                          <div>{usr.id}</div>
                                          <div className="text-[10px] text-slate-400 font-normal">{usr.joined || 'Member'}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-4 px-4 font-bold text-slate-800">
                                      <div>{usr.name}</div>
                                      <div className="text-[11px] text-slate-400 font-normal flex items-center gap-2">
                                        <span>{usr.email}</span>
                                        {usr.phone && <span>• {usr.phone}</span>}
                                      </div>
                                    </td>
                                    <td className="py-4 px-4">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                          usr.role === 'Technician' || usr.role === 'vendor'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : usr.role === 'Admin'
                                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                        }`}
                                      >
                                        {usr.role}
                                      </span>
                                    </td>
                                    <td className="py-4 px-4 font-black text-slate-900">{usr.bookings ?? 0}</td>
                                    <td className="py-4 px-4">
                                      <StockLevelBadge level={usr.status} />
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {/* Quick status toggle buttons */}
                                        {isActive && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => handleQuickStatusChange(usr, 'Suspended')}
                                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 text-[11px] font-bold transition-colors cursor-pointer"
                                              title="Suspend Account"
                                            >
                                              Suspend
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleQuickStatusChange(usr, 'Blocked')}
                                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                                              title="Block Account"
                                            >
                                              Block
                                            </button>
                                          </>
                                        )}

                                        {isSuspended && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => handleQuickStatusChange(usr, 'Active')}
                                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                                              title="Activate / Unsuspend Account"
                                            >
                                              Activate
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleQuickStatusChange(usr, 'Blocked')}
                                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                                              title="Block Account"
                                            >
                                              Block
                                            </button>
                                          </>
                                        )}

                                        {isBlocked && (
                                          <button
                                            type="button"
                                            onClick={() => handleQuickStatusChange(usr, 'Active')}
                                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                                            title="Unblock Account"
                                          >
                                            Unblock
                                          </button>
                                        )}

                                        {/* Edit Profile Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleEditUserProfile(usr)}
                                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                        >
                                          <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                                          Edit Profile
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalUserEntries > 0 && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                          {/* Showing Entries Counter & Rows Per Page */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                            <div>
                              Showing{' '}
                              <span className="font-extrabold text-slate-900">
                                {(userCurrentPage - 1) * userItemsPerPage + 1}
                              </span>{' '}
                              to{' '}
                              <span className="font-extrabold text-slate-900">
                                {Math.min(userCurrentPage * userItemsPerPage, totalUserEntries)}
                              </span>{' '}
                              of{' '}
                              <span className="font-extrabold text-slate-900">
                                {totalUserEntries}
                              </span>{' '}
                              users
                            </div>

                            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                              <span className="text-[11px] text-slate-400">Rows per page:</span>
                              <select
                                value={userItemsPerPage}
                                onChange={(e) => setUserItemsPerPage(Number(e.target.value))}
                                className="bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                              >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                              </select>
                            </div>
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex items-center gap-1.5">
                            {/* Previous Button */}
                            <button
                              type="button"
                              onClick={handleUserPrevious}
                              disabled={userCurrentPage === 1}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              aria-label="Previous Page"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Previous</span>
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                              {getUserPageNumbers().map((page, idx) => {
                                if (page === '...') {
                                  return (
                                    <span
                                      key={`user-ellipsis-${idx}`}
                                      className="px-2 py-1 text-slate-400 text-xs font-bold select-none"
                                    >
                                      ...
                                    </span>
                                  );
                                }

                                const isActive = page === userCurrentPage;
                                return (
                                  <button
                                    key={`user-page-${page}`}
                                    type="button"
                                    onClick={() => handleUserPageChange(page)}
                                    className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                      isActive
                                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Next Button */}
                            <button
                              type="button"
                              onClick={handleUserNext}
                              disabled={userCurrentPage === totalUserPages}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              aria-label="Next Page"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-extrabold text-[#02182e]">Financial Analytics</h1>
                        <p className="text-slate-500 text-sm mt-1">Comprehensive platform revenue metrics, service charges, and payouts.</p>
                      </div>
                      <button 
                        onClick={() => showToast('Financial Report Downloaded!')}
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Export Full Report
                      </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <DollarSign className="w-12 h-12 text-slate-50 absolute top-4 right-4 pointer-events-none" />
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Gross Revenue (YTD)</span>
                        <div className="text-2xl font-black text-[#02182e] mt-2 tracking-tight">₹18,45,500</div>
                        <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5"/> +18.4% vs last year</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <IndianRupee className="w-12 h-12 text-slate-50 absolute top-4 right-4 pointer-events-none" />
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Net Profit / Margin</span>
                        <div className="text-2xl font-black text-[#02182e] mt-2 tracking-tight">₹6,23,700</div>
                        <p className="text-xs font-bold text-emerald-600 mt-2">33.8% Net Margin</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <Users className="w-12 h-12 text-slate-50 absolute top-4 right-4 pointer-events-none" />
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Vendor Payouts</span>
                        <div className="text-2xl font-black text-[#02182e] mt-2 tracking-tight">₹12,21,800</div>
                        <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> All settled</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <TrendingUp className="w-12 h-12 text-slate-50 absolute top-4 right-4 pointer-events-none" />
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Avg. Ticket Size</span>
                        <div className="text-2xl font-black text-[#02182e] mt-2 tracking-tight">₹2,450</div>
                        <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5"/> +5.2% vs last month</p>
                      </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Revenue Over Time Line Chart */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col h-[400px]">
                        <h2 className="text-sm font-extrabold text-[#02182e] mb-6">Revenue & Profit Trends (2026)</h2>
                        <div className="flex-1 min-h-0 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#02182e" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#02182e" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value/1000}k`} />
                              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                              />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                              <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#02182e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                              <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Revenue By Category Pie Chart */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[400px]">
                        <h2 className="text-sm font-extrabold text-[#02182e] mb-6">Revenue by Category (%)</h2>
                        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={CATEGORY_REVENUE_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              >
                                {CATEGORY_REVENUE_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`${value}%`, 'Share']}
                              />
                              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Recent Transactions Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-extrabold text-[#02182e]">Recent Transactions</h2>
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">View All Ledgers</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-100">
                              <th className="py-3 px-5">TRX ID</th>
                              <th className="py-3 px-4">DATE</th>
                              <th className="py-3 px-4">TYPE</th>
                              <th className="py-3 px-4">CUSTOMER / VENDOR</th>
                              <th className="py-3 px-4 text-right">AMOUNT</th>
                              <th className="py-3 px-5 text-right">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {RECENT_TRANSACTIONS.map((trx) => (
                              <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-4 px-5 font-bold text-slate-600">{trx.id}</td>
                                <td className="py-4 px-4 text-slate-500 font-medium">{trx.date}</td>
                                <td className="py-4 px-4 font-bold text-slate-700">{trx.type}</td>
                                <td className="py-4 px-4">
                                  <div className="flex flex-col gap-1">
                                    {trx.customer !== '-' && <span className="font-semibold text-slate-800">C: {trx.customer}</span>}
                                    {trx.vendor !== '-' && <span className="text-slate-500 font-medium">V: {trx.vendor}</span>}
                                  </div>
                                </td>
                                <td className={`py-4 px-4 text-right font-black ${trx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                  {trx.amount > 0 ? '+' : ''}₹{Math.abs(trx.amount).toLocaleString()}
                                </td>
                                <td className="py-4 px-5 text-right">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    trx.status === 'Completed' ? 'bg-emerald-100/80 text-emerald-800' : 'bg-amber-100/80 text-amber-800'
                                  }`}>
                                    {trx.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}


                {/* ── SERVICES & FUEL PRICING TAB ── */}
                {activeTab === 'service-pricing' && (
                  <AdminServicePricingTab showToast={showToast} />
                )}

                {/* 9. WORK HISTORY */}
                {activeTab === 'work-history' && (
                  <motion.div
                    key="work-history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-xl font-extrabold text-[#02182e]">Work History & Dispatches</h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Live Real-Time Sync
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-1">Track ongoing dispatches, incoming work requests, and completion records.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={async () => {
                              setIsRefreshingBookings(true);
                              try {
                                await fetchBookings();
                                showToast('Live bookings synchronized with database!');
                              } catch {
                                showToast('Failed to sync live bookings');
                              } finally {
                                setIsRefreshingBookings(false);
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                            disabled={isRefreshingBookings}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBookings ? 'animate-spin' : ''}`} />
                            {isRefreshingBookings ? 'Syncing...' : 'Sync Live Data'}
                          </button>
                        </div>
                      </div>

                      {bookingsFetchError && (
                        <div className="p-4 mx-5 my-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <p className="font-bold text-amber-900">Database Sync Status</p>
                              <p className="text-[11px] text-amber-700">{bookingsFetchError}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => fetchBookings()}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
                          >
                            Retry Sync
                          </button>
                        </div>
                      )}

                      {/* Current Work */}
                      <div ref={currentWorkTableRef} className="p-5 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <h3 className="text-sm font-extrabold text-[#02182e] flex items-center gap-2">
                             <Clock className="w-4 h-4 text-orange-500" /> Current Work & Active Dispatches ({currentWorkCounts.all})
                          </h3>

                          {/* Current Work Filter Tabs */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {[
                              { id: 'All', label: `All Active (${currentWorkCounts.all})` },
                              { id: 'In Progress', label: `In Progress (${currentWorkCounts.inProgress})` },
                              { id: 'Assigned', label: `Assigned (${currentWorkCounts.assigned})` },
                              { id: 'Pending', label: `Pending Dispatch (${currentWorkCounts.pending})` },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setCurrentWorkFilter(tab.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentWorkFilter === tab.id
                                    ? 'bg-[#02182e] text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="overflow-x-auto">
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
                              {isBookingsLoading ? (
                                <tr>
                                  <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                      <span>Loading active service dispatches...</span>
                                    </div>
                                  </td>
                                </tr>
                              ) : paginatedCurrentWork.length > 0 ? (
                                paginatedCurrentWork.map(item => (
                                  <tr key={item.rawId || item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 px-5 font-bold text-slate-600">{item.id}</td>
                                    <td className="py-4 px-4 font-bold text-slate-800">{item.appliance}</td>
                                    <td className="py-4 px-4 font-semibold text-slate-700">{item.customer}</td>
                                    <td className="py-4 px-4 font-semibold text-slate-700">{item.technician}</td>
                                    <td className="py-4 px-4">
                                      {renderBookingStatusBadge(item.status)}
                                    </td>
                                    <td className="py-4 px-5 text-right">
                                      <button 
                                        onClick={() => { setSelectedDispatchItem(item); setIsDispatchModalOpen(true); }}
                                        className="text-xs font-bold cursor-pointer text-[#02182e] hover:text-[#082848]"
                                      >
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                                    No active service requests matching &quot;{currentWorkFilter}&quot;.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Current Work Pagination */}
                        {filteredCurrentWork.length > currentWorkItemsPerPage && (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
                            <span>
                              Showing <span className="font-extrabold text-slate-900">{(currentWorkPage - 1) * currentWorkItemsPerPage + 1}</span> to <span className="font-extrabold text-slate-900">{Math.min(currentWorkPage * currentWorkItemsPerPage, filteredCurrentWork.length)}</span> of <span className="font-extrabold text-slate-900">{filteredCurrentWork.length}</span> active dispatches
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setCurrentWorkPage(p => Math.max(1, p - 1))}
                                disabled={currentWorkPage === 1}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Prev</span>
                              </button>
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                                {currentWorkPage} / {currentWorkTotalPages}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCurrentWorkPage(p => Math.min(currentWorkTotalPages, p + 1))}
                                disabled={currentWorkPage === currentWorkTotalPages}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Work Done / Full History */}
                      <div ref={historyTableRef} className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h3 className="text-sm font-extrabold text-[#02182e] flex items-center gap-2">
                               <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Work Done & History
                            </h3>

                            {/* Work History Filter Tabs */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[
                                { id: 'All Records', label: `All Records (${historyCounts.all})` },
                                { id: 'In Progress', label: `In Progress (${historyCounts.inProgress})` },
                                { id: 'Pending', label: `Pending (${historyCounts.pending})` },
                                { id: 'Accepted', label: `Accepted (${historyCounts.assigned})` },
                                { id: 'Completed', label: `Completed (${historyCounts.completed})` },
                                { id: 'Cancelled', label: `Cancelled (${historyCounts.cancelled})` },
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() => { setWorkHistoryFilter(tab.id); setHistoryPage(1); }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    workHistoryFilter === tab.id
                                      ? 'bg-[#02182e] text-white shadow-xs'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Work History Search Bar */}
                            <div className="relative w-full sm:w-64">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={historySearchTerm}
                                onChange={(e) => setHistorySearchTerm(e.target.value)}
                                placeholder="Search by ID, customer, appliance..."
                                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                              />
                            </div>

                            <button 
                              onClick={() => {
                                setExportType('history');
                                setIsExportModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Export Excel
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                            <thead>
                              <tr className="bg-slate-50/80 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-100">
                                <th className="py-3 px-5">REQ ID</th>
                                <th className="py-3 px-4">APPLIANCE</th>
                                <th className="py-3 px-4">CUSTOMER</th>
                                <th className="py-3 px-4">TECHNICIAN</th>
                                <th className="py-3 px-4">DATE</th>
                                <th className="py-3 px-4">STATUS</th>
                                <th className="py-3 px-5 text-right">ACTION</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {isBookingsLoading ? (
                                <tr>
                                  <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                      <span className="text-sm font-extrabold text-slate-700">Loading live work history from database...</span>
                                    </div>
                                  </td>
                                </tr>
                              ) : paginatedHistory.length > 0 ? (
                                paginatedHistory.map(item => (
                                  <tr key={item.rawId || item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 px-5 font-bold text-slate-600">{item.id}</td>
                                    <td className="py-4 px-4 font-bold text-slate-800">{item.appliance}</td>
                                    <td className="py-4 px-4 font-semibold text-slate-700">{item.customer}</td>
                                    <td className="py-4 px-4 font-semibold text-slate-700">{item.technician}</td>
                                    <td className="py-4 px-4 font-semibold text-slate-700">{item.dateCompleted !== '—' ? item.dateCompleted : (item.serviceDate || '—')}</td>
                                    <td className="py-4 px-4">
                                      {renderBookingStatusBadge(item.status)}
                                    </td>
                                    <td className="py-4 px-5 text-right">
                                      <button 
                                        onClick={() => { setSelectedReportItem(item); setIsReportModalOpen(true); }}
                                        className="text-xs font-bold cursor-pointer text-slate-500 hover:text-slate-800"
                                      >
                                        View Report
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="7" className="py-12 text-center text-slate-400">
                                    <div className="max-w-md mx-auto space-y-2 flex flex-col items-center justify-center">
                                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                                        <CheckCircle2 className="w-6 h-6 text-slate-400" />
                                      </div>
                                      <p className="font-extrabold text-sm text-slate-700">
                                        {historySearchTerm.trim() 
                                          ? `No records found matching "${historySearchTerm}"`
                                          : `No records found under filter "${workHistoryFilter}"`
                                        }
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {historySearchTerm.trim() ? (
                                          <button
                                            onClick={() => setHistorySearchTerm('')}
                                            className="text-orange-600 font-bold underline hover:text-orange-700 cursor-pointer"
                                          >
                                            Clear search filter
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => { setWorkHistoryFilter('All Records'); setHistoryPage(1); }}
                                            className="text-blue-600 font-bold underline hover:text-blue-800 cursor-pointer"
                                          >
                                            Show all {historyCounts.all} live database records
                                          </button>
                                        )}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Professional Work History Pagination Controls */}
                        {totalHistoryEntries > 0 && (
                          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 rounded-xl">
                            {/* Showing Entries Counter & Rows Per Page */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                              <div>
                                Showing{' '}
                                <span className="font-extrabold text-slate-900">
                                  {(historyPage - 1) * historyItemsPerPage + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-extrabold text-slate-900">
                                  {Math.min(historyPage * historyItemsPerPage, totalHistoryEntries)}
                                </span>{' '}
                                of{' '}
                                <span className="font-extrabold text-slate-900">
                                  {totalHistoryEntries}
                                </span>{' '}
                                records
                              </div>

                              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                                <span className="text-[11px] text-slate-400 font-semibold">Rows per page:</span>
                                <select
                                  value={historyItemsPerPage}
                                  onChange={(e) => setHistoryItemsPerPage(Number(e.target.value))}
                                  className="bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                                >
                                  <option value={5}>5</option>
                                  <option value={10}>10</option>
                                  <option value={20}>20</option>
                                  <option value={50}>50</option>
                                </select>
                              </div>
                            </div>

                            {/* Navigation Buttons (Previous, Page Numbers, Next) */}
                            <div className="flex items-center gap-1.5">
                              {/* Previous Button */}
                              <button
                                type="button"
                                onClick={handleHistoryPrevious}
                                disabled={historyPage === 1}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                aria-label="Previous Page"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Previous</span>
                              </button>

                              {/* Page Numbers */}
                              <div className="flex items-center gap-1">
                                {getHistoryPageNumbers().map((page, idx) => {
                                  if (page === '...') {
                                    return (
                                      <span
                                        key={`hist-ellipsis-${idx}`}
                                        className="px-2 py-1 text-slate-400 text-xs font-bold select-none"
                                      >
                                        ...
                                      </span>
                                    );
                                  }
                                  const isCurrent = historyPage === page;
                                  return (
                                    <button
                                      key={`hist-page-${page}`}
                                      type="button"
                                      onClick={() => handleHistoryPageChange(page)}
                                      className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                        isCurrent
                                          ? 'bg-[#02182e] text-white shadow-xs'
                                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Next Button */}
                              <button
                                type="button"
                                onClick={handleHistoryNext}
                                disabled={historyPage === historyTotalPages}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                aria-label="Next Page"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
      <AdminRestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        selectedItem={selectedItem}
        restockQty={restockQty}
        setRestockQty={setRestockQty}
        purchasePrice={purchasePrice}
        setPurchasePrice={setPurchasePrice}
        restockDate={restockDate}
        setRestockDate={setRestockDate}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        restockNotes={restockNotes}
        setRestockNotes={setRestockNotes}
        onConfirm={handleConfirmRestock}
      />

      {/* 1B. Add New Inventory Item Modal */}
      <AdminAddInventoryModal
        isOpen={isAddInventoryModalOpen}
        onClose={() => setIsAddInventoryModalOpen(false)}
        onAdd={handleAddNewInventoryItem}
      />

      {/* 2. Vendor Credentials Created Success Modal */}
      <AdminCredsSuccessModal
        isOpen={isCredentialSuccessOpen}
        onClose={() => setIsCredentialSuccessOpen(false)}
        generatedCreds={generatedCreds}
        showToast={showToast}
        onShare={() => {
          showToast('Share email link generated!');
          setIsCredentialSuccessOpen(false);
        }}
        onGoToVendorList={() => {
          setIsCredentialSuccessOpen(false);
          setActiveTab('applications');
        }}
      />

      {/* 4. View Vendor ID & Pass Modal (re-viewable after generation) */}
      <AdminViewCredsModal
        isOpen={isViewCredsModalOpen}
        onClose={() => setIsViewCredsModalOpen(false)}
        viewingCreds={viewingCreds}
        showToast={showToast}
      />

      {/* 3. Vendor Application Form Details Modal (High Z-index z-[9999]) */}
      <AdminApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        selectedApplication={selectedApplication}
        vendorCredentials={vendorCredentials}
        showToast={showToast}
        onViewVendorCreds={handleViewVendorCreds}
        onReject={handleRejectApp}
        onApprove={handleApproveNavigate}
        StockLevelBadge={StockLevelBadge}
      />

      {/* User & Partner Edit Profile Modal (Block, Unblock, Suspend) */}
      <AdminEditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        user={editingUser}
        onSave={handleSaveEditedUser}
      />

      {/* 5. Dispatch Queue View Modal */}
      <AdminDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        dispatchItem={selectedDispatchItem}
      />

      {/* 6. Work Report Modal */}
      <AdminWorkReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportItem={selectedReportItem}
      />

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

      <AdminExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={exportType === 'inventory' ? 'Export Inventory Report' : exportType === 'payment' ? 'Export Payment Records' : 'Export Work History'}
        onExport={(fromDate, toDate) => {
          if (exportType === 'inventory') {
            handleExportInventoryExcel(fromDate, toDate);
          } else if (exportType === 'history') {
            handleExportExcel(fromDate, toDate);
          } else if (exportType === 'payment') {
            showToast('Payment records exported successfully!');
          }
          setIsExportModalOpen(false);
        }}
      />

      {/* Footer Included at Bottom */}
      <Footer />
    </div>
  );
}
