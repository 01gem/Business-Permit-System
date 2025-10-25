<?php
require_once '../config.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email']) || !isset($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

$email = $conn->real_escape_string($input['email']);
$password = $input['password'];

// Check in customers table first
$query = "SELECT customer_id as id, first_name, last_name, email, password, 'customer' as user_type 
          FROM customers WHERE email = '$email'";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    if ($password === $user['password']) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_type'] = 'customer';
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['last_name'] = $user['last_name'];
        $_SESSION['email'] = $user['email'];
        
        echo json_encode([
            'success' => true,
            'user_type' => 'customer',
            'message' => 'Login successful'
        ]);
        exit;
    }
}

// Check in employees table
$query = "SELECT employee_id as id, first_name, last_name, email, password, position, 'employee' as user_type 
          FROM employees WHERE email = '$email'";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    if ($password === $user['password']) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_type'] = 'employee';
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['last_name'] = $user['last_name'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['position'] = $user['position'];
        
        echo json_encode([
            'success' => true,
            'user_type' => 'employee',
            'message' => 'Login successful'
        ]);
        exit;
    }
}

// If no user found or password incorrect
echo json_encode([
    'success' => false,
    'message' => 'Invalid email or password'
]);
?>