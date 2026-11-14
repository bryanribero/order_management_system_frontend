import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import FormError from './FormError'
import './courierModal.css'
import './customerModal.css'

const emptyForm = { name: '', address: '', email: '', phone: '', note: '' }

export default function CustomerModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialValues,
}) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState([])
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialValues?.name ?? '',
        address: initialValues?.address ?? '',
        email: initialValues?.email ?? '',
        phone: initialValues?.phone ?? '',
        note: initialValues?.note ?? '',
      })
      setErrors([])
      setFormError('')
    } else {
      setForm(emptyForm)
      setErrors([])
      setFormError('')
      setIsLoading(false)
    }
  }, [initialValues, isOpen])

  if (!isOpen) return null

  const closeModal = () => {
    if (!isLoading) onClose(false)
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setErrors([])
    setFormError('')

    const body = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    )

    try {
      await onSubmit(body)
      onClose(false)
    } catch (error) {
      setErrors(Array.isArray(error?.errors) ? error.errors : [])
      setFormError(
        Array.isArray(error?.errors)
          ? ''
          : error?.message || 'No se pudo guardar el cliente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="courier-modal-overlay" onMouseDown={closeModal}>
      <section
        className="courier-modal customer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="courier-modal-header">
          <div>
            <h2 id="customer-modal-title">
              {mode === 'edit' ? 'Actualizar cliente' : 'Nuevo cliente'}
            </h2>
            <p>
              {mode === 'edit'
                ? 'Modificá los datos del cliente.'
                : 'Completá los datos del cliente.'}
            </p>
          </div>
          <button
            type="button"
            className="courier-modal-close"
            aria-label="Cerrar"
            disabled={isLoading}
            onClick={closeModal}
          >
            <X size={20} />
          </button>
        </header>

        <form className="courier-form" onSubmit={handleSubmit}>
          <div className="courier-form-fields customer-form-fields">
            <div className="courier-form-group">
              <label htmlFor="customer-name">Nombre</label>
              <input
                id="customer-name"
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Ej. Juan Pérez"
                required
              />
              <FormError errors={errors} field="name" />
            </div>
            <div className="courier-form-group">
              <label htmlFor="customer-address">Dirección</label>
              <input
                id="customer-address"
                name="address"
                value={form.address}
                onChange={updateField}
                placeholder="Calle y número"
              />
              <FormError errors={errors} field="address" />
            </div>
            <div className="courier-form-group">
              <label htmlFor="customer-email">Email</label>
              <input
                id="customer-email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="cliente@ejemplo.com"
              />
              <FormError errors={errors} field="email" />
            </div>
            <div className="courier-form-group">
              <label htmlFor="customer-phone">Teléfono</label>
              <input
                id="customer-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="Ej. 1122334455"
              />
              <FormError errors={errors} field="phone" />
            </div>
            <div className="courier-form-group customer-note-field">
              <label htmlFor="customer-note">Nota</label>
              <textarea
                id="customer-note"
                name="note"
                value={form.note}
                onChange={updateField}
                placeholder="Información útil sobre el cliente"
                rows="3"
              />
              <FormError errors={errors} field="note" />
            </div>
            {formError && <p className="courier-form-error">{formError}</p>}
          </div>
          <footer className="courier-modal-footer">
            <button
              type="button"
              className="courier-cancel-button"
              disabled={isLoading}
              onClick={closeModal}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="courier-submit-button"
              disabled={isLoading}
            >
              {isLoading
                ? 'Guardando...'
                : mode === 'edit'
                  ? 'Guardar cambios'
                  : 'Crear cliente'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
