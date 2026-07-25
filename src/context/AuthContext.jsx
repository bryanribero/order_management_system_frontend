import { useState } from 'react'

import { createContext } from 'react'
import { clearAccessToken, setAccessToken } from '../auth/tokenManager'

const AuthContext = createContext()

function AuthProvider({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false)

  const login = (token) => {
    setAccessToken(token)
    setIsAuthorized(true)
  }

  const logout = () => {
    clearAccessToken()
    setIsAuthorized(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthorized, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
