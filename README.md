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
npm run dev      # Vite dev server (port 5173)
npm run server   # Node.js API server (port 3000)

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
- Verifikasi PIN menggunakan hash SHA-256 Web Crypto API (`DARU_OS_PIN_HASH` di `localStorage`) dan tidak menyimpan plaintext PIN di source code.
- Endpoint sensitif di server dibatasi ke `localhost`, `127.0.0.1`, dan private LAN IP.

## 5. Testing & Build

```bash
npm test         # Menjalankan seluruh unit & integration test
npx tsc --noEmit # Validasi TypeScript strict
npm run build    # Build bundle produksi ke dist/
```
