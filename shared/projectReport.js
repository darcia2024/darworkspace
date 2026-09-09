const rupiah = (value) => `Rp${Math.max(0, Number(value) || 0).toLocaleString('id-ID')}`;

const title = (text) => String(text || 'Tanpa judul').replace(/[\r\n]+/g, ' ').replace(/^#+\s*/, '').trim();
const sentence = (text, fallback) => {
  const value = String(text || '').replace(/[\r\n]+/g, ' ').trim();
  return value || fallback;
};
const statusLabel = (project) => ({
  DOING: 'sedang dikerjakan',
  QUEUE: 'masuk antrean eksekusi',
  WAITING: 'menunggu tindak lanjut',
  PARKED: 'disimpan untuk nanti',
  DONE: 'sudah ditandai selesai',
}[project.boardColumn] || project.status || 'perlu diperiksa');

function projectParagraph(project) {
  const name = title(project.name);
  const lines = [`### ${name}`, '', `**Status:** ${statusLabel(project)} · Prioritas ${project.priority}.`];
  if (project.currentGoal) lines.push('', sentence(project.currentGoal, 'Belum ada sasaran yang dicatat.'));
  lines.push('', `**Langkah berikutnya:** ${sentence(project.nextAction, 'Tentukan langkah konkret di board project.')}`);
  if (project.definitionOfDone) lines.push('', `**Tanda selesai:** ${sentence(project.definitionOfDone, '')}`);
  if (project.nominalNumeric > 0) {
    lines.push('', `**Catatan nilai:** nilai kontrak ${rupiah(project.nominalNumeric)}. Sudah tercatat diterima ${rupiah(project.paidNumeric)}; sisa tagihan ${rupiah(project.unpaidNumeric)}.`);
  }
  if (project.blocker) lines.push('', `**Hambatan:** ${sentence(project.blocker, '')}`);
  return lines.join('\n');
}

function nextSteps(active, waiting) {
  const priorityOrder = { P1: 0, P2: 1, P3: 2, PARKED: 3 };
  const ordered = [...active].sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));
  const lines = ordered.slice(0, 2).map((project, index) =>
    `${index + 1}. **${title(project.name)}** · ${sentence(project.nextAction, 'Tentukan satu aksi konkret di board project.')}`,
  );
  if (waiting[0]) {
    lines.push(`${lines.length + 1}. **${title(waiting[0].name)}** · ${sentence(waiting[0].nextAction, 'Kirim follow-up untuk membuka hambatan.')}`);
  }
  return lines.length ? lines : ['Belum ada prioritas tindakan. Tambahkan project atau blok fokus di workspace.'];
}

function editorialCritique(active, waiting, outstanding) {
  const notes = [];
  const withoutDone = active.filter((project) => !project.definitionOfDone).length;
  const withoutAction = [...active, ...waiting].filter((project) => !project.nextAction).length;
  if (outstanding > 0) notes.push(`- **Jaga pembacaan kas:** ${rupiah(outstanding)} masih berupa tagihan. Catat sebagai pemasukan hanya setelah transaksi benar-benar masuk.`);
  if (withoutDone > 0) notes.push(`- **Perjelas batas selesai:** ${withoutDone} project aktif belum memiliki tanda selesai. Tambahkan kriteria hasil agar pekerjaan tidak melebar.`);
  if (withoutAction > 0) notes.push(`- **Tutup celah follow-up:** ${withoutAction} project aktif atau menunggu belum memiliki langkah berikutnya yang tercatat.`);
  if (!notes.length) notes.push('- Board sudah memiliki aksi dan tanda selesai. Tinjau ulang setelah ada perubahan status, pembayaran, atau respons klien.');
  return notes;
}

export function generateProjectNewsReport(state, now = new Date()) {
  const date = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const report = state.financialReport;
  const liquidBalance = Number.isFinite(report.totalLiquidBalance)
    ? report.totalLiquidBalance
    : (report.accounts || []).reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
  const runwayDays = Number.isFinite(report.runwayDays)
    ? report.runwayDays
    : report.estimatedRealBurn > 0 ? Math.floor((liquidBalance / report.estimatedRealBurn) * 30) : null;
  const active = state.projects.filter((project) => ['DOING', 'QUEUE'].includes(project.boardColumn));
  const waiting = state.projects.filter((project) => project.boardColumn === 'WAITING');
  const completed = state.projects.filter((project) => project.boardColumn === 'DONE');
  const parked = state.projects.filter((project) => project.boardColumn === 'PARKED');
  const outstanding = state.projects.reduce((sum, project) => sum + (project.unpaidNumeric || 0), 0);
  const focus = state.todayBlocks.filter((block) => !block.isDone);

  const lines = [
    '# Laporan Update Project',
    '',
    `*Edisi ${date} · disusun dari workspace Daru Work OS*`,
    '',
    '## Ringkasan utama',
    '',
    `Hari ini terdapat **${active.length} project aktif**, **${waiting.length} project menunggu tindak lanjut**, dan **${completed.length} project yang sudah ditandai selesai**.`,
    '',
    `Saldo likuid tercatat **${rupiah(liquidBalance)}**. Angka ini berbeda dari sisa tagihan project sebesar **${rupiah(outstanding)}**, yang belum dihitung sebagai uang masuk.`,
    '',
    report.estimatedRealBurn > 0
      ? `Dengan beban bulanan estimasi ${rupiah(report.estimatedRealBurn)}, runway tercatat sekitar **${runwayDays} hari**.`
      : 'Runway belum dapat dihitung karena estimasi beban bulanan belum diisi.',
    '',
    '## Kabar project aktif',
    '',
    ...(active.length ? active.map(projectParagraph) : ['Belum ada project dalam kolom Doing atau Queue.']),
    '',
    '## Radar tindak lanjut',
    '',
    ...(waiting.length ? waiting.map((project) => [
      `### ${title(project.name)}`,
      '',
      `**Menunggu:** ${sentence(project.blocker || project.status, 'Tindak lanjut dari pihak terkait.')}`,
      project.currentGoal ? `\n**Konteks:** ${sentence(project.currentGoal, '')}` : '',
      '',
      `**Aksi yang disarankan:** ${sentence(project.nextAction, 'Tentukan follow-up yang dibutuhkan.')}`,
      project.followUpDeadline ? `\n**Target follow-up:** ${project.followUpDeadline}` : '',
    ].filter(Boolean).join('\n')) : ['Tidak ada project yang menunggu tindak lanjut.']),
    '',
    '## Agenda berikutnya',
    '',
    ...(focus.length ? focus.map((block, index) => `${index + 1}. **${title(block.projectName)}** · ${sentence(block.action, 'Tentukan aksi fokus.')} (${block.timeboxMinutes} menit).`) : ['Belum ada blok fokus yang belum selesai.']),
    '',
    '## Langkah berikutnya',
    '',
    ...nextSteps(active, waiting),
    '',
    '## Kritik redaksi',
    '',
    ...editorialCritique(active, waiting, outstanding),
    '',
    '## Catatan redaksi',
    '',
    `- Project yang disimpan untuk nanti: ${parked.length}.`,
    '- Nilai kontrak dan tagihan hanya dilaporkan sebagai pipeline sampai transaksi pemasukan benar-benar dicatat.',
    '- Laporan ini tidak menebak progres, pembayaran, atau tanggal yang belum ada di workspace.',
    '',
  ];
  return lines.join('\n');
}

export function generateSingleProjectReport(project, now = new Date()) {
  const date = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const lines = [
    `# ${title(project.name)}`,
    '',
    `*Edisi ${date} · disusun dari workspace Daru Work OS*`,
    '',
    `**Status:** ${statusLabel(project)} · Prioritas ${project.priority || 'P2'}`,
    project.currentGoal ? `\n**Sasaran utama:** ${sentence(project.currentGoal, '')}` : '',
    project.definitionOfDone ? `\n**Kriteria selesai (DoD):** ${sentence(project.definitionOfDone, '')}` : '',
    project.rule ? `\n**Aturan main:** ${sentence(project.rule, '')}` : '',
    '',
    '## Catatan Lapangan & Status Produksi',
    sentence(project.newsArticle || projectParagraph(project), 'Sedang dalam eksekusi sesuai prioritas.'),
    '',
    '## Saran Langkah Nyata Berikutnya',
    sentence(project.nextAction, 'Tentukan langkah konkret di board project.'),
    project.billingMilestone ? `\n**Milestone pembayaran:** ${project.billingMilestone}` : '',
    '',
    '## Kritik & Evaluasi Redaksi',
    sentence(
      project.newsCritique || (project.unpaidNumeric > 0
        ? `Terdapat sisa piutang/tagihan ${rupiah(project.unpaidNumeric)}. Amankan pembayaran ke kas nyata.`
        : 'Pertahankan fokus eksekusi satu arah dan tuntaskan langkah berikutnya.'),
      ''
    ),
  ];
  return lines.filter(Boolean).join('\n');
}
