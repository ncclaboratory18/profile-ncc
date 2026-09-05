<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../components/conn.php';

try {
    // Sort: not approved (created_at ASC) dulu, lalu approved (approved_at ASC)
    $result = $conn->query("SELECT id, email, nama, nim_nik, no_whatsapp, asal_instansi, kategori, paket, kategori_pelatihan, file_ktm, file_bukti_bayar, approved, approved_at, created_at FROM pendaftar ORDER BY approved ASC, CASE WHEN approved = 0 THEN created_at END ASC, CASE WHEN approved = 1 THEN approved_at END ASC");

    $data = [];
    while ($row = $result->fetch_assoc()) {
        // Buat URL lewat proxy view_file.php (dilindungi Directory Privacy)
        if ($row['file_ktm']) {
            $row['file_ktm'] = 'view_file.php?file=' . urlencode($row['file_ktm']);
        }
        if ($row['file_bukti_bayar']) {
            $row['file_bukti_bayar'] = 'view_file.php?file=' . urlencode($row['file_bukti_bayar']);
        }
        // Cast approved to boolean
        $row['approved'] = (bool) $row['approved'];
        $data[] = $row;
    }

    echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

mysqli_close($conn);
