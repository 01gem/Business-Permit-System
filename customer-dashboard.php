<?php
require_once 'config.php';

// Check if user is logged in and is a customer
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'customer') {
    header('Location: index.html');
    exit;
}

$customer_id = $_SESSION['user_id'];
$first_name = $_SESSION['first_name'];
$last_name = $_SESSION['last_name'];

// Get customer's applications
$apps_query = "SELECT * FROM applications WHERE customer_id = $customer_id ORDER BY application_date DESC";
$applications = $conn->query($apps_query);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Dashboard - Business Permit System</title>
    <link rel="icon" type="image/svg+xml" href="icon/briefcase.svg">
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div class="container dashboard">
        <nav class="navbar">
            <div class="navbar-brand">
                <h2>Customer Dashboard</h2>
                <p>Business Permit Application System</p>
            </div>
            <div class="navbar-user">
                <div class="user-info">
                    <div class="user-name"><?php echo $first_name . ' ' . $last_name; ?></div>
                    <div class="user-role">Business Owner</div>
                </div>
                <button class="btn-logout" onclick="logout()">Logout</button>
            </div>
        </nav>

        <div class="dashboard-content">
            <!-- Quick Actions -->
            <div class="card">
                <h3>Quick Actions</h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button class="btn-secondary" onclick="showApplicationModal()">Apply for New Permit</button>
                    <button class="btn-secondary" onclick="showRenewalModal()">Renew Existing Permit</button>
                </div>
            </div>

            <!-- My Applications -->
            <div class="card">
                <h3>My Applications</h3>
                <div id="applicationMessage" class="message"></div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Application #</th>
                                <th>Business Name</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Date Applied</th>
                                <th>Expiration</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if ($applications->num_rows > 0): ?>
                                <?php while ($app = $applications->fetch_assoc()): ?>
                                    <tr>
                                        <td><?php echo str_pad($app['application_id'], 6, '0', STR_PAD_LEFT); ?></td>
                                        <td><?php echo htmlspecialchars($app['business_name']); ?></td>
                                        <td><?php echo htmlspecialchars($app['business_type']); ?></td>
                                        <td>
                                            <span class="status-badge status-<?php echo strtolower($app['status']); ?>">
                                                <?php echo str_replace('_', ' ', $app['status']); ?>
                                            </span>
                                        </td>
                                        <td><?php echo date('M d, Y', strtotime($app['application_date'])); ?></td>
                                        <td>
                                            <?php 
                                            if ($app['expiration_date']) {
                                                echo date('M d, Y', strtotime($app['expiration_date']));
                                            } else {
                                                echo 'N/A';
                                            }
                                            ?>
                                        </td>
                                        <td>
                                            <button class="btn-action btn-view" onclick="viewApplication(<?php echo $app['application_id']; ?>)">View</button>
                                            <?php if ($app['status'] === 'RELEASED' && !empty($app['receipt_number'])): ?>
                                                <button class="btn-action btn-approve" onclick="downloadReceipt(<?php echo $app['application_id']; ?>, '<?php echo htmlspecialchars($app['receipt_number']); ?>')">Download Receipt</button>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endwhile; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="7" style="text-align: center; color: var(--text-muted);">No applications yet</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Application Modal -->
    <div id="applicationModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Apply for Business Permit</h3>
                <button class="close-modal" onclick="closeModal('applicationModal')">&times;</button>
            </div>
            <div id="formMessage" class="message" style="margin: 10px 20px;"></div>
            <form id="applicationForm">
                <input type="hidden" id="applicationType" name="application_type" value="NEW">
                
                <!-- Step 1: Business Details -->
                <div class="form-step active" id="form-step-1">
                    <h4>Step 1: Business Details & Payment</h4>

                    <div class="form-group">
                        <label for="businessName">Business Name</label>
                        <input type="text" id="businessName" name="business_name" required>
                    </div>

                    <div class="form-group">
                        <label for="businessAddress">Business Address</label>
                        <textarea id="businessAddress" name="business_address" rows="3" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="businessType">Business Type</label>
                        <select id="businessType" name="business_type" required>
                            <option value="">Select Business Type</option>
                            <option value="Corporation">Corporation</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                            <option value="Cooperative">Cooperative</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Retail Store">Retail Store</option>
                            <option value="Sari-sari Store">Sari-sari Store</option>
                            <option value="Carinderia">Carinderia</option>
                        </select>
                    </div>

                    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
                        <h5 style="margin-top: 0; color: #1976D2;">📱 Application Fee Payment</h5>
                        <p style="color: #555; margin: 10px 0;">Please send the application fee to the following number:</p>
                        <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                            <strong style="font-size: 18px; color: #1976D2;">GCash: 09123456789</strong>
                            <p style="margin: 5px 0; color: #666;">Account Name: LGU Business Permits Office</p>
                            <p style="margin: 5px 0; color: #666;">Application Fee: ₱500.00</p>
                        </div>
                        <p style="color: #d32f2f; margin: 10px 0; font-size: 14px;">
                            ⚠️ After sending payment, please upload a screenshot of your transaction below.
                        </p>
                    </div>

                    <div class="form-group">
                        <label for="paymentProof">
                            Proof of Payment * 
                            <span style="color: #666; font-weight: normal; font-size: 14px;">(Screenshot of transaction)</span>
                        </label>
                        <input 
                            type="file" 
                            id="paymentProof" 
                            name="payment_proof" 
                            accept="image/*" 
                            required 
                            style="display: none;"
                            onchange="handlePaymentProofUpload(this)">
                        <button 
                            type="button" 
                            class="btn-secondary" 
                            onclick="document.getElementById('paymentProof').click()"
                            style="width: 100%; padding: 12px; margin-top: 5px;">
                            Choose File
                        </button>
                        <div id="paymentProofStatus" style="margin-top: 10px; padding: 10px; border-radius: 6px; display: none;">
                            <span id="paymentProofText"></span>
                        </div>
                        <small style="color: #666; display: block; margin-top: 5px;">
                            Accepted formats: JPG, PNG (Max 5MB)
                        </small>
                    </div>

                    <div class="form-navigation">
                        <button type="button" class="btn-primary" id="nextButton">Next</button>
                    </div>
                </div>

                <!-- Step 2: Document Upload -->
                <div class="form-step" id="form-step-2">
                    <h4>Step 2: Required Documents</h4>
                    
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        The following documents are required for your application:
                    </p>
                    
                    <div class="document-item" style="background: #e3f2fd; border-left: 4px solid #2196F3;">
                        <label>1. Proof of Payment Transaction</label>
                        <span style="color: #2196F3; font-weight: 500;">✓ (Already Uploaded)</span>
                    </div>
                    
                    <div class="document-item">
                        <label>2. Application Form</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>3. Certificate of Registration</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>4. Barangay Business Clearance</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>5. Community Tax Certificate (CTC)</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>6. Contract of Lease / Title</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>7. Sketch/Pictures of Business Location</label>
                        <span style="color: #4caf50; font-weight: 500;">(Image File)</span>
                    </div>

                    <div class="document-item">
                        <label>8. Public Liability Insurance</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>9. Locational/Zoning Clearance</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>10. Certificate of Occupancy</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>11. Building Permit & Electrical Cert.</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>12. Sanitary Permit</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="document-item">
                        <label>13. Fire Safety Inspection Permit</label>
                        <span style="color: #4caf50; font-weight: 500;">(PDF Document)</span>
                    </div>

                    <div class="form-navigation">
                        <button type="button" class="btn-secondary" id="backButton">Back</button>
                        <button type="submit" class="btn-primary">Submit Application</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script src="scripts/customer.js?v=<?php echo time(); ?>"></script>
</body>
</html>