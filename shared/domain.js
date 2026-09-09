const waitingStatuses = new Set(['Waiting Kickoff', 'Waiting Payment', 'Waiting Approval', 'Waiting Client']);
const nameKey = (name) => String(name || '').trim().toLowerCase();

export function projectIdFor(item, projects) {
  if (item.projectId) return item.projectId;
  const byId = projects.find((p) => item.id === `w-${p.id}`);
  if (byId) return byId.id;
  const matches = projects.filter((p) => nameKey(p.name) === nameKey(item.name || item.project || item.projectName));
  return matches.length === 1 ? matches[0].id : undefined;
}

export function deriveState(state) {
  const projects = state.projects.map((p) => ({
    ...p,
    unpaidNumeric: Math.max(0, p.nominalNumeric - p.paidNumeric),
    status: p.boardColumn === 'WAITING'
      ? (waitingStatuses.has(p.status) ? p.status : 'Waiting Client')
      : ({ DOING: 'Doing', QUEUE: 'Queue', PARKED: 'Parked', DONE: 'Done' }[p.boardColumn] || p.status),
  }));
  const waitingItems = state.waitingItems.map((item) => ({ ...item, projectId: projectIdFor(item, projects) }))
    .filter((item) => !item.projectId);
  for (const project of projects.filter((p) => p.boardColumn === 'WAITING')) {
    const existing = state.waitingItems.find((item) => projectIdFor(item, projects) === project.id);
    waitingItems.push({
      id: existing?.id || `w-${project.id}`,
      projectId: project.id,
      name: project.name,
      reason: project.blocker || existing?.reason || project.nextAction || 'Menunggu respons',
      value: project.valueText,
      nextTrigger: existing?.nextTrigger || 'Konfirmasi dari klien',
      actionToUnblock: project.nextAction || existing?.actionToUnblock || 'Follow-up klien',
      followUpDate: project.followUpDeadline || existing?.followUpDate || 'Hari ini',
      status: project.status,
    });
  }
  const report = state.financialReport;
  const totalLiquidBalance = report.accounts.reduce((sum, account) => sum + account.balance, 0);
  const runwayMonths = report.estimatedRealBurn > 0 ? Math.max(0, totalLiquidBalance / report.estimatedRealBurn) : 0;
  return {
    ...state, projects, waitingItems,
    todayPursuit: state.todayPursuit.map((p) => ({ ...p, projectId: projectIdFor(p, projects), isDone: p.isDone ?? p.isCompleted ?? false, isCompleted: p.isDone ?? p.isCompleted ?? false })),
    todayBlocks: state.todayBlocks.map((b) => ({ ...b, projectId: projectIdFor(b, projects) })),
    quickStats: {
      paidClientActive: projects.filter((p) => p.boardColumn === 'DOING' && p.lane === 'client_delivery' && p.paidNumeric > 0).length,
      waitingPaymentKickoff: waitingItems.length,
      maintenanceOpen: projects.filter((p) => !['DONE', 'PARKED'].includes(p.boardColumn) && p.lane === 'maintenance').length,
      salesAndProductActive: projects.filter((p) => p.boardColumn === 'DOING' && ['own_product', 'bizdev'].includes(p.lane)).length,
    },
    financialReport: {
      ...report, totalLiquidBalance, runwayMonths, runwayDays: Math.floor(runwayMonths * 30),
      modeStatus: totalLiquidBalance < report.hardFloor ? 'RED MODE - CASH DEFENSE' : totalLiquidBalance < Math.max(report.hardFloor, 10000000) ? 'YELLOW MODE - CAUTION' : 'GREEN MODE - GROWTH',
    },
  };
}

export function updateProject(state, project) {
  const previous = state.projects.find((p) => p.id === project.id);
  const completionChanged = previous && (previous.boardColumn === 'DONE') !== (project.boardColumn === 'DONE');
  const actionChanged = previous && previous.nextAction !== project.nextAction && project.nextAction;
  const updateTask = (task) => projectIdFor(task, state.projects) === project.id
    ? {
        ...task,
        projectId: project.id,
        ...(task.projectName !== undefined ? { projectName: project.name } : { project: project.name }),
        ...(actionChanged ? { action: project.nextAction } : {}),
        ...(completionChanged ? { isDone: project.boardColumn === 'DONE', isCompleted: project.boardColumn === 'DONE' } : {})
      }
    : task;
  return deriveState({
    ...state,
    projects: previous ? state.projects.map((p) => p.id === project.id ? project : p) : [...state.projects, project],
    todayPursuit: state.todayPursuit.map(updateTask),
    todayBlocks: state.todayBlocks.map(updateTask),
  });
}

export function validateTransaction(state, tx) {
  if (!state) throw new Error('Simpan workspace sebelum mencatat transaksi.');
  if (!tx || !['income', 'expense', 'transfer', 'balance_update'].includes(tx.type)) throw new Error('Jenis transaksi tidak valid.');
  if (!Number.isSafeInteger(tx.amount) || tx.amount < 0 || (tx.type !== 'balance_update' && tx.amount === 0)) throw new Error('Nominal harus berupa rupiah bulat yang valid.');
  if (!state.financialReport.accounts.some((a) => a.name === tx.accountName)) throw new Error('Rekening asal tidak ditemukan.');
  if (tx.type === 'transfer' && (tx.toAccountName === tx.accountName || !state.financialReport.accounts.some((a) => a.name === tx.toAccountName))) throw new Error('Pilih rekening tujuan yang berbeda dan tersedia.');
  if (tx.linkedProjectId && (tx.type !== 'income' || !state.projects.some((p) => p.id === tx.linkedProjectId))) throw new Error('Pembayaran harus terhubung ke project yang tersedia.');
}

export function applyTransaction(state, tx) {
  validateTransaction(state, tx);
  const existing = state.financialReport.transactions.find((item) => item.id === tx.id);
  if (existing) {
    if (['type', 'amount', 'accountName', 'toAccountName', 'linkedProjectId'].some((key) => existing[key] !== tx[key])) throw new Error('ID transaksi sudah dipakai untuk transaksi berbeda.');
    return state;
  }
  let next = {
    ...state,
    financialReport: {
      ...state.financialReport,
      asOfDate: tx.date,
      accounts: state.financialReport.accounts.map((account) => {
        let balance = account.balance;
        if (account.name === tx.accountName) balance = tx.type === 'balance_update' ? tx.amount : balance + (tx.type === 'income' ? tx.amount : -tx.amount);
        else if (tx.type === 'transfer' && account.name === tx.toAccountName) balance += tx.amount;
        return balance === account.balance ? account : { ...account, balance, isLatest: true, lastUpdated: tx.date };
      }),
      transactions: [tx, ...state.financialReport.transactions],
    },
  };
  if (tx.linkedProjectId) {
    const project = state.projects.find((p) => p.id === tx.linkedProjectId);
    const paidNumeric = project.paidNumeric + tx.amount;
    next = updateProject(next, {
      ...project, paidNumeric,
      paymentStatus: paidNumeric >= project.nominalNumeric ? 'Paid' : 'Partial',
      boardColumn: project.status === 'Waiting Payment' ? 'QUEUE' : project.boardColumn,
    });
  }
  next = deriveState(next);
  return { ...next, financialReport: { ...next.financialReport, trajectory: [...next.financialReport.trajectory, { date: tx.date, balance: next.financialReport.totalLiquidBalance, note: tx.description }] } };
}

export function validateState(state) {
  const fail = () => { throw new Error('Struktur workspace tidak valid.'); };
  if (!state || typeof state !== 'object' || Array.isArray(state)) fail();
  for (const field of ['projects', 'todayBlocks', 'todayPursuit', 'waitingItems']) {
    if (!Array.isArray(state[field]) || state[field].some((item) => !item || typeof item.id !== 'string')) fail();
    if (new Set(state[field].map((item) => item.id)).size !== state[field].length) fail();
  }
  const report = state.financialReport;
  if (!report || !Array.isArray(report.accounts) || !Array.isArray(report.transactions) || !Array.isArray(report.trajectory) || !Array.isArray(report.monthlyExpenses)) fail();
  if (report.accounts.some((a) => !a || typeof a.name !== 'string' || !Number.isFinite(a.balance))) fail();
  if (new Set(report.accounts.map((a) => a.name)).size !== report.accounts.length) fail();
  if (state.projects.some((p) => typeof p.name !== 'string' || !['DOING', 'QUEUE', 'WAITING', 'PARKED', 'DONE'].includes(p.boardColumn) || !Number.isFinite(p.nominalNumeric) || !Number.isFinite(p.paidNumeric) || p.nominalNumeric < 0 || p.paidNumeric < 0)) fail();
  if (![report.hardFloor, report.estimatedRealBurn].every((n) => Number.isFinite(n) && n >= 0)) fail();
  if (report.transactions.some((tx) => !tx || typeof tx.id !== 'string' || !Number.isFinite(tx.amount))) fail();
  return state;
}
