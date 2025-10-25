<?php
require_once '../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'employee') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$application_id = intval($input['application_id']);
$permit_number = $conn->real_escape_string($input['permit_number']);
$expiration_date = $conn->real_escape_string($input['expiration_date']);

$query = "UPDATE applications 
          SET status = 'RELEASED', 
              permit_number = '$permit_number', 
              expiration_date = '$expiration_date',
              release_date = NOW() 
          WHERE application_id = $application_id AND status = 'APPROVED'";

if ($conn->query($query)) {
    if ($conn->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Permit released successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Application must be approved before release'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to release permit: ' . $conn->error
    ]);
}
?>