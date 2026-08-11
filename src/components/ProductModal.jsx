import { useState } from 'react'
import './productModal.css'
import { ChevronDown } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { authenticatedFetch } from '../services/authenticatedFetch'
import FormError from './FormError'

export default function ProductModal({
  isOpen,
  onClose,
  categories,
  onCreateProduct,
  onCreateStats,
}) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [idCategory, setIdCategory] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState(false)

  const { accessToken, setAccessToken } = useContext(AuthContext)

  const createProduct = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])
    setSuccess(false)

    const category = idCategory === '0' ? 20 : Number(idCategory)

    let body = {}

    if (name) body.name = name
    if (sku) body.sku = sku
    if (price) body.price = price
    if (stock) body.stock = stock
    if (idCategory) body.id_category = category

    try {
      const response = await authenticatedFetch(
        'https://order-management-system-995e.onrender.com/api/products',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
        accessToken,
        setAccessToken
      )

      const data = await response.json()

      if (response.status === 400) {
        setIsLoading(false)
        setErrors(data.errors)
        return
      }

      setIsLoading(false)
      setErrors([])

      setName('')
      setSku('')
      setPrice('')
      setStock('')
      setIdCategory('0')
      setSuccess(true)

      await onCreateProduct()
      await onCreateStats()

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      console.error(err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="product-modal">
        <header className="modal-header">
          <div>
            <h2>Nuevo producto</h2>
            <p>Agregá un producto al catálogo.</p>
          </div>

          <button type="button" onClick={onClose}>
            ✕
          </button>
        </header>

        {success && (
          <p role="alert" className="success-product">
            Producto creado correctamente
          </p>
        )}
        <form className="product-form">
          <div className="product-div-form">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>

              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Coca-Cola"
              />
              <FormError errors={errors} field={'name'} />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU</label>

              <input
                id="sku"
                name="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                type="text"
                placeholder="Ej. SKU-12345"
              />
              <FormError errors={errors} field={'sku'} />
            </div>

            <div className="form-group">
              <label htmlFor="price">Precio</label>

              <input
                id="price"
                name="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
              <FormError errors={errors} field={'price'} />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock</label>

              <input
                id="stock"
                name="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
              <FormError errors={errors} field={'stock'} />
            </div>

            <div className="form-group categories-group">
              <label htmlFor="category">Categoría</label>

              <select
                id="category"
                name="category"
                value={idCategory}
                onChange={(e) => setIdCategory(e.target.value)}
              >
                <option value="0">Seleccioná una categoría</option>
                {categories.map((category) => (
                  <option
                    key={category.id_category}
                    value={category.id_category}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-icon-add" size={18} />
              <FormError errors={errors} field={'stock'} />
            </div>
          </div>

          <footer className="modal-footer">
            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
              onClick={createProduct}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creando producto...
                </>
              ) : (
                <>Crear producto</>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
