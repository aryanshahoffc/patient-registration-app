import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { Database } from 'sql.js'

interface PatientForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

interface PatientRegistrationProps {
  db: Database;
  onSuccess?: () => void;
}

const PatientRegistration = ({ db, onSuccess }: PatientRegistrationProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientForm>()
  const queryClient = useQueryClient()
  
  const mutation = useMutation(
    async (data: PatientForm) => {
      db.run(
        `INSERT INTO patients (first_name, last_name, date_of_birth, email, phone)
         VALUES (?, ?, ?, ?, ?)`,
        [data.firstName, data.lastName, data.dateOfBirth, data.email, data.phone]
      )
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patients')
        reset()
        onSuccess?.()
      },
    }
  )

  const onSubmit = (data: PatientForm) => {
    mutation.mutate(data)
  }

  return (
    <article>
      <h2>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6m3-3h-6" />
        </svg>
        New Patient Registration
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <label>
            First Name
            <input
              type="text"
              placeholder="Enter first name"
              {...register('firstName', { required: true })}
            />
            {errors.firstName && <small className="error-message">This field is required</small>}
          </label>

          <label>
            Last Name
            <input
              type="text"
              placeholder="Enter last name"
              {...register('lastName', { required: true })}
            />
            {errors.lastName && <small className="error-message">This field is required</small>}
          </label>
        </div>

        <div className="form-grid">
          <label>
            Date of Birth
            <input
              type="date"
              {...register('dateOfBirth', { required: true })}
            />
            {errors.dateOfBirth && <small className="error-message">This field is required</small>}
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="patient@example.com"
              {...register('email', {
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              })}
            />
            {errors.email && <small className="error-message">Invalid email address</small>}
          </label>
        </div>

        <label>
          Phone Number
          <input
            type="tel"
            placeholder="(123) 456-7890"
            {...register('phone')}
          />
        </label>

        <button 
          type="submit" 
          disabled={mutation.isLoading}
          aria-busy={mutation.isLoading}
        >
          {mutation.isLoading ? 'Registering Patient...' : 'Register Patient'}
        </button>

        {mutation.isSuccess && (
          <div className="success-message">
            Patient registered successfully!
          </div>
        )}
      </form>
    </article>
  )
}

export default PatientRegistration
