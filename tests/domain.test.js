import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTransaction, deriveState, updateProject, validateState } from '../shared/domain.js';
import { workspace, transaction } from './fixtures.js';

test('transfer conserves total cash and updates both accounts', () => {
  const state = workspace();
  const updated = applyTransaction(state, transaction({ type: 'transfer', toAccountName: 'Cash' }));
  assert.deepEqual(updated.financialReport.accounts.map(a => a.balance), [900, 200]);
  assert.equal(updated.financialReport.totalLiquidBalance, 1100);
  assert.equal(state.financialReport.accounts[0].balance, 1000);
});
test('zero balance corrections remain zero; runway recalculates', () => {
  const updated = applyTransaction(workspace(), transaction({ type: 'balance_update', amount: 0 }));
  assert.equal(updated.financialReport.accounts[0].balance, 0);
  assert.equal(updated.financialReport.runwayDays, 10);
});
test('income records partial payment, clears payment radar, queues work', () => {
  const updated = applyTransaction(deriveState(workspace()), transaction({ linkedProjectId: 'p1' }));
  assert.equal(updated.projects[0].paidNumeric, 100);
  assert.equal(updated.projects[0].unpaidNumeric, 900);
  assert.equal(updated.projects[0].paymentStatus, 'Partial');
  assert.equal(updated.projects[0].boardColumn, 'QUEUE');
  assert.equal(updated.waitingItems.length, 0);
  assert.equal(updated.quickStats.waitingPaymentKickoff, 0);
});
test('payment does not resolve approval blockers', () => {
  const state = workspace(); state.projects[0].status = 'Waiting Approval';
  const updated = applyTransaction(state, transaction({ amount: 1000, linkedProjectId: 'p1' }));
  assert.equal(updated.projects[0].paymentStatus, 'Paid');
  assert.equal(updated.projects[0].boardColumn, 'WAITING');
});
test('retries cannot record a transaction twice', () => {
  const first = applyTransaction(workspace(), transaction());
  assert.equal(applyTransaction(first, transaction()), first);
  assert.throws(() => applyTransaction(first, transaction({ amount: 200 })), /ID transaksi/);
});
for (const bad of [{ amount: -1 }, { amount: Infinity }, { amount: 1.5 }, { amount: 0 }, { amount: '100' }, { accountName: 'Missing' }, { type: 'transfer', toAccountName: 'Bank' }, { type: 'transfer', toAccountName: 'Missing' }, { linkedProjectId: 'Missing' }, { type: 'expense', linkedProjectId: 'p1' }]) {
  test(`rejects invalid transaction ${JSON.stringify(bad)}`, () => assert.throws(() => applyTransaction(workspace(), transaction(bad))));
}
test('project rename and completion use stable IDs without touching similar names', () => {
  let state = workspace();
  state.projects.push({ ...state.projects[0], id: 'p2', name: 'Client Extra' });
  state.todayPursuit.push({ id: 't2', project: 'Client Extra', isDone: false });
  state = updateProject(state, { ...state.projects[0], name: 'Renamed', boardColumn: 'DONE' });
  assert.equal(state.todayBlocks[0].isDone, true);
  assert.equal(state.todayBlocks[0].projectName, 'Renamed');
  assert.equal(state.todayPursuit[0].isCompleted, true);
  assert.equal(state.todayPursuit[1].isDone, false);
  assert.equal(state.waitingItems.length, 1);
});
test('editing project details does not uncheck completed daily tasks', () => {
  const state = workspace(); state.todayBlocks[0].isDone = true;
  assert.equal(updateProject(state, { ...state.projects[0], nextAction: 'Next' }).todayBlocks[0].isDone, true);
});
test('new project updates statistics and radar', () => {
  const state = updateProject(workspace(), { ...workspace().projects[0], id: 'p2', name: 'Other' });
  assert.equal(state.projects.length, 2);
  assert.equal(state.quickStats.waitingPaymentKickoff, 2);
});
test('schema rejects incomplete and duplicate records', () => {
  assert.throws(() => validateState({ projects: [] }));
  const state = workspace(); state.projects.push(state.projects[0]);
  assert.throws(() => validateState(state));
});
