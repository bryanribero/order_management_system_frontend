import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { AuthContext } from './AuthContext'
import { authenticatedFetch } from '../services/authenticatedFetch'

const CustomerContext = createContext()

function CustomerProvider({ children }) {
  const { accessToken, setAccessToken } = useContext(AuthContext)
  const [customers, setCustomers] = useState([])
  const [idCustomer, setIdCustomer] = useState('')
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)
  const [customersError, setCustomersError] = useState('')

  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true)
    setCustomersError('')

    try {
      const response = await authenticatedFetch(
        'https://order-management-system-995e.onrender.com/api/customers',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        accessToken,
        setAccessToken
      )

      if (!response.ok) {
        throw new Error('No se pudieron obtener los clientes.')
      }

      const data = await response.json()
      const fetchedCustomers = Array.isArray(data.customers)
        ? data.customers
        : []

      setCustomers(
        fetchedCustomers.map((customer) => ({
          ...customer,
          id: customer.id_customer,
          orders: Array.isArray(customer.orders) ? customer.orders : [],
        }))
      )
    } catch (error) {
      setCustomersError(error.message || 'Ocurrió un error al cargar clientes.')
      console.error(error)
    } finally {
      setIsLoadingCustomers(false)
    }
  }, [accessToken, setAccessToken])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return (
    <CustomerContext.Provider
      value={{
        customers,
        setCustomers,
        idCustomer,
        setIdCustomer,
        isLoadingCustomers,
        customersError,
        fetchCustomers,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

export { CustomerContext, CustomerProvider }
