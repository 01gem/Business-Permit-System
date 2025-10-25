<?php
require_once '../config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

// Get application_id from query parameter
if (!isset($_GET['application_id'])) {
    echo json_encode(['success' => false, 'message' => 'Application ID is required']);
    exit;
}

$application_id = (int)$_GET['application_id'];

// Get documents for the application
$query = "SELECT d.*, a.application_id, a.business_name 
          FROM documents d
          JOIN applications a ON d.application_id = a.application_id
          WHERE d.application_id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param('i', $application_id);
$stmt->execute();
$result = $stmt->get_result();

$documents = [];
while ($row = $result->fetch_assoc()) {
    $documents[] = $row;
}

echo json_encode([
    'success' => true,
    'documents' => $documents
]);
?>
