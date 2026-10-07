/**
 * =======================================================================
 * MODUL UPLOAD GOOGLE DRIVE (VIA GOOGLE APPS SCRIPT WEB APP)
 * Mengirim payload base64 JPEG dengan Content-Type text/plain (CORS-safe)
 * Dilengkapi timeout 30 detik dan auto-retry 2 kali.
 * =======================================================================
 */

import { APPS_SCRIPT_URL, DRIVE_FOLDER_ID } from './config.js';

export class DriveUploader {
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
