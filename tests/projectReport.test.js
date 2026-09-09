import test from 'node:test';
import assert from 'node:assert/strict';
import { generateProjectNewsReport } from '../shared/projectReport.js';
import { workspace } from './fixtures.js';

test('project report reads as an update and distinguishes cash from receivables', () => {
  const state = workspace();
  state.projects[0].currentGoal = 'Menyiapkan materi untuk review klien.';
  state.projects[0].blocker = 'Menunggu konfirmasi jadwal review.';
  state.projects[0].followUpDeadline = '2026-09-12';
  state.projects[0].unpaidNumeric = 1000;
  const report = generateProjectNewsReport(state, new Date('2026-09-10T12:00:00+07:00'));
  assert.match(report, /^# Laporan Update Project/m);
  assert.match(report, /## Ringkasan utama/);
  assert.match(report, /## Kabar project aktif/);
  assert.match(report, /### Client/);
  assert.match(report, /Menyiapkan materi untuk review klien/);
  assert.match(report, /## Radar tindak lanjut/);
  assert.match(report, /Saldo likuid tercatat \*\*Rp1\.100\*\*/);
  assert.match(report, /sisa tagihan project sebesar \*\*Rp1\.000\*\*, yang belum dihitung sebagai uang masuk/);
  assert.match(report, /tidak menebak progres, pembayaran, atau tanggal/);
});

test('project report has useful empty states', () => {
  const state = workspace();
  state.projects[0].boardColumn = 'DONE';
  state.todayBlocks = [];
  const report = generateProjectNewsReport(state, new Date('2026-09-10T12:00:00+07:00'));
  assert.match(report, /Belum ada project dalam kolom Doing atau Queue/);
  assert.match(report, /Tidak ada project yang menunggu tindak lanjut/);
  assert.match(report, /Belum ada blok fokus yang belum selesai/);
});
