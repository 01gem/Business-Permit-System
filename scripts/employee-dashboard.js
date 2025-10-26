// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "api/logout.php";
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
function approveApplication(applicationId) {
  document.getElementById("approveApplicationId").value = applicationId;
  document.getElementById("approveForm").reset();
  document.getElementById("approveApplicationId").value = applicationId; // Reset clears it, so set it again
  document.getElementById("approveModal").classList.add("show");
}

// Handle approve form submission
document.getElementById("approveForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append(
    "application_id",
    document.getElementById("approveApplicationId").value
  );
  formData.append(
    "receipt_number",
    document.getElementById("receiptNumber").value
  );
  formData.append(
    "receipt_amount",
    document.getElementById("receiptAmount").value
  );
  formData.append(
    "approval_notes",
    document.getElementById("approvalNotes").value
  );

  const receiptFile = document.getElementById("receiptFile").files[0];
  if (receiptFile) {
    formData.append("receipt_file", receiptFile);
  }

  try {
    const response = await fetch("api/approve-application.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      showMessage(
        document.getElementById("employeeMessage"),
        "Application approved successfully!",
        "success"
      );
      closeModal("approveModal");
      setTimeout(() => location.reload(), 1500);
    } else {
      alert(result.message || "Failed to approve application");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to approve application");
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
