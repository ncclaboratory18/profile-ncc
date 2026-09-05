<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . '/../components/conn.php';

$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID tidak valid"]);
    exit;
}

try {
    // Ambil path file untuk dihapus
    $stmt = $conn->prepare("SELECT file_ktm, file_bukti_bayar FROM pendaftar WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    if (!$row) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Data tidak ditemukan"]);
        exit;
    }

    // Hapus file fisik
    $baseDir = __DIR__ . '/../';
    if ($row['file_ktm'] && file_exists($baseDir . $row['file_ktm'])) {
        unlink($baseDir . $row['file_ktm']);
    }
    if ($row['file_bukti_bayar'] && file_exists($baseDir . $row['file_bukti_bayar'])) {
        unlink($baseDir . $row['file_bukti_bayar']);
    }

    // Hapus dari database
    $stmt = $conn->prepare("DELETE FROM pendaftar WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Data berhasil dihapus"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal menghapus: " . $stmt->error]);
    }

    $stmt->close();
    mysqli_close($conn);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Exception: " . $e->getMessage()]);
}
