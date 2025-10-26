// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "api/logout.php";
  }
}

// Handle receipt file upload with placeholder display
function handleReceiptFileUpload(input) {
  const file = input.files[0];
  const statusDiv = document.getElementById("receiptFileStatus");
  const statusText = document.getElementById("receiptFileText");

  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5242880) {
      alert("File size exceeds 5MB limit. Please choose a smaller file.");
      input.value = "";
      statusDiv.style.display = "none";
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPG, PNG, or PDF file.");
      input.value = "";
      statusDiv.style.display = "none";
      return;
    }

    // Show success message (placeholder like the 12 documents)
    statusDiv.style.display = "block";
    statusDiv.style.background = "#e8f5e9";
    statusDiv.style.border = "1px solid #4caf50";
    statusText.innerHTML = `✓ <strong>${file.name}</strong> - Receipt uploaded successfully`;
    statusText.style.color = "#2e7d32";
  } else {
    statusDiv.style.display = "none";
  }
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("show");
}

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.classList.remove("show");
  }
};

// View documents for an application
async function viewDocuments(applicationId) {
  try {
    const response = await fetch(
      `api/get-documents.php?application_id=${applicationId}`
    );
    const result = await response.json();

    if (result.success) {
      const documentList = document.getElementById("documentList");
      let html = '<div style="display: grid; gap: 10px;">';

      const documentTypes = [
        "Proof of Payment Transaction",
        "Application Form",
        "Certificate of Registration",
        "Barangay Business Clearance",
        "Community Tax Certificate",
        "Contract of Lease / Title",
        "Sketch/Pictures of Business Location",
        "Public Liability Insurance",
        "Locational/Zoning Clearance",
        "Certificate of Occupancy",
        "Building Permit & Electrical Cert.",
        "Sanitary Permit",
        "Fire Safety Inspection Permit",
      ];

      if (result.documents.length > 0) {
        documentTypes.forEach((docType, index) => {
          html += `
            <div class="document-item" style="padding: 15px; background: #f9f9f9; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: 1px solid #e0e0e0; transition: all 0.2s;" 
                 onmouseover="this.style.background='#e3f2fd'; this.style.borderColor='#2196F3';" 
                 onmouseout="this.style.background='#f9f9f9'; this.style.borderColor='#e0e0e0';"
                 onclick="showDocumentPreview('${docType}')">
              <div>
                <strong style="color: #333;">${index + 1}. ${docType}</strong>
                <span style="color: #4caf50; margin-left: 10px; font-weight: 500;">(PDF Document)</span>
              </div>
              <div style="color: #2196F3; font-size: 20px;">→</div>
            </div>
          `;
        });
      } else {
        html +=
          '<p style="color: var(--text-muted); text-align: center;">No documents uploaded yet</p>';
      }

      html += "</div>";
      documentList.innerHTML = html;
      document.getElementById("documentModal").classList.add("show");
    } else {
      alert(result.message || "Failed to load documents");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load documents");
  }
}

// Show document preview
function showDocumentPreview(documentName) {
  document.getElementById("documentPreviewTitle").textContent = documentName;
  document.getElementById("documentPreviewModal").classList.add("show");
}

// Verify a document
async function verifyDocument(documentId) {
  if (!confirm("Mark this document as verified?")) return;

  try {
    const response = await fetch("api/verify-document.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ document_id: documentId }),
    });

    const result = await response.json();

    if (result.success) {
      showMessage(
        document.getElementById("employeeMessage"),
        "Document verified successfully!",
        "success"
      );
      closeModal("documentModal");
      location.reload();
    } else {
      alert(result.message || "Failed to verify document");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to verify document");
  }
}

// Approve application - Opens approval modal
async function approveApplication(applicationId) {
  document.getElementById("approveApplicationId").value = applicationId;
  document.getElementById("approveForm").reset();
  document.getElementById("approveApplicationId").value = applicationId; // Reset clears it, so set it again

  // Fetch auto-generated receipt number
  try {
    const response = await fetch("api/generate-receipt-number.php");
    const result = await response.json();

    if (result.success) {
      document.getElementById("receiptNumber").value = result.receipt_number;
    } else {
      document.getElementById("receiptNumber").value = "ERROR";
      console.error("Failed to generate receipt number");
    }
  } catch (error) {
    console.error("Error fetching receipt number:", error);
    document.getElementById("receiptNumber").value = "ERROR";
  }

  document.getElementById("approveModal").classList.add("show");
}

// Handle approve form submission
document.getElementById("approveForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate that receipt file is selected (for placeholder display)
  const receiptFile = document.getElementById("receiptFile").files[0];
  if (!receiptFile) {
    alert("Please upload a receipt file before approving.");
    return;
  }

  // Only send the receipt metadata (no actual file upload)
  const formData = {
    application_id: document.getElementById("approveApplicationId").value,
    receipt_number: document.getElementById("receiptNumber").value,
    receipt_amount: document.getElementById("receiptAmount").value,
    approval_notes: document.getElementById("approvalNotes").value,
    receipt_file_name: receiptFile.name, // Just the filename for placeholder
  };

  try {
    const response = await fetch("api/approve-application.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      showMessage(
        document.getElementById("employeeMessage"),
        "Application approved successfully! Receipt sent to customer.",
        "success"
      );

      // Show additional receipt details in console for reference
      if (result.receipt_info) {
        console.log("Receipt Information:", result.receipt_info);
      }

      closeModal("approveModal");
      setTimeout(() => location.reload(), 1500);
    } else {
      alert(result.message || "Failed to approve application");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to approve application. Check console for details.");
  }
});

// Request revision
function requestRevision(applicationId) {
  document.getElementById("revisionApplicationId").value = applicationId;
  document.getElementById("revisionForm").reset();
  document.getElementById("revisionModal").classList.add("show");
}

// Handle revision form submission
document
  .getElementById("revisionForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch("api/request-revision.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        showMessage(
          document.getElementById("employeeMessage"),
          "Revision request sent successfully!",
          "success"
        );
        closeModal("revisionModal");
        setTimeout(() => location.reload(), 1500);
      } else {
        alert(result.message || "Failed to send revision request");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send revision request");
    }
  });

// Release permit
function releasePermit(applicationId) {
  document.getElementById("releaseApplicationId").value = applicationId;
  document.getElementById("releaseForm").reset();

  // Set default expiration date (1 year from now)
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  document.getElementById("expirationDate").value = nextYear
    .toISOString()
    .split("T")[0];

  // Generate permit number
  const permitNumber =
    "BP-" +
    new Date().getFullYear() +
    "-" +
    String(applicationId).padStart(6, "0");
  document.getElementById("permitNumber").value = permitNumber;

  document.getElementById("releaseModal").classList.add("show");
}

// Handle release form submission
document.getElementById("releaseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch("api/release-permit.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      showMessage(
        document.getElementById("employeeMessage"),
        "Permit released successfully!",
        "success"
      );
      closeModal("releaseModal");
      setTimeout(() => location.reload(), 1500);
    } else {
      alert(result.message || "Failed to release permit");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to release permit");
  }
});

// Helper function to show messages
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `message ${type} show`;

  setTimeout(() => {
    element.classList.remove("show");
  }, 5000);
}
