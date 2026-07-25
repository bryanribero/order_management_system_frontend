export default function FormError({ errors, field }) {
  const fieldErrors = errors?.filter((error) => error.field === field)

  return (
    <>
      {fieldErrors?.length > 0 && (
        <ul>
          {fieldErrors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      )}
    </>
  )
}
