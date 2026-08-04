import { NavLink } from 'react-router-dom'
import './navbar.css'
import {
  PackageCheck,
  House,
  ClipboardList,
  Package,
  Users,
  Van,
  Settings,
  LogOut,
} from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { accessToken, setAccessToken, setIsAuthorized } =
    useContext(AuthContext)

  const [isLoading, setIsLoading] = useState(false)

  const logout = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(
        'https://order-management-system-995e.onrender.com/api/auth/logout',
        {
          method: 'POST',
          headers: {
            Authorization: `bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        console.error('Error en la base de datos')
      }

      setIsAuthorized(false)
      setIsLoading(false)
      setAccessToken('')
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <nav className="navbar">
      <div className="container-title">
        <div className="container-logo-ordena">
          <span>
            <PackageCheck className="icon icon-logo" size={65} />
          </span>
          <span className="ordena-text">Ordena</span>
        </div>
        <span className="ordena-subtext">Sistema gestor de pedidos</span>
      </div>
      <ul>
        <div className="">
          <span className="navbar-subtitle">GENERAL</span>
          <div className="container-options">
            <NavLink
              to={'/dashboard'}
              end
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              <li>
                <div className="container-icon-li">
                  <House className="icon icon-options" size={35} />
                  <span className="text-edit">Estadísticas</span>
                </div>
              </li>
            </NavLink>
            <NavLink
              to={'/orders'}
              end
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              <li>
                <div className="container-icon-li">
                  <ClipboardList className="icon icon-options" size={35} />
                  <span className="text-edit">Pedidos</span>
                </div>
              </li>
            </NavLink>
            <NavLink
              to={'/products'}
              end
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              <li>
                <div className="container-icon-li">
                  <Package className="icon icon-options" size={35} />
                  <span className="text-edit">Productos</span>
                </div>
              </li>
            </NavLink>
          </div>
        </div>
        <div className="">
          <span className="navbar-subtitle">GESTIÓN</span>
          <div className="container-options">
            <NavLink
              to={'/customers'}
              end
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              <li>
                <div className="container-icon-li">
                  <Users className="icon icon-options" size={35} />
                  <span className="text-edit">Clientes</span>
                </div>
              </li>
            </NavLink>
            <NavLink
              to={'couriers'}
              end
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              <li>
                <div className="container-icon-li">
                  <Van className="icon icon-options" size={35} />
                  <span className="text-edit">Repartidores</span>
                </div>
              </li>
            </NavLink>
          </div>
        </div>
      </ul>
      <div className="container-config">
        <NavLink
          to={'/config'}
          end
          className={({ isActive }) =>
            isActive ? 'navbar-link active' : 'navbar-link'
          }
        >
          <div className="container-icon-li">
            <Settings className="icon icon-options" size={35} />
            <span className="text-edit">Configuración</span>
          </div>
        </NavLink>
      </div>

      <div className="container-logout">
        {isLoading ? (
          <button className="logout" disabled>
            <span className="spinner-navbar"></span>
            <span>Cerrando sesión</span>
          </button>
        ) : (
          <button className="logout" onClick={logout}>
            <LogOut className="icon icon-button" size={35} />
            <span className="text-button">Cerrar sesión</span>
          </button>
        )}
      </div>
    </nav>
  )
}
