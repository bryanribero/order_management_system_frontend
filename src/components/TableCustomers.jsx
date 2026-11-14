import { Link } from 'react-router-dom'
import { LoaderCircle, PencilLine, Trash2 } from 'lucide-react'
import { useState } from 'react'
import './tableCustomers.css'

export default function TableCustomers({
  customers: customerList,
  onEdit,
  onDelete,
}) {
  const [deletingCustomerId, setDeletingCustomerId] = useState(null)

  const handleDelete = async (customer) => {
    setDeletingCustomerId(customer.id)
    try {
      await onDelete?.(customer)
    } catch (error) {
      console.error(error)
    } finally {
      setDeletingCustomerId(null)
    }
  }

  return (
    <div className="container-customer-table">
      <table className="customers-table">
        <thead>
          <tr>
            <th scope="col">Cliente</th>
            <th scope="col">Dirección</th>
            <th scope="col">Email</th>
            <th scope="col">Teléfono</th>
            <th scope="col">Nota</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {customerList.length ? (
            customerList.map((customer) => (
              <tr key={customer.id}>
                <td className="customer-name-cell" data-label="Cliente">
                  <Link to={`/customers/${customer.id}`}>{customer.name}</Link>
                </td>
                <td data-label="Dirección">
                  {customer.address || (
                    <span className="customer-muted">Sin dirección</span>
                  )}
                </td>
                <td data-label="Email">
                  {customer.email || (
                    <span className="customer-muted">Sin email</span>
                  )}
                </td>
                <td data-label="Teléfono">
                  {customer.phone || (
                    <span className="customer-muted">Sin teléfono</span>
                  )}
                </td>
                <td data-label="Nota">
                  <span className="customer-note">
                    {customer.note || 'Sin observaciones'}
                  </span>
                </td>
                <td data-label="Acciones">
                  <div className="customer-row-actions">
                    <button
                      type="button"
                      className="customer-edit-button"
                      aria-label={`Editar ${customer.name}`}
                      onClick={() => onEdit?.(customer)}
                    >
                      <PencilLine size={18} />
                    </button>
                    <button
                      type="button"
                      className="customer-delete-button"
                      aria-label={`Eliminar ${customer.name}`}
                      disabled={deletingCustomerId === customer.id}
                      onClick={() => handleDelete(customer)}
                    >
                      {deletingCustomerId === customer.id ? (
                        <LoaderCircle
                          size={18}
                          className="customer-delete-spinner"
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
              <td className="customers-empty-state" colSpan="6">
                No se encontraron clientes.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
