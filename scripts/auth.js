// Toggle between login and registration forms
document.getElementById("showRegister").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("registerForm").classList.add("active");
});

document.getElementById("showLogin").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("registerForm").classList.remove("active");
  document.getElementById("loginForm").classList.add("active");
});

// Handle Login Form Submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const messageDiv = document.getElementById("loginMessage");

  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      showMessage(messageDiv, "Login successful! Redirecting...", "success");

      setTimeout(() => {
        if (data.user_type === "customer") {
          window.location.href = "customer-dashboard.php";
        } else if (data.user_type === "employee") {
          window.location.href = "employee-dashboard.php";
        }
      }, 1000);
    } else {
      showMessage(
        messageDiv,
        data.message || "Login failed. Please try again.",
        "error"
      );
    }
  } catch (error) {
    showMessage(messageDiv, "An error occurred. Please try again.", "error");
    console.error("Login error:", error);
  }
});

// Handle Registration Form Submission
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      first_name: document.getElementById("regFirstName").value,
      last_name: document.getElementById("regLastName").value,
      email: document.getElementById("regEmail").value,
      password: document.getElementById("regPassword").value,
      contact_number: document.getElementById("regContact").value,
      business_name: document.getElementById("regBusinessName").value,
      business_address: document.getElementById("regBusinessAddress").value,
      business_type: document.getElementById("regBusinessType").value,
    };

    const messageDiv = document.getElementById("registerMessage");

    try {
      const response = await fetch("api/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage(messageDiv, "Account Creation Successfully.", "success");

        document.getElementById("registerForm").reset();

        setTimeout(() => {
          document.getElementById("registerForm").classList.remove("active");
          document.getElementById("loginForm").classList.add("active");
        }, 2000);
      } else {
        showMessage(
          messageDiv,
          data.message || "Registration failed. Please try again.",
          "error"
        );
      }
    } catch (error) {
      showMessage(messageDiv, "An error occurred. Please try again.", "error");
      console.error("Registration error:", error);
    }
  });

// Helper function to display messages
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `message ${type} show`;

  setTimeout(() => {
    element.classList.remove("show");
  }, 5000);
}
