import FormError from './FormError'

export default function AuthForm({
  email,
  changeEmail,
  password,
  changePassword,
  handlerSubmit,
  errors,
  textSubmit,
  placeholder,
  isLoading,
  textSubmitLoading,
}) {
  return (
    <form onSubmit={handlerSubmit} className="card-form">
      <div className="gap-input">
        <div className="gap-label">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            placeholder="ejemplo@correo.com"
            onChange={changeEmail}
          />
          <FormError errors={errors} field={'email'} />
        </div>

        <div className="gap-label">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            placeholder={placeholder}
            onChange={changePassword}
          />
          <FormError errors={errors} field={'password'} />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="auth-button">
        {isLoading ? (
          <>
            <span className="spinner"></span>
            {textSubmitLoading}
          </>
        ) : (
          textSubmit
        )}
      </button>
    </form>
  )
}
