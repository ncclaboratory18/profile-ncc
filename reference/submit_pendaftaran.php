<?php
// Tampilkan error untuk debugging (hapus di production nanti)
// ini_set('display_errors', 1);
// error_reporting(E_ALL);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

try {
    require_once __DIR__ . '/components/conn.php';

    // === Ambil data POST ===
    $email = trim($_POST['email'] ?? '');
    $nama = trim($_POST['nama'] ?? '');
    $nim_nik = trim($_POST['nim_nik'] ?? '');
    $no_whatsapp = trim($_POST['no_whatsapp'] ?? '');
    $asal_instansi = trim($_POST['asal_instansi'] ?? '');
    $kategori = $_POST['kategori'] ?? '';
    $paket = $_POST['paket'] ?? '';
    $kategori_pelatihan = $_POST['kategori_pelatihan'] ?? '';

    // === Validasi teks ===
    if (empty($email) || empty($nama) || empty($nim_nik) || empty($no_whatsapp) || empty($asal_instansi)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Semua field teks wajib diisi"]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format email tidak valid"]);
        exit;
    }

    $validKategori = ['Mahasiswa', 'Umum'];
    $validPaket = ['A', 'B', 'Semua'];
    $validPelatihan = ['Online', 'Offline'];

    if (!in_array($kategori, $validKategori) || !in_array($paket, $validPaket) || !in_array($kategori_pelatihan, $validPelatihan)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Pilihan kategori/paket/pelatihan tidak valid"]);
        exit;
    }

    // === Validasi & Upload File ===
    $allowedExts = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    $maxSize = 10 * 1024 * 1024; // 10 MB

    function handleUpload($fileKey, $uploadDir, $relativePath)
    {
        global $allowedExts, $maxSize;

        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            $errorCode = isset($_FILES[$fileKey]) ? $_FILES[$fileKey]['error'] : 'not set';
            return ["error" => "File $fileKey gagal diupload (error code: $errorCode)"];
        }

        $file = $_FILES[$fileKey];

        if ($file['size'] > $maxSize) {
            return ["error" => "Ukuran file $fileKey melebihi 10 MB"];
        }

        // Validasi ekstensi file
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExts)) {
            return ["error" => "Tipe file $fileKey tidak diizinkan (hanya PDF, JPG, PNG, WEBP)"];
        }

        // Buat folder jika belum ada
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                return ["error" => "Gagal membuat folder upload untuk $fileKey"];
            }
        }

        // Rename file unik
        $newName = uniqid() . '_' . time() . '.' . $ext;
        $destination = $uploadDir . $newName;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            return ["error" => "Gagal menyimpan file $fileKey ke server"];
        }

        // Simpan path relatif (untuk URL web)
        return ["path" => $relativePath . $newName];
    }

    $ktmResult = handleUpload('file_ktm', __DIR__ . '/uploads/ktm/', 'uploads/ktm/');
    if (isset($ktmResult['error'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => $ktmResult['error']]);
        exit;
    }

    $bayarResult = handleUpload('file_bukti_bayar', __DIR__ . '/uploads/bukti_bayar/', 'uploads/bukti_bayar/');
    if (isset($bayarResult['error'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => $bayarResult['error']]);
        exit;
    }

    // === Insert ke database ===
    $stmt = $conn->prepare("INSERT INTO pendaftar (email, nama, nim_nik, no_whatsapp, asal_instansi, kategori, paket, kategori_pelatihan, file_ktm, file_bukti_bayar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssssss", $email, $nama, $nim_nik, $no_whatsapp, $asal_instansi, $kategori, $paket, $kategori_pelatihan, $ktmResult['path'], $bayarResult['path']);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Pendaftaran berhasil! Silakan hubungi CP untuk konfirmasi."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal menyimpan data: " . $stmt->error]);
    }

    $stmt->close();
    mysqli_close($conn);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Exception: " . $e->getMessage()]);
}
