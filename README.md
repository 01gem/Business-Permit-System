# Business Permit Application and Renewal System

Description
-----------
This repository contains the "Business Permit Application and Renewal System" — a simple PHP/MySQL web application built to demonstrate handling of business permit applications and renewals. The system implements basic workflows for creating applications, reviewing and approving/rejecting requests, and renewing permits. It was developed as a learning / school project and is not production-ready.

Purpose
-------
School-use only: this project was created for educational purposes and to satisfy course requirements. It demonstrates basic CRUD operations, form handling, session-based authentication, and simple client-side interactivity with JavaScript.

Security notice (IMPORTANT)
---------------------------
This project uses unhashed (plain-text) passwords in the database and may include example seed data with plain-text credentials. This is intentionally insecure for demonstration/grading purposes.

- DO NOT deploy this repository or any included database to a public or production environment.
- DO NOT use any plain-text password data in shared or live systems.
- If you continue development beyond school use, you MUST migrate to secure password storage and apply common web security practices (see "Harden passwords" and "Security checklist" below).

Requirements
------------
- PHP 7.4+ (PHP 8 recommended)
- MySQL / MariaDB
- Web server (Apache / nginx) or PHP built-in server for development
- Optional: Node/npm if you plan to build or bundle frontend assets (not required for basic usage)

Quick setup guide
-----------------
1. Clone the repository
```
git clone https://github.com/01gem/Business-Permit-System-CLAUDE.git
cd Business-Permit-System-CLAUDE
```

2. Create the database
- Create a new MySQL database (example name: business_permits).
- If there is a provided SQL seed file (check the database/ or sql/ directory), import it:
```
mysql -u root -p business_permits < database/seed.sql
```
- If no SQL file exists, inspect the project files to determine required tables and create them manually.

3. Configure the application
- Open the database/config file (common names: config.php, app/config.php, or database.php). Set DB_HOST, DB_NAME, DB_USER, DB_PASS to match your environment.
- Example (do NOT store production secrets in repo):
```php
// config.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'business_permits');
define('DB_USER', 'myuser');
define('DB_PASS', 'mypassword');
```

4. Run the app (development)
- Using PHP built-in server:
```
php -S localhost:8000 -t public
```
- Or deploy into your Apache / nginx webroot and configure virtual host accordingly.

5. Login / test
- Use seeded credentials if provided (check database/seed.sql). If none are available, register a new account through the registration form (if implemented) or create an admin row directly in the DB for testing.

Harden passwords (recommended)
------------------------------
This project currently stores or uses plain-text passwords. To secure password handling:

1. Hash passwords on registration:
```php
// When creating a new user
$hashed = password_hash($plain_password, PASSWORD_DEFAULT);
// store $hashed in the database (replace any code that stores plain text)
```

2. Verify on login:
```php
// When verifying login
if (password_verify($entered_password, $stored_hashed_password)) {
    // authentication successful
} else {
    // authentication failed
}
```

3. Remove any seed data with plain-text passwords from the repo and replace with hashed passwords. If you must keep sample credentials, only include the hashed value and document the plain password for tests in a separate non-tracked file or CI secret (not in repo).

4. Use prepared statements or parameterized queries (PDO or mysqli with bound parameters) to avoid SQL injection.

Security checklist
------------------
Before considering any non-school deployment:
- Hash passwords with password_hash() and verify with password_verify().
- Use HTTPS (TLS) for all client-server traffic.
- Use prepared statements / parameterized queries (PDO recommended).
- Implement CSRF protection for forms.
- Set secure session cookie flags (secure, httponly, samesite).
- Implement input validation and output escaping to prevent XSS.
- Add rate limiting and account lockout after repeated failed login attempts.
- Remove any default or seeded admin accounts / credentials or replace with safe defaults.
- Audit logs and monitor for suspicious activity.

Where to look in the project
----------------------------
- Public entry: public/ or index.php
- Database configuration: config.php, app/config.php, or files in a config/ directory
- SQL seed files: database/ or sql/
- Authentication logic: search for files mentioning login, register, auth, sessions, users
- Frontend assets: assets/, public/, js/, css/

How to contribute / apply this README
------------------------------------
If you want to update the README in the repository:
1. Create a new branch:
```
git checkout -b docs/update-readme-security
```
2. Replace the README.md content with this file (or merge the relevant changes).
3. Commit and push:
```
git add README.md
git commit -m "docs: update README with purpose, security warning, setup and hardening guide"
git push --set-upstream origin docs/update-readme-security
```
4. Open a Pull Request on GitHub for review and merge.

Contact / Issues
----------------
This project is for school use. If you have questions or want help hardening the application for safe local testing, open an issue in the repository.

License
-------
If required by your school, include or choose a license. Otherwise, you may leave licensing unspecified for class submissions.
