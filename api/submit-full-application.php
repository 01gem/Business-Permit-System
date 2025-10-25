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
$conn->begin_transaction();

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

    // 6. Process document uploads
    $document_types = [
        'Application Form', 'Certificate of Registration', 'Barangay Business Clearance', 'Community Tax Certificate', 
        'Contract of Lease / Title', 'Sketch/Pictures of Business Location', 'Public Liability Insurance', 
        'Locational/Zoning Clearance', 'Certificate of Occupancy', 'Building Permit & Electrical Cert.', 
        'Sanitary Permit', 'Fire Safety Inspection Permit'
    ];
    
    $upload_errors = [];
    $uploaded_count = 0;

    // Create a dedicated folder for the application's uploads
    $app_folder = UPLOAD_DIR . 'app_' . $application_id . '/';
    if (!file_exists($app_folder)) {
        mkdir($app_folder, 0777, true);
    }

    $doc_stmt = $conn->prepare("INSERT INTO documents (application_id, document_type, file_path) VALUES (?, ?, ?)");

    for ($i = 1; $i <= 12; $i++) {
        $file_key = 'doc' . $i;
        
        if (isset($_FILES[$file_key]) && $_FILES[$file_key]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$file_key];
            $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            
            // Validate file type (images only)
            $allowed_types = ['jpg', 'jpeg', 'png'];
            if (!in_array($file_ext, $allowed_types)) {
                $upload_errors[] = "Document $i: Invalid file type (only JPG, PNG allowed).";
                continue;
            }
            
            // Create a unique filename and path
            $new_filename = 'doc_' . $i . '_' . time() . '.' . $file_ext;
            $file_path = $app_folder . $new_filename;
            
            if (move_uploaded_file($file['tmp_name'], $file_path)) {
                // Save the document record to the database
                $doc_type = $document_types[$i - 1];
                $relative_path = 'uploads/app_' . $application_id . '/' . $new_filename;
                
                $doc_stmt->bind_param("iss", $application_id, $doc_type, $relative_path);
                if ($doc_stmt->execute()) {
                    $uploaded_count++;
                } else {
                    $upload_errors[] = "Document $i: Failed to save to database.";
                }
            } else {
                $upload_errors[] = "Document $i: Failed to move uploaded file.";
            }
        }
    }
    $doc_stmt->close();

    // 7. Check if any documents were uploaded
    if ($uploaded_count === 0) {
        throw new Exception('Application requires at least one document to be uploaded.');
    }

    // If there were upload errors but some files succeeded, we can still proceed or fail.
    // For now, we will consider it a partial success but report errors.
    if (count($upload_errors) > 0) {
        // Decide if this should be a fatal error. For now, we'll let it pass but report it.
        // For a stricter policy, you could throw an exception here.
    }

    // 8. Commit the transaction
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => "Application submitted successfully with $uploaded_count documents.",
        'application_id' => $application_id,
        'upload_errors' => $upload_errors
    ]);

} catch (Exception $e) {
    // 9. Rollback the transaction on any error
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
