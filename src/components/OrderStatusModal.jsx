import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function OrderStatusModal({
  order,
  nextStatus,
  onClose,
  onConfirm,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  if (!order || !nextStatus) return null

  const completing = nextStatus === 'Completado'

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await onConfirm()
    } catch (error) {
      const messages = Array.isArray(error?.errors)
        ? error.errors
            .map((item) => item.message)
            .filter(Boolean)
            .join(' ')
        : ''
      setSubmitError(
        messages || error?.message || 'No se pudo actualizar el pedido.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="order-confirm-overlay"
      onMouseDown={() => !isSubmitting && onClose()}
    >
      <section
        className="order-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="order-confirm-close"
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X size={19} />
        </button>
        <AlertTriangle
          className="order-confirm-icon"
          size={54}
          aria-hidden="true"
        />
        <h2 id="order-confirm-title">
          {completing
            ? '¿Marcar este pedido como completado?'
            : '¿Cancelar este pedido?'}
        </h2>
        <p>
          {completing
            ? 'Confirmá que el pedido ya fue entregado.'
            : 'Esta acción cambiará el estado del pedido a cancelado.'}
        </p>
        {submitError && (
          <p className="order-confirm-error" role="alert">
            {submitError}
          </p>
        )}
        <footer>
          <button
            type="button"
            className="order-confirm-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Volver
          </button>
          <button
            type="button"
            className={
              completing ? 'order-confirm-primary' : 'order-confirm-danger'
            }
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Actualizando...' : 'Confirmar'}
          </button>
        </footer>
      </section>
    </div>
  )
}
