/**
 * =======================================================================
 * MODUL KAMERA PHOTOBOOTH
 * Menangani getUserMedia, timer countdown, switch kamera, mirror,
 * cover-crop 9:16, dan fallback upload galeri.
 * =======================================================================
 */

import { PHOTO_CONFIG } from './config.js';

export class CameraManager {
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
