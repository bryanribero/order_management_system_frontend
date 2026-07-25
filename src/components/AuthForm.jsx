import FormError from './FormError'

export default function AuthForm({
  email,
  changeEmail,
  password,
  changePassword,
  handlerSubmit,
  errors,
  textSubmit,
}) {
  return (
    <form>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        placeholder="ejemplo@correo.com"
        onChange={changeEmail}
      />
      <FormError errors={errors} field={'email'} />

      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        type="password"
        value={password}
        placeholder="Ingresa tu contraseña"
        onChange={changePassword}
      />
      <FormError errors={errors} field={'password'} />

      <button onClick={handlerSubmit}>{textSubmit}</button>
    </form>
  )
}
