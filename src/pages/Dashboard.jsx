import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  Package,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import ComponentTransition from '../effects/ComponentTransition'
import Pagination from '../components/Pagination'
import { AuthContext } from '../context/AuthContext'
import { authenticatedFetch } from '../services/authenticatedFetch'
import './layout.css'
import './dashboard.css'

const apiBaseUrl = 'https://order-management-system-995e.onrender.com/api'
const recentOrdersPerPage = 5
const emptyDashboardStats = {
  totalSales: 0,
  totalOrders: 0,
  totalPending: 0,
  totalCompleted: 0,
  totalCancelled: 0,
}

const normalizeStatus = (status) => {
  const value = String(status || 'pending')
    .trim()
    .toLocaleLowerCase()
  if (['completed', 'complete', 'completado', 'completada'].includes(value))
    return 'completed'
  if (['cancelled', 'canceled', 'cancelado', 'cancelada'].includes(value))
    return 'cancelled'
  if (['pending', 'pendiente'].includes(value)) return 'pending'
  return 'other'
}

const statusLabels = {
  completed: 'Completado',
  pending: 'Pendiente',
  cancelled: 'Cancelado',
  other: 'Otro',
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0)

const formatOrderDate = (value) => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return date.toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Dashboard() {
  const { accessToken, setAccessToken } = useContext(AuthContext)
  const [dashboardStats, setDashboardStats] = useState(emptyDashboardStats)
  const [orders, setOrders] = useState([])
  const [customersById, setCustomersById] = useState(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [recentOrdersError, setRecentOrdersError] = useState('')
  const [recentOrdersPage, setRecentOrdersPage] = useState(1)

  useEffect(() => {
    let isActive = true

    const loadDashboardData = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const options = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
        const [statsResult, ordersResult, customersResult] =
          await Promise.allSettled([
            authenticatedFetch(
              `${apiBaseUrl}/dashboard`,
              options,
              accessToken,
              setAccessToken
            ),
            authenticatedFetch(
              `${apiBaseUrl}/orders`,
              options,
              accessToken,
              setAccessToken
            ),
            authenticatedFetch(
              `${apiBaseUrl}/customers`,
              options,
              accessToken,
              setAccessToken
            ),
          ])

        if (statsResult.status === 'rejected') throw statsResult.reason
        if (!statsResult.value.ok)
          throw new Error('No se pudieron cargar las estadísticas.')

        const dashboardData = await statsResult.value.json()
        if (!dashboardData.success || !dashboardData.stats)
          throw new Error('La API devolvió estadísticas inválidas.')

        const stats = dashboardData.stats
        const nextStats = {
          totalSales: Number(stats.totalSales) || 0,
          totalOrders: Number(stats.totalOrders) || 0,
          totalPending: Number(stats.totalPending) || 0,
          totalCompleted: Number(stats.totalCompleted) || 0,
          totalCancelled: Number(stats.totalCancelled) || 0,
        }

        let nextOrders = []
        let nextCustomers = new Map()
        let nextRecentOrdersError = ''
        if (ordersResult.status === 'fulfilled' && ordersResult.value.ok) {
          try {
            const ordersData = await ordersResult.value.json()
            nextOrders = Array.isArray(ordersData.orders)
              ? ordersData.orders
              : []
          } catch {
            nextRecentOrdersError =
              'No se pudieron cargar los pedidos recientes.'
          }
        } else {
          nextRecentOrdersError = 'No se pudieron cargar los pedidos recientes.'
        }

        if (
          customersResult.status === 'fulfilled' &&
          customersResult.value.ok
        ) {
          try {
            const customersData = await customersResult.value.json()
            nextCustomers = new Map(
              (Array.isArray(customersData.customers)
                ? customersData.customers
                : []
              ).map((customer) => [
                String(customer.id_customer ?? customer.id),
                customer,
              ])
            )
          } catch {
            nextCustomers = new Map()
          }
        }

        if (isActive) {
          setDashboardStats(nextStats)
          setOrders(nextOrders)
          setCustomersById(nextCustomers)
          setRecentOrdersError(nextRecentOrdersError)
        }
      } catch (error) {
        if (isActive)
          setLoadError(error.message || 'Ocurrió un error al cargar los datos.')
        console.error(error)
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      isActive = false
    }
  }, [accessToken, setAccessToken])

  const sortedOrders = useMemo(
    () =>
      [...orders].sort((a, b) => {
        const aDate = new Date(a.created_at || 0).getTime()
        const bDate = new Date(b.created_at || 0).getTime()
        return bDate - aDate
      }),
    [orders]
  )

  const recentOrdersTotalPages = Math.max(
    1,
    Math.ceil(sortedOrders.length / recentOrdersPerPage)
  )
  const visibleRecentOrders = sortedOrders.slice(
    (recentOrdersPage - 1) * recentOrdersPerPage,
    recentOrdersPage * recentOrdersPerPage
  )

  const chartSegments = [
    {
      key: 'completed',
      label: statusLabels.completed,
      value: dashboardStats.totalCompleted,
      color: '#21835a',
    },
    {
      key: 'pending',
      label: statusLabels.pending,
      value: dashboardStats.totalPending,
      color: '#e2a728',
    },
    {
      key: 'cancelled',
      label: statusLabels.cancelled,
      value: dashboardStats.totalCancelled,
      color: '#e22828',
    },
  ]
  const chartDistributionTotal = chartSegments.reduce(
    (total, segment) => total + segment.value,
    0
  )
  let accumulatedPercent = 0
  const chartGradient = chartSegments
    .filter(({ value }) => value > 0)
    .map(({ value, color }) => {
      const start = accumulatedPercent
      accumulatedPercent += chartDistributionTotal
        ? (value / chartDistributionTotal) * 100
        : 0
      return `${color} ${start}% ${accumulatedPercent}%`
    })
    .join(', ')
  const chartBackground = chartGradient || '#e5e9e6 0% 100%'
  const isStatsUnavailable = isLoading || Boolean(loadError)

  return (
    <div className="layout">
      <Navbar />
      <main className="container-content dashboard-content">
        <ComponentTransition>
          <div className="dashboard-page">
            <header className="dashboard-header">
              <div>
                <h1>¡Hola! 👋</h1>
                <p className="dashboard-subtitle">
                  Un resumen sencillo de la actividad de tu negocio.
                </p>
              </div>
            </header>

            <section className="dashboard-summary-banner">
              <div>
                <p className="dashboard-summary-eyebrow">
                  RESUMEN DE ACTIVIDAD
                </p>
                <h2>Tu negocio, en un vistazo</h2>
                <p>Indicadores generales de los pedidos registrados.</p>
              </div>
            </section>

            <section
              className="dashboard-shortcuts"
              aria-label="Accesos rápidos"
            >
              <Link className="dashboard-shortcut" to="/orders">
                <span className="dashboard-shortcut-icon">
                  <ClipboardList size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>Ver pedidos</strong>
                  <small>Consultá estados y detalles</small>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="dashboard-shortcut" to="/products">
                <span className="dashboard-shortcut-icon">
                  <Package size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>Administrar productos</strong>
                  <small>Revisá tu catálogo</small>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="dashboard-shortcut" to="/customers">
                <span className="dashboard-shortcut-icon">
                  <Users size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>Administrar clientes</strong>
                  <small>Consultá tus clientes</small>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="dashboard-shortcut" to="/couriers">
                <span className="dashboard-shortcut-icon">
                  <Truck size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>Administrar repartidores</strong>
                  <small>Gestioná las entregas</small>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </section>

            {loadError && (
              <div className="dashboard-message dashboard-error" role="alert">
                {loadError}
              </div>
            )}

            <section className="dashboard-stats" aria-label="Indicadores">
              <article className="dashboard-stat-card">
                <span className="dashboard-stat-icon sales-icon">
                  <ShoppingBag size={19} aria-hidden="true" />
                </span>
                <p>Ventas totales</p>
                <strong>
                  {isStatsUnavailable
                    ? '—'
                    : formatCurrency(dashboardStats.totalSales)}
                </strong>
                <small>Ventas acumuladas</small>
              </article>
              <article className="dashboard-stat-card">
                <span className="dashboard-stat-icon orders-icon">
                  <ClipboardList size={19} aria-hidden="true" />
                </span>
                <p>Pedidos totales</p>
                <strong>
                  {isStatsUnavailable ? '—' : dashboardStats.totalOrders}
                </strong>
                <small>Pedidos registrados</small>
              </article>
              <article className="dashboard-stat-card pending-stat-card">
                <span className="dashboard-stat-icon pending-icon">
                  <Package size={19} aria-hidden="true" />
                </span>
                <p>Pedidos pendientes</p>
                <strong>
                  {isStatsUnavailable ? '—' : dashboardStats.totalPending}
                </strong>
                <small>Esperando gestión</small>
              </article>
            </section>

            <section className="dashboard-analytics-grid">
              <article className="dashboard-panel status-panel">
                <header className="dashboard-panel-header">
                  <div>
                    <h2>Estado de pedidos</h2>
                    <p>Distribución de los pedidos registrados</p>
                  </div>
                  <span className="dashboard-panel-total">
                    {isStatsUnavailable
                      ? '—'
                      : `${dashboardStats.totalOrders} pedidos`}
                  </span>
                </header>
                {isLoading ? (
                  <p className="dashboard-empty">Cargando estados…</p>
                ) : loadError ? (
                  <p
                    className="dashboard-empty dashboard-error-text"
                    role="alert"
                  >
                    No se pudieron cargar los estados de pedidos.
                  </p>
                ) : dashboardStats.totalOrders === 0 ? (
                  <p className="dashboard-empty">
                    Todavía no hay pedidos para mostrar.
                  </p>
                ) : (
                  <div className="dashboard-status-content">
                    <div
                      className="dashboard-donut"
                      role="img"
                      aria-label={`Estado de ${dashboardStats.totalOrders} pedidos`}
                      style={{
                        background: `conic-gradient(${chartBackground})`,
                      }}
                    >
                      <span>
                        <strong>{dashboardStats.totalOrders}</strong>
                        <small>pedidos</small>
                      </span>
                    </div>
                    <ul className="dashboard-status-legend">
                      {chartSegments.map(({ key, label, value }) => (
                        <li key={key}>
                          <span className={`status-dot ${key}`} />
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>

              <article className="dashboard-panel recent-orders-panel">
                <header className="dashboard-panel-header">
                  <div>
                    <h2>Pedidos recientes</h2>
                    <p>Las últimas órdenes registradas</p>
                  </div>
                  <Link to="/orders" className="dashboard-text-link">
                    Ver todos <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </header>
                {isLoading ? (
                  <p className="dashboard-empty">Cargando pedidos…</p>
                ) : loadError ? (
                  <p
                    className="dashboard-empty dashboard-error-text"
                    role="alert"
                  >
                    Las estadísticas no pudieron cargarse.
                  </p>
                ) : recentOrdersError ? (
                  <p
                    className="dashboard-empty dashboard-error-text"
                    role="alert"
                  >
                    {recentOrdersError}
                  </p>
                ) : sortedOrders.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <ClipboardList size={24} aria-hidden="true" />
                    <p>Aún no hay pedidos recientes.</p>
                  </div>
                ) : (
                  <>
                    <div className="dashboard-table-wrap">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Pedido</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRecentOrders.map((order) => {
                            const status = normalizeStatus(order.status)
                            const customer = customersById.get(
                              String(order.id_customer)
                            )
                            return (
                              <tr key={order.id_order}>
                                <td className="dashboard-order-id">
                                  #{order.id_order}
                                </td>
                                <td>
                                  {customer?.name ||
                                    `Cliente #${order.id_customer ?? '—'}`}
                                </td>
                                <td>{formatOrderDate(order.created_at)}</td>
                                <td>{formatCurrency(order.total_amount)}</td>
                                <td>
                                  <span
                                    className={`dashboard-status-badge ${status}`}
                                  >
                                    <i />
                                    {statusLabels[status]}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={recentOrdersPage}
                      setCurrentPage={setRecentOrdersPage}
                      totalPages={recentOrdersTotalPages}
                    />
                  </>
                )}
              </article>
            </section>
          </div>
        </ComponentTransition>
      </main>
    </div>
  )
}
