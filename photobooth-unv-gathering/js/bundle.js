/**
 * Photobooth App Standalone Bundle
 * Compatible with both file:// and http(s):// protocols without CORS restrictions.
 */
(function(window, document) {
  "use strict";

  // ========================================== 
  // 1. CONFIGURATION
  // ========================================== 
/**
 * =======================================================================
 * KONFIGURASI APLIKASI PHOTOBOOTH EVENT
 * "UNV PARTNER & INSTALLER GATHERING 2026"
 * =======================================================================
 */

// URL Google Apps Script Web App yang sudah aktif & teruji:
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUcsfKp7QRh72XCzwNgkTfSnkjmgrDo1V3Fl7xHW-WV1hbfP0UEpk8W0AQYJmbwR7v/exec";

// ID Folder Google Drive tempat menyimpan hasil foto
const DRIVE_FOLDER_ID = "1WfFUaBl6BNJIm-zwDzNdDIdF-eYnynWo";

// Data Konteks Event
const EVENT_CONFIG = {
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
const PHOTO_CONFIG = {
  width: 1080,
  height: 1920,
  aspectRatio: 9 / 16,
  jpegQuality: 0.85,
  timerDuration: 3, // Detik hitungan mundur
  kioskInactivitySeconds: 60, // Auto-reset ke layar awal jika diam
  kioskWarningSeconds: 10 // Detik peringatan sebelum reset
};

// Informasi Geometri Frame (berdasarkan analisa alpha frame.png)
const FRAME_CONFIG = {
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
const BRUSH_PALETTE = [
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
const BRUSH_SIZES = [
  { label: "Halus", size: 6 },
  { label: "Sedang", size: 14 },
  { label: "Tebal", size: 26 },
  { label: "Ekstra", size: 44 }
];

// Daftar Filter Foto (Pixel-based Matrix)
const FILTER_LIST = [
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
const STICKER_PACKS = [
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


  // ========================================== 
  // 2. CAMERA MANAGER
  // ========================================== 
/**
 * =======================================================================
 * MODUL KAMERA PHOTOBOOTH
 * Menangani getUserMedia, timer countdown, switch kamera, mirror,
 * cover-crop 9:16, dan fallback upload galeri.
 * =======================================================================
 */



class CameraManager {
  constructor(options = {}) {
    this.videoElement = options.videoElement;
    this.flashElement = options.flashElement;
    this.countdownElement = options.countdownElement;
    this.currentStream = null;
    this.facingMode = 'user'; // 'user' (depan) atau 'environment' (belakang)
    this.isMirrored = true;   // Default mirror untuk kamera depan
    this.isCountingDown = false;
    this.countdownTimer = null;
    this.audioCtx = null;
    this.activeFilter = 'normal';
    this.timerDuration = PHOTO_CONFIG.timerDuration;
    
    // Binding callbacks
    this.onSnap = options.onSnap || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * Mengatur filter CSS live pada kamera preview
   */
  setFilter(filterId) {
    this.activeFilter = filterId || 'normal';
    if (this.videoElement) {
      this.videoElement.className = 'filter-' + this.activeFilter;
    }
  }

  /**
   * Mengatur durasi timer countdown
   */
  setTimer(seconds) {
    this.timerDuration = seconds;
  }

  /**
   * Menginisialisasi audio context untuk efek suara hitungan & shutter
   */
  initAudio() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      console.warn('AudioContext tidak dapat diinisialisasi:', e);
    }
  }

  /**
   * Bunyikan nada bip hitungan mundur (frekuensi Hz, durasi detik)
   */
  playBeep(freq = 880, duration = 0.12, type = 'sine') {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Abaikan jika audio diblokir
    }
  }

  /**
   * Bunyikan efek suara shutter kamera mekanik
   */
  playShutterSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      // Nada klik ganda shutter
      this.playBeep(1200, 0.04, 'triangle');
      setTimeout(() => this.playBeep(800, 0.08, 'square'), 50);
    } catch (e) {}
  }

  /**
   * Memulai stream kamera live
   */
  async startCamera(preferredFacing = null) {
    if (preferredFacing) {
      this.facingMode = preferredFacing;
      this.isMirrored = (preferredFacing === 'user');
    }

    this.stopCamera();

    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: this.facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentStream = stream;
      if (this.videoElement) {
        this.videoElement.srcObject = stream;
        this.videoElement.setAttribute('playsinline', 'true');
        this.videoElement.muted = true;
        await this.videoElement.play();
        this.updateMirrorTransform();
      }
      return { success: true };
    } catch (err) {
      console.error('Kamera gagal dibuka:', err);
      let pesan = 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browsermu.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        pesan = 'Izin kamera ditolak. Silakan izinkan akses kamera pada pengaturan browser atau pilih "Upload dari Galeri".';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        pesan = 'Kamera tidak ditemukan pada perangkat ini. Silakan gunakan opsi "Upload dari Galeri".';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        pesan = 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dan coba lagi.';
      }
      this.onError(pesan, err);
      return { success: false, error: pesan };
    }
  }

  /**
   * Mengganti kamera depan <-> belakang
   */
  async switchCamera() {
    this.facingMode = (this.facingMode === 'user') ? 'environment' : 'user';
    this.isMirrored = (this.facingMode === 'user');
    return await this.startCamera();
  }

  /**
   * Mengubah status mirror secara manual
   */
  toggleMirror() {
    this.isMirrored = !this.isMirrored;
    this.updateMirrorTransform();
    return this.isMirrored;
  }

  /**
   * Terapkan transform mirror pada video preview
   */
  updateMirrorTransform() {
    if (this.videoElement) {
      this.videoElement.style.transform = this.isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
    }
  }

  /**
   * Menghentikan semua track kamera untuk menghemat baterai & mematikan indikator LED
   */
  stopCamera() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.isCountingDown = false;
    if (this.countdownElement) {
      this.countdownElement.classList.remove('active');
      this.countdownElement.textContent = '';
    }

    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.currentStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Memulai hitungan mundur timer sebelum jepret
   */
  startTimerAndCapture(seconds = PHOTO_CONFIG.timerDuration) {
    if (this.isCountingDown) return;
    this.initAudio();

    if (seconds <= 0) {
      this.executeCapture();
      return;
    }

    this.isCountingDown = true;
    let remaining = seconds;

    if (this.countdownElement) {
      this.countdownElement.classList.add('active');
      this.countdownElement.textContent = remaining;
    }
    this.playBeep(750, 0.15);

    this.countdownTimer = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        if (this.countdownElement) {
          this.countdownElement.textContent = remaining;
          // Trigger CSS pulse animation
          this.countdownElement.classList.remove('pulse');
          void this.countdownElement.offsetWidth;
          this.countdownElement.classList.add('pulse');
        }
        this.playBeep(750, 0.15);
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.isCountingDown = false;
        if (this.countdownElement) {
          this.countdownElement.textContent = 'SENYUM! 📸';
        }
        this.playBeep(1200, 0.25);
        setTimeout(() => {
          if (this.countdownElement) {
            this.countdownElement.classList.remove('active');
            this.countdownElement.textContent = '';
          }
          this.executeCapture();
        }, 300);
      }
    }, 1000);
  }

  /**
   * Batalkan countdown yang sedang berjalan
   */
  cancelCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.isCountingDown = false;
    if (this.countdownElement) {
      this.countdownElement.classList.remove('active');
      this.countdownElement.textContent = '';
    }
  }

  /**
   * Memicu efek visual flash putih saat foto diambil
   */
  triggerFlash() {
    if (this.flashElement) {
      this.flashElement.classList.add('flash-active');
      setTimeout(() => {
        this.flashElement.classList.remove('flash-active');
      }, 350);
    }
    this.playShutterSound();
  }

  /**
   * Mengambil gambar dari frame video kamera dan memotongnya secara presisi (cover-fit 9:16)
   */
  executeCapture() {
    if (!this.videoElement || !this.videoElement.videoWidth) {
      this.onError('Video belum siap diambil. Silakan coba lagi.');
      return;
    }

    this.triggerFlash();

    const vw = this.videoElement.videoWidth;
    const vh = this.videoElement.videoHeight;
    const targetW = PHOTO_CONFIG.width;
    const targetH = PHOTO_CONFIG.height;
    const targetRatio = targetW / targetH; // 9:16 = 0.5625

    // Buat canvas offscreen untuk menangkap foto beresolusi penuh
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = targetW;
    captureCanvas.height = targetH;
    const ctx = captureCanvas.getContext('2d');

    // Hitung crop cover
    const videoRatio = vw / vh;
    let sx, sy, sw, sh;

    if (videoRatio > targetRatio) {
      // Video lebih lebar daripada 9:16 -> potong sisi kiri dan kanan
      sh = vh;
      sw = vh * targetRatio;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      // Video lebih tinggi daripada 9:16 -> potong atas dan bawah
      sw = vw;
      sh = vw / targetRatio;
      sx = 0;
      sy = (vh - sh) / 2;
    }

    ctx.save();
    if (this.isMirrored) {
      // Balik secara horizontal jika mirror aktif
      ctx.translate(targetW, 0);
      ctx.scale(-1, 1);
    }

    // Gambar potongan video ke kanvas 1080x1920
    ctx.drawImage(this.videoElement, sx, sy, sw, sh, 0, 0, targetW, targetH);
    ctx.restore();

    // Kirimkan kanvas foto hasil jepret bersama filter live yang sedang aktif
    this.onSnap(captureCanvas, this.activeFilter);
  }

  /**
   * Fallback untuk memproses file gambar dari galeri/penyimpanan perangkat
   */
  processUploadedFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      this.onError('File yang dipilih bukan gambar yang valid.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const targetW = PHOTO_CONFIG.width;
        const targetH = PHOTO_CONFIG.height;
        const targetRatio = targetW / targetH;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const imgRatio = iw / ih;

        let sx, sy, sw, sh;
        if (imgRatio > targetRatio) {
          sh = ih;
          sw = ih * targetRatio;
          sx = (iw - sw) / 2;
          sy = 0;
        } else {
          sw = iw;
          sh = iw / targetRatio;
          sx = 0;
          sy = (ih - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        this.onSnap(canvas);
      };
      img.onerror = () => {
        this.onError('Gagal memuat gambar dari file.');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      this.onError('Gagal membaca file.');
    };
    reader.readAsDataURL(file);
  }
}


  // ========================================== 
  // 3. PHOTO EDITOR (CANVAS 2D)
  // ========================================== 
/**
 * =======================================================================
 * MODUL EDITOR & KANVAS 2D
 * Multi-layer rendering:
 *   Layer 1 (bawah): Foto dengan manipulasi piksel filter
 *   Layer 2: Coretan bebas (drawing / brush)
 *   Layer 3: Stiker interaktif (geser, putar, perbesar)
 *   Layer 4 (atas): Frame Twibbon 1080x1920 (overlay transparan)
 * =======================================================================
 */



class PhotoEditor {
  constructor(options = {}) {
    this.container = options.container;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d');

    // Kanvas offscreen untuk foto asli & foto berfilter
    this.rawPhotoCanvas = document.createElement('canvas');
    this.filteredPhotoCanvas = document.createElement('canvas');
    this.rawPhotoCanvas.width = PHOTO_CONFIG.width;
    this.rawPhotoCanvas.height = PHOTO_CONFIG.height;
    this.filteredPhotoCanvas.width = PHOTO_CONFIG.width;
    this.filteredPhotoCanvas.height = PHOTO_CONFIG.height;

    // Kanvas offscreen untuk coretan gambar
    this.drawingCanvas = document.createElement('canvas');
    this.drawingCanvas.width = PHOTO_CONFIG.width;
    this.drawingCanvas.height = PHOTO_CONFIG.height;
    this.drawCtx = this.drawingCanvas.getContext('2d', { willReadFrequently: true });

    // Image frame overlay
    this.frameImage = new Image();
    this.frameLoaded = false;
    this.frameImage.src = FRAME_CONFIG.src;
    this.frameImage.onload = () => {
      this.frameLoaded = true;
      this.render();
    };

    // State Editor
    this.activeTab = 'filter'; // 'filter', 'sticker', 'draw'
    this.currentFilterId = 'normal';
    
    // State Coretan
    this.brushColor = BRUSH_PALETTE[0].color;
    this.brushSize = BRUSH_SIZES[1].size;
    this.isEraser = false;
    this.isDrawing = false;
    this.lastPoint = null;
    this.undoStack = [];
    this.maxUndo = 15;

    // State Stiker
    this.stickers = [];
    this.selectedSticker = null;
    this.stickerInteraction = null; // { type: 'drag'|'rotate'|'scale', startX, startY, origX, origY, origRot, origScale, centerDist }
    this.activePointers = new Map(); // Untuk multi-touch gesture 2 jari

    // Callbacks
    this.onSelectionChange = options.onSelectionChange || (() => {});

    // Inisialisasi event listener interaksi kanvas
    this.initCanvasEvents();
  }

  /**
   * Mengatur foto baru ke editor dari kamera atau galeri
   */
  setPhoto(sourceCanvas, initialFilter = 'normal', preloadedStickers = []) {
    const rawCtx = this.rawPhotoCanvas.getContext('2d');
    rawCtx.clearRect(0, 0, PHOTO_CONFIG.width, PHOTO_CONFIG.height);
    rawCtx.drawImage(sourceCanvas, 0, 0, PHOTO_CONFIG.width, PHOTO_CONFIG.height);

    // Reset coretan dan stiker
    this.clearDrawing();
    this.stickers = [];
    this.selectedSticker = null;
    this.undoStack = [];
    this.currentFilterId = initialFilter || 'normal';

    // Tambahkan stiker yang sudah dipilih di kamera live jika ada
    if (Array.isArray(preloadedStickers) && preloadedStickers.length > 0) {
      preloadedStickers.forEach(stk => {
        this.addSticker(stk.item, stk.x, stk.y, stk.scale);
      });
    }

    // Terapkan filter awal yang dipilih di kamera
    this.applyFilter(this.currentFilterId);
    this.render();
  }

  /**
   * =====================================================================
   * SISTEM FILTER FOTO (MANIPULASI PIKSEL / MATRIKS WARNA)
   * 100% Murni Piksel ImageData (Aman untuk iOS Safari & semua browser)
   * =====================================================================
   */
  applyFilter(filterId) {
    this.currentFilterId = filterId;
    const w = PHOTO_CONFIG.width;
    const h = PHOTO_CONFIG.height;

    const rawCtx = this.rawPhotoCanvas.getContext('2d');
    const filteredCtx = this.filteredPhotoCanvas.getContext('2d');

    const srcImgData = rawCtx.getImageData(0, 0, w, h);
    const dstImgData = filteredCtx.createImageData(w, h);
    const src = srcImgData.data;
    const dst = dstImgData.data;
    const len = src.length;

    switch (filterId) {
      case 'bright':
        for (let i = 0; i < len; i += 4) {
          dst[i] = Math.min(255, src[i] * 1.15 + 15);
          dst[i + 1] = Math.min(255, src[i + 1] * 1.15 + 15);
          dst[i + 2] = Math.min(255, src[i + 2] * 1.15 + 15);
          dst[i + 3] = src[i + 3];
        }
        break;

      case 'warm':
        for (let i = 0; i < len; i += 4) {
          dst[i] = Math.min(255, src[i] * 1.16 + 10);
          dst[i + 1] = Math.min(255, src[i + 1] * 1.06 + 5);
          dst[i + 2] = Math.max(0, src[i + 2] * 0.88 - 5);
          dst[i + 3] = src[i + 3];
        }
        break;

      case 'cool':
        for (let i = 0; i < len; i += 4) {
          dst[i] = Math.max(0, src[i] * 0.90 - 5);
          dst[i + 1] = Math.min(255, src[i + 1] * 1.02);
          dst[i + 2] = Math.min(255, src[i + 2] * 1.18 + 15);
          dst[i + 3] = src[i + 3];
        }
        break;

      case 'bw':
        for (let i = 0; i < len; i += 4) {
          const lum = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
          // Sedikit dorong kontras
          const contrasted = (lum - 128) * 1.15 + 128;
          const val = Math.max(0, Math.min(255, contrasted));
          dst[i] = val;
          dst[i + 1] = val;
          dst[i + 2] = val;
          dst[i + 3] = src[i + 3];
        }
        break;

      case 'vintage': // Sepia lembut dengan vignette hangat
        for (let i = 0; i < len; i += 4) {
          const r = src[i];
          const g = src[i + 1];
          const b = src[i + 2];
          dst[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189 + 15);
          dst[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168 + 10);
          dst[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          dst[i + 3] = src[i + 3];
        }
        break;

      case 'vivid':
        for (let i = 0; i < len; i += 4) {
          const r = src[i];
          const g = src[i + 1];
          const b = src[i + 2];
          const avg = (r + g + b) / 3;
          // Tingkatkan saturasi & kontras
          dst[i] = Math.max(0, Math.min(255, avg + (r - avg) * 1.35));
          dst[i + 1] = Math.max(0, Math.min(255, avg + (g - avg) * 1.35));
          dst[i + 2] = Math.max(0, Math.min(255, avg + (b - avg) * 1.35));
          dst[i + 3] = src[i + 3];
        }
        break;

      case 'fade':
        for (let i = 0; i < len; i += 4) {
          // Angkat level hitam (faded matte look)
          dst[i] = Math.min(255, src[i] * 0.85 + 32);
          dst[i + 1] = Math.min(255, src[i + 1] * 0.85 + 32);
          dst[i + 2] = Math.min(255, src[i + 2] * 0.85 + 34);
          dst[i + 3] = src[i + 3];
        }
        break;

      case 'normal':
      default:
        dst.set(src);
        break;
    }

    filteredCtx.putImageData(dstImgData, 0, 0);
    this.render();
  }

  /**
   * Menghasilkan thumbnail kecil (offscreen) untuk setiap filter
   */
  generateFilterPreviews(callback) {
    const thumbW = 90;
    const thumbH = 160;
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = thumbW;
    thumbCanvas.height = thumbH;
    const tCtx = thumbCanvas.getContext('2d');

    // Gambar versi kecil dari rawPhoto
    tCtx.drawImage(this.rawPhotoCanvas, 0, 0, thumbW, thumbH);
    const srcImgData = tCtx.getImageData(0, 0, thumbW, thumbH);

    const previews = {};

    FILTER_LIST.forEach(f => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = thumbW;
      pCanvas.height = thumbH;
      const pCtx = pCanvas.getContext('2d');
      const dstImgData = pCtx.createImageData(thumbW, thumbH);
      const src = srcImgData.data;
      const dst = dstImgData.data;
      const len = src.length;

      switch (f.id) {
        case 'bright':
          for (let i = 0; i < len; i += 4) {
            dst[i] = Math.min(255, src[i] * 1.15 + 15);
            dst[i + 1] = Math.min(255, src[i + 1] * 1.15 + 15);
            dst[i + 2] = Math.min(255, src[i + 2] * 1.15 + 15);
            dst[i + 3] = 255;
          }
          break;
        case 'warm':
          for (let i = 0; i < len; i += 4) {
            dst[i] = Math.min(255, src[i] * 1.16 + 10);
            dst[i + 1] = Math.min(255, src[i + 1] * 1.06 + 5);
            dst[i + 2] = Math.max(0, src[i + 2] * 0.88 - 5);
            dst[i + 3] = 255;
          }
          break;
        case 'cool':
          for (let i = 0; i < len; i += 4) {
            dst[i] = Math.max(0, src[i] * 0.90 - 5);
            dst[i + 1] = Math.min(255, src[i + 1] * 1.02);
            dst[i + 2] = Math.min(255, src[i + 2] * 1.18 + 15);
            dst[i + 3] = 255;
          }
          break;
        case 'bw':
          for (let i = 0; i < len; i += 4) {
            const lum = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
            const val = Math.max(0, Math.min(255, (lum - 128) * 1.15 + 128));
            dst[i] = val; dst[i + 1] = val; dst[i + 2] = val; dst[i + 3] = 255;
          }
          break;
        case 'vintage':
          for (let i = 0; i < len; i += 4) {
            const r = src[i], g = src[i + 1], b = src[i + 2];
            dst[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189 + 15);
            dst[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168 + 10);
            dst[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            dst[i + 3] = 255;
          }
          break;
        case 'vivid':
          for (let i = 0; i < len; i += 4) {
            const avg = (src[i] + src[i + 1] + src[i + 2]) / 3;
            dst[i] = Math.max(0, Math.min(255, avg + (src[i] - avg) * 1.35));
            dst[i + 1] = Math.max(0, Math.min(255, avg + (src[i + 1] - avg) * 1.35));
            dst[i + 2] = Math.max(0, Math.min(255, avg + (src[i + 2] - avg) * 1.35));
            dst[i + 3] = 255;
          }
          break;
        case 'fade':
          for (let i = 0; i < len; i += 4) {
            dst[i] = Math.min(255, src[i] * 0.85 + 32);
            dst[i + 1] = Math.min(255, src[i + 1] * 0.85 + 32);
            dst[i + 2] = Math.min(255, src[i + 2] * 0.85 + 34);
            dst[i + 3] = 255;
          }
          break;
        default:
          dst.set(src);
          break;
      }
      pCtx.putImageData(dstImgData, 0, 0);
      previews[f.id] = pCanvas.toDataURL('image/jpeg', 0.8);
    });

    if (callback) callback(previews);
  }

  /**
   * =====================================================================
   * SISTEM CORETAN (FREEHAND DRAWING)
   * Dilakukan pada offscreen canvas, berada di bawah layer frame!
   * =====================================================================
   */
  saveDrawingState() {
    if (this.undoStack.length >= this.maxUndo) {
      this.undoStack.shift();
    }
    const snap = this.drawCtx.getImageData(0, 0, PHOTO_CONFIG.width, PHOTO_CONFIG.height);
    this.undoStack.push(snap);
  }

  undoDrawing() {
    if (this.undoStack.length > 0) {
      const snap = this.undoStack.pop();
      this.drawCtx.putImageData(snap, 0, 0);
      this.render();
      return true;
    }
    return false;
  }

  clearDrawing() {
    this.drawCtx.clearRect(0, 0, PHOTO_CONFIG.width, PHOTO_CONFIG.height);
    this.undoStack = [];
    this.render();
  }

  startStroke(x, y) {
    this.saveDrawingState();
    this.isDrawing = true;
    this.lastPoint = { x, y };

    this.drawCtx.lineCap = 'round';
    this.drawCtx.lineJoin = 'round';
    this.drawCtx.lineWidth = this.brushSize;

    if (this.isEraser) {
      this.drawCtx.globalCompositeOperation = 'destination-out';
      this.drawCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      this.drawCtx.globalCompositeOperation = 'source-over';
      this.drawCtx.strokeStyle = this.brushColor;
    }

    // Titik awal
    this.drawCtx.beginPath();
    this.drawCtx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
    this.drawCtx.fill();
    this.render();
  }

  moveStroke(x, y) {
    if (!this.isDrawing || !this.lastPoint) return;

    this.drawCtx.beginPath();
    this.drawCtx.moveTo(this.lastPoint.x, this.lastPoint.y);
    // Interpolasi titik tengah kurva
    const midX = (this.lastPoint.x + x) / 2;
    const midY = (this.lastPoint.y + y) / 2;
    this.drawCtx.quadraticCurveTo(this.lastPoint.x, this.lastPoint.y, midX, midY);
    this.drawCtx.stroke();

    this.lastPoint = { x, y };
    this.render();
  }

  endStroke() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.lastPoint = null;
    this.render();
  }

  /**
   * =====================================================================
   * SISTEM STIKER INTERAKTIF
   * =====================================================================
   */
  addSticker(item, customX = null, customY = null, customScale = 1) {
    const defaultW = (item.type === 'svg' && item.category === 'badge') ? 340 : 200;
    const defaultH = (item.type === 'svg' && item.category === 'badge') ? 90 : 200;

    const sticker = {
      id: 'stk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      item: item,
      type: item.type,
      x: customX !== null ? customX : (PHOTO_CONFIG.width / 2),
      // Tempatkan di area transparan yang aman jika belum ditentukan
      y: customY !== null ? customY : (600 + (Math.random() * 100 - 50)),
      width: defaultW,
      height: defaultH,
      scale: customScale || 1,
      rotation: 0, // Dalam radian
      img: null,
      ready: false
    };

    if (item.type === 'svg') {
      const img = new Image();
      const svgBlob = new Blob([item.svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        sticker.img = img;
        sticker.ready = true;
        URL.revokeObjectURL(url);
        this.render();
      };
      img.src = url;
    } else {
      // Emoji sticker: Render ke canvas offscreen
      const eCanvas = document.createElement('canvas');
      eCanvas.width = 256;
      eCanvas.height = 256;
      const eCtx = eCanvas.getContext('2d');
      eCtx.font = '160px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      eCtx.textAlign = 'center';
      eCtx.textBaseline = 'middle';
      eCtx.fillText(item.char, 128, 138);

      const img = new Image();
      img.onload = () => {
        sticker.img = img;
        sticker.ready = true;
        this.render();
      };
      img.src = eCanvas.toDataURL();
    }

    this.stickers.push(sticker);
    this.selectedSticker = sticker;
    this.onSelectionChange(this.selectedSticker);
    this.render();
  }

  deleteSelectedSticker() {
    if (!this.selectedSticker) return;
    this.stickers = this.stickers.filter(s => s !== this.selectedSticker);
    this.selectedSticker = null;
    this.onSelectionChange(null);
    this.render();
  }

  clearAllStickers() {
    this.stickers = [];
    this.selectedSticker = null;
    this.onSelectionChange(null);
    this.render();
  }

  rotateSelectedSticker(deltaRadians = Math.PI / 12) {
    if (!this.selectedSticker) return;
    this.selectedSticker.rotation = (this.selectedSticker.rotation + deltaRadians) % (Math.PI * 2);
    this.render();
  }

  scaleSelectedSticker(factor = 1.15) {
    if (!this.selectedSticker) return;
    this.selectedSticker.scale = Math.max(0.3, Math.min(3.5, this.selectedSticker.scale * factor));
    this.render();
  }

  /**
   * Cari stiker di koordinat (x, y) canvas
   */
  getStickerAt(x, y) {
    // Periksa dari stiker teratas ke terbawah
    for (let i = this.stickers.length - 1; i >= 0; i--) {
      const s = this.stickers[i];
      // Transform koordinat (x, y) ke lokal stiker
      const dx = x - s.x;
      const dy = y - s.y;
      const cos = Math.cos(-s.rotation);
      const sin = Math.sin(-s.rotation);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      const halfW = (s.width * s.scale) / 2;
      const halfH = (s.height * s.scale) / 2;

      // Area hitung bounding box stiker (+ padding 20px agar mudah disentuh)
      if (Math.abs(localX) <= halfW + 20 && Math.abs(localY) <= halfH + 20) {
        return { sticker: s, handle: 'body' };
      }
    }
    return null;
  }

  /**
   * =====================================================================
   * EVENT LISTENER TOUCH & MOUSE KANVAS
   * =====================================================================
   */
  initCanvasEvents() {
    const c = this.canvas;

    const getCanvasPoint = (e) => {
      const rect = c.getBoundingClientRect();
      const scaleX = PHOTO_CONFIG.width / rect.width;
      const scaleY = PHOTO_CONFIG.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    c.addEventListener('pointerdown', (e) => {
      c.setPointerCapture(e.pointerId);
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this.activeTab === 'draw') {
        const pt = getCanvasPoint(e);
        this.startStroke(pt.x, pt.y);
        return;
      }

      if (this.activeTab === 'sticker') {
        const pt = getCanvasPoint(e);

        // Jika multi-touch 2 jari: gesture pinch/rotate stiker terpilih
        if (this.activePointers.size === 2 && this.selectedSticker) {
          const pts = Array.from(this.activePointers.values());
          const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
          this.pinchStart = {
            dist,
            angle,
            scale: this.selectedSticker.scale,
            rotation: this.selectedSticker.rotation
          };
          return;
        }

        const hit = this.getStickerAt(pt.x, pt.y);
        if (hit) {
          this.selectedSticker = hit.sticker;
          this.stickerInteraction = {
            type: 'drag',
            startX: pt.x,
            startY: pt.y,
            origX: hit.sticker.x,
            origY: hit.sticker.y
          };
          this.onSelectionChange(this.selectedSticker);
          this.render();
        } else {
          // Deselect jika tap area kosong
          this.selectedSticker = null;
          this.onSelectionChange(null);
          this.render();
        }
      }
    });

    c.addEventListener('pointermove', (e) => {
      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (this.activeTab === 'draw' && this.isDrawing) {
        const pt = getCanvasPoint(e);
        this.moveStroke(pt.x, pt.y);
        return;
      }

      if (this.activeTab === 'sticker') {
        // Multi-touch pinch & rotate 2 jari
        if (this.activePointers.size === 2 && this.pinchStart && this.selectedSticker) {
          const pts = Array.from(this.activePointers.values());
          const newDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          const newAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);

          const scaleRatio = newDist / this.pinchStart.dist;
          const deltaAngle = newAngle - this.pinchStart.angle;

          this.selectedSticker.scale = Math.max(0.4, Math.min(3.0, this.pinchStart.scale * scaleRatio));
          this.selectedSticker.rotation = this.pinchStart.rotation + deltaAngle;
          this.render();
          return;
        }

        // Single-pointer drag
        if (this.stickerInteraction && this.selectedSticker) {
          const pt = getCanvasPoint(e);
          const dx = pt.x - this.stickerInteraction.startX;
          const dy = pt.y - this.stickerInteraction.startY;

          this.selectedSticker.x = this.stickerInteraction.origX + dx;
          this.selectedSticker.y = this.stickerInteraction.origY + dy;
          this.render();
        }
      }
    });

    const onPointerEnd = (e) => {
      try {
        c.releasePointerCapture(e.pointerId);
      } catch (err) {}
      this.activePointers.delete(e.pointerId);
      if (this.activePointers.size < 2) {
        this.pinchStart = null;
      }

      if (this.activeTab === 'draw') {
        this.endStroke();
      }
      this.stickerInteraction = null;
    };

    c.addEventListener('pointerup', onPointerEnd);
    c.addEventListener('pointercancel', onPointerEnd);
  }

  /**
   * =====================================================================
   * RENDERING PIPELINE (4 LAYER UTAMA)
   * =====================================================================
   */
  render(isExporting = false) {
    const ctx = this.ctx;
    const w = PHOTO_CONFIG.width;
    const h = PHOTO_CONFIG.height;

    // Bersihkan layar
    ctx.clearRect(0, 0, w, h);

    // LAYER 1: Foto dasar dengan filter piksel
    ctx.drawImage(this.filteredPhotoCanvas, 0, 0, w, h);

    // LAYER 2: Coretan / brush drawing
    ctx.drawImage(this.drawingCanvas, 0, 0, w, h);

    // LAYER 3: Stiker interaktif
    this.stickers.forEach(s => {
      if (!s.ready || !s.img) return;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.scale(s.scale, s.scale);

      const sw = s.width;
      const sh = s.height;
      ctx.drawImage(s.img, -sw / 2, -sh / 2, sw, sh);

      // Gambar kotak seleksi dan handle hanya jika sedang diedit & bukan export
      if (!isExporting && s === this.selectedSticker && this.activeTab === 'sticker') {
        ctx.strokeStyle = '#0066CC';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(-sw / 2 - 8, -sh / 2 - 8, sw + 16, sh + 16);
        ctx.setLineDash([]);

        // Handle sudut
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#0066CC';
        ctx.lineWidth = 3;
        const cornerSize = 14;
        [-sw / 2 - 8, sw / 2 + 8].forEach(cx => {
          [-sh / 2 - 8, sh / 2 + 8].forEach(cy => {
            ctx.beginPath();
            ctx.arc(cx, cy, cornerSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        });
      }

      ctx.restore();
    });

    // LAYER 4: FRAME OVERLAY (1080x1920)
    // Frame berada di paling atas, membungkus foto, stiker, dan coretan
    if (this.frameLoaded && this.frameImage) {
      ctx.drawImage(this.frameImage, 0, 0, w, h);
    }
  }

  /**
   * =====================================================================
   * EXPORT KOMPOSIT FINAL KE JPEG 1080x1920 (<600KB)
   * =====================================================================
   */
  async exportFinalImage(quality = PHOTO_CONFIG.jpegQuality) {
    // Render ulang tanpa visual helper (kotak seleksi stiker)
    this.render(true);

    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Gagal mengekspor foto dari kanvas'));
            return;
          }
          const dataUrl = this.canvas.toDataURL('image/jpeg', quality);
          resolve({ blob, dataUrl, size: blob.size });
          // Kembalikan render ke mode editor
          this.render(false);
        },
        'image/jpeg',
        quality
      );
    });
  }
}


  // ========================================== 
  // 4. DRIVE UPLOADER
  // ========================================== 
/**
 * =======================================================================
 * MODUL UPLOAD GOOGLE DRIVE (VIA GOOGLE APPS SCRIPT WEB APP)
 * Mengirim payload base64 JPEG dengan Content-Type text/plain (CORS-safe)
 * Dilengkapi timeout 30 detik dan auto-retry 2 kali.
 * =======================================================================
 */



class DriveUploader {
  constructor(options = {}) {
    this.appsScriptUrl = options.url || APPS_SCRIPT_URL;
    this.timeoutMs = options.timeoutMs || 30000;
    this.maxRetries = options.maxRetries || 2;
    this.onProgress = options.onProgress || (() => {});
  }

  /**
   * Mengubah Blob menjadi string Base64 (tanpa prefix)
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Menghasilkan nama file standar: "UNV-Gathering-2026_YYYYMMDD-HHmmss.jpg"
   */
  generateFilename() {
    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = pad(now.getMonth() + 1);
    const DD = pad(now.getDate());
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    return `UNV-Gathering-2026_${YYYY}${MM}${DD}-${hh}${mm}${ss}.jpg`;
  }

  /**
   * Mengunggah foto hasil photobooth ke Google Drive
   */
  async uploadPhoto(blob) {
    const filename = this.generateFilename();

    // Periksa apakah URL Apps Script sudah dikonfigurasi
    if (!this.appsScriptUrl || this.appsScriptUrl === 'ISI_URL_WEB_APP_DI_SINI' || !this.appsScriptUrl.startsWith('http')) {
      console.warn('APPS_SCRIPT_URL belum dikonfigurasi di js/config.js. Menjalankan fallback simulasi lokal.');
      this.onProgress(50, 'Menyiapkan pratinjau lokal...');
      await new Promise(r => setTimeout(r, 600));
      this.onProgress(100, 'Foto siap diunduh secara lokal!');
      
      return {
        success: false,
        isConfigMissing: true,
        filename,
        error: 'APPS_SCRIPT_URL belum diatur di js/config.js. Foto tetap dapat diunduh langsung di perangkat ini.',
        driveFolderUrl: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`
      };
    }

    this.onProgress(15, 'Mengonversi gambar...');
    const base64Data = await this.blobToBase64(blob);

    const payload = {
      filename: filename,
      mimeType: 'image/jpeg',
      data: base64Data
    };

    let attempt = 0;
    let lastError = null;

    while (attempt <= this.maxRetries) {
      attempt++;
      try {
        const progressPct = Math.min(30 + attempt * 25, 90);
        this.onProgress(progressPct, attempt === 1 ? 'Mengunggah ke Google Drive...' : `Mencoba ulang upload (${attempt}/${this.maxRetries + 1})...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        // Penting: gunakan text/plain;charset=utf-8 untuk menghindari preflight CORS di Google Apps Script
        const response = await fetch(this.appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload),
          redirect: 'follow',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server merespons status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          this.onProgress(100, 'Berhasil diunggah ke Google Drive!');
          return {
            success: true,
            fileId: data.fileId,
            filename: data.filename || filename,
            downloadUrl: data.downloadUrl,
            viewUrl: data.viewUrl || data.downloadUrl,
            previewUrl: data.previewUrl || data.viewUrl
          };
        } else {
          throw new Error(data.error || 'Gagal menyimpan ke Google Drive.');
        }

      } catch (err) {
        console.error(`Percobaan upload ${attempt} gagal:`, err);
        lastError = err;
        if (err.name === 'AbortError') {
          lastError = new Error('Permintaan upload ke Google Drive melebihi batas waktu (30 detik).');
        }

        if (attempt <= this.maxRetries) {
          // Jeda eksponensial singkat sebelum mencoba kembali (1.5 detik)
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }

    return {
      success: false,
      filename,
      error: lastError ? lastError.message : 'Koneksi gagal setelah beberapa kali percobaan.',
      driveFolderUrl: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`
    };
  }
}


  // ========================================== 
  // 5. MAIN APPLICATION & BOOTSTRAP
  // ========================================== 
/**
 * =======================================================================
 * APLIKASI UTAMA PHOTOBOOTH (ES MODULES)
 * UNV PARTNER & INSTALLER GATHERING 2026
 * Baraja Coffee Amphitheater Cirebon
 * =======================================================================
 */







class PhotoboothApp {
  constructor() {
    this.screens = {
      landing: document.getElementById('landing-screen'),
      camera: document.getElementById('camera-screen'),
      editor: document.getElementById('editor-screen'),
      result: document.getElementById('result-screen')
    };

    this.currentScreen = 'landing';
    this.currentPhotoBlob = null;
    this.currentPhotoDataUrl = null;
    this.currentFilename = null;
    this.uploadedResult = null;

    // Timer Kiosk
    this.inactivityTimer = null;
    this.warningTimer = null;
    this.warningCountdown = 10;

    // Audio synthesizer helper
    this.audioCtx = null;

    this.init();
  }

  init() {
    this.initAudioContext();
    try { this.initCameraManager(); } catch (e) { console.error('Camera Manager init error:', e); }
    try { this.initEditor(); } catch (e) { console.error('Editor init error:', e); }
    try { this.initUploader(); } catch (e) { console.error('Uploader init error:', e); }
    try { this.bindGlobalEvents(); } catch (e) { console.error('Global Events bind error:', e); }
    try { this.renderStickerPacks(); } catch (e) { console.error('Sticker Packs error:', e); }
    try { this.renderBrushPalette(); } catch (e) { console.error('Brush Palette error:', e); }
    try { this.renderBrushSizes(); } catch (e) { console.error('Brush Sizes error:', e); }
    try { this.initKioskTracker(); } catch (e) { console.error('Kiosk Tracker error:', e); }
  }

  initAudioContext() {
    const playTone = (freq = 600, duration = 0.08) => {
      try {
        if (!this.audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
      } catch (e) {}
    };
    this.playTone = playTone;
  }

  showScreen(screenName) {
    this.playTone(800, 0.05);
    Object.keys(this.screens).forEach(name => {
      const el = this.screens[name];
      if (name === screenName) {
        el.classList.add('screen-active');
        el.removeAttribute('aria-hidden');
      } else {
        el.classList.remove('screen-active');
        el.setAttribute('aria-hidden', 'true');
      }
    });

    this.currentScreen = screenName;

    // Bersihkan countdown kiosk saat berpindah layar
    this.cancelKioskCountdown();

    if (screenName === 'result') {
      this.startKioskInactivityTimer();
    }
  }

  /**
   * =====================================================================
   * INISIALISASI KAMERA
   * =====================================================================
   */
  initCameraManager() {
    const video = document.getElementById('camera-video');
    const flash = document.getElementById('camera-flash');
    const countdown = document.getElementById('camera-countdown');

    this.cameraLiveStickers = [];
    this.cameraTimerMode = 3;

    this.camera = new CameraManager({
      videoElement: video,
      flashElement: flash,
      countdownElement: countdown,
      onSnap: (capturedCanvas, activeFilter) => {
        // Pindahkan stiker live ke koordinat kanvas 1080x1920
        const stickersToTransfer = this.cameraLiveStickers.map(stk => ({
          item: stk.item,
          x: (stk.relX / 100) * PHOTO_CONFIG.width,
          y: (stk.relY / 100) * PHOTO_CONFIG.height,
          scale: stk.scale || 1
        }));

        this.camera.stopCamera();
        this.editor.setPhoto(capturedCanvas, activeFilter, stickersToTransfer);
        this.clearCameraLiveStickers();
        this.generateFilterThumbnails();
        this.showScreen('editor');
      },
      onError: (msg) => {
        this.showToast(msg, 'error');
      }
    });

    // Tombol Shutter
    const btnShutter = document.getElementById('btn-shutter');
    btnShutter.addEventListener('click', () => {
      this.playTone(900, 0.1);
      this.camera.startTimerAndCapture(this.cameraTimerMode);
    });

    // Tombol Ganti Kamera Depan/Belakang
    const btnSwitch = document.getElementById('btn-switch-cam');
    btnSwitch.addEventListener('click', async () => {
      this.playTone(700, 0.06);
      btnSwitch.classList.add('btn-spin');
      await this.camera.switchCamera();
      btnSwitch.classList.remove('btn-spin');
    });

    // Tombol Balik Kamera Cepat di bawah
    const btnQuickFlip = document.getElementById('btn-quick-flip-cam');
    if (btnQuickFlip) {
      btnQuickFlip.addEventListener('click', () => btnSwitch.click());
    }

    // Tombol Toggle Mirror
    const btnMirror = document.getElementById('btn-toggle-mirror');
    btnMirror.addEventListener('click', () => {
      this.playTone(700, 0.06);
      const isMirrored = this.camera.toggleMirror();
      btnMirror.classList.toggle('active', isMirrored);
      this.showToast(isMirrored ? 'Mode Cermin Aktif' : 'Mode Cermin Nonaktif');
    });

    // Tombol Toggle Timer (3s -> 5s -> 0s -> 3s)
    const btnTimer = document.getElementById('btn-toggle-timer');
    const timerBadgeText = document.getElementById('timer-badge-text');
    const shutterTimerText = document.querySelector('.shutter-timer-indicator');
    if (btnTimer) {
      btnTimer.addEventListener('click', () => {
        this.playTone(800, 0.05);
        if (this.cameraTimerMode === 3) {
          this.cameraTimerMode = 5;
        } else if (this.cameraTimerMode === 5) {
          this.cameraTimerMode = 0;
        } else {
          this.cameraTimerMode = 3;
        }

        const label = this.cameraTimerMode === 0 ? 'OFF' : `${this.cameraTimerMode}s`;
        if (timerBadgeText) timerBadgeText.textContent = label;
        if (shutterTimerText) shutterTimerText.textContent = this.cameraTimerMode === 0 ? 'Langsung' : `${this.cameraTimerMode}s Timer`;
        this.showToast(`Timer kamera: ${this.cameraTimerMode === 0 ? 'Nonaktif' : this.cameraTimerMode + ' detik'}`);
      });
    }

    // Tab Drawer Kamera: Filter vs Stiker
    const tabFilter = document.getElementById('btn-cam-tab-filter');
    const tabSticker = document.getElementById('btn-cam-tab-sticker');
    const trackFilter = document.getElementById('cam-filters-track');
    const trackSticker = document.getElementById('cam-stickers-track');
    const btnClearLiveStickers = document.getElementById('btn-cam-clear-live-stickers');

    if (tabFilter && tabSticker) {
      tabFilter.addEventListener('click', () => {
        this.playTone(850, 0.04);
        tabFilter.classList.add('active');
        tabSticker.classList.remove('active');
        if (trackFilter) trackFilter.classList.remove('hidden');
        if (trackSticker) trackSticker.classList.add('hidden');
      });

      tabSticker.addEventListener('click', () => {
        this.playTone(850, 0.04);
        tabSticker.classList.add('active');
        tabFilter.classList.remove('active');
        if (trackSticker) trackSticker.classList.remove('hidden');
        if (trackFilter) trackFilter.classList.add('hidden');
      });
    }

    if (btnClearLiveStickers) {
      btnClearLiveStickers.addEventListener('click', () => {
        this.playTone(450, 0.08);
        this.clearCameraLiveStickers();
        this.showToast('Semua stiker live dibersihkan.');
      });
    }

    // Filter Live Chips
    const filterChips = document.querySelectorAll('.cam-filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.playTone(950, 0.05);
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const fId = chip.dataset.filter;
        this.camera.setFilter(fId);
      });
    });

    // Render Stiker Chips untuk Live Camera Drawer
    this.renderLiveStickerChips();

    // Fallback Upload Galeri
    const fileInput = document.getElementById('camera-file-input');
    const btnUpload = document.getElementById('btn-gallery-upload');
    btnUpload.addEventListener('click', () => {
      this.playTone(700, 0.06);
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.camera.stopCamera();
        this.camera.processUploadedFile(e.target.files[0]);
        fileInput.value = '';
      }
    });

    // Tombol Kembali dari Kamera ke Landing
    const btnBackLanding = document.getElementById('btn-back-landing');
    btnBackLanding.addEventListener('click', () => {
      this.playTone(500, 0.06);
      this.camera.stopCamera();
      this.clearCameraLiveStickers();
      this.showScreen('landing');
    });
  }

  /**
   * Render stiker chip di drawer kamera live
   */
  renderLiveStickerChips() {
    const track = document.getElementById('cam-stickers-track');
    if (!track) return;
    track.innerHTML = '';

    STICKER_PACKS.forEach(pack => {
      pack.items.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cam-sticker-chip';
        btn.title = item.name;

        if (item.type === 'svg') {
          btn.innerHTML = `<span class="cam-sticker-chip-svg">${item.svg}</span><span class="cam-sticker-chip-label">${item.name}</span>`;
        } else {
          btn.innerHTML = `<span style="font-size: 1.3rem;">${item.char}</span><span class="cam-sticker-chip-label">${item.name}</span>`;
        }

        btn.addEventListener('click', () => {
          this.playTone(1000, 0.05);
          this.addCameraLiveSticker(item);
        });

        track.appendChild(btn);
      });
    });
  }

  /**
   * Pasang stiker interaktif live di atas video kamera preview
   */
  addCameraLiveSticker(item) {
    const layer = document.getElementById('camera-live-stickers');
    const clearBtn = document.getElementById('btn-cam-clear-live-stickers');
    if (!layer) return;

    if (clearBtn) clearBtn.classList.remove('hidden');

    const stickerEl = document.createElement('div');
    stickerEl.className = 'live-sticker-item';

    const isBadge = item.type === 'svg' && item.category === 'badge';
    const w = isBadge ? 140 : 88;
    const h = isBadge ? 42 : 88;
    stickerEl.style.width = `${w}px`;
    stickerEl.style.height = `${h}px`;

    // Posisi awal di sekitar area wajah (38% dari atas)
    let relX = 50 + (Math.random() * 16 - 8);
    let relY = 38 + (Math.random() * 12 - 6);
    stickerEl.style.left = `${relX}%`;
    stickerEl.style.top = `${relY}%`;

    if (item.type === 'svg') {
      stickerEl.innerHTML = item.svg;
    } else {
      stickerEl.innerHTML = `<span style="font-size: 60px; line-height: 1;">${item.char}</span>`;
    }

    // Tombol hapus stiker live individu
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'live-sticker-del-btn';
    delBtn.innerHTML = '×';
    delBtn.title = 'Hapus stiker ini';
    delBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.playTone(400, 0.05);
      stickerEl.remove();
      this.cameraLiveStickers = this.cameraLiveStickers.filter(s => s.element !== stickerEl);
      if (this.cameraLiveStickers.length === 0 && clearBtn) {
        clearBtn.classList.add('hidden');
      }
    });
    stickerEl.appendChild(delBtn);

    // Geser stiker secara interaktif
    let isDragging = false;
    let startX = 0, startY = 0;
    let startLeft = relX, startTop = relY;

    stickerEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      stickerEl.setPointerCapture(e.pointerId);
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = relX;
      startTop = relY;
      stickerEl.classList.add('selected');
    });

    stickerEl.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const rect = layer.getBoundingClientRect();
      const dx = ((e.clientX - startX) / rect.width) * 100;
      const dy = ((e.clientY - startY) / rect.height) * 100;

      relX = Math.max(8, Math.min(92, startLeft + dx));
      relY = Math.max(12, Math.min(88, startTop + dy));

      stickerEl.style.left = `${relX}%`;
      stickerEl.style.top = `${relY}%`;

      const entry = this.cameraLiveStickers.find(s => s.element === stickerEl);
      if (entry) {
        entry.relX = relX;
        entry.relY = relY;
      }
    });

    const onDragEnd = (e) => {
      if (isDragging) {
        isDragging = false;
        try { stickerEl.releasePointerCapture(e.pointerId); } catch (err) {}
        stickerEl.classList.remove('selected');
      }
    };

    stickerEl.addEventListener('pointerup', onDragEnd);
    stickerEl.addEventListener('pointercancel', onDragEnd);

    layer.appendChild(stickerEl);

    this.cameraLiveStickers.push({
      element: stickerEl,
      item: item,
      relX: relX,
      relY: relY,
      scale: 1
    });

    this.showToast(`Stiker "${item.name}" dipasang! Geser stiker di layar untuk mengatur posisi.`);
  }

  /**
   * Bersihkan semua stiker live di layar kamera
   */
  clearCameraLiveStickers() {
    const layer = document.getElementById('camera-live-stickers');
    const clearBtn = document.getElementById('btn-cam-clear-live-stickers');
    if (layer) layer.innerHTML = '';
    this.cameraLiveStickers = [];
    if (clearBtn) clearBtn.classList.add('hidden');
  }

  /**
   * =====================================================================
   * INISIALISASI EDITOR
   * =====================================================================
   */
  initEditor() {
    const canvas = document.getElementById('editor-canvas');
    const container = document.getElementById('canvas-viewport');

    this.editor = new PhotoEditor({
      container,
      canvas,
      onSelectionChange: (sticker) => {
        const delBtn = document.getElementById('btn-delete-sticker');
        if (delBtn) {
          delBtn.disabled = !sticker;
          delBtn.classList.toggle('visible', !!sticker);
        }
      }
    });

    // Tab Navigation (Filter / Stiker / Coretan)
    const tabBtns = document.querySelectorAll('.editor-tab-btn');
    const tabPanels = document.querySelectorAll('.editor-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.playTone(850, 0.06);
        const tab = btn.dataset.tab;
        this.editor.activeTab = tab;

        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabPanels.forEach(p => {
          if (p.id === `panel-${tab}`) {
            p.classList.add('panel-active');
          } else {
            p.classList.remove('panel-active');
          }
        });

        // Deselect stiker jika pindah dari tab stiker
        if (tab !== 'sticker') {
          this.editor.selectedSticker = null;
          this.editor.onSelectionChange(null);
        }
        this.editor.render();
      });
    });

    // Tombol Hapus Stiker Terpilih
    const btnDelSticker = document.getElementById('btn-delete-sticker');
    btnDelSticker.addEventListener('click', () => {
      this.playTone(400, 0.08);
      this.editor.deleteSelectedSticker();
    });

    // Tombol Bersihkan Semua Stiker
    const btnClearStickers = document.getElementById('btn-clear-stickers');
    if (btnClearStickers) {
      btnClearStickers.addEventListener('click', () => {
        this.playTone(400, 0.08);
        this.editor.clearAllStickers();
      });
    }

    // Tombol Putar Stiker
    const btnRotateSticker = document.getElementById('btn-rotate-sticker');
    if (btnRotateSticker) {
      btnRotateSticker.addEventListener('click', () => {
        if (!this.editor.selectedSticker) {
          this.showToast('Pilih stiker di kanvas terlebih dahulu.');
          return;
        }
        this.playTone(750, 0.04);
        this.editor.rotateSelectedSticker(Math.PI / 12);
      });
    }

    // Tombol Perbesar Stiker
    const btnScaleUp = document.getElementById('btn-scale-up-sticker');
    if (btnScaleUp) {
      btnScaleUp.addEventListener('click', () => {
        if (!this.editor.selectedSticker) {
          this.showToast('Pilih stiker di kanvas terlebih dahulu.');
          return;
        }
        this.playTone(850, 0.04);
        this.editor.scaleSelectedSticker(1.15);
      });
    }

    // Tombol Perkecil Stiker
    const btnScaleDown = document.getElementById('btn-scale-down-sticker');
    if (btnScaleDown) {
      btnScaleDown.addEventListener('click', () => {
        if (!this.editor.selectedSticker) {
          this.showToast('Pilih stiker di kanvas terlebih dahulu.');
          return;
        }
        this.playTone(650, 0.04);
        this.editor.scaleSelectedSticker(0.87);
      });
    }

    // Tombol Undo Coretan
    const btnUndo = document.getElementById('btn-draw-undo');
    btnUndo.addEventListener('click', () => {
      this.playTone(600, 0.06);
      this.editor.undoDrawing();
    });

    // Tombol Clear Coretan
    const btnClearDraw = document.getElementById('btn-draw-clear');
    btnClearDraw.addEventListener('click', () => {
      this.playTone(400, 0.08);
      this.editor.clearDrawing();
    });

    // Toggle Kuas vs Penghapus
    const btnBrushMode = document.getElementById('btn-brush-mode');
    const btnEraserMode = document.getElementById('btn-eraser-mode');
    btnBrushMode.addEventListener('click', () => {
      this.playTone(750, 0.05);
      this.editor.isEraser = false;
      btnBrushMode.classList.add('active');
      btnEraserMode.classList.remove('active');
    });
    btnEraserMode.addEventListener('click', () => {
      this.playTone(750, 0.05);
      this.editor.isEraser = true;
      btnEraserMode.classList.add('active');
      btnBrushMode.classList.remove('active');
    });

    // Tombol "Foto Ulang"
    const btnRetake = document.getElementById('btn-editor-retake');
    btnRetake.addEventListener('click', async () => {
      this.playTone(500, 0.06);
      this.showScreen('camera');
      await this.camera.startCamera();
    });

    // Tombol "Selesai" (Simpan & Masuk Layar Hasil)
    const btnDone = document.getElementById('btn-editor-done');
    btnDone.addEventListener('click', async () => {
      this.playTone(1000, 0.12);
      await this.handlePhotoCompletion();
    });
  }

  /**
   * Menghasilkan pratinjau thumbnail untuk semua filter
   */
  generateFilterThumbnails() {
    const container = document.getElementById('filter-carousel');
    container.innerHTML = '<div class="loading-spinner"></div>';

    this.editor.generateFilterPreviews((previews) => {
      container.innerHTML = '';
      FILTER_LIST.forEach(f => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `filter-thumb-card ${f.id === this.editor.currentFilterId ? 'active' : ''}`;
        item.dataset.filterId = f.id;

        item.innerHTML = `
          <div class="filter-thumb-img-wrap">
            <img src="${previews[f.id] || ''}" alt="${f.name}" class="filter-thumb-img" />
            <span class="filter-thumb-badge">${f.badge}</span>
          </div>
          <span class="filter-thumb-name">${f.name}</span>
        `;

        item.addEventListener('click', () => {
          this.playTone(900, 0.04);
          document.querySelectorAll('.filter-thumb-card').forEach(c => c.classList.remove('active'));
          item.classList.add('active');
          this.editor.applyFilter(f.id);
        });

        container.appendChild(item);
      });
    });
  }

  /**
   * Render daftar stiker berdasarkan kategori
   */
  renderStickerPacks() {
    const container = document.getElementById('sticker-grid');
    container.innerHTML = '';

    STICKER_PACKS.forEach(pack => {
      const section = document.createElement('div');
      section.className = 'sticker-pack-section';

      const heading = document.createElement('h4');
      heading.className = 'sticker-pack-title';
      heading.textContent = pack.title;
      section.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = 'sticker-pack-items';

      pack.items.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sticker-item-btn';
        btn.title = item.name;

        if (item.type === 'svg') {
          btn.innerHTML = `<div class="sticker-item-svg">${item.svg}</div><span class="sticker-item-label">${item.name}</span>`;
        } else {
          btn.innerHTML = `<span class="sticker-item-emoji">${item.char}</span><span class="sticker-item-label">${item.name}</span>`;
        }

        btn.addEventListener('click', () => {
          this.playTone(950, 0.05);
          this.editor.addSticker(item);
          this.showToast(`Stiker "${item.name}" ditambahkan!`);
        });

        grid.appendChild(btn);
      });

      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  /**
   * Render palet warna kuas coretan
   */
  renderBrushPalette() {
    const container = document.getElementById('palette-colors');
    container.innerHTML = '';

    BRUSH_PALETTE.forEach((item, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `palette-color-dot ${idx === 0 ? 'active' : ''}`;
      dot.style.backgroundColor = item.color;
      dot.title = item.name;

      dot.addEventListener('click', () => {
        this.playTone(800, 0.04);
        document.querySelectorAll('.palette-color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.editor.brushColor = item.color;
        // Kembali ke mode kuas jika sedang eraser
        this.editor.isEraser = false;
        document.getElementById('btn-brush-mode').classList.add('active');
        document.getElementById('btn-eraser-mode').classList.remove('active');
      });

      container.appendChild(dot);
    });
  }

  /**
   * Render pilihan ukuran kuas
   */
  renderBrushSizes() {
    const container = document.getElementById('brush-sizes');
    container.innerHTML = '';

    BRUSH_SIZES.forEach((b, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `brush-size-btn ${idx === 1 ? 'active' : ''}`;
      btn.innerHTML = `<span class="brush-size-dot" style="width:${Math.max(6, b.size * 0.6)}px; height:${Math.max(6, b.size * 0.6)}px;"></span><span>${b.label}</span>`;

      btn.addEventListener('click', () => {
        this.playTone(800, 0.04);
        document.querySelectorAll('.brush-size-btn').forEach(d => d.classList.remove('active'));
        btn.classList.add('active');
        this.editor.brushSize = b.size;
      });

      container.appendChild(btn);
    });
  }

  /**
   * =====================================================================
   * INISIALISASI UPLOADER
   * =====================================================================
   */
  initUploader() {
    this.uploader = new DriveUploader({
      onProgress: (pct, msg) => {
        this.updateUploadProgress(pct, msg);
      }
    });
  }

  updateUploadProgress(pct, msg) {
    const bar = document.getElementById('upload-progress-fill');
    const text = document.getElementById('upload-status-text');
    if (bar) bar.style.width = `${pct}%`;
    if (text) text.textContent = msg;
  }

  /**
   * =====================================================================
   * ALUR SELESAI FOTO & LAYAR HASIL
   * =====================================================================
   */
  async handlePhotoCompletion() {
    this.showScreen('result');

    const resultImg = document.getElementById('result-preview-img');
    const loadingCard = document.getElementById('upload-loading-card');
    const successCard = document.getElementById('upload-success-card');
    const errorCard = document.getElementById('upload-error-card');

    // Tampilkan loading, sembunyikan sukses & error
    loadingCard.classList.remove('hidden');
    successCard.classList.add('hidden');
    errorCard.classList.add('hidden');
    this.updateUploadProgress(10, 'Menyiapkan komposit foto...');

    try {
      // Ekspor kanvas 1080x1920 ke JPEG
      const { blob, dataUrl, size } = await this.editor.exportFinalImage(PHOTO_CONFIG.jpegQuality);
      this.currentPhotoBlob = blob;
      this.currentPhotoDataUrl = dataUrl;
      this.currentFilename = this.uploader.generateFilename();

      console.log(`Foto komposit berhasil diekspor: ${(size / 1024).toFixed(1)} KB`);

      // Tampilkan pratinjau di layar hasil
      resultImg.src = dataUrl;

      // Unggah ke Google Drive via Apps Script
      const result = await this.uploader.uploadPhoto(blob);
      this.uploadedResult = result;

      loadingCard.classList.add('hidden');

      if (result.success) {
        // Tampilkan kartu sukses & buat QR Code dengan URL Download Google Drive
        successCard.classList.remove('hidden');
        this.generateQrCode(result.downloadUrl);
        this.showToast('Foto berhasil disimpan ke Google Drive!', 'success');
      } else {
        // Mode Fallback (misal URL belum di-deploy atau koneksi offline)
        errorCard.classList.remove('hidden');
        const errorMsg = document.getElementById('upload-error-desc');
        if (result.isConfigMissing) {
          errorMsg.textContent = 'Apps Script belum di-deploy. Jangan khawatir, kamu tetap bisa mengunduh fotomu langsung di bawah!';
          // Tetap buatkan QR Code menuju link folder drive atau info
          this.generateQrCode(result.driveFolderUrl);
        } else {
          errorMsg.textContent = result.error || 'Gagal tersambung ke Google Drive.';
          this.generateQrCode(result.driveFolderUrl);
        }
      }

    } catch (err) {
      console.error('Gagal menyelesaikan foto:', err);
      loadingCard.classList.add('hidden');
      errorCard.classList.remove('hidden');
      this.showToast('Terjadi kesalahan saat memproses foto.', 'error');
    }
  }

  /**
   * Menghasilkan QR Code menggunakan qrcode-generator
   */
  generateQrCode(url) {
    const qrContainer = document.getElementById('qr-code-display');
    qrContainer.innerHTML = '';

    try {
      if (typeof window.qrcode === 'function') {
        const qr = window.qrcode(0, 'M');
        qr.addData(url);
        qr.make();
        // cellSize 6, margin 2
        const imgTag = qr.createImgTag(6, 2);
        qrContainer.innerHTML = imgTag;
        return;
      }
    } catch (e) {
      console.warn('Gagal membuat QR via library:', e);
    }

    // Fallback jika library belum termuat: gunakan API QR image lightweight
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`;
    img.alt = 'QR Code Unduhan';
    img.className = 'qr-img-responsive';
    qrContainer.appendChild(img);
  }

  /**
   * Unduh foto langsung ke perangkat pengguna
   */
  downloadCurrentPhoto() {
    if (!this.currentPhotoDataUrl) {
      this.showToast('Belum ada foto untuk diunduh.', 'error');
      return;
    }

    this.playTone(1100, 0.1);
    const link = document.createElement('a');
    link.download = this.currentFilename || `UNV-Gathering-2026_${Date.now()}.jpg`;
    link.href = this.currentPhotoDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Foto tersimpan di perangkatmu!', 'success');
  }

  /**
   * =====================================================================
   * RESET APLIKASI / FOTO LAGI
   * =====================================================================
   */
  resetToStart() {
    this.playTone(600, 0.08);
    this.cancelKioskCountdown();
    this.camera.stopCamera();
    this.editor.clearDrawing();
    this.editor.clearAllStickers();
    this.currentPhotoBlob = null;
    this.currentPhotoDataUrl = null;
    this.currentFilename = null;
    this.uploadedResult = null;
    this.showScreen('landing');
  }

  /**
   * =====================================================================
   * MODE KIOSK: AUTO RESET 60 DETIK
   * =====================================================================
   */
  initKioskTracker() {
    const activityEvents = ['pointerdown', 'pointermove', 'keydown', 'touchstart'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, () => {
        if (this.currentScreen === 'result') {
          this.resetKioskInactivityTimer();
        }
      }, { passive: true });
    });
  }

  startKioskInactivityTimer() {
    this.cancelKioskCountdown();
    const idleSeconds = PHOTO_CONFIG.kioskInactivitySeconds - PHOTO_CONFIG.kioskWarningSeconds; // 50 detik
    this.inactivityTimer = setTimeout(() => {
      this.showKioskWarning();
    }, idleSeconds * 1000);
  }

  resetKioskInactivityTimer() {
    if (this.currentScreen === 'result' && !this.warningTimer) {
      clearTimeout(this.inactivityTimer);
      this.startKioskInactivityTimer();
    }
  }

  showKioskWarning() {
    const modal = document.getElementById('kiosk-modal');
    const countText = document.getElementById('kiosk-countdown-number');
    if (!modal) return;

    modal.classList.add('modal-active');
    this.warningCountdown = PHOTO_CONFIG.kioskWarningSeconds;
    if (countText) countText.textContent = this.warningCountdown;

    this.warningTimer = setInterval(() => {
      this.warningCountdown -= 1;
      if (countText) countText.textContent = this.warningCountdown;
      if (this.warningCountdown <= 0) {
        clearInterval(this.warningTimer);
        this.warningTimer = null;
        modal.classList.remove('modal-active');
        this.resetToStart();
      }
    }, 1000);
  }

  cancelKioskCountdown() {
    clearTimeout(this.inactivityTimer);
    clearInterval(this.warningTimer);
    this.inactivityTimer = null;
    this.warningTimer = null;
    const modal = document.getElementById('kiosk-modal');
    if (modal) modal.classList.remove('modal-active');
  }

  /**
   * =====================================================================
   * GLOBAL EVENT BINDING
   * =====================================================================
   */
  bindGlobalEvents() {
    // Tombol Landing: "Mulai Foto"
    const btnStart = document.getElementById('btn-start-photo');
    btnStart.addEventListener('click', async () => {
      this.playTone(950, 0.1);
      this.showScreen('camera');
      await this.camera.startCamera('user');
    });

    // Tombol Hasil: Unduh Langsung
    const btnDownloadSuccess = document.getElementById('btn-download-direct');
    if (btnDownloadSuccess) {
      btnDownloadSuccess.addEventListener('click', () => this.downloadCurrentPhoto());
    }

    const btnDownloadFallback = document.getElementById('btn-download-fallback');
    if (btnDownloadFallback) {
      btnDownloadFallback.addEventListener('click', () => this.downloadCurrentPhoto());
    }

    // Tombol Hasil: Coba Lagi Upload
    const btnRetryUpload = document.getElementById('btn-retry-upload');
    if (btnRetryUpload) {
      btnRetryUpload.addEventListener('click', async () => {
        this.playTone(850, 0.08);
        if (this.currentPhotoBlob) {
          const loadingCard = document.getElementById('upload-loading-card');
          const errorCard = document.getElementById('upload-error-card');
          const successCard = document.getElementById('upload-success-card');
          loadingCard.classList.remove('hidden');
          errorCard.classList.add('hidden');
          successCard.classList.add('hidden');

          const res = await this.uploader.uploadPhoto(this.currentPhotoBlob);
          loadingCard.classList.add('hidden');
          if (res.success) {
            successCard.classList.remove('hidden');
            this.generateQrCode(res.downloadUrl);
            this.showToast('Upload berhasil!', 'success');
          } else {
            errorCard.classList.remove('hidden');
            this.showToast('Upload masih gagal. Silakan unduh lokal.', 'error');
          }
        }
      });
    }

    // Tombol Hasil: "Foto Lagi"
    const btnFotoLagi1 = document.getElementById('btn-foto-lagi');
    if (btnFotoLagi1) {
      btnFotoLagi1.addEventListener('click', () => this.resetToStart());
    }
    const btnFotoLagi2 = document.getElementById('btn-foto-lagi-fallback');
    if (btnFotoLagi2) {
      btnFotoLagi2.addEventListener('click', () => this.resetToStart());
    }

    // Tombol Batal Kiosk Modal
    const btnCancelKiosk = document.getElementById('btn-cancel-kiosk');
    if (btnCancelKiosk) {
      btnCancelKiosk.addEventListener('click', () => {
        this.playTone(700, 0.06);
        this.cancelKioskCountdown();
        this.startKioskInactivityTimer();
        this.showToast('Sesi diperpanjang.');
      });
    }
  }

  /**
   * Helper Notifikasi Toast Ramah
   */
  showToast(message, type = 'info') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast-active toast-${type}`;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('toast-active');
    }, 3200);
  }
}

// Inisialisasi Aplikasi (berjalan baik saat DOM masih loading maupun sudah ready)
function bootPhotobooth() {
  if (!window.photoboothApp) {
    try {
      console.log('Memulai Photobooth UNV Gathering 2026...');
      window.photoboothApp = new PhotoboothApp();
      console.log('Photobooth App berhasil aktif & siap digunakan!');
    } catch (err) {
      console.error('Gagal menginisialisasi Photobooth App:', err);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootPhotobooth);
} else {
  bootPhotobooth();
}


})(window, document);