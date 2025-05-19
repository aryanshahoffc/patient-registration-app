import React, { useState } from 'react';
import { DatabaseInterface } from '../App';

interface PatientQueryProps {
  db: DatabaseInterface;
}

interface QueryResult {
  rows: Record<string, any>[];
  columns: string[];
}

const PatientQuery: React.FC<PatientQueryProps> = ({ db }) => {
  const [query, setQuery] = useState<string>('SELECT * FROM patients');
  const [results, setResults] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  const executeQuery = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate query
      if (!query.trim()) {
        throw new Error('Query cannot be empty');
      }

      const result = await db.query(query);
      console.log('Query result:', result); // Debug log

      // Handle empty result
      if (!result || !result.rows) {
        setResults({
          rows: [],
          columns: []
        });
        return;
      }

      // Get columns from the first row
      const columns = result.rows.length > 0 
        ? Object.keys(result.rows[0]) 
        : [];

      setResults({
        rows: result.rows,
        columns
      });
    } catch (err) {
      console.error('Query error:', err); // Debug log
      setError(err instanceof Error ? err.message : 'Error executing query');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="query-container">
      <div className="query-input">
        <textarea
          value={query}
          onChange={handleQueryChange}
          placeholder="Enter your SQL query here..."
          rows={4}
          className="query-textarea"
        />
        <button 
          onClick={executeQuery} 
          className="execute-button"
          disabled={isLoading}
        >
          {isLoading ? 'Executing...' : 'Execute Query'}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && (
        <div className="loading-message">
          Executing query...
        </div>
      )}

      {results && (
        <div className="results-container">
          {results.rows.length === 0 ? (
            <p>No results found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  {results.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.rows.map((row, i) => (
                  <tr key={i}>
                    {results.columns.map((column) => (
                      <td key={`${i}-${column}`}>
                        {row[column] !== null ? String(row[column]) : 'NULL'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="query-examples">
        <h3>Example Queries:</h3>
        <div className="example-queries">
          <button 
            onClick={() => setQuery('SELECT * FROM patients ORDER BY created_at DESC')}
            className="example-button"
          >
            List All Patients
          </button>
          <button 
            onClick={() => setQuery("SELECT first_name, last_name, date_of_birth FROM patients WHERE first_name LIKE 'J%'")}
            className="example-button"
          >
            Search by Name
          </button>
          <button 
            onClick={() => setQuery('SELECT COUNT(*) as total_patients FROM patients')}
            className="example-button"
          >
            Count Patients
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientQuery;
