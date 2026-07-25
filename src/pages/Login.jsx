import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [credentialError, setCredentialError] = useState('')

  const changeEmail = (e) => setEmail(e.target.value)
  const changePassword = (e) => setPassword(e.target.value)

  const { login } = useContext(AuthContext)

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

      login()

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main>
      <h1>Iniciar sesion</h1>
      <span>{credentialError}</span>
      <AuthForm
        errors={errors}
        handlerSubmit={handlerLogin}
        email={email}
        password={password}
        changeEmail={changeEmail}
        changePassword={changePassword}
        textSubmit={'Iniciar sesión'}
      />
      <span>
        ¿Aún no tienes una cuenta?<Link to={'/register'}> Crear cuenta</Link>
      </span>
    </main>
  )
}
