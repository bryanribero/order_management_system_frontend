import { Link, useParams } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import {
  ArrowLeft,
  FileText,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  UserRound,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import ComponentTransition from '../effects/ComponentTransition'
import CustomerModal from '../components/CustomerModal'
import OrderCreateModal from '../components/OrderCreateModal'
import OrderDetails from '../components/OrderDetails'
import OrderStatusModal from '../components/OrderStatusModal'
import Pagination from '../components/Pagination'
import { CustomerContext } from '../context/CustomerContext'
import { AuthContext } from '../context/AuthContext'
import { authenticatedFetch } from '../services/authenticatedFetch'
import './orders.css'
import './customerDetail.css'

const apiBaseUrl = 'https://order-management-system-995e.onrender.com/api'
const orderCreatedAt = (order) =>
  order.created_at || order.createdAt || order.created || order.date

const formatOrderDate = (value) => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatOrderTotal = (value) =>
  `$ ${new Intl.NumberFormat('es-UY', { minimumFractionDigits: 2 }).format(Number(value) || 0)}`

const formatOrderStatus = (status) => {
  const labels = {
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    canceled: 'Cancelado',
  }
  return labels[String(status).toLowerCase()] || status || 'Pendiente'
}

const mapCustomerOrderDetails = (order, customer, couriers, products) => {
  const couriersById = new Map(
    couriers.map((courier) => [
      String(courier.id_courier ?? courier.id),
      courier,
    ])
  )
  const productsById = new Map(
    products.map((product) => [String(product.id_product), product])
  )

  return {
    id: String(order.id_order ?? order.id),
    customer: {
      name: customer.name,
      phone: customer.phone || 'Sin teléfono',
    },
    date: formatOrderDate(orderCreatedAt(order)),
    total: Number(order.total_amount ?? order.total) || 0,
    status: formatOrderStatus(order.status),
    address: customer.address || 'Sin dirección',
    courier:
      couriersById.get(String(order.id_courier))?.name ||
      `Repartidor #${order.id_courier}`,
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

const createOrderDraft = (customerId = '') => ({
  action_token: globalThis.crypto.randomUUID(),
  id_customer: String(customerId || ''),
  id_courier: '',
  note: '',
  items: [{ id_product: '', quantity: 1 }],
})

const fetchAllProducts = async (
  accessToken,
  setAccessToken,
  idCategory = ''
) => {
  let page = 1
  const products = []

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
    products.push(...(Array.isArray(data.products) ? data.products : []))
    const totalPages = Number(data.pagination?.totalPages) || 1
    if (page >= totalPages) break
    page += 1
  }

  return products
}

const fetchAllCouriers = async (accessToken, setAccessToken) => {
  let page = 1
  const couriers = []

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
    couriers.push(...(Array.isArray(data.couriers) ? data.couriers : []))
    const totalPages = Number(data.pagination?.totalPages) || 1
    if (page >= totalPages) break
    page += 1
  }

  return couriers
}

export default function CustomerDetail() {
  const { customerId } = useParams()
  const {
    customers,
    fetchCustomers,
    isLoadingCustomers,
    customersError,
    idCustomer,
    setIdCustomer,
  } = useContext(CustomerContext)
  const { accessToken, setAccessToken } = useContext(AuthContext)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)
  const [orderDraft, setOrderDraft] = useState(() => createOrderDraft())
  const [orderCouriers, setOrderCouriers] = useState([])
  const [orderCategories, setOrderCategories] = useState([])
  const [orderProducts, setOrderProducts] = useState([])
  const [visibleOrderProducts, setVisibleOrderProducts] = useState([])
  const [isLoadingOrderCatalogs, setIsLoadingOrderCatalogs] = useState(false)
  const [orderCatalogsLoaded, setOrderCatalogsLoaded] = useState(false)
  const [orderCatalogError, setOrderCatalogError] = useState('')
  const [productSearchError, setProductSearchError] = useState('')
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)
  const [customerOrders, setCustomerOrders] = useState([])
  const [customerOrdersError, setCustomerOrdersError] = useState('')
  const [customerOrdersLimit, setCustomerOrdersLimit] = useState('5')
  const [customerOrdersPage, setCustomerOrdersPage] = useState(1)
  const [customerOrdersTotalPages, setCustomerOrdersTotalPages] = useState(1)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [statusConfirmation, setStatusConfirmation] = useState(null)
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false)
  const [orderDetailsError, setOrderDetailsError] = useState('')
  const [detailLookupsLoaded, setDetailLookupsLoaded] = useState(false)
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)
  const [loadedOrdersFor, setLoadedOrdersFor] = useState({
    customerId: '',
    page: 0,
    limit: 0,
    refreshKey: -1,
  })
  const customer = customers.find((item) => String(item.id) === customerId)
  const customerApiId = customer?.id_customer ?? customer?.id
  const customerOrdersPageSize =
    customerOrdersLimit === 'all' ? 10 : Number(customerOrdersLimit)
  const isLoadingCustomerOrders =
    Boolean(customerApiId) &&
    (loadedOrdersFor.customerId !== String(customerApiId) ||
      loadedOrdersFor.page !== customerOrdersPage ||
      loadedOrdersFor.limit !== customerOrdersPageSize ||
      loadedOrdersFor.refreshKey !== ordersRefreshKey)

  const updateCustomer = async (body) => {
    const response = await authenticatedFetch(
      `https://order-management-system-995e.onrender.com/api/customers/${idCustomer}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      accessToken,
      setAccessToken
    )

    if (response.status === 400) throw await response.json()
    if (!response.ok) throw new Error('No se pudo actualizar el cliente.')

    setIdCustomer('')
    await fetchCustomers()
  }

  useEffect(() => {
    if (!customerApiId) return
    let isActive = true
    const params = new URLSearchParams({
      page: String(customerOrdersPage),
      limit: String(customerOrdersPageSize),
    })

    authenticatedFetch(
      `${apiBaseUrl}/orders/customer/${customerApiId}?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
      accessToken,
      setAccessToken
    )
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudieron obtener los pedidos.')
        const data = await response.json()
        if (!isActive) return null
        setCustomerOrdersTotalPages(
          Math.max(1, Number(data.pagination?.totalPages) || 1)
        )
        return (Array.isArray(data.orders) ? data.orders : []).map((order) => ({
          id: String(order.id_order ?? order.id),
          date: formatOrderDate(orderCreatedAt(order)),
          total: formatOrderTotal(order.total_amount ?? order.total),
          status: formatOrderStatus(order.status),
          raw: order,
        }))
      })
      .then((orders) => {
        if (!isActive || !orders) return
        setCustomerOrders(orders)
        setCustomerOrdersError('')
      })
      .catch((error) => {
        if (isActive)
          setCustomerOrdersError(
            error.message || 'Ocurrió un error al cargar el historial.'
          )
      })
      .finally(() => {
        if (isActive) {
          setLoadedOrdersFor({
            customerId: String(customerApiId),
            page: customerOrdersPage,
            limit: customerOrdersPageSize,
            refreshKey: ordersRefreshKey,
          })
        }
      })

    return () => {
      isActive = false
    }
  }, [
    accessToken,
    customerApiId,
    customerOrdersPage,
    customerOrdersPageSize,
    ordersRefreshKey,
    setAccessToken,
  ])

  const openCreateOrderModal = async () => {
    if (!customerApiId) return
    setOrderDraft((draft) =>
      draft.id_customer === String(customerApiId)
        ? draft
        : createOrderDraft(customerApiId)
    )
    setIsCreateOrderModalOpen(true)
    if (orderCatalogsLoaded || isLoadingOrderCatalogs) return

    setIsLoadingOrderCatalogs(true)
    setOrderCatalogError('')
    try {
      const [couriers, products, categoriesResponse] = await Promise.all([
        fetchAllCouriers(accessToken, setAccessToken),
        fetchAllProducts(accessToken, setAccessToken),
        authenticatedFetch(
          `${apiBaseUrl}/categories`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } },
          accessToken,
          setAccessToken
        ),
      ])
      if (!categoriesResponse.ok)
        throw new Error('No se pudieron obtener las categorías.')
      const categoriesData = await categoriesResponse.json()
      setOrderCouriers(couriers)
      setOrderProducts(products)
      setVisibleOrderProducts(products)
      setOrderCategories(
        Array.isArray(categoriesData.categories)
          ? categoriesData.categories
          : []
      )
      setDetailLookupsLoaded(true)
      setOrderCatalogsLoaded(true)
    } catch (error) {
      setOrderCatalogError(
        error.message || 'No se pudieron cargar los datos para crear el pedido.'
      )
      console.error(error)
    } finally {
      setIsLoadingOrderCatalogs(false)
    }
  }

  const updateOrderDraft = (changes) => {
    setOrderDraft((draft) => ({
      ...draft,
      ...changes,
      action_token: globalThis.crypto.randomUUID(),
    }))
  }

  const searchOrderProductsByCategory = async (idCategory) => {
    setProductSearchError('')
    if (!idCategory) {
      setVisibleOrderProducts(orderProducts)
      return
    }

    setIsSearchingProducts(true)
    setVisibleOrderProducts([])
    try {
      const filteredProducts = await fetchAllProducts(
        accessToken,
        setAccessToken,
        idCategory
      )
      setVisibleOrderProducts(filteredProducts)
    } catch (error) {
      setProductSearchError(
        error.message || 'No se pudieron buscar productos de esa categoría.'
      )
    } finally {
      setIsSearchingProducts(false)
    }
  }

  const createCustomerOrder = async (draft) => {
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

    setIsCreateOrderModalOpen(false)
    setOrderDraft(createOrderDraft(customerApiId))
    setVisibleOrderProducts(orderProducts)
    setCustomerOrdersPage(1)
    setOrdersRefreshKey((key) => key + 1)
    await fetchCustomers()
  }

  const openCustomerOrderDetails = async (historyOrder) => {
    const rawOrder = historyOrder.raw
    setSelectedOrderDetails(
      mapCustomerOrderDetails(rawOrder, customer, orderCouriers, orderProducts)
    )
    setOrderDetailsError('')
    setIsLoadingOrderDetails(true)

    try {
      let couriers = orderCouriers
      let products = orderProducts
      if (!detailLookupsLoaded) {
        const lookups = await Promise.all([
          fetchAllCouriers(accessToken, setAccessToken),
          fetchAllProducts(accessToken, setAccessToken),
        ])
        couriers = lookups[0]
        products = lookups[1]
        setOrderCouriers(couriers)
        setOrderProducts(products)
        setVisibleOrderProducts(products)
        setDetailLookupsLoaded(true)
      }
      setSelectedOrderDetails(
        mapCustomerOrderDetails(rawOrder, customer, couriers, products)
      )
    } catch (error) {
      setOrderDetailsError(
        error.message || 'No se pudieron cargar los detalles del pedido.'
      )
    } finally {
      setIsLoadingOrderDetails(false)
    }
  }

  const confirmCustomerOrderStatus = async () => {
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
      throw new Error(message || 'No se pudo actualizar el pedido.')
    }

    setCustomerOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: nextStatus,
              raw: { ...order.raw, status },
            }
          : order
      )
    )
    setSelectedOrderDetails((currentOrder) =>
      currentOrder ? { ...currentOrder, status: nextStatus } : currentOrder
    )
    setStatusConfirmation(null)
  }

  return (
    <div className="layout">
      <Navbar />
      <ComponentTransition>
        <main className="container-main customer-detail-main">
          {isLoadingCustomers ? (
            <section className="customer-not-found">
              <h1>Cargando cliente...</h1>
            </section>
          ) : customersError ? (
            <section className="customer-not-found">
              <h1>{customersError}</h1>
              <Link to="/customers">Volver al listado</Link>
            </section>
          ) : !customer ? (
            <section className="customer-not-found">
              <h1>Cliente no encontrado</h1>
              <Link to="/customers">Volver al listado</Link>
            </section>
          ) : (
            <>
              <div className="customer-detail-toolbar">
                <Link className="customer-back-button" to="/customers">
                  <ArrowLeft size={17} /> Volver al listado
                </Link>
                <button
                  type="button"
                  className="customers-add-button"
                  onClick={openCreateOrderModal}
                  disabled={isLoadingOrderCatalogs}
                >
                  <Plus size={18} aria-hidden="true" /> Crear pedido
                </button>
              </div>

              <header className="customer-profile-header">
                <div className="customer-avatar">
                  <UserRound size={42} />
                </div>
                <div className="customer-profile-title">
                  <div className="customer-profile-name-row">
                    <h1>{customer.name}</h1>
                    <span className="customer-status">
                      # {customer.id || 'Cliente'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="customer-profile-edit"
                  onClick={() => {
                    setIdCustomer(customer.id)
                    setIsEditModalOpen(true)
                  }}
                >
                  <PencilLine size={17} /> Editar cliente
                </button>
              </header>

              <section className="customer-detail-card">
                <div className="customer-information">
                  <h2>Información del cliente</h2>
                  <dl>
                    <div>
                      <dt>
                        <MapPin size={17} /> Dirección:
                      </dt>
                      <dd>{customer.address || 'Sin dirección'}</dd>
                    </div>
                    <div>
                      <dt>
                        <Mail size={17} /> Email:
                      </dt>
                      <dd>{customer.email || 'Sin email'}</dd>
                    </div>
                    <div>
                      <dt>
                        <Phone size={17} /> Teléfono:
                      </dt>
                      <dd>{customer.phone || 'Sin teléfono'}</dd>
                    </div>
                    <div>
                      <dt>
                        <FileText size={17} /> Nota:
                      </dt>
                      <dd>
                        <span className="customer-note">
                          {customer.note || 'Sin observaciones'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="customer-order-history">
                  <div className="customer-history-heading">
                    <h2>Historial de pedidos</h2>
                    <label>
                      <span className="visually-hidden">Mostrar pedidos</span>
                      <select
                        value={customerOrdersLimit}
                        onChange={(event) => {
                          setCustomerOrdersLimit(event.target.value)
                          setCustomerOrdersPage(1)
                        }}
                      >
                        <option value="5">Mostrar: Últimos 5</option>
                        <option value="10">Mostrar: Últimos 10</option>
                        <option value="all">Mostrar: Todos</option>
                      </select>
                    </label>
                  </div>
                  <div className="customer-orders-scroll">
                    <table className="customer-orders-table">
                      <thead>
                        <tr>
                          <th>Pedido #</th>
                          <th>Fecha</th>
                          <th>Total</th>
                          <th>Estado</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingCustomerOrders ? (
                          <tr>
                            <td colSpan="5" className="customer-no-orders">
                              Cargando pedidos...
                            </td>
                          </tr>
                        ) : customerOrdersError ? (
                          <tr>
                            <td colSpan="5" className="customer-no-orders">
                              {customerOrdersError}
                            </td>
                          </tr>
                        ) : customerOrders.length ? (
                          customerOrders.map((order) => (
                            <tr key={order.id}>
                              <td>#{order.id}</td>
                              <td>{order.date}</td>
                              <td>{order.total}</td>
                              <td>
                                <span
                                  className={`order-status ${order.status === 'Completado' ? 'completed' : order.status === 'Cancelado' ? 'cancelled' : 'pending'}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="order-detail-button"
                                  onClick={() =>
                                    openCustomerOrderDetails(order)
                                  }
                                >
                                  Ver detalle
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="customer-no-orders">
                              Este cliente todavía no tiene pedidos.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {customerOrdersLimit === 'all' &&
                    customerOrdersTotalPages > 1 && (
                      <Pagination
                        currentPage={customerOrdersPage}
                        setCurrentPage={setCustomerOrdersPage}
                        totalPages={customerOrdersTotalPages}
                      />
                    )}
                </div>
              </section>
            </>
          )}
        </main>
      </ComponentTransition>
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={(isOpen) => {
          setIsEditModalOpen(isOpen)
          if (!isOpen) setIdCustomer('')
        }}
        onSubmit={updateCustomer}
        mode="edit"
        initialValues={customer}
      />
      <OrderCreateModal
        isOpen={isCreateOrderModalOpen}
        draft={orderDraft}
        customers={customer ? [customer] : []}
        couriers={orderCouriers}
        categories={orderCategories}
        products={orderProducts}
        visibleProducts={visibleOrderProducts}
        isLoadingCatalogs={isLoadingOrderCatalogs}
        isSearchingProducts={isSearchingProducts}
        catalogError={orderCatalogError}
        productSearchError={productSearchError}
        onCategoryChange={searchOrderProductsByCategory}
        onDraftChange={updateOrderDraft}
        onClose={() => setIsCreateOrderModalOpen(false)}
        onSubmit={createCustomerOrder}
      />
      {selectedOrderDetails && (
        <div
          className="customer-order-details-overlay"
          onMouseDown={() => {
            if (!isLoadingOrderDetails) setSelectedOrderDetails(null)
          }}
        >
          <OrderDetails
            order={selectedOrderDetails}
            isDialog
            isLoading={isLoadingOrderDetails}
            loadError={orderDetailsError}
            onClose={() => setSelectedOrderDetails(null)}
            onDialogMouseDown={(event) => event.stopPropagation()}
            onRequestStatusChange={(nextStatus) =>
              setStatusConfirmation({
                orderId: selectedOrderDetails.id,
                nextStatus,
              })
            }
          />
        </div>
      )}
      <OrderStatusModal
        order={selectedOrderDetails}
        nextStatus={statusConfirmation?.nextStatus}
        onClose={() => setStatusConfirmation(null)}
        onConfirm={confirmCustomerOrderStatus}
      />
    </div>
  )
}
