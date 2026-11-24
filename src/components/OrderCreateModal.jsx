import { useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import './orderCreateModal.css'

const formatMoney = (value) =>
  `$ ${new Intl.NumberFormat('es-UY', { minimumFractionDigits: 2 }).format(value)}`

export default function OrderCreateModal({
  isOpen,
  draft,
  customers,
  couriers,
  categories,
  products,
  visibleProducts,
  isLoadingCatalogs,
  isSearchingProducts,
  catalogError,
  productSearchError,
  onCategoryChange,
  onDraftChange,
  onClose,
  onSubmit,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  const estimatedTotal = useMemo(
    () =>
      draft.items.reduce((total, item) => {
        const product = products.find(
          (candidate) =>
            String(candidate.id_product) === String(item.id_product)
        )
        return (
          total + (Number(product?.price) || 0) * (Number(item.quantity) || 0)
        )
      }, 0),
    [draft.items, products]
  )

  if (!isOpen) return null

  const updateDraft = (changes) => {
    onDraftChange(changes)
    setSubmitError('')
  }

  const updateItem = (index, changes) => {
    const items = draft.items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...changes } : item
    )
    updateDraft({ items })
  }

  const addItem = () => {
    updateDraft({
      items: [...draft.items, { id_product: '', quantity: 1 }],
    })
  }

  const removeItem = (index) => {
    updateDraft({
      items: draft.items.filter((_, itemIndex) => itemIndex !== index),
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await onSubmit(draft)
    } catch (error) {
      const messages = Array.isArray(error?.errors)
        ? error.errors
            .map((item) => item.message)
            .filter(Boolean)
            .join(' ')
        : ''
      setSubmitError(
        messages || error?.message || 'No se pudo crear el pedido.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="order-create-overlay" onMouseDown={onClose}>
      <section
        className="order-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-create-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="order-create-header">
          <div>
            <h2 id="order-create-title">Crear nuevo pedido</h2>
            <p>Elegí el cliente, el repartidor y los productos del pedido.</p>
          </div>
          <button
            type="button"
            className="order-create-close"
            aria-label="Cerrar y conservar el borrador"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <form className="order-create-form" onSubmit={handleSubmit}>
          <div className="order-create-fields">
            <label>
              Cliente
              <select
                required
                value={draft.id_customer}
                disabled={isSubmitting || isLoadingCatalogs}
                onChange={(event) =>
                  updateDraft({ id_customer: event.target.value })
                }
              >
                <option value="">Seleccioná un cliente</option>
                {customers.map((customer) => (
                  <option
                    key={customer.id_customer}
                    value={customer.id_customer}
                  >
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Repartidor
              <select
                required
                value={draft.id_courier}
                disabled={isSubmitting || isLoadingCatalogs}
                onChange={(event) =>
                  updateDraft({ id_courier: event.target.value })
                }
              >
                <option value="">Seleccioná un repartidor</option>
                {couriers.map((courier) => (
                  <option
                    key={courier.id_courier ?? courier.id}
                    value={courier.id_courier ?? courier.id}
                  >
                    {courier.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Buscar productos por categoría (opcional)
              <select
                value={selectedCategoryId}
                disabled={
                  isSubmitting || isLoadingCatalogs || isSearchingProducts
                }
                onChange={(event) => {
                  const categoryId = event.target.value
                  setSelectedCategoryId(categoryId)
                  onCategoryChange(categoryId)
                }}
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option
                    key={category.id_category}
                    value={category.id_category}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="order-items-fieldset">
              <legend>Productos</legend>
              {draft.items.map((item, index) => {
                const selectedProduct = products.find(
                  (product) =>
                    String(product.id_product) === String(item.id_product)
                )
                const rowProducts = selectedProduct
                  ? [
                      selectedProduct,
                      ...visibleProducts.filter(
                        (product) =>
                          String(product.id_product) !==
                          String(selectedProduct.id_product)
                      ),
                    ]
                  : visibleProducts
                return (
                  <div className="order-item-input-row" key={`item-${index}`}>
                    <select
                      required
                      aria-label={`Producto ${index + 1}`}
                      value={item.id_product}
                      disabled={
                        isSubmitting || isLoadingCatalogs || isSearchingProducts
                      }
                      onChange={(event) =>
                        updateItem(index, { id_product: event.target.value })
                      }
                    >
                      <option value="">Seleccioná un producto</option>
                      {rowProducts.map((product) => (
                        <option
                          key={product.id_product}
                          value={product.id_product}
                          disabled={Number(product.stock) <= 0}
                        >
                          {product.name} ·{' '}
                          {formatMoney(Number(product.price) || 0)}
                          {Number(product.stock) <= 0 ? ' · Sin stock' : ''}
                        </option>
                      ))}
                      {rowProducts.length === 0 && !isLoadingCatalogs && (
                        <option value="" disabled>
                          No hay productos en esta categoría
                        </option>
                      )}
                    </select>
                    <input
                      required
                      type="number"
                      min="1"
                      max={selectedProduct?.stock}
                      aria-label={`Cantidad del producto ${index + 1}`}
                      value={item.quantity}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updateItem(index, { quantity: event.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="order-item-remove"
                      aria-label={`Quitar producto ${index + 1}`}
                      disabled={isSubmitting || draft.items.length === 1}
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )
              })}
              <button
                type="button"
                className="order-add-item"
                disabled={
                  isSubmitting ||
                  isLoadingCatalogs ||
                  isSearchingProducts ||
                  products.length === 0
                }
                onClick={addItem}
              >
                <Plus size={16} /> Agregar producto
              </button>
            </fieldset>

            <label className="order-create-note">
              Nota / observaciones
              <textarea
                rows="3"
                value={draft.note}
                disabled={isSubmitting}
                placeholder="Indicaciones para preparar o entregar el pedido"
                onChange={(event) => updateDraft({ note: event.target.value })}
              />
            </label>

            <div className="order-create-total">
              <span>Total estimado</span>
              <strong>{formatMoney(estimatedTotal)}</strong>
            </div>

            {isLoadingCatalogs && (
              <p className="order-create-message">
                Cargando clientes, repartidores y productos...
              </p>
            )}
            {catalogError && (
              <p className="order-create-error">{catalogError}</p>
            )}
            {isSearchingProducts && (
              <p className="order-create-message">
                Buscando productos de la categoría...
              </p>
            )}
            {productSearchError && (
              <p className="order-create-error">{productSearchError}</p>
            )}
            {submitError && <p className="order-create-error">{submitError}</p>}
          </div>

          <footer className="order-create-footer">
            <button
              type="button"
              className="order-create-cancel"
              onClick={onClose}
            >
              Cerrar y conservar
            </button>
            <button
              type="submit"
              className="order-create-submit"
              disabled={
                isSubmitting || isLoadingCatalogs || Boolean(catalogError)
              }
            >
              {isSubmitting ? 'Creando pedido...' : 'Crear pedido'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
