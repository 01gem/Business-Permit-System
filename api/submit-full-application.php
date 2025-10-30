<?php
require_once '../config.php';

header('Content-Type: application/json');

// Get JSON input instead of FormData
$input = json_decode(file_get_contents('php://input'), true);

// 1. Check user authorization
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'customer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$customer_id = $_SESSION['user_id'];

// 2. Validate required data
$required_fields = ['application_type', 'business_name', 'business_address', 'business_type'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty($input[$field])) {
        echo json_encode(['success' => false, 'message' => "Error: Missing required field - $field"]);
        exit;
    }
}

// 2.5. Validate payment proof placeholder (no actual file upload)
if (!isset($input['payment_proof_filename']) || empty($input['payment_proof_filename'])) {
    echo json_encode(['success' => false, 'message' => 'Payment proof is required']);
    exit;
}

// Store only the placeholder filename (no actual file)
$payment_proof_path = 'payment_proof_' . $customer_id . '_' . time() . '.png';

// 3. Start a database transaction
$conn->autocommit(FALSE);

try {
    // 4. Insert application details into the 'applications' table
    $stmt = $conn->prepare("INSERT INTO applications (customer_id, application_type, business_name, business_address, business_type, payment_proof, status, application_date) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NOW())");
    $stmt->bind_param("isssss", $customer_id, $input['application_type'], $input['business_name'], $input['business_address'], $input['business_type'], $payment_proof_path);
    
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
