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
import { AuthContext } from '../context/AuthContext'
import { authenticatedFetch } from '../services/authenticatedFetch'
import './layout.css'
import './dashboard.css'

const apiBaseUrl = 'https://order-management-system-995e.onrender.com/api'
const recentOrdersLimit = 5

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
  const [orders, setOrders] = useState([])
  const [customersById, setCustomersById] = useState(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [orderLimit, setOrderLimit] = useState('10')

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
        const [ordersResponse, customersResponse] = await Promise.all([
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

        if (!ordersResponse.ok)
          throw new Error('No se pudieron cargar las estadísticas de pedidos.')

        const ordersData = await ordersResponse.json()
        const customersData = customersResponse.ok
          ? await customersResponse.json()
          : {}
        const nextOrders = Array.isArray(ordersData.orders)
          ? ordersData.orders
          : []
        const nextCustomers = new Map(
          (Array.isArray(customersData.customers)
            ? customersData.customers
            : []
          ).map((customer) => [
            String(customer.id_customer ?? customer.id),
            customer,
          ])
        )

        if (isActive) {
          setOrders(nextOrders)
          setCustomersById(nextCustomers)
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
  const selectedOrders = useMemo(
    () =>
      orderLimit === 'all'
        ? sortedOrders
        : sortedOrders.slice(0, Number(orderLimit)),
    [orderLimit, sortedOrders]
  )

  const stats = useMemo(() => {
    const counts = { completed: 0, pending: 0, cancelled: 0, other: 0 }
    let completedSales = 0

    selectedOrders.forEach((order) => {
      const status = normalizeStatus(order.status)
      counts[status] += 1
      if (status === 'completed')
        completedSales += Number(order.total_amount) || 0
    })

    return {
      counts,
      completedSales,
      pendingCount: counts.pending,
      totalOrders: selectedOrders.length,
      recentOrders: selectedOrders.slice(0, recentOrdersLimit),
    }
  }, [selectedOrders])

  const chartTotal = Object.values(stats.counts).reduce(
    (total, count) => total + count,
    0
  )
  const chartSegments = [
    { key: 'completed', label: statusLabels.completed, color: '#21835a' },
    { key: 'pending', label: statusLabels.pending, color: '#e2a728' },
    { key: 'cancelled', label: statusLabels.cancelled, color: '#e22828' },
    { key: 'other', label: statusLabels.other, color: '#8c9690' },
  ].filter(({ key }) => stats.counts[key] > 0)
  let accumulatedPercent = 0
  const chartGradient = chartSegments
    .map(({ key, color }) => {
      const start = accumulatedPercent
      accumulatedPercent += chartTotal
        ? (stats.counts[key] / chartTotal) * 100
        : 0
      return `${color} ${start}% ${accumulatedPercent}%`
    })
    .join(', ')

  return (
    <div className="layout">
      <Navbar />
      <main className="container-content dashboard-content">
        <ComponentTransition>
          <div className="dashboard-page">
            <header className="dashboard-header">
              <div>
                <p className="dashboard-eyebrow">ORDENA / ESTADÍSTICAS</p>
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
                <h2>Revisá tus pedidos más recientes</h2>
                <p>Las estadísticas se calculan sobre esta selección.</p>
              </div>
              <label className="dashboard-order-filter">
                <span>Mostrar</span>
                <select
                  value={orderLimit}
                  onChange={(event) => setOrderLimit(event.target.value)}
                  aria-label="Cantidad de pedidos para las estadísticas"
                >
                  <option value="10">Últimos 10 pedidos</option>
                  <option value="20">Últimos 20 pedidos</option>
                  <option value="all">Todos los pedidos</option>
                </select>
              </label>
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
                  {isLoading ? '—' : formatCurrency(stats.completedSales)}
                </strong>
                <small>De pedidos completados</small>
              </article>
              <article className="dashboard-stat-card">
                <span className="dashboard-stat-icon orders-icon">
                  <ClipboardList size={19} aria-hidden="true" />
                </span>
                <p>Pedidos analizados</p>
                <strong>{isLoading ? '—' : stats.totalOrders}</strong>
                <small>Todos los estados</small>
              </article>
              <article className="dashboard-stat-card pending-stat-card">
                <span className="dashboard-stat-icon pending-icon">
                  <Package size={19} aria-hidden="true" />
                </span>
                <p>Pedidos pendientes</p>
                <strong>{isLoading ? '—' : stats.pendingCount}</strong>
                <small>Esperando gestión</small>
              </article>
            </section>

            <section className="dashboard-analytics-grid">
              <article className="dashboard-panel status-panel">
                <header className="dashboard-panel-header">
                  <div>
                    <h2>Estado de pedidos</h2>
                    <p>Distribución de todas las órdenes</p>
                  </div>
                  <span className="dashboard-panel-total">
                    {isLoading ? '—' : `${stats.totalOrders} pedidos`}
                  </span>
                </header>
                {isLoading ? (
                  <p className="dashboard-empty">Cargando estados…</p>
                ) : chartTotal === 0 ? (
                  <p className="dashboard-empty">
                    Todavía no hay pedidos para mostrar.
                  </p>
                ) : (
                  <div className="dashboard-status-content">
                    <div
                      className="dashboard-donut"
                      role="img"
                      aria-label={`Estado de ${chartTotal} pedidos`}
                      style={{ background: `conic-gradient(${chartGradient})` }}
                    >
                      <span>
                        <strong>{chartTotal}</strong>
                        <small>pedidos</small>
                      </span>
                    </div>
                    <ul className="dashboard-status-legend">
                      {[
                        { key: 'completed', color: 'completed' },
                        { key: 'pending', color: 'pending' },
                        { key: 'cancelled', color: 'cancelled' },
                        { key: 'other', color: 'other' },
                      ]
                        .filter(({ key }) => stats.counts[key] > 0)
                        .map(({ key, color }) => (
                          <li key={key}>
                            <span className={`status-dot ${color}`} />
                            <span>{statusLabels[key]}</span>
                            <strong>{stats.counts[key]}</strong>
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
                ) : stats.recentOrders.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <ClipboardList size={24} aria-hidden="true" />
                    <p>Aún no hay pedidos recientes.</p>
                  </div>
                ) : (
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
                        {stats.recentOrders.map((order) => {
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
                )}
              </article>
            </section>
          </div>
        </ComponentTransition>
      </main>
    </div>
  )
}
