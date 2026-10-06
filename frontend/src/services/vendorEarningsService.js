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

export const vendorEarningsEndpoints = {
  GET_EARNINGS_API: `${BASE_URL}/vendor/earnings`,
  GET_FUEL_ALLOWANCES_API: `${BASE_URL}/vendor/earnings/fuel-allowances`,
  SUBMIT_FUEL_CLAIM_API: `${BASE_URL}/vendor/earnings/fuel-claim`,
  REQUEST_PAYOUT_API: `${BASE_URL}/vendor/earnings/request-payout`,
  SYNC_ALLOWANCE_API: `${BASE_URL}/vendor/earnings/sync-allowance`,
};

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
    completedJobs: itemizedJobs,
    totalServiceCharges,
    totalServicePayout,
    totalComponentCharges,
    totalDistanceKm,
    totalFuelPayout: combinedFuelPayout,
    automatedFuelPayout: totalFuelPayout,
    manualClaimsPayout,
    totalGrossBilled,
    totalAvailablePayout,
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
 * Ready to consume backend GET /vendor/earnings when backend route is added.
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
      if (response.data?.success && response.data?.earnings) {
        setStoredJson(STORAGE_KEYS.EARNINGS_CACHE, response.data.earnings);
        return {
          success: true,
          earnings: response.data.earnings,
          fromBackend: true,
        };
      }
    } catch (err) {
      console.log('[VendorEarningsService] Backend GET /vendor/earnings notice (fallback to dynamic calculation):', err.message);
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
 * Ready to consume backend POST /vendor/earnings/fuel-claim when backend route is added.
 */
export async function submitVendorFuelClaim(claimData, token) {
  const newClaim = {
    id: `CLAIM-${Date.now().toString().slice(-6)}`,
    ...claimData,
    status: 'Submitted',
    createdAt: new Date().toISOString(),
  };

  // Persist locally
  const claims = getStoredJson(STORAGE_KEYS.FUEL_CLAIMS, []);
  const updated = [newClaim, ...claims];
  setStoredJson(STORAGE_KEYS.FUEL_CLAIMS, updated);

  // Attempt backend submission
  if (token) {
    try {
      const response = await apiConnector(
        'POST',
        vendorEarningsEndpoints.SUBMIT_FUEL_CLAIM_API,
        newClaim,
        { Authorization: `Bearer ${token}` }
      );
      if (response.data?.success) {
        return { success: true, claim: response.data.claim || newClaim, fromBackend: true };
      }
    } catch (err) {
      console.log('[VendorEarningsService] Backend fuel claim notice (saved to local pending queue):', err.message);
    }
  }

  return { success: true, claim: newClaim, fromBackend: false };
}

/**
 * Submit a payout request.
 * Ready to consume backend POST /vendor/earnings/request-payout when backend route is added.
 */
export async function requestVendorPayoutApi(payoutPayload, token) {
  const requestRecord = {
    id: `PAYOUT-${Date.now()}`,
    ...payoutPayload,
    status: 'Processing',
    requestedAt: new Date().toISOString(),
  };

  // Persist locally
  const requests = getStoredJson(STORAGE_KEYS.PAYOUT_REQUESTS, []);
  setStoredJson(STORAGE_KEYS.PAYOUT_REQUESTS, [requestRecord, ...requests]);

  // Attempt backend submission
  if (token) {
    try {
      const response = await apiConnector(
        'POST',
        vendorEarningsEndpoints.REQUEST_PAYOUT_API,
        requestRecord,
        { Authorization: `Bearer ${token}` }
      );
      if (response.data?.success) {
        return { success: true, data: response.data, fromBackend: true };
      }
    } catch (err) {
      console.log('[VendorEarningsService] Backend payout request notice (saved locally):', err.message);
    }
  }

  return { success: true, data: requestRecord, fromBackend: false };
}
