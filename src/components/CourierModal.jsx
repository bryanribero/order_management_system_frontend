import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import FormError from './FormError'
import './courierModal.css'

const emptyForm = { name: '', phone: '', observations: '' }

export default function CourierModal({
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
    if (!isOpen) {
      setForm(emptyForm)
      setErrors([])
      setFormError('')
      setIsLoading(false)
    } else {
      setForm({
        name: initialValues?.name ?? '',
        phone: initialValues?.phone ?? '',
        observations: initialValues?.observations ?? '',
      })
      setErrors([])
      setFormError('')
    }
  }, [initialValues, isOpen])

  if (!isOpen) return null

  const closeModal = () => {
    if (!isLoading) onClose(false)
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
          : error?.message || 'No se pudo crear el repartidor.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  return (
    <div className="courier-modal-overlay" onMouseDown={closeModal}>
      <section
        className="courier-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="courier-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="courier-modal-header">
          <div>
            <h2 id="courier-modal-title">
              {mode === 'edit' ? 'Actualizar repartidor' : 'Nuevo repartidor'}
            </h2>
            <p>
              {mode === 'edit'
                ? 'Modificá los datos del repartidor.'
                : 'Completá los datos del repartidor.'}
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
          <div className="courier-form-fields">
            <div className="courier-form-group">
              <label htmlFor="courier-name">Nombre</label>
              <input
                id="courier-name"
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Ej. Juan Pérez"
                autoFocus
                required
              />
              <FormError errors={errors} field="name" />
            </div>

            <div className="courier-form-group">
              <label htmlFor="courier-phone">Teléfono</label>
              <input
                id="courier-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="Ej. 1122334455"
              />
              <FormError errors={errors} field="phone" />
            </div>

            <div className="courier-form-group">
              <label htmlFor="courier-observations">Observaciones</label>
              <textarea
                id="courier-observations"
                name="observations"
                value={form.observations}
                onChange={updateField}
                placeholder="Disponibilidad, horarios u otra información útil"
                rows="4"
              />
              <FormError errors={errors} field="observations" />
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
                  : 'Crear repartidor'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
