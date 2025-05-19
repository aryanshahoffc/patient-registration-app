import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'

interface PatientForm {
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  phone: string
}

interface PatientRegistrationProps {
  db: any
}

const PatientRegistration = ({ db }: PatientRegistrationProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientForm>()
  const queryClient = useQueryClient()

  const mutation = useMutation(
    async (data: PatientForm) => {
      await db.query(
        `INSERT INTO patients (first_name, last_name, date_of_birth, email, phone)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.firstName, data.lastName, data.dateOfBirth, data.email, data.phone]
      )
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patients')
        reset()
      },
    }
  )

  const onSubmit = (data: PatientForm) => {
    mutation.mutate(data)
  }

  return (
    <article>
      <h2>Register New Patient</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid">
          <label>
            First Name
            <input
              type="text"
              {...register('firstName', { required: true })}
            />
            {errors.firstName && <small>This field is required</small>}
          </label>

          <label>
            Last Name
            <input
              type="text"
              {...register('lastName', { required: true })}
            />
            {errors.lastName && <small>This field is required</small>}
          </label>
        </div>

        <label>
          Date of Birth
          <input
            type="date"
            {...register('dateOfBirth', { required: true })}
          />
          {errors.dateOfBirth && <small>This field is required</small>}
        </label>

        <label>
          Email
          <input
            type="email"
            {...register('email', {
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            })}
          />
          {errors.email && <small>Invalid email address</small>}
        </label>

        <label>
          Phone
          <input
            type="tel"
            {...register('phone')}
          />
        </label>

        <button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
    </article>
  )
}

export default PatientRegistration
