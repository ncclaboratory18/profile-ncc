<?php
// =======================
// KONFIGURASI DATABASE
// =======================
$host = "localhost";
$user = "lipistee_db_user";      // ganti dengan username database kamu
$pass = "]f,.X2v9NHbe";      // ganti dengan password database kamu
$db = "lipistee_db";   // ganti dengan nama database kamu

// =======================
// KONFIGURASI XAMPP
// =======================
// $host = "localhost";
// $user = "root";      // ganti dengan username database kamu
// $pass = "";      // ganti dengan password database kamu
// $db = "lipistee_db";   // ganti dengan nama database kamu

// =======================
// KONEKSI DATABASE
// =======================
$conn = mysqli_connect($host, $user, $pass, $db);

// Cek koneksi
if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}
