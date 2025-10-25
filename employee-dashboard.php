<?php
require_once 'config.php';

// Check if user is logged in and is an employee
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'employee') {
    header('Location: index.html');
    exit;
}

$employee_id = $_SESSION['user_id'];
$first_name = $_SESSION['first_name'];
$last_name = $_SESSION['last_name'];
$position = $_SESSION['position'];

// Get all applications
$apps_query = "SELECT a.*, c.first_name as customer_fname, c.last_name as customer_lname, c.contact_number, c.email as customer_email
               FROM applications a 
               JOIN customers c ON a.customer_id = c.customer_id 
               ORDER BY a.application_date DESC";
$applications = $conn->query($apps_query);

// Get statistics
$stats_query = "SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'RELEASED' THEN 1 ELSE 0 END) as released
                FROM applications";
$stats_result = $conn->query($stats_query);
$stats = $stats_result->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Dashboard - Business Permit System</title>
    <link rel="icon" type="image/svg+xml" href="briefcase.svg">
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div class="container dashboard">
        <nav class="navbar">
            <div class="navbar-brand">
                <h2>Employee Dashboard</h2>
                <p>Business Permits Division</p>
            </div>
            <div class="navbar-user">
                <div class="user-info">
                    <div class="user-name"><?php echo $first_name . ' ' . $last_name; ?></div>
                    <div class="user-role"><?php echo $position; ?></div>
                </div>
                <button class="btn-logout" onclick="logout()">Logout</button>
            </div>
        </nav>

        <div class="dashboard-content">
            <!-- Statistics -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Total Applications</h4>
                    <div class="stat-value"><?php echo $stats['total']; ?></div>
                </div>
                <div class="stat-card">
                    <h4>Pending Review</h4>
                    <div class="stat-value"><?php echo $stats['pending']; ?></div>
                </div>
                <div class="stat-card">
                    <h4>Approved</h4>
                    <div class="stat-value"><?php echo $stats['approved']; ?></div>
                </div>
                <div class="stat-card">
                    <h4>Released</h4>
                    <div class="stat-value"><?php echo $stats['released']; ?></div>
                </div>
            </div>

            <!-- Applications Table -->
            <div class="card">
                <h3>All Applications</h3>
                <div id="employeeMessage" class="message"></div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Application #</th>
                                <th>Customer</th>
                                <th>Business Name</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Date Applied</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if ($applications->num_rows > 0): ?>
                                <?php while ($app = $applications->fetch_assoc()): ?>
                                    <tr>
                                        <td><?php echo str_pad($app['application_id'], 6, '0', STR_PAD_LEFT); ?></td>
                                        <td><?php echo htmlspecialchars($app['customer_fname'] . ' ' . $app['customer_lname']); ?></td>
                                        <td><?php echo htmlspecialchars($app['business_name']); ?></td>
                                        <td><?php echo $app['application_type']; ?></td>
                                        <td>
                                            <span class="status-badge status-<?php echo strtolower($app['status']); ?>">
                                                <?php echo str_replace('_', ' ', $app['status']); ?></span>
                                        </td>
                                        <td><?php echo date('M d, Y', strtotime($app['application_date'])); ?></td>
                                        <td>
                                            <button class="btn-action btn-view" onclick="viewDocuments(<?php echo $app['application_id']; ?>)">View Docs</button>
                                            <?php if ($app['status'] === 'PENDING'): ?>
                                                <button class="btn-action btn-approve" onclick="approveApplication(<?php echo $app['application_id']; ?>)">Approve</button>
                                                <button class="btn-action btn-revision" onclick="requestRevision(<?php echo $app['application_id']; ?>)">Revision</button>
                                            <?php elseif ($app['status'] === 'APPROVED'): ?>
                                                <button class="btn-action btn-approve" onclick="releasePermit(<?php echo $app['application_id']; ?>)">Release</button>
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

    <!-- Document Viewer Modal -->
    <div id="documentModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Application Documents</h3>
                <button class="close-modal" onclick="closeModal('documentModal')">&times;</button>
            </div>
            <div id="documentList" style="padding: 20px;">
                <!-- Document list will be populated here -->
            </div>
        </div>
    </div>

    <!-- Document Preview Modal -->
    <div id="documentPreviewModal" class="modal">
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 id="documentPreviewTitle">Document Preview</h3>
                <button class="close-modal" onclick="closeModal('documentPreviewModal')">&times;</button>
            </div>
            <div style="padding: 40px; text-align: center; background: #f5f5f5; min-height: 300px; display: flex; align-items: center; justify-content: center;">
                <div>
                    <p style="font-size: 18px; color: #666; margin-bottom: 10px;">📄</p>
                    <p style="color: #999;">Document preview placeholder</p>
                    <p style="color: #ccc; font-size: 14px; margin-top: 20px;">(For presentation purposes)</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Release Permit Modal -->
    <div id="releaseModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Release Business Permit</h3>
                <button class="close-modal" onclick="closeModal('releaseModal')">&times;</button>
            </div>
            <form id="releaseForm">
                <input type="hidden" id="releaseApplicationId" name="application_id">
                
                <div class="form-group">
                    <label for="permitNumber">Permit Number</label>
                    <input type="text" id="permitNumber" name="permit_number" required>
                </div>

                <div class="form-group">
                    <label for="expirationDate">Expiration Date</label>
                    <input type="date" id="expirationDate" name="expiration_date" required>
                </div>

                <button type="submit" class="btn-primary">Release Permit</button>
            </form>
        </div>
    </div>

    <!-- Revision Modal -->
    <div id="revisionModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Request Document Revision</h3>
                <button class="close-modal" onclick="closeModal('revisionModal')">&times;</button>
            </div>
            <form id="revisionForm">
                <input type="hidden" id="revisionApplicationId" name="application_id">
                
                <div class="form-group">
                    <label for="remarks">Remarks / Reason for Revision</label>
                    <textarea id="remarks" name="remarks" rows="5" required placeholder="Please specify which documents need revision and why..."></textarea>
                </div>

                <button type="submit" class="btn-primary">Submit Revision Request</button>
            </form>
        </div>
    </div>

    <script src="scripts/employee-dashboard.js"></script>
</body>
</html>