import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const { isAuthorized } = useContext(AuthContext)

  if (!isAuthorized) {
    return <Navigate to={'/login'} replace />
  }

  return children
}
