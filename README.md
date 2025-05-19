# Patient Registration System

A frontend-only patient registration system built with React, TypeScript, and PgLite for data storage. This application allows users to register new patients and query records using raw SQL, with data persistence across page refreshes and synchronized data across multiple tabs.

## Features

- Patient registration form with validation
- Raw SQL query interface
- Data persistence using PgLite
- Cross-tab data synchronization
- Responsive UI using Pico CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### Registering a Patient
Fill out the registration form with the patient's details and click "Register Patient". Required fields are marked with validation errors if left empty.

### Querying Data
Use the SQL query interface to search and filter patient records. Some example queries:

```sql
-- Get all patients
SELECT * FROM patients;

-- Search by name
SELECT * FROM patients WHERE first_name LIKE '%John%';

-- Get recent registrations
SELECT * FROM patients ORDER BY created_at DESC LIMIT 5;
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes

- Data is stored locally using PgLite and persists across page refreshes
- Changes are synchronized across multiple tabs in the same browser
- The application is frontend-only and doesn't require a backend server
