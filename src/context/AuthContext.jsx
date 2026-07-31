import { useEffect } from 'react'
import { useState } from 'react'

import { createContext } from 'react'
import Loading from '../components/Loading'

const AuthContext = createContext()

function AuthProvider({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null)
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    const verifyAuthorization = async () => {
      try {
        const response = await fetch(
          'https://order-management-system-995e.onrender.com/api/auth/me',
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-type': 'application/json' },
          }
        )

        if (!response.ok) {
          setIsAuthorized(false)
          return
        }

        setIsAuthorized(true)
      } catch {
        setIsAuthorized(false)
      }
    }

    verifyAuthorization()
    console.log(isAuthorized)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
