import { formatPrice } from '../utils/formatPrice'
import { PencilLine, LoaderCircle } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import './tableProducts.css'
import { useState } from 'react'
import { authenticatedFetch } from '../services/authenticatedFetch'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ProductContext } from '../context/ProductContext'

export default function TableProducts({
  products,
  onProductDeleted,
  onStatsDeleted,
  onOpenEdit,
}) {
  const { accessToken, setAccessToken } = useContext(AuthContext)
  const [deletingProductId, setDeletingProductId] = useState(null)

  const { setIdProduct } = useContext(ProductContext)

  const handlerDeleteProduct = async (idProduct) => {
    setDeletingProductId(idProduct)
    try {
      const response = await authenticatedFetch(
        `https://order-management-system-995e.onrender.com/api/products/${idProduct}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        accessToken,
        setAccessToken
      )

      if (!response.ok) {
        return
      }

      await onProductDeleted()
      await onStatsDeleted()
    } finally {
      setDeletingProductId(null)
    }
  }
  return (
    <div className="container-product-table">
      <table className="products-table">
        <thead className="table-head">
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id_product} className="product-item">
              <td className="item-name">{product.name}</td>
              <td>{product.sku ? product.sku : 'Sin SKU'}</td>
              <td>{product.category?.name}</td>
              <td>${formatPrice(product.price)}</td>
              <td>{product.stock}</td>
              <td className="td-button">
                <button
                  className="button-edit"
                  onClick={() => {
                    onOpenEdit()
                    setIdProduct(product.id_product)
                    console.log(product.id_product)
                  }}
                >
                  <PencilLine size={18} />
                </button>
                <button
                  className="button-delite"
                  disabled={deletingProductId === product.id_product}
                  onClick={() => {
                    handlerDeleteProduct(product.id_product)
                  }}
                >
                  {deletingProductId === product.id_product ? (
                    <LoaderCircle size={18} className="spinner" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
