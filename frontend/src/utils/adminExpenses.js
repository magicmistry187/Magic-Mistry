/**
 * adminExpenses.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Financial & Expense Analytics Engine for Platform Admin.
 * Consolidates all platform expenditure into unified accounting ledgers:
 *   1. Direct Cost of Services (COGS) — 50% Partner Labor Share
 *   2. Fuel & Travel Claims — 100% Technician Travel Mileage Reimbursements
 *   3. Spare Parts & Components Procurement — Inventory Restock Costs
 *   4. Payment Processing & Gateway Fees (~2.0% on Online/UPI Collections)
 *   5. Operational Overhead & Admin Logged Bills (AWS Hosting, SMS, Marketing)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'mm_admin_expenses';

function safeNumber(val, fallback = 0) {
  if (typeof val === 'number') {
    return isNaN(val) || !isFinite(val) ? fallback : val;
  }
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || !isFinite(parsed) ? fallback : parsed;
}

function safeDate(val) {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

const DEFAULT_OPERATIONAL_EXPENSES = [
  {
    id: 'EXP-1001',
    title: 'AWS Cloud & MongoDB Server Hosting',
    category: 'Infrastructure',
    categoryKey: 'overhead',
    amount: 3450,
    date: '2026-11-01',
    paymentMode: 'Corporate Card',
    status: 'Paid',
    beneficiary: 'Amazon Web Services',
    notes: 'Monthly production hosting, CDN, and high-availability database cluster',
    isCustom: true,
  },
  {
    id: 'EXP-1002',
    title: 'Fast2SMS & WhatsApp OTP Alerts Gateway',
    category: 'Communications',
    categoryKey: 'overhead',
    amount: 1200,
    date: '2026-11-02',
    paymentMode: 'UPI',
    status: 'Paid',
    beneficiary: 'Fast2SMS India',
    notes: '5,000 automated OTP verification & dispatch alert credits',
    isCustom: true,
  },
  {
    id: 'EXP-1003',
    title: 'Partner Diagnostic Multi-Meter Kits (Batch 1)',
    category: 'Tools & Equipment',
    categoryKey: 'overhead',
    amount: 4800,
    date: '2026-11-03',
    paymentMode: 'Bank Transfer',
    status: 'Paid',
    beneficiary: 'Mastech Instruments Ltd.',
    notes: '4 safety repair toolkits issued to newly onboarded verified partners',
    isCustom: true,
  },
  {
    id: 'EXP-1004',
    title: 'Local Google Ads & Customer Leaflet Drive',
    category: 'Marketing',
    categoryKey: 'overhead',
    amount: 2500,
    date: '2026-11-04',
    paymentMode: 'UPI',
    status: 'Paid',
    beneficiary: 'Google Ads & Local Print Media',
    notes: 'Targeted customer acquisition in Asansol / Durgapur cluster',
    isCustom: true,
  },
];

/**
 * Get custom admin expenses from localStorage
 */
export function getStoredAdminExpenses() {
  if (typeof window === 'undefined') return DEFAULT_OPERATIONAL_EXPENSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_OPERATIONAL_EXPENSES));
      return DEFAULT_OPERATIONAL_EXPENSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_OPERATIONAL_EXPENSES;
  } catch (err) {
    console.warn('Failed to parse mm_admin_expenses:', err);
    return DEFAULT_OPERATIONAL_EXPENSES;
  }
}

/**
 * Save a new operational expense
 */
export function saveAdminExpense(expenseData) {
  if (typeof window === 'undefined') return null;
  try {
    const current = getStoredAdminExpenses();
    const newId = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      id: newId,
      title: expenseData?.title?.trim() || 'General Operating Expense',
      category: expenseData?.category || 'Operational Overhead',
      categoryKey: 'overhead',
      amount: safeNumber(expenseData?.amount, 0),
      date: expenseData?.date || new Date().toISOString().slice(0, 10),
      paymentMode: expenseData?.paymentMode || 'UPI',
      status: expenseData?.status || 'Paid',
      beneficiary: expenseData?.beneficiary?.trim() || expenseData?.vendor?.trim() || 'Platform Vendor',
      notes: expenseData?.notes?.trim() || '',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(
      new CustomEvent('mm_admin_expense_updated', {
        detail: { action: 'add', expense: newRecord },
      })
    );

    return newRecord;
  } catch (err) {
    console.error('Failed to save admin expense:', err);
    return null;
  }
}

/**
 * Delete a custom expense
 */
export function deleteAdminExpense(expenseId) {
  if (typeof window === 'undefined' || !expenseId) return false;
  try {
    const current = getStoredAdminExpenses();
    const updated = current.filter((e) => e.id !== expenseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(
      new CustomEvent('mm_admin_expense_updated', {
        detail: { action: 'delete', expenseId },
      })
    );

    return true;
  } catch (err) {
    console.error('Failed to delete admin expense:', err);
    return false;
  }
}

/**
 * Consolidate all 5 platform expenditure centers into a single unified ledger
 */
export function consolidatePlatformExpenses({
  allBookings = [],
  adminEarningsRaw = [],
  paymentRequests = [],
  inventoryList = [],
  customExpenses = [],
} = {}) {
  const allExpenses = [];

  let vendorLaborTotal = 0;
  let fuelTotal = 0;
  let partsTotal = 0;
  let gatewayTotal = 0;
  let overheadTotal = 0;
  let grossRevenue = 0;

  // 1. Process Completed Bookings & Direct Vendor Labor Share (50%)
  const bookingsArray = Array.isArray(allBookings) ? allBookings : [];
  const completedBookings = bookingsArray.filter((b) => {
    if (!b) return false;
    const s = String(b.bookingStatus || b.status || '').trim().toLowerCase();
    return s === 'completed' || s === 'closed';
  });

  completedBookings.forEach((b, idx) => {
    const rawAmt = b.amount ?? b.pricing?.total ?? b.serviceCharge ?? b.serviceCategoryCharge ?? 399;
    const billedAmt = Math.max(0, safeNumber(rawAmt, 399));
    grossRevenue += billedAmt;

    // 50% Partner Labor Share
    const laborAmt = Math.round(billedAmt * 0.5);
    vendorLaborTotal += laborAmt;

    const bDate = b.dateCompleted && b.dateCompleted !== '—'
      ? b.dateCompleted
      : (b.serviceDate && b.serviceDate !== '—' ? b.serviceDate : safeDate(b.createdAt).toLocaleDateString('en-IN'));

    allExpenses.push({
      id: `EXP-LAB-${String(b.rawId || b.id || idx).slice(-4).toUpperCase()}`,
      title: `Labor Commission: ${b.appliance || 'Service Job'}`,
      category: 'Vendor Labor',
      categoryKey: 'vendor_labor',
      amount: laborAmt,
      date: bDate,
      rawDate: b.completedAt || b.createdAt || new Date(),
      paymentMode: 'Direct Disbursal',
      status: 'Settled',
      beneficiary: b.technician || 'Assigned Partner',
      notes: `50% labor commission on ${b.displayId || b.id} (Gross: ₹${billedAmt})`,
      isCustom: false,
    });

    // 2. Payment Gateway Processing Fee (2.0% on digital/UPI collections)
    const isOnline = String(b.paymentMethod || '').toLowerCase().includes('upi') ||
                     String(b.paymentMethod || '').toLowerCase().includes('card') ||
                     String(b.paymentMethod || '').toLowerCase().includes('online');
    const feeAmt = Math.max(5, Math.round(billedAmt * 0.02));
    gatewayTotal += feeAmt;

    allExpenses.push({
      id: `EXP-PGW-${String(b.rawId || b.id || idx).slice(-4).toUpperCase()}`,
      title: `Payment Gateway Fee (2% On-Demand)`,
      category: 'Gateway & Processing',
      categoryKey: 'gateway',
      amount: feeAmt,
      date: bDate,
      rawDate: b.completedAt || b.createdAt || new Date(),
      paymentMode: isOnline ? 'Auto-Deducted' : 'Platform Settlement',
      status: 'Settled',
      beneficiary: 'Razorpay / UPI Settlement Gateway',
      notes: `2% transaction settlement fee on order ${b.displayId || b.id}`,
      isCustom: false,
    });
  });

  // 2. Process Fuel Claims & Mileage Disbursals
  const requestsArray = Array.isArray(paymentRequests) ? paymentRequests : [];
  const fuelClaims = requestsArray.filter((req) => req && req.requestType === 'fuelClaim');
  fuelClaims.forEach((f, idx) => {
    const claimAmt = Math.max(0, safeNumber(f.amount ?? f.claimAmount, 0));
    fuelTotal += claimAmt;

    allExpenses.push({
      id: `EXP-FUEL-${String(f.id || f._id || idx).slice(-4).toUpperCase()}`,
      title: `Fuel Mileage Claim: ${f.daysOfWork || 'Travel'}`,
      category: 'Fuel Reimbursement',
      categoryKey: 'fuel',
      amount: claimAmt,
      date: f.date || new Date().toLocaleDateString('en-IN'),
      rawDate: f.createdAt || new Date(),
      paymentMode: f.upiId ? `UPI (${f.upiId})` : 'Direct Bank Payout',
      status: f.status === 'Paid' ? 'Settled' : f.status === 'Approved' ? 'Approved' : 'Pending',
      beneficiary: f.vendorName || 'Field Technician',
      notes: f.reason ? `Reason: ${f.reason}` : `Distance reimbursement for doorstep travel`,
      isCustom: false,
    });
  });

  // 3. Process Spare Parts Restock & Inventory Procurement
  const invArray = Array.isArray(inventoryList) ? inventoryList : [];
  invArray.forEach((item, idx) => {
    if (!item) return;
    const unitCost = safeNumber(item.purchaseCost ?? item.costPrice, Math.round(safeNumber(item.price ?? item.unitPrice, 350) * 0.6));
    const qty = Math.max(1, safeNumber(item.stock ?? item.quantity, 4));
    const itemTotal = unitCost * qty;
    partsTotal += itemTotal;

    const iDate = item.updatedAt ? safeDate(item.updatedAt).toLocaleDateString('en-IN') : 'Recent';

    allExpenses.push({
      id: `EXP-INV-${String(item.id || item._id || idx).slice(-4).toUpperCase()}`,
      title: `Component Stock: ${item.name || 'Appliance Spares'} (${qty} Units)`,
      category: 'Parts Procurement',
      categoryKey: 'inventory',
      amount: itemTotal,
      date: iDate,
      rawDate: item.updatedAt || new Date(),
      paymentMode: 'Vendor Invoice',
      status: 'Paid',
      beneficiary: item.supplier || 'Original Component Supplier',
      notes: `Replenished ${qty} pcs @ ₹${unitCost}/unit`,
      isCustom: false,
    });
  });

  // 4. Process Operational Bills & Overhead Logged by Admin
  const expArray = Array.isArray(customExpenses) ? customExpenses : [];
  expArray.forEach((exp) => {
    if (!exp) return;
    const expAmt = safeNumber(exp.amount, 0);
    overheadTotal += expAmt;

    allExpenses.push({
      id: exp.id || `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: exp.title || 'Platform Operational Bill',
      category: exp.category || 'Platform Overhead',
      categoryKey: 'overhead',
      amount: expAmt,
      date: exp.date || new Date().toLocaleDateString('en-IN'),
      rawDate: exp.date || new Date(),
      paymentMode: exp.paymentMode || 'Corporate Card',
      status: exp.status || 'Paid',
      beneficiary: exp.beneficiary || 'Platform Vendor',
      notes: exp.notes || 'Recorded platform administrative expense',
      isCustom: true,
    });
  });

  // Totals & KPI Metrics
  const totalExpenses = vendorLaborTotal + fuelTotal + partsTotal + gatewayTotal + overheadTotal;
  const netProfit = Math.max(0, grossRevenue - totalExpenses);
  const netMarginPct = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0';

  // Sort expenses latest first
  allExpenses.sort((a, b) => {
    const da = safeDate(a.rawDate || a.date).getTime() || 0;
    const db = safeDate(b.rawDate || b.date).getTime() || 0;
    return db - da;
  });

  // Category Breakdown for Donut Chart
  const categoryBreakdown = [
    {
      name: 'Vendor Labor (50%)',
      categoryKey: 'vendor_labor',
      value: vendorLaborTotal,
      color: '#f97316', // Orange
    },
    {
      name: 'Fuel & Travel Claims',
      categoryKey: 'fuel',
      value: fuelTotal,
      color: '#3b82f6', // Blue
    },
    {
      name: 'Parts & Procurement',
      categoryKey: 'inventory',
      value: partsTotal,
      color: '#8b5cf6', // Purple
    },
    {
      name: 'Platform Overhead',
      categoryKey: 'overhead',
      value: overheadTotal,
      color: '#e11d48', // Rose
    },
    {
      name: 'Gateway & Banking Fees',
      categoryKey: 'gateway',
      value: gatewayTotal,
      color: '#10b981', // Emerald
    },
  ].filter((c) => c.value > 0);

  // 12-Month Financial Comparison Timeline Data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const monthlyTimeline = monthNames.map((name) => ({
    name,
    revenue: 0,
    expenses: 0,
    profit: 0,
  }));

  // Distribute revenue & expenses across months
  completedBookings.forEach((b) => {
    const d = safeDate(b.completedAt || b.createdAt);
    if (d.getFullYear() === currentYear) {
      const mIdx = d.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        const rev = safeNumber(b.amount, 399);
        const exp = Math.round(rev * 0.52); // Labor + Gateway
        monthlyTimeline[mIdx].revenue += rev;
        monthlyTimeline[mIdx].expenses += exp;
        monthlyTimeline[mIdx].profit = Math.max(0, monthlyTimeline[mIdx].revenue - monthlyTimeline[mIdx].expenses);
      }
    }
  });

  expArray.forEach((e) => {
    const d = safeDate(e.date);
    if (d.getFullYear() === currentYear) {
      const mIdx = d.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        monthlyTimeline[mIdx].expenses += safeNumber(e.amount, 0);
        monthlyTimeline[mIdx].profit = Math.max(0, monthlyTimeline[mIdx].revenue - monthlyTimeline[mIdx].expenses);
      }
    }
  });

  return {
    allExpenses,
    summary: {
      grossRevenue,
      totalExpenses,
      netProfit,
      netMarginPct: String(netMarginPct || '0.0'),
      vendorLaborTotal,
      fuelTotal,
      partsTotal,
      gatewayTotal,
      overheadTotal,
    },
    categoryBreakdown,
    monthlyTimeline,
  };
}
