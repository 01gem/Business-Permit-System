<?php
require_once '../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$application_id = intval($_GET['id']);

$query = "SELECT * FROM applications WHERE application_id = $application_id";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $application = $result->fetch_assoc();
    
    // Check authorization
    if ($_SESSION['user_type'] === 'customer' && $application['customer_id'] != $_SESSION['user_id']) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'application' => $application
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Application not found'
    ]);
}
?>