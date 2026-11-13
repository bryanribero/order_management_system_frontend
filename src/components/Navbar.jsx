import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { accessToken, setAccessToken, setIsAuthorized } =
    useContext(AuthContext)
  const { pathname } = useLocation()

  const [isLoading, setIsLoading] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const isMoreActive = ['/customers', '/couriers', '/config'].includes(pathname)

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

  const renderLogoutButton = (isMobile = false) => {
    const buttonClassName = isMobile ? 'logout logout-mobile' : 'logout'
    const label = 'Cerrar sesión'

    if (isLoading) {
      return (
        <button className={buttonClassName} disabled>
          <span className="spinner-navbar"></span>
          <span className="text-button-loading">Cerrando sesión</span>
        </button>
      )
    }

    return (
      <button className={buttonClassName} onClick={logout}>
        <LogOut className="icon icon-button" size={35} />
        <span className="text-button">{label}</span>
      </button>
    )
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
                `navbar-link mobile-primary-link ${isActive ? 'active' : ''}`
              }
            >
              <li>
                <div className="container-icon-li">
                  <House className="icon icon-options" size={35} />
                  <span className="text-edit desktop-label">Estadísticas</span>
                  <span className="text-edit mobile-label">Inicio</span>
                </div>
              </li>
            </NavLink>
            <NavLink
              to={'/orders'}
              end
              className={({ isActive }) =>
                `navbar-link mobile-primary-link ${isActive ? 'active' : ''}`
              }
            >
              <li>
                <div className="container-icon-li">
                  <ClipboardList className="icon icon-options" size={35} />
                  <span className="text-edit">Pedidos</span>
                </div>
              </li>
            </NavLink>
          </div>
        </div>
        <div className="">
          <span className="navbar-subtitle">GESTIÓN</span>
          <div className="container-options">
            <NavLink
              to={'/products'}
              end
              className={({ isActive }) =>
                `navbar-link mobile-primary-link ${isActive ? 'active' : ''}`
              }
            >
              <li>
                <div className="container-icon-li">
                  <Package className="icon icon-options" size={35} />
                  <span className="text-edit">Productos</span>
                </div>
              </li>
            </NavLink>
            <NavLink
              to={'/customers'}
              end
              className={({ isActive }) =>
                `navbar-link mobile-secondary-link ${isActive ? 'active' : ''}`
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
              to={'/couriers'}
              end
              className={({ isActive }) =>
                `navbar-link mobile-secondary-link ${isActive ? 'active' : ''}`
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
        <div className="mobile-more-item">
          <button
            type="button"
            className={`mobile-more-toggle${
              isMoreOpen || isMoreActive ? ' active' : ''
            }`}
            aria-label="Más opciones"
            aria-expanded={isMoreOpen}
            aria-controls="mobile-more-menu"
            onClick={() => setIsMoreOpen((isOpen) => !isOpen)}
          >
            <MoreHorizontal className="icon icon-options" size={20} />
            <span className="text-edit">Más</span>
          </button>
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

      <div className="container-logout">{renderLogoutButton()}</div>
      <AnimatePresence>
        {isMoreOpen && (
          <motion.button
            key="mobile-more-backdrop"
            type="button"
            className="mobile-more-backdrop"
            aria-label="Cerrar menú de más opciones"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMoreOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            key="mobile-more-menu"
            className="mobile-more-menu"
            id="mobile-more-menu"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="mobile-more-header">
              <button
                type="button"
                className="mobile-more-collapse"
                aria-label="Contraer más opciones"
                aria-expanded="true"
                aria-controls="mobile-more-menu"
                onClick={() => setIsMoreOpen(false)}
              >
                <ChevronDown size={22} aria-hidden="true" />
              </button>
              <h2>Más opciones</h2>
            </div>
            <div className="mobile-more-grid">
              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  `mobile-more-link${isActive ? ' active' : ''}`
                }
                onClick={() => setIsMoreOpen(false)}
              >
                <Users size={20} />
                <span>Clientes</span>
              </NavLink>
              <NavLink
                to="/couriers"
                className={({ isActive }) =>
                  `mobile-more-link${isActive ? ' active' : ''}`
                }
                onClick={() => setIsMoreOpen(false)}
              >
                <Van size={20} />
                <span>Repartidores</span>
              </NavLink>
              <NavLink
                to="/config"
                className={({ isActive }) =>
                  `mobile-more-link${isActive ? ' active' : ''}`
                }
                onClick={() => setIsMoreOpen(false)}
              >
                <Settings size={20} />
                <span>Configuración</span>
              </NavLink>
            </div>
            {renderLogoutButton(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
