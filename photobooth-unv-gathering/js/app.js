/**
 * =======================================================================
 * APLIKASI UTAMA PHOTOBOOTH (ES MODULES)
 * UNV PARTNER & INSTALLER GATHERING 2026
 * Baraja Coffee Amphitheater Cirebon
 * =======================================================================
 */

import {
  EVENT_CONFIG,
  PHOTO_CONFIG,
  FILTER_LIST,
  STICKER_PACKS,
  BRUSH_PALETTE,
  BRUSH_SIZES,
  DRIVE_FOLDER_ID
} from './config.js';

import { CameraManager } from './camera.js';
import { PhotoEditor } from './editor.js';
import { DriveUploader } from './upload.js';

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
