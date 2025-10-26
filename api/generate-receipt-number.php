<?php
require_once '../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'employee') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get the last receipt number from the database
$query = "SELECT receipt_number FROM applications 
          WHERE receipt_number IS NOT NULL 
          AND receipt_number REGEXP '^[0-9]+$'
          ORDER BY CAST(receipt_number AS UNSIGNED) DESC 
          LIMIT 1";

$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $last_number = intval($row['receipt_number']);
    $next_number = $last_number + 1;
} else {
    // Start from 1 if no receipts exist yet
    $next_number = 1;
}

// Format as 6-digit number with leading zeros
$receipt_number = str_pad($next_number, 6, '0', STR_PAD_LEFT);

echo json_encode([
    'success' => true,
    'receipt_number' => $receipt_number
]);
?>
