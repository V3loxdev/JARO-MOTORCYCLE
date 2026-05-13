/* Dashboard JS (Admin modules + switching) */

// NOTE: This app.js assumes same IDs/structure as dashboard/index.html.

const LS = {
  inventory: 'balasan_moto_db',
  sales: 'balasan_moto_sales_db',
  employees: 'balasan_moto_employees_db',
  payroll: 'balasan_moto_payroll_db',
  installments: 'balasan_moto_installments_db'
};

const initialUnits = [
  { id: 1, name: 'Sidlak 125i', price: '₱75,000', dp: '₱3,500', status: 'Available' },
  { id: 2, name: 'Harabas 150', price: '₱82,000', dp: '₱5,000', status: 'Available' },
  { id: 3, name: 'Alon 160 ABS', price: '₱125,000', dp: '₱8,000', status: 'Available' },
  { id: 4, name: 'Banyos 110', price: '₱55,000', dp: '₱2,500', status: 'Available' },
  { id: 5, name: 'Kusog 200', price: '₱140,000', dp: '₱12,000', status: 'Available' },
  { id: 6, name: 'Layag 150', price: '₱95,000', dp: '₱6,500', status: 'Available' },
  { id: 7, name: 'Hiraya 125', price: '₱68,000', dp: '₱4,000', status: 'Available' }
];

function initLocalStorage() {
  if (!localStorage.getItem(LS.inventory)) {
    localStorage.setItem(LS.inventory, JSON.stringify(initialUnits));
  }
  if (!localStorage.getItem(LS.sales)) {
    localStorage.setItem(LS.sales, JSON.stringify([]));
  }
  if (!localStorage.getItem(LS.employees)) {
    localStorage.setItem(LS.employees, JSON.stringify([]));
  }
  if (!localStorage.getItem(LS.payroll)) {
    localStorage.setItem(LS.payroll, JSON.stringify([]));
  }
  if (!localStorage.getItem(LS.installments)) {
    localStorage.setItem(LS.installments, JSON.stringify([]));
  }
}

initLocalStorage();

function moneyToNumber(input) {
  if (input === null || input === undefined) return 0;
  const s = String(input).replace(/[₱,\s]/g, '').trim();
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return '₱' + num.toLocaleString();
}

function getInventory() {
  return JSON.parse(localStorage.getItem(LS.inventory) || '[]');
}
function setInventory(db) {
  localStorage.setItem(LS.inventory, JSON.stringify(db));
}

function getSales() {
  return JSON.parse(localStorage.getItem(LS.sales) || '[]');
}
function setSales(db) {
  localStorage.setItem(LS.sales, JSON.stringify(db));
}

function getEmployees() {
  return JSON.parse(localStorage.getItem(LS.employees) || '[]');
}
function setEmployees(db) {
  localStorage.setItem(LS.employees, JSON.stringify(db));
}

function getPayroll() {
  return JSON.parse(localStorage.getItem(LS.payroll) || '[]');
}
function setPayroll(db) {
  localStorage.setItem(LS.payroll, JSON.stringify(db));
}

function getInstallmentsPlans() {
  return JSON.parse(localStorage.getItem(LS.installments) || '[]');
}
function setInstallmentsPlans(db) {
  localStorage.setItem(LS.installments, JSON.stringify(db));
}

function showToast(msg) {
  alert(msg);
}

// ---------------------
// Admin switching
// ---------------------

function setAdminModule(moduleName) {
  document.querySelectorAll('.admin-module').forEach((s) => s.classList.add('hidden'));

  const moduleEl = document.getElementById('module-' + moduleName);
  if (moduleEl) moduleEl.classList.remove('hidden');

  // Update active tab styling (best-effort; if element not present, skip)
  const tabs = [
    'inventory',
    'sales',
    'installments',
    'employees',
    'payroll'
  ];

  tabs.forEach((t) => {
    const el = document.getElementById('tab-' + t);
    if (!el) return;
    if (t === moduleName) {
      el.className = 'admin-tab bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-orange-500 transition';
    } else {
      el.className = 'admin-tab bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-orange-500 transition';
    }
  });

  render();
}

// Expose for inline onclick
window.setAdminModule = setAdminModule;

// ---------------------
// Inventory module
// ---------------------

function openInventoryAdd() {
  document.getElementById('inventory-add-card')?.classList.remove('hidden');
}

function closeInventoryAdd() {
  const card = document.getElementById('inventory-add-card');
  if (card) card.classList.add('hidden');

  const nameEl = document.getElementById('inv-form-name');
  const priceEl = document.getElementById('inv-form-price');
  const dpEl = document.getElementById('inv-form-dp');
  const statusEl = document.getElementById('inv-form-status');

  if (nameEl) nameEl.value = '';
  if (priceEl) priceEl.value = '';
  if (dpEl) dpEl.value = '';
  if (statusEl) statusEl.value = 'Available';
}

function saveInventoryUnit() {
  const name = document.getElementById('inv-form-name')?.value?.trim();
  const price = document.getElementById('inv-form-price')?.value;
  const dp = document.getElementById('inv-form-dp')?.value;
  const status = document.getElementById('inv-form-status')?.value;

  if (!name) return showToast('Model name is required.');
  if (!price || Number(price) <= 0) return showToast('Cash price is required.');
  if (!dp || Number(dp) < 0) return showToast('DP is required.');

  const db = getInventory();
  const nextId = db.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;

  db.push({
    id: nextId,
    name,
    price: formatMoney(price),
    dp: formatMoney(dp),
    status
  });

  setInventory(db);
  closeInventoryAdd();
  render();
}

window.openInventoryAdd = openInventoryAdd;
window.closeInventoryAdd = closeInventoryAdd;
window.saveInventoryUnit = saveInventoryUnit;

window.setAvailability = function (id, newStatus) {
  const db = getInventory();
  const i = db.findIndex((x) => String(x.id) === String(id));
  if (i === -1) return;

  const normalizedNew = newStatus;
  if (confirm('Set ' + db[i].name + ' as ' + normalizedNew + '?')) {
    db[i].status = normalizedNew;
    setInventory(db);
    render();
  }
};

// ---------------------
// Sales module
// ---------------------

function renderSalesUnitDropdown() {
  const select = document.getElementById('sale-form-unit');
  if (!select) return;

  const inv = getInventory();
  const available = inv.filter((u) => u.status === 'Available');

  select.innerHTML = '';
  if (available.length === 0) {
    select.innerHTML = '<option value="">No available units</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  available.forEach((u) => {
    const opt = document.createElement('option');
    opt.value = String(u.id);
    opt.textContent = u.name + ' (' + u.price + ')';
    select.appendChild(opt);
  });
}

function closeReceiptModal() {
  document.getElementById('receipt-modal')?.classList.add('hidden');
}

window.closeReceiptModal = closeReceiptModal;

window.viewReceiptBySaleId = function (saleId) {
  const salesDb = getSales();
  const sale = salesDb.find((s) => String(s.saleId) === String(saleId));
  if (!sale) return alert('Receipt/sale not found.');

  const unitName = sale.unitName || '(No Unit)';
  const customerName = sale.customer?.name || '(No Customer Name)';
  const paymentType = sale.paymentType || '';

  const receiptNo = sale.receiptId || '';
  const receiptDateStr = sale.soldAt ? new Date(sale.soldAt).toLocaleString() : '';

  const receiptItemsHtml = `
    <div>
      <div>${unitName}</div>
      <div>${sale.price || ''}</div>
    </div>
  `;

  const elDate = document.getElementById('receipt-date');
  const elItems = document.getElementById('receipt-items');
  const elTotal = document.getElementById('receipt-total');
  const elNo = document.getElementById('receipt-no');
  const elCustomer = document.getElementById('receipt-customer');
  const elPayment = document.getElementById('receipt-payment');

  if (elDate) elDate.textContent = receiptDateStr;
  if (elItems) elItems.innerHTML = receiptItemsHtml;
  if (elTotal) elTotal.innerHTML = `<span>Total</span><span>${sale.total || ''}</span>`;
  if (elNo) elNo.textContent = receiptNo;
  if (elCustomer) elCustomer.textContent = customerName;
  if (elPayment) elPayment.textContent = paymentType;

  document.getElementById('receipt-modal')?.classList.remove('hidden');
};

window.saveDeal = function () {
  const unitId = document.getElementById('sale-form-unit')?.value;
  const price = document.getElementById('sale-form-price')?.value;
  const dp = document.getElementById('sale-form-dp')?.value;
  const paymentType = document.getElementById('sale-form-payment-type')?.value || 'Installment';

  const termMonthsEl = document.getElementById('sale-form-installment-term-months');
  const termMonths = termMonthsEl ? Number(termMonthsEl.value) : 0;

  const customerName = document.getElementById('sale-form-customer-name')?.value?.trim() || '';
  const customerContact = document.getElementById('sale-form-customer-contact')?.value?.trim() || '';
  const customerAddress = document.getElementById('sale-form-customer-address')?.value?.trim() || '';

  if (!unitId) return alert('Select a unit.');
  if (!price || Number(price) <= 0) return alert('Cash price is required.');

  const dpNum = Number(dp) || 0;

  if (paymentType === 'Installment') {
    if (!dp || Number(dp) < 0) return alert('DP is required for installment.');
    if (!termMonths || Number(termMonths) <= 0) return alert('Installment term (months) is required for installment.');
  }

  const inv = getInventory();
  const idx = inv.findIndex((u) => String(u.id) === String(unitId));
  if (idx === -1) return alert('Unit not found.');
  if (inv[idx].status !== 'Available') return alert('Selected unit is not available.');

  const totalNum = Number(price);
  const receiptId = 'RCPT-' + String(Date.now());
  const doneAt = new Date().toISOString();

  const salesDb = getSales();
  const nextSaleId = salesDb.reduce((m, x) => Math.max(m, Number(x.saleId) || 0), 0) + 1;

  const saleRecord = {
    saleId: nextSaleId,
    receiptId,
    dealStatus: 'DONE',
    doneAt,

    paymentType,
    customer: {
      name: customerName || null,
      contact: customerContact || null,
      address: customerAddress || null
    },

    unitId: inv[idx].id,
    unitName: inv[idx].name,

    price: formatMoney(totalNum),
    dp: formatMoney(paymentType === 'Installment' ? dpNum : 0),
    total: formatMoney(totalNum),

    soldAt: doneAt,
    createdAt: new Date().toISOString()
  };

  salesDb.push(saleRecord);
  setSales(salesDb);

  if (paymentType === 'Installment') {
    const expectedMonthly = termMonths > 0 ? (totalNum - dpNum) / termMonths : 0;
    const plans = getInstallmentsPlans();
    const planId = 'IP-' + String(Date.now());

    plans.push({
      planId,
      saleId: nextSaleId,
      customer: { name: customerName || null, contact: customerContact || null, address: customerAddress || null },
      unitId: inv[idx].id,
      unitName: inv[idx].name,
      totalNum,
      dpNum,
      termMonths: Number(termMonths),
      monthlyAmountNum: expectedMonthly,
      saleDoneAtISO: doneAt,
      payments: [],
      createdAt: new Date().toISOString()
    });

    setInstallmentsPlans(plans);
  }

  inv[idx].status = 'Unavailable';
  setInventory(inv);

  const receiptDateStr = new Date(doneAt).toLocaleString();
  const receiptTotalStr = formatMoney(totalNum);
  const receiptDpStr = formatMoney(paymentType === 'Installment' ? dpNum : 0);

  const rcpt = {
    'receipt-date': receiptDateStr,
    'receipt-items': `<div><div>${inv[idx].name}</div><div>₱${totalNum}</div></div>`,
    'receipt-total': `<span>Total</span><span>${receiptTotalStr}</span>`,
    'receipt-no': receiptId,
    'receipt-customer': customerName || '(No Customer Name)',
    'receipt-payment': paymentType + (paymentType === 'Installment' ? ` (DP: ${receiptDpStr})` : '')
  };

  Object.entries(rcpt).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'receipt-total' || id === 'receipt-items') el.innerHTML = val;
    else el.textContent = val;
  });

  document.getElementById('receipt-modal')?.classList.remove('hidden');

  document.getElementById('sale-form-price').value = '';
  document.getElementById('sale-form-dp').value = '';
  const n = document.getElementById('sale-form-customer-name');
  const c = document.getElementById('sale-form-customer-contact');
  const a = document.getElementById('sale-form-customer-address');
  if (n) n.value = '';
  if (c) c.value = '';
  if (a) a.value = '';

  render();
};

// ---------------------
// Employees module
// ---------------------

window.saveEmployee = function () {
  const editId = document.getElementById('emp-form-edit-id')?.value;
  const name = document.getElementById('emp-form-name')?.value?.trim();
  const role = document.getElementById('emp-form-role')?.value?.trim();
  const contact = document.getElementById('emp-form-contact')?.value?.trim();
  const baseSalary = document.getElementById('emp-form-base-salary')?.value;
  const status = document.getElementById('emp-form-status')?.value;

  if (!name) return alert('Employee name is required.');
  if (!role) return alert('Role is required.');
  if (!baseSalary || Number(baseSalary) < 0) return alert('Base salary is required.');

  const db = getEmployees();

  if (editId) {
    const i = db.findIndex((e) => String(e.empId) === String(editId));
    if (i === -1) return alert('Employee not found.');
    db[i] = {
      ...db[i],
      fullName: name,
      role,
      contact: contact || null,
      baseSalary: Number(baseSalary),
      status
    };
  } else {
    const empId = db.reduce((m, x) => Math.max(m, Number(x.empId) || 0), 0) + 1;
    db.push({
      empId,
      fullName: name,
      role,
      contact: contact || null,
      baseSalary: Number(baseSalary),
      status,
      createdAt: new Date().toISOString()
    });
  }

  setEmployees(db);
  resetEmployeeForm();
  render();
};

window.resetEmployeeForm = function () {
  document.getElementById('emp-form-edit-id').value = '';
  document.getElementById('emp-form-name').value = '';
  document.getElementById('emp-form-role').value = '';
  document.getElementById('emp-form-contact').value = '';
  document.getElementById('emp-form-base-salary').value = '';
  document.getElementById('emp-form-status').value = 'Active';
};

window.editEmployee = function (empId) {
  const db = getEmployees();
  const emp = db.find((e) => String(e.empId) === String(empId));
  if (!emp) return;

  document.getElementById('emp-form-edit-id').value = emp.empId;
  document.getElementById('emp-form-name').value = emp.fullName || '';
  document.getElementById('emp-form-role').value = emp.role || '';
  document.getElementById('emp-form-contact').value = emp.contact || '';
  document.getElementById('emp-form-base-salary').value = emp.baseSalary ?? '';
  document.getElementById('emp-form-status').value = emp.status || 'Active';

  document.getElementById('module-employees')?.classList.remove('hidden');
};

window.toggleEmployeeStatus = function (empId) {
  const db = getEmployees();
  const i = db.findIndex((e) => String(e.empId) === String(empId));
  if (i === -1) return;

  const next = db[i].status === 'Active' ? 'Inactive' : 'Active';
  if (confirm('Set ' + db[i].fullName + ' as ' + next + '?')) {
    db[i].status = next;
    setEmployees(db);
    render();
  }
};

// ---------------------
// Payroll module
// ---------------------

window.generatePayroll = function () {
  const period = document.getElementById('payroll-form-period')?.value;
  if (!period) return alert('Select a period (month).');

  const employees = getEmployees().filter((e) => e.status === 'Active');
  if (employees.length === 0) return alert('No active employees.');

  const payrollDb = getPayroll();
  const existingForPeriod = payrollDb.filter((p) => p.period === period);
  if (existingForPeriod.length > 0 && !confirm('Payroll for this period already exists. Replace it?')) return;

  const remaining = payrollDb.filter((p) => p.period !== period);

  const newEntries = employees.map((e) => {
    const gross = Number(e.baseSalary) || 0;
    const deductions = 0;
    const net = gross - deductions;

    return {
      payrollId: (Math.random() * 1e9) | 0,
      empId: e.empId,
      employeeName: e.fullName,
      period,
      grossPay: formatMoney(gross),
      deductions: formatMoney(deductions),
      netPay: formatMoney(net),
      paidAt: null,
      createdAt: new Date().toISOString(),
      notes: null
    };
  });

  setPayroll(remaining.concat(newEntries));
  render();
};

window.clearPayrollPeriod = function () {
  const period = document.getElementById('payroll-form-period')?.value;
  if (!period) return alert('Select a period first.');
  if (!confirm('Clear payroll records for ' + period + '?')) return;

  setPayroll(getPayroll().filter((p) => p.period !== period));
  render();
};

function renderPayrollPeriodFilter() {
  const filter = document.getElementById('payroll-filter-period');
  if (!filter) return;

  const payroll = getPayroll();
  const periods = Array.from(new Set(payroll.map((p) => p.period))).sort().reverse();

  filter.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = 'ALL';
  allOpt.textContent = 'All Periods';
  filter.appendChild(allOpt);

  periods.forEach((per) => {
    const opt = document.createElement('option');
    opt.value = per;
    opt.textContent = per;
    filter.appendChild(opt);
  });

  filter.value = periods.length > 0 ? periods[0] : 'ALL';
}

function renderPayrollTable() {
  const table = document.getElementById('payroll-table');
  if (!table) return;

  const payroll = getPayroll();
  const filter = document.getElementById('payroll-filter-period');
  const selected = filter ? filter.value : 'ALL';

  const rows = selected === 'ALL' ? payroll : payroll.filter((p) => p.period === selected);

  table.innerHTML = '';
  if (rows.length === 0) {
    table.innerHTML = '<tr><td class="p-4" colspan="5"><span class="text-sm text-gray-500">No payroll records yet.</span></td></tr>';
    return;
  }

  rows
    .slice()
    .sort((a, b) => (a.period < b.period ? 1 : -1))
    .forEach((p) => {
      table.innerHTML += `
        <tr class="border-b hover:bg-gray-50">
          <td class="p-4 text-xs font-bold text-gray-700">${p.period}</td>
          <td class="p-4 font-bold text-blue-900">${p.employeeName}</td>
          <td class="p-4 text-xs font-bold text-gray-600">${p.grossPay}</td>
          <td class="p-4 text-xs font-bold text-gray-600">${p.deductions}</td>
          <td class="p-4 text-xs font-black text-green-700">${p.netPay}</td>
        </tr>
      `;
    });
}

// ---------------------
// Installments module (kept minimal but functional)
// ---------------------

function pad2(n) {
  return String(n).padStart(2, '0');
}
function toMonthKey(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1);
}
function addMonthsToDate(dateISO, monthsToAdd) {
  const d = new Date(dateISO);
  const target = new Date(d.getTime());
  target.setMonth(target.getMonth() + monthsToAdd);
  return target;
}

function getDueDateForMonth(saleDoneAtISO, forMonthKey) {
  const [yyyyS, mmS] = String(forMonthKey).split('-');
  const yyyy = Number(yyyyS);
  const mm = Number(mmS) - 1;

  const saleD = new Date(saleDoneAtISO);
  const day = saleD.getDate();

  const due = new Date(yyyy, mm, day, 0, 0, 0, 0);
  if (due.getMonth() !== mm) {
    return new Date(yyyy, mm + 1, 0, 0, 0, 0, 0);
  }
  return due;
}

function moneyMaybe(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function renderInstallmentsTable() {
  const table = document.getElementById('installments-table');
  if (!table) return;

  const plans = getInstallmentsPlans();
  const now = new Date();
  const thisMonthKey = toMonthKey(now);

  const rows = plans.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  table.innerHTML = '';

  if (rows.length === 0) {
    table.innerHTML = '<tr><td class="p-4 text-center text-sm text-gray-500" colspan="7">No installment plans yet.</td></tr>';
    return;
  }

  rows.forEach((p) => {
    const dueDate = getDueDateForMonth(p.saleDoneAtISO, thisMonthKey);
    const dueDateStr = dueDate ? dueDate.toLocaleDateString() : '';

    const paymentForMonth = (p.payments || []).find((x) => String(x.forMonth) === String(thisMonthKey));
    const paidAtISO = paymentForMonth ? paymentForMonth.paidAtISO : null;
    const paidDateStr = paidAtISO ? new Date(paidAtISO).toLocaleDateString() : '';

    const today = new Date();
    const dueTime = dueDate.getTime();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    let status = 'DUE';
    let statusColor = 'bg-yellow-100 text-yellow-800';

    if (paymentForMonth) {
      const paidTime = new Date(paidAtISO).getTime();
      status = paidTime > dueTime ? 'LATE PAID' : 'PAID';
      statusColor = paidTime > dueTime ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    } else {
      status = todayTime > dueTime ? 'DELAYED' : 'DUE';
      statusColor = todayTime > dueTime ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
    }

    const endDate = addMonthsToDate(p.saleDoneAtISO, p.termMonths - 1);
    const endDateStr = endDate ? endDate.toLocaleDateString() : '';

    table.innerHTML += `
      <tr class="border-b hover:bg-gray-50">
        <td class="p-4 font-bold text-blue-900">${p.customer?.name || '(No Customer)'}</td>
        <td class="p-4 text-xs font-bold text-gray-600">${p.unitName || '(No Unit)'}</td>
        <td class="p-4"><span class="text-[10px] font-black px-2 py-1 rounded ${statusColor}">${status}</span></td>
        <td class="p-4 text-xs font-bold text-gray-600">${dueDateStr}</td>
        <td class="p-4 text-xs font-bold text-gray-600">${paidDateStr || '-'}</td>
        <td class="p-4 text-xs font-bold text-gray-600">${endDateStr}</td>
        <td class="p-4 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="openInstallmentProfileModal('${p.planId}')" class="bg-gray-200 text-gray-800 text-[10px] px-3 py-1 rounded font-bold">View Profile</button>
            <button onclick="openInstallmentPaymentModal('${p.planId}', '${thisMonthKey}')" class="bg-blue-600 text-white text-[10px] px-3 py-1 rounded font-bold">Record Payment</button>
          </div>
        </td>
      </tr>
    `;
  });
}

window.openInstallmentPaymentModal = function (planId, forMonthKey) {
  const plans = getInstallmentsPlans();
  const plan = plans.find((x) => String(x.planId) === String(planId));
  if (!plan) return alert('Installment plan not found.');

  const dueDate = getDueDateForMonth(plan.saleDoneAtISO, forMonthKey);

  document.getElementById('installment-payment-modal')?.classList.remove('hidden');

  document.getElementById('ipm-customer').textContent = plan.customer?.name || '(No Customer)';
  document.getElementById('ipm-unit').textContent = plan.unitName || '(No Unit)';
  document.getElementById('ipm-for-month').textContent = forMonthKey;
  document.getElementById('ipm-expected').textContent = formatMoney(plan.monthlyAmountNum);
  document.getElementById('ipm-due-date').textContent = dueDate.toLocaleDateString();

  document.getElementById('ipm-amount').value = moneyMaybe(plan.monthlyAmountNum);

  const todayISO = new Date();
  const yyyy = todayISO.getFullYear();
  const mm = pad2(todayISO.getMonth() + 1);
  const dd = pad2(todayISO.getDate());
  document.getElementById('ipm-paid-at').value = `${yyyy}-${mm}-${dd}`;

  window.__ipm_ctx = { planId, forMonthKey };
};

window.closeInstallmentPaymentModal = function () {
  document.getElementById('installment-payment-modal')?.classList.add('hidden');
  window.__ipm_ctx = null;
};

function recordInstallmentPayment(planId, forMonth, amountNum, paidAtISO) {
  const plans = getInstallmentsPlans();
  const idx = plans.findIndex((x) => String(x.planId) === String(planId));
  if (idx === -1) return alert('Installment plan not found.');

  const plan = plans[idx];
  if (!plan.payments) plan.payments = [];

  const existingIdx = plan.payments.findIndex((x) => String(x.forMonth) === String(forMonth));
  const event = { forMonth, amountNum, paidAtISO };

  if (existingIdx >= 0) plan.payments[existingIdx] = event;
  else plan.payments.push(event);

  plans[idx] = plan;
  setInstallmentsPlans(plans);
}

window.submitInstallmentPayment = function () {
  const ctx = window.__ipm_ctx;
  if (!ctx) return;

  const amount = Number(document.getElementById('ipm-amount').value);
  if (!Number.isFinite(amount) || amount <= 0) return alert('Enter a valid payment amount.');

  const paidAtDateStr = document.getElementById('ipm-paid-at').value;
  if (!paidAtDateStr) return alert('Paid date is required.');

  const paidAtISO = new Date(paidAtDateStr + 'T00:00:00').toISOString();

  recordInstallmentPayment(ctx.planId, ctx.forMonthKey, amount, paidAtISO);
  window.closeInstallmentPaymentModal();
  renderInstallmentsTable();
};

// Profile modal (kept simple)
window.openInstallmentProfileModal = function (planId) {
  const plans = getInstallmentsPlans();
  const plan = plans.find((x) => String(x.planId) === String(planId));
  if (!plan) return alert('Installment plan not found.');

  document.getElementById('installment-profile-modal')?.classList.remove('hidden');

  window.__iprof_planId = planId;

  document.getElementById('iprof-customer').textContent = plan.customer?.name || '(No Customer)';
  document.getElementById('iprof-unit').textContent = plan.unitName || '(No Unit)';
  document.getElementById('iprof-term').textContent = String(plan.termMonths || 0);
  document.getElementById('iprof-monthly').textContent = formatMoney(plan.monthlyAmountNum);

  const termMonths = Number(plan.termMonths) || 0;
  const saleDoneAtISO = plan.saleDoneAtISO;
  const saleD = new Date(saleDoneAtISO);

  const monthsKeys = [];
  for (let i = 0; i < termMonths; i++) {
    const d = new Date(saleD.getFullYear(), saleD.getMonth() + i, 1);
    monthsKeys.push(toMonthKey(d));
  }

  const paidByMonth = new Map();
  (plan.payments || []).forEach((evt) => {
    if (!evt || !evt.forMonth) return;
    paidByMonth.set(String(evt.forMonth), evt);
  });

  const paidCount = monthsKeys.filter((mk) => paidByMonth.has(String(mk))).length;
  document.getElementById('iprof-paid-summary').textContent = paidCount + ' / ' + termMonths + ' paid';

  const tbody = document.getElementById('iprof-months-body');
  if (tbody) {
    tbody.innerHTML = '';
    monthsKeys.forEach((mk) => {
      const payment = paidByMonth.get(String(mk));
      const paidAtISO = payment?.paidAtISO || null;
      const paidDateStr = paidAtISO ? new Date(paidAtISO).toLocaleDateString() : '';
      const isPaid = !!payment;
      const statusColor = isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
      const status = isPaid ? 'PAID' : 'UNPAID';

      tbody.innerHTML += `
        <tr class="border-b hover:bg-gray-50">
          <td class="p-3 text-xs font-bold text-gray-700">${mk}</td>
          <td class="p-3"><span class="text-[10px] font-black px-2 py-1 rounded ${statusColor}">${status}</span></td>
          <td class="p-3 text-xs font-bold text-gray-600">${paidDateStr || '-'}</td>
        </tr>
      `;
    });
  }

  const remaining = termMonths - paidCount;
  document.getElementById('iprof-remaining-hint').textContent = remaining > 0 ? remaining + ' months remaining' : 'All months paid.';

  const sel = document.getElementById('iprof-months-to-pay');
  if (sel) {
    sel.innerHTML = '';
    if (remaining <= 0) {
      const opt = document.createElement('option');
      opt.value = '0';
      opt.textContent = '0 (no remaining months)';
      sel.appendChild(opt);
      sel.disabled = true;
    } else {
      sel.disabled = false;
      for (let count = 1; count <= remaining; count++) {
        const opt = document.createElement('option');
        opt.value = String(count);
        opt.textContent = count + ' month(s)';
        sel.appendChild(opt);
      }
      sel.value = '1';
    }
  }
};

window.closeInstallmentProfileModal = function () {
  document.getElementById('installment-profile-modal')?.classList.add('hidden');
  window.__iprof_planId = null;
};

window.applyMonthsToPay = function () {
  const planId = window.__iprof_planId;
  if (!planId) return;

  const countSel = document.getElementById('iprof-months-to-pay');
  const count = Number(countSel?.value || 0);
  if (!Number.isFinite(count) || count <= 0) return alert('Select number of months to pay.');

  const plans = getInstallmentsPlans();
  const idx = plans.findIndex((x) => String(x.planId) === String(planId));
  if (idx === -1) return alert('Installment plan not found.');

  const plan = plans[idx];
  const termMonths = Number(plan.termMonths) || 0;
  const saleDoneAtISO = plan.saleDoneAtISO;
  const todayISO = new Date().toISOString();

  const saleD = new Date(saleDoneAtISO);
  const monthsKeys = [];
  for (let i = 0; i < termMonths; i++) {
    const d = new Date(saleD.getFullYear(), saleD.getMonth() + i, 1);
    monthsKeys.push(toMonthKey(d));
  }

  if (!plan.payments) plan.payments = [];
  const paidSet = new Set((plan.payments || []).map((p) => String(p.forMonth)));

  const unpaid = monthsKeys.filter((mk) => !paidSet.has(String(mk)));
  if (unpaid.length <= 0) return alert('No remaining unpaid months.');
  if (count > unpaid.length) return alert('Selected months exceed remaining unpaid months.');

  const amountNum = moneyMaybe(plan.monthlyAmountNum);
  for (let i = 0; i < count; i++) {
    const forMonth = unpaid[i];
    const existingIdx = plan.payments.findIndex((x) => String(x.forMonth) === String(forMonth));
    const event = { forMonth, amountNum, paidAtISO: todayISO };
    if (existingIdx >= 0) plan.payments[existingIdx] = event;
    else plan.payments.push(event);
  }

  plans[idx] = plan;
  setInstallmentsPlans(plans);

  window.closeInstallmentProfileModal();
  renderInstallmentsTable();
};

// ---------------------
// Rendering
// ---------------------

function render() {
  // Stats
  const inv = getInventory();
  const salesDb = getSales();

  const soldCount = salesDb.length;
  const stockCount = inv.filter((u) => u.status === 'Available').length;
  const revenue = salesDb.reduce((sum, s) => sum + moneyToNumber(s.total), 0);

  const soldEl = document.getElementById('stat-sold');
  const stockEl = document.getElementById('stat-stock');
  const revEl = document.getElementById('stat-revenue');
  if (soldEl) soldEl.innerText = soldCount;
  if (stockEl) stockEl.innerText = stockCount;
  if (revEl) revEl.innerText = '₱' + revenue.toLocaleString();

  // Inventory table
  const invTable = document.getElementById('admin-table-inventory');
  if (invTable) {
    invTable.innerHTML = '';
    inv.forEach((u) => {
      const normalizedStatus = u.status === 'Sold' ? 'Unavailable' : u.status;
      const isAvailable = normalizedStatus === 'Available';

      invTable.innerHTML += `
        <tr class="border-b hover:bg-gray-50">
          <td class="p-4 font-bold text-blue-900 uppercase tracking-tighter">${u.name}</td>
          <td class="p-4 text-xs font-bold text-gray-600">${u.price}</td>
          <td class="p-4">
            <span class="text-[10px] font-black px-2 py-1 rounded ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${normalizedStatus}</span>
          </td>
          <td class="p-4 text-right">
            ${isAvailable
              ? `<button onclick="setAvailability('${u.id}', 'Unavailable')" class="bg-blue-600 text-white text-[10px] px-3 py-1 rounded font-bold">SET UNAVAILABLE</button>`
              : `<button onclick="setAvailability('${u.id}', 'Available')" class="bg-green-600 text-white text-[10px] px-3 py-1 rounded font-bold">SET AVAILABLE</button>`}
          </td>
        </tr>
      `;
    });
  }

  // Sales table
  const salesTable = document.getElementById('sales-table');
  if (salesTable) {
    salesTable.innerHTML = '';
    const sorted = salesDb.slice().sort((a, b) => (a.soldAt < b.soldAt ? 1 : -1));

    if (sorted.length === 0) {
      salesTable.innerHTML = '<tr><td class="p-4" colspan="6"><span class="text-sm text-gray-500">No sales records yet.</span></td></tr>';
    } else {
      sorted.forEach((s) => {
        const d = s.soldAt ? new Date(s.soldAt) : null;
        const dateStr = d ? d.toLocaleDateString() : '';

        salesTable.innerHTML += `
          <tr class="border-b hover:bg-gray-50">
            <td class="p-4 font-bold text-blue-900">${s.unitName}</td>
            <td class="p-4 text-xs font-bold text-gray-600">${s.price}</td>
            <td class="p-4 text-xs font-bold text-gray-600">${s.dp}</td>
            <td class="p-4 text-xs font-black">${s.total}</td>
            <td class="p-4 text-xs font-bold text-gray-600">${dateStr}</td>
            <td class="p-4 text-right">
              <button onclick="viewReceiptBySaleId('${s.saleId}')" class="bg-blue-600 text-white text-[10px] px-3 py-1 rounded font-bold">View Receipt</button>
            </td>
          </tr>
        `;
      });
    }
  }

  renderSalesUnitDropdown();

  // Installments
  if (document.getElementById('installments-table')) {
    renderInstallmentsTable();
  }

  // Employees
  if (document.getElementById('employees-table')) {
    const empTable = document.getElementById('employees-table');
    const employees = getEmployees();

    empTable.innerHTML = '';
    if (employees.length === 0) {
      empTable.innerHTML = '<tr><td class="p-4" colspan="5"><span class="text-sm text-gray-500">No employees yet.</span></td></tr>';
    } else {
      employees
        .slice()
        .sort((a, b) => (a.empId < b.empId ? 1 : -1))
        .forEach((e) => {
          const statusColor = e.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

          empTable.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
              <td class="p-4 font-bold text-blue-900">${e.fullName}</td>
              <td class="p-4 text-xs font-bold text-gray-600">${e.role}</td>
              <td class="p-4 text-xs font-bold text-gray-600">${formatMoney(e.baseSalary)}</td>
              <td class="p-4"><span class="text-[10px] font-black px-2 py-1 rounded ${statusColor}">${e.status}</span></td>
              <td class="p-4 text-right">
                <div class="flex gap-2 justify-end">
                  <button onclick="editEmployee('${e.empId}')" class="bg-gray-200 text-gray-800 text-[10px] px-3 py-1 rounded font-bold">Edit</button>
                  <button onclick="toggleEmployeeStatus('${e.empId}')" class="bg-blue-600 text-white text-[10px] px-3 py-1 rounded font-bold">${e.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                </div>
              </td>
            </tr>
          `;
        });
    }
  }

  // Payroll
  if (document.getElementById('payroll-table')) {
    renderPayrollPeriodFilter();
    renderPayrollTable();

    const filterSel = document.getElementById('payroll-filter-period');
    if (filterSel && !filterSel.dataset.bound) {
      filterSel.dataset.bound = '1';
      filterSel.addEventListener('change', () => renderPayrollTable());
    }
  }
}

window.resetSystem = function () {
  if (confirm('Buharin ang lahat ng records sa database?')) {
    Object.values(LS).forEach((k) => localStorage.removeItem(k));
    location.reload();
  }
};

// default module
setAdminModule('inventory');

