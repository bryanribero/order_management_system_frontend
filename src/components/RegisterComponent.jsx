import AuthForm from '../components/AuthForm'
import { Link } from 'react-router-dom'

export default function RegisterComponent({
  errors,
  handlerRegister,
  email,
  password,
  changeEmail,
  changePassword,
  registerSuccess,
  uniqueError,
}) {
  return (
    <section className="card-login left">
      <div className="div-title">
        <h2>Creá tu cuenta</h2>
        <p id="texto-p">
          Ingresá tus datos para administrar tus pedidos y entregas.
        </p>
      </div>

      {registerSuccess && (
        <p role="alert" className="success-register">
          {registerSuccess}
        </p>
      )}

      {uniqueError && (
        <p role="alert" className="credencial-error">
          {uniqueError}
        </p>
      )}

      <div className="div-form">
        <AuthForm
          errors={errors}
          handlerSubmit={handlerRegister}
          email={email}
          password={password}
          changeEmail={changeEmail}
          changePassword={changePassword}
          placeholder={'Mínimo 8 caracteres'}
          textSubmit={'Crear Cuenta'}
        />
        <hr />
        <div className="container-register">
          <p>
            ¿Ya tenés una cuenta?
            <Link to={'/login'} className="link">
              Iniciar sesión
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
