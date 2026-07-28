import { useState } from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './login.css'
import LoginComponent from '../components/LoginComponent'
import WelcomeComponent from '../components/WelcomeComponent'
import PageTransition from '../effects/PageTransition'

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
      setIsAuthorized(true)

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="auth-container">
      <PageTransition direction="left">
        <main className="main-login">
          <div className="div-container">
            <WelcomeComponent />
            <LoginComponent
              errors={errors}
              handlerLogin={handlerLogin}
              email={email}
              password={password}
              changeEmail={changeEmail}
              changePassword={changePassword}
              credentialError={credentialError}
            />
          </div>
        </main>
      </PageTransition>
    </div>
  )
}
