<?php
require_once '../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'employee') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$application_id = intval($input['application_id']);
$remarks = $conn->real_escape_string($input['remarks']);
$employee_id = $_SESSION['user_id'];

$query = "UPDATE applications 
          SET status = 'FOR_REVISION', reviewed_by = $employee_id, remarks = '$remarks' 
          WHERE application_id = $application_id";

if ($conn->query($query)) {
    echo json_encode([
        'success' => true,
        'message' => 'Revision request sent successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to request revision: ' . $conn->error
    ]);
}
?>