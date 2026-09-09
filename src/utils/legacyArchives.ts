// Historical snapshots from the original repo, kept separately from the transaction ledger.
export const legacyArchives = [
    {
      id: '2026-08',
      monthName: 'Agustus 2026',
      periodTag: 'ARCHIVED // AGUSTUS_2026',
      target: 10000000,
      realizedIncome: 60650000,
      realizedExpense: 51783310,
      netSurplus: 8866690,
      endingBalance: 4130865,
      progressPercent: 88.7,
      modeStatus: 'PROFIT SOLID (Omset Gross Rp60,65M • Net Profit Rp8.866.690)',
      runwayMonths: '±0.92 Bulan',
      milestones: [
        'Tiket Pesawat Saudia Airlines (3 Pax): Omset Rp39.600.000 (Net Profit +Rp906.000 Lunas)',
        'VOA Mesir & Tiket EgyptAir Abdurrahman: Omset Rp14.550.000 (Net Profit +Rp1.460.690 Lunas)',
        'Closing Deal Rp6.000.000 Barber Underrated & DP 50% Masuk (Rp3.000.000 Lunas)',
        'Bang Ridwan Zalbina: Bundle Logo Laptopbisnis & Zalvice Rp1.200.000 Lunas Penuh',
        'Sidi Ifdony: Logo Hamasah Bakery & Laundry Rp1.000.000 Lunas',
        'Ziaudin Azzam: Brand Identity & Logo KOLOHAGA Rp700.000 Lunas',
        'Zaky Fakhru Ar-Rozi: Landing Page Kampanye Rp600.000 Lunas'
      ],
      breakdown: [
        { label: 'Tiket Saudia Airlines (3 Pax)', client: 'Temantiket Operations', category: 'Flight Tickets', amount: 39600000, profit: 906000, tag: 'TICKETING', status: 'LUNAS ' },
        { label: 'VOA Mesir & EgyptAir', client: 'Abdurrahman Ja\'far M.', category: 'Visa & Flight', amount: 14550000, profit: 1460690, tag: 'TRAVEL_OPS', status: 'LUNAS ' },
        { label: 'DP Kasir Barber POS (50%)', client: 'Owner Barber Underrated', category: 'DP 50%', amount: 3000000, profit: 3000000, tag: 'INFLOW_DP', status: 'LUNAS ' },
        { label: 'Bundle Logo Zalvice & Laptopbisnis', client: 'Bang Ridwan Zalbina', category: 'Branding', amount: 1200000, profit: 1200000, tag: 'DESIGN_BUNDLE', status: 'LUNAS ' },
        { label: 'Logo Hamasah Bakery & Laundry', client: 'Sidi Ifdony', category: 'Branding', amount: 1000000, profit: 1000000, tag: 'DESIGN', status: 'LUNAS ' },
        { label: 'Brand & Logo KOLOHAGA', client: 'Ziaudin Azzam (Ajam)', category: 'Branding', amount: 700000, profit: 700000, tag: 'DESIGN', status: 'LUNAS ' },
        { label: 'Landing Page Kampanye Digital', client: 'Zaky Fakhru Ar-Rozi', category: 'Web Dev', amount: 600000, profit: 600000, tag: 'LANDING', status: 'LUNAS ' },
      ],
      expensesBreakdown: [
        { label: 'Biaya Operasional Tiket & Visa (Vendor)', amount: 51783310, note: 'Tiket Saudia Rp38,69M + VOA Mesir & EgyptAir Rp13,09M' },
        { label: 'Nafkah Istri September', amount: 1200000, note: 'Transfer 31 Agu 2026 (Lunas)' },
        { label: 'Kewajiban Rumah Mesir', amount: 500000, note: 'Transfer 31 Agu 2026 (Lunas)' },
      ],
      summaryNote: 'Total omset gross Agustus mencapai Rp60.650.000 dengan realisasi keuntungan bersih (paid net profit) sebesar Rp8.866.690 dari 7 invoice lunas terverifikasi di portal billing.'
    },
    {
      id: '2026-07',
      monthName: 'Juli 2026',
      periodTag: 'ARCHIVED // JULI_2026',
      target: 10000000,
      realizedIncome: 9800000,
      realizedExpense: 500000,
      netSurplus: 9300000,
      endingBalance: 7810773,
      progressPercent: 93.0,
      modeStatus: 'PEAK PROFIT (Net Profit Rp9.300.000 dari 3 Invoice Lunas)',
      runwayMonths: '±1.73 Bulan',
      milestones: [
        'Markaz Fiqih: Web Portal Syariah, LMS & Redesign Logo Omset Rp8.500.000 (Net Profit +Rp8.000.000 Lunas)',
        'DreamMecca - Umrahme: Platform Landing Page (20 Pax) Rp700.000 Lunas Penuh',
        'Haramain Capture: Desain Logo H. Aris Azhari Harahap Rp600.000 Lunas Penuh',
        'Pencapaian Puncak Saldo Kas Likuid Terbesar (Rp7.810.773)'
      ],
      breakdown: [
        { label: 'Portal Web & LMS Markaz Fiqih', client: 'Markaz Fiqih', category: 'Web & LMS', amount: 8500000, profit: 8000000, tag: 'PLATFORM_PAID', status: 'LUNAS ' },
        { label: 'Platform Umrahme Landing (20 Pax)', client: 'DreamMecca Core', category: 'Full Payment', amount: 700000, profit: 700000, tag: 'WEB_DEV', status: 'LUNAS ' },
        { label: 'Desain Logo Haramain Capture', client: 'H. Aris Azhari Harahap', category: 'Branding', amount: 600000, profit: 600000, tag: 'DESIGN', status: 'LUNAS ' },
      ],
      expensesBreakdown: [
        { label: 'Biaya Operasional Dev & Hosting', amount: 500000, note: 'Server & setup operasional' },
        { label: 'Kebutuhan Rumah Tangga & Nafkah', amount: 3500000, note: 'Operasional bulanan keluarga' },
      ],
      summaryNote: 'Bulan Juli mencatatkan performa profit terbaik sebesar Rp9.300.000 dari 3 invoice resmi (Markaz Fiqih, DreamMecca, Haramain Capture) sebelum terjadi penarikan modal di awal Agustus.'
    }
  ];
