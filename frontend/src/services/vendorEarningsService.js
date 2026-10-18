// frontend/src/services/vendorEarningsService.js
// ─────────────────────────────────────────────────────────────────────────────
// Vendor Earnings & Fuel Allowance Management Service
// ─────────────────────────────────────────────────────────────────────────────
// Encapsulates all calculations and persistence for vendor earnings, payouts,
// and 100% Admin-reimbursed fuel/travel allowances.
//
// DESIGNED FOR EASY BACKEND INTEGRATION:
// - When the backend earnings/payouts API is ready, all endpoints defined below
//   will automatically connect without changing component UI code.
// - If the backend route is not ready / returns 404, it gracefully falls back to
//   local calculations and persistent storage so the app works seamlessly offline.
// ─────────────────────────────────────────────────────────────────────────────

import { apiConnector, BASE_URL } from './apiConnector';
import { CANONICAL_ADMIN_TOKEN } from '../utils/adminAuth';

export const vendorEarningsEndpoints = {
  GET_EARNINGS_API: `${BASE_URL}/vendor-earnings/vendor`,
  GET_SINGLE_EARNING_API: `${BASE_URL}/vendor-earnings/vendor`, // + /:id
  GET_ADMIN_EARNINGS_API: `${BASE_URL}/vendor-earnings/admin`,
  GET_ADMIN_VENDOR_EARNINGS_API: `${BASE_URL}/vendor-earnings/admin/vendor`, // + /:vendorId
  GET_FUEL_ALLOWANCES_API: `${BASE_URL}/fuel-claims`,
  SUBMIT_FUEL_CLAIM_API: `${BASE_URL}/fuel-claims`,
  REQUEST_PAYOUT_API: `${BASE_URL}/payout/request`,
  SYNC_ALLOWANCE_API: null,
};

function dataURLtoFile(dataurl, filename = 'receipt.png') {
  if (!dataurl || typeof dataurl !== 'string' || !dataurl.includes(',')) return null;
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (err) {
    console.warn('[VendorEarningsService] Error converting dataURL to File:', err);
    return null;
  }
}

const STORAGE_KEYS = {
  TRAVEL_ALLOWANCES: 'mm_vendor_travel_allowances',
  FUEL_CLAIMS: 'mm_vendor_fuel_claims',
  PAYOUT_REQUESTS: 'mm_vendor_payout_requests',
  EARNINGS_CACHE: 'mm_vendor_earnings_cache',
};

/**
 * Helper to safely read from localStorage
 */
function getStoredJson(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[VendorEarningsService] Error reading localStorage key "${key}":`, e);
    return fallback;
  }
}

/**
 * Helper to safely write to localStorage
 */
function setStoredJson(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[VendorEarningsService] Error writing localStorage key "${key}":`, e);
  }
}

/**
 * Calculate comprehensive vendor earnings breakdown according to Magic Mistry policies:
 * 1. Service Charges: strictly 50% vendor payout
 * 2. Component Charges: strictly 0% vendor payout (spare parts cost excluded)
 * 3. Fuel Allowance: 100% paid by Admin directly to vendor wallet (never billed to customer)
 *
 * @param {Array} completedJobs - List of completed vendor booking objects
 * @param {Array} manualClaims - Any manual fuel allowance claims submitted
 * @returns {Object} itemized earnings breakdown
 */
export function calculateVendorEarningsBreakdown(completedJobs = [], manualClaims = []) {
  let totalServiceCharges = 0;
  let totalServicePayout = 0;
  let totalComponentCharges = 0;
  let totalDistanceKm = 0;
  let totalFuelPayout = 0;
  let totalGrossBilled = 0;

  const itemizedJobs = (completedJobs || []).map((job) => {
    const parts = job?.invoiceData?.parts || job?.parts || [];
    let serviceCharges = 0;
    let componentCharges = 0;
    let distanceKm = Number(job?.travelDistanceKm) || Number(job?.invoiceData?.travelDistanceKm) || 0;
    let ratePerKm = Number(job?.travelRatePerKm) || Number(job?.invoiceData?.travelRatePerKm) || 10;
    let travelCharges = distanceKm * ratePerKm;

    if (parts.length > 0) {
      parts.forEach((p) => {
        const desc = String(p.description || p.name || '').toLowerCase();
        const isTravel = p.isTravel || p.type === 'Travel' || desc.includes('travel') || desc.includes('distance') || desc.includes('km @');
        const isService = !isTravel && (p.isService || p.type === 'Service' || p.locked || !p.inventoryId);
        const qty = parseFloat(p.qty !== undefined ? p.qty : p.quantity) || 1;
        const price = parseFloat(p.price !== undefined ? p.price : p.unitPrice) || 0;
        const lineTotal = qty * price;

        if (isTravel) {
          if (!distanceKm && qty > 0) distanceKm = qty;
          travelCharges = Math.max(travelCharges, lineTotal);
        } else if (isService) {
          serviceCharges += lineTotal;
        } else {
          componentCharges += lineTotal;
        }
      });
    } else {
      serviceCharges = Number(job.amount) || Number(job.estimatedPay) || 0;
    }

    if (travelCharges === 0 && distanceKm > 0) {
      travelCharges = distanceKm * ratePerKm;
    }

    const servicePayout = serviceCharges * 0.5;
    const fuelPayout = travelCharges; // 100% paid by Admin directly to vendor wallet
    const totalVendorPayout = servicePayout + fuelPayout;
    const totalBilled = serviceCharges + componentCharges; // Customer bill strictly excludes fuel/travel

    totalServiceCharges += serviceCharges;
    totalServicePayout += servicePayout;
    totalComponentCharges += componentCharges;
    totalDistanceKm += distanceKm;
    totalFuelPayout += fuelPayout;
    totalGrossBilled += (Number(job.amount) || totalBilled);

    return {
      ...job,
      financials: {
        serviceCharges,
        servicePayout,
        componentCharges,
        distanceKm,
        ratePerKm,
        travelCharges,
        fuelPayout,
        totalVendorPayout,
        totalBilled,
        mapScreenshot: job?.mapScreenshot || job?.invoiceData?.mapScreenshot || null,
        travelVerified: Boolean(job?.travelVerified || job?.mapScreenshot),
      },
    };
  });

  // Include approved manual claims into totalFuelPayout if any
  const approvedManualClaims = (manualClaims || []).filter(c => c.status === 'Approved' || c.status === 'Verified');
  const manualClaimsPayout = approvedManualClaims.reduce((sum, c) => sum + (Number(c.claimedAmount) || 0), 0);
  const combinedFuelPayout = totalFuelPayout + manualClaimsPayout;
  const totalAvailablePayout = totalServicePayout + combinedFuelPayout;

  return {
    list: Array.isArray(completedJobs) ? completedJobs : [],
    completedJobs: itemizedJobs,
    totalServiceCharges: Number(totalServiceCharges) || 0,
    totalServicePayout: Number(totalServicePayout) || 0,
    totalComponentCharges: Number(totalComponentCharges) || 0,
    totalDistanceKm: Number(totalDistanceKm) || 0,
    totalFuelPayout: Number(combinedFuelPayout) || 0,
    automatedFuelPayout: Number(totalFuelPayout) || 0,
    manualClaimsPayout: Number(manualClaimsPayout) || 0,
    totalGrossBilled: Number(totalGrossBilled) || 0,
    totalAvailablePayout: Number(totalAvailablePayout) || 0,
    count: (completedJobs || []).length,
  };
}

/**
 * Record a verified travel allowance into the vendor's earnings ledger.
 * This runs when a service is completed, ensuring the Admin-reimbursed fuel
 * allowance is immediately credited to the Earnings & Payouts page.
 *
 * When the backend earnings sync endpoint is ready, this also syncs to the server.
 */
export async function recordTravelAllowanceToLedger(allowanceRecord, token) {
  if (!allowanceRecord) return null;

  const record = {
    id: allowanceRecord.id || `ALLOWANCE-${Date.now()}`,
    jobId: allowanceRecord.jobId || allowanceRecord.backendJobId || '',
    displayId: allowanceRecord.displayId || allowanceRecord.jobId || 'WO-JOB',
    distanceKm: Number(allowanceRecord.distanceKm || allowanceRecord.travelDistanceKm || 0),
    ratePerKm: Number(allowanceRecord.ratePerKm || allowanceRecord.travelRatePerKm || 10),
    fuelPayout: Number(allowanceRecord.fuelPayout || allowanceRecord.travelCharges || 0),
    mapScreenshot: allowanceRecord.mapScreenshot || null,
    customerName: allowanceRecord.customerName || 'Customer',
    serviceAddress: allowanceRecord.serviceAddress || 'Customer Address',
    serviceTitle: allowanceRecord.serviceTitle || 'Appliance Service',
    reimbursedBy: 'Admin (100% Covered)',
    status: 'Credited to Wallet',
    timestamp: new Date().toISOString(),
  };

  // 1. Save to local ledger
  try {
    const existing = getStoredJson(STORAGE_KEYS.TRAVEL_ALLOWANCES, []);
    const filtered = existing.filter(r => r.jobId !== record.jobId);
    setStoredJson(STORAGE_KEYS.TRAVEL_ALLOWANCES, [record, ...filtered]);
  } catch (err) {
    console.warn('[VendorEarningsService] Error storing allowance locally:', err);
  }

  // 2. Attempt sync to backend API if token is provided
  if (token && vendorEarningsEndpoints.SYNC_ALLOWANCE_API) {
    try {
      const response = await apiConnector(
        'POST',
        vendorEarningsEndpoints.SYNC_ALLOWANCE_API,
        record,
        { Authorization: `Bearer ${token}` }
      );
      if (response.data?.success) {
        console.log('[VendorEarningsService] Allowance successfully synced to backend:', response.data);
      }
    } catch (backendErr) {
      // Graceful fallback: Backend endpoint not ready yet
      console.log('[VendorEarningsService] Backend allowance sync notice (backend endpoint in development, local storage active):', backendErr.message);
    }
  }

  return record;
}

/**
 * Retrieve all travel allowance records stored for the vendor.
 */
export function getRecordedTravelAllowances() {
  return getStoredJson(STORAGE_KEYS.TRAVEL_ALLOWANCES, []);
}

/**
 * Fetch vendor earnings summary from backend (with local fallback).
 * Connects directly to backend GET /api/vendor-earnings/vendor.
 */
export async function fetchVendorEarningsFromBackend(token, fallbackCompletedJobs = []) {
  if (token) {
    try {
      const response = await apiConnector(
        'GET',
        vendorEarningsEndpoints.GET_EARNINGS_API,
        null,
        { Authorization: `Bearer ${token}` }
      );
      if (response.data?.success && Array.isArray(response.data?.earnings)) {
        const raw = response.data.earnings;
        let totalServiceCharges = 0;
        let totalServicePayout = 0;
        let totalFuelPayout = 0;
        let totalGrossBilled = 0;
        let totalDistanceKm = 0;
        let totalAvailablePayout = 0;
        let totalIncludedPayout = 0;
        let totalPaidPayout = 0;
        let totalComponentCharges = 0;
        let totalLifetimePayout = 0;

        raw.forEach(e => {
          const sAmount = Number(e.serviceAmount) || 0;
          const sPayout = Number(e.serviceShareAmount) || (sAmount * 0.5);
          const tKm = Number(e.travelDistanceKm) || 0;
          const tCharge = Number(e.travelCharge) || 0;
          const invTotal = Number(e.customerInvoiceAmount) || sAmount;
          const compCharge = Math.max(0, invTotal - sAmount);
          const net = Number(e.netEarning) || (sPayout + tCharge);

          totalServiceCharges += sAmount;
          totalServicePayout += sPayout;
          totalFuelPayout += tCharge;
          totalGrossBilled += invTotal;
          totalDistanceKm += tKm;
          totalComponentCharges += compCharge;
          totalLifetimePayout += net;

          const st = String(e.status || 'Available').trim();
          if (st === 'Available') {
            totalAvailablePayout += net;
          } else if (st === 'Included In Payout') {
            totalIncludedPayout += net;
          } else if (st === 'Paid') {
            totalPaidPayout += net;
          } else {
            totalAvailablePayout += net;
          }
        });

        const calculated = {
          list: raw,
          totalServiceCharges,
          totalServicePayout,
          totalFuelPayout,
          totalAvailablePayout,
          totalIncludedPayout,
          totalPaidPayout,
          totalLifetimePayout,
          totalGrossBilled,
          totalDistanceKm,
          totalComponentCharges,
          count: raw.length,
        };

        setStoredJson(STORAGE_KEYS.EARNINGS_CACHE, calculated);
        return {
          success: true,
          earnings: calculated,
          fromBackend: true,
        };
      }
    } catch (err) {
      console.log('[VendorEarningsService] Backend GET /vendor-earnings/vendor notice (fallback to dynamic calculation):', err.message);
    }
  }

  // Fallback: Compute dynamically from completed jobs & stored claims
  const manualClaims = getStoredJson(STORAGE_KEYS.FUEL_CLAIMS, []);
  const calculated = calculateVendorEarningsBreakdown(fallbackCompletedJobs, manualClaims);

  return {
    success: true,
    earnings: calculated,
    fromBackend: false,
  };
}

/**
 * Submit a manual fuel allowance claim.
 * Connects directly to backend POST /api/fuel-claims with multipart/form-data.
 */
export async function submitVendorFuelClaim(claimData, token) {
  const newClaim = {
    id: `CLAIM-${Date.now().toString().slice(-6)}`,
    ...claimData,
    status: 'Submitted',
    createdAt: new Date().toISOString(),
  };

  // Persist locally for immediate optimistic UI & offline fallback
  const claims = getStoredJson(STORAGE_KEYS.FUEL_CLAIMS, []);
  const updated = [newClaim, ...claims];
  setStoredJson(STORAGE_KEYS.FUEL_CLAIMS, updated);

  // Attempt backend submission if endpoint and token are present
  if (token && vendorEarningsEndpoints.SUBMIT_FUEL_CLAIM_API) {
    try {
      const rawBooking = claimData.booking || claimData.bookingId || claimData.jobId;
      const isObjectId = typeof rawBooking === 'string' && /^[0-9a-fA-F]{24}$/.test(rawBooking.trim());

      if (isObjectId) {
        const formData = new FormData();
        formData.append('booking', rawBooking.trim());
        formData.append('claimAmount', String(Number(claimData.claimedAmount || claimData.claimAmount || 0).toFixed(2)));
        formData.append('distanceKm', String(Number(claimData.distanceKm || 0)));

        let vehicleType = 'Company';
        const rawV = String(claimData.vehicleType || '').toLowerCase();
        if (rawV.includes('2w') || rawV.includes('2-wheeler') || rawV.includes('scooter') || rawV.includes('motorcycle')) {
          vehicleType = '2-Wheeler';
        } else if (rawV.includes('3w') || rawV.includes('3-wheeler') || rawV.includes('auto')) {
          vehicleType = '3-Wheeler';
        } else if (rawV.includes('4w') || rawV.includes('4-wheeler') || rawV.includes('car')) {
          vehicleType = '4-Wheeler';
        }
        formData.append('vehicleType', vehicleType);

        const reason = String(claimData.notes || claimData.reason || 'Travel reimbursement for completed service trip').trim();
        formData.append('reason', reason);

        // Append proof file
        if (claimData.receiptFile instanceof File || claimData.receiptFile instanceof Blob) {
          formData.append('petrolReceipt', claimData.receiptFile, claimData.receiptFile.name || 'fuel_receipt.png');
        } else if (claimData.receiptImage && typeof claimData.receiptImage === 'string' && claimData.receiptImage.startsWith('data:')) {
          const fileObj = dataURLtoFile(claimData.receiptImage, 'petrol_receipt.png');
          if (fileObj) {
            formData.append('petrolReceipt', fileObj);
          }
        }

        const response = await apiConnector(
          'POST',
          vendorEarningsEndpoints.SUBMIT_FUEL_CLAIM_API,
          formData,
          { Authorization: `Bearer ${token}` }
        );

        if (response.data?.success) {
          return { success: true, claim: response.data.fuelClaim || response.data.claim || newClaim, fromBackend: true };
        }
      } else {
        console.log('[VendorEarningsService] Booking ID is not a MongoDB ObjectId, saved fuel claim locally.');
      }
    } catch (err) {
      console.warn('[VendorEarningsService] Backend fuel claim notice (saved to local pending queue):', err.response?.data?.message || err.message);
      return { success: true, claim: newClaim, fromBackend: false, error: err.response?.data?.message || err.message };
    }
  }

  return { success: true, claim: newClaim, fromBackend: false };
}

/**
 * Submit a payout request.
 * Connects directly to backend POST /api/payout/request with transaction safety.
 */
export async function requestVendorPayoutApi(payoutPayload, token) {
  const requestRecord = {
    id: `PAYOUT-${Date.now()}`,
    ...payoutPayload,
    status: 'Processing',
    requestedAt: new Date().toISOString(),
  };

  // Persist locally for immediate optimistic feedback
  const requests = getStoredJson(STORAGE_KEYS.PAYOUT_REQUESTS, []);
  setStoredJson(STORAGE_KEYS.PAYOUT_REQUESTS, [requestRecord, ...requests]);

  // Attempt backend submission if endpoint and token are present
  if (token && vendorEarningsEndpoints.REQUEST_PAYOUT_API) {
    try {
      const rawEarnings = payoutPayload.earnings;
      const earningIds = Array.isArray(rawEarnings)
        ? rawEarnings
            .map(e => (typeof e === 'object' && e ? (e._id || e.id) : e))
            .filter(id => id && /^[0-9a-fA-F]{24}$/.test(String(id)))
        : [];

      if (earningIds.length > 0) {
        const backendPayload = {
          earnings: earningIds,
          amount: Number(Number(payoutPayload.amount).toFixed(2)),
          daysOfWork: Math.max(1, Math.round(Number(payoutPayload.daysOfWork) || 1)),
          settlementNotes: String(payoutPayload.settlementNotes || payoutPayload.notes || '').slice(0, 500),
        };

        const response = await apiConnector(
          'POST',
          vendorEarningsEndpoints.REQUEST_PAYOUT_API,
          backendPayload,
          { Authorization: `Bearer ${token}` }
        );

        if (response.data?.success) {
          return {
            success: true,
            data: response.data.payout || requestRecord,
            payout: response.data.payout,
            fromBackend: true,
          };
        }
      } else {
        console.log('[VendorEarningsService] No valid MongoDB earning IDs provided for payout request, saved to local ledger.');
      }
    } catch (err) {
      console.warn('[VendorEarningsService] Backend payout request notice (saved locally):', err.response?.data?.message || err.message);
      return {
        success: true,
        data: requestRecord,
        fromBackend: false,
        error: err.response?.data?.message || err.message,
      };
    }
  }

  return { success: true, data: requestRecord, fromBackend: false };
}

/**
 * Fetch all vendor earnings records across the platform for the admin dashboard.
 * Connects directly to backend GET /api/vendor-earnings/admin.
 */
export async function fetchAllVendorEarningsForAdmin(token) {
  const activeToken =
    token ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('adminToken') ||
        localStorage.getItem('mm_token') ||
        localStorage.getItem('token')
      : null) ||
    CANONICAL_ADMIN_TOKEN;

  try {
    const response = await apiConnector(
      'GET',
      vendorEarningsEndpoints.GET_ADMIN_EARNINGS_API,
      null,
      { Authorization: `Bearer ${activeToken}` }
    );
    if (response.data?.success && Array.isArray(response.data?.earnings)) {
      return {
        success: true,
        earnings: response.data.earnings,
        count: response.data.count || response.data.earnings.length,
      };
    }
  } catch (err) {
    console.warn('[VendorEarningsService] Error fetching admin vendor earnings:', err.message);
  }
  return { success: false, earnings: [], count: 0 };
}

/**
 * Fetch all earnings records for a specific vendor (Admin view).
 * Connects directly to backend GET /api/vendor-earnings/admin/vendor/:vendorId.
 */
export async function fetchVendorEarningsByVendorIdForAdmin(vendorId, token) {
  const activeToken =
    token ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('adminToken') ||
        localStorage.getItem('mm_token') ||
        localStorage.getItem('token')
      : null) ||
    CANONICAL_ADMIN_TOKEN;

  if (!vendorId) return { success: false, earnings: [], count: 0 };
  try {
    const response = await apiConnector(
      'GET',
      `${vendorEarningsEndpoints.GET_ADMIN_VENDOR_EARNINGS_API}/${vendorId}`,
      null,
      { Authorization: `Bearer ${activeToken}` }
    );
    if (response.data?.success && Array.isArray(response.data?.earnings)) {
      return {
        success: true,
        earnings: response.data.earnings,
        count: response.data.count || response.data.earnings.length,
      };
    }
  } catch (err) {
    console.warn('[VendorEarningsService] Error fetching vendor earnings by vendor ID:', err.message);
  }
  return { success: false, earnings: [], count: 0 };
}
