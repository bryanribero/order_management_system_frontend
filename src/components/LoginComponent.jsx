import { Link } from 'react-router-dom'
import AuthForm from '../components/AuthForm'

export default function LoginComponent({
  errors,
  handlerLogin,
  email,
  password,
  changeEmail,
  changePassword,
  credentialError,
}) {
  return (
    <section className="card-login">
      <div className="div-title">
        <h2>Iniciá sesión</h2>
        <p id="texto-p">
          Ingresá tus datos para administrar tus pedidos y entregas.
        </p>
      </div>

      {credentialError && (
        <p role="alert" className="credencial-error">
          {credentialError}
        </p>
      )}
      <div className="div-form">
        <AuthForm
          errors={errors}
          handlerSubmit={handlerLogin}
          email={email}
          password={password}
          changeEmail={changeEmail}
          changePassword={changePassword}
          placeholder={'Ingresá tu contraseña'}
          textSubmit={'Iniciar sesión'}
        />
        <hr />
        <div className="container-register">
          <p>
            ¿Todavía no tenés una cuenta?
            <Link to={'/register'} className="link">
              Crear usuario
            </Link>
          </p>

          <p id="p-terms">
            Al continuar, aceptás nuestros términos de uso y política de
            privacidad.
          </p>
        </div>
      </div>
    </section>
  )
}
