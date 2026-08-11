import { useEffect } from 'react'
import { useState } from 'react'

import { createContext } from 'react'
import Loading from '../components/Loading'

const AuthContext = createContext()

function AuthProvider({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null)
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch(
          'https://order-management-system-995e.onrender.com/api/auth/refresh',
          {
            method: 'POST',
            credentials: 'include',
          }
        )

        if (!response.ok) {
          setIsAuthorized(false)
          return
        }

        const data = await response.json()

        setAccessToken(data.accessToken)
        setIsAuthorized(true)
      } catch (error) {
        console.error(error)
        setIsAuthorized(false)
      }
    }

    restoreSession()
  }, [])

  if (isAuthorized === null) return <Loading />

  return (
    <AuthContext.Provider
      value={{ isAuthorized, setIsAuthorized, accessToken, setAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
