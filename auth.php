<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Business Permit System</title>
    <link rel="icon" type="image/svg+xml" href="images/briefcase.svg" />
    <link rel="stylesheet" href="styles/base.css" />
    <link rel="stylesheet" href="styles/auth.css" />
  </head>
  <body>
    <img src="images/img3.jpg" alt="Background Image" class="background-image" />
    <div class="container">
      <div class="auth-wrapper">
        <div class="auth-box">
          <div class="logo-section">
            <h1>Business Permit System</h1>
            <p>Republic of the Philippines</p>
          </div>

          <!-- Login Form -->
          <form id="loginForm" class="auth-form active">
            <h2>Login to Your Account</h2>
            <div id="loginMessage" class="message"></div>

            <div class="form-group">
              <label for="loginEmail">Email Address</label>
              <input type="email" id="loginEmail" name="email" required />
            </div>

            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                name="password"
                required
              />
            </div>

            <button type="submit" class="btn-primary">Login</button>

            <div class="auth-switch">
              Don't have an account?
              <a href="#" id="showRegister">Register here</a>
            </div>
          </form>

          <!-- Registration Form -->
          <form id="registerForm" class="auth-form">
            <h2>Create Your Account</h2>
            <div id="registerMessage" class="message"></div>

            <div class="form-row">
              <div class="form-group">
                <label for="regFirstName">First Name</label>
                <input
                  type="text"
                  id="regFirstName"
                  name="first_name"
                  required
                />
              </div>

              <div class="form-group">
                <label for="regLastName">Last Name</label>
                <input type="text" id="regLastName" name="last_name" required />
              </div>
            </div>

            <div class="form-group">
              <label for="regEmail">Email Address</label>
              <input type="email" id="regEmail" name="email" required />
            </div>

            <div class="form-group">
              <label for="regPassword">Password</label>
              <input
                type="password"
                id="regPassword"
                name="password"
                required
              />
            </div>

            <div class="form-group">
              <label for="regContact">Contact Number</label>
              <input
                type="tel"
                id="regContact"
                name="contact_number"
                required
              />
            </div>

            <button type="submit" class="btn-primary">Register</button>

            <div class="auth-switch">
              Already have an account? <a href="#" id="showLogin">Login here</a>
            </div>
          </form>
        </div>
      </div>
    </div>

    <script src="scripts/auth.js"></script>
  </body>
</html>
