import { useState } from 'react'
import { useQuery } from 'react-query'

interface PatientQueryProps {
  db: any
}

const PatientQuery = ({ db }: PatientQueryProps) => {
  const [sqlQuery, setSqlQuery] = useState(`SELECT * FROM patients ORDER BY created_at DESC LIMIT 10;`)
  const [error, setError] = useState('')

  const { data, isLoading, refetch } = useQuery(
    ['patients', sqlQuery],
    async () => {
      try {
        setError('')
        const result = await db.query(sqlQuery)
        return result.rows
      } catch (err: any) {
        setError(err.message)
        return []
      }
    }
  )

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSqlQuery(e.target.value)
  }

  return (
    <article>
      <h2>Query Patients</h2>
      <textarea
        value={sqlQuery}
        onChange={handleQueryChange}
        rows={4}
        placeholder="Enter your SQL query here..."
      />
      <button onClick={() => refetch()}>Run Query</button>

      {error && (
        <div role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : data && data.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={i}>
                  {Object.values(row).map((value: any, j: number) => (
                    <td key={j}>{value?.toString()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No results found</p>
      )}
    </article>
  )
}

export default PatientQuery
