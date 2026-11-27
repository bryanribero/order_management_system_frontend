import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Eye, Plus, Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import ComponentTransition from '../effects/ComponentTransition'
import OrderDetails from '../components/OrderDetails'
import OrderStatusModal from '../components/OrderStatusModal'
import OrderCreateModal from '../components/OrderCreateModal'
import Pagination from '../components/Pagination'
import { AuthContext } from '../context/AuthContext'
import { authenticatedFetch } from '../services/authenticatedFetch'
import './orders.css'

const apiBaseUrl = 'https://order-management-system-995e.onrender.com/api'
const statusFilters = ['Todos', 'Pendiente', 'Completado', 'Cancelado']
const ordersPerPage = 20
const getOrderCreatedAt = (order) => order.created_at

const createOrderDraft = () => ({
  action_token: globalThis.crypto.randomUUID(),
  id_customer: '',
  id_courier: '',
  note: '',
  items: [{ id_product: '', quantity: 1 }],
})

const formatOrderDate = (dateValue) => {
  if (!dateValue) return 'Sin fecha'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return dateValue
  return date.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatOrderStatus = (status) => {
  const normalizedStatus = status?.toLocaleLowerCase()
  const statusLabels = {
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    canceled: 'Cancelado',
  }
  return statusLabels[normalizedStatus] || status || 'Pendiente'
}

const mapOrder = (order, customersById, couriersById, productsById) => {
  const customer = customersById.get(String(order.id_customer))
  const courier = couriersById.get(String(order.id_courier))

  return {
    id: String(order.id_order),
    customer: {
      name: customer?.name || `Cliente #${order.id_customer}`,
      phone: customer?.phone || 'Sin teléfono',
    },
    date: formatOrderDate(order.created_at),
    total: Number(order.total_amount) || 0,
    status: formatOrderStatus(order.status),
    address: customer?.address || 'Sin dirección',
    courier: courier?.name || `Repartidor #${order.id_courier}`,
    observations: order.note || '',
    products: (order.orderItems || []).map((item) => ({
      id: String(item.id_item ?? `${order.id_order}-${item.id_product}`),
      name:
        productsById.get(String(item.id_product))?.name ||
        item.name ||
        `Producto #${item.id_product}`,
      quantity: Number(item.quantity) || 0,
      price:
        Number(item.subtotal) ||
        Number(item.unit_price) * Number(item.quantity) ||
        0,
    })),
  }
}

const fetchAllCouriers = async (accessToken, setAccessToken) => {
  let page = 1
  const allCouriers = []

  while (true) {
    const params = new URLSearchParams({ page, limit: 10 })
    const response = await authenticatedFetch(
      `${apiBaseUrl}/couriers?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
      accessToken,
      setAccessToken
    )
    if (!response.ok)
      throw new Error('No se pudieron obtener los repartidores.')

    const data = await response.json()
    allCouriers.push(...(Array.isArray(data.couriers) ? data.couriers : []))
    const totalPages = Number(data.pagination?.totalPages) || 1
    if (page >= totalPages) break
    page += 1
  }

  return allCouriers
}

const fetchOrdersAndLookups = async (accessToken, setAccessToken) => {
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
  const [ordersResponse, customersResponse, couriers, products] =
    await Promise.all([
      authenticatedFetch(
        `${apiBaseUrl}/orders`,
        requestOptions,
        accessToken,
        setAccessToken
      ),
      authenticatedFetch(
        `${apiBaseUrl}/customers`,
        requestOptions,
        accessToken,
        setAccessToken
      ),
      fetchAllCouriers(accessToken, setAccessToken),
      fetchAllProducts(accessToken, setAccessToken),
    ])

  if (!ordersResponse.ok) throw new Error('No se pudieron obtener los pedidos.')
  if (!customersResponse.ok)
    throw new Error('No se pudieron obtener los clientes.')

  const [ordersData, customersData] = await Promise.all([
    ordersResponse.json(),
    customersResponse.json(),
  ])
  const customers = Array.isArray(customersData.customers)
    ? customersData.customers
    : []
  const customersById = new Map(
    customers.map((customer) => [String(customer.id_customer), customer])
  )
  const couriersById = new Map(
    couriers.map((courier) => [
      String(courier.id_courier ?? courier.id),
      courier,
    ])
  )
  const productsById = new Map(
    products.map((product) => [String(product.id_product), product])
  )
  const orders = (Array.isArray(ordersData.orders) ? ordersData.orders : [])
    .map((order) => mapOrder(order, customersById, couriersById, productsById))
    .sort((a, b) => Number(b.id) - Number(a.id))

  return { orders, customers, couriers, products }
}

const fetchAllProducts = async (
  accessToken,
  setAccessToken,
  idCategory = ''
) => {
  let page = 1
  const allProducts = []

  while (true) {
    const params = new URLSearchParams({ page, limit: 10 })
    if (idCategory) params.set('id_category', idCategory)
    const response = await authenticatedFetch(
      `${apiBaseUrl}/products?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
      accessToken,
      setAccessToken
    )
    if (!response.ok) throw new Error('No se pudieron obtener los productos.')

    const data = await response.json()
    allProducts.push(...(Array.isArray(data.products) ? data.products : []))
    const totalPages = Number(data.pagination?.totalPages) || 1
    if (page >= totalPages) break
    page += 1
  }

  return allProducts
}

export default function Orders() {
  const { accessToken, setAccessToken } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [couriers, setCouriers] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [visibleProducts, setVisibleProducts] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [statusConfirmation, setStatusConfirmation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [orderDraft, setOrderDraft] = useState(createOrderDraft)
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false)
  const [catalogsLoaded, setCatalogsLoaded] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [productSearchError, setProductSearchError] = useState('')
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)

  useEffect(() => {
    let isActive = true

    setIsLoading(true)
    setLoadError('')
    fetchOrdersAndLookups(accessToken, setAccessToken)
      .then((data) => {
        if (!isActive) return
        setOrders(data.orders)
        setCustomers(data.customers)
        setCouriers(data.couriers)
        setProducts(data.products)
        setVisibleProducts(data.products)
      })
      .catch((error) => {
        if (isActive)
          setLoadError(error.message || 'Ocurrió un error al cargar pedidos.')
        console.error(error)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [accessToken, setAccessToken])

  const updateOrderDraft = (changes) => {
    setOrderDraft((currentDraft) => ({
      ...currentDraft,
      ...changes,
      action_token: globalThis.crypto.randomUUID(),
    }))
  }

  const loadCreateCatalogs = useCallback(async () => {
    setIsLoadingCatalogs(true)
    setCatalogError('')
    try {
      const response = await authenticatedFetch(
        `${apiBaseUrl}/categories`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } },
        accessToken,
        setAccessToken
      )
      if (!response.ok)
        throw new Error('No se pudieron obtener las categorías.')
      const data = await response.json()
      setCategories(Array.isArray(data.categories) ? data.categories : [])
      setCatalogsLoaded(true)
    } catch (error) {
      setCatalogError(
        error.message || 'No se pudieron cargar los datos para crear el pedido.'
      )
      console.error(error)
    } finally {
      setIsLoadingCatalogs(false)
    }
  }, [accessToken, setAccessToken])

  const openCreateModal = () => {
    setIsCreateModalOpen(true)
    if (!catalogsLoaded && !isLoadingCatalogs) loadCreateCatalogs()
  }

  const searchProductsByCategory = useCallback(
    async (idCategory) => {
      setProductSearchError('')
      if (!idCategory) {
        setVisibleProducts(products)
        return
      }

      setIsSearchingProducts(true)
      setVisibleProducts([])
      try {
        const filteredProducts = await fetchAllProducts(
          accessToken,
          setAccessToken,
          idCategory
        )
        setVisibleProducts(filteredProducts)
      } catch (error) {
        setProductSearchError(
          error.message || 'No se pudieron buscar productos de esa categoría.'
        )
      } finally {
        setIsSearchingProducts(false)
      }
    },
    [accessToken, products, setAccessToken]
  )

  const createOrder = async (draft) => {
    const body = {
      action_token: draft.action_token,
      id_customer: Number(draft.id_customer),
      id_courier: Number(draft.id_courier),
      note: draft.note.trim() || null,
      items: draft.items.map((item) => ({
        id_product: Number(item.id_product),
        quantity: Number(item.quantity),
      })),
    }

    const response = await authenticatedFetch(
      `${apiBaseUrl}/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      accessToken,
      setAccessToken
    )

    if (response.status === 400) throw await response.json()
    if (!response.ok) throw new Error('No se pudo crear el pedido.')
    const createdResponse = await response.json().catch(() => null)

    setOrderDraft(createOrderDraft())
    setIsCreateModalOpen(false)
    setCurrentPage(1)
    setStatusFilter('Todos')
    setSearch('')

    try {
      const refreshedData = await fetchOrdersAndLookups(
        accessToken,
        setAccessToken
      )
      setOrders(refreshedData.orders)
      setCustomers(refreshedData.customers)
      setCouriers(refreshedData.couriers)
      setProducts(refreshedData.products)
      setVisibleProducts(refreshedData.products)
      const createdOrder =
        createdResponse?.order ??
        createdResponse?.data?.order ??
        createdResponse?.data ??
        createdResponse
      const createdOrderDate = getOrderCreatedAt(createdOrder || {})
      if (createdOrderDate) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === String(createdOrder?.id_order ?? createdOrder?.id)
              ? { ...order, date: formatOrderDate(createdOrderDate) }
              : order
          )
        )
      }
      setLoadError('')
    } catch (error) {
      setLoadError('El pedido se creó, pero no se pudo actualizar el listado.')
      console.error(error)
    }
  }

  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesSearch = order.id.includes(search.trim())
        const matchesStatus =
          statusFilter === 'Todos' || order.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [orders, search, statusFilter]
  )
  const totalPages = Math.max(
    1,
    Math.ceil(visibleOrders.length / ordersPerPage)
  )
  const paginatedOrders = useMemo(
    () =>
      visibleOrders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
      ),
    [currentPage, visibleOrders]
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const updateSearch = (value) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const updateStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const toggleDetails = (orderId) => {
    setExpandedOrderId((currentId) => (currentId === orderId ? null : orderId))
  }

  const confirmStatusChange = async () => {
    if (!statusConfirmation) return
    const { orderId, nextStatus } = statusConfirmation

    const status = nextStatus === 'Completado' ? 'completed' : 'cancelled'
    const response = await authenticatedFetch(
      `${apiBaseUrl}/orders/status/${orderId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      },
      accessToken,
      setAccessToken
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const message = Array.isArray(errorData?.errors)
        ? errorData.errors
            .map((error) => error.message)
            .filter(Boolean)
            .join(' ')
        : errorData?.message || errorData?.error
      throw new Error(message || 'No se pudo actualizar el estado del pedido.')
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    )
    setStatusConfirmation(null)
  }

  return (
    <div className="layout">
      <Navbar />
      <ComponentTransition>
        <main className="container-main orders-main">
          <header className="orders-header">
            <div>
              <h1>Pedidos</h1>
              <p>Consultá y administrá el historial de pedidos.</p>
            </div>
            <button
              type="button"
              className="orders-create-button"
              onClick={openCreateModal}
              disabled={isLoading}
            >
              <Plus size={18} aria-hidden="true" /> Crear nuevo pedido
            </button>
          </header>

          <section
            className="orders-toolbar"
            aria-label="Buscar y filtrar pedidos"
          >
            <label className="orders-search">
              <Search size={19} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Buscar por número de pedido..."
                aria-label="Buscar por número de pedido"
              />
            </label>
            <div
              className="orders-status-filters"
              role="group"
              aria-label="Filtrar por estado"
            >
              {statusFilters.map((status) => (
                <button
                  type="button"
                  key={status}
                  className={statusFilter === status ? 'active' : ''}
                  onClick={() => updateStatusFilter(status)}
                >
                  {status !== 'Todos' && (
                    <span className={`filter-dot ${status.toLowerCase()}`} />
                  )}
                  {status === 'Todos' ? 'Todos' : status}
                </button>
              ))}
            </div>
          </section>

          <section
            className="orders-list-panel"
            aria-label="Listado de pedidos"
          >
            <div className="orders-table-scroll">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Pedido #</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="orders-empty" colSpan="6">
                        Cargando pedidos...
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td
                        className="orders-empty orders-load-error"
                        colSpan="6"
                      >
                        {loadError}
                      </td>
                    </tr>
                  ) : paginatedOrders.length ? (
                    paginatedOrders.map((order) => (
                      <FragmentRows
                        key={order.id}
                        order={order}
                        isExpanded={expandedOrderId === order.id}
                        onToggleDetails={() => toggleDetails(order.id)}
                        onRequestStatusChange={(nextStatus) =>
                          setStatusConfirmation({
                            orderId: order.id,
                            nextStatus,
                          })
                        }
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="orders-empty" colSpan="6">
                        No se encontraron pedidos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </section>
        </main>
      </ComponentTransition>
      <OrderStatusModal
        order={orders.find((order) => order.id === statusConfirmation?.orderId)}
        nextStatus={statusConfirmation?.nextStatus}
        onClose={() => setStatusConfirmation(null)}
        onConfirm={confirmStatusChange}
      />
      <OrderCreateModal
        isOpen={isCreateModalOpen}
        draft={orderDraft}
        customers={customers}
        couriers={couriers}
        products={products}
        visibleProducts={visibleProducts}
        categories={categories}
        isLoadingCatalogs={isLoadingCatalogs}
        isSearchingProducts={isSearchingProducts}
        catalogError={catalogError}
        productSearchError={productSearchError}
        onCategoryChange={searchProductsByCategory}
        onDraftChange={updateOrderDraft}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createOrder}
      />
    </div>
  )
}

function FragmentRows({
  order,
  isExpanded,
  onToggleDetails,
  onRequestStatusChange,
}) {
  return (
    <>
      <tr
        className={
          isExpanded ? 'order-summary-row expanded' : 'order-summary-row'
        }
      >
        <td className="order-id">#{order.id}</td>
        <td>{order.customer.name}</td>
        <td>{order.date}</td>
        <td className="order-money">
          ${' '}
          {new Intl.NumberFormat('es-UY', { minimumFractionDigits: 2 }).format(
            order.total
          )}
        </td>
        <td>
          <span className={`order-status-badge ${order.status.toLowerCase()}`}>
            <i />
            {order.status}
          </span>
        </td>
        <td>
          <div className="order-row-actions">
            <button
              type="button"
              className="order-view-button"
              onClick={onToggleDetails}
              aria-expanded={isExpanded}
            >
              <Eye size={17} /> {isExpanded ? 'Menos detalles' : 'Ver detalle'}
            </button>
            <button
              type="button"
              className="order-expand-button"
              onClick={onToggleDetails}
              aria-label={isExpanded ? 'Ocultar detalles' : 'Mostrar detalles'}
            >
              <ChevronDown size={18} className={isExpanded ? 'rotated' : ''} />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="order-details-row">
          <td colSpan="6">
            <OrderDetails
              order={order}
              onRequestStatusChange={onRequestStatusChange}
            />
          </td>
        </tr>
      )}
    </>
  )
}
