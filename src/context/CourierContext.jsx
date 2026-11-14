import { useState } from 'react'
import { createContext } from 'react'

const CourierContext = createContext()

function CourierProvider({ children }) {
  const [idCourier, setIdCourier] = useState('')
  const [couriers, setCouriers] = useState([])
  return (
    <CourierContext.Provider
      value={{ idCourier, setIdCourier, couriers, setCouriers }}
    >
      {children}
    </CourierContext.Provider>
  )
}

export { CourierContext, CourierProvider }
