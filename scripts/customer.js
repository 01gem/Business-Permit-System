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

// Next button handler
document.getElementById("nextButton").addEventListener("click", function () {
  const businessName = document.getElementById("businessName").value.trim();
  const businessAddress = document
    .getElementById("businessAddress")
    .value.trim();
  const businessType = document.getElementById("businessType").value;
  if (!businessName || !businessAddress || !businessType) {
    alert("Please fill out all business details before proceeding.");
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
        "\nType: " +
        app.application_type +
        "\nStatus: " +
        app.status.replace("_", " ") +
        "\nDate Applied: " +
        new Date(app.application_date).toLocaleDateString();
      if (app.expiration_date)
        details +=
          "\nExpiration: " + new Date(app.expiration_date).toLocaleDateString();
      if (app.permit_number) details += "\nPermit Number: " + app.permit_number;
      if (app.remarks) details += "\nRemarks: " + app.remarks;
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
