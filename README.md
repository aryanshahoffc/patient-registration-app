# PatientScribeSync

A modern, frontend-only patient management system built with React, TypeScript, and PGlite. This application provides a secure way to manage patient records directly in the browser with no backend required.

## Features

- 🏥 **Patient Registration**: Easy-to-use form for adding new patients
- 📊 **Patient Records**: View and manage existing patient data
- 🔍 **SQL Query Interface**: Advanced search capabilities using SQL
- 💾 **Local Storage**: All data is stored securely in the browser
- 🌓 **Dark/Light Theme**: Support for different viewing preferences
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── PatientRegistration.tsx  # Patient registration form
│   └── PatientQuery.tsx         # SQL query interface
├── App.tsx                      # Main application component
├── main.tsx                     # Application entry point
└── styles.css                   # Global styles
```

## Database Schema

The application uses PGlite with the following schema:

```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development

The project is built using:
- React with TypeScript for the UI
- PGlite for local database operations
- React Query for state management
- Vite as the build tool

## Git Commit History

The project features are organized in the following commits:

1. Initial project setup with Vite, React, and TypeScript configuration
2. Add SQLite database initialization and schema for patient management
3. Add patient registration form with validation and database integration
4. Add patient query interface with SQL execution capabilities
5. Add responsive UI design with dark theme support
6. Add main application layout and navigation
7. Add comprehensive documentation

## License

© 2025 PatientScribeSync. All rights reserved.

## Security Note

This application stores all data in the browser's local storage. While this ensures data privacy by keeping everything local, it also means:
- Data persists only in the current browser
- Clearing browser data will erase the database
- No synchronization between devices

Consider this application for demonstration or small-scale use cases where server-side storage is not required or desired.
