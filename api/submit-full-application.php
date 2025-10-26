<?php
require_once '../config.php';

header('Content-Type: application/json');

// 1. Check user authorization
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'customer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$customer_id = $_SESSION['user_id'];

// 2. Validate required POST data
$required_fields = ['application_type', 'business_name', 'business_address', 'business_type'];
foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        echo json_encode(['success' => false, 'message' => "Error: Missing required field - $field"]);
        exit;
    }
}

// 2.5. Validate and handle payment proof upload
if (!isset($_FILES['payment_proof']) || $_FILES['payment_proof']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Payment proof is required']);
    exit;
}

$payment_proof_path = null;
$upload_dir = '../uploads/payment_proofs/';

// Create directory if it doesn't exist
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$file_tmp = $_FILES['payment_proof']['tmp_name'];
$file_name = $_FILES['payment_proof']['name'];
$file_size = $_FILES['payment_proof']['size'];
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

// Validate file
$allowed_extensions = ['jpg', 'jpeg', 'png'];
if (!in_array($file_ext, $allowed_extensions)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file format. Only JPG and PNG are allowed']);
    exit;
}

if ($file_size > 5242880) { // 5MB limit
    echo json_encode(['success' => false, 'message' => 'File size exceeds 5MB limit']);
    exit;
}

// Generate unique filename
$new_filename = 'payment_' . $customer_id . '_' . time() . '.' . $file_ext;
$upload_path = $upload_dir . $new_filename;

if (!move_uploaded_file($file_tmp, $upload_path)) {
    echo json_encode(['success' => false, 'message' => 'Failed to upload payment proof']);
    exit;
}

$payment_proof_path = 'uploads/payment_proofs/' . $new_filename;

// 3. Start a database transaction
$conn->autocommit(FALSE);

try {
    // 4. Insert application details into the 'applications' table
    $stmt = $conn->prepare("INSERT INTO applications (customer_id, application_type, business_name, business_address, business_type, payment_proof, status, application_date) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NOW())");
    $stmt->bind_param("isssss", $customer_id, $_POST['application_type'], $_POST['business_name'], $_POST['business_address'], $_POST['business_type'], $payment_proof_path);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create application record: ' . $stmt->error);
    }

    // 5. Get the newly created application ID
    $application_id = $conn->insert_id;
    $stmt->close();

    // 6. Create placeholder document records (for presentation purposes)
    $document_types = [
        'Proof of Payment Transaction', 
        'Application Form', 'Certificate of Registration', 'Barangay Business Clearance', 'Community Tax Certificate', 
        'Contract of Lease / Title', 'Sketch/Pictures of Business Location', 'Public Liability Insurance', 
        'Locational/Zoning Clearance', 'Certificate of Occupancy', 'Building Permit & Electrical Cert.', 
        'Sanitary Permit', 'Fire Safety Inspection Permit'
    ];
    
    // Insert placeholder documents
    $doc_stmt = $conn->prepare("INSERT INTO documents (application_id, document_type, file_path) VALUES (?, ?, ?)");
    
    foreach ($document_types as $doc_type) {
        $placeholder_path = 'N/A';
        $doc_stmt->bind_param("iss", $application_id, $doc_type, $placeholder_path);
        $doc_stmt->execute();
    }
    $doc_stmt->close();

    // 7. Commit the transaction
    $conn->commit();
    $conn->autocommit(TRUE);

    echo json_encode([
        'success' => true,
        'message' => "Application submitted successfully with all required documents.",
        'application_id' => $application_id
    ]);

} catch (Exception $e) {
    // 9. Rollback the transaction on any error
    $conn->rollback();
    $conn->autocommit(TRUE);
    
    // Delete uploaded payment proof file if transaction fails
    if ($payment_proof_path && file_exists('../' . $payment_proof_path)) {
        unlink('../' . $payment_proof_path);
    }
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
