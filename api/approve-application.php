<?php
require_once '../config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'employee') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['application_id']) || !isset($input['receipt_number']) || !isset($input['receipt_amount'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$application_id = intval($input['application_id']);
$receipt_number = $conn->real_escape_string($input['receipt_number']);
$receipt_amount = floatval($input['receipt_amount']);
$approval_notes = isset($input['approval_notes']) ? $conn->real_escape_string($input['approval_notes']) : '';
$employee_id = $_SESSION['user_id'];

$receipt_file_path = 'Receipt_' . $receipt_number . '.pdf';

if (isset($input['receipt_file_name']) && !empty($input['receipt_file_name'])) {
    $receipt_file_path = $input['receipt_file_name'];
}

$query = "UPDATE applications 
          SET status = 'APPROVED', 
              reviewed_by = $employee_id, 
              approval_date = NOW(),
              receipt_number = '$receipt_number',
              receipt_amount = $receipt_amount,
              receipt_file = '$receipt_file_path',
              remarks = '$approval_notes'
          WHERE application_id = $application_id";

if ($conn->query($query)) {
    $app_query = "SELECT a.*, c.email as customer_email, c.first_name, c.last_name 
                  FROM applications a 
                  JOIN customers c ON a.customer_id = c.customer_id 
                  WHERE a.application_id = $application_id";
    $app_result = $conn->query($app_query);
    
    if ($app_result && $app_result->num_rows > 0) {
        $app_data = $app_result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => 'Application approved successfully',
            'receipt_info' => [
                'receipt_number' => $receipt_number,
                'receipt_amount' => $receipt_amount,
                'receipt_file' => $receipt_file_path,
                'customer_email' => $app_data['customer_email'],
                'customer_name' => $app_data['first_name'] . ' ' . $app_data['last_name']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Application approved successfully'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to approve application: ' . $conn->error
    ]);
}
?>
