const fs = require('fs');
const path = require('path');

function cleanFile(content) {
  // Remove import statements (single-line and multi-line)
  content = content.replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];?/g, '');
  content = content.replace(/import\s+[\w*\s{},$]+\s+from\s*['"][^'"]+['"];?/g, '');
  
  // Replace export keywords
  content = content.replace(/export\s+const\s+/g, 'const ');
  content = content.replace(/export\s+let\s+/g, 'let ');
  content = content.replace(/export\s+class\s+/g, 'class ');
  content = content.replace(/export\s+function\s+/g, 'function ');
  content = content.replace(/export\s+default\s+/g, '');
  
  return content;
}

const config = cleanFile(fs.readFileSync(path.join(__dirname, 'js/config.js'), 'utf8'));
const camera = cleanFile(fs.readFileSync(path.join(__dirname, 'js/camera.js'), 'utf8'));
const editor = cleanFile(fs.readFileSync(path.join(__dirname, 'js/editor.js'), 'utf8'));
const upload = cleanFile(fs.readFileSync(path.join(__dirname, 'js/upload.js'), 'utf8'));
const app = cleanFile(fs.readFileSync(path.join(__dirname, 'js/app.js'), 'utf8'));

const bundle = [
  '/**',
  ' * Photobooth App Standalone Bundle',
  ' * Compatible with both file:// and http(s):// protocols without CORS restrictions.',
  ' */',
  '(function(window, document) {',
  '  "use strict";',
  '',
  '  // ========================================== ',
  '  // 1. CONFIGURATION',
  '  // ========================================== ',
  config,
  '',
  '  // ========================================== ',
  '  // 2. CAMERA MANAGER',
  '  // ========================================== ',
  camera,
  '',
  '  // ========================================== ',
  '  // 3. PHOTO EDITOR (CANVAS 2D)',
  '  // ========================================== ',
  editor,
  '',
  '  // ========================================== ',
  '  // 4. DRIVE UPLOADER',
  '  // ========================================== ',
  upload,
  '',
  '  // ========================================== ',
  '  // 5. MAIN APPLICATION & BOOTSTRAP',
  '  // ========================================== ',
  app,
  '',
  '})(window, document);'
].join('\n');

fs.writeFileSync(path.join(__dirname, 'js/bundle.js'), bundle, 'utf8');
console.log('Created js/bundle.js successfully. Total bytes:', Buffer.byteLength(bundle, 'utf8'));
