import { useState } from 'react'
import './productModal.css'
import { ChevronDown } from 'lucide-react'
import FormError from './FormError'

export default function ProductModal({
  isOpen,
  onClose,
  categories,
  titleText,
  subTitle,
  onSubmit,
  loadingTextButton,
  textButton,
}) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [idCategory, setIdCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const handlerSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])

    const category = idCategory === '' ? 20 : Number(idCategory)

    let body = {}

    if (name) body.name = name
    if (sku) body.sku = sku
    if (price) body.price = price
    if (stock) body.stock = stock

    body.id_category = category

    try {
      await onSubmit(body)
      setIsLoading(false)
      setErrors([])

      setName('')
      setSku('')
      setPrice('')
      setStock('')
      setIdCategory('')

      onClose(false)
    } catch (err) {
      setIsLoading(false)
      setErrors(err.errors)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="product-modal">
        <header className="modal-header">
          <div>
            <h2>{titleText}</h2>
            <p>{subTitle}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose(false)
              setIsLoading(false)
              setErrors([])

              setName('')
              setSku('')
              setPrice('')
              setStock('')
              setIdCategory('')
            }}
          >
            ✕
          </button>
        </header>

        <form className="product-form" onSubmit={handlerSubmit}>
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
                <option value="">Seleccioná una categoría</option>
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
              <FormError errors={errors} field={'id_category'} />
            </div>
          </div>

          <footer className="modal-footer">
            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  {loadingTextButton}
                </>
              ) : (
                <>{textButton}</>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
