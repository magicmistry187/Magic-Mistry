/**
 * adminExports.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-Data Excel & CSV Export Engine for Magic Mistry Admin Panel.
 * Exports the exact live database/state records currently shown on the platform:
 *   1. Work History & Doorstep Bookings (incl. Ratings, Technicians, Amounts)
 *   2. Real Stock Inventory Catalog (SKUs, Quantities, Costs, Valuations)
 *   3. Vendor Payment & Fuel Mileage Requests (Amounts, UPI/Banks, Statuses)
 *   4. Financial Analytics & Expenses Ledger (Cost Centers, Payouts, Bills)
 *   5. User & Partner Accounts Roster (Customers, Technicians, Roles, Status)
 *   6. Technician Partner Applications (Specializations, Cities, Experience)
 * ─────────────────────────────────────────────────────────────────────────────
 */

function escapeXml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function safeDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function isDateInRange(dateValue, fromDate, toDate) {
  if (!fromDate && !toDate) return true;
  if (!dateValue || dateValue === '—' || dateValue === '-') return true;

  const d = safeDate(dateValue);
  if (!d) return true; // keep if date parsing fails so we don't drop records

  if (fromDate) {
    const f = safeDate(fromDate);
    if (f) {
      f.setHours(0, 0, 0, 0);
      if (d < f) return false;
    }
  }

  if (toDate) {
    const t = safeDate(toDate);
    if (t) {
      t.setHours(23, 59, 59, 999);
      if (d > t) return false;
    }
  }

  return true;
}

/**
 * Core utility to generate and download a styled Microsoft Excel-compatible XML spreadsheet
 */
export function downloadExcelWorkbook({
  filename = 'MagicMistry_Export.xls',
  title = 'Magic Mistry Report',
  subtitle = '',
  columns = [],
  data = [],
  summaryRows = [],
}) {
  const safeData = Array.isArray(data) ? data : [];

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const fullSubtitle = subtitle
    ? `${subtitle} • Generated: ${currentDate} ${currentTime}`
    : `Generated on: ${currentDate} at ${currentTime} • Magic Mistry Administration`;

  const colHeadersHtml = columns
    .map((col) => {
      const align = col.align === 'right' ? 'text-align: right;' : col.align === 'center' ? 'text-align: center;' : 'text-align: left;';
      return `<th style="${align}">${escapeXml(col.header)}</th>`;
    })
    .join('');

  const rowsHtml =
    safeData.length === 0
      ? `<tr style="background-color: #ffffff;"><td colspan="${columns.length}" style="text-align: center; padding: 25px; color: #64748b; font-style: italic;">No records found matching criteria.</td></tr>`
      : safeData
          .map((row, idx) => {
            const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            const cellsHtml = columns
              .map((col) => {
                const rawVal = col.render ? col.render(row) : row[col.key];
                const align = col.align === 'right' ? 'text-align: right;' : col.align === 'center' ? 'text-align: center;' : 'text-align: left;';
                const bold = col.bold ? 'font-weight: bold;' : '';
                const customStyle = col.cellStyle ? col.cellStyle(row) : '';
                return `<td style="${align} ${bold} ${customStyle}">${rawVal !== undefined && rawVal !== null ? rawVal : '—'}</td>`;
              })
              .join('');

            return `<tr style="background-color: ${bg};">${cellsHtml}</tr>`;
          })
          .join('');

  const summaryHtml = summaryRows
    .map(
      (s) => `
      <tr style="background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #02182e;">
        <td colspan="${s.colspan || 1}" style="padding: 10px; text-align: ${s.align || 'left'}; color: #02182e;">
          ${escapeXml(s.label)}
        </td>
        ${s.extraCells ? s.extraCells.map((c) => `<td style="padding: 10px; text-align: ${c.align || 'right'}; color: #02182e;">${c.value}</td>`).join('') : ''}
      </tr>
    `
    )
    .join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
        table { border-collapse: collapse; width: 100%; margin-top: 8px; }
        .main-title { font-size: 16pt; font-weight: bold; color: #02182e; padding: 10px 0 2px 0; border: none; }
        .sub-title { font-size: 9.5pt; color: #64748b; padding-bottom: 14px; border: none; }
        th { background-color: #02182e; color: #ffffff; font-weight: bold; font-size: 10pt; padding: 10px 8px; border: 1px solid #94a3b8; }
        td { padding: 8px; border: 1px solid #cbd5e1; font-size: 10pt; vertical-align: middle; }
        .badge-completed { color: #15803d; font-weight: bold; }
        .badge-cancelled { color: #b91c1c; font-weight: bold; }
        .badge-pending { color: #b45309; font-weight: bold; }
        .badge-assigned { color: #1d4ed8; font-weight: bold; }
        .badge-inprogress { color: #ea580c; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="${columns.length}" class="main-title">${escapeXml(title)}</td>
        </tr>
        <tr>
          <td colspan="${columns.length}" class="sub-title">${escapeXml(fullSubtitle)}</td>
        </tr>
        <tr>
          ${colHeadersHtml}
        </tr>
        ${rowsHtml}
        ${summaryHtml}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.xls') ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * 1. WORK HISTORY & BOOKINGS REAL EXCEL EXPORT
 */
export function exportRealWorkHistoryExcel({
  bookingsList = [],
  fromDate = '',
  toDate = '',
  statusFilter = 'All Records',
}) {
  const safeList = Array.isArray(bookingsList) ? bookingsList : [];
  const filtered = safeList.filter((item) => {
    if (!item) return false;

    // Filter by Date Completed or Service Date or CreatedAt
    const rawDate = item.completedAt || item.dateCompleted || item.serviceDate || item.createdAt;
    if (!isDateInRange(rawDate, fromDate, toDate)) return false;

    // Filter by Status if specific tab selected
    if (statusFilter && statusFilter !== 'All Records') {
      const s = String(item.status || item.bookingStatus || '').trim().toUpperCase();
      if (statusFilter === 'Completed' && s !== 'COMPLETED' && s !== 'CLOSED') return false;
      if (statusFilter === 'In Progress' && s !== 'IN PROGRESS' && s !== 'UNDER DIAGNOSIS') return false;
      if (statusFilter === 'Pending' && s !== 'PENDING' && s !== 'AWAITING TECH') return false;
      if (statusFilter === 'Accepted' && s !== 'ACCEPTED' && s !== 'ASSIGNED' && s !== 'ON THE WAY') return false;
      if (statusFilter === 'Cancelled' && s !== 'CANCELLED') return false;
    }

    return true;
  });

  let totalRevenue = 0;
  filtered.forEach((b) => {
    const amt = Number(b.amount || b.pricing?.total || b.serviceCategoryCharge || b.serviceCharge || 0);
    totalRevenue += isNaN(amt) ? 0 : amt;
  });

  const columns = [
    { header: 'REQ / WORK ID', key: 'id', bold: true, render: (b) => escapeXml(b.displayId || b.id || '—') },
    { header: 'APPLIANCE / SERVICE', key: 'appliance', render: (b) => escapeXml(b.appliance || b.serviceName || 'Appliance Repair') },
    { header: 'ISSUE / PROBLEM', key: 'issue', render: (b) => escapeXml(b.issue || b.serviceCategory || 'Standard Service') },
    { header: 'CUSTOMER NAME', key: 'customer', render: (b) => escapeXml(b.customer || b.customerName || 'Customer') },
    { header: 'CUSTOMER PHONE', key: 'customerPhone', render: (b) => escapeXml(b.customerPhone || b.phone || '—') },
    { header: 'SERVICE LOCATION', key: 'customerAddress', render: (b) => escapeXml(b.customerAddress || b.address || '—') },
    { header: 'TECHNICIAN PARTNER', key: 'technician', render: (b) => escapeXml(b.technician || b.vendorName || 'Unassigned') },
    { header: 'TECHNICIAN PHONE', key: 'technicianPhone', render: (b) => escapeXml(b.technicianPhone || '—') },
    { header: 'SCHEDULED DATE', key: 'serviceDate', render: (b) => escapeXml(b.serviceDate || '—') },
    { header: 'TIME SLOT', key: 'timeSlot', render: (b) => escapeXml(b.timeSlot || 'Anytime') },
    { header: 'COMPLETED ON', key: 'dateCompleted', render: (b) => escapeXml(b.dateCompleted || '—') },
    {
      header: 'STATUS',
      key: 'status',
      align: 'center',
      render: (b) => {
        const s = String(b.status || b.bookingStatus || 'Pending');
        const sLower = s.toLowerCase();
        let cls = 'badge-pending';
        if (sLower.includes('complete') || sLower.includes('closed')) cls = 'badge-completed';
        else if (sLower.includes('cancel')) cls = 'badge-cancelled';
        else if (sLower.includes('progress')) cls = 'badge-inprogress';
        else if (sLower.includes('accept') || sLower.includes('assign')) cls = 'badge-assigned';
        return `<span class="${cls}">${escapeXml(s)}</span>`;
      },
    },
    {
      header: 'CUSTOMER RATING',
      key: 'rating',
      align: 'center',
      render: (b) => {
        const r = b.rating || (b.reviewData && b.reviewData.rating);
        if (!r) return '<span style="color: #94a3b8;">Not Rated</span>';
        return `<span style="font-weight: bold; color: #d97706;">★ ${Number(r).toFixed(1)} / 5</span>`;
      },
    },
    { header: 'CUSTOMER FEEDBACK', key: 'review', render: (b) => escapeXml(b.review || (b.reviewData && b.reviewData.review) || '—') },
    {
      header: 'AMOUNT (INR)',
      key: 'amount',
      align: 'right',
      bold: true,
      render: (b) => {
        const amt = Number(b.amount || b.pricing?.total || b.serviceCategoryCharge || b.serviceCharge || 0);
        return `₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      },
    },
    { header: 'PAYMENT STATUS', key: 'paymentStatus', align: 'center', render: (b) => escapeXml(b.paymentStatus || 'Pending') },
    { header: 'PAYMENT METHOD', key: 'paymentMethod', render: (b) => escapeXml(b.paymentMethod || 'Cash After Service') },
  ];

  const dateTag = new Date().toISOString().slice(0, 10);
  downloadExcelWorkbook({
    filename: `MagicMistry_Live_WorkHistory_${dateTag}.xls`,
    title: 'Magic Mistry - Comprehensive Work History & Service Doorsteps',
    subtitle: `Total Live Database Records: ${filtered.length} | Status Scope: ${statusFilter}${fromDate ? ` | From: ${fromDate}` : ''}${toDate ? ` | To: ${toDate}` : ''}`,
    columns,
    data: filtered,
    summaryRows: [
      {
        colspan: 14,
        align: 'right',
        label: `TOTAL REVENUE (From ${filtered.length} Displayed Orders):`,
        extraCells: [
          {
            align: 'right',
            value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          },
          { align: 'center', value: '' },
          { align: 'center', value: '' },
        ],
      },
    ],
  });

  return filtered.length;
}

/**
 * 2. REAL INVENTORY STATUS EXCEL EXPORT
 */
export function exportRealInventoryExcel({
  inventoryList = [],
  fromDate = '',
  toDate = '',
}) {
  const safeList = Array.isArray(inventoryList) ? inventoryList : [];
  const filtered = safeList.filter((item) => {
    if (!item) return false;
    const rawDate = item.lastUpdated || item.updatedAt || item.lastRestocked || item.createdAt;
    return isDateInRange(rawDate, fromDate, toDate);
  });

  let totalUnits = 0;
  let totalValuation = 0;

  filtered.forEach((item) => {
    const qty = Number(item.stockCount ?? item.stock ?? item.quantity ?? 0);
    const price = Number(item.unitPrice ?? item.price ?? 0);
    totalUnits += isNaN(qty) ? 0 : qty;
    totalValuation += (isNaN(qty) ? 0 : qty) * (isNaN(price) ? 0 : price);
  });

  const columns = [
    { header: 'SKU / ITEM ID', key: 'id', bold: true, render: (i) => escapeXml(i.id || i.sku || '—') },
    { header: 'ITEM NAME & SPECIFICATION', key: 'name', render: (i) => escapeXml(i.name || 'Component Spare') },
    { header: 'APPLIANCE CATEGORY', key: 'category', render: (i) => escapeXml(i.category || 'General Spares') },
    { header: 'COMPATIBILITY / MODELS', key: 'compatibility', render: (i) => escapeXml(i.compatibility || 'Universal') },
    {
      header: 'STOCK HEALTH',
      key: 'stockLevel',
      align: 'center',
      render: (i) => {
        const count = Number(i.stockCount ?? i.stock ?? i.quantity ?? 0);
        let lvl = i.stockLevel || (count <= 0 ? 'Out of Stock' : count <= 5 ? 'Low Stock' : 'Healthy');
        let cls = 'badge-completed';
        if (lvl.toLowerCase().includes('out')) cls = 'badge-cancelled';
        else if (lvl.toLowerCase().includes('low')) cls = 'badge-pending';
        return `<span class="${cls}">${escapeXml(lvl)}</span>`;
      },
    },
    {
      header: 'QUANTITY IN STOCK',
      key: 'stockCount',
      align: 'right',
      bold: true,
      render: (i) => `${Number(i.stockCount ?? i.stock ?? i.quantity ?? 0)} units`,
    },
    {
      header: 'PURCHASE COST (INR)',
      key: 'purchaseCost',
      align: 'right',
      render: (i) => {
        const cost = Number(i.purchaseCost ?? i.costPrice ?? (i.unitPrice ? i.unitPrice * 0.6 : 150));
        return `₹${cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      },
    },
    {
      header: 'SELLING PRICE (INR)',
      key: 'unitPrice',
      align: 'right',
      render: (i) => {
        const price = Number(i.unitPrice ?? i.price ?? 0);
        return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      },
    },
    {
      header: 'ASSET VALUATION (INR)',
      key: 'totalValue',
      align: 'right',
      bold: true,
      render: (i) => {
        const qty = Number(i.stockCount ?? i.stock ?? i.quantity ?? 0);
        const price = Number(i.unitPrice ?? i.price ?? 0);
        return `₹${(qty * price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      },
    },
    { header: 'SUPPLIER / SOURCE', key: 'supplier', render: (i) => escapeXml(i.supplier || 'Original Component Supplier') },
    { header: 'LAST UPDATED', key: 'lastUpdated', render: (i) => escapeXml(i.lastUpdated || (i.updatedAt ? new Date(i.updatedAt).toLocaleDateString('en-IN') : 'Recent')) },
  ];

  const dateTag = new Date().toISOString().slice(0, 10);
  downloadExcelWorkbook({
    filename: `MagicMistry_Live_Inventory_${dateTag}.xls`,
    title: 'Magic Mistry - Parts & Inventory Master Catalog',
    subtitle: `Total Tracked SKUs: ${filtered.length} | Physical Stock: ${totalUnits} Units | Total Catalog Valuation: ₹${totalValuation.toLocaleString('en-IN')}`,
    columns,
    data: filtered,
    summaryRows: [
      {
        colspan: 5,
        align: 'right',
        label: 'INVENTORY TOTALS:',
        extraCells: [
          { align: 'right', value: `${totalUnits} units` },
          { align: 'center', value: '' },
          { align: 'center', value: '' },
          { align: 'right', value: `₹${totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
          { align: 'center', value: '' },
          { align: 'center', value: '' },
        ],
      },
    ],
  });

  return filtered.length;
}

/**
 * 3. REAL VENDOR PAYMENT REQUESTS EXCEL EXPORT
 */
export function exportRealPaymentRequestsExcel({
  paymentRequests = [],
  fromDate = '',
  toDate = '',
}) {
  const safeList = Array.isArray(paymentRequests) ? paymentRequests : [];
  const filtered = safeList.filter((req) => {
    if (!req) return false;
    const rawDate = req.date || req.createdAt || req.updatedAt;
    return isDateInRange(rawDate, fromDate, toDate);
  });

  let totalRequested = 0;
  let totalSettled = 0;

  filtered.forEach((req) => {
    const amt = Number(req.amount ?? req.claimAmount ?? 0);
    totalRequested += isNaN(amt) ? 0 : amt;
    if (req.status === 'Paid' || req.status === 'Settled') {
      totalSettled += isNaN(amt) ? 0 : amt;
    }
  });

  const columns = [
    { header: 'REQUEST / PAYOUT ID', key: 'id', bold: true, render: (r) => escapeXml(r.id || r._id || '—') },
    { header: 'TECHNICIAN NAME', key: 'vendorName', render: (r) => escapeXml(r.vendorName || 'Partner') },
    { header: 'TECHNICIAN ID', key: 'vendorId', render: (r) => escapeXml(r.vendorId || '—') },
    {
      header: 'REQUEST TYPE',
      key: 'requestType',
      render: (r) => (r.requestType === 'fuelClaim' ? 'Fuel Mileage Reimbursement' : 'Weekly Service Labor Payout'),
    },
    {
      header: 'AMOUNT (INR)',
      key: 'amount',
      align: 'right',
      bold: true,
      render: (r) => {
        const amt = Number(r.amount ?? r.claimAmount ?? 0);
        return `₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      },
    },
    {
      header: 'DISBURSAL ACCOUNT / UPI',
      key: 'payoutDetails',
      render: (r) => escapeXml(r.upiId ? `UPI: ${r.upiId}` : r.bankAccount ? `Bank: ${r.bankAccount}` : 'Direct Bank Settlement'),
    },
    { header: 'WORK LOG / MILEAGE', key: 'daysOfWork', render: (r) => escapeXml(r.daysOfWork || r.distance || '—') },
    {
      header: 'STATUS',
      key: 'status',
      align: 'center',
      render: (r) => {
        const s = String(r.status || 'Pending');
        let cls = 'badge-pending';
        if (s === 'Paid' || s === 'Settled') cls = 'badge-completed';
        else if (s === 'Approved') cls = 'badge-assigned';
        else if (s === 'Rejected') cls = 'badge-cancelled';
        return `<span class="${cls}">${escapeXml(s)}</span>`;
      },
    },
    { header: 'REQUEST DATE', key: 'date', render: (r) => escapeXml(r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recent')) },
    { header: 'CLAIM REASON / NOTES', key: 'notes', render: (r) => escapeXml(r.notes || r.reason || 'Doorstep technician settlement') },
  ];

  const dateTag = new Date().toISOString().slice(0, 10);
  downloadExcelWorkbook({
    filename: `MagicMistry_Live_PaymentRequests_${dateTag}.xls`,
    title: 'Magic Mistry - Vendor Commission Payouts & Fuel Claims',
    subtitle: `Total Payout Records: ${filtered.length} | Gross Requested: ₹${totalRequested.toLocaleString('en-IN')} | Settled: ₹${totalSettled.toLocaleString('en-IN')}`,
    columns,
    data: filtered,
    summaryRows: [
      {
        colspan: 4,
        align: 'right',
        label: 'TOTAL DISBURSED & PENDING:',
        extraCells: [
          {
            align: 'right',
            value: `₹${totalRequested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          },
          { align: 'center', value: '' },
          { align: 'center', value: '' },
          { align: 'center', value: '' },
          { align: 'center', value: '' },
          { align: 'center', value: '' },
        ],
      },
    ],
  });

  return filtered.length;
}

/**
 * 4. REAL EXPENSES & FINANCIAL LEDGER EXCEL EXPORT
 */
export function exportRealFinancialLedgerExcel({
  allExpenses = [],
  fromDate = '',
  toDate = '',
}) {
  const safeList = Array.isArray(allExpenses) ? allExpenses : [];
  const filtered = safeList.filter((exp) => {
    if (!exp) return false;
    const rawDate = exp.rawDate || exp.date;
    return isDateInRange(rawDate, fromDate, toDate);
  });

  let totalExpenseAmount = 0;
  filtered.forEach((e) => {
    const amt = Number(e.amount || 0);
    totalExpenseAmount += isNaN(amt) ? 0 : amt;
  });

  const columns = [
    { header: 'VOUCHER / EXP ID', key: 'id', bold: true, render: (e) => escapeXml(e.id || '—') },
    { header: 'DATE', key: 'date', render: (e) => escapeXml(e.date || '—') },
    { header: 'COST CENTER / CATEGORY', key: 'category', render: (e) => escapeXml(e.category || 'Platform Overhead') },
    { header: 'TITLE & PURPOSE', key: 'title', render: (e) => escapeXml(e.title || 'Platform Bill') },
    { header: 'BENEFICIARY / PAYEE', key: 'beneficiary', render: (e) => escapeXml(e.beneficiary || 'Vendor Partner') },
    { header: 'PAYMENT MODE', key: 'paymentMode', render: (e) => escapeXml(e.paymentMode || 'Corporate Card') },
    {
      header: 'AMOUNT (INR)',
      key: 'amount',
      align: 'right',
      bold: true,
      render: (e) => `- ₹${Number(e.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      header: 'STATUS',
      key: 'status',
      align: 'center',
      render: (e) => `<span class="badge-completed">${escapeXml(e.status || 'Settled')}</span>`,
    },
    {
      header: 'EXPENSE NATURE',
      key: 'nature',
      render: (e) => (e.isCustom ? 'Manual Overhead Bill' : 'Automated Doorstep Disbursal'),
    },
    { header: 'AUDIT NOTES', key: 'notes', render: (e) => escapeXml(e.notes || '—') },
  ];

  const dateTag = new Date().toISOString().slice(0, 10);
  downloadExcelWorkbook({
    filename: `MagicMistry_Financial_Ledger_${dateTag}.xls`,
    title: 'Magic Mistry - Platform Expenditure & Disbursals Journal',
    subtitle: `Total Ledger Entries: ${filtered.length} | Cumulative Expenditures: ₹${totalExpenseAmount.toLocaleString('en-IN')}`,
    columns,
    data: filtered,
    summaryRows: [
      {
        colspan: 6,
        align: 'right',
        label: 'CUMULATIVE EXPENSES TOTAL:',
        extraCells: [
          {
            align: 'right',
            value: `- ₹${totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          },
          { align: 'center', value: '' },
          { align: 'center', value: '' },
          { align: 'center', value: '' },
        ],
      },
    ],
  });

  return filtered.length;
}

/**
 * 5. REAL USERS & PARTNERS ROSTER EXCEL EXPORT
 * Supports exporting:
 * - All Accounts
 * - Only Users (Customers: role === 'customer' or 'user')
 * - Only Vendors (Technicians: role === 'technician' or 'vendor')
 * - Only Admins (role === 'admin')
 */
export function exportRealUsersExcel({
  usersList = [],
  fromDate = '',
  toDate = '',
  roleFilter = 'All',
}) {
  const safeList = Array.isArray(usersList) ? usersList : [];
  const rf = String(roleFilter || 'All').trim().toLowerCase();

  const filtered = safeList.filter((u) => {
    if (!u) return false;
    const rawDate = u.createdAt || u.joinedDate || u.joined;
    if (!isDateInRange(rawDate, fromDate, toDate)) return false;

    if (rf && rf !== 'all') {
      const r = String(u.role || '').toLowerCase();
      if (rf === 'customer' || rf === 'users' || rf === 'user' || rf === 'customers') {
        if (r !== 'customer' && r !== 'user') return false;
      } else if (rf === 'technician' || rf === 'vendor' || rf === 'vendors' || rf === 'technicians') {
        if (r !== 'technician' && r !== 'vendor') return false;
      } else if (rf === 'admin' || rf === 'admins') {
        if (r !== 'admin') return false;
      }
    }
    return true;
  });

  const isCustomersOnly = (rf === 'customer' || rf === 'users' || rf === 'user' || rf === 'customers');
  const isVendorsOnly = (rf === 'technician' || rf === 'vendor' || rf === 'vendors' || rf === 'technicians');
  const isAdminsOnly = (rf === 'admin' || rf === 'admins');

  const roleLabel = isCustomersOnly
    ? 'Customers (Users)'
    : isVendorsOnly
    ? 'Technicians (Vendors)'
    : isAdminsOnly
    ? 'Platform Administrators'
    : 'Registered Customers & Technicians';

  const roleFileTag = isCustomersOnly
    ? 'Only_Users'
    : isVendorsOnly
    ? 'Only_Vendors'
    : isAdminsOnly
    ? 'Only_Admins'
    : 'All_Accounts';

  const columns = [
    { header: 'USER / VENDOR ID', key: 'id', bold: true, render: (u) => escapeXml(u.id || u.vendorId || u.rawUserId || u._id || '—') },
    { header: 'FULL NAME', key: 'name', render: (u) => escapeXml(u.name || u.fullName || '—') },
    { header: 'EMAIL ADDRESS', key: 'email', render: (u) => escapeXml(u.email || '—') },
    { header: 'CONTACT PHONE', key: 'phone', render: (u) => escapeXml(u.phone || u.phoneNumber || '—') },
    { header: 'SYSTEM ROLE', key: 'role', align: 'center', render: (u) => escapeXml(u.role || (isVendorsOnly ? 'Technician' : 'Customer')) },
    {
      header: 'ACCOUNT STATUS',
      key: 'status',
      align: 'center',
      render: (u) => {
        const s = String(u.status || 'Active');
        const sLower = s.toLowerCase();
        let cls = 'badge-completed';
        if (sLower === 'blocked') cls = 'badge-cancelled';
        else if (sLower === 'suspended') cls = 'badge-pending';
        return `<span class="${cls}">${escapeXml(s)}</span>`;
      },
    },
    { header: 'SPECIALIZATION / SERVICE', key: 'serviceType', render: (u) => escapeXml(u.serviceType || u.city || u.serviceArea || 'General') },
    { header: 'TOTAL BOOKINGS', key: 'bookings', align: 'center', render: (u) => escapeXml(String(u.bookings ?? 0)) },
    { header: 'REGISTERED / JOINED', key: 'joined', render: (u) => escapeXml(u.joined || (u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Recent')) },
  ];

  const dateTag = new Date().toISOString().slice(0, 10);
  downloadExcelWorkbook({
    filename: `MagicMistry_Live_${roleFileTag}_${dateTag}.xls`,
    title: `Magic Mistry - ${roleLabel} Roster`,
    subtitle: `Total Active Database Accounts: ${filtered.length}${rf !== 'all' ? ` | Category Filter: ${roleLabel}` : ''}`,
    columns,
    data: filtered,
  });

  return filtered.length;
}

/**
 * 6. REAL VENDOR APPLICATIONS EXCEL EXPORT
 */
export function exportRealApplicationsExcel({
  applicationsList = [],
  fromDate = '',
  toDate = '',
}) {
  const safeList = Array.isArray(applicationsList) ? applicationsList : [];
  const filtered = safeList.filter((app) => {
    if (!app) return false;
    const rawDate = app.date || app.createdAt;
    return isDateInRange(rawDate, fromDate, toDate);
  });

  const columns = [
    {
      header: 'APPLICATION ID',
      key: 'id',
      bold: true,
      render: (a) => escapeXml(typeof a.id === 'object' ? a.id?._id || a.id?.id : a.id || a.applicationId || a._id || '—'),
    },
    {
      header: 'APPLICANT NAME',
      key: 'name',
      render: (a) => escapeXml(a.name || a.fullName || a.applicantName || '—'),
    },
    {
      header: 'CONTACT PHONE',
      key: 'phone',
      render: (a) => escapeXml(a.phone || a.phoneNumber || a.contactNumber || '—'),
    },
    {
      header: 'EMAIL ADDRESS',
      key: 'email',
      render: (a) => escapeXml(a.email || '—'),
    },
    {
      header: 'SPECIALIZATION',
      key: 'service',
      render: (a) => escapeXml(a.service || a.serviceType || a.specialization || 'General Appliance Repair'),
    },
    {
      header: 'EXPERIENCE',
      key: 'experience',
      render: (a) => escapeXml(a.experience || a.yearsOfExperience || (a.experienceYears ? `${a.experienceYears} Years` : '—')),
    },
    {
      header: 'OPERATING CITY',
      key: 'city',
      render: (a) => escapeXml(a.city || a.serviceArea || a.operatingCity || '—'),
    },
    {
      header: 'STATUS',
      key: 'status',
      align: 'center',
      render: (a) => {
        const s = String(a.status || a.applicationStatus || 'Pending');
        let cls = 'badge-pending';
        if (s.toLowerCase() === 'approved') cls = 'badge-completed';
        else if (s.toLowerCase() === 'rejected') cls = 'badge-cancelled';
        return `<span class="${cls}">${escapeXml(s)}</span>`;
      },
    },
    {
      header: 'VENDOR ID ISSUED',
      key: 'vendorId',
      render: (a) => escapeXml(a.vendorId || a.vendor?.vendorId || 'Not Generated'),
    },
    {
      header: 'SUBMISSION DATE',
      key: 'date',
      render: (a) => escapeXml(a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : 'Recent')),
    },
  ];

  const dateTag = new Date().toISOString().slice(0, 10);
  downloadExcelWorkbook({
    filename: `MagicMistry_Live_Applications_${dateTag}.xls`,
    title: 'Magic Mistry - Technician Partner Application Submissions',
    subtitle: `Total Registrations: ${filtered.length}`,
    columns,
    data: filtered,
  });

  return filtered.length;
}
