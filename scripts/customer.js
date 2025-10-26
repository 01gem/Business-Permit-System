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

// Handle payment proof upload
function handlePaymentProofUpload(input) {
  const file = input.files[0];
  const statusDiv = document.getElementById("paymentProofStatus");
  const statusText = document.getElementById("paymentProofText");

  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5242880) {
      alert("File size exceeds 5MB limit. Please choose a smaller file.");
      input.value = "";
      statusDiv.style.display = "none";
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPG or PNG image.");
      input.value = "";
      statusDiv.style.display = "none";
      return;
    }

    // Show success message (similar to document placeholder)
    statusDiv.style.display = "block";
    statusDiv.style.background = "#e8f5e9";
    statusDiv.style.border = "1px solid #4caf50";
    statusText.innerHTML = `✓ <strong>${file.name}</strong> - Payment proof uploaded successfully`;
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

  if (!businessName || !businessAddress || !businessType) {
    alert("Please fill out all business details before proceeding.");
    return;
  }

  if (!paymentProof) {
    alert("Please upload proof of payment before proceeding.");
    return;
  }

  document.getElementById("form-step-1").classList.remove("active");
  document.getElementById("form-step-2").classList.add("active");
});

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
    const formData = new FormData(form);
    const submitButton = form.querySelector("button[type=submit]");

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      const response = await fetch("api/submit-full-application.php", {
        method: "POST",
        body: formData,
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
