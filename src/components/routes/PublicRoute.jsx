import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Loading from '../Loading'

export default function PublicRoute({ children }) {
  const { isAuthorized } = useContext(AuthContext)

  if (isAuthorized === null) {
    return <Loading />
  }

  if (isAuthorized === true) {
    return <Navigate to={'/dashboard'} replace />
  }

  return children
}
