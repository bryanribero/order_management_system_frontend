import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import Navbar from '../components/Navbar'
import ComponentTransition from '../effects/ComponentTransition'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import TableCouriers from '../components/TableCouriers'
import CourierModal from '../components/CourierModal'
import './couriers.css'
import { CourierContext } from '../context/CourierContext'
import { authenticatedFetch } from '../services/authenticatedFetch'
import { AuthContext } from '../context/AuthContext'

const toCourierPayload = ({ observations, ...fields }) => ({
  ...Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== '')
  ),
  ...(observations !== '' ? { note: observations } : {}),
})

export default function Couriers() {
  const { couriers, setCouriers, idCourier, setIdCourier } =
    useContext(CourierContext)
  const { accessToken, setAccessToken } = useContext(AuthContext)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedCourier, setSelectedCourier] = useState(null)

  const filteredCouriers = useMemo(
    () =>
      couriers.filter((courier) =>
        `${courier.name} ${courier.phone} ${courier.observations}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase())
      ),
    [couriers, search]
  )

  const fetchCouriers = useCallback(
    async (page = currentPage) => {
      const params = new URLSearchParams({
        page,
        limit: 10,
      })

      try {
        const response = await authenticatedFetch(
          `https://order-management-system-995e.onrender.com/api/couriers?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
          accessToken,
          setAccessToken
        )

        if (!response.ok) {
          throw new Error('No se pudieron obtener los repartidores')
        }

        const data = await response.json()
        const fetchedCouriers = Array.isArray(data.couriers)
          ? data.couriers
          : []

        setCouriers(
          fetchedCouriers.map((courier) => ({
            ...courier,
            id: courier.id ?? courier.id_courier,
            observations: courier.note ?? '',
          }))
        )
        setTotalPages(data.pagination?.totalPages ?? 1)
      } catch (error) {
        console.error(error)
      }
    },
    [accessToken, currentPage, setAccessToken, setCouriers]
  )

  const createCourier = async (body) => {
    const courierData = toCourierPayload(body)

    const response = await authenticatedFetch(
      'https://order-management-system-995e.onrender.com/api/couriers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courierData),
      },
      accessToken,
      setAccessToken
    )

    if (response.status === 400) {
      throw await response.json()
    }

    if (!response.ok) {
      throw new Error('No se pudo crear el repartidor.')
    }

    setSearch('')
    setCurrentPage(1)
    await fetchCouriers(1, '')
  }

  const updateCourier = async (body) => {
    const courierData = toCourierPayload(body)

    const response = await authenticatedFetch(
      `https://order-management-system-995e.onrender.com/api/couriers/${idCourier}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courierData),
      },
      accessToken,
      setAccessToken
    )

    if (response.status === 400) {
      throw await response.json()
    }

    if (!response.ok) {
      throw new Error('No se pudo actualizar el repartidor.')
    }

    setIdCourier('')
    await fetchCouriers()
  }

  const deleteCourier = async (courier) => {
    const response = await authenticatedFetch(
      `https://order-management-system-995e.onrender.com/api/couriers/${courier.id}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
      accessToken,
      setAccessToken
    )

    if (!response.ok) {
      throw new Error('No se pudo eliminar el repartidor.')
    }

    if (couriers.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1)
      return
    }

    await fetchCouriers()
  }

  const openUpdateModal = (courier) => {
    setIdCourier(courier.id)
    setSelectedCourier(courier)
    setIsUpdateModalOpen(true)
  }

  useEffect(() => {
    fetchCouriers()
  }, [fetchCouriers])

  return (
    <div className="layout">
      <Navbar />
      <ComponentTransition>
        <main className="container-main couriers-main">
          <header className="couriers-header">
            <div>
              <h1>Repartidores</h1>
              <p>Gestioná los repartidores de tu negocio.</p>
            </div>
            <button
              type="button"
              className="courier-add-button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={18} aria-hidden="true" />
              Nuevo repartidor
            </button>
          </header>

          <section
            className="couriers-panel"
            aria-label="Lista de repartidores"
          >
            <div className="couriers-search-wrap">
              <SearchInput
                placeholderInput="Buscar repartidor..."
                inputProduct={search}
                setInputProduct={(value) => {
                  setSearch(value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <TableCouriers
              couriers={filteredCouriers}
              onEdit={openUpdateModal}
              onDelete={deleteCourier}
            />
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </section>
        </main>
      </ComponentTransition>
      <CourierModal
        isOpen={isCreateModalOpen}
        onClose={setIsCreateModalOpen}
        onSubmit={createCourier}
      />
      <CourierModal
        isOpen={isUpdateModalOpen}
        onClose={(isOpen) => {
          setIsUpdateModalOpen(isOpen)
          if (!isOpen) setIdCourier('')
        }}
        onSubmit={updateCourier}
        mode="edit"
        initialValues={selectedCourier}
      />
    </div>
  )
}
