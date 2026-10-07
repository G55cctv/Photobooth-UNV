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

import { PHOTO_CONFIG, FRAME_CONFIG, FILTER_LIST, BRUSH_PALETTE, BRUSH_SIZES } from './config.js';

export class PhotoEditor {
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
