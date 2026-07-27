import { useState } from 'react'

import { createContext } from 'react'

const AuthContext = createContext()

function AuthProvider({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  return (
    <AuthContext.Provider
      value={{ isAuthorized, setIsAuthorized, accessToken, setAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
