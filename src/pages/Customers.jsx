import { useContext, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import Navbar from '../components/Navbar'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import TableCustomers from '../components/TableCustomers'
import CustomerModal from '../components/CustomerModal'
import ComponentTransition from '../effects/ComponentTransition'
import { CustomerContext } from '../context/CustomerContext'
import { AuthContext } from '../context/AuthContext'
import { authenticatedFetch } from '../services/authenticatedFetch'
import './customers.css'

const customersEndpoint =
  'https://order-management-system-995e.onrender.com/api/customers'
const pageSize = 10

export default function Customers() {
  const {
    customers,
    fetchCustomers,
    isLoadingCustomers,
    customersError,
    idCustomer,
    setIdCustomer,
  } = useContext(CustomerContext)
  const { accessToken, setAccessToken } = useContext(AuthContext)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        `${customer.name} ${customer.address} ${customer.email} ${customer.phone} ${customer.note}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase())
      ),
    [customers, search]
  )

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const visibleCustomers = useMemo(
    () =>
      filteredCustomers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [currentPage, filteredCustomers]
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const createCustomer = async (body) => {
    const response = await authenticatedFetch(
      customersEndpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      accessToken,
      setAccessToken
    )

    if (response.status === 400) throw await response.json()
    if (!response.ok) throw new Error('No se pudo crear el cliente.')

    setSearch('')
    setCurrentPage(1)
    await fetchCustomers()
  }

  const updateCustomer = async (body) => {
    const response = await authenticatedFetch(
      `${customersEndpoint}/${idCustomer}`,
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

  const openUpdateModal = (customer) => {
    setIdCustomer(customer.id)
    setSelectedCustomer(customer)
    setIsUpdateModalOpen(true)
  }

  const deleteCustomer = async (customer) => {
    const response = await authenticatedFetch(
      `${customersEndpoint}/${customer.id}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
      accessToken,
      setAccessToken
    )

    if (!response.ok) throw new Error('No se pudo eliminar el cliente.')
    await fetchCustomers()
  }

  return (
    <div className="layout">
      <Navbar />
      <ComponentTransition>
        <main className="container-main customers-main">
          <header className="customers-header">
            <div>
              <h1>Clientes</h1>
              <p>Gestioná los clientes de tu negocio.</p>
            </div>
            <button
              type="button"
              className="customers-add-button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={18} aria-hidden="true" /> Nuevo cliente
            </button>
          </header>
          <section className="customers-panel" aria-label="Lista de clientes">
            <div className="customers-search-wrap">
              <SearchInput
                placeholderInput="Buscar cliente..."
                inputProduct={search}
                setInputProduct={(value) => {
                  setSearch(value)
                  setCurrentPage(1)
                }}
              />
            </div>
            {isLoadingCustomers ? (
              <p className="customers-message">Cargando clientes...</p>
            ) : customersError ? (
              <p className="customers-message customers-load-error">
                {customersError}
              </p>
            ) : (
              <TableCustomers
                customers={visibleCustomers}
                onEdit={openUpdateModal}
                onDelete={deleteCustomer}
              />
            )}
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </section>
        </main>
      </ComponentTransition>
      <CustomerModal
        isOpen={isCreateModalOpen}
        onClose={setIsCreateModalOpen}
        onSubmit={createCustomer}
      />
      <CustomerModal
        isOpen={isUpdateModalOpen}
        onClose={(isOpen) => {
          setIsUpdateModalOpen(isOpen)
          if (!isOpen) setIdCustomer('')
        }}
        onSubmit={updateCustomer}
        mode="edit"
        initialValues={selectedCustomer}
      />
    </div>
  )
}
