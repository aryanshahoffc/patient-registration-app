import { useState } from 'react'
import { useQuery } from 'react-query'
import { Database } from 'sql.js'

interface PatientQueryProps {
  db: Database
}

const queryPresets = {
  allPatients: 'SELECT * FROM patients ORDER BY created_at DESC;',
  recentPatients: 'SELECT * FROM patients ORDER BY created_at DESC LIMIT 5;',
  patientCount: 'SELECT COUNT(*) as total_patients FROM patients;',
  todayPatients: "SELECT * FROM patients WHERE date(created_at) = date('now');",
} as const

type QueryResult = {
  [key: string]: any
}[]

const PatientQuery = ({ db }: PatientQueryProps) => {
  const [sqlQuery, setSqlQuery] = useState<string>(queryPresets.recentPatients)
  const [error, setError] = useState<string>('')

  const { data, isLoading, refetch } = useQuery<QueryResult>(
    ['patients', sqlQuery],
    async () => {
      try {
        setError('')
        const result = db.exec(sqlQuery)
        if (result.length === 0) return []
        
        const columns = result[0].columns
        return result[0].values.map(row => 
          Object.fromEntries(row.map((value, i) => [columns[i], value]))
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        return []
      }
    }
  )

  const handlePresetSelect = (preset: keyof typeof queryPresets) => {
    setSqlQuery(queryPresets[preset])
  }

  return (
    <div className="query-interface">
      <div className="query-presets">
        <h3>Quick Queries</h3>
        <div className="preset-buttons">
          {(Object.keys(queryPresets) as Array<keyof typeof queryPresets>).map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={sqlQuery === queryPresets[preset] ? 'active' : ''}
            >
              {preset.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="query-editor">
        <textarea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          rows={4}
          placeholder="Enter your SQL query here..."
          className="sql-textarea"
        />
        <button 
          onClick={() => refetch()}
          disabled={isLoading}
          className="execute-button"
        >
          {isLoading ? 'Running Query...' : 'Execute Query'}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading-state">
          <p>Executing query...</p>
        </div>
      ) : data && data.length > 0 ? (
        <div className="results-table">
          <table>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((value, j) => (
                    <td key={j}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">
          No results found. Try a different query.
        </div>
      )}
    </div>
  )
}

export default PatientQuery
