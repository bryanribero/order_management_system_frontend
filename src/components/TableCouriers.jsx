import { LoaderCircle, PencilLine, Trash2 } from 'lucide-react'
import { useState } from 'react'
import './tableCouriers.css'

const observationPreviewLength = 50

export default function TableCouriers({ couriers, onEdit, onDelete }) {
  const [expandedObservations, setExpandedObservations] = useState({})
  const [deletingCourierId, setDeletingCourierId] = useState(null)

  const handleDelete = async (courier) => {
    setDeletingCourierId(courier.id)
    try {
      await onDelete?.(courier)
    } catch (error) {
      console.error(error)
    } finally {
      setDeletingCourierId(null)
    }
  }

  return (
    <div className="container-courier-table">
      <table className="couriers-table">
        <thead>
          <tr>
            <th scope="col">Repartidor</th>
            <th scope="col">Teléfono</th>
            <th scope="col">Observaciones</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {couriers.length ? (
            couriers.map((courier) => (
              <tr key={courier.id}>
                <td className="courier-name" data-label="Repartidor">
                  {courier.name}
                </td>
                <td
                  className={!courier.phone ? 'courier-empty' : ''}
                  data-label="Teléfono"
                >
                  {courier.phone || 'Sin teléfono'}
                </td>
                <td
                  className={`courier-observations-cell${expandedObservations[courier.id] ? ' is-expanded' : ''}`}
                  data-label="Observaciones"
                >
                  {courier.note ? (
                    courier.note.length > observationPreviewLength ? (
                      <button
                        type="button"
                        className={`courier-observation-toggle${expandedObservations[courier.id] ? ' expanded' : ''}`}
                        aria-expanded={Boolean(
                          expandedObservations[courier.id]
                        )}
                        onClick={() =>
                          setExpandedObservations((expanded) => ({
                            ...expanded,
                            [courier.id]: !expanded[courier.id],
                          }))
                        }
                      >
                        <span className="courier-observation-text">
                          {expandedObservations[courier.id]
                            ? courier.note
                            : `${courier.note.slice(0, observationPreviewLength).trimEnd()}…`}
                        </span>
                        <span className="courier-observation-action">
                          {expandedObservations[courier.id]
                            ? 'Ver menos'
                            : 'Ver más'}
                        </span>
                      </button>
                    ) : (
                      courier.note
                    )
                  ) : (
                    <span className="courier-empty">Sin observaciones</span>
                  )}
                </td>
                <td data-label="Acciones">
                  <div className="courier-actions">
                    <button
                      type="button"
                      className="courier-edit-button"
                      aria-label={`Editar ${courier.name}`}
                      onClick={() => onEdit?.(courier)}
                    >
                      <PencilLine size={18} />
                    </button>
                    <button
                      type="button"
                      className="courier-delete-button"
                      aria-label={`Eliminar ${courier.name}`}
                      disabled={deletingCourierId === courier.id}
                      onClick={() => handleDelete(courier)}
                    >
                      {deletingCourierId === courier.id ? (
                        <LoaderCircle
                          size={18}
                          className="courier-delete-spinner"
                        />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="couriers-empty-state" colSpan="4">
                No se encontraron repartidores.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
