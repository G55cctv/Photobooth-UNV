/**
 * =======================================================================
 * KONFIGURASI APLIKASI PHOTOBOOTH EVENT
 * "UNV PARTNER & INSTALLER GATHERING 2026"
 * =======================================================================
 */

// URL Google Apps Script Web App yang sudah aktif & teruji:
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUcsfKp7QRh72XCzwNgkTfSnkjmgrDo1V3Fl7xHW-WV1hbfP0UEpk8W0AQYJmbwR7v/exec";

// ID Folder Google Drive tempat menyimpan hasil foto
export const DRIVE_FOLDER_ID = "1WfFUaBl6BNJIm-zwDzNdDIdF-eYnynWo";

// Data Konteks Event
export const EVENT_CONFIG = {
  title: "UNV | Uniarch Partner & Installer Gathering 2026",
  shortTitle: "UNV & Uniarch Gathering 2026",
  location: "Baraja Coffee Amphitheater Cirebon",
  date: "Jumat, 9 Oktober 2026",
  organizers: "Global Security Solution (GSS HUB) x UNV x Uniarch x Ultima Sinergi Perkasa",
  contactPhone: "0822 1833 3381",
  instagram: "cctvcenter.id",
  facebook: "cctvcirebon",
  businessScope: "Sistem Keamanan & Jaringan (CCTV, Fire Alarm, Autogate, Komputer, Jasa Instalasi)"
};

// Pengaturan Kanvas & Foto
export const PHOTO_CONFIG = {
  width: 1080,
  height: 1920,
  aspectRatio: 9 / 16,
  jpegQuality: 0.85,
  timerDuration: 3, // Detik hitungan mundur
  kioskInactivitySeconds: 60, // Auto-reset ke layar awal jika diam
  kioskWarningSeconds: 10 // Detik peringatan sebelum reset
};

// Informasi Geometri Frame (berdasarkan analisa alpha frame.png)
export const FRAME_CONFIG = {
  src: "assets/frame.png",
  width: 1080,
  height: 1920,
  cutout: {
    top: 163,
    bottom: 1480,
    left: 19,
    right: 1056
  }
};

// Palet Warna untuk Coretan / Sketsa Kuas (Tema Biru UNV & Uniarch)
export const BRUSH_PALETTE = [
  { name: "UNV Biru", color: "#0066CC" },
  { name: "Uniarch Cyan", color: "#00B4D8" },
  { name: "Kuning Emas", color: "#FFB703" },
  { name: "Navy Pro", color: "#0A2540" },
  { name: "Putih Murni", color: "#FFFFFF" },
  { name: "Hijau Sukses", color: "#10B981" },
  { name: "Merah Aksen", color: "#EF4444" },
  { name: "Oranye GSS", color: "#FF6B1A" }
];

// Ukuran Kuas Coretan
export const BRUSH_SIZES = [
  { label: "Halus", size: 6 },
  { label: "Sedang", size: 14 },
  { label: "Tebal", size: 26 },
  { label: "Ekstra", size: 44 }
];

// Daftar Filter Foto (Pixel-based Matrix)
export const FILTER_LIST = [
  { id: "normal", name: "Normal", badge: "Asli" },
  { id: "bright", name: "Cerah", badge: "+Light" },
  { id: "warm", name: "Hangat", badge: "Warm" },
  { id: "cool", name: "Dingin", badge: "Cool" },
  { id: "bw", name: "B&W", badge: "Monochrome" },
  { id: "vintage", name: "Vintage", badge: "Sepia" },
  { id: "vivid", name: "Vivid", badge: "Pop" },
  { id: "fade", name: "Fade", badge: "Matte" }
];

// Daftar Stiker Interaktif (Security & Fun Themes)
export const STICKER_PACKS = [
  {
    category: "badge",
    title: "Teks & Badge",
    items: [
      {
        id: "badge-unv-uniarch",
        type: "svg",
        name: "UNV | Uniarch",
        svg: `<svg viewBox="0 0 280 70" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="unvUniGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0052CC"/>
              <stop offset="60%" stop-color="#0066CC"/>
              <stop offset="100%" stop-color="#00B4D8"/>
            </linearGradient>
            <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
          </defs>
          <rect x="5" y="5" width="270" height="60" rx="30" fill="url(#unvUniGrad)" stroke="#FFFFFF" stroke-width="4" filter="url(#badgeShadow)"/>
          <text x="140" y="44" font-family="'Baloo 2', Poppins, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">UNV | UNIARCH 2026</text>
        </svg>`
      },
      {
        id: "badge-gss",
        type: "svg",
        name: "GSS HUB",
        svg: `<svg viewBox="0 0 240 70" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gssGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0052CC"/>
              <stop offset="100%" stop-color="#0084FF"/>
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="230" height="60" rx="30" fill="url(#gssGrad)" stroke="#FFB703" stroke-width="3"/>
          <text x="120" y="44" font-family="'Baloo 2', Poppins, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">★ GSS HUB ★</text>
        </svg>`
      },
      {
        id: "badge-unv",
        type: "svg",
        name: "UNV Partner",
        svg: `<svg viewBox="0 0 260 70" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="unvGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0052CC"/>
              <stop offset="100%" stop-color="#0096C7"/>
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="250" height="60" rx="30" fill="url(#unvGrad)" stroke="#FFFFFF" stroke-width="4"/>
          <text x="130" y="44" font-family="'Baloo 2', Poppins, sans-serif" font-size="25" font-weight="800" fill="#FFFFFF" text-anchor="middle">UNV PARTNER</text>
        </svg>`
      },
      {
        id: "badge-security",
        type: "svg",
        name: "Security Next Level",
        svg: `<svg viewBox="0 0 320 74" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="secGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#041E42"/>
              <stop offset="100%" stop-color="#0A2540"/>
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="310" height="64" rx="16" fill="url(#secGrad)" stroke="#00B4D8" stroke-width="3"/>
          <text x="160" y="45" font-family="'Baloo 2', Poppins, sans-serif" font-size="23" font-weight="800" fill="#00D2FF" text-anchor="middle">SECURITY NEXT LEVEL</text>
        </svg>`
      },
      {
        id: "badge-installer",
        type: "svg",
        name: "Installer Juara",
        svg: `<svg viewBox="0 0 260 70" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0066CC"/>
              <stop offset="100%" stop-color="#00B4D8"/>
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="250" height="60" rx="30" fill="url(#goldGrad)" stroke="#FFFFFF" stroke-width="4"/>
          <text x="130" y="43" font-family="'Baloo 2', Poppins, sans-serif" font-size="23" font-weight="800" fill="#FFFFFF" text-anchor="middle">INSTALLER JUARA 🏆</text>
        </svg>`
      },
      {
        id: "badge-cirebon",
        type: "svg",
        name: "Baraja Cirebon",
        svg: `<svg viewBox="0 0 280 70" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="270" height="60" rx="30" fill="#E2EFFF" stroke="#0066CC" stroke-width="3"/>
          <text x="140" y="43" font-family="'Baloo 2', Poppins, sans-serif" font-size="22" font-weight="800" fill="#0052CC" text-anchor="middle">☕ BARAJA CIREBON 2026</text>
        </svg>`
      }
    ]
  },
  {
    category: "security",
    title: "Keamanan (CCTV)",
    items: [
      {
        id: "sec-cctv-bullet",
        type: "svg",
        name: "Kamera Bullet",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="54" fill="#FFFFFF" stroke="#FF6B1A" stroke-width="4"/>
          <!-- CCTV Body -->
          <rect x="30" y="42" width="55" height="34" rx="6" fill="#2B1A10"/>
          <polygon points="85,50 102,40 102,78 85,68" fill="#FF6B1A"/>
          <circle cx="46" cy="59" r="9" fill="#0072CE"/>
          <circle cx="46" cy="59" r="4" fill="#00E5FF"/>
          <!-- Stand -->
          <line x1="50" y1="76" x2="50" y2="92" stroke="#2B1A10" stroke-width="5" stroke-linecap="round"/>
          <line x1="38" y1="92" x2="62" y2="92" stroke="#2B1A10" stroke-width="5" stroke-linecap="round"/>
          <!-- Red IR Led -->
          <circle cx="34" cy="48" r="2.5" fill="#EF4444"/>
        </svg>`
      },
      {
        id: "sec-cctv-dome",
        type: "svg",
        name: "Kamera Dome",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="54" fill="#FFFFFF" stroke="#0072CE" stroke-width="4"/>
          <!-- Ceiling base -->
          <rect x="30" y="40" width="60" height="12" rx="4" fill="#2B1A10"/>
          <!-- Dome Glass -->
          <path d="M 36 52 A 24 24 0 0 0 84 52 Z" fill="#FF6B1A"/>
          <!-- Lens -->
          <circle cx="60" cy="62" r="8" fill="#2B1A10"/>
          <circle cx="60" cy="62" r="4" fill="#00E5FF"/>
          <circle cx="62" cy="60" r="1.5" fill="#FFFFFF"/>
        </svg>`
      },
      {
        id: "sec-shield-lock",
        type: "svg",
        name: "Perisai Keamanan",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="54" fill="#FFE9D6" stroke="#FF6B1A" stroke-width="4"/>
          <!-- Shield shape -->
          <path d="M 60 25 L 86 35 C 86 65 72 86 60 95 C 48 86 34 65 34 35 Z" fill="#FF6B1A"/>
          <!-- Padlock -->
          <rect x="50" y="55" width="20" height="18" rx="3" fill="#FFFFFF"/>
          <path d="M 54 55 V 47 C 54 43 66 43 66 47 V 55" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
          <circle cx="60" cy="63" r="2.5" fill="#FF6B1A"/>
        </svg>`
      },
      {
        id: "sec-alarm",
        type: "svg",
        name: "Alarm Sirine",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="54" fill="#FFFFFF" stroke="#D9381E" stroke-width="4"/>
          <polygon points="60,32 78,66 42,66" fill="#D9381E"/>
          <rect x="36" y="66" width="48" height="10" rx="3" fill="#2B1A10"/>
          <line x1="60" y1="22" x2="60" y2="28" stroke="#D9381E" stroke-width="4" stroke-linecap="round"/>
          <line x1="78" y1="26" x2="73" y2="31" stroke="#D9381E" stroke-width="4" stroke-linecap="round"/>
          <line x1="42" y1="26" x2="47" y2="31" stroke="#D9381E" stroke-width="4" stroke-linecap="round"/>
        </svg>`
      },
      {
        id: "sec-verified",
        type: "svg",
        name: "Verified Pro",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="52" fill="#10B981" stroke="#FFFFFF" stroke-width="4"/>
          <polyline points="36,60 52,76 84,44" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      }
    ]
  },
  {
    category: "fun",
    title: "Seru & Properti",
    items: [
      { id: "fun-sunglasses", type: "emoji", char: "🕶️", name: "Kacamata Hitam" },
      { id: "fun-partyhat", type: "emoji", char: "🥳", name: "Pesta" },
      { id: "fun-crown", type: "emoji", char: "👑", name: "Mahkota" },
      { id: "fun-fire", type: "emoji", char: "🔥", name: "Menyala" },
      { id: "fun-sparkles", type: "emoji", char: "✨", name: "Kilau" },
      { id: "fun-star", type: "emoji", char: "⭐", name: "Bintang" },
      { id: "fun-popper", type: "emoji", char: "🎉", name: "Confetti" },
      { id: "fun-thumbsup", type: "emoji", char: "👍", name: "Mantap" },
      { id: "fun-camera", type: "emoji", char: "📸", name: "Kamera" },
      { id: "fun-coffee", type: "emoji", char: "☕", name: "Kopi Baraja" },
      { id: "fun-rock", type: "emoji", char: "🤘", name: "Rock On" },
      { id: "fun-muscle", type: "emoji", char: "💪", name: "Installer Kuat" }
    ]
  }
];
