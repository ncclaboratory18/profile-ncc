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
$approved = isset($input['approved']) ? (bool) $input['approved'] : null;

if ($id <= 0 || $approved === null) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Parameter tidak lengkap"]);
    exit;
}

try {
    if ($approved) {
        // Set approved = TRUE dan approved_at = NOW()
        $stmt = $conn->prepare("UPDATE pendaftar SET approved = TRUE, approved_at = NOW() WHERE id = ?");
    } else {
        // Set approved = FALSE dan approved_at = NULL
        $stmt = $conn->prepare("UPDATE pendaftar SET approved = FALSE, approved_at = NULL WHERE id = ?");
    }

    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => $approved ? "Pendaftar di-approve" : "Approval dicabut"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal update: " . $stmt->error]);
    }

    $stmt->close();
    mysqli_close($conn);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Exception: " . $e->getMessage()]);
}
