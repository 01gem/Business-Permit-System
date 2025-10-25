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
  for (let i = 1; i <= 12; i++) {
    const statusEl = document.getElementById("status" + i);
    if (statusEl) statusEl.textContent = "";
  }
  document.getElementById("applicationModal").classList.add("show");
}

// Show renewal modal
function showRenewalModal() {
  document.getElementById("modalTitle").textContent = "Renew Business Permit";
  document.getElementById("applicationForm").reset();
  document.getElementById("applicationType").value = "RENEWAL";
  document.getElementById("form-step-1").classList.add("active");
  document.getElementById("form-step-2").classList.remove("active");
  for (let i = 1; i <= 12; i++) {
    const statusEl = document.getElementById("status" + i);
    if (statusEl) statusEl.textContent = "";
  }
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

// Update file name display
function updateFileName(input) {
  const fileStatus = document.getElementById(
    "status" + input.id.replace("doc", "")
  );
  if (input.files.length > 0) {
    fileStatus.textContent = " " + input.files[0].name;
    fileStatus.style.color = "var(--success)";
  } else {
    fileStatus.textContent = "";
  }
}

// Form submission
document
  .getElementById("applicationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const messageDiv = document.getElementById("formMessage");
    const submitButton = form.querySelector("button[type=submit]");
    let fileCount = 0;
    for (let i = 1; i <= 12; i++) {
      const fileInput = document.getElementById("doc" + i);
      if (fileInput && fileInput.files.length > 0) fileCount++;
    }
    if (fileCount === 0) {
      showMessage(messageDiv, "Please upload at least one document.", "error");
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    showMessage(
      messageDiv,
      "Submitting application with " + fileCount + " document(s)...",
      "info"
    );
    try {
      const response = await fetch("api/submit-full-application.php", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        showMessage(
          messageDiv,
          result.message || "Application submitted successfully!",
          "success"
        );
        setTimeout(() => {
          closeModal("applicationModal");
          location.reload();
        }, 2000);
      } else {
        showMessage(
          messageDiv,
          result.message || "Failed to submit application",
          "error"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage(
        messageDiv,
        "An error occurred while submitting the application",
        "error"
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
