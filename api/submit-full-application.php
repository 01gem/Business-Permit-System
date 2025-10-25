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

// 3. Start a database transaction
$conn->autocommit(FALSE);

try {
    // 4. Insert application details into the 'applications' table
    $stmt = $conn->prepare("INSERT INTO applications (customer_id, application_type, business_name, business_address, business_type, status, application_date) VALUES (?, ?, ?, ?, ?, 'PENDING', NOW())");
    $stmt->bind_param("issss", $customer_id, $_POST['application_type'], $_POST['business_name'], $_POST['business_address'], $_POST['business_type']);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create application record: ' . $stmt->error);
    }

    // 5. Get the newly created application ID
    $application_id = $conn->insert_id;
    $stmt->close();

    // 6. Create placeholder document records (for presentation purposes)
    $document_types = [
        'Application Form', 'Certificate of Registration', 'Barangay Business Clearance', 'Community Tax Certificate', 
        'Contract of Lease / Title', 'Sketch/Pictures of Business Location', 'Public Liability Insurance', 
        'Locational/Zoning Clearance', 'Certificate of Occupancy', 'Building Permit & Electrical Cert.', 
        'Sanitary Permit', 'Fire Safety Inspection Permit'
    ];
    
    // Insert placeholder documents
    $doc_stmt = $conn->prepare("INSERT INTO documents (application_id, document_type, file_path) VALUES (?, ?, ?)");
    
    foreach ($document_types as $doc_type) {
        $placeholder_path = 'uploads/placeholder_document.pdf';
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
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
