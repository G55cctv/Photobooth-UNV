/**
 * =======================================================================
 * GOOGLE APPS SCRIPT - PHOTOBOOTH UPLOAD HANDLER
 * UNV PARTNER & INSTALLER GATHERING 2026
 * Baraja Coffee Amphitheater Cirebon
 * Penyelenggara: GSS HUB x UNV x Ultima Sinergi Perkasa
 * =======================================================================
 */

// Target Folder ID Google Drive untuk menyimpan foto
var TARGET_FOLDER_ID = "1WfFUaBl6BNJIm-zwDzNdDIdF-eYnynWo";

/**
 * Endpoint GET untuk pengujian koneksi / health-check
 */
function doGet(e) {
  var response = {
    status: "ok",
    event: "UNV Partner & Installer Gathering 2026",
    message: "Google Apps Script Photobooth API siap menerima unggahan foto.",
    targetFolderId: TARGET_FOLDER_ID,
    timestamp: new Date().toISOString()
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * PENTING: Jalankan fungsi ini SEKALI di script.google.com (klik tombol 'Run')
 * untuk memicu dialog izin Google Drive (Review Permissions -> Allow)!
 */
function testDrivePermission() {
  var folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
  Logger.log("Folder tujuan ditemukan: " + folder.getName());
  var testBlob = Utilities.newBlob("UNV Gathering 2026 Photobooth OK", "text/plain", "test_permission.txt");
  var testFile = folder.createFile(testBlob);
  testFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  Logger.log("Berhasil membuat file tes ID: " + testFile.getId());
  testFile.setTrashed(true); // Bersihkan file tes
  Logger.log("Otorisasi Google Drive 100% Berhasil & Siap Digunakan!");
}

/**
 * Endpoint POST untuk menerima data base64 foto dan menyimpannya ke Google Drive
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: "Data permintaan kosong (no postData)"
      }, 400);
    }

    var requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        success: false,
        error: "Gagal memproses JSON: " + parseErr.toString()
      }, 400);
    }

    var base64Data = requestData.data;
    var mimeType = requestData.mimeType || "image/jpeg";
    var customFilename = requestData.filename;

    if (!base64Data) {
      return createJsonResponse({
        success: false,
        error: "Data base64 foto tidak ditemukan"
      }, 400);
    }

    // Bersihkan prefix data URL jika ada (misal: "data:image/jpeg;base64,")
    if (base64Data.indexOf(",") > -1) {
      base64Data = base64Data.split(",")[1];
    }

    // Validasi tipe konten yang diizinkan
    var validMimes = ["image/jpeg", "image/jpg", "image/png"];
    if (validMimes.indexOf(mimeType.toLowerCase()) === -1) {
      return createJsonResponse({
        success: false,
        error: "Tipe file tidak didukung: " + mimeType
      }, 400);
    }

    // Decode base64 menjadi blob
    var decodedBytes = Utilities.base64Decode(base64Data);
    
    // Validasi ukuran file (maksimal 10 MB)
    var maxBytes = 10 * 1024 * 1024;
    if (decodedBytes.length > maxBytes) {
      return createJsonResponse({
        success: false,
        error: "Ukuran file melebihi batas 10MB"
      }, 413);
    }

    // Format penamaan file otomatis: "UNV-Gathering-2026_YYYYMMDD-HHmmss.jpg"
    var finalFilename = customFilename;
    if (!finalFilename || finalFilename.trim() === "") {
      var now = new Date();
      var timeZone = Session.getScriptTimeZone() || "Asia/Jakarta";
      var timestamp = Utilities.formatDate(now, timeZone, "yyyyMMdd-HHmmss");
      var ext = mimeType === "image/png" ? ".png" : ".jpg";
      finalFilename = "UNV-Gathering-2026_" + timestamp + ext;
    }

    var blob = Utilities.newBlob(decodedBytes, mimeType, finalFilename);

    // Ambil folder Google Drive tujuan
    var folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    if (!folder) {
      return createJsonResponse({
        success: false,
        error: "Folder tujuan tidak ditemukan (ID: " + TARGET_FOLDER_ID + ")"
      }, 500);
    }

    // Simpan file ke Drive
    var file = folder.createFile(blob);

    // Set izin sharing agar siapa saja yang memiliki tautan dapat melihat/mengunduh
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var viewUrl = file.getUrl();
    // Direct download URL
    var downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
    // Alternative preview / thumbnail URL
    var previewUrl = "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing";

    var result = {
      success: true,
      fileId: fileId,
      filename: finalFilename,
      downloadUrl: downloadUrl,
      viewUrl: viewUrl,
      previewUrl: previewUrl,
      fileSize: decodedBytes.length,
      createdAt: new Date().toISOString()
    };

    return createJsonResponse(result, 200);

  } catch (err) {
    return createJsonResponse({
      success: false,
      error: "Terjadi kesalahan server: " + err.toString()
    }, 500);
  }
}

/**
 * Helper untuk format response JSON dengan CORS header
 */
function createJsonResponse(dataObj, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(dataObj))
    .setMimeType(ContentService.MimeType.JSON);
}
