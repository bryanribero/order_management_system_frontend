import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import './login.css'
import team from '../assets/order-management-team.png'
import { PackageCheck } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [credentialError, setCredentialError] = useState('')

  const changeEmail = (e) => setEmail(e.target.value)
  const changePassword = (e) => setPassword(e.target.value)

  const { setAccessToken, setIsAuthorized } = useContext(AuthContext)

  const navigate = useNavigate()

  const handlerLogin = async (e) => {
    e.preventDefault()

    setErrors([])
    setCredentialError('')

    try {
      const response = await fetch(
        'https://order-management-system-995e.onrender.com/api/auth/login',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-type': 'application/json' },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400) {
          setCredentialError('')
          setErrors(data.errors)
        } else if (response.status === 401) {
          setErrors([])
          setCredentialError(
            data.errors?.[0]?.message ?? 'Credenciales inválidas'
          )
        }
        return
      }

      setEmail('')
      setPassword('')

      setErrors([])
      setCredentialError('')

      setAccessToken(data.accessToken)
      console.log(data)
      setIsAuthorized(true)

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="main-login">
      <div className="div-container">
        <div className="container-welcome">
          <div className="container-icon">
            <span>
              <PackageCheck className="icon" size={38} />
            </span>
            <span className="ordena">Ordena</span>
          </div>
          <h2>Gestión simple, resultados claros</h2>
          <h1>Bienvenido a una forma más ordenada de trabajar.</h1>
          <p>
            Controlá cada pedido, coordiná entregas y mantené a tu equipo al día
            desde un solo lugar.
          </p>
          <img src={team} alt="order-managment-team-image" />
        </div>
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
      </div>
    </main>
  )
}
