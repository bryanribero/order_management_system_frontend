import RegisterComponent from '../components/RegisterComponent'
import TextRegister from '../components/TextRegister'
import PageTransition from '../effects/PageTransition'
import { useState } from 'react'
import './login.css'

export default function Register() {
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [uniqueError, setUniqueError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState([])

  const changeEmail = (e) => setEmail(e.target.value)
  const changePassword = (e) => setPassword(e.target.value)

  const handlerRegister = async (e) => {
    e.preventDefault()

    setUniqueError('')
    setErrors([])
    setRegisterSuccess('')

    try {
      const response = await fetch(
        'https://order-management-system-995e.onrender.com/api/auth/register',
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
        if (response.status === 409) {
          setErrors([])
          setUniqueError(data.errors?.[0]?.message)
        } else if (response.status === 400) {
          setUniqueError('')
          setErrors(data.errors)
        }
        return
      }

      setEmail('')
      setPassword('')
      setUniqueError('')
      setErrors([])

      setRegisterSuccess('Usuario creado correctamente')
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <div className="auth-container">
      <PageTransition direction="right">
        <main className="main-login">
          <div className="div-container">
            <TextRegister />
            <RegisterComponent
              errors={errors}
              handlerRegister={handlerRegister}
              email={email}
              password={password}
              changeEmail={changeEmail}
              changePassword={changePassword}
              registerSuccess={registerSuccess}
              uniqueError={uniqueError}
            />
          </div>
        </main>
      </PageTransition>
    </div>
  )
}
