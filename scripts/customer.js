// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "api/logout.php";
  }
}

// Show application modal
function showApplicationModal() {
  document.getElementById("modalTitle").textContent =
    "Apply for Business Permit";
  document.getElementById("applicationForm").reset();
  document.getElementById("applicationType").value = "NEW";
  document.getElementById("form-step-1").classList.add("active");
  document.getElementById("form-step-2").classList.remove("active");
  document.getElementById("applicationModal").classList.add("show");
}

// Show renewal modal
function showRenewalModal() {
  document.getElementById("modalTitle").textContent = "Renew Business Permit";
  document.getElementById("applicationForm").reset();
  document.getElementById("applicationType").value = "RENEWAL";
  document.getElementById("form-step-1").classList.add("active");
  document.getElementById("form-step-2").classList.remove("active");
  document.getElementById("applicationModal").classList.add("show");
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

// Handle generic file upload with placeholder text
function handleFileUpload(input, statusId, textId) {
  const file = input.files[0];
  const statusDiv = document.getElementById(statusId);
  const statusText = document.getElementById(textId);

  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5242880) {
      alert("File size exceeds 5MB limit. Please choose a smaller file.");
      input.value = "";
      statusDiv.style.display = "none";
      return;
    }

    // Validate file type (images and PDFs)
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

    statusDiv.style.display = "block";
    statusDiv.style.background = "#e8f5e9";
    statusDiv.style.border = "1px solid #4caf50";
    statusText.innerHTML = `✓ <strong>${file.name}</strong> - File selected successfully.`;
    statusText.style.color = "#2e7d32";
  } else {
    statusDiv.style.display = "none";
  }
}

// Next button handler
document.getElementById("nextButton").addEventListener("click", function () {
  const businessName = document.getElementById("businessName").value.trim();
  const businessAddress = document
    .getElementById("businessAddress")
    .value.trim();
  const businessType = document.getElementById("businessType").value;
  const paymentProof = document.getElementById("paymentProof").files[0];
  const applicationFormFile = document.getElementById("applicationFormUpload")
    .files[0];

  if (!businessName || !businessAddress || !businessType) {
    alert("Please fill out all business details before proceeding.");
    return;
  }

  if (!applicationFormFile) {
    alert("Please upload the Application Form before proceeding.");
    return;
  }

  if (!paymentProof) {
    alert("Please upload proof of payment before proceeding.");
    return;
  }

  // Generate dynamic document requirements for Step 2
  generateDocumentRequirements(businessType);

  document.getElementById("form-step-1").classList.remove("active");
  document.getElementById("form-step-2").classList.add("active");
});

// Generate document requirements for Step 2 based on business type
function generateDocumentRequirements(businessType) {
  const container = document.getElementById("document-requirements");
  container.innerHTML = ""; // Clear previous requirements

  let requirements = [];

  // Business-type specific documents
  switch (businessType) {
    case "Sole Proprietorship":
      requirements.push({
        name: "dti_cert",
        label: "Department of Trade and Industry (DTI) Certificate",
      });
      break;
    case "Partnership":
    case "Corporation":
      requirements.push({
        name: "sec_cert",
        label: "Securities and Exchange Commission (SEC) Certificate",
      });
      requirements.push({
        name: "articles_inc",
        label: "Articles of Incorporation/Partnership",
      });
      break;
    case "Cooperative":
      requirements.push({
        name: "cda_cert",
        label: "Cooperative Development Authority (CDA) Certificate",
      });
      break;
  }

  // Static documents for all types
  const staticRequirements = [
    { name: "public_liability_insurance", label: "Public Liability Insurance" },
    { name: "barangay_clearance", label: "Barangay Business Clearance" },
    {
      name: "proof_of_address",
      label: "Proof of Business Address (Lease Contract or Title)",
    },
    { name: "locational_clearance", label: "Locational/Zoning Clearance" },
    { name: "occupancy_permit", label: "Occupancy Permit" },
  ];

  requirements = requirements.concat(staticRequirements);

  // Create HTML for each requirement
  requirements.forEach((req) => {
    const docId = `doc_${req.name}`;
    const statusId = `status_${req.name}`;
    const textId = `text_${req.name}`;

    const item = document.createElement("div");
    item.className = "form-group document-upload-item";
    item.innerHTML = `
            <label for="${docId}">${req.label}</label>
            <input 
                type="file" 
                id="${docId}" 
                name="${req.name}" 
                accept=".pdf,image/*" 
                required 
                style="display: none;"
                onchange="handleFileUpload(this, '${statusId}', '${textId}')">
            <button 
                type="button" 
                class="btn-secondary" 
                onclick="document.getElementById('${docId}').click()">
                Upload File
            </button>
            <div id="${statusId}" class="file-status-box">
                <span id="${textId}"></span>
            </div>
        `;
    container.appendChild(item);
  });
}

// Back button handler
document.getElementById("backButton").addEventListener("click", function () {
  document.getElementById("form-step-2").classList.remove("active");
  document.getElementById("form-step-1").classList.add("active");
});

// Form submission
document
  .getElementById("applicationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector("button[type=submit]");

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      // Get form data as JSON (placeholder system - no actual file upload)
      const formData = {
        application_type: document.getElementById("applicationType").value,
        business_name: document.getElementById("businessName").value,
        business_address: document.getElementById("businessAddress").value,
        business_type: document.getElementById("businessType").value,
        payment_proof_filename:
          document.getElementById("paymentProof").files[0]?.name || "",
        application_form_filename:
          document.getElementById("applicationFormUpload").files[0]?.name || "",
      };

      const response = await fetch("api/submit-full-application.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error("Server error: " + response.status);
      }

      // Get response text first to check what we're getting
      const text = await response.text();
      console.log("Server response:", text);

      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        console.error("Response text:", text);
        throw new Error(
          "Invalid response from server. Check console for details."
        );
      }

      if (result.success) {
        // Show success popup
        alert(
          "Successfully applied! It will take a few hours to complete your application."
        );
        closeModal("applicationModal");
        location.reload();
      } else {
        alert(result.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "An error occurred while submitting the application: " + error.message
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Application";
    }
  });

// View application
async function viewApplication(applicationId) {
  try {
    const response = await fetch("api/get-application.php?id=" + applicationId);
    const result = await response.json();
    if (result.success) {
      const app = result.application;
      let details =
        "Application #: " +
        String(app.application_id).padStart(6, "0") +
        "\nBusiness Name: " +
        app.business_name +
        "\nBusiness Type: " +
        app.business_type +
        "\nStatus: " +
        app.status.replace("_", " ") +
        "\nDate Applied: " +
        new Date(app.application_date).toLocaleDateString();

      if (app.expiration_date)
        details +=
          "\nExpiration: " + new Date(app.expiration_date).toLocaleDateString();

      if (app.permit_number) details += "\nPermit Number: " + app.permit_number;

      // Show receipt information if application is approved or released
      if (
        (app.status === "APPROVED" || app.status === "RELEASED") &&
        app.receipt_number
      ) {
        details += "\n\n--- RECEIPT INFORMATION ---";
        details += "\nReceipt Number: " + app.receipt_number;
        if (app.receipt_amount) {
          details +=
            "\nAmount Paid: ₱" + parseFloat(app.receipt_amount).toFixed(2);
        }
        if (app.receipt_file) {
          details += "\nReceipt Copy: " + app.receipt_file;
        }
        details += "\n(Receipt issued upon approval)";
      }

      if (app.remarks) details += "\n\nRemarks: " + app.remarks;

      alert(details);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load application details");
  }
}

// Show message helper
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = "message " + type + " show";
  setTimeout(() => {
    element.classList.remove("show");
  }, 5000);
}

// Download receipt (placeholder - similar to 12 documents)
function downloadReceipt(applicationId, receiptNumber) {
  // Placeholder message similar to the document system
  alert(
    "📄 Receipt Download\n\n" +
      "Receipt Number: " +
      receiptNumber +
      "\n" +
      "Application ID: " +
      String(applicationId).padStart(6, "0") +
      "\n\n" +
      "✓ Your official receipt has been generated.\n" +
      "This is a placeholder for the receipt download feature.\n\n" +
      "The receipt contains:\n" +
      "- Receipt number and amount paid\n" +
      "- Business permit details\n" +
      "- Official LGU stamp and signature\n\n" +
      "(For presentation purposes - actual PDF download would be implemented here)"
  );
  console.log("Receipt download requested for Application ID:", applicationId);
}

// Download application form template (placeholder - similar to other downloads)
function downloadApplicationFormTemplate() {
  // Placeholder message similar to the receipt system
  alert(
    "📄 Application Form Template Download\n\n" +
      "Document: Business Permit Application Form\n" +
      "Format: PDF\n\n" +
      "✓ The official application form template is ready.\n" +
      "This is a placeholder for the template download feature.\n\n" +
      "The form includes:\n" +
      "- Complete business information fields\n" +
      "- Document checklist\n" +
      "- Terms and conditions\n" +
      "- Official LGU format\n\n" +
      "(For presentation purposes - actual PDF download would be implemented here)"
  );
  console.log("Application form template download requested");
}
