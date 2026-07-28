import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function PublicRoute({ children }) {
  const { isAuthorized } = useContext(AuthContext)

  if (isAuthorized) {
    return <Navigate to={'/dashboard'} replace />
  }

  return children
}
