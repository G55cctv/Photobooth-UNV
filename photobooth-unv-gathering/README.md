# 📸 Photobooth Event: UNV Partner & Installer Gathering 2026

Aplikasi Web Photobooth interaktif, ringan, dan modern untuk perhelatan **UNV Partner & Installer Gathering 2026** di **Baraja Coffee Amphitheater Cirebon** (Jumat, 9 Oktober 2026).

Penyelenggara: **Global Security Solution (GSS HUB) × UNV × Ultima Sinergi Perkasa**  
Kontak: 0822 1833 3381 | Instagram: [@cctvcenter.id](https://instagram.com/cctvcenter.id) | Facebook: [cctvcirebon](https://facebook.com/cctvcirebon)

---

## 🌟 Fitur Utama

1. **Desain Visual Eksklusif (Tema Biru UNV & Uniarch Gathering)**:
   - Warna tema biru utama (`#0066CC` ke `#0084FF`), cyan Uniarch (`#00B4D8`), aksen emas (`#FFB703`), dan background ice tint modern (`#F4F8FD`).
   - Hero biru lengkung organik dengan garis kontur topografi halus, rounded card 24px, dan tombol pill berdenyut dinamis.
   - Running marquee banner bergaya pita gathering UNV.

2. **Kamera & Pemotretan Presisi 9:16**:
   - Preview kamera live dengan overlay `frame.png` resmi (1080×1920) secara realtime.
   - Switch kamera depan & belakang serta toggle mirror (cermin).
   - Hitungan mundur 3 detik animasi dengan efek suara bip & flash shutter putih.
   - Fallback tombol **"Upload dari Galeri"** dengan pemotongan otomatis cover-fit 9:16 tanpa distorsi.
   - Penanganan error izin kamera yang ramah dalam Bahasa Indonesia.

3. **Editor Kreasi Multi-Layer (Di Bawah Frame)**:
   - **8 Filter Foto Berbasis Piksel**: Normal, Cerah, Hangat, Dingin, B&W, Vintage (Sepia), Vivid, dan Fade. Dijalankan dengan manipulasi piksel kanvas murni sehingga 100% konsisten di Safari iOS maupun Android.
   - **Stiker Interaktif**: Stiker SVG tema keamanan (Kamera CCTV Bullet, Dome, Perisai Keamanan, Alarm Sirine, Verified Pro), badge event (GSS HUB, UNV Partner, Security Next Level, Installer Juara, Baraja Cirebon), serta emoji seru. Mendukung drag, resize, rotate, dan gesture cubit dua jari (pinch-to-scale) di layar sentuh.
   - **Coretan Bebas**: Pilihan palet warna tema, 4 ukuran kuas, penghapus, tombol undo, dan hapus semua.
   - **Komposisi Benar**: Coretan dan stiker berada di bawah layer frame, sehingga logo dan informasi event pada frame tidak pernah tertutup.

4. **Integrasi Google Drive & QR Code Otomatis**:
   - Komposit akhir diekspor pada resolusi 1080×1920 JPEG kualitas 0.85 (ukuran berkas <600KB).
   - Pengunggahan otomatis ke Google Drive melalui Google Apps Script Web App dengan header `text/plain` bebas hambatan CORS preflight, timeout 30s, dan auto-retry 2x.
   - Pembuatan QR code unduhan langsung yang dapat discan oleh smartphone tamu undangan.
   - Tombol **"Unduh Langsung"** untuk menyimpan berkas secara lokal di perangkat kios/tablet.
   - **Mode Kiosk Inactivity**: Timer reset 60 detik tanpa aktivitas dengan modal peringatan hitung mundur 10 detik yang dapat dibatalkan.

---

## 📁 Struktur Berkas

```
photobooth-unv-gathering/
├── index.html               # Halaman utama SPA (4 layar: Landing, Kamera, Editor, Hasil)
├── css/
│   └── style.css            # Stylesheet tema oranye, responsif & safe-area
├── js/
│   ├── app.js               # Orkestrator aplikasi utama & kiosk tracker
│   ├── camera.js            # Modul kontrol getUserMedia, timer, & shutter
│   ├── editor.js            # Engine Kanvas 2D, filter piksel, stiker, & coretan
│   ├── upload.js            # Modul upload Google Drive via Google Apps Script
│   ├── config.js            # Konfigurasi event, URL Apps Script, stiker, warna
│   └── vendor/
│       └── qrcode.min.js    # Pustaka QR Code generator lokal (offline-ready)
├── assets/
│   ├── frame.png            # Frame resmi twibbon resolusi 1080x1920
│   └── reference.png        # Panduan gaya visual landing page
├── apps-script/
│   └── Code.gs              # Kode backend Google Apps Script Web App
└── README.md                # Dokumentasi lengkap
```

---

## 🚀 Panduan Menjalankan Secara Lokal

Aplikasi dibangun murni menggunakan HTML, Vanilla CSS, dan Vanilla JavaScript (ES Modules), sehingga dapat dijalankan menggunakan server statis apa pun:

### Opsi 1: Menggunakan Node.js / npx serve (Direkomendasikan)
Jalankan perintah berikut di folder proyek:
```bash
npx serve .
```
Lalu buka alamat yang muncul di peramban (misal `http://localhost:3000`).

### Opsi 2: Menggunakan Python 3
```bash
python -m http.server 8080
```
Lalu buka `http://localhost:8080`.

> **Catatan Kamera (HTTPS / Localhost)**:  
> Web API kamera (`navigator.mediaDevices.getUserMedia`) memerlukan koneksi aman (**HTTPS**) atau host lokal (**localhost** / `127.0.0.1`). Jika diakses dari HP via jaringan Wi-Fi lokal, gunakan tunnel HTTPS seperti Ngrok (`ngrok http 3000`) atau deploy ke Netlify/Vercel.

---

## ☁️ Panduan Deploy Google Apps Script (Upload Google Drive)

Target Folder Google Drive:  
`https://drive.google.com/drive/folders/1WfFUaBl6BNJIm-zwDzNdDIdF-eYnynWo` (ID: `1WfFUaBl6BNJIm-zwDzNdDIdF-eYnynWo`)

### Langkah Deployment Baru:
1. Buka [script.google.com](https://script.google.com) menggunakan akun Google yang memiliki akses tulis ke folder Drive di atas.
2. Klik tombol **New project** (Proyek baru).
3. Beri nama proyek, misalnya: `UNV Photobooth Uploader`.
4. Hapus isi bawaan pada editor `Code.gs`, lalu salin seluruh isi dari berkas [`apps-script/Code.gs`](apps-script/Code.gs) dan tempel ke sana.
5. Klik ikon **Save** (Simpan).
6. Klik tombol **Deploy** di pojok kanan atas > pilih **New deployment**.
7. Klik ikon gerigi (Select type) > pilih **Web app**.
8. Konfigurasikan:
   - **Description**: `Photobooth Web App v1`
   - **Execute as**: `Me (email anda)`
   - **Who has access**: **`Anyone`** (Wajib dipilih `Anyone` agar tamu acara dapat mengunggah foto tanpa perlu login).
9. Klik tombol **Deploy**.
10. Berikan izin otorisasi (*Review Permissions* > pilih akun Google > *Advanced* > *Go to UNV Photobooth Uploader (unsafe)* > *Allow*).
11. Salin **Web app URL** yang dihasilkan (formatnya: `https://script.google.com/macros/s/AKfycb.../exec`).
12. Buka berkas [`js/config.js`](js/config.js), ganti nilai baris berikut:
    ```javascript
    export const APPS_SCRIPT_URL = "TEMPEL_URL_WEB_APP_ANDA_DI_SINI";
    ```
13. Simpan berkas `js/config.js`. Selesai!

### Cara Re-Deploy Jika Ada Perubahan Kode di Apps Script:
Jika Anda mengubah kode di `Code.gs`:
1. Klik **Deploy** > **Manage deployments**.
2. Pilih deployment aktif Anda, klik ikon **Edit** (pensil).
3. Pada dropdown **Version**, pilih **New version**.
4. Klik **Deploy**. URL Web App akan tetap sama.

---

## 🌐 Panduan Deploy Website

### Deploy ke Netlify:
1. Tarik / unggah folder ini ke repositori GitHub.
2. Masuk ke [netlify.com](https://www.netlify.com/) > **Add new site** > **Import an existing project**.
3. Pilih repositori GitHub Anda.
4. *Build command*: kosongkan (karena merupakan situs statis).
5. *Publish directory*: `.` (atau root direktori).
6. Klik **Deploy site**. Netlify akan otomatis menyediakan URL HTTPS gratis (misal: `https://unv-photobooth.netlify.app`).

### Deploy ke Vercel:
1. Jalankan `npx vercel` di dalam folder proyek, atau hubungkan repositori di [vercel.com](https://vercel.com).
2. Pilih default setting untuk *Other* / static site.

### Deploy ke GitHub Pages:
1. Dorong kode ke repositori GitHub Anda.
2. Buka **Settings** > **Pages**.
3. Pada bagian *Branch*, pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
4. Dalam 1-2 menit situs akan tayang di `https://<username>.github.io/<repo-name>/`.

---

## 🎨 Menyesuaikan Stiker & Warna Tema

Semua konfigurasi terpusat di berkas [`js/config.js`](js/config.js) dan [`css/style.css`](css/style.css):

- **Menambah Stiker**:
  Buka `js/config.js` pada array `STICKER_PACKS`. Anda dapat menambahkan elemen emoji baru atau elemen SVG inline sesuai kebutuhan.
- **Mengubah Palet Warna Coretan**:
  Buka `js/config.js` pada array `BRUSH_PALETTE`.
- **Mengubah Warna Tema Dasar**:
  Buka `css/style.css` pada blok `:root` (`--color-primary`, `--color-secondary`, `--color-cream`).
- **Mengatur Durasi Timer & Kiosk**:
  Buka `js/config.js` pada objek `PHOTO_CONFIG` (`timerDuration`, `kioskInactivitySeconds`).
