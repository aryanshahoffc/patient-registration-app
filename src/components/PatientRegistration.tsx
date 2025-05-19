import React, { useState } from 'react';
import { DatabaseInterface } from '../App';

interface PatientRegistrationProps {
  db: DatabaseInterface;
  onSuccess: () => void;
}

interface PatientData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
}

const PatientRegistration: React.FC<PatientRegistrationProps> = ({ db, onSuccess }) => {
  const [formData, setFormData] = useState<PatientData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    email: '',
    phone: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await db.query(
        `INSERT INTO patients (first_name, last_name, date_of_birth, email, phone)
         VALUES ($1, $2, $3, $4, $5)`,
        [formData.first_name, formData.last_name, formData.date_of_birth, formData.email, formData.phone]
      );

      setSuccess(true);
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        email: '',
        phone: ''
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register patient');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="success-message" role="status">
          Patient registered successfully!
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="first_name">First Name:</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="last_name">Last Name:</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="date_of_birth">Date of Birth:</label>
        <input
          type="date"
          id="date_of_birth"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone:</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="submit-button">
        Register Patient
      </button>
    </form>
  );
};

export default PatientRegistration;
