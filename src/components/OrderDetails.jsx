import {
  FileText,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Van,
  X,
} from 'lucide-react'

const formatMoney = (value) =>
  `$ ${new Intl.NumberFormat('es-UY', { minimumFractionDigits: 2 }).format(value)}`

export default function OrderDetails({
  order,
  onRequestStatusChange,
  onClose,
  isDialog = false,
  isLoading = false,
  loadError = '',
  onDialogMouseDown,
}) {
  return (
    <section
      className={`order-details-card${isDialog ? ' customer-order-details-content' : ''}`}
      role={isDialog ? 'dialog' : undefined}
      aria-modal={isDialog ? true : undefined}
      aria-label={`Detalles del pedido ${order.id}`}
      onMouseDown={onDialogMouseDown}
    >
      <header className="order-details-header">
        <div className="order-details-heading">
          <div className="order-cart-icon" aria-hidden="true">
            <ShoppingCart size={27} />
          </div>
          <div>
            <div className="order-title-line">
              <h2>Pedido #{order.id}</h2>
              <span
                className={`order-status-badge ${order.status.toLowerCase()}`}
              >
                {order.status}
              </span>
            </div>
            <p className="order-meta-line">
              Fecha de creación: {order.date} <span>·</span>{' '}
              {order.customer.name}
            </p>
          </div>
        </div>
        {(order.status === 'Pendiente' || onClose) && (
          <div className="order-details-header-actions">
            {order.status === 'Pendiente' && (
              <div className="order-status-actions">
                <button
                  type="button"
                  className="order-complete-button"
                  onClick={() => onRequestStatusChange('Completado')}
                >
                  ✓ Marcar como completado
                </button>
                <button
                  type="button"
                  className="order-cancel-button"
                  onClick={() => onRequestStatusChange('Cancelado')}
                >
                  × Cancelar pedido
                </button>
              </div>
            )}
            {onClose && (
              <button
                type="button"
                className="order-details-close"
                aria-label="Cerrar detalles del pedido"
                disabled={isLoading}
                onClick={onClose}
              >
                <X size={19} />
              </button>
            )}
          </div>
        )}
      </header>

      {isLoading && (
        <p className="customer-order-details-loading">
          Cargando información relacionada...
        </p>
      )}
      {loadError && (
        <p className="customer-order-details-error" role="alert">
          {loadError}
        </p>
      )}

      <div className="order-details-body">
        <section className="order-products-detail">
          <h3>Productos del pedido</h3>
          <ul>
            {order.products.map((product) => (
              <li key={product.id}>
                <span className="order-product-symbol" aria-hidden="true">
                  <Package size={21} />
                </span>
                <span className="order-product-name">
                  {product.name}
                  <small>x{product.quantity}</small>
                </span>
                <span className="order-product-price">
                  {formatMoney(product.price)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="order-totals">
            <div className="order-total">
              <dt>Total</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="order-additional-info">
          <h3>Información adicional</h3>
          <div>
            <MapPin size={19} aria-hidden="true" />
            <p>
              <strong>Dirección de entrega</strong>
              <span>{order.address || 'Sin dirección'}</span>
            </p>
          </div>
          <div>
            <Phone size={19} aria-hidden="true" />
            <p>
              <strong>Teléfono del cliente</strong>
              <span>{order.customer.phone}</span>
            </p>
          </div>
          <div>
            <Van size={19} aria-hidden="true" />
            <p>
              <strong>Repartidor encargado</strong>
              <span>{order.courier}</span>
            </p>
          </div>
          <div>
            <FileText size={19} aria-hidden="true" />
            <p>
              <strong>Observaciones</strong>
              <span>{order.observations || 'Sin observaciones'}</span>
            </p>
          </div>
        </section>
      </div>
    </section>
  )
}
