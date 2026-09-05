<?php
header('Content-Type: application/json');
// error_reporting(E_ALL);
// ini_set('display_errors', 0);

$response = [];

// Check MySQLi extension
if (!extension_loaded('mysqli')) {
    $response['status'] = 'error';
    $response['message'] = 'Ekstensi MySQLi tidak aktif di php.ini';
    echo json_encode($response);
    exit;
}

// Try connection
$host = "localhost";
$user = "lipistee_db_user";
$pass = "]f,.X2v9NHbe";
$db = "lipistee_db";

try {
    $conn = mysqli_connect($host, $user, $pass, $db);

    if ($conn) {
        $response['status'] = 'success';
        $response['message'] = 'Koneksi database berhasil!';
        $response['info'] = mysqli_get_host_info($conn);
        mysqli_close($conn);
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Gagal connect: ' . mysqli_connect_error();
    }
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Exception: ' . $e->getMessage();
}

echo json_encode($response);
