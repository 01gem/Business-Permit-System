<?php
require_once '../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'employee') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$application_id = intval($input['application_id']);
$employee_id = $_SESSION['user_id'];

$query = "UPDATE applications 
          SET status = 'APPROVED', reviewed_by = $employee_id, approval_date = NOW() 
          WHERE application_id = $application_id";

if ($conn->query($query)) {
    echo json_encode([
        'success' => true,
        'message' => 'Application approved successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to approve application: ' . $conn->error
    ]);
}
?>