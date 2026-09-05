<?php
// File ini dilindungi oleh Directory Privacy cPanel (folder admin/)
// Hanya user yang sudah login yang bisa akses file upload

$file = $_GET['file'] ?? '';

if (empty($file)) {
    http_response_code(400);
    die('Parameter file tidak ditemukan.');
}

// Sanitasi: hanya izinkan karakter aman (huruf, angka, underscore, dot, slash)
if (!preg_match('/^[a-zA-Z0-9_\/\.\-]+$/', $file)) {
    http_response_code(400);
    die('Nama file tidak valid.');
}

// Cegah directory traversal
if (strpos($file, '..') !== false) {
    http_response_code(403);
    die('Akses ditolak.');
}

// Hanya izinkan file dari folder uploads/
$allowedPrefixes = ['uploads/ktm/', 'uploads/bukti_bayar/'];
$isAllowed = false;
foreach ($allowedPrefixes as $prefix) {
    if (strpos($file, $prefix) === 0) {
        $isAllowed = true;
        break;
    }
}

if (!$isAllowed) {
    http_response_code(403);
    die('Akses ditolak.');
}

$fullPath = __DIR__ . '/../' . $file;

if (!file_exists($fullPath)) {
    http_response_code(404);
    die('File tidak ditemukan.');
}

// Tentukan content type
$ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
$mimeTypes = [
    'pdf' => 'application/pdf',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
];

$contentType = $mimeTypes[$ext] ?? 'application/octet-stream';

header('Content-Type: ' . $contentType);
header('Content-Length: ' . filesize($fullPath));
header('Content-Disposition: inline; filename="' . basename($fullPath) . '"');

readfile($fullPath);
