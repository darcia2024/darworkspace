# Daru Work OS — Developer Workstation

Solo developer workstation, cashflow tracker, radar pipeline, and daily focus engine.

---

## 1. Menjalankan Aplikasi

Pastikan Node.js `>= 22.13.0` terpasang.

```bash
# Install dependencies
npm install

# Jalankan frontend + local API server secara bersamaan
npm run dev:all

# Atau jalankan secara terpisah:
npm run dev      # Vite dev server (port 3000)
npm run server   # Node.js API server (port 3001)

# Jalankan production server
npm start
```

## 2. Lokasi Data Runtime

- **Database Utama**: `server/data/daru_os.json` (untracked, terdaftar di `.gitignore`).
- **Template DB**: `server/data/daru_os.example.json` (seed aman tanpa data sensitif).
- **Foto Struk / Kwitansi**: `server/data/receipts/` (disimpan lokal di server, terkompresi).

> **PENTING (Zero Data Leak Policy):**
> Data runtime (`server/data/daru_os.json`), nama klien asli, saldo, nomor rekening, PIN pribadi, dan foto struk **TIDAK BOLEH** di-commit ke Git. File runtime telah di-untrack dan di-ignore.

## 3. Backup & Restore Data

### Backup Otomatis
Jalankan perintah berikut kapan saja untuk membuat salinan JSON timestamped di luar folder repo (`~/daru_os_backups/`):
```bash
npm run backup
```

### Restore
1. Pastikan server dimatikan.
2. Salin file backup terbaru:
   ```bash
   cp ~/daru_os_backups/daru_os_<TIMESTAMP>.json server/data/daru_os.json
   ```
3. Nyalakan kembali server (`npm start` atau `npm run server`).
4. Atau gunakan fitur **"Muat versi server"** pada modal Laporan di browser.

## 4. Keamanan & Privacy Lock

- **Device Privacy Lock**: PIN 6-digit berfungsi sebagai screen lock lokal terhadap bahaya *shoulder-surfing*.
- Verifikasi PIN memakai hash SHA-256 Web Crypto API (`DARU_OS_PIN_HASH` di `localStorage`); plaintext PIN tidak ada di source code.
- Endpoint server dibatasi ke `localhost`, `127.0.0.1`, dan private LAN IP.

> **PIN bukan pengaman API.** Layar PIN hanya menahan render di browser. Selama
> `DARU_API_TOKEN` kosong, siapa pun yang bisa menjangkau port server bisa membaca
> seluruh workspace tanpa kredensial. Itu aman selama server hanya mendengarkan di
> `127.0.0.1`, tapi tidak lagi aman begitu diakses dari perangkat lain.

### Token API (wajib kalau diakses dari HP / jaringan lokal)

1. Buat token:
   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
   ```
2. Masukkan ke `.env` sebagai `DARU_API_TOKEN=<token>` lalu restart server.
3. Di browser, buka **Laporan project → Token API perangkat ini**, tempel token yang sama, klik **Simpan token**.

Setelah aktif, semua endpoint `/api/*` menolak request tanpa header `X-Daru-Token`
yang benar (`/api/health` tetap terbuka supaya klien bisa melaporkan kenapa terkunci).
Token dibandingkan secara constant-time dan disimpan per-browser, bukan di source code.

## 5. Testing & Build

```bash
npm run lint     # ESLint (flat config, termasuk react-hooks)
npm test         # Unit, integration, dan component test (jsdom)
npx tsc --noEmit # Validasi TypeScript
npm run build    # Build bundle produksi ke dist/
```

Keempatnya dijalankan otomatis oleh GitHub Actions (`.github/workflows/ci.yml`)
pada setiap push dan pull request ke `main`.

`tests/component.test.js` me-render komponen React sungguhan di jsdom — bukan
simulasi — supaya bug interaksi seperti input PIN yang kehilangan digit ketahuan
sebelum sampai ke browser.
