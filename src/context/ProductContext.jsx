import { useState } from 'react'
import { createContext } from 'react'

const ProductContext = createContext()

function ProductProvider({ children }) {
  const [idProduct, setIdProduct] = useState('')
  return (
    <ProductContext.Provider value={{ idProduct, setIdProduct }}>
      {children}
    </ProductContext.Provider>
  )
}

export { ProductProvider, ProductContext }
