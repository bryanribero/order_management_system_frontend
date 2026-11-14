import { Link, useParams } from 'react-router-dom'
import { useContext, useState } from 'react'
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
import { CustomerContext } from '../context/CustomerContext'
import { AuthContext } from '../context/AuthContext'
import { authenticatedFetch } from '../services/authenticatedFetch'
import './customerDetail.css'

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
  const customer = customers.find((item) => String(item.id) === customerId)

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
                <button type="button" className="customers-add-button">
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
                      <select defaultValue="5">
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
                        {customer.orders?.length ? (
                          customer.orders.map((order) => (
                            <tr key={order.id}>
                              <td>#{order.id}</td>
                              <td>{order.date}</td>
                              <td>{order.total}</td>
                              <td>
                                <span
                                  className={`order-status ${order.status === 'Completado' ? 'completed' : 'pending'}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="order-detail-button"
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
    </div>
  )
}
