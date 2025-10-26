<?php<?php

require_once '../config.php';require_once '../config.php';



header('Content-Type: application/json');header('Content-Type: application/json');



if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'employee') {if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'employee') {

    echo json_encode(['success' => false, 'message' => 'Unauthorized']);    echo json_encode(['success' => false, 'message' => 'Unauthorized']);

    exit;    exit;

}}



// Validate required fields$input = json_decode(file_get_contents('php://input'), true);

if (!isset($_POST['application_id']) || !isset($_POST['receipt_number']) || !isset($_POST['receipt_amount'])) {$application_id = intval($input['application_id']);

    echo json_encode(['success' => false, 'message' => 'Missing required fields']);$employee_id = $_SESSION['user_id'];

    exit;

}$query = "UPDATE applications 

          SET status = 'APPROVED', reviewed_by = $employee_id, approval_date = NOW() 

$application_id = intval($_POST['application_id']);          WHERE application_id = $application_id";

$receipt_number = $conn->real_escape_string($_POST['receipt_number']);

$receipt_amount = floatval($_POST['receipt_amount']);if ($conn->query($query)) {

$approval_notes = isset($_POST['approval_notes']) ? $conn->real_escape_string($_POST['approval_notes']) : '';    echo json_encode([

$employee_id = $_SESSION['user_id'];        'success' => true,

        'message' => 'Application approved successfully'

// Handle receipt file upload    ]);

$receipt_file_path = null;} else {

if (isset($_FILES['receipt_file']) && $_FILES['receipt_file']['error'] === UPLOAD_ERR_OK) {    echo json_encode([

    $upload_dir = '../uploads/receipts/';        'success' => false,

            'message' => 'Failed to approve application: ' . $conn->error

    // Create directory if it doesn't exist    ]);

    if (!file_exists($upload_dir)) {}

        mkdir($upload_dir, 0777, true);?>
    }
    
    $file_tmp = $_FILES['receipt_file']['tmp_name'];
    $file_name = $_FILES['receipt_file']['name'];
    $file_size = $_FILES['receipt_file']['size'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    
    // Validate file
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf'];
    if (!in_array($file_ext, $allowed_extensions)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file format. Only JPG, PNG, and PDF are allowed']);
        exit;
    }
    
    if ($file_size > 5242880) { // 5MB limit
        echo json_encode(['success' => false, 'message' => 'File size exceeds 5MB limit']);
        exit;
    }
    
    // Generate unique filename
    $new_filename = 'receipt_' . $application_id . '_' . time() . '.' . $file_ext;
    $upload_path = $upload_dir . $new_filename;
    
    if (move_uploaded_file($file_tmp, $upload_path)) {
        $receipt_file_path = 'uploads/receipts/' . $new_filename;
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload receipt file']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Receipt file is required']);
    exit;
}

// Update application with approval and receipt information
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
    echo json_encode([
        'success' => true,
        'message' => 'Application approved successfully'
    ]);
} else {
    // Delete uploaded file if database update fails
    if ($receipt_file_path && file_exists('../' . $receipt_file_path)) {
        unlink('../' . $receipt_file_path);
    }
    echo json_encode([
        'success' => false,
        'message' => 'Failed to approve application: ' . $conn->error
    ]);
}
?>
