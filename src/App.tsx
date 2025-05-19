import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { createPglite } from 'pglite'
import PatientRegistration from './components/PatientRegistration'
import PatientQuery from './components/PatientQuery'

const queryClient = new QueryClient()

function App() {
  const [db, setDb] = useState<any>(null)

  useEffect(() => {
    const initDb = async () => {
      const pglite = await createPglite()
      await pglite.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          date_of_birth DATE NOT NULL,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)
      setDb(pglite)
    }

    initDb()
  }, [])

  if (!db) return <div>Loading database...</div>

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container">
        <h1>Patient Registration System</h1>
        <div className="grid">
          <PatientRegistration db={db} />
          <PatientQuery db={db} />
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
