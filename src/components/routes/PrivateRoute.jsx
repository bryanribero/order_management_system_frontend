import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Loading from '../Loading'

export default function PrivateRoute({ children }) {
  const { isAuthorized } = useContext(AuthContext)

  if (isAuthorized === null) {
    return <Loading />
  }

  if (isAuthorized === false) {
    return <Navigate to={'/login'} replace />
  }

  return children
}
