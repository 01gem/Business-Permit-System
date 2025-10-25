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
      let html = '<div style="display: grid; gap: 15px;">';

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
        result.documents.forEach((doc, index) => {
          html += `
                        <div class="document-item">
                            <div>
                                <strong>${
                                  documentTypes[index] || doc.document_type
                                }</strong>
                                ${
                                  doc.is_verified
                                    ? '<span style="color: var(--success); margin-left: 10px;">✓ Verified</span>'
                                    : ""
                                }
                            </div>
                            <div>
                                <button class="btn-action btn-view" onclick="window.open('${
                                  doc.file_path
                                }', '_blank')">View</button>
                                ${
                                  !doc.is_verified
                                    ? `<button class="btn-action btn-approve" onclick="verifyDocument(${doc.document_id})">Verify</button>`
                                    : ""
                                }
                            </div>
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

// Approve application
async function approveApplication(applicationId) {
  if (
    !confirm("Approve this application? Make sure all documents are verified.")
  )
    return;

  try {
    const response = await fetch("api/approve-application.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ application_id: applicationId }),
    });

    const result = await response.json();

    if (result.success) {
      showMessage(
        document.getElementById("employeeMessage"),
        "Application approved successfully!",
        "success"
      );
      setTimeout(() => location.reload(), 1500);
    } else {
      alert(result.message || "Failed to approve application");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to approve application");
  }
}

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
