export function workspace() {
  return {
    projects: [{ id: 'p1', name: 'Client', lane: 'client_delivery', boardColumn: 'WAITING', status: 'Waiting Payment', paymentStatus: 'Expected', nominalNumeric: 1000, paidNumeric: 0, unpaidNumeric: 1000, valueText: 'Rp1.000', priority: 'P1', currentGoal: 'Delivery', nextAction: 'Konfirmasi DP' }],
    todayBlocks: [{ id: 'b1', projectId: 'p1', projectName: 'Client', action: 'Delivery', blockType: 'Deep Work 1', timeboxMinutes: 25, isDone: false, rule: 'Focus' }],
    todayPursuit: [{ id: 't1', projectId: 'p1', project: 'Client', action: 'Delivery', isDone: false }],
    waitingItems: [], quickStats: {}, invoices: [],
    financialReport: {
      accounts: [{ name: 'Bank', balance: 1000, type: 'bank' }, { name: 'Cash', balance: 100, type: 'cash' }],
      transactions: [], trajectory: [], monthlyExpenses: [], hardFloor: 1000, estimatedRealBurn: 300, fixedMonthlyBurn: 0, monthlyIncomeTarget: 1000,
    },
  };
}
export function transaction(overrides = {}) {
  return { id: 'tx1', type: 'income', amount: 100, accountName: 'Bank', date: '2026-09-07', createdAt: '2026-09-07T08:00:00.000Z', category: 'Project', description: 'Pembayaran', ...overrides };
}
