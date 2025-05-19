import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import initSqlJs, { Database } from 'sql.js'
import PatientRegistration from './components/PatientRegistration'
import PatientQuery from './components/PatientQuery'

const queryClient = new QueryClient()
const DB_KEY = 'patient_db'
const THEME_KEY = 'theme_preference'

type TabType = 'dashboard' | 'registration' | 'patients' | 'sql';

function App() {
  const [db, setDb] = useState<Database | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [patientCount, setPatientCount] = useState(0)

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Database initialization
  useEffect(() => {
    const initDb = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        })

        // Try to load existing database from localStorage
        const savedDb = localStorage.getItem(DB_KEY)
        let database: Database

        if (savedDb) {
          const uint8Array = new Uint8Array(JSON.parse(savedDb))
          database = new SQL.Database(uint8Array)
        } else {
          database = new SQL.Database()
          database.run(`
            CREATE TABLE IF NOT EXISTS patients (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              first_name TEXT NOT NULL,
              last_name TEXT NOT NULL,
              date_of_birth TEXT NOT NULL,
              email TEXT UNIQUE,
              phone TEXT,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
          `)
        }

        // Set up auto-save every 2 seconds
        const autoSaveInterval = setInterval(() => {
          if (database) {
            const data = database.export()
            localStorage.setItem(DB_KEY, JSON.stringify(Array.from(data)))
          }
        }, 2000)

        setDb(database)

        // Get initial patient count
        const result = database.exec("SELECT COUNT(*) as count FROM patients")[0]
        setPatientCount(result.values[0][0] as number)

        // Cleanup interval on unmount
        return () => {
          clearInterval(autoSaveInterval)
          database.close()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database')
      }
    }

    initDb()
  }, [])

  const updatePatientCount = () => {
    if (db) {
      const result = db.exec("SELECT COUNT(*) as count FROM patients")[0]
      setPatientCount(result.values[0][0] as number)
    }
  }

  if (error) {
    return (
      <div className="container" role="alert">
        <article className="error">
          <h2>Error initializing database</h2>
          <p>{error}</p>
        </article>
      </div>
    )
  }

  if (!db) {
    return (
      <div className="container">
        <article aria-busy="true">
          <h2>Loading database...</h2>
        </article>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'patients':
        return (
          <div className="page-container">
            <h1>Patient List</h1>
            <div className="page-content">
              <PatientQuery db={db} />
            </div>
          </div>
        )

      case 'registration':
        return (
          <div className="page-container">
            <h1>New Patient Registration</h1>
            <div className="page-content">
              <PatientRegistration db={db} onSuccess={updatePatientCount} />
            </div>
          </div>
        )

      case 'sql':
        return (
          <div className="page-container">
            <h1>SQL Query Interface</h1>
            <div className="page-content">
              <PatientQuery db={db} />
            </div>
          </div>
        )

      default:
        return (
          <div className="dashboard-container">
            <div className="hero-section">
              <h1>Welcome to PatientScribeSync</h1>
              <p>Your Modern Patient Management System</p>
              <div className="stats-container">
                <div className="stat-card">
                  <span className="stat-number">{patientCount}</span>
                  <span className="stat-label">Total Patients</span>
                </div>
              </div>
            </div>

            <div className="features-section">
              <div className="feature-card" onClick={() => setActiveTab('registration')}>
                <div className="feature-icon">👤</div>
                <h3>Patient Registration</h3>
                <p>Register new patients with ease</p>
              </div>
              <div className="feature-card" onClick={() => setActiveTab('patients')}>
                <div className="feature-icon">📋</div>
                <h3>Patient Records</h3>
                <p>View and manage patient data</p>
              </div>
              <div className="feature-card" onClick={() => setActiveTab('sql')}>
                <div className="feature-icon">🔍</div>
                <h3>Advanced Search</h3>
                <p>Query patient database</p>
              </div>
            </div>

            <div className="info-section">
              <h2>About Our System</h2>
              <div className="info-grid">
                <div className="info-card">
                  <h3>Secure</h3>
                  <p>All data is stored locally in your browser</p>
                </div>
                <div className="info-card">
                  <h3>Fast</h3>
                  <p>Lightning-fast operations with no server delay</p>
                </div>
                <div className="info-card">
                  <h3>Easy to Use</h3>
                  <p>Intuitive interface for healthcare professionals</p>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <header className="app-header">
          <nav className="top-nav">
            <div className="brand" onClick={() => setActiveTab('dashboard')}>
              PatientScribeSync
            </div>
            <ul>
              <li className={activeTab === 'dashboard' ? 'active' : ''}>
                <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
              </li>
              <li className={activeTab === 'registration' ? 'active' : ''}>
                <button onClick={() => setActiveTab('registration')}>Registration</button>
              </li>
              <li className={activeTab === 'patients' ? 'active' : ''}>
                <button onClick={() => setActiveTab('patients')}>Patients</button>
              </li>
              <li className={activeTab === 'sql' ? 'active' : ''}>
                <button onClick={() => setActiveTab('sql')}>SQL Query</button>
              </li>
            </ul>
          </nav>
        </header>

        <main className="main-content">
          {renderContent()}
        </main>

        <footer className="app-footer">
          <p>© 2025 PatientScribeSync. All rights reserved.</p>
          <p className="footer-subtitle">A frontend-only patient registration system</p>
        </footer>
      </div>
    </QueryClientProvider>
  )
}

export default App
