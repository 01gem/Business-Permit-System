# Business Permit System

A lightweight web application for managing business permit applications, reviews, and approvals. Built primarily with PHP, JavaScript, HTML, and CSS.

## Tech Stack

- PHP (server-side)
- JavaScript (client-side)
- HTML/CSS (UI)

Language composition:
- PHP — 53.8%
- JavaScript — 26.9%
- CSS — 13.2%
- HTML — 6.1%

## Features

- User authentication (login) via a dedicated auth page
- Role-based dashboards:
  - Customer Dashboard (`customer-dashboard.php`) for applicants
  - Employee Dashboard (`employee-dashboard.php`) for staff
- Configurable database connection (`config.php`)
- SQL schema for quick setup (`business_permit_system.sql`)
- Organized static assets (`styles/`, `scripts/`, `icon/`)
- API scaffolding for backend operations (`api/`)

## Project Structure

```
.
├─ README.md
├─ index.html                 # Landing page
├─ auth.html                  # Login/authentication page
├─ config.php                 # Database configuration
├─ customer-dashboard.php     # Customer-facing dashboard
├─ employee-dashboard.php     # Employee/staff dashboard
├─ business_permit_system.sql # Database schema
├─ api/                       # API endpoints (PHP)
├─ styles/                    # CSS assets
├─ scripts/                   # JavaScript assets
└─ icon/                      # Icons and images
```

## Getting Started

### Prerequisites

- PHP 8.x or newer
- MySQL or MariaDB
- A web server (Apache/Nginx) or PHP built-in server

### Installation

1. Clone the repository
   ```
   git clone https://github.com/01gem/Business-Permit-System.git
   cd Business-Permit-System
   ```

2. Create the database and import the schema
   - Create a database (e.g., `business_permit_system`)
   - Import `business_permit_system.sql` using your SQL client or:
     ```
     mysql -u <user> -p <database_name> < business_permit_system.sql
     ```

3. Configure database credentials
   - Open `config.php`
   - Update the host, database name, username, and password to match your environment

4. Run the application
   - Using PHP built-in server (for local development):
     ```
     php -S localhost:8000
     ```
     Then open http://localhost:8000 in your browser.
   - Or configure your web server’s document root to this repository.

## Usage

- Start at `index.html` or go directly to `auth.html` to log in.
- After authentication:
  - Customers are redirected to `customer-dashboard.php`
  - Employees are redirected to `employee-dashboard.php`
- Ensure you have corresponding user records in the database to authenticate successfully.

## API

The `api/` directory contains server-side endpoints that power dashboard operations. Refer to the PHP files inside `api/` for available routes and request/response formats.

## Configuration

- `config.php` centralizes database connection details.
- For production, ensure sensitive credentials are secured and not exposed publicly.

## Development Notes

- Place custom CSS in `styles/`
- Place custom JS in `scripts/`
- Add images/icons to `icon/`
- Follow the existing file naming and directory structure for consistency.

## Changelog

2025-10-26
- Added `auth.html` for user authentication
- Introduced role-based dashboards: `customer-dashboard.php`, `employee-dashboard.php`
- Added initial database schema: `business_permit_system.sql`
- Centralized database configuration via `config.php`
- Created asset directories: `styles/`, `scripts/`, `icon/`
- Added landing page: `index.html`
- Established `api/` directory for backend endpoints

## License

No license specified. If you plan to distribute or modify this project, consider adding a license file.

## Maintainer

- [01gem](https://github.com/01gem)
