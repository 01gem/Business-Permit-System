# Business Permit Application and Renewal System

Description
-----------
A simple PHP/MySQL web application for managing business permit applications and renewals. Built as a school project to demonstrate CRUD operations, forms, session-based auth, and basic client-side interactivity.

Purpose
-------
School-use only: this repository contains unhashed (plain-text) passwords in the example data for demonstration/grading. DO NOT deploy to production or public environments.

Important security note
-----------------------
- This project uses plain-text passwords in its examples/seed data. This is insecure.
- Do not use the bundled data in any live environment.
- If you continue development, migrate immediately to secure password storage (password_hash / password_verify), prepared statements, HTTPS, CSRF protection, and other standard hardening steps.

Quick setup (short)
-------------------
1. Clone:
```
git clone https://github.com/01gem/Business-Permit-System-CLAUDE.git
cd Business-Permit-System-CLAUDE
```
2. Create DB and import seed SQL if available:
```
mysql -u root -p business_permits < database/seed.sql
```
3. Configure DB credentials in config.php (or app/config.php).
4. Serve with PHP built-in server for local testing:
```
php -S localhost:8000 -t public
```

Hardening (must-do before any non-school use)
---------------------------------------------
- Hash passwords with password_hash() and verify with password_verify().
- Use prepared statements (PDO recommended).
- Serve over HTTPS, enable secure session cookies, add CSRF protection, input validation/escaping, and rate limiting.
- Remove or replace seeded plain-text credentials.

Receipt feature — brief setup (major update)
--------------------------------------------
Overview
- Employees must now provide receipt information when approving applications. Receipt data is required for renewals.

DB changes
- Add columns to `applications`:
  - `receipt_number` VARCHAR(100)
  - `receipt_amount` DECIMAL(10,2)
  - `receipt_file` VARCHAR(255)

Quick migration
- Run provided migration or execute:
```sql
ALTER TABLE `applications`
ADD COLUMN `receipt_number` VARCHAR(100) DEFAULT NULL AFTER `permit_number`,
ADD COLUMN `receipt_amount` DECIMAL(10,2) DEFAULT NULL AFTER `receipt_number`,
ADD COLUMN `receipt_file` VARCHAR(255) DEFAULT NULL AFTER `receipt_amount`;
```

Files changed (high level)
- employee-dashboard.php: approval modal now collects receipt number, amount, file (PDF/JPG/PNG, ≤5MB), and optional notes.
- scripts/employee-dashboard.js: approveApplication() opens modal and submits FormData for file upload.
- api/approve-application.php: accepts multipart/form-data, validates file type/size, stores file in uploads/receipts/, saves receipt data in DB, and cleans up on failure.

Upload directory
- Location: `uploads/receipts/`
- Create manually or allow the API to create it:
```
mkdir -p uploads/receipts
chmod 755 uploads/receipts
```
- Naming: `receipt_{application_id}_{timestamp}.{ext}`

Security checks for receipts
- Accept only PDF, JPG, JPEG, PNG
- Max file size 5MB
- Ensure employee authentication for approval endpoints
- Use unique filenames and delete uploaded files if DB insert fails

Errors & troubleshooting (short)
- Check PHP error logs, browser console, DB credentials in config.php, and file permissions for `uploads/`.

Future ideas
- Customer receipt viewing/download, email copies, verification workflow, and audit history.

Contributing / Updating README
------------------------------
Create a branch, update README.md with this content, commit, and open a PR for review:
```
git checkout -b docs/update-readme
git add README.md
git commit -m "docs: update README with receipt feature brief and security notice"
git push --set-upstream origin docs/update-readme
```

License
-------
Include a license if required by your school, otherwise leave unspecified for class submissions.
