<?php
require_once '../config.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['first_name', 'last_name', 'email', 'password', 'contact_number', 'business_name', 'business_address', 'business_type'];

foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty($input[$field])) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
}

// Sanitize inputs
$first_name = $conn->real_escape_string($input['first_name']);
$last_name = $conn->real_escape_string($input['last_name']);
$email = $conn->real_escape_string($input['email']);
$password = $input['password']; // Storing unhashed for school use
$contact_number = $conn->real_escape_string($input['contact_number']);
$business_name = $conn->real_escape_string($input['business_name']);
$business_address = $conn->real_escape_string($input['business_address']);
$business_type = $conn->real_escape_string($input['business_type']);

// Check if email already exists
$check_query = "SELECT email FROM customers WHERE email = '$email' 
                UNION 
                SELECT email FROM employees WHERE email = '$email'";
$check_result = $conn->query($check_query);

if ($check_result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}

// Insert new customer
$insert_query = "INSERT INTO customers (first_name, last_name, email, password, contact_number, business_name, business_address, business_type) 
                 VALUES ('$first_name', '$last_name', '$email', '$password', '$contact_number', '$business_name', '$business_address', '$business_type')";

if ($conn->query($insert_query)) {
    echo json_encode([
        'success' => true,
        'message' => 'Account Creation Successfully.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Registration failed: ' . $conn->error
    ]);
}
?>