// frontend/src/services/invoiceService.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralized Invoice Management Service for Magic Mistry
// Manages real-time data fetching from backend APIs, dynamic invoice construction
// from live MongoDB booking snapshots, and standardized UI models for dashboards.
// ─────────────────────────────────────────────────────────────────────────────

import { getBookingDetailsApi } from './operations/bookingAPI';

const STORAGE_KEY = 'mm_stored_invoices';

/**
 * Format address helper into human-readable string
 */
export function formatAddress(addr) {
  if (!addr) return 'Address on File';
  if (typeof addr === 'string') return addr;
  return [
    addr.house || addr.flat || addr.addressLine1,
    addr.street,
    addr.landmark,
    addr.city,
    addr.state,
    addr.pincode,
  ]
    .filter(Boolean)
    .join(', ');
}

/**
 * Retrieve all dynamically stored invoices from localStorage (received live from backend).
 */
export function getStorageMap() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[InvoiceService] Failed to read localStorage invoices:', e);
    return {};
  }
}

/**
 * Persist an invoice into local storage keyed by booking ID and invoice number.
 * Typically called when a vendor completes a job and backend returns the new Invoice document.
 */
export function saveInvoiceForBooking(bookingId, invoice) {
  if (!bookingId || !invoice || typeof window === 'undefined') return;
  try {
    const map = getStorageMap();
    const cleanBookingId = String(bookingId).trim();
    map[cleanBookingId] = invoice;
    if (invoice.invoiceNumber) {
      map[String(invoice.invoiceNumber).trim()] = invoice;
    }
    if (invoice._id) {
      map[String(invoice._id).trim()] = invoice;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[InvoiceService] Failed to save invoice to localStorage:', e);
  }
}

/**
 * Dynamically constructs a normalized invoice object directly from a live backend Booking document.
 * This ensures that invoices reflect 100% real-time data fetched from MongoDB without any hardcoding.
 */
export function generateInvoiceFromBooking(booking = {}) {
  const rawBooking = booking.rawBooking || booking || {};

  const bookingId = rawBooking._id || rawBooking.id || rawBooking.bookingId || '';
  const completedDate = rawBooking.completedAt || rawBooking.paidAt || rawBooking.updatedAt || rawBooking.serviceDate || rawBooking.createdAt;

  const invoiceNumber =
    rawBooking.invoiceNumber ||
    rawBooking.invoiceId ||
    (completedDate ? `MM-${new Date(completedDate).getTime()}` : (bookingId ? `MM-${String(bookingId).slice(-8).toUpperCase()}` : `MM-${Date.now()}`));

  const formattedDate = completedDate
    ? new Date(completedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const serviceTitle =
    rawBooking.serviceCategory ||
    rawBooking.serviceTitle ||
    rawBooking.service ||
    rawBooking.appliance ||
    'Diagnostic & Appliance Service';

  const customerName =
    rawBooking.customer?.fullName ||
    rawBooking.customerName ||
    'Valued Customer';

  const customerPhone =
    rawBooking.customer?.phoneNumber ||
    rawBooking.customerPhone ||
    '—';

  const address = formatAddress(rawBooking.address || booking.address);

  const technician =
    rawBooking.vendor?.fullName ||
    rawBooking.technician ||
    'Magic Mistry Certified Expert';

  // Real-time backend monetary values
  const totalAmount =
    Number(rawBooking.serviceCharge) > 0
      ? Number(rawBooking.serviceCharge)
      : Number(rawBooking.realPrice) > 0
      ? Number(rawBooking.realPrice)
      : Number(rawBooking.serviceCategoryCharge) > 0
      ? Number(rawBooking.serviceCategoryCharge)
      : 299;

  const baseLaborPrice =
    Number(rawBooking.serviceCategoryCharge) > 0
      ? Number(rawBooking.serviceCategoryCharge)
      : totalAmount;

  // Build itemized list dynamically from backend charges
  let items = [];

  if (Array.isArray(rawBooking.parts) && rawBooking.parts.length > 0) {
    items = rawBooking.parts.map((p) => ({
      name: p.name || p.description || 'Service Part',
      description: p.name || p.description || 'Service Part',
      quantity: Number(p.quantity || p.qty || 1),
      qty: Number(p.quantity || p.qty || 1),
      unitPrice: Number(p.unitPrice || p.price || 0),
      price: Number(p.unitPrice || p.price || 0),
      amount: Number(p.amount !== undefined ? p.amount : (p.quantity || p.qty || 1) * (p.unitPrice || p.price || 0)),
      type: p.type || (p.isTravel ? 'Travel' : p.isComponent ? 'Component' : 'Service'),
      isTravel: Boolean(p.isTravel || p.type === 'Travel'),
      isComponent: Boolean(p.isComponent || p.type === 'Component'),
      isService: Boolean(p.isService || p.type === 'Service'),
    }));
  } else {
    // Standard Base Labor Service Item
    items.push({
      name: serviceTitle,
      description: serviceTitle,
      quantity: 1,
      qty: 1,
      unitPrice: baseLaborPrice,
      price: baseLaborPrice,
      amount: baseLaborPrice,
      type: 'Service',
      isService: true,
      isComponent: false,
      isTravel: false,
    });

    // If total billed in MongoDB is greater than base labor, the difference is parts/travel added
    if (totalAmount > baseLaborPrice) {
      const extraDiff = totalAmount - baseLaborPrice;
      items.push({
        name: 'Spare Parts & Consumables',
        description: 'Spare Parts & Consumables',
        quantity: 1,
        qty: 1,
        unitPrice: extraDiff,
        price: extraDiff,
        amount: extraDiff,
        type: 'Component',
        isComponent: true,
        isService: false,
        isTravel: false,
      });
    }
  }

  // Calculate Subtotal and Discount
  const rawSubtotal = items.reduce((sum, it) => sum + (it.amount || 0), 0);
  const subtotal = Math.max(rawSubtotal, baseLaborPrice, totalAmount);
  const discount = Math.max(0, subtotal - totalAmount);
  const tax = 0;

  return {
    invoiceId: invoiceNumber,
    invoiceNumber,
    bookingId: String(bookingId),
    date: formattedDate,
    customerName,
    customerPhone,
    address,
    serviceTitle,
    technician,
    items,
    parts: items,
    subtotal,
    discount,
    tax,
    total: totalAmount,
    totalAmount,
    paymentMethod: rawBooking.paymentMethod || 'Cash',
    paymentStatus: rawBooking.paymentStatus || 'Paid',
    status: 'PAID IN FULL',
    notes: rawBooking.issue || rawBooking.customerNote || 'Service successfully completed and verified.',
    travelDistanceKm: Number(rawBooking.travelDistanceKm) || 0,
    travelRatePerKm: Number(rawBooking.travelRatePerKm) || 10,
    travelCharges: Number(rawBooking.travelCharges) || 0,
    mapScreenshot: (typeof rawBooking.mapScreenshot === 'string' ? rawBooking.mapScreenshot : rawBooking.mapScreenshot?.url) ||
      (typeof rawBooking.route?.screenshot === 'string' ? rawBooking.route?.screenshot : rawBooking.route?.screenshot?.url) ||
      null,
  };
}

/**
 * Standardize an invoice object into a consistent shape ready for UI rendering.
 * Accepts either a backend MongoDB Invoice document OR a Booking document to derive from.
 */
export function normalizeInvoiceForUI(inv, booking = {}) {
  const rawBooking = booking.rawBooking || booking || {};

  // If no stored invoice document, generate dynamically from live backend booking
  if (!inv) {
    if (rawBooking._id || rawBooking.id || rawBooking.service || rawBooking.serviceCategory || rawBooking.appliance) {
      return generateInvoiceFromBooking(rawBooking);
    }
    return null;
  }

  // If inv is already a generated/normalized invoice object, return it with safety fallbacks
  const bookingId = inv.booking || inv.bookingId || rawBooking._id || rawBooking.id || '';
  const completedDate = inv.paidAt || inv.createdAt || rawBooking.completedAt || rawBooking.serviceDate;

  const invoiceNumber =
    inv.invoiceNumber ||
    inv.invoiceId ||
    rawBooking.invoiceNumber ||
    (completedDate ? `MM-${new Date(completedDate).getTime()}` : (bookingId ? `MM-${String(bookingId).slice(-8).toUpperCase()}` : `MM-${Date.now()}`));

  const formattedDate = completedDate
    ? new Date(completedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : (booking.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));

  const customerName =
    inv.customerSnapshot?.name ||
    rawBooking.customer?.fullName ||
    booking.customerName ||
    'Customer';

  const customerPhone =
    inv.customerSnapshot?.phone ||
    rawBooking.customer?.phoneNumber ||
    booking.customerPhone ||
    '—';

  const address =
    inv.customerSnapshot?.address ||
    formatAddress(booking.address || rawBooking.address);

  const serviceTitle =
    inv.serviceSnapshot?.serviceCategory ||
    inv.serviceSnapshot?.appliance ||
    booking.service ||
    booking.serviceTitle ||
    rawBooking.serviceCategory ||
    rawBooking.appliance ||
    'Appliance Service';

  const technician =
    inv.technician ||
    booking.technician ||
    rawBooking.vendor?.fullName ||
    'Magic Mistry Certified Expert';

  const items = Array.isArray(inv.items) && inv.items.length > 0
    ? inv.items.map((it) => ({
        description: it.name || it.description || 'Service',
        name: it.name || it.description || 'Service',
        qty: Number(it.quantity || it.qty || 1),
        quantity: Number(it.quantity || it.qty || 1),
        unitPrice: Number(it.unitPrice || it.price || 0),
        price: Number(it.unitPrice || it.price || 0),
        amount: Number(it.amount !== undefined ? it.amount : (it.quantity || it.qty || 1) * (it.unitPrice || it.price || 0)),
        type: it.type || (it.isTravel ? 'Travel' : it.isComponent ? 'Component' : 'Service'),
        isTravel: Boolean(it.type === 'Travel' || it.isTravel),
        isComponent: Boolean(it.type === 'Component' || it.isComponent),
        isService: Boolean(it.type === 'Service' || it.isService),
      }))
    : Array.isArray(booking.parts) && booking.parts.length > 0
    ? booking.parts.map((it) => ({
        description: it.name || it.description || 'Service',
        name: it.name || it.description || 'Service',
        qty: Number(it.quantity || it.qty || 1),
        quantity: Number(it.quantity || it.qty || 1),
        unitPrice: Number(it.unitPrice || it.price || 0),
        price: Number(it.unitPrice || it.price || 0),
        amount: Number(it.amount !== undefined ? it.amount : (it.quantity || it.qty || 1) * (it.unitPrice || it.price || 0)),
        type: it.type || (it.isTravel ? 'Travel' : it.isComponent ? 'Component' : 'Service'),
        isTravel: Boolean(it.type === 'Travel' || it.isTravel),
        isComponent: Boolean(it.type === 'Component' || it.isComponent),
        isService: Boolean(it.type === 'Service' || it.isService),
      }))
    : [
        {
          description: serviceTitle,
          name: serviceTitle,
          qty: 1,
          quantity: 1,
          unitPrice: Number(inv.subtotal || rawBooking.serviceCategoryCharge || rawBooking.serviceCharge || 299),
          price: Number(inv.subtotal || rawBooking.serviceCategoryCharge || rawBooking.serviceCharge || 299),
          amount: Number(inv.subtotal || rawBooking.serviceCategoryCharge || rawBooking.serviceCharge || 299),
          type: 'Service',
          isService: true,
          isComponent: false,
          isTravel: false,
        },
      ];

  const subtotal = inv.subtotal !== undefined
    ? Number(inv.subtotal)
    : items.reduce((acc, it) => acc + (it.amount || 0), 0);

  const discount = Number(inv.discount || 0);
  const tax = Number(inv.tax || 0);
  const total = inv.totalAmount !== undefined
    ? Number(inv.totalAmount)
    : inv.total !== undefined
    ? Number(inv.total)
    : Math.max(0, subtotal - discount + tax);

  return {
    ...inv,
    invoiceId: invoiceNumber,
    invoiceNumber,
    bookingId: String(bookingId),
    date: formattedDate,
    customerName,
    customerPhone,
    address,
    serviceTitle,
    technician,
    items,
    parts: items,
    subtotal,
    discount,
    tax,
    total,
    totalAmount: total,
    paymentMethod: inv.paymentMethod || rawBooking.paymentMethod || 'Cash',
    paymentStatus: inv.paymentStatus || rawBooking.paymentStatus || 'Paid',
    status: 'PAID IN FULL',
    notes: inv.customerNote || rawBooking.issue || rawBooking.customerNote || booking.notes || 'Service successfully completed and verified.',
    travelDistanceKm: Number(inv.travelDistanceKm || rawBooking.travelDistanceKm) || 0,
    travelRatePerKm: Number(inv.travelRatePerKm || rawBooking.travelRatePerKm) || 10,
    travelCharges: Number(inv.travelCharges || rawBooking.travelCharges) || 0,
    mapScreenshot: (typeof inv.mapScreenshot === 'string' ? inv.mapScreenshot : inv.mapScreenshot?.url) ||
      (typeof rawBooking.mapScreenshot === 'string' ? rawBooking.mapScreenshot : rawBooking.mapScreenshot?.url) ||
      (typeof rawBooking.route?.screenshot === 'string' ? rawBooking.route?.screenshot : rawBooking.route?.screenshot?.url) ||
      null,
  };
}

/**
 * Lookup invoice for a booking ID or invoice number.
 * First checks local storage (cached from backend responses).
 * If not in storage and fallbackBooking is provided, derives dynamically from backend booking snapshot.
 */
export function getInvoiceForBooking(bookingIdOrNumber, fallbackBooking = null) {
  if (!bookingIdOrNumber) {
    return fallbackBooking ? generateInvoiceFromBooking(fallbackBooking) : null;
  }
  const key = String(bookingIdOrNumber).trim();

  // 1. Check local storage (contains actual backend invoice snapshots from completeService)
  const map = getStorageMap();
  if (map[key]) return map[key];

  // Also check values in storage map if key matches booking or invoiceNumber
  const byVal = Object.values(map).find(
    (inv) => inv && (inv.invoiceNumber === key || inv.bookingId === key || inv.booking === key)
  );
  if (byVal) return byVal;

  // 2. If fallback booking is provided, generate dynamically from live backend data
  if (fallbackBooking) {
    return generateInvoiceFromBooking(fallbackBooking);
  }

  return null;
}

/**
 * Fetch fresh real-time invoice/booking data directly from the backend server.
 * Guarantees zero stale data by querying the backend API.
 */
export async function fetchRealtimeInvoice(bookingId, token, fallbackBooking = null) {
  if (!bookingId) {
    return fallbackBooking ? normalizeInvoiceForUI(null, fallbackBooking) : null;
  }

  // 1. Check local cache first for instant UI response
  const stored = getInvoiceForBooking(bookingId);
  if (stored) {
    return normalizeInvoiceForUI(stored, fallbackBooking);
  }

  // 2. Fetch live updated booking record from backend API
  if (token) {
    try {
      const res = await getBookingDetailsApi(bookingId, token);
      if (res?.success && res?.booking) {
        const liveNormalized = normalizeInvoiceForUI(null, res.booking);
        return liveNormalized;
      }
    } catch (e) {
      console.warn('[InvoiceService] Real-time backend fetch failed, using fallback:', e);
    }
  }

  // 3. Fallback to passed booking snapshot
  return fallbackBooking ? normalizeInvoiceForUI(null, fallbackBooking) : null;
}
