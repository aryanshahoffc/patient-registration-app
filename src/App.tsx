import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PGlite } from '@electric-sql/pglite'
import PatientRegistration from './components/PatientRegistration'
import PatientQuery from './components/PatientQuery'

const queryClient = new QueryClient()
const THEME_KEY = 'theme_preference'
const DB_KEY = 'patient_db_state'

type TabType = 'dashboard' | 'registration' | 'patients' | 'sql';

export interface DatabaseInterface {
  query: (sql: string, params?: any[]) => Promise<any>;
}

function App() {
  const [db, setDb] = useState<DatabaseInterface | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [patientCount, setPatientCount] = useState(0)

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  // Database initialization
  useEffect(() => {
    let pglite: PGlite | null = null;

    const initDb = async () => {
      try {
        pglite = new PGlite();

        // Wait a bit for initialization
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create the patients table
        await pglite.query(`
          CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Try to restore data from localStorage
        const savedData = localStorage.getItem(DB_KEY)
        if (savedData) {
          try {
            const patients = JSON.parse(savedData)
            for (const patient of patients) {
              await pglite.query(
                `INSERT INTO patients (first_name, last_name, date_of_birth, email, phone, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (email) DO NOTHING`,
                [
                  patient.first_name,
                  patient.last_name,
                  patient.date_of_birth,
                  patient.email,
                  patient.phone,
                  patient.created_at
                ]
              )
            }
          } catch (e) {
            console.error('Error restoring data:', e)
          }
        }

        const dbInterface: DatabaseInterface = {
          query: async (sql: string, params: any[] = []) => {
            if (!pglite) throw new Error('Database not initialized')
            const result = await pglite.query(sql, params)
            
            // After any modification query, save the current state
            if (sql.toLowerCase().includes('insert') || 
                sql.toLowerCase().includes('update') || 
                sql.toLowerCase().includes('delete')) {
              const allPatients = await pglite.query('SELECT * FROM patients')
              localStorage.setItem(DB_KEY, JSON.stringify(allPatients.rows))
            }
            
            return result
          }
        }

        setDb(dbInterface)

        // Get initial patient count
        const result = await pglite.query<{ count: string }>('SELECT COUNT(*) as count FROM patients')
        if (result.rows?.[0]) {
          setPatientCount(Number(result.rows[0].count))
        }

      } catch (err) {
        console.error('Database initialization error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize database')
      }
    }

    initDb()

    return () => {
      if (pglite) {
        try {
          pglite.query('COMMIT')
        } catch (e) {
          console.error('Error cleaning up database:', e)
        }
      }
    }
  }, [])

  const updatePatientCount = async () => {
    if (db) {
      const result = await db.query('SELECT COUNT(*) as count FROM patients')
      setPatientCount(Number(result.rows[0].count))
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
              <li>
                <button onClick={toggleTheme} className="theme-toggle">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
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
