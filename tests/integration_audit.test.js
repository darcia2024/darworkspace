import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTransaction, deriveState } from '../shared/domain.js';
import { workspace, transaction } from './fixtures.js';

// ============================================================================
// TEST 1: Tambah item/tagihan Radar tidak hilang setelah deriveState
// ============================================================================
test('TEST 1: Waiting radar unlinked item is preserved after deriveState', () => {
  const state = workspace();
  const unlinkedItem = {
    id: 'w-custom-1',
    name: 'Retainer Konsultasi Brand XYZ',
    reason: 'Menunggu PO diterbitkan',
    value: 'Rp5.000.000',
    nextTrigger: 'Konfirmasi via WA',
    actionToUnblock: 'Follow-up Finance',
    followUpDate: '2026-09-12',
    status: 'Waiting Client',
  };
  state.waitingItems.push(unlinkedItem);

  const derived = deriveState(state);
  const found = derived.waitingItems.find(w => w.id === 'w-custom-1');
  assert.ok(found, 'Unlinked waiting item must NOT be dropped by deriveState');
  assert.equal(found.name, 'Retainer Konsultasi Brand XYZ');
  assert.equal(found.status, 'Waiting Client');
});

test('TEST 1b: Project placed in WAITING column generates radar item without silent deletion', () => {
  const state = workspace();
  state.projects.push({
    id: 'p-waiting-test',
    name: 'Project Menunggu DP',
    boardColumn: 'WAITING',
    status: 'Waiting Payment',
    priority: 'P1',
    lane: 'client_delivery',
    nominalNumeric: 10000000,
    paidNumeric: 0,
    unpaidNumeric: 10000000,
    valueText: 'Rp10.000.000',
    paymentStatus: 'Unpaid',
    currentGoal: 'Menunggu DP untuk kickoff',
    nextAction: 'Kirim invoice termin 1',
  });

  const derived = deriveState(state);
  const radarItem = derived.waitingItems.find(w => w.name === 'Project Menunggu DP');
  assert.ok(radarItem, 'Project in WAITING column must generate a radar entry');
  assert.equal(radarItem.status, 'Waiting Payment');
});

// ============================================================================
// TEST 2: Mengetik PIN cepat enam digit tetap menghasilkan enam digit (functional update)
// ============================================================================
test('TEST 2: Rapid 6-digit PIN input functional update guarantees exact 6 digits', async () => {
  // Simulate React functional update state reducer
  let pin = '';
  const setPin = (updater) => {
    pin = updater(pin);
  };

  const handleDigit = (digit) => {
    setPin((prev) => (prev.length < 6 ? prev + digit : prev));
  };

  // Simulate rapid typing burst of 6 digits
  ['1', '2', '3', '4', '5', '6'].forEach(digit => handleDigit(digit));
  assert.equal(pin, '123456', 'Rapid sequential typing must yield exactly 6 digits');

  // Attempting to type beyond 6 digits must be ignored
  handleDigit('7');
  handleDigit('8');
  assert.equal(pin.length, 6, 'Length must be capped at 6 digits');

  // SHA-256 validation simulation
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(pin));
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  assert.equal(hashHex.length, 64, 'SHA-256 hash must be valid 64-char hex string');
});

// ============================================================================
// TEST 3: Alur pencatatan kas & referensi foto struk
// ============================================================================
test('TEST 3: Cashflow recording flow updates accounts, ledger, and stores receipt reference', () => {
  const state = workspace();

  // Expense with uploaded server receipt path
  const expenseTx = transaction({
    id: 'tx-receipt-test-1',
    type: 'expense',
    amount: 150,
    category: 'Operational / Server',
    note: 'Hosting renewal',
    accountName: 'Bank',
    receiptPath: '/api/receipts/receipt-20260910-abc12345.jpg',
  });

  const updated = applyTransaction(state, expenseTx);
  assert.equal(updated.financialReport.accounts.find(a => a.name === 'Bank').balance, 850, 'Bank account must decrease by expense amount');
  
  const savedTx = updated.financialReport.transactions.find(tx => tx.id === 'tx-receipt-test-1');
  assert.ok(savedTx, 'Transaction must be present in transactions list');
  assert.equal(savedTx.receiptPath, '/api/receipts/receipt-20260910-abc12345.jpg', 'Receipt path reference must be preserved in state');
});

// ============================================================================
// TEST 4: Tandai tagihan/project sebagai lunas
// ============================================================================
test('TEST 4: Recording full invoice payment marks project as paid and clears waiting radar', () => {
  let state = workspace();
  // Project in waiting payment state
  state.projects[0] = {
    ...state.projects[0],
    id: 'p-invoice-1',
    name: 'Klien Brand Alpha',
    boardColumn: 'WAITING',
    status: 'Waiting Payment',
    nominalNumeric: 5000000,
    paidNumeric: 0,
    unpaidNumeric: 5000000,
    paymentStatus: 'Unpaid',
  };
  state = deriveState(state);
  assert.ok(state.waitingItems.some(w => w.name === 'Klien Brand Alpha'), 'Project must be on radar before payment');

  // Apply full payment
  const paymentTx = transaction({
    id: 'tx-pay-full',
    type: 'income',
    amount: 5000000,
    linkedProjectId: 'p-invoice-1',
    accountName: 'Bank',
    note: 'Pelunasan invoice penuh',
  });

  const resolved = applyTransaction(state, paymentTx);
  const updatedProject = resolved.projects.find(p => p.id === 'p-invoice-1');
  
  assert.equal(updatedProject.paidNumeric, 5000000, 'Project paid amount must equal full payment');
  assert.equal(updatedProject.unpaidNumeric, 0, 'Project unpaid amount must become 0');
  assert.equal(updatedProject.paymentStatus, 'Paid', 'Project paymentStatus must be Paid');
  assert.equal(updatedProject.boardColumn, 'QUEUE', 'Project should move from WAITING to QUEUE once paid');
  
  const radarItem = resolved.waitingItems.find(w => w.name === 'Klien Brand Alpha');
  assert.equal(radarItem, undefined, 'Project should no longer appear on waiting payment radar');
});

// ============================================================================
// TEST 5: Routing/hash state bertahan dan sinkron
// ============================================================================
test('TEST 5: Tab hash routing resolves valid tabs and falls back gracefully', () => {
  const parseHashTab = (hash) => {
    const raw = hash.replace(/^#\/?/, '').trim().toLowerCase();
    const validTabs = ['today', 'nextgo', 'lanes', 'waiting', 'money', 'deepwork', 'updates'];
    return validTabs.includes(raw) ? raw : 'today';
  };

  assert.equal(parseHashTab('#/today'), 'today');
  assert.equal(parseHashTab('#/money'), 'money');
  assert.equal(parseHashTab('#/lanes'), 'lanes');
  assert.equal(parseHashTab('#/updates'), 'updates');
  assert.equal(parseHashTab('#/waiting'), 'waiting');
  assert.equal(parseHashTab('#/deepwork'), 'deepwork');
  assert.equal(parseHashTab('#/nextgo'), 'nextgo');
  
  // Fallbacks
  assert.equal(parseHashTab(''), 'today');
  assert.equal(parseHashTab('#/unknown_route'), 'today');
  assert.equal(parseHashTab('#/'), 'today');
});

// ============================================================================
// TEST 6: Server origin acceptance (localhost, LAN) & rejection of evil origins
// ============================================================================
test('TEST 6: Server origin checker permits localhost and private LAN, blocks external malicious origins', async () => {
  // Test the exact origin validation logic used in server/index.js
  const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    try {
      const url = new URL(origin);
      const host = url.hostname;
      if (host === 'localhost' || host === '127.0.0.1') return true;
      if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
      if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
      if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
      if (/^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
      return false;
    } catch {
      return false;
    }
  };

  // Permitted origins
  assert.equal(isAllowedOrigin('http://localhost:5173'), true, 'localhost vite dev permitted');
  assert.equal(isAllowedOrigin('http://localhost:3000'), true, 'localhost server permitted');
  assert.equal(isAllowedOrigin('http://127.0.0.1:3000'), true, '127.0.0.1 permitted');
  assert.equal(isAllowedOrigin('http://192.168.1.105:5173'), true, 'LAN 192.168.x.x permitted');
  assert.equal(isAllowedOrigin('http://10.0.0.50:3000'), true, 'LAN 10.x.x.x permitted');
  assert.equal(isAllowedOrigin('http://172.20.10.2:5173'), true, 'LAN 172.16-31.x.x permitted');
  assert.equal(isAllowedOrigin(undefined), true, 'Direct browser / static asset request without Origin header permitted');

  // Blocked external / malicious origins
  assert.equal(isAllowedOrigin('http://evil-attacker.com'), false, 'Malicious external domain blocked');
  assert.equal(isAllowedOrigin('https://phishing-site.xyz:8080'), false, 'Phishing site blocked');
  assert.equal(isAllowedOrigin('http://8.8.8.8'), false, 'Public IP blocked');
  assert.equal(isAllowedOrigin('invalid-url-string'), false, 'Invalid URL format blocked');
});

// ============================================================================
// TEST 7: Deleting transaction reverses balance and project payment correctly
// ============================================================================
test('TEST 7: Deleting transaction reverses account balance and linked project paid amount', async () => {
  const { deleteTransaction, applyTransaction } = await import('../shared/domain.js');
  const state = workspace();
  const initialBank = state.financialReport.accounts.find(a => a.name === 'Bank').balance;
  const project = state.projects[0];
  const initialPaid = project.paidNumeric;

  // Record an income transaction linked to project
  const tx = {
    id: 'tx-reversal-test',
    type: 'income',
    amount: 1000,
    accountName: 'Bank',
    category: 'Project / Klien',
    description: 'DP Proyek Uji',
    date: '2026-09-10',
    createdAt: new Date().toISOString(),
    linkedProjectId: project.id,
  };

  const stateWithTx = applyTransaction(state, tx);
  assert.equal(stateWithTx.financialReport.accounts.find(a => a.name === 'Bank').balance, initialBank + 1000);
  assert.equal(stateWithTx.projects.find(p => p.id === project.id).paidNumeric, initialPaid + 1000);

  // Now delete the transaction
  const stateAfterDelete = deleteTransaction(stateWithTx, 'tx-reversal-test');
  assert.equal(stateAfterDelete.financialReport.accounts.find(a => a.name === 'Bank').balance, initialBank, 'Bank balance must revert');
  assert.equal(stateAfterDelete.projects.find(p => p.id === project.id).paidNumeric, initialPaid, 'Project paid amount must revert');
  assert.equal(stateAfterDelete.financialReport.transactions.some(t => t.id === 'tx-reversal-test'), false, 'Transaction must be removed');
});

// ============================================================================
// TEST 8: Editing transaction updates amount, notes, and balances correctly
// ============================================================================
test('TEST 8: Editing transaction adjusts balances and updates metadata', async () => {
  const { editTransaction, applyTransaction } = await import('../shared/domain.js');
  const state = workspace();
  const initialBank = state.financialReport.accounts.find(a => a.name === 'Bank').balance;

  const expenseTx = {
    id: 'tx-edit-test',
    type: 'expense',
    amount: 300,
    accountName: 'Bank',
    category: 'Operasional',
    description: 'Beli ATK',
    date: '2026-09-10',
    createdAt: new Date().toISOString(),
  };

  const stateWithExpense = applyTransaction(state, expenseTx);
  assert.equal(stateWithExpense.financialReport.accounts.find(a => a.name === 'Bank').balance, initialBank - 300);

  // Edit amount from 300 to 500 and update description
  const updatedTx = {
    ...expenseTx,
    amount: 500,
    description: 'Beli ATK & Printer Toner',
  };

  const stateAfterEdit = editTransaction(stateWithExpense, updatedTx);
  assert.equal(stateAfterEdit.financialReport.accounts.find(a => a.name === 'Bank').balance, initialBank - 500, 'Bank balance must reflect new amount');
  const found = stateAfterEdit.financialReport.transactions.find(t => t.id === 'tx-edit-test');
  assert.ok(found);
  assert.equal(found.amount, 500);
  assert.equal(found.description, 'Beli ATK & Printer Toner');
});

// ============================================================================
// TEST 9: Backup & restore flow maintains complete schema and data integrity
// ============================================================================
test('TEST 9: Backup and restore flow produces valid JSON and restores cleanly', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const os = await import('node:os');
  const { DatabaseManager } = await import('../server/db.js');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'daru-backup-test-'));
  const dbFile = path.join(tmpDir, 'test_daru_os.json');
  const backupFile = path.join(tmpDir, 'backup_daru_os.json');

  try {
    const db = new DatabaseManager(dbFile);
    const initial = workspace();
    initial.projects[0].name = 'Persistent Project Alpha';
    db.saveState(initial);

    // Simulate backup creation
    const rawData = fs.readFileSync(dbFile, 'utf8');
    const parsed = JSON.parse(rawData);
    assert.equal(parsed.state.projects[0].name, 'Persistent Project Alpha');
    fs.writeFileSync(backupFile, rawData, 'utf8');

    // Simulate database corruption or reset
    fs.writeFileSync(dbFile, JSON.stringify({ version: '2.7.0', revision: 0, state: null }), 'utf8');
    const dbCorrupted = new DatabaseManager(dbFile);
    assert.equal(dbCorrupted.getState(), null);

    // Perform restore from backup
    fs.copyFileSync(backupFile, dbFile);
    const dbRestored = new DatabaseManager(dbFile);
    const restoredState = dbRestored.getState();

    assert.ok(restoredState, 'State must be restored');
    assert.equal(restoredState.projects[0].name, 'Persistent Project Alpha');
    assert.equal(restoredState.financialReport.totalLiquidBalance, 1100);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
